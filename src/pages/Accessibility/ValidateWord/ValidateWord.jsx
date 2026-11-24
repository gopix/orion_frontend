


// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { orionValidateWord } from "../../../services/apiServices";
// import "./ValidateWord.css";

// const downloadAsJson = (data, filename) => {
//   const jsonStr = JSON.stringify(data, null, 2);
//   const blob = new Blob([jsonStr], { type: "application/json" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// const CATEGORY_LABELS = {
//   STRUCTURAL_ACCESSIBILITY:    "Structure Accessibility",
//   METADATA_ACCESSIBILITY:      "Metadata Accessibility",
//   IMAGE_ACCESSIBILITY:         "Image Accessibility",
//   TABLE_ACCESSIBILITY:         "Table Accessibility",
//   VISUAL_ACCESSIBILITY:        "Visual Accessibility",
//   READING_ORDER:               "Reading Order",
//   SCREEN_READER_COMPATIBILITY: "Screen Reader Compatibility",
// };

// const AGENT_META = {
//   "Structure Accessibility":     { icon: "🏗️", color: "#0891b2", bg: "#ecfeff" },
//   "Metadata Accessibility":      { icon: "🏷️", color: "#6366f1", bg: "#eef2ff" },
//   "Image Accessibility":         { icon: "🖼️", color: "#7c3aed", bg: "#f5f3ff" },
//   "Table Accessibility":         { icon: "📊", color: "#0d9488", bg: "#f0fdfa" },
//   "Visual Accessibility":        { icon: "🎨", color: "#db2777", bg: "#fdf2f8" },
//   "Reading Order":               { icon: "🔀", color: "#ea580c", bg: "#fff7ed" },
//   "Screen Reader Compatibility": { icon: "🔊", color: "#2563eb", bg: "#eff6ff" },
// };

// const STATUS_RANK = { FAIL: 0, WARNING: 1, PASS: 2 };

// const STATUS_LABELS = {
//   MANUAL_REVIEW: "MANUAL REVIEW",
//   NOT_TESTED:    "NOT TESTED",
// };

// const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };

// const severityClass = (s) => {
//   if (s === "CRITICAL") return "sev-critical";
//   if (s === "HIGH")     return "sev-high";
//   if (s === "MEDIUM")   return "sev-medium";
//   if (s === "LOW")      return "sev-low";
//   return "sev-info";
// };

// const statusClass = (s) => {
//   if (s === "FAIL")    return "st-fail";
//   if (s === "PASS")    return "st-pass";
//   if (s === "WARNING") return "st-warn";
//   return "st-info";
// };

// const scoreColors = (band) => {
//   const b = (band || "").toLowerCase();
//   if (b.startsWith("low"))    return { color: "#16a34a", bg: "#dcfce7" };
//   if (b.startsWith("medium")) return { color: "#d97706", bg: "#fef3c7" };
//   if (b.startsWith("high"))   return { color: "#ea580c", bg: "#ffedd5" };
//   return { color: "#dc2626", bg: "#fee2e2" };
// };

// export default function ValidateWord() {
//   const navigate = useNavigate();

//   const [wordFile, setWordFile]         = useState(null);
//   const [dragOver, setDragOver]       = useState(false);
//   const [submitting, setSubmitting]   = useState(false);
//   const [rawResult, setRawResult]     = useState(null);
//   const [submitError, setSubmitError] = useState("");

//   const wordInputRef = useRef(null);

//   const isWordFile = (name) => /\.(docx|doc)$/i.test(name || "");

//   const handleWordSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!isWordFile(file.name)) { alert("Please upload a Word file (.doc or .docx)"); return; }
//     setWordFile(file); setRawResult(null); setSubmitError("");
//   };

//   const handleDrop = (e) => {
//     e.preventDefault(); setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (!file) return;
//     if (!isWordFile(file.name)) { alert("Please drop a Word file (.doc or .docx)"); return; }
//     setWordFile(file); setRawResult(null); setSubmitError("");
//   };

//   const formatBytes = (bytes) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   const handleSubmit = async () => {
//     if (!wordFile) { alert("Please upload a Word document first."); return; }
//     setSubmitting(true); setRawResult(null); setSubmitError("");
//     try {
//       const orgId     = sessionStorage.getItem("organization_id") || 1;
//       const projectId = sessionStorage.getItem("project_id")      || 1;
//       const response  = await orionValidateWord(wordFile, orgId, projectId);
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

//   const parseResult = (raw) => {
//     if (!raw) return null;
//     const d = raw?.data ?? raw;

//     const summary    = d.summary ?? {};
//     const sevDist    = d.severity_distribution ?? {};
//     const doc        = d.document ?? {};
//     const scoreInfo  = d.accessibility_score ?? null;
//     const categories = d.findings_by_category ?? {};

//     const failed        = summary.failed ?? 0;
//     const manualPending = summary.manual_validation_pending ?? 0;
//     const totalIssues   = failed + manualPending;

//     const executionTime = Object.values(categories).reduce((sum, c) => sum + (c.duration_ms ?? 0), 0);

//     const meta = {
//       document_name:       d.document_name ?? doc.name,
//       total_pages:         doc.pages_reported,
//       total_checks:        summary.total_checks,
//       total_issues:        totalIssues,
//       overall_status:      failed > 0 ? "FAIL" : "PASS",
//       critical_count:      sevDist.CRITICAL?.failed_checks ?? 0,
//       high_count:          sevDist.HIGH?.failed_checks ?? 0,
//       medium_count:        sevDist.MEDIUM?.failed_checks ?? 0,
//       low_count:           sevDist.LOW?.failed_checks ?? 0,
//       warning_count:       manualPending,
//       manual_review_count: manualPending,
//       execution_time_ms:   executionTime > 0 ? executionTime : null,
//     };

//     const score = scoreInfo ? {
//       overall:        scoreInfo.score,
//       band:           `${scoreInfo.risk_level ?? "Unknown"} Risk`,
//       scored_checks:  summary.total_checks,
//       counts: {
//         pass:    summary.passed ?? 0,
//         fail:    failed,
//         warning: manualPending,
//         info:    summary.not_applicable ?? 0,
//       },
//       categories: Object.fromEntries(
//         Object.entries(categories)
//           .filter(([, c]) => (c.passed ?? 0) + (c.failed ?? 0) > 0)
//           .map(([key, c]) => [
//             CATEGORY_LABELS[key] ?? key,
//             Math.round(((c.passed ?? 0) / ((c.passed ?? 0) + (c.failed ?? 0))) * 100),
//           ])
//       ),
//     } : null;

//     const agents = Object.entries(categories).map(([key, cat]) => {
//       const name = CATEGORY_LABELS[key] ?? key;
//       const findingByRule = {};
//       for (const f of cat.findings ?? []) findingByRule[f.rule_id] = f;

//       const issues = (cat.checks ?? [])
//         .filter((c) => c.status !== "NOT_APPLICABLE")
//         .map((c) => {
//           const finding = findingByRule[c.rule_id];
//           const status = c.status === "FAIL" || c.status === "PASS" ? c.status : "WARNING";
//           return {
//             rule_id:        c.rule_id,
//             severity:       c.severity,
//             status,
//             status_label:   STATUS_LABELS[c.status] ?? status,
//             category:       "Checks",
//             message:        finding?.issue ?? c.title,
//             recommendation: finding?.recommendation,
//             wcag:           finding?.wcag ?? [],
//           };
//         })
//         .sort((a, b) =>
//           (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) ||
//           (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
//         );

