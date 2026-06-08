



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

//   const [expandedRows, setExpandedRows] = useState({});
//   const toggleRow = (i) => setExpandedRows(prev => ({ ...prev, [i]: !prev[i] }));

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
//       setExpandedRows({});
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
//           <p className="tp-nav-section">ACCESSIBILITY</p>

//           {/* 1. Template */}
//           <div className="tp-nav-item tp-nav-parent" onClick={() => navigate("/template")}>
//             <span className="tp-nav-icon">📋</span> Template
//             <span className="tp-chevron">▸</span>
//           </div>

//           {/* 2. Validate */}
//           <div className="tp-nav-item tp-nav-parent active">
//             <span className="tp-nav-icon">🔍</span> Validate
//             <span className="tp-chevron">▾</span>
//           </div>
//           <div className="tp-nav-sub">
//             <div className="tp-nav-sub-item active">
//               <span className="tp-sub-dot">›</span> ValidatePDF
//             </div>
//           </div>

//           {/* 3. Remediate */}
//           <div className="tp-nav-item tp-nav-parent" onClick={() => alert("Remediate PDF – coming soon!")}>
//             <span className="tp-nav-icon">🛠</span> Remediate
//             <span className="tp-chevron">▸</span>
//           </div>
//           <div className="tp-nav-sub">
//             <div className="tp-nav-sub-item" onClick={() => alert("Remediate PDF – coming soon!")}>
//               <span className="tp-sub-dot">›</span> RemediatePDF
//             </div>
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
//                             const checks      = v.checks ?? [];   // individual failing instances
//                             const isExpanded  = !!expandedRows[i];

//                             const specLabel = [
//                               spec    ? `Specification: ${spec}` : null,
//                               clause  ? `Clause: ${clause}`      : null,
//                               testNum ? `Test number: ${testNum}` : null,
//                             ].filter(Boolean).join(", ") || `Rule ${i + 1}`;

//                             return (
//                               <tr key={i} className="vp-vrow">
//                                 <td className="vp-vtd-rule">
//                                   <a className="vp-spec-link" href="#!" onClick={e => e.preventDefault()}>{specLabel}</a>
//                                   {description && <p className="vp-rule-desc">{description}</p>}
//                                   {occurrences > 0 && (
//                                     <p className="vp-occurrences">
//                                       {occurrences.toLocaleString()} occurrence{occurrences !== 1 ? "s" : ""}
//                                     </p>
//                                   )}

//                                   {/* Expanded checks detail */}
//                                   {isExpanded && checks.length > 0 && (
//                                     <div className="vp-checks-expand">
//                                       <p className="vp-checks-label">Failed instances:</p>
//                                       <div className="vp-checks-list">
//                                         {checks.map((c, ci) => (
//                                           <div key={ci} className="vp-check-item">
//                                             <p className="vp-check-context">📍 {c.context}</p>
//                                             {c.errorMessage && (
//                                               <p className="vp-check-error">{c.errorMessage}</p>
//                                             )}
//                                           </div>
//                                         ))}
//                                       </div>
//                                     </div>
//                                   )}
//                                   {isExpanded && checks.length === 0 && (
//                                     <div className="vp-checks-expand">
//                                       <p className="vp-checks-label">No additional context available.</p>
//                                     </div>
//                                   )}
//                                 </td>
//                                 <td className="vp-vtd-status">
//                                   <span className="vp-vstatus fail">Failed</span>
//                                   <button
//                                     className={`vp-show-btn ${isExpanded ? "active" : ""}`}
//                                     onClick={() => toggleRow(i)}
//                                   >
//                                     {isExpanded ? "Hide" : "Show"}
//                                   </button>
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
import { orionValidatePdf } from "../../services/apiServices";
import "./ValidatePdf.css";

const SKIP_AGENTS = ["READING_ORDER_AGENT", "VISUAL_ACCESSIBILITY_AGENT"];

const AGENT_META = {
  "Document Accessibility Agent": { icon: "🏷️", color: "#6366f1", bg: "#eef2ff" },
  "Structure Heading Agent":      { icon: "🏗️", color: "#0891b2", bg: "#ecfeff" },
  "Image Accessibility Agent":    { icon: "🖼️", color: "#7c3aed", bg: "#f5f3ff" },
  "Table Accessibility Agent":    { icon: "📊", color: "#0d9488", bg: "#f0fdfa" },
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

export default function ValidatePdf() {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile]         = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [rawResult, setRawResult]     = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [activeCat, setActiveCat]     = useState({});

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
      const orgId     = sessionStorage.getItem("organization_id") || 1;
      const projectId = sessionStorage.getItem("project_id")      || 1;
      const response  = await orionValidatePdf(pdfFile, orgId, projectId);
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      const data = await response.json();
      setRawResult(data);
      setActiveCat({});
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const parseResult = (raw) => {
    if (!raw) return null;
    const d = raw?.data ?? raw;

    const meta = {
      document_name:      d.document_name,
      total_pages:        d.total_pages,
      total_issues:       d.total_issues,
      overall_status:     d.overall_status,
      critical_count:     d.critical_count,
      high_count:         d.high_count,
      medium_count:       d.medium_count,
      low_count:          d.low_count,
      auto_fixable_count: d.auto_fixable_count,
      manual_review_count:d.manual_review_count,
      ai_review_count:    d.ai_review_count,
      execution_time_ms:  d.execution_time_ms,
    };

    const agentResults = (d.agent_results ?? []).filter(
      (a) => !SKIP_AGENTS.includes(a.agent_name)
    );

    const agents = agentResults.map((agent) => {
      const issues = [...(agent.issues ?? [])].sort(
        (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
      );

      const catMap = {};
      for (const issue of issues) {
        const cat = issue.category ?? "General";
        if (!catMap[cat]) catMap[cat] = [];
        catMap[cat].push(issue);
      }

      const failCount = issues.filter(i => i.status === "FAIL").length;
      const warnCount = issues.filter(i => i.status === "WARNING").length;
      const passCount = issues.filter(i => i.status === "PASS").length;
      const meta = AGENT_META[agent.agent_name] ?? { icon: "🔍", color: "#6366f1", bg: "#eef2ff" };

      return {
        name: agent.agent_name,
        ...meta,
        success:    agent.success,
        issueCount: agent.issue_count,
        failCount,
        warnCount,
        passCount,
        catMap,
        catKeys: Object.keys(catMap),
        allIssues: issues,
      };
    });

    return { meta, agents };
  };

  const parsed = parseResult(rawResult);
  const getSelectedCat = (agentName, catKeys) =>
    activeCat[agentName] ?? catKeys[0] ?? null;

  const isFail = parsed?.meta?.overall_status === "FAIL";

  return (
    <div className="vp-page">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="vp-sidebar">
        <div className="vp-logo">
          <div className="vp-logo-mark">O</div>
          <div className="vp-logo-text">
            <span>ORION</span>
            <small>Accessibility & Remediation</small>
          </div>
        </div>
        <nav className="vp-nav">
          <p className="vp-nav-label">WORKSPACE</p>
          <div className="vp-nav-item" onClick={() => navigate("/template")}>
            <span className="vp-nav-icon">📋</span>
            <span>Template</span>
          </div>
          <div className="vp-nav-item active">
            <span className="vp-nav-icon">✅</span>
            <span>Validate PDF</span>
            <span className="vp-nav-dot"></span>
          </div>
          <div className="vp-nav-item disabled">
            <span className="vp-nav-icon">🛠️</span>
            <span>Remediate</span>
            <span className="vp-nav-soon">Soon</span>
          </div>
        </nav>
        <div className="vp-sidebar-footer">
          <div className="vp-sidebar-agents">
            <p className="vp-sidebar-agents-title">Active Agents</p>
            {Object.entries(AGENT_META).map(([name, m]) => (
              <div key={name} className="vp-sidebar-agent">
                <span>{m.icon}</span>
                <span>{name.replace(" Agent", "").replace(" Accessibility", "")}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="vp-main">

        {/* Topbar */}
        <div className="vp-topbar">
          <div className="vp-breadcrumb">
            <span className="vp-bc-root">Accessibility</span>
            <span className="vp-bc-sep">›</span>
            <span className="vp-bc-current">Validate PDF</span>
          </div>
          <div className="vp-topbar-right">
            {pdfFile && !submitting && !rawResult && (
              <div className="vp-status-chip chip-ready">
                <span className="vp-chip-dot dot-green"></span>
                PDF Ready
              </div>
            )}
            {submitting && (
              <div className="vp-status-chip chip-running">
                <span className="vp-chip-spin"></span>
                Validating…
              </div>
            )}
            {rawResult && !submitting && (
              <div className={`vp-status-chip ${isFail ? "chip-fail" : "chip-pass"}`}>
                <span className={`vp-chip-dot ${isFail ? "dot-red" : "dot-green"}`}></span>
                {isFail ? `${parsed.meta.total_issues} Issues Found` : "All Checks Passed"}
              </div>
            )}
          </div>
        </div>

        <div className="vp-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="vp-step-card">
            <div className="vp-step-badge">
              <span>1</span>
            </div>
            <div className="vp-step-body">
              <div className="vp-step-head">
                <div>
                  <h2 className="vp-step-title">Upload PDF</h2>
                  <p className="vp-step-desc">Drop your PDF for multi-agent accessibility validation — Document, Structure, Images, Tables.</p>
                </div>
                <div className="vp-agent-pills">
                  {Object.entries(AGENT_META).map(([name, m]) => (
                    <span key={name} className="vp-agent-pill" style={{ "--pill-color": m.color, "--pill-bg": m.bg }}>
                      {m.icon} {name.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>

              <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handlePdfSelect} />

              <div className="vp-upload-row">
                {/* Drop zone */}
                <div
                  className={`vp-dropzone ${dragOver ? "drag-over" : ""} ${pdfFile ? "has-file" : ""}`}
                  onClick={() => pdfInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {pdfFile ? (
                    <div className="vp-file-preview">
                      <div className="vp-file-pdf-icon">
                        <span>PDF</span>
                      </div>
                      <div className="vp-file-info">
                        <span className="vp-file-name">{pdfFile.name}</span>
                        <span className="vp-file-size">{formatBytes(pdfFile.size)}</span>
                        <span className="vp-file-ready">Ready to validate</span>
                      </div>
                      <button className="vp-remove-btn"
                        onClick={(e) => { e.stopPropagation(); setPdfFile(null); setRawResult(null); setSubmitError(""); }}
                        title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="vp-dropzone-content">
                      <div className="vp-drop-cloud">☁</div>
                      <p className="vp-drop-title">Drag &amp; drop your PDF here</p>
                      <p className="vp-drop-hint">or <span className="vp-drop-link">click to browse</span></p>
                      <p className="vp-drop-note">Only .pdf files · Max 50MB recommended</p>
                    </div>
                  )}
                </div>

                {/* Run panel */}
                <div className="vp-run-panel">
                  <div className="vp-run-info">
                    <p className="vp-run-label">What gets checked</p>
                    <ul className="vp-run-checks">
                      <li><span className="vp-check-icon">🏷️</span> Document metadata &amp; tagging</li>
                      <li><span className="vp-check-icon">🏗️</span> Heading structure &amp; hierarchy</li>
                      <li><span className="vp-check-icon">🖼️</span> Image alt-text &amp; tagging</li>
                      <li><span className="vp-check-icon">📊</span> Table headers &amp; structure</li>
                    </ul>
                  </div>
                  <button
                    className="vp-run-btn"
                    onClick={handleSubmit}
                    disabled={!pdfFile || submitting}
                  >
                    {submitting
                      ? <><span className="vp-btn-spin"></span> Validating PDF…</>
                      : <><span className="vp-run-rocket">🚀</span> Run Accessibility Checks</>}
                  </button>
                  {submitError && (
                    <div className="vp-error-banner">
                      <span className="vp-error-ico">⚠</span>
                      <div>
                        <p className="vp-error-ttl">Validation Failed</p>
                        <p className="vp-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Results ══ */}
          <section className={`vp-step-card ${!rawResult && !submitting ? "vp-step-locked" : ""}`}>
            <div className="vp-step-badge vp-step-badge--2">
              <span>2</span>
            </div>
            <div className="vp-step-body">
              <div className="vp-step-head">
                <div>
                  <h2 className="vp-step-title">Validation Report</h2>
                  <p className="vp-step-desc">Detailed accessibility check results broken down by agent and category.</p>
                </div>
                {rawResult && parsed && (
                  <div className={`vp-overall-badge ${isFail ? "badge-fail" : "badge-pass"}`}>
                    {isFail ? "⚠️ FAIL" : "✅ PASS"}
                  </div>
                )}
              </div>

              {/* Empty state */}
              {!rawResult && !submitting && (
                <div className="vp-empty-state">
                  <div className="vp-empty-illustration">
                    <div className="vp-empty-doc">
                      <div className="vp-empty-line"></div>
                      <div className="vp-empty-line short"></div>
                      <div className="vp-empty-line"></div>
                      <div className="vp-empty-line medium"></div>
                    </div>
                    <div className="vp-empty-scan"></div>
                  </div>
                  <p className="vp-empty-title">No results yet</p>
                  <p className="vp-empty-sub">Upload a PDF and run validation to see the report here.</p>
                </div>
              )}

              {/* Loading state */}
              {submitting && (
                <div className="vp-empty-state">
                  <div className="vp-scanning-wrap">
                    <div className="vp-scanning-doc">
                      <div className="vp-scan-beam"></div>
                      <div className="vp-s-line"></div>
                      <div className="vp-s-line short"></div>
                      <div className="vp-s-line"></div>
                      <div className="vp-s-line medium"></div>
                      <div className="vp-s-line"></div>
                    </div>
                  </div>
                  <p className="vp-empty-title" style={{ marginTop: 20 }}>Scanning PDF…</p>
                  <p className="vp-empty-sub">Running multi-agent accessibility checks</p>
                </div>
              )}

              {/* ── Results ── */}
              {rawResult && !submitting && parsed && (
                <div className="vp-results">

                  {/* ── Document Info ── */}
                  <div className="vp-doc-info-card">
                    <div className="vp-doc-info-header">
                      <span className="vp-doc-info-icon">📄</span>
                      <h3 className="vp-doc-info-title">Document Info</h3>
                    </div>
                    <div className="vp-doc-info-grid">
                      <div className="vp-di-item">
                        <span className="vp-di-key">File Name</span>
                        <span className="vp-di-val vp-di-filename">{parsed.meta.document_name ?? "—"}</span>
                      </div>
                      <div className="vp-di-item">
                        <span className="vp-di-key">Pages</span>
                        <span className="vp-di-val">{parsed.meta.total_pages ?? "—"}</span>
                      </div>
                      <div className="vp-di-item">
                        <span className="vp-di-key">Total Issues</span>
                        <span className="vp-di-val vp-di-issues">{parsed.meta.total_issues ?? 0}</span>
                      </div>
                      <div className="vp-di-item">
                        <span className="vp-di-key">Auto-Fixable</span>
                        <span className="vp-di-val vp-di-fix">⚡ {parsed.meta.auto_fixable_count ?? 0}</span>
                      </div>
                      <div className="vp-di-item">
                        <span className="vp-di-key">Manual Review</span>
                        <span className="vp-di-val">{parsed.meta.manual_review_count ?? 0}</span>
                      </div>
                      {parsed.meta.ai_review_count != null && (
                        <div className="vp-di-item">
                          <span className="vp-di-key">AI Review</span>
                          <span className="vp-di-val">🤖 {parsed.meta.ai_review_count}</span>
                        </div>
                      )}
                      {parsed.meta.execution_time_ms != null && (
                        <div className="vp-di-item">
                          <span className="vp-di-key">Exec Time</span>
                          <span className="vp-di-val">{parsed.meta.execution_time_ms} ms</span>
                        </div>
                      )}
                    </div>

                    {/* Severity strip */}
                    <div className="vp-sev-strip">
                      <div className="vp-sev-chip sev-critical">
                        <span className="vp-sev-num">{parsed.meta.critical_count ?? 0}</span>
                        <span className="vp-sev-lbl">Critical</span>
                      </div>
                      <div className="vp-sev-divider"></div>
                      <div className="vp-sev-chip sev-high">
                        <span className="vp-sev-num">{parsed.meta.high_count ?? 0}</span>
                        <span className="vp-sev-lbl">High</span>
                      </div>
                      <div className="vp-sev-divider"></div>
                      <div className="vp-sev-chip sev-medium">
                        <span className="vp-sev-num">{parsed.meta.medium_count ?? 0}</span>
                        <span className="vp-sev-lbl">Medium</span>
                      </div>
                      <div className="vp-sev-divider"></div>
                      <div className="vp-sev-chip sev-low">
                        <span className="vp-sev-num">{parsed.meta.low_count ?? 0}</span>
                        <span className="vp-sev-lbl">Low</span>
                      </div>
                    </div>
                  </div>

                  {/* ── 4 Agent Cards ── */}
                  <div className="vp-agents-grid">
                    {parsed.agents.map((agent) => {
                      const selectedCat = getSelectedCat(agent.name, agent.catKeys);
                      const visibleIssues = selectedCat ? (agent.catMap[selectedCat] ?? []) : agent.allIssues;
                      const hasProblem = agent.failCount > 0 || agent.warnCount > 0;

                      return (
                        <div
                          key={agent.name}
                          className={`vp-agent-card ${hasProblem ? "has-issues" : "all-good"}`}
                          style={{ "--agent-color": agent.color, "--agent-bg": agent.bg }}
                        >
                          {/* Card header */}
                          <div className="vp-ac-header">
                            <div className="vp-ac-icon-wrap">
                              <span className="vp-ac-icon">{agent.icon}</span>
                            </div>
                            <div className="vp-ac-title-area">
                              <h4 className="vp-ac-name">{agent.name}</h4>
                              <div className="vp-ac-badges">
                                {agent.failCount > 0 && (
                                  <span className="vp-ac-badge ac-fail">{agent.failCount} Failed</span>
                                )}
                                {agent.warnCount > 0 && (
                                  <span className="vp-ac-badge ac-warn">{agent.warnCount} Warning{agent.warnCount !== 1 ? "s" : ""}</span>
                                )}
                                {agent.passCount > 0 && agent.failCount === 0 && agent.warnCount === 0 && (
                                  <span className="vp-ac-badge ac-pass">✓ All Passed</span>
                                )}
                              </div>
                            </div>
                            <div className={`vp-ac-status-dot ${hasProblem ? "dot-issue" : "dot-ok"}`}></div>
                          </div>

                          {/* Category radio tabs */}
                          {agent.catKeys.length > 1 && (
                            <div className="vp-cat-tabs">
                              {agent.catKeys.map((cat) => {
                                const catProblems = (agent.catMap[cat] ?? []).filter(
                                  i => i.status === "FAIL" || i.status === "WARNING"
                                ).length;
                                return (
                                  <label key={cat} className={`vp-cat-tab ${selectedCat === cat ? "tab-active" : ""}`}>
                                    <input
                                      type="radio"
                                      name={`cat-${agent.name}`}
                                      value={cat}
                                      checked={selectedCat === cat}
                                      onChange={() => setActiveCat(prev => ({ ...prev, [agent.name]: cat }))}
                                    />
                                    <span className="vp-cat-tab-text">{cat}</span>
                                    {catProblems > 0 && (
                                      <span className="vp-cat-tab-count">{catProblems}</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Issues list */}
                          <div className="vp-issues-list">
                            {visibleIssues.length === 0 && (
                              <div className="vp-no-issues">
                                <span>✅</span>
                                <p>No issues in this category</p>
                              </div>
                            )}
                            {visibleIssues.map((issue, ri) => (
                              <div
                                key={`${issue.rule_id}-${ri}`}
                                className={`vp-issue-row issue-${issue.status.toLowerCase()}`}
                              >
                                <div className="vp-issue-row-top">
                                  <div className="vp-issue-left">
                                    <span className={`vp-sev-dot-sm ${severityClass(issue.severity)}`} title={`${issue.severity} severity`}></span>
                                    <code className="vp-rule-id">{issue.rule_id}</code>
                                  </div>
                                  <div className="vp-issue-right">
                                    <span className={`vp-status-badge ${statusClass(issue.status)}`}>{issue.status}</span>
                                    {issue.auto_fixable && (
                                      <span className="vp-autofixable" title="Auto-fixable">⚡</span>
                                    )}
                                  </div>
                                </div>
                                <p className="vp-issue-msg">{issue.message}</p>
                                {(issue.status === "FAIL" || issue.status === "WARNING") && issue.recommendation && (
                                  <div className="vp-issue-rec">
                                    <span className="vp-rec-bulb">💡</span>
                                    <p>{issue.recommendation}</p>
                                  </div>
                                )}
                                {issue.page_no != null && (
                                  <span className="vp-page-tag">Page {issue.page_no}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Summary ── */}
                  <div className="vp-summary-card">
                    <div className="vp-summary-header">
                      <span className="vp-summary-icon">📊</span>
                      <h3 className="vp-summary-title">Agent Summary</h3>
                    </div>
                    <div className="vp-summary-rows">
                      {parsed.agents.map((agent) => {
                        const total = agent.issueCount;
                        const failPct = total > 0 ? Math.round((agent.failCount / total) * 100) : 0;
                        return (
                          <div key={agent.name} className="vp-summary-row">
                            <div className="vp-summary-row-left">
                              <span className="vp-sum-icon">{agent.icon}</span>
                              <div className="vp-sum-info">
                                <span className="vp-sum-name">{agent.name}</span>
                                <span className="vp-sum-counts">{total} checks</span>
                              </div>
                            </div>
                            <div className="vp-summary-row-right">
                              {agent.failCount > 0 && (
                                <span className="vp-sum-badge sum-fail">{agent.failCount} Failed</span>
                              )}
                              {agent.warnCount > 0 && (
                                <span className="vp-sum-badge sum-warn">{agent.warnCount} Warnings</span>
                              )}
                              {agent.passCount > 0 && (
                                <span className="vp-sum-badge sum-pass">{agent.passCount} Passed</span>
                              )}
                            </div>
                            <div className="vp-sum-bar-wrap">
                              <div
                                className="vp-sum-bar"
                                style={{ width: `${failPct}%`, background: agent.failCount > 0 ? "#ef4444" : "#22c55e" }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final verdict */}
                    <div className={`vp-verdict ${isFail ? "verdict-fail" : "verdict-pass"}`}>
                      <div className="vp-verdict-icon">{isFail ? "⚠️" : "🎉"}</div>
                      <div className="vp-verdict-text">
                        <p className="vp-verdict-main">
                          {isFail
                            ? `Document has ${parsed.meta.total_issues} accessibility issue${parsed.meta.total_issues !== 1 ? "s" : ""} that need attention`
                            : "Document passed all accessibility checks!"}
                        </p>
                        {isFail && (
                          <p className="vp-verdict-sub">
                            {parsed.meta.auto_fixable_count} can be auto-fixed · {parsed.meta.manual_review_count} need manual review
                            {parsed.meta.ai_review_count ? ` · ${parsed.meta.ai_review_count} need AI review` : ""}
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
