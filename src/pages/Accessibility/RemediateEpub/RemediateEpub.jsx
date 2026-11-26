


// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { isAdmin } from "../../../utils/auth";
// import "./RemediateEpub.css";

// export default function RemediateEpub() {
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
//     <div className="re-page">

      

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="re-main">
//         <button
//           className="re-back-fab"
//           onClick={() => navigate("/accessibility")}
//           title="Back to Accessibility"
//           aria-label="Back to Accessibility"
//         >
//           ←
//         </button>

//         <div className="re-container">

//           {!epubFile ? (
//             <section className="re-upload-section">
//               <div className="re-upload-wrapper">
//                 <div className="re-upload-icon">📥</div>
//                 <h1 className="re-upload-title">Remediate EPUB</h1>
//                 <p className="re-upload-desc">
//                   Upload your EPUB for automated accessibility remediation
//                 </p>

//                 <div
//                   className={`re-drop-zone ${dragOver ? "re-drag-over" : ""}`}
//                   onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//                   onDragLeave={() => setDragOver(false)}
//                   onDrop={handleDrop}
//                   onClick={() => epubInputRef.current?.click()}
//                 >
//                   <div className="re-drop-content">
//                     <div className="re-drop-icon">📁</div>
//                     <p className="re-drop-text">Drop your EPUB here</p>
//                     <p className="re-drop-subtext">or <strong>click to select</strong></p>
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
//                   <div className="re-error-banner">
//                     <span className="re-error-ico">⚠</span>
//                     <div>
//                       <p className="re-error-ttl">Upload Failed</p>
//                       <p className="re-error-msg">{submitError}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </section>
//           ) : (
//             <section className="re-work-section">
//               <div className="re-work-container">
//                 <div className="re-file-management-section">
//                   <div className="re-fm-header">
//                     <h3 className="re-fm-title">Step 1: Upload & Configure</h3>
//                   </div>

//                   <div className="re-fm-content">
//                     <div className="re-file-card">
//                       <div className="re-file-icon">📘</div>
//                       <div className="re-file-info">
//                         <p className="re-file-name">{epubFile.name}</p>
//                         <p className="re-file-size">{formatBytes(epubFile.size)}</p>
//                       </div>
//                       <button
//                         className="re-file-restart-btn"
//                         onClick={handleRemove}
//                         title="Restart remediation"
//                       >
//                         <span className="re-restart-icon">↻</span>
//                         <span className="re-restart-text">Restart</span>
//                       </button>
//                     </div>

//                     <div className="re-soon-banner">
//                       <span className="re-soon-ico">🚧</span>
//                       <div>
//                         <p className="re-soon-ttl">EPUB Remediation — Coming Soon</p>
//                         <p className="re-soon-msg">
//                           This workflow is being finalized. EPUB accessibility
//                           remediation will be enabled here shortly.
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
import "./RemediateEpub.css";

export default function RemediateEpub() {
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
    <div className="re-page">
      <main className="re-main">

        {/* Topbar */}
        <div className="re-topbar">
          <div className="re-topbar-left">
            <button
              className="re-back-fab"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
              aria-label="Back to Accessibility"
            >
              ←
            </button>
            <div className="re-breadcrumb">
              <span className="re-bc-root">Accessibility</span>
              <span className="re-bc-sep">›</span>
              <span className="re-bc-current">Remediate EPUB</span>
            </div>
          </div>
          <div className="re-topbar-right">
            {epubFile && (
              <div className="re-status-chip chip-ready">
                <span className="re-chip-dot dot-green"></span>
                EPUB Ready
              </div>
            )}
          </div>
        </div>

        <div className="re-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="re-step-card">
            <div className="re-step-badge">
              <span>1</span>
            </div>
            <div className="re-step-body">
              <div className="re-step-head">
                <div>
                  <h2 className="re-step-title">Upload EPUB</h2>
                </div>
              </div>

              <input ref={epubInputRef} type="file" accept=".epub" style={{ display: "none" }} onChange={handleEpubSelect} />

              <div className="re-upload-row">
                {/* Drop zone */}
                <div
                  className={`re-dropzone ${dragOver ? "drag-over" : ""} ${epubFile ? "has-file" : ""}`}
                  onClick={() => epubInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {epubFile ? (
                    <div className="re-file-preview">
                      <div className="re-file-pdf-icon">
                        <span>EPUB</span>
                      </div>
                      <div className="re-file-info">
                        <span className="re-file-name">{epubFile.name}</span>
                        <span className="re-file-size">{formatBytes(epubFile.size)}</span>
                        <span className="re-file-ready">Ready to remediate</span>
                      </div>
                      <button className="re-remove-btn" onClick={handleRemove} title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="re-dropzone-content">
                      <div className="re-drop-cloud">☁</div>
                      <p className="re-drop-title">Drag &amp; drop your EPUB here</p>
                      <p className="re-drop-hint">or <span className="re-drop-link">click to browse</span></p>
                      <p className="re-drop-note">Only .epub files</p>
                    </div>
                  )}
                </div>

                {/* Start button */}
                <div className="re-run-actions">
                  <button
                    className="re-run-btn"
                    onClick={handleSubmit}
                    disabled={!epubFile}
                  >
                    <span className="re-run-rocket">🛠️</span> Start Remediation
                  </button>
                  {submitError && (
                    <div className="re-error-banner">
                      <span className="re-error-ico">⚠</span>
                      <div>
                        <p className="re-error-ttl">Upload Failed</p>
                        <p className="re-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Result ══ */}
          <section className={`re-step-card ${!showSoon ? "re-step-locked" : ""}`}>
            <div className="re-step-badge re-step-badge--2">
              <span>2</span>
            </div>
            <div className="re-step-body">
              <div className="re-step-head">
                <div>
                  <h2 className="re-step-title">Remediation Result</h2>
                </div>
              </div>

              {showSoon ? (
                <div className="re-soon-banner">
                  <span className="re-soon-ico">🚧</span>
                  <div>
                    <p className="re-soon-ttl">EPUB Remediation — Coming Soon</p>
                    <p className="re-soon-msg">
                      This workflow is being finalized. EPUB accessibility remediation will be enabled here shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="re-empty-state">
                  <div className="re-empty-illustration">
                    <div className="re-empty-doc">
                      <div className="re-empty-line"></div>
                      <div className="re-empty-line short"></div>
                      <div className="re-empty-line"></div>
                      <div className="re-empty-line medium"></div>
                    </div>
                  </div>
                  <p className="re-empty-title">No active job yet</p>
                  <p className="re-empty-sub">Upload an EPUB and start remediation to see live results here.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}