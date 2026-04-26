import React from "react";
import { Box } from "@mui/material";

const VideoHandler = ({ url, title }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%">
      <video 
        src={url} 
        controls 
        autoPlay // Optional: starts playing automatically when loaded
        style={{ 
          maxWidth: "100%", 
          maxHeight: "100%", 
          outline: "none",
          backgroundColor: "#000" // Adds a nice cinematic background to the video boundaries
        }} 
        title={title || "video-preview"}
      >
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>
    </Box>
  );
};

export default VideoHandler;