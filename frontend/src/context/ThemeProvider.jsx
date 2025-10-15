import { createTheme, alpha } from "@mui/material/styles";
// ------------------------------------------------------------
// Thiết kế dựa trên màu xanh lam chủ đạo (primary) kết hợp cam năng động (secondary)
// và tím pastel (accent) để tạo cảm giác trẻ trung, thân thiện, cân bằng giữa học tập và sáng tạo.
// Màu trung tính (neutral) dùng làm nền và chữ, giữ giao diện nhẹ nhàng, dễ đọc.
// Hỗ trợ chế độ sáng/tối với độ tương phản cao nhưng không chói.
// Các thành phần như Button, Card có hiệu ứng chuyển màu và đổ bóng mềm để tăng chiều sâu.
// Tổng thể: phối màu hài hòa theo quy luật bổ túc nhẹ (xanh – cam) và tương đồng (xanh – tím),
// mang lại cảm giác tươi sáng, hiện đại, thân thiện với học sinh.

export const PALETTE = {
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
  primary: {
    light: "#93C5FD", // Xanh lam pastel dịu
    main: "#3B82F6", // Xanh lam trung tính
    dark: "#1E40AF", // Xanh đậm, giữ độ tương phản
    contrastText: "#FFFFFF",
  },
  secondary: {
    light: "#FED7AA", // Cam pastel
    main: "#e17319ff", // Cam sáng năng động
    dark: "#d34811ff", // Cam đậm
    contrastText: "#FFFFFF",
  },
  accent: {
    light: "#E9D5FF", // Tím pastel
    main: "#C084FC", // Tím tươi, nhấn nhẹ
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
};

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

const LIGHT_SHADOWS = [
  "none",
  "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
  "0px 1px 3px 0px rgba(0, 0, 0, 0.08), 0px 1px 2px -1px rgba(0, 0, 0, 0.08)",
  "0px 4px 6px -1px rgba(0, 0, 0, 0.08), 0px 2px 4px -2px rgba(0, 0, 0, 0.08)",
  "0px 10px 15px -3px rgba(0, 0, 0, 0.08), 0px 4px 6px -4px rgba(0, 0, 0, 0.08)",
  "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.08)",
  "0px 25px 50px -12px rgba(0, 0, 0, 0.15)",
];

const createDarkShadows = (color) => [
  "none",
  `0px 2px 4px -1px ${alpha(color, 0.1)}, 0px 4px 5px 0px ${alpha(
    color,
    0.08
  )}, 0px 1px 10px 0px ${alpha(color, 0.06)}`,
  `0px 3px 5px -1px ${alpha(color, 0.12)}, 0px 6px 10px 0px ${alpha(
    color,
    0.09
  )}, 0px 1px 18px 0px ${alpha(color, 0.07)}`,
  `0px 5px 8px -2px ${alpha(color, 0.15)}, 0px 10px 18px 1px ${alpha(
    color,
    0.1
  )}, 0px 3px 24px 2px ${alpha(color, 0.08)}`,
];

export const createAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  const palette = {
    mode,
    ...(isDark
      ? {
          primary: PALETTE.primary,
          secondary: PALETTE.secondary,
          accent: PALETTE.accent,
          neutral: PALETTE.neutral,
          background: {
            default: "#1E293B",
            paper: "#334155",
          },
          text: {
            primary: "#F3F4F6",
            secondary: "#CBD5E1",
          },
          divider: alpha(PALETTE.neutral[200], 0.1),
        }
      : {
          primary: PALETTE.primary,
          secondary: PALETTE.secondary,
          accent: PALETTE.accent,
          neutral: PALETTE.neutral,
          background: {
            default: PALETTE.neutral[50],
            paper: "#FFFFFF",
          },
          text: {
            primary: PALETTE.neutral[800],
            secondary: PALETTE.neutral[600],
          },
          divider: alpha(PALETTE.neutral[600], 0.12),
        }),
  };

  const shadows = isDark
    ? createDarkShadows(palette.primary.main)
    : LIGHT_SHADOWS;

  const baseTheme = createTheme({
    palette,
    typography: TYPOGRAPHY,
    shadows,
    shape: { borderRadius: 7 },
  });

  const componentOverrides = (theme) => ({
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
          transition:
            "transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out",
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[4],
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
          padding: "10px 22px",
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          "&:hover": {
            boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
        },
      },
    },
  });

  return createTheme(baseTheme, { components: componentOverrides(baseTheme) });
};