//       const failCount = issues.filter(i => i.status === "FAIL").length;
//       const warnCount = issues.filter(i => i.status === "WARNING").length;
//       const passCount = issues.filter(i => i.status === "PASS").length;
//       const manualCount = issues.filter(i => i.status_label === STATUS_LABELS.MANUAL_REVIEW).length;
//       const agentMeta = AGENT_META[name] ?? { icon: "🔍", color: "#6366f1", bg: "#eef2ff" };

//       return {
//         name,
//         ...agentMeta,
//         success:    cat.status === "completed",
//         issueCount: issues.length,
//         failCount,
//         warnCount,
//         passCount,
//         manualCount,
//         allIssues: issues,
//       };
//     });

//     return { meta, score, agents };
//   };

//   const parsed = parseResult(rawResult);
//   const agentAnchorId = (name) => `vwd-agent-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

//   const scrollToAgent = (name) => {
//     const el = document.getElementById(agentAnchorId(name));
//     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   const isFail = parsed?.meta?.overall_status === "FAIL";
//   const scoreTheme = scoreColors(parsed?.score?.band);

//   const handleDownloadReport = () => {
//     if (!rawResult) return;
//     const timestamp = new Date().toISOString().split("T")[0];
//     const filename = `word-validation-report-${timestamp}.json`;
//     downloadAsJson(rawResult, filename);
//   };

//   return (
//     <div className="vwd-page">

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="vwd-main">

//         {/* Topbar */}
//         <div className="vwd-topbar">
//           <div className="vwd-topbar-left">
//             <button
//               className="vwd-back-fab"
//               onClick={() => navigate("/accessibility")}
//               title="Back to Accessibility"
//               aria-label="Back to Accessibility"
//             >
//               ←
//             </button>
//             <div className="vwd-breadcrumb">
//               <span className="vwd-bc-root">Accessibility</span>
//               <span className="vwd-bc-sep">›</span>
//               <span className="vwd-bc-current">Validate Word</span>
//             </div>
//           </div>
//           <div className="vwd-topbar-right">
//             {wordFile && !submitting && !rawResult && (
//               <div className="vwd-status-chip chip-ready">
//                 <span className="vwd-chip-dot dot-green"></span>
//                 Word Ready
//               </div>
//             )}
//             {submitting && (
//               <div className="vwd-status-chip chip-running">
//                 <span className="vwd-chip-spin"></span>
//                 Validating…
//               </div>
//             )}
//             {rawResult && !submitting && (
//               <div className={`vwd-status-chip ${isFail ? "chip-fail" : "chip-pass"}`}>
//                 <span className={`vwd-chip-dot ${isFail ? "dot-red" : "dot-green"}`}></span>
//                 {isFail ? `${parsed.meta.total_issues} Issues Found` : "All Checks Passed"}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="vwd-content">

//           {/* ══ STEP 1 — Upload ══ */}
//           <section className="vwd-step-card">
//             <div className="vwd-step-badge">
//               <span>1</span>
//             </div>
//             <div className="vwd-step-body">
//               <div className="vwd-step-head">
//                 <div>
//                   <h2 className="vwd-step-title">Upload Word Document</h2>
//                   <p className="vwd-step-desc">Drop your Word document for multi-agent accessibility validation — Metadata, Structure, Images, Contrast and more.</p>
//                 </div>
//                 <div className="vwd-agent-pills">
//                   {Object.entries(AGENT_META).slice(0, 6).map(([name, m]) => (
//                     <span key={name} className="vwd-agent-pill" style={{ "--pill-color": m.color, "--pill-bg": m.bg }}>
//                       {m.icon} {name.split(" ")[0]}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <input ref={wordInputRef} type="file" accept=".doc,.docx" style={{ display: "none" }} onChange={handleWordSelect} />

//               <div className="vwd-upload-row">
//                 {/* Drop zone */}
//                 <div
//                   className={`vwd-dropzone ${dragOver ? "drag-over" : ""} ${wordFile ? "has-file" : ""}`}
//                   onClick={() => wordInputRef.current.click()}
//                   onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//                   onDragLeave={() => setDragOver(false)}
//                   onDrop={handleDrop}
//                 >
//                   {wordFile ? (
//                     <div className="vwd-file-preview">
//                       <div className="vwd-file-pdf-icon">
//                         <span>DOC</span>
//                       </div>
//                       <div className="vwd-file-info">
//                         <span className="vwd-file-name">{wordFile.name}</span>
//                         <span className="vwd-file-size">{formatBytes(wordFile.size)}</span>
//                         <span className="vwd-file-ready">Ready to validate</span>
//                       </div>
//                       <button className="vwd-remove-btn"
//                         onClick={(e) => { e.stopPropagation(); setWordFile(null); setRawResult(null); setSubmitError(""); }}
//                         title="Remove file">✕</button>
//                     </div>
//                   ) : (
//                     <div className="vwd-dropzone-content">
//                       <div className="vwd-drop-cloud">☁</div>
//                       <p className="vwd-drop-title">Drag &amp; drop your Word document here</p>
//                       <p className="vwd-drop-hint">or <span className="vwd-drop-link">click to browse</span></p>
//                       <p className="vwd-drop-note">Only .doc / .docx files · Max 50MB recommended</p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Run panel */}
//                 <div className="vwd-run-panel">
//                   <div className="vwd-run-info">
//                     <p className="vwd-run-label">What gets checked</p>
//                     <ul className="vwd-run-checks">
//                       <li><span className="vwd-check-icon">🏷️</span> Document metadata &amp; language</li>
//                       <li><span className="vwd-check-icon">🧩</span> Document &amp; heading structure</li>
//                       <li><span className="vwd-check-icon">🖼️</span> Image alt-text &amp; contrast</li>
//                       <li><span className="vwd-check-icon">📊</span> Tables, links &amp; reading order</li>
//                     </ul>
//                   </div>
//                   <button
//                     className="vwd-run-btn"
//                     onClick={handleSubmit}
//                     disabled={!wordFile || submitting}
//                   >
//                     {submitting
//                       ? <><span className="vwd-btn-spin"></span> Validating Word Document…</>
//                       : <><span className="vwd-run-rocket">🚀</span> Run Accessibility Checks</>}
//                   </button>
//                   {submitError && (
//                     <div className="vwd-error-banner">
//                       <span className="vwd-error-ico">⚠</span>
//                       <div>
//                         <p className="vwd-error-ttl">Validation Failed</p>
//                         <p className="vwd-error-msg">{submitError}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* ══ STEP 2 — Results ══ */}
//           <section className={`vwd-step-card ${!rawResult && !submitting ? "vwd-step-locked" : ""}`}>
//             <div className="vwd-step-badge vwd-step-badge--2">
//               <span>2</span>
//             </div>
//             <div className="vwd-step-body">
//               <div className="vwd-step-head">
//                 <div>
//                   <h2 className="vwd-step-title">Validation Report</h2>
//                   <p className="vwd-step-desc">Detailed accessibility check results broken down by agent and category.</p>
//                 </div>
//                 {rawResult && parsed && (
//                   <div className="vwd-results-header-right">
//                     <div className={`vwd-overall-badge ${isFail ? "badge-fail" : "badge-pass"}`}>
//                       {isFail ? "⚠️ FAIL" : "✅ PASS"}
//                     </div>
//                     <button
//                       className="vwd-download-report-icon-btn"
//                       onClick={handleDownloadReport}
//                       title="Download Report"
//                     >
//                       <svg className="vwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
//                         <polyline points="7 10 12 15 17 10"></polyline>
//                         <line x1="12" y1="15" x2="12" y2="3"></line>
//                       </svg>
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Empty state */}
//               {!rawResult && !submitting && (
//                 <div className="vwd-empty-state">
//                   <div className="vwd-empty-illustration">
//                     <div className="vwd-empty-doc">
//                       <div className="vwd-empty-line"></div>
//                       <div className="vwd-empty-line short"></div>
//                       <div className="vwd-empty-line"></div>
//                       <div className="vwd-empty-line medium"></div>
//                     </div>
//                     <div className="vwd-empty-scan"></div>
//                   </div>
//                   <p className="vwd-empty-title">No results yet</p>
//                   <p className="vwd-empty-sub">Upload a Word document and run validation to see the report here.</p>
//                 </div>
//               )}

//               {/* Loading state */}
//               {submitting && (
//                 <div className="vwd-empty-state">
//                   <div className="vwd-scanning-wrap">
//                     <div className="vwd-scanning-doc">
//                       <div className="vwd-scan-beam"></div>
//                       <div className="vwd-s-line"></div>
//                       <div className="vwd-s-line short"></div>
//                       <div className="vwd-s-line"></div>
//                       <div className="vwd-s-line medium"></div>
//                       <div className="vwd-s-line"></div>
//                     </div>
//                   </div>
//                   <p className="vwd-empty-title" style={{ marginTop: 20 }}>Scanning Word Document…</p>
//                   <p className="vwd-empty-sub">Running multi-agent accessibility checks</p>
//                 </div>
//               )}

//               {/* ── Results ── */}
//               {rawResult && !submitting && parsed && (
//                 <div className="vwd-results">

//                   {/* ── Document Info ── */}
//                   <div className="vwd-doc-info-card">

//                     {/* Top row: file identity + overall status */}
//                     <div className="vwd-dic-top">
//                       <div className="vwd-dic-file">
//                         <div className="vwd-dic-file-icon">
//                           <span>DOC</span>
//                         </div>
//                         <div className="vwd-dic-file-meta">
//                           <span className="vwd-dic-filename">{parsed.meta.document_name ?? "—"}</span>
//                           <div className="vwd-dic-pills">
//                             {parsed.meta.total_pages != null && (
//                               <span className="vwd-dic-pill">
//                                 <span className="vwd-dic-pill-icon">🗒️</span>
//                                 {parsed.meta.total_pages} {parsed.meta.total_pages === 1 ? "page" : "pages"}
//                               </span>
//                             )}
//                             {parsed.meta.total_checks != null && (
//                               <span className="vwd-dic-pill">
//                                 <span className="vwd-dic-pill-icon">🔍</span>
//                                 {parsed.meta.total_checks} checks
//                               </span>
//                             )}
//                             {parsed.meta.execution_time_ms != null && (
//                               <span className="vwd-dic-pill">
//                                 <span className="vwd-dic-pill-icon">⏱</span>
//                                 {parsed.meta.execution_time_ms} ms
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <div className={`vwd-dic-verdict ${isFail ? "verdict-fail" : "verdict-pass"}`}>
//                         <span className="vwd-dic-verdict-icon">{isFail ? "✗" : "✓"}</span>
//                         <div>
//                           <span className="vwd-dic-verdict-label">{isFail ? "FAIL" : "PASS"}</span>
//                           <span className="vwd-dic-verdict-sub">
//                             {isFail ? `${parsed.meta.total_issues} issue${parsed.meta.total_issues !== 1 ? "s" : ""} found` : "All checks passed"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Two-column body */}
//                     <div className="vwd-dic-body">

//                       {/* Left col — Severity breakdown */}
//                       <div className="vwd-dic-col">
//                         <p className="vwd-dic-col-label">Issue Severity</p>
//                         <div className="vwd-dic-sev-list">
//                           {[
//                             { key: "critical_count", label: "Critical", cls: "sev-critical", dot: "#dc2626" },
//                             { key: "high_count",     label: "High",     cls: "sev-high",     dot: "#ea580c" },
//                             { key: "medium_count",   label: "Medium",   cls: "sev-medium",   dot: "#ca8a04" },
//                             { key: "low_count",      label: "Low",      cls: "sev-low",      dot: "#16a34a" },
//                             { key: "warning_count",  label: "Warning",  cls: "sev-info",      dot: "#0891b2" },
//                           ].filter(s => parsed.meta[s.key] != null).map(s => (
//                             <div key={s.key} className="vwd-dic-sev-row">
//                               <span className="vwd-dic-sev-dot" style={{ background: s.dot }}></span>
//                               <span className="vwd-dic-sev-label">{s.label}</span>
//                               <div className="vwd-dic-sev-bar-wrap">
//                                 <div
//                                   className={`vwd-dic-sev-bar ${s.cls}`}
//                                   style={{ width: parsed.meta.total_issues > 0 ? `${Math.round(((parsed.meta[s.key] ?? 0) / parsed.meta.total_issues) * 100)}%` : "0%" }}
//                                 ></div>
//                               </div>
//                               <span className={`vwd-dic-sev-count ${s.cls}`}>{parsed.meta[s.key] ?? 0}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Right col — Resolution breakdown */}
//                       <div className="vwd-dic-col">
//                         <p className="vwd-dic-col-label">Resolution Breakdown</p>
//                         <div className="vwd-dic-res-list">
//                           {parsed.meta.auto_fixable_count != null && (
//                             <div className="vwd-dic-res-item res-auto">
//                               <div className="vwd-dic-res-icon">⚡</div>
//                               <div className="vwd-dic-res-info">
//                                 <span className="vwd-dic-res-count">{parsed.meta.auto_fixable_count}</span>
//                                 <span className="vwd-dic-res-label">Auto-fixable</span>
//                               </div>
//                             </div>
//                           )}
//                           {parsed.meta.manual_review_count != null && (
//                             <div className="vwd-dic-res-item res-manual">
//                               <div className="vwd-dic-res-icon">👁️</div>
//                               <div className="vwd-dic-res-info">
//                                 <span className="vwd-dic-res-count">{parsed.meta.manual_review_count}</span>
//                                 <span className="vwd-dic-res-label">Manual review</span>
//                               </div>
//                             </div>
//                           )}
//                           {parsed.meta.ai_review_count != null && (
//                             <div className="vwd-dic-res-item res-ai">
//                               <div className="vwd-dic-res-icon">🤖</div>
//                               <div className="vwd-dic-res-info">
//                                 <span className="vwd-dic-res-count">{parsed.meta.ai_review_count}</span>
//                                 <span className="vwd-dic-res-label">AI review</span>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                     </div>
//                   </div>

//                   {/* ── Accessibility Score ── */}
//                   {parsed.score && (
//                     <div className="vwd-score-card">
//                       <div className="vwd-score-top">
//                         <div
//                           className="vwd-score-ring"
//                           style={{ "--score-pct": parsed.score.overall, "--score-color": scoreTheme.color }}
//                         >
//                           <span className="vwd-score-ring-value">
//                             {parsed.score.overall}%
//                           </span>
//                         </div>
//                         <div className="vwd-score-headline">
//                           <div className="vwd-score-title-row">
//                             <span className="vwd-score-title">Accessibility Score</span>
//                             <span
//                               className="vwd-score-band"
//                               style={{ "--score-color": scoreTheme.color, "--score-bg": scoreTheme.bg }}
//                             >
//                               {parsed.score.band}
//                             </span>
//                           </div>
//                           <p className="vwd-score-sub">
//                             Based on {parsed.score.scored_checks ?? parsed.meta.total_checks} scored checks across all categories.
//                           </p>
//                         </div>
//                         {parsed.score.counts && (
//                           <div className="vwd-score-counts">
//                             <span className="vwd-score-count-chip">
//                               <span className="vwd-score-count-dot" style={{ background: "#16a34a" }}></span>
//                               {parsed.score.counts.pass ?? 0} Pass
//                             </span>
//                             <span className="vwd-score-count-chip">
//                               <span className="vwd-score-count-dot" style={{ background: "#dc2626" }}></span>
//                               {parsed.score.counts.fail ?? 0} Fail
//                             </span>
//                             <span className="vwd-score-count-chip">
//                               <span className="vwd-score-count-dot" style={{ background: "#0891b2" }}></span>
//                               {parsed.score.counts.warning ?? 0} Warning
//                             </span>
//                             {parsed.score.counts.info != null && (
//                               <span className="vwd-score-count-chip">
//                                 <span className="vwd-score-count-dot" style={{ background: "#94a3b8" }}></span>
//                                 {parsed.score.counts.info} Info
//                               </span>
//                             )}
//                           </div>
//                         )}
//                       </div>

//                       {parsed.score.categories && (
//                         <div className="vwd-score-categories">
//                           {Object.entries(parsed.score.categories).map(([cat, val]) => {
//                             const barColor = val >= 90 ? "#16a34a" : val >= 75 ? "#2563eb" : val >= 50 ? "#d97706" : "#dc2626";
//                             return (
//                               <div key={cat} className="vwd-score-cat-row">
//                                 <span className="vwd-score-cat-label">{cat}</span>
//                                 <div className="vwd-score-cat-bar-wrap">
//                                   <div className="vwd-score-cat-bar" style={{ width: `${val}%`, background: barColor }}></div>
//                                 </div>
//                                 <span className="vwd-score-cat-val">{val}%</span>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* ── Category detail cards ── */}
//                   <div className="vwd-detail-list">
//                     {parsed.agents.map((agent) => {
//                       const issueCount = agent.failCount + agent.warnCount;

//                       return (
//                         <div
//                           key={agent.name}
//                           id={agentAnchorId(agent.name)}
//                           className="vwd-detail-card"
//                           style={{ "--agent-color": agent.color, "--agent-bg": agent.bg }}
//                         >
//                           <div className="vwd-detail-head">
//                             <span className="vwd-detail-icon">{agent.icon}</span>
//                             <span className="vwd-detail-title">{agent.name}</span>
//                             {issueCount > 0 && (
//                               <span className="vwd-detail-count vwd-detail-count--issues">
//                                 {issueCount} {issueCount === 1 ? "issue" : "issues"}
//                               </span>
//                             )}
//                             <span className="vwd-detail-count">
//                               {agent.issueCount} {agent.issueCount === 1 ? "check" : "checks"}
//                             </span>
//                             <span className="vwd-detail-count vwd-detail-count--passed">
//                               {agent.passCount} passed
//                             </span>
//                             <span className="vwd-detail-count vwd-detail-count--manual">
//                               {agent.manualCount} manual review
//                             </span>
//                           </div>

//                           <div className="vwd-detail-body">
//                             <div className="vwd-issues-list">
//                               {agent.allIssues.length === 0 && (
//                                 <div className="vwd-no-issues">
//                                   <span>✅</span>
//                                   <p>No checks in this category</p>
//                                 </div>
//                               )}
//                               {agent.allIssues.map((issue, ri) => (
//                                 <div
//                                   key={`${issue.rule_id}-${ri}`}
//                                   className={`vwd-issue-row issue-${issue.status.toLowerCase()}`}
//                                 >
//                                   <div className="vwd-issue-row-top">
//                                     <div className="vwd-issue-left">
//                                       <span className={`vwd-sev-dot-sm ${severityClass(issue.severity)}`} title={`${issue.severity} severity`}></span>
//                                       <code className="vwd-rule-id">{issue.rule_id}</code>
//                                     </div>
//                                     <div className="vwd-issue-right">
//                                       <span className={`vwd-status-badge ${statusClass(issue.status)}`}>{issue.status_label}</span>
//                                       {issue.auto_fixable && (
//                                         <span className="vwd-autofixable" title="Auto-fixable">⚡</span>
//                                       )}
//                                     </div>
//                                   </div>
//                                   <p className="vwd-issue-msg">{issue.message}</p>
//                                   {(issue.status === "FAIL" || issue.status === "WARNING") && issue.recommendation && (
//                                     <div className="vwd-issue-rec">
//                                       <span className="vwd-rec-bulb">💡</span>
//                                       <p>{issue.recommendation}</p>
//                                     </div>
//                                   )}
//                                   {issue.wcag?.length > 0 && (
//                                     <span className="vwd-page-tag">WCAG {issue.wcag.join(", ")}</span>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* ── Summary ── */}
//                   <div className="vwd-summary-card">
//                     <div className="vwd-summary-header">
//                       <span className="vwd-summary-icon">📊</span>
//                       <h3 className="vwd-summary-title">Agent Summary</h3>
//                     </div>
//                     <div className="vwd-summary-rows">
//                       {parsed.agents.map((agent) => {
//                         const total = agent.issueCount;
//                         const failPct = total > 0 ? Math.round((agent.failCount / total) * 100) : 0;
//                         return (
//                           <div
//                             key={agent.name}
//                             className="vwd-summary-row vwd-summary-row--link"
//                             role="button"
//                             tabIndex={0}
//                             title={`Go to ${agent.name} details`}
//                             onClick={() => scrollToAgent(agent.name)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter" || e.key === " ") {
//                                 e.preventDefault();
//                                 scrollToAgent(agent.name);
//                               }
//                             }}
//                           >
//                             <div className="vwd-summary-row-left">
//                               <span className="vwd-sum-icon">{agent.icon}</span>
//                               <div className="vwd-sum-info">
//                                 <span className="vwd-sum-name">{agent.name}</span>
//                                 <span className="vwd-sum-counts">{total} checks</span>
//                               </div>
//                             </div>
//                             <div className="vwd-summary-row-right">
//                               {agent.failCount > 0 && (
//                                 <span className="vwd-sum-badge sum-fail">{agent.failCount} Failed</span>
//                               )}
//                               {agent.warnCount > 0 && (
//                                 <span className="vwd-sum-badge sum-warn">{agent.warnCount} Warnings</span>
//                               )}
//                               {agent.passCount > 0 && (
//                                 <span className="vwd-sum-badge sum-pass">{agent.passCount} Passed</span>
//                               )}
//                             </div>
//                             <div className="vwd-sum-bar-wrap">
//                               <div
//                                 className="vwd-sum-bar"
//                                 style={{ width: `${failPct}%`, background: agent.failCount > 0 ? "#ef4444" : "#22c55e" }}
//                               ></div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {/* Final verdict */}
//                     <div className={`vwd-verdict ${isFail ? "verdict-fail" : "verdict-pass"}`}>
//                       <div className="vwd-verdict-icon">{isFail ? "⚠️" : "🎉"}</div>
//                       <div className="vwd-verdict-text">
//                         <p className="vwd-verdict-main">
//                           {isFail
//                             ? `Document has ${parsed.meta.total_issues} accessibility issue${parsed.meta.total_issues !== 1 ? "s" : ""} that need attention`
//                             : "Document passed all accessibility checks!"}
//                         </p>
//                         {parsed.meta.manual_review_count > 0 && (
//                           <p className="vwd-verdict-sub">
//                             {parsed.meta.manual_review_count} need manual review
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               )}
//             </div>
//           </section>

//         </div>
//       </main>
//     </div>
//   );
// }


import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orionValidateWord } from "../../../services/apiServices";
import "./ValidateWord.css";

const downloadAsJson = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const CATEGORY_LABELS = {
  STRUCTURAL_ACCESSIBILITY:    "Structure Accessibility",
  METADATA_ACCESSIBILITY:      "Metadata Accessibility",
  IMAGE_ACCESSIBILITY:         "Image Accessibility",
  TABLE_ACCESSIBILITY:         "Table Accessibility",
  VISUAL_ACCESSIBILITY:        "Visual Accessibility",
  READING_ORDER:               "Reading Order",
  SCREEN_READER_COMPATIBILITY: "Screen Reader Compatibility",
};

const AGENT_META = {
  "Structure Accessibility":     { icon: "🏗️", color: "#0891b2", bg: "#ecfeff" },
  "Metadata Accessibility":      { icon: "🏷️", color: "#6366f1", bg: "#eef2ff" },
  "Image Accessibility":         { icon: "🖼️", color: "#7c3aed", bg: "#f5f3ff" },
  "Table Accessibility":         { icon: "📊", color: "#0d9488", bg: "#f0fdfa" },
  "Visual Accessibility":        { icon: "🎨", color: "#db2777", bg: "#fdf2f8" },
  "Reading Order":               { icon: "🔀", color: "#ea580c", bg: "#fff7ed" },
  "Screen Reader Compatibility": { icon: "🔊", color: "#2563eb", bg: "#eff6ff" },
};

const STATUS_RANK = { FAIL: 0, WARNING: 1, PASS: 2, NOT_APPLICABLE: 3 };

const STATUS_LABELS = {
  MANUAL_REVIEW:  "MANUAL REVIEW",
  NOT_TESTED:     "NOT TESTED",
  NOT_APPLICABLE: "NOT APPLICABLE",
};

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };

const severityClass = (s) => {
  if (s === "CRITICAL") return "sev-critical";
  if (s === "HIGH")     return "sev-high";
  if (s === "MEDIUM")   return "sev-medium";
  if (s === "LOW")      return "sev-low";
  return "sev-info";
};

const statusClass = (s) => {
  if (s === "FAIL")    return "st-fail";
  if (s === "PASS")    return "st-pass";
  if (s === "WARNING") return "st-warn";
  return "st-info";
};

const scoreColors = (band) => {
  const b = (band || "").toLowerCase();
  if (b.startsWith("low"))    return { color: "#16a34a", bg: "#dcfce7" };
  if (b.startsWith("medium")) return { color: "#d97706", bg: "#fef3c7" };
  if (b.startsWith("high"))   return { color: "#ea580c", bg: "#ffedd5" };
  return { color: "#dc2626", bg: "#fee2e2" };
};

