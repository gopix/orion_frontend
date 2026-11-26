




// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { isAdmin } from "../../../utils/auth";
// import "./ValidateEpub.css";

// export default function ValidateEpub() {
//   const navigate = useNavigate();
//   const userIsAdmin = isAdmin();

//   const [epubFile, setEpubFile] = useState(null);
//   const [dragOver, setDragOver] = useState(false);
//   const [submitError, setSubmitError] = useState("");

//   const epubInputRef = useRef(null);

//   const validateFile = (file) => {
//     if (!file) return null;
//     if (!file.name.toLowerCase().endsWith(".epub")) {
//       setSubmitError("Only .epub files are supported.");
//       return null;
//     }
//     return file;
//   };

//   const applyFile = (file) => {
//     const valid = validateFile(file);
//     if (!valid) return;
//     setEpubFile(valid);
//     setSubmitError("");
//   };

//   const handleEpubSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) applyFile(file);
//     e.target.value = "";
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (file) applyFile(file);
//   };

//   const handleRemove = (e) => {
//     e.stopPropagation();
//     setEpubFile(null);
//     setSubmitError("");
//   };

//   const formatBytes = (bytes) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   return (
//     <div className="ve-page">

      

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="ve-main">
//         <button
//           className="ve-back-fab"
//           onClick={() => navigate("/accessibility")}
//           title="Back to Accessibility"
//           aria-label="Back to Accessibility"
//         >
//           ←
//         </button>

//         <div className="ve-container">

//           {!epubFile ? (
//             <section className="ve-upload-section">
//               <div className="ve-upload-wrapper">
//                 <div className="ve-upload-icon">📥</div>
//                 <h1 className="ve-upload-title">Validate EPUB</h1>
//                 <p className="ve-upload-desc">
//                   Upload your EPUB to run accessibility validation checks
//                 </p>

//                 <div
//                   className={`ve-drop-zone ${dragOver ? "ve-drag-over" : ""}`}
//                   onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//                   onDragLeave={() => setDragOver(false)}
//                   onDrop={handleDrop}
//                   onClick={() => epubInputRef.current?.click()}
//                 >
//                   <div className="ve-drop-content">
//                     <div className="ve-drop-icon">📁</div>
//                     <p className="ve-drop-text">Drop your EPUB here</p>
//                     <p className="ve-drop-subtext">or <strong>click to select</strong></p>
//                   </div>
//                 </div>

//                 <input
//                   ref={epubInputRef}
//                   type="file"
//                   accept=".epub"
//                   onChange={handleEpubSelect}
//                   style={{ display: "none" }}
//                 />

//                 {submitError && (
//                   <div className="ve-error-banner">
//                     <span className="ve-error-ico">⚠</span>
//                     <div>
//                       <p className="ve-error-ttl">Upload Failed</p>
//                       <p className="ve-error-msg">{submitError}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </section>
//           ) : (
//             <section className="ve-work-section">
//               <div className="ve-work-container">
//                 <div className="ve-file-management-section">
//                   <div className="ve-fm-header">
//                     <h3 className="ve-fm-title">Step 1: Upload & Configure</h3>
//                   </div>

//                   <div className="ve-fm-content">
//                     <div className="ve-file-card">
//                       <div className="ve-file-icon">📗</div>
//                       <div className="ve-file-info">
//                         <p className="ve-file-name">{epubFile.name}</p>
//                         <p className="ve-file-size">{formatBytes(epubFile.size)}</p>
//                       </div>
//                       <button
//                         className="ve-file-restart-btn"
//                         onClick={handleRemove}
//                         title="Restart validation"
//                       >
//                         <span className="ve-restart-icon">↻</span>
//                         <span className="ve-restart-text">Restart</span>
//                       </button>
//                     </div>

//                     <div className="ve-soon-banner">
//                       <span className="ve-soon-ico">🚧</span>
//                       <div>
//                         <p className="ve-soon-ttl">EPUB Validation — Coming Soon</p>
//                         <p className="ve-soon-msg">
//                           This workflow is being finalized. EPUB accessibility
//                           validation will be enabled here shortly.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           )}

//         </div>
//       </main>
//     </div>
//   );
// }

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ValidateEpub.css";

