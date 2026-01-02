import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthListener } from "./components/AuthListener";
import React, { createContext, useContext, useState, useEffect } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup"; // <--- Import this
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import DiseaseInfo from "./pages/DiseaseInfo";
import ModelAnalytics from "./pages/ModelAnalytics";

// Color mode context
type ColorMode = "dark" | "light";
const ColorModeContext = createContext<{
  mode: ColorMode;
  toggle: () => void;
}>({ mode: "dark", toggle: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>("dark");
  useEffect(() => {
    document.documentElement.classList.toggle("light", mode === "light");
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  return (
    <ColorModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ColorModeContext.Provider>
  );
}

function App() {
  return (
    <ColorModeProvider>
      <Router>
        <AuthListener>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} /> {/* <--- Add this */}
            {/* Protected Routes */}
            <Route path="/" element={<Upload />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/results" element={<Results />} />
            <Route path="/info" element={<DiseaseInfo />} />
            <Route path="/model-analytics" element={<ModelAnalytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthListener>
      </Router>
    </ColorModeProvider>
  );
}

export default App;
