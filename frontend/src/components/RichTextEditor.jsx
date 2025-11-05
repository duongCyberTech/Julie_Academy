import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import katex from "katex";
import "katex/dist/katex.min.css";
window.katex = katex;

import {
  styled,
  Box,
  FormControl,
  InputLabel,
  FormHelperText,
  alpha,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Tooltip,
} from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";

const EditorWrapper = styled(Box)(({ theme, error }) => ({
  overflow: "visible",
  position: "relative",
  border: `1px solid ${
    error ? theme.palette.error.main : theme.palette.divider
  }`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  transition: theme.transitions.create(["border-color", "box-shadow"]),
  "&:hover": {
    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
  },
  "&.Mui-focused": {
    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
    borderWidth: "2px",
    margin: "-1px",
  },
  ".ql-toolbar": {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    border: "none",
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: alpha(theme.palette.action.selected, 0.05),
    position: "relative",
    zIndex: 2,
  },
  ".ql-container": {
    border: "none",
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    position: "relative",
    zIndex: 1,
  },
  ".ql-editor": {
    minHeight: "150px",
    fontFamily: theme.typography.fontFamily,
    fontSize: "1rem",
    color: theme.palette.text.primary,
  },
  ".ql-editor.ql-blank::before": {
    color: theme.palette.text.disabled,
    fontStyle: "normal",
    opacity: 1,
  },
}));

const fullModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    ["formula", { script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["clean"],
  ],
};

const minimalModules = {
  toolbar: [["bold", "italic"], ["formula"]],
};

const helpData = [
  { want: "Căn bậc hai", code: "\\sqrt{x}" },
  { want: "Căn bậc 3", code: "\\sqrt[3]{x}" },
  { want: "Phân số", code: "\\frac{1}{2}" },
  {
    want: "Hệ phương trình",
    code: "\\begin{cases} x+y=1 \\ x-y=2 \\end{cases}",
  },
  { want: "Biệt thức Delta", code: "\\Delta" },
  { want: "Góc", code: "\\angle A" },
  { want: "Độ", code: "90^\\circ" },
  { want: "Pi", code: "\\pi" },
  { want: "Cộng/trừ (±)", code: "\\pm" },
  { want: "Xấp xỉ (≈)", code: "\\approx" },
  { want: "Không bằng (≠)", code: "\\neq" },
  { want: "Nhỏ hơn hoặc bằng (≤)", code: "\\le" },
  { want: "Lớn hơn hoặc bằng (≥)", code: "\\ge" },
];

const LatexHelpDialog = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Hướng dẫn LaTeX (Toán 9)</DialogTitle>
    <DialogContent>
      <Typography gutterBottom>
        Sử dụng nút <strong>[fx]</strong> và gõ mã vào hộp thoại:
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Bạn muốn viết</strong>
              </TableCell>
              <TableCell>
                <strong>Bạn gõ (code LaTeX)</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {helpData.map((row) => (
              <TableRow key={row.want}>
                <TableCell>{row.want}</TableCell>
                <TableCell>
                  <code>{row.code}</code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DialogContent>
  </Dialog>
);

const RichTextEditor = ({
  toolbarType = "full",
  value,
  onChange,
  placeholder,
  label,
  error,
  helperText,
  ...props
}) => {
  const modules = useMemo(() => {
    if (toolbarType === "minimal") {
      return minimalModules;
    }
    return fullModules;
  }, [toolbarType]);

  const [isFocused, setIsFocused] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <FormControl error={error} fullWidth>
      {label && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: error ? "error.main" : "text.secondary",
              fontWeight: 600,
            }}
          >
            {label}
          </Typography>

          {toolbarType === "full" && (
            <Tooltip title="Hướng dẫn gõ Công thức LaTeX">
              <IconButton
                size="small"
                onClick={() => setIsHelpOpen(true)}
                sx={{ ml: 0.5 }}
              >
                <HelpOutlineIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      <EditorWrapper error={error} className={isFocused ? "Mui-focused" : ""}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </EditorWrapper>

      {helperText && (
        <FormHelperText sx={{ ml: 1.5 }}>{helperText}</FormHelperText>
      )}

      {isHelpOpen && (
        <LatexHelpDialog
          open={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      )}
    </FormControl>
  );
};

export default RichTextEditor;
