
// // import { useState, useRef } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { validatePdf } from "../../services/apiServices";
// // import "./ValidatePdf.css";

// // export default function ValidatePdf() {
// //   const navigate = useNavigate();

// //   const [pdfFile, setPdfFile]       = useState(null);
// //   const [dragOver, setDragOver]     = useState(false);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [rawResult, setRawResult]   = useState(null);   // stores full API JSON
// //   const [submitError, setSubmitError] = useState("");

// //   const pdfInputRef = useRef(null);

// //   const handlePdfSelect = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;
// //     if (!file.name.toLowerCase().endsWith(".pdf")) { alert("Please upload a PDF file (.pdf)"); return; }
// //     setPdfFile(file); setRawResult(null); setSubmitError("");
// //   };

// //   const handleDrop = (e) => {
// //     e.preventDefault(); setDragOver(false);
// //     const file = e.dataTransfer.files[0];
// //     if (!file) return;
// //     if (!file.name.toLowerCase().endsWith(".pdf")) { alert("Please drop a PDF file (.pdf)"); return; }
// //     setPdfFile(file); setRawResult(null); setSubmitError("");
// //   };

// //   const formatBytes = (bytes) => {
// //     if (bytes < 1024) return `${bytes} B`;
// //     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
// //     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
// //   };

// //   const handleSubmit = async () => {
// //     if (!pdfFile) { alert("Please upload a PDF file first."); return; }
// //     setSubmitting(true); setRawResult(null); setSubmitError("");
// //     try {
// //       const response = await validatePdf(pdfFile);
// //       if (!response.ok) {
// //         let errMsg = `Server error: ${response.status}`;
// //         try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
// //         catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
// //         throw new Error(errMsg);
// //       }
// //       const data = await response.json();
// //       setRawResult(data);
// //     } catch (err) {
// //       setSubmitError(err.message || "Unexpected error. Please try again.");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   // ── Parse VeraPDF response ─────────────────────────────────
// //   // Handles: { response_code, data: { report: { jobs: [{ validationResult }] } } }
// //   const parseVeraPDF = (raw) => {
// //     if (!raw) return null;

// //     // Unwrap envelope
// //     const report =
// //       raw?.data?.report ??
// //       raw?.report ??
// //       raw;

// //     // Get jobs array — VeraPDF always puts results here
// //     const jobs = Array.isArray(report?.jobs) ? report.jobs : [];
// //     const job  = jobs[0] ?? {};

// //     const vr = job?.validationResult ?? report?.validationResult ?? null;

// //     if (!vr) return { unparseable: true, raw };

// //     const details       = vr.details ?? {};
// //     const passedChecks  = Number(vr.passedChecks  ?? details.passedChecks  ?? 0);
// //     const failedChecks  = Number(vr.failedChecks  ?? details.failedChecks  ?? 0);
// //     const passedRules   = Number(details.passedRules ?? 0);
// //     const failedRules   = Number(details.failedRules ?? 0);
// //     const isCompliant   = vr.compliant ?? (failedChecks === 0 && failedRules === 0);
// //     const profileName   = vr.profileName ?? vr.validationProfileName ?? "";
// //     const statement     = vr.statement   ?? "";

// //     // ruleSummaries holds BOTH passed and failed rules — filter failed ones
// //     const ruleSummaries = details.ruleSummaries ?? [];
// //     // A rule is failed when it has failures > 0
// //     const violations = ruleSummaries.filter(r => Number(r.failures ?? r.failedChecks ?? 0) > 0);
// //     // Passed rules = ruleSummaries with 0 failures
// //     const passedRulesList = ruleSummaries.filter(r => Number(r.failures ?? r.failedChecks ?? 0) === 0);

// //     // Group violations by specification (for categorization)
// //     const bySpec = {};
// //     violations.forEach(v => {
// //       const spec = v.specification ?? "Other";
// //       if (!bySpec[spec]) bySpec[spec] = [];
// //       bySpec[spec].push(v);
// //     });

// //     return {
// //       profileName,
// //       statement,
// //       isCompliant,
// //       passedChecks,
// //       failedChecks,
// //       passedRules,
// //       failedRules,
// //       violations,
// //       passedRulesList,
// //       bySpec,
// //       totalRuleSummaries: ruleSummaries.length,
// //       raw,
// //     };
// //   };

// //   const parsed = parseVeraPDF(rawResult);

// //   return (
// //     <div className="tp-page">

// //       {/* ── Sidebar ─────────────────────────────────────────── */}
// //       <aside className="tp-sidebar">
// //         <div className="tp-logo">
// //           <span>Orion</span>
// //           <small>Accessibility & Remediation</small>
// //         </div>
// //         <nav className="tp-nav">
// //           <p className="tp-nav-section">Accessibility & Remediation</p>
// //           <div className="tp-nav-item" onClick={() => navigate("/template")}>
// //             <span className="tp-nav-icon">📋</span> Template
// //             <span className="tp-chevron">▸</span>
// //           </div>
// //           <div className="tp-nav-item active">
// //             <span className="tp-nav-icon">✅</span> Validate PDF
// //           </div>
// //         </nav>
// //       </aside>

// //       {/* ── Main ────────────────────────────────────────────── */}
// //       <main className="tp-main">
// //         <div className="tp-topbar">
// //           <div className="tp-breadcrumb">
// //             <span>Accessibility &amp; Remediation</span>
// //             <span className="tp-sep">›</span>
// //             <span className="tp-active">Validate PDF</span>
// //           </div>
// //           {pdfFile && !submitting && (
// //             <div className="tp-topbar-badge"><span className="tp-badge-dot"></span>PDF Ready</div>
// //           )}
// //           {submitting && (
// //             <div className="tp-topbar-badge tp-topbar-badge--running"><span className="tp-badge-spin"></span>Validating…</div>
// //           )}
// //         </div>

// //         <div className="tp-content">

// //           {/* ══ CARD 1 — Upload + Run (50-50) ══ */}
// //           <div className="vp-section-card">
// //             <div className="vp-section-number">1</div>
// //             <div className="vp-section-inner">
// //               <div className="vp-section-header">
// //                 <h2 className="vp-section-title">Upload PDF</h2>
// //                 <p className="vp-section-sub">Select or drag-and-drop your PDF file for accessibility validation (VeraPDF / WCAG / PDF/UA).</p>
// //               </div>

// //               <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handlePdfSelect} />

// //               <div className="vp-upload-run-row">
// //                 <div
// //                   className={`vp-drop-zone ${dragOver ? "drag-over" : ""} ${pdfFile ? "has-file" : ""}`}
// //                   onClick={() => pdfInputRef.current.click()}
// //                   onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
// //                   onDragLeave={() => setDragOver(false)}
// //                   onDrop={handleDrop}
// //                 >
// //                   {pdfFile ? (
// //                     <div className="vp-file-preview">
// //                       <div className="vp-file-icon">📄</div>
// //                       <div className="vp-file-info">
// //                         <span className="vp-file-name">{pdfFile.name}</span>
// //                         <span className="vp-file-size">{formatBytes(pdfFile.size)}</span>
// //                       </div>
// //                       <button className="vp-file-remove"
// //                         onClick={(e) => { e.stopPropagation(); setPdfFile(null); setRawResult(null); setSubmitError(""); }}
// //                         title="Remove file">✕</button>
// //                     </div>
// //                   ) : (
// //                     <div className="vp-drop-content">
// //                       <div className="vp-drop-icon">☁</div>
// //                       <p className="vp-drop-title">Drag &amp; drop your PDF here</p>
// //                       <p className="vp-drop-sub">or <span className="vp-drop-link">browse to upload</span></p>
// //                       <p className="vp-drop-hint">Only .pdf files · Max recommended: 50MB</p>
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div className="vp-run-panel">
// //                   <div className="vp-check-tags">
// //                     <span className="vp-tag">🔍 VeraPDF</span>
// //                     <span className="vp-tag">📋 PDF/UA</span>
// //                     <span className="vp-tag">♿ WCAG 2.1</span>
// //                     <span className="vp-tag">🏷 Tagged PDF</span>
// //                   </div>
// //                   <button
// //                     className="tp-btn tp-btn-primary vp-submit-btn"
// //                     onClick={handleSubmit}
// //                     disabled={!pdfFile || submitting}
// //                   >
// //                     {submitting
// //                       ? <><span className="vp-btn-spinner"></span>Validating PDF…</>
// //                       : <><span>🚀</span>Run Accessibility Checks</>}
// //                   </button>
// //                   {submitError && (
// //                     <div className="vp-error-box">
// //                       <span className="vp-error-icon">⚠</span>
// //                       <div>
// //                         <p className="vp-error-title">Validation Failed</p>
// //                         <p className="vp-error-msg">{submitError}</p>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* ══ CARD 2 — Validation Report ══ */}
// //           <div className={`vp-section-card vp-section-card--results ${!rawResult && !submitting ? "vp-section-disabled" : ""}`}>
// //             <div className="vp-section-number">2</div>
// //             <div className="vp-section-inner">
// //               <div className="vp-section-header">
// //                 <h2 className="vp-section-title">Validation Report</h2>
// //                 <p className="vp-section-sub">Detailed accessibility check results for your PDF document.</p>
// //               </div>

// //               {/* Placeholder */}
// //               {!rawResult && !submitting && (
// //                 <div className="vp-results-placeholder">
// //                   <div className="vp-placeholder-icon">📊</div>
// //                   <p className="vp-placeholder-title">No results yet</p>
// //                   <p className="vp-placeholder-sub">Upload a PDF and run validation to see the report here.</p>
// //                 </div>
// //               )}

// //               {/* Scanning */}
// //               {submitting && (
// //                 <div className="vp-results-placeholder">
// //                   <div className="vp-scanning-anim">
// //                     <div className="vp-scan-bar"></div>
// //                     <div className="vp-pdf-mock"><div/><div/><div/><div/><div/></div>
// //                   </div>
// //                   <p className="vp-placeholder-title" style={{ marginTop: 16 }}>Scanning PDF…</p>
// //                   <p className="vp-placeholder-sub">Running VeraPDF accessibility checks</p>
// //                 </div>
// //               )}

// //               {/* ── Parsed results ── */}
// //               {rawResult && !submitting && parsed && !parsed.unparseable && (
// //                 <>
// //                   {/* ── Validation Information ── */}
// //                   <div className="vp-info-block">
// //                     <h3 className="vp-info-title">Validation information</h3>
// //                     <table className="vp-summary-table">
// //                       <tbody>
// //                         {parsed.profileName && (
// //                           <tr>
// //                             <td className="vp-sum-key">Validation Profile:</td>
// //                             <td className="vp-sum-val">{parsed.profileName}</td>
// //                           </tr>
// //                         )}
// //                         <tr>
// //                           <td className="vp-sum-key">Compliance:</td>
// //                           <td className={`vp-sum-val ${parsed.isCompliant ? "vp-sum-pass" : "vp-sum-fail"}`}>
// //                             {parsed.isCompliant ? "Passed" : "Failed"}
// //                           </td>
// //                         </tr>
// //                         <tr>
// //                           <td className="vp-sum-key">Passed Checks:</td>
// //                           <td className="vp-sum-val">{parsed.passedChecks.toLocaleString()}</td>
// //                         </tr>
// //                         <tr>
// //                           <td className="vp-sum-key">Failed Checks:</td>
// //                           <td className="vp-sum-val">{parsed.failedChecks.toLocaleString()}</td>
// //                         </tr>
// //                         {(parsed.passedRules > 0 || parsed.failedRules > 0) && (
// //                           <>
// //                             <tr>
// //                               <td className="vp-sum-key">Passed Rules:</td>
// //                               <td className="vp-sum-val">{parsed.passedRules.toLocaleString()}</td>
// //                             </tr>
// //                             <tr>
// //                               <td className="vp-sum-key">Failed Rules:</td>
// //                               <td className="vp-sum-val">{parsed.failedRules.toLocaleString()}</td>
// //                             </tr>
// //                           </>
// //                         )}
// //                       </tbody>
// //                     </table>
// //                   </div>

// //                   {/* ── Failed Rules Table ── */}
// //                   {parsed.violations.length > 0 && (
// //                     <div className="vp-violations-wrap">
// //                       <table className="vp-violations-table">
// //                         <thead>
// //                           <tr>
// //                             <th className="vp-vth-rule">Rule</th>
// //                             <th className="vp-vth-status">Status</th>
// //                           </tr>
// //                         </thead>
// //                         <tbody>
// //                           {parsed.violations.map((v, i) => {
// //                             const spec        = v.specification ?? "";
// //                             const clause      = v.clause        ?? "";
// //                             const testNum     = v.testNumber    ?? v.test_number ?? "";
// //                             const description = v.description   ?? v.message ?? v.detail ?? "";
// //                             const occurrences = Number(v.failures ?? v.failedChecks ?? v.occurrences ?? v.count ?? 0);

// //                             const specLabel = [
// //                               spec    ? `Specification: ${spec}` : null,
// //                               clause  ? `Clause: ${clause}`      : null,
// //                               testNum ? `Test number: ${testNum}` : null,
// //                             ].filter(Boolean).join(", ") || `Rule ${i + 1}`;

// //                             return (
// //                               <tr key={i} className="vp-vrow">
// //                                 <td className="vp-vtd-rule">
// //                                   <a className="vp-spec-link" href="#!">{specLabel}</a>
// //                                   {description && <p className="vp-rule-desc">{description}</p>}
// //                                   {occurrences > 0 && (
// //                                     <p className="vp-occurrences">
// //                                       {occurrences.toLocaleString()} occurrence{occurrences !== 1 ? "s" : ""}
// //                                     </p>
// //                                   )}
// //                                 </td>
// //                                 <td className="vp-vtd-status">
// //                                   <span className="vp-vstatus fail">Failed</span>
// //                                   <a className="vp-show-link" href="#!">Show</a>
// //                                 </td>
// //                               </tr>
// //                             );
// //                           })}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                   )}

// //                   {/* All passed */}
// //                   {parsed.isCompliant && parsed.violations.length === 0 && (
// //                     <div className="vp-success-note">
// //                       🎉 Excellent! Your PDF is fully accessible and meets all checked standards.
// //                     </div>
// //                   )}

// //                   {/* Edge case: not compliant but no violations surfaced */}
// //                   {!parsed.isCompliant && parsed.violations.length === 0 && (
// //                     <div className="vp-warn-note">
// //                       ⚠ Validation returned non-compliant but no specific rule violations were found in the response.
// //                     </div>
// //                   )}
// //                 </>
// //               )}

