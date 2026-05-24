



// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { validatePdf, submitManuscript } from "../../services/apiServices";
// import "./ValidatePdf.css";

// export default function ValidatePdf() {
//   const navigate = useNavigate();
//   const [pdfFile, setPdfFile] = useState(null);
//   const [validating, setValidating] = useState(false);
//   const [validationResult, setValidationResult] = useState(null);
//   const [error, setError] = useState("");

//   // NEW: manuscript detail fields
//   const [title, setTitle] = useState("");
//   const [author, setAuthor] = useState("");
//   const [organizationId, setOrganizationId] = useState("");

//   // Submit manuscript state
//   const [submitting, setSubmitting] = useState(false);
//   const [submitResult, setSubmitResult] = useState(null);
//   const [submitError, setSubmitError] = useState("");

//   const pdfInputRef = useRef(null);

//   const handlePdfSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!file.name.endsWith(".pdf")) return alert("Please upload a PDF file");
//     setPdfFile(file);
//     setValidationResult(null);
//     setSubmitResult(null);
//     setError("");
//     setSubmitError("");
//   };

//   // ── POST /api/v1/accessibility/run-checks ───────────────────
//   const handleValidate = async () => {
//     if (!pdfFile) return alert("Please upload a PDF first");
//     if (!title.trim()) return alert("Please enter the manuscript title");
//     if (!author.trim()) return alert("Please enter the author name");
//     if (!organizationId.toString().trim()) return alert("Please enter the Organization ID");

//     setValidating(true);
//     setValidationResult(null);
//     setSubmitResult(null);
//     setError("");
//     setSubmitError("");

//     try {
//       const response = await validatePdf(pdfFile);

//       if (!response.ok) {
//         const err = await response.json().catch(() => ({}));
//         throw new Error(err.detail || `Server error: ${response.status}`);
//       }

//       const data = await response.json();
//       setValidationResult(data);

//       // ── Auto-submit manuscript after validation ─────────────
//       await handleSubmitManuscript(data);

//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setValidating(false);
//     }
//   };

//   // ── POST /api/v1/submit/manuscripts ────────────────────────
//   const handleSubmitManuscript = async (validationData) => {
//     setSubmitting(true);
//     setSubmitError("");
//     try {
//       // FIXED: now passing all 4 required fields
//       const response = await submitManuscript(pdfFile, title, author, organizationId);
//       if (!response.ok) {
//         const err = await response.json().catch(() => ({}));
//         throw new Error(err.detail || `Submit error: ${response.status}`);
//       }
//       const data = await response.json();
//       setSubmitResult(data);
//     } catch (err) {
//       setSubmitError(`Manuscript submission: ${err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Helper — get the list of checks from whatever shape backend returns
//   const getChecks = () => {
//     if (!validationResult) return [];
//     if (Array.isArray(validationResult)) return validationResult;
//     if (Array.isArray(validationResult.checks)) return validationResult.checks;
//     if (Array.isArray(validationResult.results)) return validationResult.results;
//     return [];
//   };

//   return (
//     <div className="tp-page">

//       {/* ── Sidebar ─────────────────────────────────────────── */}
//       <aside className="tp-sidebar">
//         <div className="tp-logo">
//           <span>Orion</span>
//           <small>Accessibility & Remediation</small>
//         </div>
//         <nav className="tp-nav">
//           <p className="tp-nav-section">Accessibility & Remediation</p>
//           <div className="tp-nav-item" onClick={() => navigate("/template")}>
//             <span className="tp-nav-icon">📋</span> Template
//             <span className="tp-chevron">▸</span>
//           </div>
//           <div className="tp-nav-item active">
//             <span className="tp-nav-icon">✅</span> Validate PDF
//           </div>
//         </nav>
//       </aside>

//       {/* ── Main ────────────────────────────────────────────── */}
//       <main className="tp-main">
//         <div className="tp-topbar">
//           <div className="tp-breadcrumb">
//             <span>Accessibility & Remediation</span>
//             <span className="tp-sep">›</span>
//             <span className="tp-active">Validate PDF</span>
//           </div>
//         </div>

//         <div className="tp-content">
//           <section className="tp-validate-section">
//             <h2 className="tp-section-title" style={{ marginBottom: 6 }}>Validate PDF</h2>
//             <p className="tp-section-sub" style={{ marginBottom: 20 }}>
//               Upload a PDF to run all active accessibility checks. The manuscript will be submitted automatically after validation.
//             </p>

//             {/* NEW: Manuscript detail fields */}
//             <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
//               <div style={{ flex: 1, minWidth: 200 }}>
//                 <label className="tp-label">Title * </label>
//                 <input
//                   className="tp-input"
//                   style={{ width: "100%", marginTop: 4 }}
//                   placeholder="Manuscript title"
//                   value={title}
//                   onChange={e => setTitle(e.target.value)}
//                 />
//               </div>
//               <div style={{ flex: 1, minWidth: 200 }}>
//                 <label className="tp-label">Author * </label>
//                 <input
//                   className="tp-input"
//                   style={{ width: "100%", marginTop: 4 }}
//                   placeholder="Author name"
//                   value={author}
//                   onChange={e => setAuthor(e.target.value)}
//                 />
//               </div>
//               <div style={{ flex: 1, minWidth: 160 }}>
//                 <label className="tp-label">Organization ID * </label>
//                 <input
//                   className="tp-input"
//                   type="number"
//                   style={{ width: "100%", marginTop: 4 }}
//                   placeholder="e.g. 1"
//                   value={organizationId}
//                   onChange={e => setOrganizationId(e.target.value)}
//                 />
//               </div>
//             </div>

//             <input ref={pdfInputRef} type="file" accept=".pdf"
//               style={{ display: "none" }} onChange={handlePdfSelect} />

//             <div className="tp-drop-zone" onClick={() => pdfInputRef.current.click()}>
//               <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
//               <p>{pdfFile ? `✅ ${pdfFile.name}` : "Click to upload PDF"}</p>
//               <small>Only .pdf files accepted</small>
//             </div>

//             {error && (
//               <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>⚠ {error}</p>
//             )}

//             {pdfFile && (
//               <button className="tp-btn tp-btn-primary"
//                 style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
//                 onClick={handleValidate}
//                 disabled={validating || submitting}>
//                 {validating ? "Running checks..." : submitting ? "Submitting manuscript..." : "✅ Validate PDF"}
//               </button>
//             )}

//             {/* Validation Results */}
//             {validationResult && (
//               <div className="tp-validation-result" style={{ marginTop: 20 }}>
//                 <p className="tp-result-title">
//                   Validation Results — {getChecks().length} checks run
//                 </p>

//                 {getChecks().map((check, i) => (
//                   <div key={i} className={`tp-check-row ${check.passed ? "passed" : "failed"}`}>
//                     <span>
//                       {check.passed ? "✅" : "❌"} {check.check_name || check.name || `Check ${i + 1}`}
//                     </span>
//                     {check.remediation_guidance && (
//                       <span className="tp-check-note">{check.remediation_guidance}</span>
//                     )}
//                   </div>
//                 ))}

//                 {validationResult.message && (
//                   <div style={{ padding: "10px 14px", fontSize: 13, color: "#166534", borderTop: "1px solid #dbeafe" }}>
//                     {validationResult.message}
//                   </div>
//                 )}

//                 {getChecks().length === 0 && (
//                   <div style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
//                     Validation complete. Raw response: {JSON.stringify(validationResult)}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Manuscript Submission Status */}
//             {(submitting || submitResult || submitError) && (
//               <div className="tp-validation-result" style={{ marginTop: 16, borderColor: submitError ? "#fca5a5" : "#86efac" }}>
//                 <p className="tp-result-title" style={{ color: submitError ? "#dc2626" : "#15803d" }}>
//                   {submitting
//                     ? "⏳ Submitting manuscript..."
//                     : submitError
//                       ? `⚠ ${submitError}`
//                       : "📨 Manuscript Submitted Successfully"
//                   }
//                 </p>
//                 {submitResult && !submitError && (
//                   <div style={{ padding: "10px 14px", fontSize: 13, color: "#166534" }}>
//                     {submitResult.message || `Submission ID: ${submitResult.id || "N/A"}`}
//                   </div>
//                 )}
//               </div>
//             )}
//           </section>
//         </div>
//       </main>
//     </div>
//   );
// }
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitManuscript } from "../../services/apiServices";
import "./ValidatePdf.css";

export default function ValidatePdf() {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const pdfInputRef = useRef(null);

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) return alert("Please upload a PDF file");
    setPdfFile(file);
    setSubmitResult(null);
    setSubmitError("");
  };

  // ── POST /api/v1/submit/manuscripts ────────────────────────
  const handleSubmit = async () => {
    if (!title.trim()) return alert("Please enter the manuscript title");
    if (!author.trim()) return alert("Please enter the author name");
    if (!organizationId.toString().trim()) return alert("Please enter the Organization ID");
    if (!pdfFile) return alert("Please upload a PDF file");

    setSubmitting(true);
    setSubmitResult(null);
    setSubmitError("");

    try {
      const response = await submitManuscript(pdfFile, title, author, organizationId);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${response.status}`);
      }
      const data = await response.json();
      setSubmitResult(data);
    } catch (err) {
      setSubmitError(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tp-page">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <div className="tp-logo">
          <span>Orion</span>
          <small>Accessibility & Remediation</small>
        </div>
        <nav className="tp-nav">
          <p className="tp-nav-section">Accessibility & Remediation</p>
          <div className="tp-nav-item" onClick={() => navigate("/template")}>
            <span className="tp-nav-icon">📋</span> Template
            <span className="tp-chevron">▸</span>
          </div>
          <div className="tp-nav-item active">
            <span className="tp-nav-icon">✅</span> Validate PDF
          </div>
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="tp-main">
        <div className="tp-topbar">
          <div className="tp-breadcrumb">
            <span>Accessibility & Remediation</span>
            <span className="tp-sep">›</span>
            <span className="tp-active">Validate PDF</span>
          </div>
        </div>

        <div className="tp-content">
          <section className="tp-validate-section">
            <h2 className="tp-section-title" style={{ marginBottom: 6 }}>Submit Manuscript</h2>
            <p className="tp-section-sub" style={{ marginBottom: 20 }}>
              Fill in the details and upload your PDF to submit the manuscript.
            </p>

            {/* Manuscript detail fields */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="tp-label">Title *</label>
                <input
                  className="tp-input"
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="Manuscript title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="tp-label">Author *</label>
                <input
                  className="tp-input"
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="Author name"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="tp-label">Organization ID *</label>
                <input
                  className="tp-input"
                  type="number"
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="e.g. 1"
                  value={organizationId}
                  onChange={e => setOrganizationId(e.target.value)}
                />
              </div>
            </div>

            {/* PDF Upload */}
            <input ref={pdfInputRef} type="file" accept=".pdf"
              style={{ display: "none" }} onChange={handlePdfSelect} />

            <div className="tp-drop-zone" onClick={() => pdfInputRef.current.click()}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <p>{pdfFile ? `✅ ${pdfFile.name}` : "Click to upload PDF"}</p>
              <small>Only .pdf files accepted</small>
            </div>

            {/* Submit Button */}
            <button
              className="tp-btn tp-btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "⏳ Submitting..." : "📨 Submit Manuscript"}
            </button>

            {/* Result */}
            {(submitResult || submitError) && (
              <div className="tp-validation-result"
                style={{ marginTop: 16, borderColor: submitError ? "#fca5a5" : "#86efac" }}>
                <p className="tp-result-title" style={{ color: submitError ? "#dc2626" : "#15803d" }}>
                  {submitError ? `⚠ ${submitError}` : "📨 Manuscript Submitted Successfully!"}
                </p>
                {submitResult && !submitError && (
                  <div style={{ padding: "10px 14px", fontSize: 13, color: "#166534" }}>
                    {submitResult.message || `Submission ID: ${submitResult.id || "N/A"}`}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
