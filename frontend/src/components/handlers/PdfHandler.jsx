import React from "react";

const PdfHandler = ({ url, title }) => {
  return (
    <iframe 
      src={url} 
      width="100%" 
      height="100%" 
      style={{ border: "none" }} 
      title={title || "pdf-preview"} 
    />
  );
};

export default PdfHandler;