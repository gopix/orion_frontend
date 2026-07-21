
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

//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="ve-sidebar">
//         <div className="ve-logo">
//           <div className="ve-logo-mark">O</div>
//           <div className="ve-logo-text">
//             <span>ORION</span>
//             <small>Accessibility & Remediation</small>
//           </div>
//         </div>

//         <nav className="ve-nav">
//           <p className="ve-nav-label">PDF</p>
//           <div className="ve-nav-item" onClick={() => navigate("/remediate-pdf")}>
//             <span className="ve-nav-icon">🛠️</span>
//             <span>Remediate PDF</span>
//           </div>
//           <div className="ve-nav-item" onClick={() => navigate("/validate-pdf")}>
//             <span className="ve-nav-icon">✅</span>
//             <span>Validate PDF</span>
//           </div>

//           <p className="ve-nav-label" style={{ marginTop: 14 }}>EPUB</p>
//           <div className="ve-nav-item" onClick={() => navigate("/remediate-epub")}>
//             <span className="ve-nav-icon">📘</span>
//             <span>Remediate EPUB</span>
//           </div>
//           <div className="ve-nav-item active">
//             <span className="ve-nav-icon">📗</span>
//             <span>Validate EPUB</span>
//             <span className="ve-nav-dot"></span>
//           </div>

//           {userIsAdmin && (
//             <>
//               <p className="ve-nav-label" style={{ marginTop: 14 }}>MIS</p>
//               <div className="ve-nav-item" onClick={() => navigate("/mis-pdf")}>
//                 <span className="ve-nav-icon">📊</span>
//                 <span>PDF</span>
//               </div>
//               <div className="ve-nav-item" onClick={() => alert("EPUB MIS report is coming soon.")}>
//                 <span className="ve-nav-icon">📊</span>
//                 <span>EPUB</span>
//               </div>
//             </>
//           )}
//         </nav>

//         <div className="ve-sidebar-footer">
//           <div className="ve-user-section">
//             <p className="ve-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="ve-back-btn"
//               onClick={() => navigate("/")}
//               title="Back to Home"
//             >
//               ← Back
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="ve-main">
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
import { isAdmin } from "../../../utils/auth";
import "./ValidateEpub.css";

export default function ValidateEpub() {
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
    <div className="ve-page">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="ve-sidebar">
        <div className="ve-logo">
          <div className="ve-logo-mark">O</div>
          <div className="ve-logo-text">
            <span>ORION</span>
            <small>Accessibility & Remediation</small>
          </div>
        </div>

        <nav className="ve-nav">
          <p className="ve-nav-label">PDF</p>
          <div className="ve-nav-item" onClick={() => navigate("/remediate-pdf")}>
            <span className="ve-nav-icon">🛠️</span>
            <span>Remediate PDF</span>
          </div>
          <div className="ve-nav-item" onClick={() => navigate("/validate-pdf")}>
            <span className="ve-nav-icon">✅</span>
            <span>Validate PDF</span>
          </div>

          <p className="ve-nav-label" style={{ marginTop: 14 }}>EPUB</p>
          <div className="ve-nav-item" onClick={() => navigate("/remediate-epub")}>
            <span className="ve-nav-icon">📘</span>
            <span>Remediate EPUB</span>
          </div>
          <div className="ve-nav-item active">
            <span className="ve-nav-icon">📗</span>
            <span>Validate EPUB</span>
            <span className="ve-nav-dot"></span>
          </div>

          <p className="ve-nav-label" style={{ marginTop: 14 }}>PPT</p>
          <div className="ve-nav-item" onClick={() => alert("This dashboard is coming soon.")}>
            <span className="ve-nav-icon">📽️</span>
            <span>Remediate PPT</span>
          </div>
          <div className="ve-nav-item" onClick={() => alert("This dashboard is coming soon.")}>
            <span className="ve-nav-icon">📽️</span>
            <span>Validate PPT</span>
          </div>

          {userIsAdmin && (
            <>
              <p className="ve-nav-label" style={{ marginTop: 14 }}>MIS</p>
              <div className="ve-nav-item" onClick={() => navigate("/mis-pdf")}>
                <span className="ve-nav-icon">📊</span>
                <span>PDF</span>
              </div>
              <div className="ve-nav-item" onClick={() => alert("EPUB MIS report is coming soon.")}>
                <span className="ve-nav-icon">📊</span>
                <span>EPUB</span>
              </div>
            </>
          )}
        </nav>

        <div className="ve-sidebar-footer">
          <div className="ve-user-section">
            <p className="ve-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="ve-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="ve-main">
        <div className="ve-container">

          {!epubFile ? (
            <section className="ve-upload-section">
              <div className="ve-upload-wrapper">
                <div className="ve-upload-icon">📥</div>
                <h1 className="ve-upload-title">Validate EPUB</h1>
                <p className="ve-upload-desc">
                  Upload your EPUB to run accessibility validation checks
                </p>

                <div
                  className={`ve-drop-zone ${dragOver ? "ve-drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => epubInputRef.current?.click()}
                >
                  <div className="ve-drop-content">
                    <div className="ve-drop-icon">📁</div>
                    <p className="ve-drop-text">Drop your EPUB here</p>
                    <p className="ve-drop-subtext">or <strong>click to select</strong></p>
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
                  <div className="ve-error-banner">
                    <span className="ve-error-ico">⚠</span>
                    <div>
                      <p className="ve-error-ttl">Upload Failed</p>
                      <p className="ve-error-msg">{submitError}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="ve-work-section">
              <div className="ve-work-container">
                <div className="ve-file-management-section">
                  <div className="ve-fm-header">
                    <h3 className="ve-fm-title">Step 1: Upload & Configure</h3>
                  </div>

                  <div className="ve-fm-content">
                    <div className="ve-file-card">
                      <div className="ve-file-icon">📗</div>
                      <div className="ve-file-info">
                        <p className="ve-file-name">{epubFile.name}</p>
                        <p className="ve-file-size">{formatBytes(epubFile.size)}</p>
                      </div>
                      <button
                        className="ve-file-restart-btn"
                        onClick={handleRemove}
                        title="Restart validation"
                      >
                        <span className="ve-restart-icon">↻</span>
                        <span className="ve-restart-text">Restart</span>
                      </button>
                    </div>

                    <div className="ve-soon-banner">
                      <span className="ve-soon-ico">🚧</span>
                      <div>
                        <p className="ve-soon-ttl">EPUB Validation — Coming Soon</p>
                        <p className="ve-soon-msg">
                          This workflow is being finalized. EPUB accessibility
                          validation will be enabled here shortly.
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