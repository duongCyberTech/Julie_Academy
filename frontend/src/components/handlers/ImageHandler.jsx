import React from "react";

const ImageHandler = ({ url, title }) => {
  return (
    <img 
      src={url} 
      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
      alt={title || "image-preview"} 
    />
  );
};

export default ImageHandler;