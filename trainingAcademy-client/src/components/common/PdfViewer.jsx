import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF worker
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
      }}
    >
      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setPageNumber((p) => p - 1)}
          disabled={pageNumber <= 1}
        >
          Prev
        </button>

        <span>
          {pageNumber} / {numPages}
        </span>

        <button
          onClick={() => setPageNumber((p) => p + 1)}
          disabled={pageNumber >= numPages}
        >
          Next
        </button>
      </div>

      {/* PDF */}
      <div
        style={{
          background: "#fff",
          padding: 10,
          borderRadius: 10,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p>Loading PDF...</p>}
          error={<p>Failed to load PDF</p>}
        >
          <Page
            pageNumber={pageNumber}
            width={600}
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;