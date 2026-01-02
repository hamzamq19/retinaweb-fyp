import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import logo from "../assets/favicon.png";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NOTE: We removed the useEffect redirect here because
  // AuthListener.tsx now handles that logic globally.

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // AuthListener will detect the new user and redirect to "/",
      // but we add this for immediate feedback.
      navigate("/");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to sign up. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "bg-gradient-to-br from-indigo-900 via-slate-800 to-emerald-900 text-slate-50"
          : "bg-gradient-to-br from-white via-slate-100 to-blue-50 text-slate-800"
      } relative overflow-hidden`}
    >
      {/* Ambient Background (Matching Login) */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-700/40 via-violet-600/30 to-pink-500/20 filter blur-3xl animate-slow-pulse" />
        <div className="absolute -bottom-32 -right-24 w-[38rem] h-[38rem] rounded-full bg-gradient-to-bl from-teal-400/30 via-cyan-300/20 to-indigo-500/10 filter blur-4xl" />
      </div>

      <div className="bg-white/6 backdrop-blur-md border border-white/8 rounded-3xl p-8 shadow-2xl w-full max-w-md relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center gap-2">
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
                color: "#1e293b",
              }}
            >
              RETINAWEB
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Create an account</h2>
          <p className="text-sm text-slate-200/80">
            For clinicians and researchers only.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
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
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-200/70">
          <span>
            Already have an account?{" "}
            <button
              className="text-cyan-300 hover:text-cyan-200 hover:underline font-medium"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
