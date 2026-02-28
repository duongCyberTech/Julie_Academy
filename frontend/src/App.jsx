import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./context/ThemeProvider";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

function AppContent() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const location = useLocation();

  const toggleMode = () =>
    setMode((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/*"
          element={<AppRoutes mode={mode} toggleMode={toggleMode} />}
        />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
