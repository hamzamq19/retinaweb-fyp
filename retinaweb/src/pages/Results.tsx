import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import type { ModelResult } from "../store/useStore";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import jsPDF from "jspdf";
import { useColorMode } from "../App";
import logo from "../assets/favicon.png";

const Results: React.FC = () => {
  const { mode } = useColorMode();
  const navigate = useNavigate();
  const {
    imagePreviewUrl,
    modelResults: rawResults,
    user,
    uploadedFile,
  } = useStore();
  const reportRef = useRef<HTMLDivElement>(null);

  // --- DATA SANITIZATION ---
  const modelResults: ModelResult[] = (rawResults || []).map((r: any) => ({
    name: r.name || "Unknown Model",
    confidence: r.confidence ?? r.accuracy ?? 0,
    f1: r.f1 ?? 0,
    accuracy: r.accuracy ?? 0,
    predictedDisease: r.predictedDisease || "Unknown",
    color: r.color || "#8884d8",
    heatmap: r.heatmap,
    is_reliable: r.is_reliable,
    threshold: r.threshold,
    breakdown: r.breakdown || [],
  }));

  // --- ENSEMBLE CARD EXTRACTION ---
  const ensembleCard = modelResults.find((m) => m.name === "Ensemble (Final)");
  const baseModelResults = modelResults.filter(
    (m) => m.name !== "Ensemble (Final)"
  );

  // UI State
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [activeTab, setActiveTab] = useState<"predictions" | "consensus">(
    "predictions"
  );
  const [mounted, setMounted] = useState(false);
  // Default to ensemble model for left column
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    ensembleCard?.name || null
  );

  useEffect(() => {
    setMounted(true);
    // Always default to ensemble on mount
    setSelectedModelName(ensembleCard?.name || null);
  }, [ensembleCard?.name]);

  // --- CONSENSUS LOGIC ---
  const voteCounts: Record<string, number> = {};
  modelResults.forEach((m) => {
    const rawName = m.predictedDisease;
    const disease = rawName.replace(" (?)", "");
    voteCounts[disease] = (voteCounts[disease] || 0) + 1;
  });

  const consensusDisease =
    Object.keys(voteCounts).length > 0
      ? Object.keys(voteCounts).reduce((a, b) =>
          voteCounts[a] > voteCounts[b] ? a : b
        )
      : "Unknown";

  const agreementCount = voteCounts[consensusDisease] || 0;
  const totalModels = modelResults.length;
  const agreementRatio = totalModels > 0 ? agreementCount / totalModels : 0;

  // Prepare Data for Consensus Chart
  const chartData = modelResults.map((m) => {
    let score = 0;
    if (m.breakdown) {
      const item = m.breakdown.find((b) => b.class === consensusDisease);
      score = item ? item.score : 0;
    } else {
      const pred = m.predictedDisease.replace(" (?)", "");
      if (pred === consensusDisease) {
        score = m.confidence;
      }
    }

    return {
      name: m.name,
      confidence: score,
      color: m.color,
      is_winner: m.predictedDisease.replace(" (?)", "") === consensusDisease,
    };
  });

  // --- BEST MODEL LOGIC (unchanged, but now only among base models) ---
  const bestModel =
    baseModelResults.length > 0
      ? baseModelResults.reduce(
          (prev, current) =>
            prev.confidence > current.confidence ? prev : current,
          baseModelResults[0]
        )
      : null;

  // --- ACTIVE MODEL LOGIC: always show ensemble if selected, else fallback ---
  const activeModel = selectedModelName
    ? modelResults.find((m) => m.name === selectedModelName) ||
      ensembleCard ||
      bestModel
    : ensembleCard || bestModel;

  // --- PDF GENERATION HANDLER ---
  const handleDownloadPDF = async () => {
    // --- PROFESSIONAL CLINICAL PDF DESIGN ---
    const emerald = "#065f46";
    const slate = "#334155";
    const disclaimerGrey = "#64748b";
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // Margins and layout
    const marginX = 32;
    const pageWidth = 595; // a4 width in pt
    let y = 56;

    // --- HEADER ---
    // Title and Date on the same row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(emerald);
    const title = "RETINAWEB Report";
    const dateStr = `Date: ${new Date().toLocaleDateString()}`;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(slate);
    doc.text(dateStr, marginX + titleWidth + 18, y);

    // Patient Ref and Clinician on the next row, right-aligned and left-aligned
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(slate);
    const patientRef = uploadedFile?.name
      ? `Patient Ref: ${uploadedFile.name}`
      : "";
    const userStr = user?.email ? `Clinician: ${user.email}` : "";
    if (patientRef && userStr) {
      doc.text(patientRef, marginX, y);
      doc.text(userStr, pageWidth - marginX, y, { align: "right" });
    } else if (patientRef) {
      doc.text(patientRef, marginX, y);
    } else if (userStr) {
      doc.text(userStr, marginX, y);
    }

    // Bottom border separator
    y += 10;
    doc.setDrawColor("#cbd5e1");
    doc.setLineWidth(0.8);
    doc.line(marginX, y, pageWidth - marginX, y);

    // --- EXECUTIVE SUMMARY ---
    y += 24;
    doc.setDrawColor(emerald);
    doc.setFillColor(236, 253, 245); // light green
    doc.roundedRect(marginX, y, pageWidth - marginX * 2, 60, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(slate);
    doc.text("Diagnosis (Ensemble Meta-Model)", marginX + 16, y + 22);
    doc.setFontSize(22);
    doc.setTextColor(emerald);
    doc.text(ensembleCard?.predictedDisease || "Unknown", marginX + 16, y + 50);

    // Add a note that base models are supporting evidence
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(slate);
    doc.text(
      "Base model predictions are provided as supporting evidence below.",
      marginX + 16,
      y + 65
    );

    // Other predictions (from base models, excluding ensemble)
    const allDiseases = baseModelResults.map((m) => m.predictedDisease);
    const uniqueDiseases = Array.from(new Set(allDiseases));
    const otherDiseases = uniqueDiseases.filter(
      (d) => d !== (ensembleCard?.predictedDisease || "Unknown")
    );
    if (otherDiseases.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(slate);
      doc.text(
        `Other model predictions: ${otherDiseases.join(", ")}`,
        marginX + 250,
        y + 50,
        { maxWidth: pageWidth - marginX * 2 - 250 }
      );
    }

    // Low confidence warning (ensure it's below the summary box and not overlapping)
    const anyLowConfidence = modelResults.some((m) => m.is_reliable === false);
    let lowConfidenceY = y + 80;
    if (anyLowConfidence) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor("#dc2626");
      doc.text("Low Confidence Analysis", marginX + 16, lowConfidenceY);
      lowConfidenceY += 18;
    }
    // Move y to after the warning if present, else after summary box
    y = anyLowConfidence ? lowConfidenceY : y + 80;

    // --- VISUAL EVIDENCE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(emerald);
    doc.text("Visual Evidence", marginX, y);

    // Prepare images
    let origImgData: string | null = null;
    let heatmapImgData: string | null = null;
    const imgMaxHeight = 180;
    const imgWidth = 180;
    if (imagePreviewUrl) {
      try {
        origImgData = await new Promise<string>((resolve, reject) => {
          const image = new window.Image();
          image.crossOrigin = "Anonymous";
          image.onload = () => {
            const scale = imgMaxHeight / image.height;
            const canvas = document.createElement("canvas");
            canvas.width = image.width * scale;
            canvas.height = imgMaxHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL("image/jpeg", 0.92));
            } else {
              reject();
            }
          };
          image.onerror = reject;
          image.src = imagePreviewUrl;
        });
      } catch {}
    }
    if (activeModel?.heatmap) {
      try {
        heatmapImgData = await new Promise<string>((resolve, reject) => {
          const image = new window.Image();
          image.crossOrigin = "Anonymous";
          image.onload = () => {
            const scale = imgMaxHeight / image.height;
            const canvas = document.createElement("canvas");
            canvas.width = image.width * scale;
            canvas.height = imgMaxHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL("image/jpeg", 0.92));
            } else {
              reject();
            }
          };
          image.onerror = reject;
          image.src = activeModel.heatmap || "";
        });
      } catch {}
    }
    y += 16;
    const imgY = y;
    if (origImgData)
      doc.addImage(
        origImgData,
        "JPEG",
        marginX + 10,
        imgY,
        imgWidth,
        imgMaxHeight
      );
    if (heatmapImgData)
      doc.addImage(
        heatmapImgData,
        "JPEG",
        marginX + 40 + imgWidth,
        imgY,
        imgWidth,
        imgMaxHeight
      );

    // Labels
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(slate);
    doc.text(
      "Original Fundus Scan",
      marginX + 10 + imgWidth / 2,
      imgY + imgMaxHeight + 16,
      { align: "center" }
    );
    doc.text(
      "AI Heatmap",
      marginX + 40 + imgWidth + imgWidth / 2,
      imgY + imgMaxHeight + 16,
      { align: "center" }
    );

    // If both images, space for both, else just one
    y = imgY + imgMaxHeight + 36;

    // --- DETAILED TABLE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(emerald);
    doc.text("Model Predictions (Supporting Evidence)", marginX, y);
    y += 16;

    // Table layout
    const tableX = marginX;
    const colWidths = [110, 120, 70, 180];
    let tableY = y + 14;
    doc.setFillColor(226, 232, 240);
    doc.rect(
      tableX,
      tableY,
      colWidths.reduce((a, b) => a + b),
      24,
      "F"
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(slate);
    doc.text("Model Name", tableX + 8, tableY + 16);
    doc.text("Predicted Disease", tableX + 8 + colWidths[0], tableY + 16);
    doc.text(
      "Confidence",
      tableX + 8 + colWidths[0] + colWidths[1],
      tableY + 16
    );
    doc.text(
      "Other Top Classes",
      tableX + 8 + colWidths[0] + colWidths[1] + colWidths[2],
      tableY + 16
    );

    // --- ABBREVIATION MAP (fixed as per user) ---
    const diseaseAbbr: Record<string, string> = {
      "Diabetic Retinopathy": "DR",
      Glaucoma: "G",
      Myopia: "MY",
      "Age-related Macular Degeneration": "AMD",
      Cataract: "CAT",
      "Epiretinal Membrane": "ERM",
      "Branch Retinal Vein Occlusion": "BRVO",
      "Hypertensive Retinopathy": "HTR",
      Retinitis: "RS",
      "Laser Scars": "LS",
      Normal: "Normal",
      // Also handle common short forms and variants
      BRVO: "BRVO",
      ERM: "ERM",
      HTR: "HTR",
      LS: "LS",
      RS: "RS",
      AMD: "AMD",
      CAT: "CAT",
      DR: "DR",
      G: "G",
      MY: "MY",
    };
    const abbr = (disease: string) =>
      diseaseAbbr[disease.trim()] ||
      // Try to match ignoring case and extra spaces
      diseaseAbbr[
        Object.keys(diseaseAbbr).find(
          (k) => k.toLowerCase() === disease.trim().toLowerCase()
        ) || ""
      ] ||
      disease
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    // Table rows
    tableY += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Only base models in the main rows
    baseModelResults.forEach((model, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(241, 245, 249);
        doc.rect(
          tableX,
          tableY,
          colWidths.reduce((a, b) => a + b),
          20,
          "F"
        );
      }
      doc.setTextColor(slate);
      doc.text(model.name, tableX + 8, tableY + 14, {
        maxWidth: colWidths[0] - 10,
      });
      doc.text(model.predictedDisease, tableX + 8 + colWidths[0], tableY + 14, {
        maxWidth: colWidths[1] - 10,
      });
      doc.text(
        `${(model.confidence * 100).toFixed(1)}%`,
        tableX + 8 + colWidths[0] + colWidths[1],
        tableY + 14,
        { maxWidth: colWidths[2] - 10 }
      );
      // Other top classes (excluding main prediction) - use abbreviations
      let otherClasses = "";
      if (model.breakdown && model.breakdown.length > 1) {
        otherClasses = model.breakdown
          .filter((b) => !b.is_selected)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map((b) => `${abbr(b.class)} (${(b.score * 100).toFixed(1)}%)`)
          .join(", ");
      }
      doc.setFontSize(9);
      doc.setTextColor("#64748b");
      doc.text(
        otherClasses || "-",
        tableX + 8 + colWidths[0] + colWidths[1] + colWidths[2],
        tableY + 13,
        { maxWidth: colWidths[3] - 10 }
      );
      doc.setFontSize(10);
      doc.setTextColor(slate);
      tableY += 20;
      if (tableY > 700) {
        doc.addPage();
        tableY = 60;
      }
    });

    // Add ensemble row as the last row
    if (ensembleCard) {
      // Alternate row color if needed
      if (baseModelResults.length % 2 === 0) {
        doc.setFillColor(241, 245, 249);
        doc.rect(
          tableX,
          tableY,
          colWidths.reduce((a, b) => a + b),
          20,
          "F"
        );
      }
      doc.setTextColor(slate);
      doc.text(ensembleCard.name, tableX + 8, tableY + 14, {
        maxWidth: colWidths[0] - 10,
      });
      doc.text(
        ensembleCard.predictedDisease,
        tableX + 8 + colWidths[0],
        tableY + 14,
        { maxWidth: colWidths[1] - 10 }
      );
      doc.text(
        `${(ensembleCard.confidence * 100).toFixed(1)}%`,
        tableX + 8 + colWidths[0] + colWidths[1],
        tableY + 14,
        { maxWidth: colWidths[2] - 10 }
      );
      doc.setFontSize(9);
      doc.setTextColor("#fb2424ff");
      doc.text(
        "Final ensemble meta-model result",
        tableX + 8 + colWidths[0] + colWidths[1] + colWidths[2],
        tableY + 13,
        { maxWidth: colWidths[3] - 10 }
      );
      doc.setFontSize(10);
      doc.setTextColor(slate);
      tableY += 20;
    }

    // Table borders
    let borderY = y + 14;
    const tableWidth = colWidths.reduce((a, b) => a + b);
    doc.setDrawColor("#cbd5e1");
    doc.setLineWidth(0.5);
    // Update border lines to match new row count
    const rowCount = baseModelResults.length + (ensembleCard ? 1 : 0);
    for (let i = 0; i <= rowCount + 1; i++) {
      doc.line(tableX, borderY + i * 20, tableX + tableWidth, borderY + i * 20);
    }
    let x = tableX;
    for (let w of colWidths) {
      doc.line(x, borderY, x, borderY + (rowCount + 1) * 20);
      x += w;
    }
    doc.line(x, borderY, x, borderY + (rowCount + 1) * 20);

    // --- FOOTER DISCLAIMER ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(disclaimerGrey);
    doc.text(
      "Disclaimer: This report is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.",
      pageWidth / 2,
      820,
      { align: "center", maxWidth: 520 }
    );

    doc.save("retina_analysis_report.pdf");
  };

  if (!imagePreviewUrl)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-200">
        <div className="text-center">
          <p className="text-xl mb-4">No image loaded.</p>
          <button
            onClick={() => navigate("/upload")}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen ${
        mode === "dark"
          ? "bg-gradient-to-br from-indigo-900 via-slate-800 to-emerald-900 text-slate-50"
          : "bg-gradient-to-br from-white via-slate-100 to-blue-50 text-slate-800"
      } relative overflow-hidden font-sans`}
      style={mode === "light" ? { color: "#1e293b" } : undefined}
    >
      {/* background blobs */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-700/40 via-violet-600/30 to-pink-500/20 filter blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-teal-400/30 via-cyan-300/20 to-indigo-500/10 filter blur-4xl" />
      </div>

      <header
        className={`relative z-10 border-b backdrop-blur-md ${
          mode === "dark"
            ? "border-white/10 bg-slate-900/50"
            : "border-slate-200 bg-white/80"
        }`}
        // Force text color for light mode
        style={mode === "light" ? { color: "#1e293b" } : undefined}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Image and Project Name Start */}
            <div className="flex items-center">
              <img
                src={logo}
                alt="RETINAWEB Logo"
                className="w-12 h-12 object-contain rounded-full shadow-lg"
              />
              <span
                className={`text-2xl font-extrabold tracking-tight select-none ${
                  mode === "dark" ? "text-white" : "text-slate-900"
                }`}
                style={{
                  letterSpacing: "0.02em",
                  fontFamily:
                    "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, 'sans-serif'",
                }}
              >
                RETINAWEB
              </span>
            </div>
            {/* Logo Image and Project Name End */}
            <div>
              <h1
                className={`text-lg font-bold tracking-tight ${
                  mode === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                Analysis Report
              </h1>
              <div
                className={`flex items-center gap-2 text-xs ${
                  mode === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Inference Complete
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/info")}
              className={`px-4 py-2 rounded-lg shadow-sm transition text-sm font-medium border
                ${
                  mode === "dark"
                    ? "bg-blue-500/80 border-blue-400/40 text-white hover:bg-blue-600"
                    : "bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200"
                }`}
            >
              Disease Info
            </button>
            <button
              onClick={() => navigate("/model-analytics")}
              className={`px-4 py-2 font-medium rounded-lg border transition text-sm
                ${
                  mode === "dark"
                    ? "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200"
                    : "bg-teal-50 text-teal-900 border-teal-100 hover:bg-teal-100"
                }`}
            >
              Model Analytics
            </button>
            <button
              onClick={() => navigate("/upload")}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium border
                ${
                  mode === "dark"
                    ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
            >
              Analyze New Image
            </button>
            <button
              onClick={handleDownloadPDF}
              className={`px-4 py-2 rounded-lg shadow-sm transition text-sm font-medium border
                ${
                  mode === "dark"
                    ? "bg-emerald-600/90 border-emerald-400/40 text-white hover:bg-emerald-700"
                    : "bg-emerald-100 border-emerald-200 text-emerald-900 hover:bg-emerald-200"
                }`}
            >
              Download PDF Report
            </button>
            <button
              onClick={async () => {
                await signOut(auth);
              }}
              className={`px-4 py-2 rounded-lg shadow-sm transition text-sm font-medium border
                ${
                  mode === "dark"
                    ? "bg-red-500/80 border-red-500/40 text-white hover:bg-red-600/90"
                    : "bg-red-100 border-red-200 text-red-900 hover:bg-red-200"
                }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        ref={reportRef}
        className={`p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 transition-opacity duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        // Force text color for light mode
        style={mode === "light" ? { color: "#1e293b" } : undefined}
      >
        {/* Left Column (Visualizer) */}
        <section className="lg:col-span-5 space-y-6">
          <div
            className={`backdrop-blur-md border rounded-3xl p-1 shadow-2xl relative group ${
              mode === "dark"
                ? "bg-slate-900/40 border-white/10"
                : "bg-white/80 border-slate-200"
            }`}
          >
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-md border transition-all ${
                  showHeatmap
                    ? "bg-emerald-500/90 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-black/40 border-white/20 text-slate-300 hover:bg-black/60"
                }`}
              >
                {showHeatmap ? "Heatmap ON" : "Heatmap OFF"}
              </button>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black">
              <img
                src={imagePreviewUrl}
                alt="Original"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {activeModel?.heatmap ? (
                <img
                  src={activeModel.heatmap}
                  alt={`Heatmap for ${activeModel.name}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    showHeatmap ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : (
                showHeatmap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <p className="text-white text-sm font-medium">
                      No Heatmap Available for {activeModel?.name}
                    </p>
                  </div>
                )
              )}
              <div
                className={`absolute bottom-0 inset-x-0 p-6 pt-12 ${
                  mode === "dark"
                    ? "bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                    : "bg-gradient-to-t from-white/90 via-white/60 to-transparent"
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-wider font-semibold mb-1 ${
                    mode === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Viewing Analysis By
                </p>
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-xl font-bold ${
                      mode === "dark" ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {activeModel?.name || "Loading..."}
                  </h3>
                  {activeModel?.name === "Ensemble (Final)" && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${
                        mode === "dark"
                          ? "bg-yellow-300/20 text-yellow-200 border-yellow-300/30"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      FINAL ENSEMBLE
                    </span>
                  )}
                  {activeModel?.name === bestModel?.name &&
                    activeModel?.name !== "Ensemble (Final)" && (
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${
                          mode === "dark"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        BEST BASE MODEL
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`rounded-2xl p-4 border ${
                mode === "dark"
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  mode === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Prediction
              </p>
              <p
                className={`text-lg font-bold truncate ${
                  mode === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                {activeModel?.predictedDisease || "..."}
              </p>
              {activeModel && activeModel.is_reliable === false && (
                <div
                  className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                    mode === "dark"
                      ? "bg-yellow-500/10 border-yellow-500/20"
                      : "bg-yellow-100 border-yellow-200"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      mode === "dark" ? "text-yellow-500" : "text-yellow-700"
                    }`}
                  >
                    ⚠️ Low Confidence
                  </span>
                </div>
              )}
              {activeModel?.name === "Ensemble (Final)" && (
                <div
                  className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                    mode === "dark"
                      ? "bg-yellow-300/10 border-yellow-300/20"
                      : "bg-yellow-100 border-yellow-200"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      mode === "dark" ? "text-yellow-300" : "text-yellow-700"
                    }`}
                  >
                    ★ Final Ensemble Diagnosis
                  </span>
                </div>
              )}
            </div>
            <div
              className={`rounded-2xl p-4 border ${
                mode === "dark"
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  mode === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Confidence
              </p>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-2xl font-bold ${
                    mode === "dark" ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  {activeModel?.confidence
                    ? (activeModel.confidence * 100).toFixed(1)
                    : 0}
                  %
                </p>
                {activeModel?.threshold !== undefined && (
                  <span
                    className={`text-xs ${
                      mode === "dark" ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    (Thresh: {activeModel.threshold})
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Right Column (Results Summary) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div
            className={`flex gap-1 p-1 rounded-xl border w-fit ${
              mode === "dark"
                ? "bg-white/5 border-white/10"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              onClick={() => setActiveTab("predictions")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "predictions"
                  ? mode === "dark"
                    ? "bg-white/10 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : mode === "dark"
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Model Predictions
            </button>
            <button
              onClick={() => setActiveTab("consensus")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "consensus"
                  ? mode === "dark"
                    ? "bg-white/10 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : mode === "dark"
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Ensemble Result
            </button>
          </div>
          <div className="flex-1">
            {activeTab === "predictions" ? (
              <div className="grid grid-cols-1 gap-4">
                {/* --- ENSEMBLE CARD AT TOP --- */}
                {ensembleCard && (
                  <div
                    key={ensembleCard.name}
                    onClick={() => setSelectedModelName(ensembleCard.name)}
                    className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 bg-yellow-50 border-yellow-200 shadow-lg scale-[1.01]`}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#fbbf24" }}
                          ></div>
                          <h4 className="font-semibold text-lg text-yellow-700">
                            {ensembleCard.name}
                          </h4>
                        </div>
                        <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-yellow-100 text-yellow-800">
                          FINAL ENSEMBLE
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-yellow-700">
                          {ensembleCard.predictedDisease}
                        </span>
                        <span className="font-bold text-yellow-700">
                          {(ensembleCard.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {selectedModelName === ensembleCard.name &&
                      ensembleCard.breakdown && (
                        <div className="px-5 pb-5 pt-0 border-t border-yellow-200 mt-2 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-xs uppercase tracking-wider font-semibold py-3 text-yellow-700">
                            Probability Breakdown
                          </p>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-200">
                            {ensembleCard.breakdown.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 text-sm"
                              >
                                <div className="w-32 truncate text-yellow-700">
                                  {item.class}
                                </div>
                                <div className="flex-1 h-2 bg-yellow-200/50 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.is_selected
                                        ? "bg-yellow-500"
                                        : "bg-yellow-300"
                                    }`}
                                    style={{ width: `${item.score * 100}%` }}
                                  />
                                </div>
                                <div className="w-12 text-right font-mono text-xs text-yellow-700">
                                  {(item.score * 100).toFixed(1)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
                {/* --- BASE MODELS BELOW --- */}
                {baseModelResults.map((model, idx) => {
                  const isSelected = activeModel?.name === model.name;
                  const isBest = bestModel?.name === model.name;

                  return (
                    <div
                      key={model.name}
                      onClick={() => setSelectedModelName(model.name)}
                      className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? "bg-white/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.01]"
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                      style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                model.color ? "" : "bg-slate-400"
                              }`}
                              style={{ backgroundColor: model.color }}
                            ></div>
                            <h4
                              className={`font-semibold text-lg ${
                                isSelected
                                  ? mode === "dark"
                                    ? "text-white"
                                    : "text-slate-900"
                                  : mode === "dark"
                                  ? "text-slate-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {model.name}
                            </h4>
                          </div>
                          {isBest && (
                            <span
                              className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                                mode === "dark"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              BEST MATCH
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm font-medium ${
                              mode === "dark"
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {model.predictedDisease}
                          </span>
                          <span
                            className={`font-bold ${
                              mode === "dark"
                                ? "text-emerald-400"
                                : "text-emerald-700"
                            }`}
                          >
                            {(model.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {isSelected && model.breakdown && (
                        <div className="px-5 pb-5 pt-0 border-t border-white/10 mt-2 animate-in slide-in-from-top-2 duration-300">
                          <p
                            className={`text-xs uppercase tracking-wider font-semibold py-3 ${
                              mode === "dark"
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            Probability Breakdown
                          </p>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {model.breakdown.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 text-sm"
                              >
                                <div
                                  className={`w-32 truncate ${
                                    mode === "dark"
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {item.class}
                                </div>
                                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.is_selected
                                        ? "bg-emerald-500"
                                        : "bg-slate-500"
                                    }`}
                                    style={{ width: `${item.score * 100}%` }}
                                  />
                                </div>
                                <div
                                  className={`w-12 text-right font-mono text-xs ${
                                    mode === "dark"
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {(item.score * 100).toFixed(1)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // ...existing code for consensus tab...
              <div
                className={`rounded-3xl p-6 flex flex-col border gap-6 ${
                  mode === "dark"
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-slate-200"
                }`}
                style={{ minHeight: 340 }}
              >
                {/* ...existing code for consensus/ensemble result... */}
                {ensembleCard ? (
                  <div
                    className={`rounded-xl border p-6 flex flex-col gap-2 ${
                      mode === "dark"
                        ? "bg-yellow-100/5 border-yellow-200/10"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#fbbf24" }}
                      ></span>
                      <span
                        className={`font-semibold text-lg ${
                          mode === "dark"
                            ? "text-yellow-300"
                            : "text-yellow-700"
                        }`}
                      >
                        {ensembleCard.predictedDisease}
                      </span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                          mode === "dark"
                            ? "bg-yellow-300/20 text-yellow-200"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        Confidence: {(ensembleCard.confidence * 100).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span
                        className={`${
                          mode === "dark" ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        The ensemble meta-model integrates all base model
                        outputs for a robust final decision.
                      </span>
                    </div>
                    {/* --- WHY THIS DIAGNOSIS --- */}
                    {ensembleCard.breakdown &&
                      ensembleCard.breakdown.length > 0 && (
                        <div className="mt-4">
                          <h5
                            className={`font-semibold mb-1 ${
                              mode === "dark"
                                ? "text-yellow-200"
                                : "text-yellow-700"
                            }`}
                          >
                            Why this diagnosis?
                          </h5>
                          <div
                            className={`text-sm mb-2 ${
                              mode === "dark"
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            The ensemble model chose{" "}
                            <strong>{ensembleCard.predictedDisease}</strong>{" "}
                            because it had the highest combined probability (
                            {(ensembleCard.confidence * 100).toFixed(1)}%) among
                            all possible disease classes, based on the
                            aggregated outputs of the base models.
                          </div>
                          <div className="overflow-x-auto">
                            <table
                              className={`min-w-[320px] text-xs border ${
                                mode === "dark"
                                  ? "border-yellow-200"
                                  : "border-yellow-300"
                              } rounded-lg`}
                            >
                              <thead>
                                <tr
                                  className={`${
                                    mode === "dark"
                                      ? "bg-yellow-300/10"
                                      : "bg-yellow-100"
                                  }`}
                                >
                                  <th className="px-2 py-1 text-left">Class</th>
                                  <th className="px-2 py-1 text-left">
                                    Probability
                                  </th>
                                  <th className="px-2 py-1 text-left">
                                    Selected
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {ensembleCard.breakdown
                                  .sort((a, b) => b.score - a.score)
                                  .map((item, idx) => (
                                    <tr
                                      key={idx}
                                      className={
                                        item.is_selected
                                          ? mode === "dark"
                                            ? "bg-yellow-300/20"
                                            : "bg-yellow-200"
                                          : ""
                                      }
                                    >
                                      <td className="px-2 py-1">
                                        {item.class}
                                      </td>
                                      <td className="px-2 py-1">
                                        {(item.score * 100).toFixed(1)}%
                                      </td>
                                      <td className="px-2 py-1">
                                        {item.is_selected ? (
                                          <span
                                            className={`font-bold ${
                                              mode === "dark"
                                                ? "text-yellow-200"
                                                : "text-yellow-700"
                                            }`}
                                          >
                                            ✓
                                          </span>
                                        ) : (
                                          ""
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div
                    className={`rounded-xl border p-6 ${
                      mode === "dark"
                        ? "bg-slate-800 border-slate-700 text-slate-200"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    Ensemble prediction not available.
                  </div>
                )}
                <div className="mt-6">
                  <h4
                    className={`font-semibold mb-2 ${
                      mode === "dark" ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    Base Model Predictions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {baseModelResults.map((model) => (
                      <div
                        key={model.name}
                        className={`rounded-lg border p-3 flex flex-col gap-1 ${
                          mode === "dark"
                            ? "bg-white/5 border-white/10"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: model.color }}
                          ></span>
                          <span className="font-medium">{model.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>
                            <strong>Prediction:</strong>{" "}
                            {model.predictedDisease}
                          </span>
                          <span>
                            <strong>Conf:</strong>{" "}
                            {(model.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Results;
