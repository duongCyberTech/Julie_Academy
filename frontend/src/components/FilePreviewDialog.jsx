import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { io } from "socket.io-client";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloseIcon from "@mui/icons-material/Close";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const FilePreviewDialog = ({ open, onClose, fileData }) => {
  // --- 1. KHAI BÁO HOOKS (Luôn chạy, không được chặn bởi IF) ---
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const chunksRef = useRef([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Chỉ chạy logic khi Dialog mở VÀ có fileData hợp lệ
    if (open && fileData?.did) {
      startStreaming();
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      chunksRef.current = [];
      setProgress(0);
      setIsDownloading(false);
      setError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fileData]);

  // --- 2. LOGIC HÀM ---
  const startStreaming = () => {
    // Double check để an toàn
    if (!fileData) return;

    setIsDownloading(true);
    setProgress(0);
    setError(null);
    chunksRef.current = [];

    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🔌 Connected to socket, requesting file:", fileData.did);
      socket.emit("START_DOWNLOAD", { docsId: fileData.did, startByte: 0 });
    });

    socket.on("CHUNK", (payload) => {
      try {
        const binaryString = window.atob(payload.data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        chunksRef.current.push(bytes);
        setProgress(payload.progress);
      } catch (err) {
        console.error("Error processing chunk", err);
      }
    });

    socket.on("COMPLETE", () => {
      setIsDownloading(false);
      setProgress(100);
      try {
        const blob = new Blob(chunksRef.current, { type: fileData.file_type });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        setError("Lỗi tạo file preview.");
      }
    });

    socket.on("ERROR", (err) => {
      console.error("Socket error:", err);
      setError(err.message || "Lỗi tải file từ server");
      setIsDownloading(false);
    });
  };

  const handleDownloadToDisk = () => {
    if (!blobUrl || !fileData) return;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileData.title || "downloaded-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 3. GUARD CLAUSE (Bây giờ mới được dùng IF) ---
  // Đặt ở đây là an toàn vì tất cả Hooks bên trên đã chạy xong.
  if (!fileData) return null;

  // --- 4. RENDER UI ---
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" keepMounted={false}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" noWrap sx={{ maxWidth: 400 }}>
            {fileData.title || "Xem tài liệu"}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ height: "70vh", p: 0, display: "flex", flexDirection: "column", bgcolor: "#f5f5f5", position: "relative" }}>
        {isDownloading && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
            <CircularProgress variant="determinate" value={progress} size={60} />
            <Typography mt={2}>Đang tải dữ liệu... {Math.round(progress)}%</Typography>
            <Box sx={{ width: "50%", mx: "auto", mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          </Box>
        )}

        {!isDownloading && error && (
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "error.main" }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!isDownloading && !error && blobUrl && (
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", overflow: "hidden", bgcolor: "#eee", height: "100%" }}>
            {fileData.file_type?.includes("image") ? (
              <img src={blobUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="preview" />
            ) : fileData.file_type?.includes("pdf") ? (
              <iframe src={blobUrl} width="100%" height="100%" style={{ border: "none" }} title="pdf-preview" />
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Typography>Không hỗ trợ xem trước định dạng này.</Typography>
                <Typography variant="caption">Vui lòng tải về máy.</Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {(!isDownloading && blobUrl) && (
          <Button variant="contained" startIcon={<CloudDownloadIcon />} onClick={handleDownloadToDisk}>
            Tải về máy
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePreviewDialog;