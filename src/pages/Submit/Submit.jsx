// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Submit.css";

// export default function Submit() {
//   const navigate = useNavigate();

//   const [docFile, setDocFile] = useState(null);
//   const [dragOver, setDragOver] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [validationResult, setValidationResult] = useState(null);

//   const docInputRef = useRef(null);

//   const validateFile = (file) => {
//     if (!file) return null;
//     const validTypes = [".doc", ".docx", ".pdf"];
//     const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
//     if (!isValid) {
//       setUploadError("Only .doc, .docx, and .pdf files are supported.");
//       return null;
//     }
//     if (file.size > 50 * 1024 * 1024) {
//       setUploadError("File exceeds the 50 MB limit. Please upload a smaller file.");
//       return null;
//     }
//     return file;
//   };

//   const applyFile = (file) => {
//     const valid = validateFile(file);
//     if (!valid) return;
//     setDocFile(valid);
//     setUploadError("");
//     setValidationResult(null);
//   };

//   const handleFileSelect = (e) => {
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
//     setDocFile(null);
//     setUploadError("");
//     setValidationResult(null);
//   };

//   const formatBytes = (bytes) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   const handleValidate = () => {
//     if (!docFile) {
//       setUploadError("Please upload a file first.");
//       return;
//     }
//     // Simulate validation
//     setValidationResult({
//       status: "success",
//       message: "Validation completed successfully",
//       metrics: {
//         originality: 98,
//         compliance: 95,
//         readability: 92,
//         formatting: 87
//       },
//       issues: [
//         { type: "warning", text: "Document contains 3 inconsistent formatting styles" },
//         { type: "warning", text: "Some references are not properly cited" }
//       ]
//     });
//   };

//   return (
//     <div className="submit-page">
//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="submit-sidebar">
//         <div className="submit-logo">
//           <div className="submit-logo-mark">O</div>
//           <div className="submit-logo-text">
//             <span>ORION</span>
//             <small>Pre-Editorial Validation</small>
//           </div>
//         </div>

//         <nav className="submit-nav">
//           <p className="submit-nav-label">WORKSPACE</p>
//           <div className="submit-nav-item active">
//             <span className="submit-nav-icon">📑</span>
//             <span>Submit+</span>
//             <span className="submit-nav-dot"></span>
//           </div>
//           <div className="submit-nav-item" onClick={() => navigate("/editor")}>
//             <span className="submit-nav-icon">📝</span>
//             <span>Editor+</span>
//           </div>
//           <div className="submit-nav-item" onClick={() => navigate("/remediate-pdf")}>
//             <span className="submit-nav-icon">🔧</span>
//             <span>Accessibility</span>
//           </div>
//         </nav>

//         <div className="submit-sidebar-footer">
//           <button className="submit-help-btn">
//             <span>?</span>
//           </button>
//           <p className="submit-help-text">Need help?</p>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="submit-main">
//         <div className="submit-container">
//           {!docFile ? (
//             <section className="submit-upload-section">
//               <div className="submit-upload-wrapper">
//                 <div className="submit-upload-icon">📤</div>
//                 <h1 className="submit-upload-title">Submit Document for Validation</h1>
//                 <p className="submit-upload-desc">
//                   Upload your manuscript or document for pre-editorial validation
//                 </p>
//                 <p className="submit-upload-subdesc">
//                   Maximum file size: 50 MB. Supports .doc, .docx, .pdf files.
//                 </p>

//                 <div
//                   className={`submit-drop-zone ${dragOver ? "submit-drag-over" : ""}`}
//                   onDragOver={() => setDragOver(true)}
//                   onDragLeave={() => setDragOver(false)}
//                   onDrop={handleDrop}
//                   onClick={() => docInputRef.current?.click()}
//                 >
//                   <div className="submit-drop-content">
//                     <div className="submit-drop-icon">📁</div>
//                     <p className="submit-drop-text">Drop your document here</p>
//                     <p className="submit-drop-subtext">or <strong>click to select</strong></p>
//                   </div>
//                 </div>

//                 <input
//                   ref={docInputRef}
//                   type="file"
//                   accept=".doc,.docx,.pdf"
//                   onChange={handleFileSelect}
//                   style={{ display: "none" }}
//                 />

//                 {uploadError && (
//                   <div className="submit-error-banner">
//                     <span className="submit-error-ico">⚠</span>
//                     <div>
//                       <p className="submit-error-ttl">Upload Failed</p>
//                       <p className="submit-error-msg">{uploadError}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </section>
//           ) : (
//             <section className="submit-work-section">
//               <div className="submit-work-container">
//                 <div className="submit-file-management-section">
//                   <div className="submit-fm-header">
//                     <h3 className="submit-fm-title">Step 1: Document Analysis</h3>
//                   </div>

//                   {docFile && (
//                     <div className="submit-fm-content">
//                       <div className="submit-file-card">
//                         <div className="submit-file-icon">📄</div>
//                         <div className="submit-file-info">
//                           <p className="submit-file-name">{docFile.name}</p>
//                           <p className="submit-file-size">{formatBytes(docFile.size)}</p>
//                         </div>
//                         <button
//                           className="submit-file-remove"
//                           onClick={handleRemove}
//                           title="Remove file"
//                         >
//                           ✕
//                         </button>
//                       </div>

//                       <button
//                         className="submit-btn"
//                         onClick={handleValidate}
//                       >
//                         <span className="submit-btn-icon">✓</span>
//                         Validate Document
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {validationResult && (
//                   <section className="submit-results-section">
//                     <div className="submit-results-header">
//                       <h3 className="submit-results-title">Validation Results</h3>
//                       <p className="submit-results-desc">
//                         Pre-editorial validation analysis complete
//                       </p>
//                     </div>

//                     {validationResult.status === "success" && (
//                       <div className="submit-success-banner">
//                         <span className="submit-banner-icon">✓</span>
//                         <div className="submit-banner-content">
//                           <p className="submit-banner-title">Validation Complete</p>
//                           <p className="submit-banner-message">{validationResult.message}</p>
//                         </div>
//                       </div>
//                     )}

//                     <div className="submit-metrics-section">
//                       <h4 className="submit-metrics-title">Quality Metrics</h4>
//                       <div className="submit-metrics-grid">
//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Originality</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.originality}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.originality}%</div>
//                         </div>

//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Compliance</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.compliance}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.compliance}%</div>
//                         </div>

//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Readability</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.readability}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.readability}%</div>
//                         </div>

//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Formatting</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.formatting}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.formatting}%</div>
//                         </div>
//                       </div>
//                     </div>

//                     {validationResult.issues && validationResult.issues.length > 0 && (
//                       <div className="submit-issues-section">
//                         <h4 className="submit-issues-title">Found Issues</h4>
//                         <div className="submit-issues-list">
//                           {validationResult.issues.map((issue, idx) => (
//                             <div key={idx} className={`submit-issue-item submit-issue-${issue.type}`}>
//                               <span className="submit-issue-icon">⚠️</span>
//                               <p className="submit-issue-text">{issue.text}</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     <div className="submit-action-row">
//                       <button 
//                         className="submit-action-btn submit-action-primary"
//                         onClick={() => setValidationResult(null)}
//                       >
//                         <span className="submit-btn-icon">🔄</span> Validate Another
//                       </button>
//                       <button 
//                         className="submit-action-btn submit-action-secondary"
//                         onClick={() => setDocFile(null)}
//                       >
//                         <span className="submit-btn-icon">✕</span> Close
//                       </button>
//                     </div>
//                   </section>
//                 )}
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
import "./Submit.css";

export default function Submit() {
  const navigate = useNavigate();

  const [docFile, setDocFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [validationResult, setValidationResult] = useState(null);

  const docInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return null;
    const validTypes = [".doc", ".docx", ".pdf"];
    const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
    if (!isValid) {
      setUploadError("Only .doc, .docx, and .pdf files are supported.");
      return null;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File exceeds the 50 MB limit. Please upload a smaller file.");
      return null;
    }
    return file;
  };

  const applyFile = (file) => {
    const valid = validateFile(file);
    if (!valid) return;
    setDocFile(valid);
    setUploadError("");
    setValidationResult(null);
  };

  const handleFileSelect = (e) => {
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
    setDocFile(null);
    setUploadError("");
    setValidationResult(null);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleValidate = () => {
    if (!docFile) {
      setUploadError("Please upload a file first.");
      return;
    }
    // Simulate validation
    setValidationResult({
      status: "success",
      message: "Validation completed successfully",
      metrics: {
        originality: 98,
        compliance: 95,
        readability: 92,
        formatting: 87
      },
      issues: [
        { type: "warning", text: "Document contains 3 inconsistent formatting styles" },
        { type: "warning", text: "Some references are not properly cited" }
      ]
    });
  };

  return (
    <div className="submit-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="submit-sidebar">
        <div className="submit-logo">
          <div className="submit-logo-mark">O</div>
          <div className="submit-logo-text">
            <span>ORION</span>
            <small>Pre-Editorial Validation</small>
          </div>
        </div>

        <nav className="submit-nav">
          <p className="submit-nav-label">WORKSPACE</p>
          <div className="submit-nav-item active">
            <span className="submit-nav-icon">📑</span>
            <span>Submit+</span>
            <span className="submit-nav-dot"></span>
          </div>
          <div className="submit-nav-item" onClick={() => navigate("/editor")}>
            <span className="submit-nav-icon">📝</span>
            <span>Editor+</span>
          </div>
          <div className="submit-nav-item" onClick={() => navigate("/remediate-pdf")}>
            <span className="submit-nav-icon">🔧</span>
            <span>Accessibility</span>
          </div>
        </nav>

        <div className="submit-sidebar-footer">
          <div className="submit-user-section">
            <p className="submit-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button 
              className="submit-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="submit-main">
        <div className="submit-container">
          {!docFile ? (
            <section className="submit-upload-section">
              <div className="submit-upload-wrapper">
                <div className="submit-upload-icon">📤</div>
                <h1 className="submit-upload-title">Submit Document for Validation</h1>
                <p className="submit-upload-desc">
                  Upload your manuscript or document for pre-editorial validation
                </p>
                <p className="submit-upload-subdesc">
                  Maximum file size: 50 MB. Supports .doc, .docx, .pdf files.
                </p>

                <div
                  className={`submit-drop-zone ${dragOver ? "submit-drag-over" : ""}`}
                  onDragOver={() => setDragOver(true)}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => docInputRef.current?.click()}
                >
                  <div className="submit-drop-content">
                    <div className="submit-drop-icon">📁</div>
                    <p className="submit-drop-text">Drop your document here</p>
                    <p className="submit-drop-subtext">or <strong>click to select</strong></p>
                  </div>
                </div>

                <input
                  ref={docInputRef}
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                {uploadError && (
                  <div className="submit-error-banner">
                    <span className="submit-error-ico">⚠</span>
                    <div>
                      <p className="submit-error-ttl">Upload Failed</p>
                      <p className="submit-error-msg">{uploadError}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="submit-work-section">
              <div className="submit-work-container">
                <div className="submit-file-management-section">
                  <div className="submit-fm-header">
                    <h3 className="submit-fm-title">Step 1: Document Analysis</h3>
                  </div>

                  {docFile && (
                    <div className="submit-fm-content">
                      <div className="submit-file-card">
                        <div className="submit-file-icon">📄</div>
                        <div className="submit-file-info">
                          <p className="submit-file-name">{docFile.name}</p>
                          <p className="submit-file-size">{formatBytes(docFile.size)}</p>
                        </div>
                        <button
                          className="submit-file-remove"
                          onClick={handleRemove}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>

                      <button
                        className="submit-btn"
                        onClick={handleValidate}
                      >
                        <span className="submit-btn-icon">✓</span>
                        Validate Document
                      </button>
                    </div>
                  )}
                </div>

                {validationResult && (
                  <section className="submit-results-section">
                    <div className="submit-results-header">
                      <h3 className="submit-results-title">Validation Results</h3>
                      <p className="submit-results-desc">
                        Pre-editorial validation analysis complete
                      </p>
                    </div>

                    {validationResult.status === "success" && (
                      <div className="submit-success-banner">
                        <span className="submit-banner-icon">✓</span>
                        <div className="submit-banner-content">
                          <p className="submit-banner-title">Validation Complete</p>
                          <p className="submit-banner-message">{validationResult.message}</p>
                        </div>
                      </div>
                    )}

                    <div className="submit-metrics-section">
                      <h4 className="submit-metrics-title">Quality Metrics</h4>
                      <div className="submit-metrics-grid">
                        <div className="submit-metric-card">
                          <div className="submit-metric-label">Originality</div>
                          <div className="submit-metric-bar">
                            <div 
                              className="submit-metric-fill" 
                              style={{ width: `${validationResult.metrics.originality}%` }}
                            ></div>
                          </div>
                          <div className="submit-metric-value">{validationResult.metrics.originality}%</div>
                        </div>

                        <div className="submit-metric-card">
                          <div className="submit-metric-label">Compliance</div>
                          <div className="submit-metric-bar">
                            <div 
                              className="submit-metric-fill" 
                              style={{ width: `${validationResult.metrics.compliance}%` }}
                            ></div>
                          </div>
                          <div className="submit-metric-value">{validationResult.metrics.compliance}%</div>
                        </div>

                        <div className="submit-metric-card">
                          <div className="submit-metric-label">Readability</div>
                          <div className="submit-metric-bar">
                            <div 
                              className="submit-metric-fill" 
                              style={{ width: `${validationResult.metrics.readability}%` }}
                            ></div>
                          </div>
                          <div className="submit-metric-value">{validationResult.metrics.readability}%</div>
                        </div>

                        <div className="submit-metric-card">
                          <div className="submit-metric-label">Formatting</div>
                          <div className="submit-metric-bar">
                            <div 
                              className="submit-metric-fill" 
                              style={{ width: `${validationResult.metrics.formatting}%` }}
                            ></div>
                          </div>
                          <div className="submit-metric-value">{validationResult.metrics.formatting}%</div>
                        </div>
                      </div>
                    </div>

                    {validationResult.issues && validationResult.issues.length > 0 && (
                      <div className="submit-issues-section">
                        <h4 className="submit-issues-title">Found Issues</h4>
                        <div className="submit-issues-list">
                          {validationResult.issues.map((issue, idx) => (
                            <div key={idx} className={`submit-issue-item submit-issue-${issue.type}`}>
                              <span className="submit-issue-icon">⚠️</span>
                              <p className="submit-issue-text">{issue.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="submit-action-row">
                      <button 
                        className="submit-action-btn submit-action-primary"
                        onClick={() => setValidationResult(null)}
                      >
                        <span className="submit-btn-icon">🔄</span> Validate Another
                      </button>
                      <button 
                        className="submit-action-btn submit-action-secondary"
                        onClick={() => setDocFile(null)}
                      >
                        <span className="submit-btn-icon">✕</span> Close
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}