// //               {/* DEBUG — always show raw JSON so we can see actual API shape */}
// //               {rawResult && !submitting && (
// //                 <div className="vp-raw-result" style={{ marginTop: 20 }}>
// //                   <p className="vp-raw-label">🔍 DEBUG — Raw API Response (remove after fixing)</p>
// //                   <pre className="vp-raw-json">{JSON.stringify(rawResult, null, 2)}</pre>
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //         </div>
// //       </main>
// //     </div>
// //   );
// // }


// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { validatePdf } from "../../services/apiServices";
// import "./ValidatePdf.css";

// export default function ValidatePdf() {
//   const navigate = useNavigate();

//   const [pdfFile, setPdfFile]       = useState(null);
//   const [dragOver, setDragOver]     = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [rawResult, setRawResult]   = useState(null);   // stores full API JSON
//   const [submitError, setSubmitError] = useState("");

//   const pdfInputRef = useRef(null);

//   const handlePdfSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!file.name.toLowerCase().endsWith(".pdf")) { alert("Please upload a PDF file (.pdf)"); return; }
//     setPdfFile(file); setRawResult(null); setSubmitError("");
//   };

//   const handleDrop = (e) => {
//     e.preventDefault(); setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (!file) return;
//     if (!file.name.toLowerCase().endsWith(".pdf")) { alert("Please drop a PDF file (.pdf)"); return; }
//     setPdfFile(file); setRawResult(null); setSubmitError("");
//   };

//   const formatBytes = (bytes) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   const handleSubmit = async () => {
//     if (!pdfFile) { alert("Please upload a PDF file first."); return; }
//     setSubmitting(true); setRawResult(null); setSubmitError("");
//     try {
//       const response = await validatePdf(pdfFile);
//       if (!response.ok) {
//         let errMsg = `Server error: ${response.status}`;
//         try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
//         catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
//         throw new Error(errMsg);
//       }
//       const data = await response.json();
//       setRawResult(data);
//     } catch (err) {
//       setSubmitError(err.message || "Unexpected error. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Parse VeraPDF response ─────────────────────────────────
//   // Actual shape: data.report.jobs[0].validationResult = ARRAY of result objects
//   // Each item: { profileName, compliant, statement, details: { passedRules, failedRules,
//   //   passedChecks, failedChecks, ruleSummaries: [{ ruleStatus, specification, clause,
//   //   testNumber, failedChecks, description, ... }] } }
//   const parseVeraPDF = (raw) => {
//     if (!raw) return null;

//     const report = raw?.data?.report ?? raw?.report ?? raw;
//     const jobs   = Array.isArray(report?.jobs) ? report.jobs : [];
//     const job    = jobs[0] ?? {};

//     // validationResult is an ARRAY — take first element
//     const vrRaw = job?.validationResult ?? report?.validationResult ?? null;
//     const vr    = Array.isArray(vrRaw) ? vrRaw[0] : vrRaw;

//     if (!vr) return { unparseable: true, raw };

//     // profileName / compliant / statement are directly on vr (not inside details)
//     const profileName  = vr.profileName ?? vr.validationProfileName ?? "";
//     const statement    = vr.statement   ?? "";
//     const isCompliant  = vr.compliant   ?? false;

//     // counts are inside vr.details
//     const details      = vr.details ?? {};
//     const passedChecks = Number(details.passedChecks ?? 0);
//     const failedChecks = Number(details.failedChecks ?? 0);
//     const passedRules  = Number(details.passedRules  ?? 0);
//     const failedRules  = Number(details.failedRules  ?? 0);

//     // ruleSummaries — filter only FAILED ones (ruleStatus === "FAILED" or failedChecks > 0)
//     const ruleSummaries = details.ruleSummaries ?? [];
//     const violations    = ruleSummaries.filter(r =>
//       r.ruleStatus === "FAILED" ||
//       r.status     === "failed" ||
//       Number(r.failedChecks ?? r.failures ?? 0) > 0
//     );

//     return {
//       profileName,
//       statement,
//       isCompliant,
//       passedChecks,
//       failedChecks,
//       passedRules,
//       failedRules,
//       violations,
//       raw,
//     };
//   };

//   const parsed = parseVeraPDF(rawResult);

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
//             <span>Accessibility &amp; Remediation</span>
//             <span className="tp-sep">›</span>
//             <span className="tp-active">Validate PDF</span>
//           </div>
//           {pdfFile && !submitting && (
//             <div className="tp-topbar-badge"><span className="tp-badge-dot"></span>PDF Ready</div>
//           )}
//           {submitting && (
//             <div className="tp-topbar-badge tp-topbar-badge--running"><span className="tp-badge-spin"></span>Validating…</div>
//           )}
//         </div>

//         <div className="tp-content">

//           {/* ══ CARD 1 — Upload + Run (50-50) ══ */}
//           <div className="vp-section-card">
//             <div className="vp-section-number">1</div>
//             <div className="vp-section-inner">
//               <div className="vp-section-header">
//                 <h2 className="vp-section-title">Upload PDF</h2>
//                 <p className="vp-section-sub">Select or drag-and-drop your PDF file for accessibility validation (VeraPDF / WCAG / PDF/UA).</p>
//               </div>

