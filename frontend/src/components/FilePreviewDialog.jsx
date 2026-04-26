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
import DescriptionIcon from "@mui/icons-material/Description";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloseIcon from "@mui/icons-material/Close";

// Import Handlers (Assuming these are in your /handlers folder)
import ImageHandler from "./handlers/ImageHandler";
import PdfHandler from "./handlers/PdfHandler";
import VideoHandler from "./handlers/VideoHandler";
import DefaultHandler from "./handlers/DefaultHandler";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"; // Update port if needed

const FilePreviewDialog = ({ open, onClose, fileData }) => {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const chunksRef = useRef([]);
  const abortControllerRef = useRef(null); // Replaces socketRef

  useEffect(() => {
    if (open && fileData?.did) {
      fetchAndStreamFile();
    }

    // Cleanup function when dialog closes
    return () => {
      // 1. Cancel the HTTP request if it's still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // 2. Prevent memory leaks by revoking the blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      // 3. Reset states
      chunksRef.current = [];
      setProgress(0);
      setIsDownloading(false);
      setError(null);
      setBlobUrl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fileData]);

  const fetchAndStreamFile = async () => {
    if (!fileData) return;

    setIsDownloading(true);
    setProgress(0);
    setError(null);
    chunksRef.current = [];
    
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/resources/view/${fileData.did}`, {
        method: "GET",
        signal: abortControllerRef.current.signal, // Attach the abort signal
        headers: {
          // If your API requires auth, uncomment and add your token here:
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      // Try to get total file size for accurate progress bar
      // Note: Backend must expose 'Content-Length' header for this to work perfectly.
      const contentLength = response.headers.get("content-length");
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
      let loadedSize = 0;

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Push the raw chunk (Uint8Array) directly to our array
        chunksRef.current.push(value);
        loadedSize += value.length;

        // Calculate progress if we know the total size
        if (totalSize > 0) {
          const currentProgress = Math.round((loadedSize / totalSize) * 100);
          setProgress(currentProgress);
        } else {
          // Fallback if backend doesn't send Content-Length (indeterminate state)
          // We keep it at 0 or a fake looping number, Material UI CircularProgress handles 0 well.
          setProgress(0); 
        }
      }

      // Streaming is complete, create the blob
      const blob = new Blob(chunksRef.current, { type: fileData.file_type || response.headers.get("content-type") });
      const url = URL.createObjectURL(blob);
      
      setProgress(100);
      setBlobUrl(url);

    } catch (err) {
      // Ignore Abort errors (caused by user closing the modal)
      if (err.name === "AbortError") {
        console.log("Download cancelled by user.");
      } else {
        console.error("Fetch stream error:", err);
        setError(err.message || "Lỗi tải file từ server");
      }
    } finally {
      setIsDownloading(false);
    }
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

  // --- RENDERING STRATEGY ---
  const renderFileViewer = () => {
    if (!blobUrl) return null;

    const mimeType = fileData?.file_type?.toLowerCase() || "";

    if (mimeType.includes("image")) {
      return <ImageHandler url={blobUrl} title={fileData.title} />;
    }
    
    if (mimeType.includes("video")) {
      return <VideoHandler url={blobUrl} title={fileData.title} />;
    }

    if (mimeType.includes("pdf")) {
      return <PdfHandler url={blobUrl} title={fileData.title} />;
    }

    return <DefaultHandler />;
  };

  if (!fileData) return null;

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
            {/* If progress is 0 (missing content-length), switch to indeterminate spinner */}
            <CircularProgress variant={progress > 0 ? "determinate" : "indeterminate"} value={progress} size={60} />
            <Typography mt={2}>
              Đang tải dữ liệu... {progress > 0 ? `${progress}%` : "(Đang xử lý)"}
            </Typography>
            {progress > 0 && (
              <Box sx={{ width: "50%", mx: "auto", mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}
          </Box>
        )}

        {!isDownloading && error && (
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "error.main" }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!isDownloading && !error && blobUrl && (
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", overflow: "hidden", bgcolor: "#eee", height: "100%" }}>
            {renderFileViewer()}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!isDownloading && blobUrl && (
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