export default function ValidateWord() {
  const navigate = useNavigate();

  const [wordFile, setWordFile]         = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [rawResult, setRawResult]     = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [openCategories, setOpenCategories] = useState({});

  const wordInputRef = useRef(null);

  const isWordFile = (name) => /\.(docx|doc)$/i.test(name || "");

  const handleWordSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isWordFile(file.name)) { alert("Please upload a Word file (.doc or .docx)"); return; }
    setWordFile(file); setRawResult(null); setSubmitError("");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isWordFile(file.name)) { alert("Please drop a Word file (.doc or .docx)"); return; }
    setWordFile(file); setRawResult(null); setSubmitError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async () => {
    if (!wordFile) { alert("Please upload a Word document first."); return; }
    setSubmitting(true); setRawResult(null); setSubmitError(""); setOpenCategories({});
    try {
      const orgId     = sessionStorage.getItem("organization_id") || 1;
      const projectId = sessionStorage.getItem("project_id")      || 1;
      const response  = await orionValidateWord(wordFile, orgId, projectId);
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      const data = await response.json();
      setRawResult(data);
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const parseResult = (raw) => {
    if (!raw) return null;
    const d = raw?.data ?? raw;

    const summary    = d.summary ?? {};
    const sevDist    = d.severity_distribution ?? {};
    const doc        = d.document ?? {};
    const scoreInfo  = d.accessibility_score ?? null;
    const categories = d.findings_by_category ?? {};

    const failed        = summary.failed ?? 0;
    const manualPending = summary.manual_validation_pending ?? 0;
    const totalIssues   = failed + manualPending;

    const executionTime = Object.values(categories).reduce((sum, c) => sum + (c.duration_ms ?? 0), 0);

    const meta = {
      document_name:       d.document_name ?? doc.name,
      total_pages:         doc.pages_reported,
      total_checks:        summary.total_checks,
      total_issues:        totalIssues,
      overall_status:      failed > 0 ? "FAIL" : "PASS",
      critical_count:      sevDist.CRITICAL?.failed_checks ?? 0,
      high_count:          sevDist.HIGH?.failed_checks ?? 0,
      medium_count:        sevDist.MEDIUM?.failed_checks ?? 0,
      low_count:           sevDist.LOW?.failed_checks ?? 0,
      warning_count:       manualPending,
      manual_review_count: manualPending,
      execution_time_ms:   executionTime > 0 ? executionTime : null,
    };

    const score = scoreInfo ? {
      overall:        scoreInfo.score,
      band:           `${scoreInfo.risk_level ?? "Unknown"} Risk`,
      scored_checks:  summary.total_checks,
      counts: {
        pass:    summary.passed ?? 0,
        fail:    failed,
        warning: manualPending,
        info:    summary.not_applicable ?? 0,
      },
      categories: Object.fromEntries(
        Object.entries(categories)
          .filter(([, c]) => (c.passed ?? 0) + (c.failed ?? 0) > 0)
          .map(([key, c]) => [
            CATEGORY_LABELS[key] ?? key,
            Math.round(((c.passed ?? 0) / ((c.passed ?? 0) + (c.failed ?? 0))) * 100),
          ])
      ),
    } : null;

    const agents = Object.entries(categories).map(([key, cat]) => {
      const name = CATEGORY_LABELS[key] ?? key;
      const findingByRule = {};
      for (const f of cat.findings ?? []) findingByRule[f.rule_id] = f;

      const issues = (cat.checks ?? [])
        .map((c) => {
          const finding = findingByRule[c.rule_id];
          const status = ["FAIL", "PASS", "NOT_APPLICABLE"].includes(c.status) ? c.status : "WARNING";
          return {
            rule_id:        c.rule_id,
            severity:       c.severity,
            status,
            status_label:   STATUS_LABELS[c.status] ?? status,
            category:       "Checks",
            message:        finding?.issue ?? c.title,
            recommendation: finding?.recommendation,
            wcag:           finding?.wcag ?? [],
          };
        })
        .sort((a, b) =>
          (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) ||
          (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
        );

      const failCount = issues.filter(i => i.status === "FAIL").length;
      const manualCount = issues.filter(i => i.status === "WARNING").length;
      const passCount = issues.filter(i => i.status === "PASS").length;
      const naCount = issues.filter(i => i.status === "NOT_APPLICABLE").length;
      const agentMeta = AGENT_META[name] ?? { icon: "🔍", color: "#6366f1", bg: "#eef2ff" };

      return {
        name,
        ...agentMeta,
        success:    cat.status === "completed",
        totalCount: issues.length,
        failCount,
        passCount,
        manualCount,
        naCount,
        allIssues: issues,
      };
    });

    return { meta, score, agents };
  };

  const parsed = parseResult(rawResult);
  const agentAnchorId = (name) => `vwd-agent-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  const scrollToAgent = (name) => {
    const el = document.getElementById(agentAnchorId(name));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCategory = (name) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isFail = parsed?.meta?.overall_status === "FAIL";
  const scoreTheme = scoreColors(parsed?.score?.band);

  const handleDownloadReport = () => {
    if (!rawResult) return;
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `word-validation-report-${timestamp}.json`;
    downloadAsJson(rawResult, filename);
  };

  return (
    <div className="vwd-page">

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="vwd-main">

        {/* Topbar */}
        <div className="vwd-topbar">
          <div className="vwd-topbar-left">
            <button
              className="vwd-back-fab"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
              aria-label="Back to Accessibility"
            >
              ←
            </button>
            <div className="vwd-breadcrumb">
              <span className="vwd-bc-root">Accessibility</span>
              <span className="vwd-bc-sep">›</span>
              <span className="vwd-bc-current">Validate Word</span>
            </div>
          </div>
          <div className="vwd-topbar-right">
            {wordFile && !submitting && !rawResult && (
              <div className="vwd-status-chip chip-ready">
                <span className="vwd-chip-dot dot-green"></span>
                Word Ready
              </div>
            )}
            {submitting && (
              <div className="vwd-status-chip chip-running">
                <span className="vwd-chip-spin"></span>
                Validating…
              </div>
            )}
            {rawResult && !submitting && (
              <div className={`vwd-status-chip ${isFail ? "chip-fail" : "chip-pass"}`}>
                <span className={`vwd-chip-dot ${isFail ? "dot-red" : "dot-green"}`}></span>
                {isFail ? `${parsed.meta.total_issues} Issues Found` : "All Checks Passed"}
              </div>
            )}
          </div>
        </div>

        <div className="vwd-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="vwd-step-card">
            <div className="vwd-step-badge">
              <span>1</span>
            </div>
            <div className="vwd-step-body">
              <div className="vwd-step-head">
                <div>
                  <h2 className="vwd-step-title">Upload Word Document</h2>
                  <p className="vwd-step-desc">Drop your Word document for multi-agent accessibility validation — Metadata, Structure, Images, Contrast and more.</p>
                </div>
                <div className="vwd-agent-pills">
                  {Object.entries(AGENT_META).slice(0, 6).map(([name, m]) => (
                    <span key={name} className="vwd-agent-pill" style={{ "--pill-color": m.color, "--pill-bg": m.bg }}>
                      {m.icon} {name.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>

              <input ref={wordInputRef} type="file" accept=".doc,.docx" style={{ display: "none" }} onChange={handleWordSelect} />

              <div className="vwd-upload-row">
                {/* Drop zone */}
                <div
                  className={`vwd-dropzone ${dragOver ? "drag-over" : ""} ${wordFile ? "has-file" : ""}`}
                  onClick={() => wordInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {wordFile ? (
                    <div className="vwd-file-preview">
                      <div className="vwd-file-pdf-icon">
                        <span>DOC</span>
                      </div>
                      <div className="vwd-file-info">
                        <span className="vwd-file-name">{wordFile.name}</span>
                        <span className="vwd-file-size">{formatBytes(wordFile.size)}</span>
                        <span className="vwd-file-ready">Ready to validate</span>
                      </div>
                      <button className="vwd-remove-btn"
                        onClick={(e) => { e.stopPropagation(); setWordFile(null); setRawResult(null); setSubmitError(""); }}
                        title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="vwd-dropzone-content">
                      <div className="vwd-drop-cloud">☁</div>
                      <p className="vwd-drop-title">Drag &amp; drop your Word document here</p>
                      <p className="vwd-drop-hint">or <span className="vwd-drop-link">click to browse</span></p>
                      <p className="vwd-drop-note">Only .doc / .docx files · Max 50MB recommended</p>
                    </div>
                  )}
                </div>

                {/* Run panel */}
                <div className="vwd-run-panel">
                  <div className="vwd-run-info">
                    <p className="vwd-run-label">What gets checked</p>
                    <ul className="vwd-run-checks">
                      <li><span className="vwd-check-icon">🏷️</span> Document metadata &amp; language</li>
                      <li><span className="vwd-check-icon">🧩</span> Document &amp; heading structure</li>
                      <li><span className="vwd-check-icon">🖼️</span> Image alt-text &amp; contrast</li>
                      <li><span className="vwd-check-icon">📊</span> Tables, links &amp; reading order</li>
                    </ul>
                  </div>
                  <button
                    className="vwd-run-btn"
                    onClick={handleSubmit}
                    disabled={!wordFile || submitting}
                  >
                    {submitting
                      ? <><span className="vwd-btn-spin"></span> Validating Word Document…</>
                      : <><span className="vwd-run-rocket">🚀</span> Run Accessibility Checks</>}
                  </button>
                  {submitError && (
                    <div className="vwd-error-banner">
                      <span className="vwd-error-ico">⚠</span>
                      <div>
                        <p className="vwd-error-ttl">Validation Failed</p>
                        <p className="vwd-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Results ══ */}
          <section className={`vwd-step-card ${!rawResult && !submitting ? "vwd-step-locked" : ""}`}>
            <div className="vwd-step-badge vwd-step-badge--2">
              <span>2</span>
            </div>
            <div className="vwd-step-body">
              <div className="vwd-step-head">
                <div>
                  <h2 className="vwd-step-title">Validation Report</h2>
                  <p className="vwd-step-desc">Detailed accessibility check results broken down by agent and category.</p>
                </div>
                {rawResult && parsed && (
                  <div className="vwd-results-header-right">
                    <div className={`vwd-overall-badge ${isFail ? "badge-fail" : "badge-pass"}`}>
                      {isFail ? "⚠️ FAIL" : "✅ PASS"}
                    </div>
                    <button
                      className="vwd-download-report-icon-btn"
                      onClick={handleDownloadReport}
                      title="Download Report"
                    >
                      <svg className="vwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Empty state */}
              {!rawResult && !submitting && (
                <div className="vwd-empty-state">
                  <div className="vwd-empty-illustration">
                    <div className="vwd-empty-doc">
                      <div className="vwd-empty-line"></div>
                      <div className="vwd-empty-line short"></div>
                      <div className="vwd-empty-line"></div>
                      <div className="vwd-empty-line medium"></div>
                    </div>
                    <div className="vwd-empty-scan"></div>
                  </div>
                  <p className="vwd-empty-title">No results yet</p>
                  <p className="vwd-empty-sub">Upload a Word document and run validation to see the report here.</p>
                </div>
              )}

              {/* Loading state */}
              {submitting && (
                <div className="vwd-empty-state">
                  <div className="vwd-scanning-wrap">
                    <div className="vwd-scanning-doc">
                      <div className="vwd-scan-beam"></div>
                      <div className="vwd-s-line"></div>
                      <div className="vwd-s-line short"></div>
                      <div className="vwd-s-line"></div>
                      <div className="vwd-s-line medium"></div>
                      <div className="vwd-s-line"></div>
                    </div>
                  </div>
                  <p className="vwd-empty-title" style={{ marginTop: 20 }}>Scanning Word Document…</p>
                  <p className="vwd-empty-sub">Running multi-agent accessibility checks</p>
                </div>
              )}

              {/* ── Results ── */}
              {rawResult && !submitting && parsed && (
                <div className="vwd-results">

                  {/* ── Document Info ── */}
                  <div className="vwd-doc-info-card">

                    {/* Top row: file identity + overall status */}
                    <div className="vwd-dic-top">
                      <div className="vwd-dic-file">
                        <div className="vwd-dic-file-icon">
                          <span>DOC</span>
                        </div>
                        <div className="vwd-dic-file-meta">
                          <span className="vwd-dic-filename">{parsed.meta.document_name ?? "—"}</span>
                          <div className="vwd-dic-pills">
                            {parsed.meta.total_pages != null && (
                              <span className="vwd-dic-pill">
                                <span className="vwd-dic-pill-icon">🗒️</span>
                                {parsed.meta.total_pages} {parsed.meta.total_pages === 1 ? "page" : "pages"}
                              </span>
                            )}
                            {parsed.meta.total_checks != null && (
                              <span className="vwd-dic-pill">
                                <span className="vwd-dic-pill-icon">🔍</span>
                                {parsed.meta.total_checks} checks
                              </span>
                            )}
                            {parsed.meta.execution_time_ms != null && (
                              <span className="vwd-dic-pill">
                                <span className="vwd-dic-pill-icon">⏱</span>
                                {parsed.meta.execution_time_ms} ms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`vwd-dic-verdict ${isFail ? "verdict-fail" : "verdict-pass"}`}>
                        <span className="vwd-dic-verdict-icon">{isFail ? "✗" : "✓"}</span>
                        <div>
                          <span className="vwd-dic-verdict-label">{isFail ? "FAIL" : "PASS"}</span>
                          <span className="vwd-dic-verdict-sub">
                            {isFail ? `${parsed.meta.total_issues} issue${parsed.meta.total_issues !== 1 ? "s" : ""} found` : "All checks passed"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Two-column body */}
                    <div className="vwd-dic-body">

                      {/* Left col — Severity breakdown */}
                      <div className="vwd-dic-col">
                        <p className="vwd-dic-col-label">Issue Severity</p>
                        <div className="vwd-dic-sev-list">
                          {[
                            { key: "critical_count", label: "Critical", cls: "sev-critical", dot: "#dc2626" },
                            { key: "high_count",     label: "High",     cls: "sev-high",     dot: "#ea580c" },
                            { key: "medium_count",   label: "Medium",   cls: "sev-medium",   dot: "#ca8a04" },
                            { key: "low_count",      label: "Low",      cls: "sev-low",      dot: "#16a34a" },
                            { key: "warning_count",  label: "Warning",  cls: "sev-info",      dot: "#0891b2" },
                          ].filter(s => parsed.meta[s.key] != null).map(s => (
                            <div key={s.key} className="vwd-dic-sev-row">
                              <span className="vwd-dic-sev-dot" style={{ background: s.dot }}></span>
                              <span className="vwd-dic-sev-label">{s.label}</span>
                              <div className="vwd-dic-sev-bar-wrap">
                                <div
                                  className={`vwd-dic-sev-bar ${s.cls}`}
                                  style={{ width: parsed.meta.total_issues > 0 ? `${Math.round(((parsed.meta[s.key] ?? 0) / parsed.meta.total_issues) * 100)}%` : "0%" }}
                                ></div>
                              </div>
                              <span className={`vwd-dic-sev-count ${s.cls}`}>{parsed.meta[s.key] ?? 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right col — Resolution breakdown */}
                      <div className="vwd-dic-col">
                        <p className="vwd-dic-col-label">Resolution Breakdown</p>
                        <div className="vwd-dic-res-list">
                          {parsed.meta.auto_fixable_count != null && (
                            <div className="vwd-dic-res-item res-auto">
                              <div className="vwd-dic-res-icon">⚡</div>
                              <div className="vwd-dic-res-info">
                                <span className="vwd-dic-res-count">{parsed.meta.auto_fixable_count}</span>
                                <span className="vwd-dic-res-label">Auto-fixable</span>
                              </div>
                            </div>
                          )}
                          {parsed.meta.manual_review_count != null && (
                            <div className="vwd-dic-res-item res-manual">
                              <div className="vwd-dic-res-icon">👁️</div>
                              <div className="vwd-dic-res-info">
                                <span className="vwd-dic-res-count">{parsed.meta.manual_review_count}</span>
                                <span className="vwd-dic-res-label">Manual review</span>
                              </div>
                            </div>
                          )}
                          {parsed.meta.ai_review_count != null && (
                            <div className="vwd-dic-res-item res-ai">
                              <div className="vwd-dic-res-icon">🤖</div>
                              <div className="vwd-dic-res-info">
                                <span className="vwd-dic-res-count">{parsed.meta.ai_review_count}</span>
                                <span className="vwd-dic-res-label">AI review</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ── Accessibility Score ── */}
                  {parsed.score && (
                    <div className="vwd-score-card">
                      <div className="vwd-score-top">
                        <div
                          className="vwd-score-ring"
                          style={{ "--score-pct": parsed.score.overall, "--score-color": scoreTheme.color }}
                        >
                          <span className="vwd-score-ring-value">
                            {parsed.score.overall}%
                          </span>
                        </div>
                        <div className="vwd-score-headline">
                          <div className="vwd-score-title-row">
                            <span className="vwd-score-title">Accessibility Score</span>
                            <span
                              className="vwd-score-band"
                              style={{ "--score-color": scoreTheme.color, "--score-bg": scoreTheme.bg }}
                            >
                              {parsed.score.band}
                            </span>
                          </div>
                          <p className="vwd-score-sub">
                            Based on {parsed.score.scored_checks ?? parsed.meta.total_checks} scored checks across all categories.
                          </p>
                        </div>
                        {parsed.score.counts && (
                          <div className="vwd-score-counts">
                            <span className="vwd-score-count-chip">
                              <span className="vwd-score-count-dot" style={{ background: "#16a34a" }}></span>
                              {parsed.score.counts.pass ?? 0} Pass
                            </span>
                            <span className="vwd-score-count-chip">
                              <span className="vwd-score-count-dot" style={{ background: "#dc2626" }}></span>
                              {parsed.score.counts.fail ?? 0} Fail
                            </span>
                            <span className="vwd-score-count-chip">
                              <span className="vwd-score-count-dot" style={{ background: "#0891b2" }}></span>
                              {parsed.score.counts.warning ?? 0} Warning
                            </span>
                            {parsed.score.counts.info != null && (
                              <span className="vwd-score-count-chip">
                                <span className="vwd-score-count-dot" style={{ background: "#94a3b8" }}></span>
                                {parsed.score.counts.info} Info
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {parsed.score.categories && (
                        <div className="vwd-score-categories">
                          {Object.entries(parsed.score.categories).map(([cat, val]) => {
                            const barColor = val >= 90 ? "#16a34a" : val >= 75 ? "#2563eb" : val >= 50 ? "#d97706" : "#dc2626";
                            return (
                              <div key={cat} className="vwd-score-cat-row">
                                <span className="vwd-score-cat-label">{cat}</span>
                                <div className="vwd-score-cat-bar-wrap">
                                  <div className="vwd-score-cat-bar" style={{ width: `${val}%`, background: barColor }}></div>
                                </div>
                                <span className="vwd-score-cat-val">{val}%</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Category detail cards (dropdown rows) ── */}
                  <div className="vwd-detail-list">
                    {parsed.agents.map((agent) => {
                      const isOpen = !!openCategories[agent.name];

                      return (
                        <div
                          key={agent.name}
                          id={agentAnchorId(agent.name)}
                          className={`vwd-detail-card${isOpen ? " is-open" : ""}`}
                          style={{ "--agent-color": agent.color, "--agent-bg": agent.bg }}
                        >
                          <button
                            type="button"
                            className="vwd-detail-head"
                            onClick={() => toggleCategory(agent.name)}
                            aria-expanded={isOpen}
                          >
                            <span className="vwd-detail-icon">{agent.icon}</span>
                            <span className="vwd-detail-title">{agent.name}</span>
                            <span className="vwd-detail-count">
                              {agent.totalCount} {agent.totalCount === 1 ? "check" : "checks"}
                            </span>
                            <span className="vwd-detail-count vwd-detail-count--passed">
                              {agent.passCount} passed
                            </span>
                            <span className="vwd-detail-count vwd-detail-count--issues">
                              {agent.failCount} {agent.failCount === 1 ? "issue" : "issues"}
                            </span>
                            <span className="vwd-detail-count vwd-detail-count--manual">
                              {agent.manualCount} manual review
                            </span>
                            <span className="vwd-detail-count vwd-detail-count--na">
                              {agent.naCount} not applicable
                            </span>
                            <span className="vwd-detail-chevron" aria-hidden="true">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </span>
                          </button>

                          {isOpen && (
                            <div className="vwd-detail-body">
                              <div className="vwd-issues-list">
                                {agent.allIssues.length === 0 && (
                                  <div className="vwd-no-issues">
                                    <span>✅</span>
                                    <p>No checks in this category</p>
                                  </div>
                                )}
                                {agent.allIssues.map((issue, ri) => (
                                  <div
                                    key={`${issue.rule_id}-${ri}`}
                                    className={`vwd-issue-row issue-${issue.status.toLowerCase()}`}
                                  >
                                    <div className="vwd-issue-row-top">
                                      <div className="vwd-issue-left">
                                        <span className={`vwd-sev-dot-sm ${severityClass(issue.severity)}`} title={`${issue.severity} severity`}></span>
                                        <code className="vwd-rule-id">{issue.rule_id}</code>
                                      </div>
                                      <div className="vwd-issue-right">
                                        <span className={`vwd-status-badge ${statusClass(issue.status)}`}>{issue.status_label}</span>
                                        {issue.auto_fixable && (
                                          <span className="vwd-autofixable" title="Auto-fixable">⚡</span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="vwd-issue-msg">{issue.message}</p>
                                    {(issue.status === "FAIL" || issue.status === "WARNING") && issue.recommendation && (
                                      <div className="vwd-issue-rec">
                                        <span className="vwd-rec-bulb">💡</span>
                                        <p>{issue.recommendation}</p>
                                      </div>
                                    )}
                                    {issue.wcag?.length > 0 && (
                                      <span className="vwd-page-tag">WCAG {issue.wcag.join(", ")}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Summary ── */}
                  <div className="vwd-summary-card">
                    <div className="vwd-summary-header">
                      <span className="vwd-summary-icon">📊</span>
                      <h3 className="vwd-summary-title">Agent Summary</h3>
                    </div>
                    <div className="vwd-summary-rows">
                      {parsed.agents.map((agent) => {
                        const total = agent.totalCount;
                        const failPct = total > 0 ? Math.round((agent.failCount / total) * 100) : 0;
                        return (
                          <div
                            key={agent.name}
                            className="vwd-summary-row vwd-summary-row--link"
                            role="button"
                            tabIndex={0}
                            title={`Go to ${agent.name} details`}
                            onClick={() => scrollToAgent(agent.name)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                scrollToAgent(agent.name);
                              }
                            }}
                          >
                            <div className="vwd-summary-row-left">
                              <span className="vwd-sum-icon">{agent.icon}</span>
                              <div className="vwd-sum-info">
                                <span className="vwd-sum-name">{agent.name}</span>
                                <span className="vwd-sum-counts">{total} checks</span>
                              </div>
                            </div>
                            <div className="vwd-summary-row-right">
                              {agent.failCount > 0 && (
                                <span className="vwd-sum-badge sum-fail">{agent.failCount} Failed</span>
                              )}
                              {agent.manualCount > 0 && (
                                <span className="vwd-sum-badge sum-warn">{agent.manualCount} Manual review</span>
                              )}
                              {agent.passCount > 0 && (
                                <span className="vwd-sum-badge sum-pass">{agent.passCount} Passed</span>
                              )}
                              {agent.naCount > 0 && (
                                <span className="vwd-sum-badge sum-na">{agent.naCount} N/A</span>
                              )}
                            </div>
                            <div className="vwd-sum-bar-wrap">
                              <div
                                className="vwd-sum-bar"
                                style={{ width: `${failPct}%`, background: agent.failCount > 0 ? "#ef4444" : "#22c55e" }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final verdict */}
                    <div className={`vwd-verdict ${isFail ? "verdict-fail" : "verdict-pass"}`}>
                      <div className="vwd-verdict-icon">{isFail ? "⚠️" : "🎉"}</div>
                      <div className="vwd-verdict-text">
                        <p className="vwd-verdict-main">
                          {isFail
                            ? `Document has ${parsed.meta.total_issues} accessibility issue${parsed.meta.total_issues !== 1 ? "s" : ""} that need attention`
                            : "Document passed all accessibility checks!"}
                        </p>
                        {parsed.meta.manual_review_count > 0 && (
                          <p className="vwd-verdict-sub">
                            {parsed.meta.manual_review_count} need manual review
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}