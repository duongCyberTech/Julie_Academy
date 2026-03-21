import { createTheme, alpha } from "@mui/material/styles";

const PALETTE = {
  primary: { 
    main: "#38BDF8", 
    dark: "#0EA5E9", 
    light: "#7DD3FC", 
    contrastText: "#020617" 
  },
  secondary: { main: "#818CF8", light: "#C7D2FE", dark: "#4F46E5" }, 
  neutral: {
    50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0", 300: "#CBD5E1", 400: "#94A3B8",
    500: "#64748B", 600: "#475569", 700: "#334155", 800: "#1E293B", 900: "#0F172A",
  },
  midnight: {
    main: "#020617",
    paper: "#0B1426",
    border: "rgba(56, 189, 248, 0.12)", 
  }
};

const TYPOGRAPHY = {
  fontFamily: '"Inter", "Nunito", sans-serif', 
  h1: { fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.04em" },
  h2: { fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" },
  h4: { fontWeight: 700 },
  button: { textTransform: "none", fontWeight: 700 },
};

export const createAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: PALETTE.primary,
      secondary: PALETTE.secondary,
      neutral: PALETTE.neutral,
      background: {
        default: isDark ? PALETTE.midnight.main : "#FDF2F4", 
        paper: isDark ? PALETTE.midnight.paper : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F8FAFC" : PALETTE.neutral[900],
        secondary: isDark ? PALETTE.neutral[300] : PALETTE.neutral[600],
      },
      midnight: PALETTE.midnight, 
    },
    typography: TYPOGRAPHY,
    shape: { borderRadius: 12 },
    components: {
      MuiTypography: {
        styleOverrides: {
          h1: {
            color: isDark ? PALETTE.primary.main : PALETTE.neutral[900],
            textShadow: isDark ? `0 0 40px ${alpha(PALETTE.primary.main, 0.2)}` : 'none',
          },
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "12px 28px",
          },
          containedPrimary: {
            backgroundColor: isDark ? PALETTE.primary.main : PALETTE.neutral[900],
            color: isDark ? PALETTE.primary.contrastText : "#FFFFFF",
            "&:hover": {
              backgroundColor: isDark ? PALETTE.primary.light : "#000000",
              transform: "translateY(-2px)",
              boxShadow: isDark ? `0 0 20px ${alpha(PALETTE.primary.main, 0.4)}` : "0 8px 20px rgba(0,0,0,0.1)",
            },
          },
          outlinedPrimary: {
            borderColor: isDark ? alpha(PALETTE.primary.main, 0.5) : PALETTE.primary.main,
            color: isDark ? PALETTE.primary.light : PALETTE.primary.dark,
            "&:hover": {
              backgroundColor: alpha(PALETTE.primary.main, 0.08),
              borderColor: PALETTE.primary.main,
            }
          }
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? alpha("#FFFFFF", 0.04) : "#FFFFFF",
            borderRadius: "8px",
            transition: "all 0.2s ease-in-out",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? alpha(PALETTE.primary.main, 0.6) : PALETTE.neutral[400],
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: PALETTE.primary.main,
              borderWidth: "1px",
              boxShadow: isDark 
                ? `0 0 0 3px ${alpha(PALETTE.primary.main, 0.15)}` 
                : `0 0 0 3px ${alpha(PALETTE.primary.main, 0.1)}`,
            },
          },
          notchedOutline: {
            borderColor: isDark ? PALETTE.midnight.border : PALETTE.neutral[200],
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: "6px",
            margin: "4px 8px",
            "&.Mui-selected": {
              backgroundColor: alpha(PALETTE.primary.main, 0.15),
              color: isDark ? PALETTE.primary.main : PALETTE.primary.dark,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: alpha(PALETTE.primary.main, 0.25),
              }
            }
          }
        }
      }
    },
  });
};