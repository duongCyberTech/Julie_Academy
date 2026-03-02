import { createTheme, alpha } from "@mui/material/styles";

const PALETTE = {
  primary: { light: "#93C5FD", main: "#3B82F6", dark: "#1E40AF", contrastText: "#FFFFFF" },
  secondary: { light: "#FED7AA", main: "#e17319", dark: "#d34811", contrastText: "#FFFFFF" },
  accent: { light: "#E9D5FF", main: "#C084FC", dark: "#7E22CE", contrastText: "#1E293B" },
  success: { light: "#A7F3D0", main: "#10B981", dark: "#047857", contrastText: "#FFFFFF" },
  warning: { light: "#FDE68A", main: "#FBBF24", dark: "#B45309", contrastText: "#1E293B" },
  error: { light: "#FECACA", main: "#F87171", dark: "#B91C1C", contrastText: "#FFFFFF" },
  neutral: {
    50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0", 300: "#CBD5E1", 400: "#94A3B8",
    500: "#64748B", 600: "#475569", 700: "#334155", 800: "#1E293B", 900: "#0F172A",
  },
  navy: { background: "#0B1426", paper: "#132038", divider: "#1E3050" },
};

const TYPOGRAPHY = {
  fontFamily: '"Nunito", "Quicksand", "Inter", sans-serif',
  fontWeightRegular: 500,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: { fontSize: "2.5rem", fontWeight: 800 },
  h2: { fontSize: "2rem", fontWeight: 800 },
  h3: { fontSize: "1.75rem", fontWeight: 700 },
  h4: { fontSize: "1.25rem", fontWeight: 700 },
  h5: { fontSize: "1.1rem", fontWeight: 700 },
  h6: { fontSize: "1rem", fontWeight: 700 },
  button: { textTransform: "none", fontWeight: 700, letterSpacing: "0.5px" },
};

export const createAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  const themePalette = {
    mode,
    ...PALETTE,
    background: {
      default: isDark ? PALETTE.navy.background : "#F4F7FC",
      paper: isDark ? PALETTE.navy.paper : "#FFFFFF",
    },
    text: {
      primary: isDark ? "#E2E8F0" : PALETTE.neutral[800],
      secondary: isDark ? "#94A3B8" : PALETTE.neutral[500],
    },
    divider: isDark ? PALETTE.navy.divider : alpha(PALETTE.neutral[300], 0.5),
  };

  const baseTheme = createTheme({
    palette: themePalette,
    typography: TYPOGRAPHY,
    shape: { borderRadius: 16 },
  });

  return createTheme(baseTheme, {
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: "none",
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.25)"
              : "0 8px 24px rgba(149, 157, 165, 0.12)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: isDark
                ? "0 12px 40px rgba(0, 0, 0, 0.4)"
                : "0 12px 28px rgba(149, 157, 165, 0.2)",
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { 
          disableElevation: true, // Giữ nguyên để tắt bóng xám mặc định xấu xí của MUI
        },
        styleOverrides: {
          root: {
            borderRadius: 14, // Bo cong mềm mại hơn (chuẩn Soft UI)
            padding: "10px 24px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Hiệu ứng chuyển động cực mượt
            "&:active": {
              transform: "scale(0.96)", 
            },
          },
          containedPrimary: {
            backgroundColor: baseTheme.palette.primary.main,
            color: "#ffffff",
            boxShadow: `0 6px 16px ${alpha(baseTheme.palette.primary.main, 0.25)}`,
            "&:hover": {
              backgroundColor: baseTheme.palette.primary.dark,
              boxShadow: `0 8px 24px ${alpha(baseTheme.palette.primary.main, 0.4)}`,
              transform: "translateY(-2px)", 
            },
          },
          outlinedPrimary: {
            border: `2px solid ${alpha(baseTheme.palette.primary.main, 0.2)}`, 
            color: baseTheme.palette.primary.main,
            "&:hover": {
              border: `2px solid ${baseTheme.palette.primary.main}`,
              backgroundColor: alpha(baseTheme.palette.primary.main, 0.05),
              transform: "translateY(-2px)",
            },
          },
          textPrimary: {
            "&:hover": {
              backgroundColor: alpha(baseTheme.palette.primary.main, 0.08),
            },
          },
          sizeLarge: {
            padding: "14px 32px",
            fontSize: "1.1rem",
            borderRadius: 16, 
          },
          sizeSmall: {
            padding: "6px 16px",
            fontSize: "0.875rem",
            borderRadius: 10,
          }
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: "none",
            boxShadow: isDark 
              ? "4px 0 24px rgba(0,0,0,0.2)" 
              : "4px 0 24px rgba(149, 157, 165, 0.08)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: "none",
            boxShadow: isDark 
              ? "0 4px 24px rgba(0,0,0,0.2)" 
              : "0 4px 24px rgba(149, 157, 165, 0.08)",
          },
        },
      },
    },
  });
};