export default function ValidateEpub() {
  const navigate = useNavigate();

  const [epubFile, setEpubFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSoon, setShowSoon] = useState(false);

  const epubInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const applyFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".epub")) {
      setSubmitError("Only .epub files are supported.");
      return;
    }
    setEpubFile(file);
    setSubmitError("");
    setShowSoon(false);
  };

  const handleEpubSelect = (e) => {
    applyFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setEpubFile(null);
    setSubmitError("");
    setShowSoon(false);
  };

  const handleSubmit = () => {
    if (!epubFile) {
      setSubmitError("Please upload an EPUB file first.");
      return;
    }
    setSubmitError("");
    setShowSoon(true);
  };

  return (
    <div className="ve-page">
      <main className="ve-main">

        {/* Topbar */}
        <div className="ve-topbar">
          <div className="ve-topbar-left">
            <button
              className="ve-back-fab"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
              aria-label="Back to Accessibility"
            >
              ←
            </button>
            <div className="ve-breadcrumb">
              <span className="ve-bc-root">Accessibility</span>
              <span className="ve-bc-sep">›</span>
              <span className="ve-bc-current">Validate EPUB</span>
            </div>
          </div>
          <div className="ve-topbar-right">
            {epubFile && (
              <div className="ve-status-chip chip-ready">
                <span className="ve-chip-dot dot-green"></span>
                EPUB Ready
              </div>
            )}
          </div>
        </div>

        <div className="ve-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="ve-step-card">
            <div className="ve-step-badge">
              <span>1</span>
            </div>
            <div className="ve-step-body">
              <div className="ve-step-head">
                <div>
                  <h2 className="ve-step-title">Upload EPUB</h2>
                </div>
              </div>

              <input ref={epubInputRef} type="file" accept=".epub" style={{ display: "none" }} onChange={handleEpubSelect} />

              <div className="ve-upload-row">
                {/* Drop zone */}
                <div
                  className={`ve-dropzone ${dragOver ? "drag-over" : ""} ${epubFile ? "has-file" : ""}`}
                  onClick={() => epubInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {epubFile ? (
                    <div className="ve-file-preview">
                      <div className="ve-file-pdf-icon">
                        <span>EPUB</span>
                      </div>
                      <div className="ve-file-info">
                        <span className="ve-file-name">{epubFile.name}</span>
                        <span className="ve-file-size">{formatBytes(epubFile.size)}</span>
                        <span className="ve-file-ready">Ready to validate</span>
                      </div>
                      <button className="ve-remove-btn" onClick={handleRemove} title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="ve-dropzone-content">
                      <div className="ve-drop-cloud">☁</div>
                      <p className="ve-drop-title">Drag &amp; drop your EPUB here</p>
                      <p className="ve-drop-hint">or <span className="ve-drop-link">click to browse</span></p>
                      <p className="ve-drop-note">Only .epub files</p>
                    </div>
                  )}
                </div>

                {/* Start button */}
                <div className="ve-run-actions">
                  <button
                    className="ve-run-btn"
                    onClick={handleSubmit}
                    disabled={!epubFile}
                  >
                    <span className="ve-run-rocket">🚀</span> Run Accessibility Checks
                  </button>
                  {submitError && (
                    <div className="ve-error-banner">
                      <span className="ve-error-ico">⚠</span>
                      <div>
                        <p className="ve-error-ttl">Upload Failed</p>
                        <p className="ve-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Result ══ */}
          <section className={`ve-step-card ${!showSoon ? "ve-step-locked" : ""}`}>
            <div className="ve-step-badge ve-step-badge--2">
              <span>2</span>
            </div>
            <div className="ve-step-body">
              <div className="ve-step-head">
                <div>
                  <h2 className="ve-step-title">Validation Report</h2>
                </div>
              </div>

              {showSoon ? (
                <div className="ve-soon-banner">
                  <span className="ve-soon-ico">🚧</span>
                  <div>
                    <p className="ve-soon-ttl">EPUB Validation — Coming Soon</p>
                    <p className="ve-soon-msg">
                      This workflow is being finalized. EPUB accessibility validation will be enabled here shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="ve-empty-state">
                  <div className="ve-empty-illustration">
                    <div className="ve-empty-doc">
                      <div className="ve-empty-line"></div>
                      <div className="ve-empty-line short"></div>
                      <div className="ve-empty-line"></div>
                      <div className="ve-empty-line medium"></div>
                    </div>
                  </div>
                  <p className="ve-empty-title">No results yet</p>
                  <p className="ve-empty-sub">Upload an EPUB and run validation to see the report here.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}