//               <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handlePdfSelect} />

//               <div className="vp-upload-run-row">
//                 <div
//                   className={`vp-drop-zone ${dragOver ? "drag-over" : ""} ${pdfFile ? "has-file" : ""}`}
//                   onClick={() => pdfInputRef.current.click()}
//                   onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//                   onDragLeave={() => setDragOver(false)}
//                   onDrop={handleDrop}
//                 >
//                   {pdfFile ? (
//                     <div className="vp-file-preview">
//                       <div className="vp-file-icon">📄</div>
//                       <div className="vp-file-info">
//                         <span className="vp-file-name">{pdfFile.name}</span>
//                         <span className="vp-file-size">{formatBytes(pdfFile.size)}</span>
//                       </div>
//                       <button className="vp-file-remove"
//                         onClick={(e) => { e.stopPropagation(); setPdfFile(null); setRawResult(null); setSubmitError(""); }}
//                         title="Remove file">✕</button>
//                     </div>
//                   ) : (
//                     <div className="vp-drop-content">
//                       <div className="vp-drop-icon">☁</div>
//                       <p className="vp-drop-title">Drag &amp; drop your PDF here</p>
//                       <p className="vp-drop-sub">or <span className="vp-drop-link">browse to upload</span></p>
//                       <p className="vp-drop-hint">Only .pdf files · Max recommended: 50MB</p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="vp-run-panel">
//                   <div className="vp-check-tags">
//                     <span className="vp-tag">🔍 VeraPDF</span>
//                     <span className="vp-tag">📋 PDF/UA</span>
//                     <span className="vp-tag">♿ WCAG 2.1</span>
//                     <span className="vp-tag">🏷 Tagged PDF</span>
//                   </div>
//                   <button
//                     className="tp-btn tp-btn-primary vp-submit-btn"
//                     onClick={handleSubmit}
//                     disabled={!pdfFile || submitting}
//                   >
//                     {submitting
//                       ? <><span className="vp-btn-spinner"></span>Validating PDF…</>
//                       : <><span>🚀</span>Run Accessibility Checks</>}
//                   </button>
//                   {submitError && (
//                     <div className="vp-error-box">
//                       <span className="vp-error-icon">⚠</span>
//                       <div>
//                         <p className="vp-error-title">Validation Failed</p>
//                         <p className="vp-error-msg">{submitError}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ══ CARD 2 — Validation Report ══ */}
//           <div className={`vp-section-card vp-section-card--results ${!rawResult && !submitting ? "vp-section-disabled" : ""}`}>
//             <div className="vp-section-number">2</div>
//             <div className="vp-section-inner">
//               <div className="vp-section-header">
//                 <h2 className="vp-section-title">Validation Report</h2>
//                 <p className="vp-section-sub">Detailed accessibility check results for your PDF document.</p>
//               </div>

//               {/* Placeholder */}
//               {!rawResult && !submitting && (
//                 <div className="vp-results-placeholder">
//                   <div className="vp-placeholder-icon">📊</div>
//                   <p className="vp-placeholder-title">No results yet</p>
//                   <p className="vp-placeholder-sub">Upload a PDF and run validation to see the report here.</p>
//                 </div>
//               )}

//               {/* Scanning */}
//               {submitting && (
//                 <div className="vp-results-placeholder">
//                   <div className="vp-scanning-anim">
//                     <div className="vp-scan-bar"></div>
//                     <div className="vp-pdf-mock"><div/><div/><div/><div/><div/></div>
//                   </div>
//                   <p className="vp-placeholder-title" style={{ marginTop: 16 }}>Scanning PDF…</p>
//                   <p className="vp-placeholder-sub">Running VeraPDF accessibility checks</p>
//                 </div>
//               )}

//               {/* ── Parsed results ── */}
//               {rawResult && !submitting && parsed && !parsed.unparseable && (
//                 <>
//                   {/* ── Validation Information ── */}
//                   <div className="vp-info-block">
//                     <h3 className="vp-info-title">Validation information</h3>
//                     <table className="vp-summary-table">
//                       <tbody>
//                         {parsed.profileName && (
//                           <tr>
//                             <td className="vp-sum-key">Validation Profile:</td>
//                             <td className="vp-sum-val">{parsed.profileName}</td>
//                           </tr>
//                         )}
//                         <tr>
//                           <td className="vp-sum-key">Compliance:</td>
//                           <td className={`vp-sum-val ${parsed.isCompliant ? "vp-sum-pass" : "vp-sum-fail"}`}>
//                             {parsed.isCompliant ? "Passed" : "Failed"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="vp-sum-key">Passed Checks:</td>
//                           <td className="vp-sum-val">{parsed.passedChecks.toLocaleString()}</td>
//                         </tr>
//                         <tr>
//                           <td className="vp-sum-key">Failed Checks:</td>
//                           <td className="vp-sum-val">{parsed.failedChecks.toLocaleString()}</td>
//                         </tr>
//                         {(parsed.passedRules > 0 || parsed.failedRules > 0) && (
//                           <>
//                             <tr>
//                               <td className="vp-sum-key">Passed Rules:</td>
//                               <td className="vp-sum-val">{parsed.passedRules.toLocaleString()}</td>
//                             </tr>
//                             <tr>
//                               <td className="vp-sum-key">Failed Rules:</td>
//                               <td className="vp-sum-val">{parsed.failedRules.toLocaleString()}</td>
//                             </tr>
//                           </>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* ── Failed Rules Table ── */}
//                   {parsed.violations.length > 0 && (
//                     <div className="vp-violations-wrap">
//                       <table className="vp-violations-table">
//                         <thead>
//                           <tr>
//                             <th className="vp-vth-rule">Rule</th>
//                             <th className="vp-vth-status">Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {parsed.violations.map((v, i) => {
//                             const spec        = v.specification ?? "";
//                             const clause      = v.clause        ?? "";
//                             const testNum     = v.testNumber    ?? v.test_number ?? "";
//                             const description = v.description   ?? v.message ?? v.detail ?? "";
//                             const occurrences = Number(v.failedChecks ?? v.failures ?? v.occurrences ?? 0);

//                             const specLabel = [
//                               spec    ? `Specification: ${spec}` : null,
//                               clause  ? `Clause: ${clause}`      : null,
//                               testNum ? `Test number: ${testNum}` : null,
//                             ].filter(Boolean).join(", ") || `Rule ${i + 1}`;

//                             return (
//                               <tr key={i} className="vp-vrow">
//                                 <td className="vp-vtd-rule">
//                                   <a className="vp-spec-link" href="#!">{specLabel}</a>
//                                   {description && <p className="vp-rule-desc">{description}</p>}
//                                   {occurrences > 0 && (
//                                     <p className="vp-occurrences">
//                                       {occurrences.toLocaleString()} occurrence{occurrences !== 1 ? "s" : ""}
//                                     </p>
//                                   )}
//                                 </td>
//                                 <td className="vp-vtd-status">
//                                   <span className="vp-vstatus fail">Failed</span>
//                                   <a className="vp-show-link" href="#!">Show</a>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}

//                   {/* All passed */}
//                   {parsed.isCompliant && parsed.violations.length === 0 && (
//                     <div className="vp-success-note">
//                       🎉 Excellent! Your PDF is fully accessible and meets all checked standards.
//                     </div>
//                   )}

//                   {/* Edge case: not compliant but no violations surfaced */}
//                   {!parsed.isCompliant && parsed.violations.length === 0 && (
//                     <div className="vp-warn-note">
//                       ⚠ Validation returned non-compliant but no specific rule violations were found in the response.
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Unparseable — raw fallback */}
//               {rawResult && !submitting && parsed?.unparseable && (
//                 <div className="vp-raw-result">
//                   <p className="vp-raw-label">Raw API Response</p>
//                   <pre className="vp-raw-json">{JSON.stringify(rawResult, null, 2)}</pre>
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// }




import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validatePdf } from "../../services/apiServices";
import "./ValidatePdf.css";

export default function ValidatePdf() {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile]       = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rawResult, setRawResult]   = useState(null);   // stores full API JSON
  const [submitError, setSubmitError] = useState("");

  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (i) => setExpandedRows(prev => ({ ...prev, [i]: !prev[i] }));

  const pdfInputRef = useRef(null);

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { alert("Please upload a PDF file (.pdf)"); return; }
    setPdfFile(file); setRawResult(null); setSubmitError("");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { alert("Please drop a PDF file (.pdf)"); return; }
    setPdfFile(file); setRawResult(null); setSubmitError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async () => {
    if (!pdfFile) { alert("Please upload a PDF file first."); return; }
    setSubmitting(true); setRawResult(null); setSubmitError("");
    try {
      const response = await validatePdf(pdfFile);
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      const data = await response.json();
      setRawResult(data);
      setExpandedRows({});
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Parse VeraPDF response ─────────────────────────────────
  // Actual shape: data.report.jobs[0].validationResult = ARRAY of result objects
  // Each item: { profileName, compliant, statement, details: { passedRules, failedRules,
  //   passedChecks, failedChecks, ruleSummaries: [{ ruleStatus, specification, clause,
  //   testNumber, failedChecks, description, ... }] } }
  const parseVeraPDF = (raw) => {
    if (!raw) return null;

    const report = raw?.data?.report ?? raw?.report ?? raw;
    const jobs   = Array.isArray(report?.jobs) ? report.jobs : [];
    const job    = jobs[0] ?? {};

    // validationResult is an ARRAY — take first element
    const vrRaw = job?.validationResult ?? report?.validationResult ?? null;
    const vr    = Array.isArray(vrRaw) ? vrRaw[0] : vrRaw;

    if (!vr) return { unparseable: true, raw };

    // profileName / compliant / statement are directly on vr (not inside details)
    const profileName  = vr.profileName ?? vr.validationProfileName ?? "";
    const statement    = vr.statement   ?? "";
    const isCompliant  = vr.compliant   ?? false;

    // counts are inside vr.details
    const details      = vr.details ?? {};
    const passedChecks = Number(details.passedChecks ?? 0);
    const failedChecks = Number(details.failedChecks ?? 0);
    const passedRules  = Number(details.passedRules  ?? 0);
    const failedRules  = Number(details.failedRules  ?? 0);

    // ruleSummaries — filter only FAILED ones (ruleStatus === "FAILED" or failedChecks > 0)
    const ruleSummaries = details.ruleSummaries ?? [];
    const violations    = ruleSummaries.filter(r =>
      r.ruleStatus === "FAILED" ||
      r.status     === "failed" ||
      Number(r.failedChecks ?? r.failures ?? 0) > 0
    );

    return {
      profileName,
      statement,
      isCompliant,
      passedChecks,
      failedChecks,
      passedRules,
      failedRules,
      violations,
      raw,
    };
  };

  const parsed = parseVeraPDF(rawResult);

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
            <span>Accessibility &amp; Remediation</span>
            <span className="tp-sep">›</span>
            <span className="tp-active">Validate PDF</span>
          </div>
          {pdfFile && !submitting && (
            <div className="tp-topbar-badge"><span className="tp-badge-dot"></span>PDF Ready</div>
          )}
          {submitting && (
            <div className="tp-topbar-badge tp-topbar-badge--running"><span className="tp-badge-spin"></span>Validating…</div>
          )}
        </div>

        <div className="tp-content">

          {/* ══ CARD 1 — Upload + Run (50-50) ══ */}
          <div className="vp-section-card">
            <div className="vp-section-number">1</div>
            <div className="vp-section-inner">
              <div className="vp-section-header">
                <h2 className="vp-section-title">Upload PDF</h2>
                <p className="vp-section-sub">Select or drag-and-drop your PDF file for accessibility validation (VeraPDF / WCAG / PDF/UA).</p>
              </div>

              <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handlePdfSelect} />

              <div className="vp-upload-run-row">
                <div
                  className={`vp-drop-zone ${dragOver ? "drag-over" : ""} ${pdfFile ? "has-file" : ""}`}
                  onClick={() => pdfInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {pdfFile ? (
                    <div className="vp-file-preview">
                      <div className="vp-file-icon">📄</div>
                      <div className="vp-file-info">
                        <span className="vp-file-name">{pdfFile.name}</span>
                        <span className="vp-file-size">{formatBytes(pdfFile.size)}</span>
                      </div>
                      <button className="vp-file-remove"
                        onClick={(e) => { e.stopPropagation(); setPdfFile(null); setRawResult(null); setSubmitError(""); }}
                        title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="vp-drop-content">
                      <div className="vp-drop-icon">☁</div>
                      <p className="vp-drop-title">Drag &amp; drop your PDF here</p>
                      <p className="vp-drop-sub">or <span className="vp-drop-link">browse to upload</span></p>
                      <p className="vp-drop-hint">Only .pdf files · Max recommended: 50MB</p>
                    </div>
                  )}
                </div>

                <div className="vp-run-panel">
                  <div className="vp-check-tags">
                    <span className="vp-tag">🔍 VeraPDF</span>
                    <span className="vp-tag">📋 PDF/UA</span>
                    <span className="vp-tag">♿ WCAG 2.1</span>
                    <span className="vp-tag">🏷 Tagged PDF</span>
                  </div>
                  <button
                    className="tp-btn tp-btn-primary vp-submit-btn"
                    onClick={handleSubmit}
                    disabled={!pdfFile || submitting}
                  >
                    {submitting
                      ? <><span className="vp-btn-spinner"></span>Validating PDF…</>
                      : <><span>🚀</span>Run Accessibility Checks</>}
                  </button>
                  {submitError && (
                    <div className="vp-error-box">
                      <span className="vp-error-icon">⚠</span>
                      <div>
                        <p className="vp-error-title">Validation Failed</p>
                        <p className="vp-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ══ CARD 2 — Validation Report ══ */}
          <div className={`vp-section-card vp-section-card--results ${!rawResult && !submitting ? "vp-section-disabled" : ""}`}>
            <div className="vp-section-number">2</div>
            <div className="vp-section-inner">
              <div className="vp-section-header">
                <h2 className="vp-section-title">Validation Report</h2>
                <p className="vp-section-sub">Detailed accessibility check results for your PDF document.</p>
              </div>

              {/* Placeholder */}
              {!rawResult && !submitting && (
                <div className="vp-results-placeholder">
                  <div className="vp-placeholder-icon">📊</div>
                  <p className="vp-placeholder-title">No results yet</p>
                  <p className="vp-placeholder-sub">Upload a PDF and run validation to see the report here.</p>
                </div>
              )}

              {/* Scanning */}
              {submitting && (
                <div className="vp-results-placeholder">
                  <div className="vp-scanning-anim">
                    <div className="vp-scan-bar"></div>
                    <div className="vp-pdf-mock"><div/><div/><div/><div/><div/></div>
                  </div>
                  <p className="vp-placeholder-title" style={{ marginTop: 16 }}>Scanning PDF…</p>
                  <p className="vp-placeholder-sub">Running VeraPDF accessibility checks</p>
                </div>
              )}

              {/* ── Parsed results ── */}
              {rawResult && !submitting && parsed && !parsed.unparseable && (
                <>
                  {/* ── Validation Information ── */}
                  <div className="vp-info-block">
                    <h3 className="vp-info-title">Validation information</h3>
                    <table className="vp-summary-table">
                      <tbody>
                        {parsed.profileName && (
                          <tr>
                            <td className="vp-sum-key">Validation Profile:</td>
                            <td className="vp-sum-val">{parsed.profileName}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="vp-sum-key">Compliance:</td>
                          <td className={`vp-sum-val ${parsed.isCompliant ? "vp-sum-pass" : "vp-sum-fail"}`}>
                            {parsed.isCompliant ? "Passed" : "Failed"}
                          </td>
                        </tr>
                        <tr>
                          <td className="vp-sum-key">Passed Checks:</td>
                          <td className="vp-sum-val">{parsed.passedChecks.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="vp-sum-key">Failed Checks:</td>
                          <td className="vp-sum-val">{parsed.failedChecks.toLocaleString()}</td>
                        </tr>
                        {(parsed.passedRules > 0 || parsed.failedRules > 0) && (
                          <>
                            <tr>
                              <td className="vp-sum-key">Passed Rules:</td>
                              <td className="vp-sum-val">{parsed.passedRules.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="vp-sum-key">Failed Rules:</td>
                              <td className="vp-sum-val">{parsed.failedRules.toLocaleString()}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Failed Rules Table ── */}
                  {parsed.violations.length > 0 && (
                    <div className="vp-violations-wrap">
                      <table className="vp-violations-table">
                        <thead>
                          <tr>
                            <th className="vp-vth-rule">Rule</th>
                            <th className="vp-vth-status">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.violations.map((v, i) => {
                            const spec        = v.specification ?? "";
                            const clause      = v.clause        ?? "";
                            const testNum     = v.testNumber    ?? v.test_number ?? "";
                            const description = v.description   ?? v.message ?? v.detail ?? "";
                            const occurrences = Number(v.failedChecks ?? v.failures ?? v.occurrences ?? 0);
                            const checks      = v.checks ?? [];   // individual failing instances
                            const isExpanded  = !!expandedRows[i];

                            const specLabel = [
                              spec    ? `Specification: ${spec}` : null,
                              clause  ? `Clause: ${clause}`      : null,
                              testNum ? `Test number: ${testNum}` : null,
                            ].filter(Boolean).join(", ") || `Rule ${i + 1}`;

                            return (
                              <tr key={i} className="vp-vrow">
                                <td className="vp-vtd-rule">
                                  <a className="vp-spec-link" href="#!" onClick={e => e.preventDefault()}>{specLabel}</a>
                                  {description && <p className="vp-rule-desc">{description}</p>}
                                  {occurrences > 0 && (
                                    <p className="vp-occurrences">
                                      {occurrences.toLocaleString()} occurrence{occurrences !== 1 ? "s" : ""}
                                    </p>
                                  )}

                                  {/* Expanded checks detail */}
                                  {isExpanded && checks.length > 0 && (
                                    <div className="vp-checks-expand">
                                      <p className="vp-checks-label">Failed instances:</p>
                                      <div className="vp-checks-list">
                                        {checks.map((c, ci) => (
                                          <div key={ci} className="vp-check-item">
                                            <p className="vp-check-context">📍 {c.context}</p>
                                            {c.errorMessage && (
                                              <p className="vp-check-error">{c.errorMessage}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {isExpanded && checks.length === 0 && (
                                    <div className="vp-checks-expand">
                                      <p className="vp-checks-label">No additional context available.</p>
                                    </div>
                                  )}
                                </td>
                                <td className="vp-vtd-status">
                                  <span className="vp-vstatus fail">Failed</span>
                                  <button
                                    className={`vp-show-btn ${isExpanded ? "active" : ""}`}
                                    onClick={() => toggleRow(i)}
                                  >
                                    {isExpanded ? "Hide" : "Show"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* All passed */}
                  {parsed.isCompliant && parsed.violations.length === 0 && (
                    <div className="vp-success-note">
                      🎉 Excellent! Your PDF is fully accessible and meets all checked standards.
                    </div>
                  )}

                  {/* Edge case: not compliant but no violations surfaced */}
                  {!parsed.isCompliant && parsed.violations.length === 0 && (
                    <div className="vp-warn-note">
                      ⚠ Validation returned non-compliant but no specific rule violations were found in the response.
                    </div>
                  )}
                </>
              )}

              {/* Unparseable — raw fallback */}
              {rawResult && !submitting && parsed?.unparseable && (
                <div className="vp-raw-result">
                  <p className="vp-raw-label">Raw API Response</p>
                  <pre className="vp-raw-json">{JSON.stringify(rawResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
