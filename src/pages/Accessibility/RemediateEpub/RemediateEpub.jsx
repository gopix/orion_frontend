


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

//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="re-sidebar">
//         <div className="re-logo">
//           <div className="re-logo-mark">O</div>
//           <div className="re-logo-text">
//             <span>ORION</span>
//             <small>Accessibility & Remediation</small>
//           </div>
//         </div>

//         <nav className="re-nav">
//           <p className="re-nav-label">PDF</p>
//           <div className="re-nav-item" onClick={() => navigate("/remediate-pdf")}>
//             <span className="re-nav-icon">🛠️</span>
//             <span>Remediate PDF</span>
//           </div>
//           <div className="re-nav-item" onClick={() => navigate("/validate-pdf")}>
//             <span className="re-nav-icon">✅</span>
//             <span>Validate PDF</span>
//           </div>

//           <p className="re-nav-label" style={{ marginTop: 14 }}>EPUB</p>
//           <div className="re-nav-item active">
//             <span className="re-nav-icon">📘</span>
//             <span>Remediate EPUB</span>
//             <span className="re-nav-dot"></span>
//           </div>
//           <div className="re-nav-item" onClick={() => navigate("/validate-epub")}>
//             <span className="re-nav-icon">📗</span>
//             <span>Validate EPUB</span>
//           </div>

//           <p className="re-nav-label" style={{ marginTop: 14 }}>PPT</p>
//           <div className="re-nav-item" onClick={() => alert("This dashboard is coming soon.")}>
//             <span className="re-nav-icon">📽️</span>
//             <span>Remediate PPT</span>
//           </div>
//           <div className="re-nav-item" onClick={() => alert("This dashboard is coming soon.")}>
//             <span className="re-nav-icon">📽️</span>
//             <span>Validate PPT</span>
//           </div>

//           {userIsAdmin && (
//             <>
//               <p className="re-nav-label" style={{ marginTop: 14 }}>MIS</p>
//               <div className="re-nav-item" onClick={() => navigate("/mis-pdf")}>
//                 <span className="re-nav-icon">📊</span>
//                 <span>PDF</span>
//               </div>
//               <div className="re-nav-item" onClick={() => alert("EPUB MIS report is coming soon.")}>
//                 <span className="re-nav-icon">📊</span>
//                 <span>EPUB</span>
//               </div>
//             </>
//           )}
//         </nav>

//         <div className="re-sidebar-footer">
//           <div className="re-user-section">
//             <p className="re-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="re-back-btn"
//               onClick={() => navigate("/")}
//               title="Back to Home"
//             >
//               ← Back
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="re-main">
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
import { isAdmin } from "../../../utils/auth";
import "./RemediateEpub.css";

export default function RemediateEpub() {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();

  const [epubFile, setEpubFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const epubInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return null;
    if (!file.name.toLowerCase().endsWith(".epub")) {
      setSubmitError("Only .epub files are supported.");
      return null;
    }
    return file;
  };

  const applyFile = (file) => {
    const valid = validateFile(file);
    if (!valid) return;
    setEpubFile(valid);
    setSubmitError("");
  };

  const handleEpubSelect = (e) => {
    const file = e.target.files[0];
    if (file) applyFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) applyFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setEpubFile(null);
    setSubmitError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="re-page">

      

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="re-main">
        <button
          className="re-back-fab"
          onClick={() => navigate("/accessibility")}
          title="Back to Accessibility"
          aria-label="Back to Accessibility"
        >
          ←
        </button>

        <div className="re-container">

          {!epubFile ? (
            <section className="re-upload-section">
              <div className="re-upload-wrapper">
                <div className="re-upload-icon">📥</div>
                <h1 className="re-upload-title">Remediate EPUB</h1>
                <p className="re-upload-desc">
                  Upload your EPUB for automated accessibility remediation
                </p>

                <div
                  className={`re-drop-zone ${dragOver ? "re-drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => epubInputRef.current?.click()}
                >
                  <div className="re-drop-content">
                    <div className="re-drop-icon">📁</div>
                    <p className="re-drop-text">Drop your EPUB here</p>
                    <p className="re-drop-subtext">or <strong>click to select</strong></p>
                  </div>
                </div>

                <input
                  ref={epubInputRef}
                  type="file"
                  accept=".epub"
                  onChange={handleEpubSelect}
                  style={{ display: "none" }}
                />

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
            </section>
          ) : (
            <section className="re-work-section">
              <div className="re-work-container">
                <div className="re-file-management-section">
                  <div className="re-fm-header">
                    <h3 className="re-fm-title">Step 1: Upload & Configure</h3>
                  </div>

                  <div className="re-fm-content">
                    <div className="re-file-card">
                      <div className="re-file-icon">📘</div>
                      <div className="re-file-info">
                        <p className="re-file-name">{epubFile.name}</p>
                        <p className="re-file-size">{formatBytes(epubFile.size)}</p>
                      </div>
                      <button
                        className="re-file-restart-btn"
                        onClick={handleRemove}
                        title="Restart remediation"
                      >
                        <span className="re-restart-icon">↻</span>
                        <span className="re-restart-text">Restart</span>
                      </button>
                    </div>

                    <div className="re-soon-banner">
                      <span className="re-soon-ico">🚧</span>
                      <div>
                        <p className="re-soon-ttl">EPUB Remediation — Coming Soon</p>
                        <p className="re-soon-msg">
                          This workflow is being finalized. EPUB accessibility
                          remediation will be enabled here shortly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}