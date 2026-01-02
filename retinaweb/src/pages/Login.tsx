import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase"; // Ensure this path matches where you saved firebase.ts
import { useColorMode } from "../App";
import logo from "../assets/favicon.png";

const Login = () => {
  const { mode, toggle } = useColorMode();
  const navigate = useNavigate();

  // State for Firebase Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State for Forgot Password Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // State for Remember Me checkbox
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Set persistence based on rememberMe
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      // The Real Firebase Login Call
      await signInWithEmailAndPassword(auth, email, password);

      // On success, the AuthListener in App.tsx will detect the user change
      // But we can also force navigation here for immediate feedback
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      // Map Firebase error codes to user-friendly messages
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Failed to sign in. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setResetError("No user found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setResetError("Invalid email address.");
      } else {
        setResetError("Failed to send reset email. Try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

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
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-700/40 via-violet-600/30 to-pink-500/20 filter blur-3xl animate-slow-pulse" />
        <div className="absolute -bottom-32 -right-24 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-teal-400/30 via-cyan-300/20 to-indigo-500/10 filter blur-4xl" />
      </div>

      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="RETINAWEB Logo"
              className="w-12 h-12 object-contain rounded-full shadow-lg"
            />
            <span
              className="text-2xl font-extrabold tracking-tight select-none"
              style={{
                letterSpacing: "0.02em",
                fontFamily:
                  "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, 'sans-serif'",
                color: mode === "dark" ? "#fff" : "#1e293b",
              }}
            >
              RETINAWEB
            </span>
          </div>
          {/* ...existing code for right side of header if any... */}
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: Visual */}
          <div className="order-2 md:order-1 flex flex-col gap-6">
            <div className="bg-white/4 border border-white/6 rounded-3xl p-8 shadow-2xl backdrop-blur-lg">
              <h2 className="text-3xl font-bold leading-tight">
                Secure, fast retinal analysis
              </h2>
              <p className="mt-3 text-slate-200/80">
                Upload fundus images and compare model predictions with
                interactive visualizations and confidence insights.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-200/80">
                <li className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-400/20 text-emerald-300">
                    ✓
                  </span>
                  Real-time model comparison
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-200">
                    ✓
                  </span>
                  Attention heatmaps & Consensus charts
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-400/20 text-violet-200">
                    ✓
                  </span>
                  Exportable reports
                </li>
              </ul>
            </div>

            {/* Illustration / subtle card */}
            <div className="flex items-center justify-center p-6 rounded-2xl bg-gradient-to-tr from-white/3 to-white/2 border border-white/6 shadow-lg">
              {/* simple illustrative SVG */}
              <svg
                width="220"
                height="140"
                viewBox="0 0 220 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-90"
              >
                <rect
                  x="8"
                  y="8"
                  width="204"
                  height="124"
                  rx="12"
                  fill="url(#g1)"
                  stroke="rgba(255,255,255,0.06)"
                />
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0" stopColor="#3b82f6" stopOpacity="0.12" />
                    <stop offset="0.6" stopColor="#06b6d4" stopOpacity="0.08" />
                    <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.06" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right: Form (glass) */}
          <div className="order-1 md:order-2">
            <div className="relative bg-white/6 backdrop-blur-md border border-white/8 rounded-3xl p-8 shadow-2xl">
              {/* Removed logo above sign in */}

              <h3 className="text-2xl font-bold mb-2">
                Sign in to your account
              </h3>
              <p className="text-sm text-slate-200/80 mb-6">
                Secure access for clinicians and researchers.
              </p>

              {/* ERROR ALERT */}
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-200/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full rounded-xl px-4 py-3 bg-white/10 border border-white/8 placeholder:text-slate-300 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-200/90 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 bg-white/10 border border-white/8 placeholder:text-slate-300 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer"></label>
                  <button
                    type="button"
                    className="text-slate-200/80 hover:text-white hover:underline"
                    onClick={() => {
                      setShowResetModal(true);
                      setResetEmail("");
                      setResetError("");
                      setResetSuccess("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-slate-900"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-sm text-slate-200/70 flex flex-col gap-2">
                <span>
                  Don't have an account?{" "}
                  <button
                    className="text-cyan-300 hover:underline"
                    onClick={() => navigate("/signup")}
                  >
                    Sign up
                  </button>
                </span>
              </div>
            </div>

            {/* small footer note */}
            <div className="mt-6 text-center text-xs text-slate-200/60">
              <span>
                © {new Date().getFullYear()} RetinaWeb • Not a medical device
              </span>
            </div>
          </div>
        </div>
        {/* Forgot Password Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-sm relative">
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
                onClick={() => setShowResetModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h4 className="text-lg font-semibold mb-2">Reset Password</h4>
              <p className="text-xs text-slate-300 mb-4">
                Enter your email to receive a password reset link.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg px-4 py-2 bg-white/10 border border-white/10 placeholder:text-slate-300 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                  required
                  autoFocus
                />
                {resetError && (
                  <div className="text-xs text-red-300">{resetError}</div>
                )}
                {resetSuccess && (
                  <div className="text-xs text-emerald-300">{resetSuccess}</div>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-lg px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold shadow hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login;
