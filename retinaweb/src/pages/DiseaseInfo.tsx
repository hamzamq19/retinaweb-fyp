import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { diseaseData } from "../data/diseaseData";
import { useColorMode } from "../App";
import logo from "../assets/favicon.png";

// --- IMAGE MAPPING (LOCAL) ---
// Points to files in your 'public/images/diseases/' folder
// --- IMAGE MAPPING (LOCAL) ---
// Points to files in your 'public/images/diseases/' folder
const diseaseImages: Record<string, string> = {
  // 1. Diabetic Retinopathy
  diabetic_retinopathy: "/images/diseases/diabetic_retinopathy.jpg",

  // 2. Glaucoma
  glaucoma: "/images/diseases/glaucoma.jpg",

  // 3. Macular Degeneration (AMD)
  macular_degeneration: "/images/diseases/macular_degeneration.jpg",

  // 4. Cataract
  cataract: "/images/diseases/cataract.jpg",

  // 5. Hypertensive Retinopathy
  hypertensive_retinopathy: "/images/diseases/hypertensive_retinopathy.jpg",

  // 6. Pathological Myopia
  myopia: "/images/diseases/myopia.jpg",

  // 7. Retinal Vein Occlusion (BRVO/CRVO)
  vein_occlusion: "/images/diseases/vein_occlusion.jpg",

  // 8. Retinitis (e.g., Retinitis Pigmentosa)
  retinitis: "/images/diseases/retinitis.jpg",

  // 9. Epiretinal Membrane
  epiretinal_membrane: "/images/diseases/epiretinal_membrane.jpg",

  // 10. Laser Scars (Photocoagulation marks)
  laser_scars: "/images/diseases/laser_scars.jpg",

  // 11. Normal (Healthy Fundus)
  normal: "/images/diseases/normal.jpg",
};

const DiseaseInfo = () => {
  const { mode, toggle } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && (location.state as any).from) || null;

  const handleBack = () => {
    if (from === "login") {
      navigate("/", { replace: true });
    } else if (from === "upload") {
      navigate("/upload", { replace: true });
    } else {
      navigate(-1);
    }
  };

  const backLabel =
    from === "login"
      ? "Back to Login"
      : from === "upload"
      ? "Back to Analysis"
      : "Back";

  return (
    <div
      className={`min-h-screen ${
        mode === "dark"
          ? "bg-gradient-to-br from-indigo-900 via-slate-800 to-emerald-900 text-slate-50"
          : "bg-gradient-to-br from-white via-slate-100 to-blue-50 text-slate-800"
      } relative overflow-hidden`}
    >
      {/* Background Blobs */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-700/40 via-violet-600/30 to-pink-500/20 filter blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-teal-400/30 via-cyan-300/20 to-indigo-500/10 filter blur-4xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/6 sticky top-0 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-lg shadow-sm transition hover:bg-white/20"
            >
              {backLabel}
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-teal-100 text-teal-800 font-medium hover:bg-teal-200 transition"
              onClick={() => navigate("/model-analytics")}
            >
              Model Analytics
            </button>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseaseData.map((disease) => {
            const colorClass = disease.color
              ? `bg-gradient-to-r ${disease.color}`
              : "bg-gradient-to-r from-cyan-500 to-blue-500";
            return (
              <div
                key={disease.id}
                className="bg-white/6 backdrop-blur-md border border-white/8 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition flex flex-col"
              >
                {/* Color Bar */}
                <div className={`h-1 ${colorClass}`}></div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      {disease.name}
                    </h2>
                  </div>

                  <p className="text-slate-200/80 text-sm mb-6 leading-relaxed">
                    {disease.description}
                  </p>

                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Key Signs & Symptoms
                    </h3>
                    <ul className="space-y-2">
                      {disease.symptoms.map((symptom, index) => (
                        <li
                          key={index}
                          className="flex items-start text-sm text-slate-200/80"
                        >
                          <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-white/4 border border-white/6 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">
            Important Information
          </h3>
          <p className="text-slate-200/80 mb-4">
            This dashboard is designed to assist healthcare professionals in
            analyzing fundus images. It should not be used as a standalone
            diagnostic tool. Always consult with an ophthalmologist or
            retinologist for professional medical advice and diagnosis.
          </p>
          <p className="text-sm text-slate-300/60">
            Early detection through regular eye exams can prevent or slow vision
            loss. If you experience any changes in vision, seek immediate
            medical attention.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DiseaseInfo;
