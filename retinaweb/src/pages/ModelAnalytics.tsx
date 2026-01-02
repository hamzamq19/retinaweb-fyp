import React from "react";
import { useColorMode } from "../App";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import logo from "../assets/favicon.png";

const ModelAnalytics: React.FC = () => {
  const { mode } = useColorMode();
  const navigate = useNavigate();

  // --- 1. Update the data array for the Bar Chart ---
  const data = [
    { name: "ResNet50", f1: 0.83, prec: 0.85, rec: 0.82, acc: 0.85 },
    { name: "DenseNet121", f1: 0.81, prec: 0.81, rec: 0.81, acc: 0.82 },
    { name: "ConvNeXt", f1: 0.82, prec: 0.82, rec: 0.83, acc: 0.83 },
    { name: "Swin Tiny", f1: 0.83, prec: 0.82, rec: 0.84, acc: 0.84 },
    { name: "EfficientNet-B3", f1: 0.84, prec: 0.84, rec: 0.84, acc: 0.84 },
    // --- NEW: Stacking Ensemble ---
    { name: "Stacking Ensemble", f1: 0.87, prec: 0.92, rec: 0.84, acc: 0.83 },
  ];

  // --- 2. Update the modelDetails array ---
  const modelDetails = [
    {
      name: "EfficientNetB3",
      role: "The High-Res Expert",
      icon: "🎯",
      color: "border-red-500",
      text_color: "text-red-400",
      specs: "300x300px | Compound Scaling",
      desc: "The most accurate model in our ensemble. It is trained on higher-resolution (300px) images to spot minute lesions and micro-aneurysms.",
      customization:
        "We modified the head with a 'Double Dropout' strategy (0.3 + 0.5) to prevent overfitting given the larger input size.",
    },
    {
      name: "Swin Transformer",
      role: "Geometric Context Expert",
      icon: "🧩",
      color: "border-emerald-500",
      text_color: "text-emerald-400",
      specs: "224x224px | Shifted Windows",
      desc: "Uses Self-Attention to understand the geometry of the eye. It excels at identifying diseases that distort the retinal shape (e.g., Myopia).",
      customization:
        "Trained using 'Smart Cropping' to remove 90% of background noise, forcing the Transformer to focus solely on retinal structure.",
    },
    {
      name: "DenseNet121",
      role: "The Texture Specialist",
      icon: "🔬",
      color: "border-blue-500",
      text_color: "text-blue-400",
      specs: "224x224px | Feature Reuse",
      desc: "Connects every layer to every other layer. This makes it incredibly sensitive to subtle texture changes, such as the faint haziness of Cataracts.",
      customization:
        "Applied 'Tunnel Vision' (Zoomed-in crops) during training to force the model to look at texture rather than global shape.",
    },
    {
      name: "ConvNeXt Tiny",
      role: "The Modern Hybrid",
      icon: "🚀",
      color: "border-indigo-500",
      text_color: "text-indigo-400",
      specs: "224x224px | Large Kernels",
      desc: "A modern CNN that behaves like a Transformer. It bridges the gap between the speed of a CNN and the accuracy of attention mechanisms.",
      customization:
        "Trained with aggressive regularization (Weight Decay 0.05) to prevent memorization, making it our most robust generalist.",
    },
    {
      name: "ResNet50",
      role: "The Baseline Anchor",
      icon: "⚓",
      color: "border-amber-500",
      text_color: "text-amber-400",
      specs: "224x224px | Residual Blocks",
      desc: "The industry standard for computer vision. We use ResNet50 as our 'Control' model to stabilize the ensemble's voting process.",
      customization:
        "Modified with a high Dropout rate (0.65) to act as a conservative voter, ensuring the system avoids rash predictions.",
    },
    // --- NEW: Stacking Ensemble card ---
    {
      name: "Stacking Ensemble",
      role: "The Supervisor (Meta-Learner)",
      icon: "🏆",
      color: "border-pink-500", // Changed to a unique color not used elsewhere
      text_color: "text-pink-400",
      specs: "Logistic Regression | Dynamic Weighting",
      desc: "The final decision-maker. It uses a Logistic Regression meta-learner to analyze the confidence scores of all 5 sub-models and intelligently weighs their opinions to maximize precision.",
      customization:
        "Trained on the validation set to learn the specific reliability of each architecture for every individual disease class.",
    },
  ];

  // --- 3. Bar Chart color logic ---
  const barColors = [
    "#8884d8", // EfficientNetB3
    "#ff8558ff", // ResNet50
    "#82ca9d", // DenseNet121
    "#10B981", // SwinTiny
    "#0088FE", // ConvNeXtTiny
    "#fbbf24", // Stacking Ensemble (Gold/Amber)
  ];

  // Define COLORS for metric bars
  const COLORS = {
    f1: "#10B981", // Emerald (F1-Score)
    prec: "#818CF8", // Indigo (Precision)
    rec: "#F59E42", // Orange (Recall)
    acc: "#38BDF8", // Sky Blue (Accuracy)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 py-10 px-4 font-sans">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
          onClick={() => navigate(-1)}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Section A: Header */}
      <section className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
          Architecture Breakdown
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 pb-2">
          Heterogeneous Ensemble Strategy
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          RETINAWEB doesn't rely on a single opinion. We leverage a team of{" "}
          <span className="text-white font-semibold">
            5 Specialized Architectures
          </span>
          , each optimized for a specific aspect of retinal diagnosis—from
          texture analysis to geometric context.
        </p>
      </section>

      {/* Section B: Performance Chart (now the only chart section) */}
      <section className="max-w-6xl mx-auto mb-16 bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-10 border border-slate-700/50">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              Performance Metrics
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Comparative analysis on the held-out Test Set
            </p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0.8, 0.92]}
                ticks={[0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                }}
                itemStyle={{ fontSize: "13px" }}
                formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
              />
              <Legend wrapperStyle={{ fontSize: 14, color: "#fff" }} />
              <Bar
                dataKey="f1"
                name="F1-Score"
                fill={COLORS.f1}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="prec"
                name="Precision"
                fill={COLORS.prec}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="rec"
                name="Recall"
                fill={COLORS.rec}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="acc"
                name="Accuracy"
                fill={COLORS.acc}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Section C: Specialist Team Cards (Updated with Detailed Info) */}
      <section className="max-w-7xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-8 text-center text-slate-100">
          Meet the Specialist Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelDetails.map((model) => (
            <div
              key={model.name}
              className={`group bg-slate-900 border-t-4 ${model.color} rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}
            >
              {/* Background Glow */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${model.color.replace(
                  "border-",
                  "from-"
                )}/20 to-transparent blur-3xl rounded-full group-hover:scale-150 transition-transform`}
              />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{model.icon}</div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${model.text_color} bg-slate-800/50 px-2 py-1 rounded`}
                  >
                    {model.role}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {model.name}
                </h3>
                <div className="text-xs font-mono text-slate-400 mb-4 bg-slate-950/50 inline-block px-2 py-1 rounded">
                  {model.specs}
                </div>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed min-h-[60px]">
                  {model.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ModelAnalytics;
