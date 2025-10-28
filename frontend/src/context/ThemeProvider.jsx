import { createTheme, alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------
// Ghi chú thiết kế:
// - Màu sắc: Xanh lam (primary), Cam (secondary), Tím (accent) tạo cảm giác trẻ trung, sáng tạo.
// - Typography: Font Inter, các trọng số được định nghĩa rõ ràng.
// - Shadows: Sử dụng mảng shadows đầy đủ 25 cấp độ của MUI để tương thích với mọi component.
// - Hỗ trợ Light/Dark mode.
// ----------------------------------------------------------------------

// --- 1. BẢNG MÀU (PALETTE) ---
const PALETTE = {
  primary: {
    light: "#93C5FD",
    main: "#3B82F6",
    dark: "#1E40AF",
    contrastText: "#FFFFFF",
  },
  secondary: {
    light: "#FED7AA",
    main: "#e17319ff",
    dark: "#d34811ff",
    contrastText: "#FFFFFF",
  },
  accent: {
    light: "#E9D5FF",
    main: "#C084FC",
    dark: "#7E22CE",
    contrastText: "#1E293B",
  },
  success: {
    light: "#A7F3D0",
    main: "#10B981",
    dark: "#047857",
    contrastText: "#FFFFFF",
  },
  warning: {
    light: "#FDE68A",
    main: "#FBBF24",
    dark: "#B45309",
    contrastText: "#1E293B",
  },
  error: {
    light: "#FECACA",
    main: "#F87171",
    dark: "#B91C1C",
    contrastText: "#FFFFFF",
  },
  info: {
    light: "#BFDBFE",
    main: "#3B82F6",
    dark: "#1E3A8A",
    contrastText: "#FFFFFF",
  },
  neutral: {
    50: "#FFFFFF",
    100: "#F9FAFB",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1E293B",
    900: "#111827",
  },
};

// --- 2. KIỂU CHỮ (TYPOGRAPHY) ---
const TYPOGRAPHY = {
  fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: { fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.5px" },
  h2: { fontSize: "2.25rem", fontWeight: 700 },
  h3: { fontSize: "1.75rem", fontWeight: 600 },
  h4: { fontSize: "1.25rem", fontWeight: 600 },
  h5: { fontSize: "1.1rem", fontWeight: 600 },
  h6: { fontSize: "1rem", fontWeight: 600 },
  button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.5px" },
};

const defaultTheme = createTheme();
const SHADOWS = [...defaultTheme.shadows];

export const createAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  const palette = {
    mode,
    ...PALETTE,
    ...(isDark
      ? {
          background: {
            default: PALETTE.neutral[800],
            paper: PALETTE.neutral[700],
          },
          text: {
            primary: PALETTE.neutral[100],
            secondary: PALETTE.neutral[400],
          },
          divider: alpha(PALETTE.neutral[200], 0.1),
        }
      : {
          background: {
            default: PALETTE.neutral[100],
            paper: PALETTE.neutral[50],
          },
          text: {
            primary: PALETTE.neutral[900],
            secondary: PALETTE.neutral[600],
          },
          divider: alpha(PALETTE.neutral[600], 0.12),
        }),
  };

  const baseTheme = createTheme({
    palette,
    typography: TYPOGRAPHY,
    shadows: SHADOWS,
    shape: { borderRadius: 8 },
  });

  const componentOverrides = {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: baseTheme.shape.borderRadius,
          transition:
            "transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out",
          border: `1px solid ${baseTheme.palette.divider}`,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: baseTheme.shadows[4],
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: baseTheme.shape.borderRadius,
          padding: "10px 22px",
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${baseTheme.palette.primary.light}, ${baseTheme.palette.primary.main})`,
          "&:hover": {
            boxShadow: `0 0 15px ${alpha(baseTheme.palette.primary.main, 0.4)}`,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: baseTheme.shape.borderRadius,
          fontWeight: baseTheme.typography.fontWeightMedium,
          boxShadow: baseTheme.shadows[2],
          ...(ownerState.variant === "standard" && {
            background: alpha(
              baseTheme.palette[ownerState.severity].light,
              0.15
            ),
            color: baseTheme.palette[ownerState.severity].dark,
            borderLeft: `4px solid ${
              baseTheme.palette[ownerState.severity].main
            }`,
            ...(baseTheme.palette.mode === "dark" && {
              color: baseTheme.palette[ownerState.severity].light,
            }),
          }),
          ...(ownerState.variant === "filled" && {
            background: baseTheme.palette[ownerState.severity].main,
            border: `1px solid ${baseTheme.palette[ownerState.severity].dark}`,
            color: baseTheme.palette[ownerState.severity].contrastText,
          }),
        }),
        icon: ({ theme, ownerState }) => ({
          fontSize: "1.5rem",
          marginRight: baseTheme.spacing(1.5),
          ...(ownerState.variant === "standard" && {
            color: baseTheme.palette[ownerState.severity].main,
          }),
          ...(ownerState.variant === "filled" && {
            color: baseTheme.palette[ownerState.severity].contrastText,
          }),
        }),
        message: {
          padding: baseTheme.spacing(0.5, 0),
        },
      },
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          fontWeight: baseTheme.typography.fontWeightBold,
          marginBottom: baseTheme.spacing(0.5),
        },
      },
    },
  };

  return createTheme(baseTheme, { components: componentOverrides });
};
