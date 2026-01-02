import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import useStore from "../store/useStore";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useColorMode } from "../App";
import logo from "../assets/favicon.png";

const Upload = () => {
  const { mode, toggle } = useColorMode();
  const navigate = useNavigate();

  // 1. Get analyzeImage and isProcessing from the store
  // We use 'isProcessing' from the store instead of a local state
  const { setFile, analyzeImage, isProcessing } = useStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file); // Sets the preview image immediately

        // 2. Call the Real Python Backend
        // We 'await' this so we only switch pages once the server responds
        await analyzeImage(file);

        // 3. Navigate only after success
        navigate("/results");
      }
    },
    [setFile, analyzeImage, navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    disabled: isProcessing, // Disable dropping while Python is thinking
  });

  return (
    <div
      className={`min-h-screen ${
        mode === "dark"
          ? "bg-gradient-to-br from-indigo-900 via-slate-800 to-emerald-900 text-slate-50"
          : "bg-gradient-to-br from-white via-slate-100 to-blue-50 text-slate-800"
      } relative overflow-hidden`}
    >
      {/* Removed color mode toggle */}

      {/* background blobs */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-700/40 via-violet-600/30 to-pink-500/20 filter blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-teal-400/30 via-cyan-300/20 to-indigo-500/10 filter blur-4xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/6">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
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
            <div>
              <h1 className="text-lg font-semibold">Upload Fundus Image</h1>
              <p className="text-xs text-slate-200/80">
                Select a retinal image for analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/info", { state: { from: "upload" } })}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-lg shadow-sm transition hover:bg-white/20"
            >
              Disease Info
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-teal-100 text-teal-800 font-medium hover:bg-teal-200 transition"
              onClick={() => navigate("/model-analytics")}
            >
              Model Analytics
            </button>
            {/* Logout Button */}
            <button
              onClick={async () => {
                await signOut(auth);
                // AuthListener will handle navigation and state reset
              }}
              className="px-4 py-2 bg-red-500/80 backdrop-blur-sm border border-red-500/40 text-white rounded-lg shadow-sm transition hover:bg-red-600/90"
            >
              Logout
            </button>
            {isProcessing && (
              <div className="flex items-center text-sm text-slate-200">
                <svg
                  className="w-5 h-5 mr-2 animate-spin text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Processing...
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 max-w-6xl mx-auto relative z-10">
        <div className="max-w-2xl mx-auto relative">
          {/* uploading overlay */}
          {isProcessing && (
            <div
              className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              aria-live="polite"
            >
              {/* Simplified Spinner Center */}
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-white font-semibold">Running AI Models...</p>
              </div>
            </div>
          )}

          {/* Upload Card (glass) */}
          <div className="bg-white/6 backdrop-blur-md border border-white/8 rounded-3xl shadow-2xl p-8">
            {/* Drag & Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-emerald-400 bg-emerald-400/10"
                  : "border-white/20 hover:border-white/30"
              } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isDragActive
                  ? "Drop your image here"
                  : "Drag & drop your image"}
              </h3>
              <p className="text-slate-200/80 mb-4">
                or click to browse from your computer
              </p>
              <p className="text-xs text-slate-300/60">
                Supported formats: PNG, JPG, JPEG, GIF
              </p>
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-white/4 border border-white/6 rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-white mb-3">
                What happens next?
              </h4>
              <ul className="space-y-2 text-sm text-slate-200/80">
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-xs font-bold text-blue-500">
                    1
                  </span>
                  Your image will be analyzed by 5 ML models
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-xs font-bold text-blue-500">
                    2
                  </span>
                  Each model provides disease prediction & confidence
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-xs font-bold text-blue-500">
                    3
                  </span>
                  Compare model performance metrics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
