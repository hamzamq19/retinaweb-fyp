import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import useStore from "../store/useStore";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthListener = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setAuthLoading, isAuthLoading } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);

      const currentPath = location.pathname;

      // Define Public Routes (Pages you can see without logging in)
      const publicPaths = ["/login", "/signup"];

      if (user) {
        // A. LOGGED IN: If trying to access public pages, redirect to Home
        if (publicPaths.includes(currentPath)) {
          navigate("/");
        }
      } else {
        // B. LOGGED OUT: If trying to access protected pages, redirect to Login
        if (!publicPaths.includes(currentPath)) {
          navigate("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname, setUser, setAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-emerald-500">
        <svg
          className="animate-spin h-10 w-10"
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
      </div>
    );
  }

  return <>{children}</>;
};
