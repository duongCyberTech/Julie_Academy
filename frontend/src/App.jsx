import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./context/ThemeProvider";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/Header";

function AppContent() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const location = useLocation();

  const toggleMode = () =>
    setMode((prev) => (prev === "dark" ? "light" : "dark"));

  const hideHeader =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!hideHeader && <Header mode={mode} toggleMode={toggleMode} />}
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
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
