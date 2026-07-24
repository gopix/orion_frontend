import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orionValidatePpt } from "../../../services/apiServices";
import "./ValidatePpt.css";

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

// The score agent is rendered as its own dedicated card, not inside
// the regular agent grid.
const SCORE_AGENT_NAME = "PPT Accessibility Score Agent";

const AGENT_META = {
  "PPT Metadata Agent":       { icon: "🏷️", color: "#6366f1", bg: "#eef2ff" },
  "PPT Heading Agent":        { icon: "🏗️", color: "#0891b2", bg: "#ecfeff" },
  "PPT Slide Structure Agent":{ icon: "🧩", color: "#7c3aed", bg: "#f5f3ff" },
  "PPT Presentation Agent":   { icon: "🖥️", color: "#ea580c", bg: "#fff7ed" },
  "PPT Reading Order Agent":  { icon: "🔀", color: "#0d9488", bg: "#f0fdfa" },
  "PPT Text Agent":           { icon: "📝", color: "#4f46e5", bg: "#eef2ff" },
  "PPT Image Agent":          { icon: "🖼️", color: "#7c3aed", bg: "#f5f3ff" },
  "PPT Table Agent":          { icon: "📊", color: "#0d9488", bg: "#f0fdfa" },
  "PPT Color Contrast Agent": { icon: "🎨", color: "#db2777", bg: "#fdf2f8" },
  "PPT Hyperlink Agent":      { icon: "🔗", color: "#2563eb", bg: "#eff6ff" },
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
  if (b === "excellent") return { color: "#16a34a", bg: "#dcfce7" };
  if (b === "good")      return { color: "#2563eb", bg: "#dbeafe" };
  if (b === "fair")      return { color: "#d97706", bg: "#fef3c7" };
  return { color: "#dc2626", bg: "#fee2e2" };
};

export default function ValidatePpt() {
  const navigate = useNavigate();

  const [pptFile, setPptFile]         = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [rawResult, setRawResult]     = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [activeCat, setActiveCat]     = useState({});

  const pptInputRef = useRef(null);

  const isPptFile = (name) => /\.(pptx|ppt)$/i.test(name || "");

  const handlePptSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isPptFile(file.name)) { alert("Please upload a PowerPoint file (.ppt or .pptx)"); return; }
    setPptFile(file); setRawResult(null); setSubmitError("");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isPptFile(file.name)) { alert("Please drop a PowerPoint file (.ppt or .pptx)"); return; }
    setPptFile(file); setRawResult(null); setSubmitError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async () => {
    if (!pptFile) { alert("Please upload a PPT file first."); return; }
    setSubmitting(true); setRawResult(null); setSubmitError("");
    try {
      const orgId     = sessionStorage.getItem("organization_id") || 1;
      const projectId = sessionStorage.getItem("project_id")      || 1;
      const response  = await orionValidatePpt(pptFile, orgId, projectId);
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
      document_name:       d.document_name,
      total_pages:         d.total_pages,
      total_checks:        d.total_checks,
      total_issues:        d.total_issues,
      overall_status:      d.overall_status,
      critical_count:      d.critical_count,
      high_count:          d.high_count,
      medium_count:        d.medium_count,
      low_count:           d.low_count,
      warning_count:       d.warning_count,
      auto_fixable_count:  d.auto_fixable_count,
      manual_review_count: d.manual_review_count,
      ai_review_count:     d.ai_review_count,
      execution_time_ms:   d.execution_time_ms,
    };

    const score = d.accessibility_score ?? null;

    const agentResults = (d.agent_results ?? []).filter(
      (a) => a.agent_name !== SCORE_AGENT_NAME
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

    return { meta, score, agents };
  };

  const parsed = parseResult(rawResult);
  const getSelectedCat = (agentName, catKeys) =>
    activeCat[agentName] ?? catKeys[0] ?? null;

  const isFail = parsed?.meta?.overall_status === "FAIL";
  const scoreTheme = scoreColors(parsed?.score?.band);

  const handleDownloadReport = () => {
    if (!rawResult) return;
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `ppt-validation-report-${timestamp}.json`;
    downloadAsJson(rawResult, filename);
  };

  return (
    <div className="vpp-page">

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="vpp-main">

        {/* Topbar */}
        <div className="vpp-topbar">
          <div className="vpp-topbar-left">
            <button
              className="vpp-back-fab"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
              aria-label="Back to Accessibility"
            >
              ←
            </button>
            <div className="vpp-breadcrumb">
              <span className="vpp-bc-root">Accessibility</span>
              <span className="vpp-bc-sep">›</span>
              <span className="vpp-bc-current">Validate PPT</span>
            </div>
          </div>
          <div className="vpp-topbar-right">
            {pptFile && !submitting && !rawResult && (
              <div className="vpp-status-chip chip-ready">
                <span className="vpp-chip-dot dot-green"></span>
                PPT Ready
              </div>
            )}
            {submitting && (
              <div className="vpp-status-chip chip-running">
                <span className="vpp-chip-spin"></span>
                Validating…
              </div>
            )}
            {rawResult && !submitting && (
              <div className={`vpp-status-chip ${isFail ? "chip-fail" : "chip-pass"}`}>
                <span className={`vpp-chip-dot ${isFail ? "dot-red" : "dot-green"}`}></span>
                {isFail ? `${parsed.meta.total_issues} Issues Found` : "All Checks Passed"}
              </div>
            )}
          </div>
        </div>

        <div className="vpp-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="vpp-step-card">
            <div className="vpp-step-badge">
              <span>1</span>
            </div>
            <div className="vpp-step-body">
              <div className="vpp-step-head">
                <div>
                  <h2 className="vpp-step-title">Upload PPT</h2>
                  <p className="vpp-step-desc">Drop your PowerPoint file for multi-agent accessibility validation — Metadata, Structure, Presentation, Contrast and more.</p>
                </div>
                <div className="vpp-agent-pills">
                  {Object.entries(AGENT_META).slice(0, 6).map(([name, m]) => (
                    <span key={name} className="vpp-agent-pill" style={{ "--pill-color": m.color, "--pill-bg": m.bg }}>
                      {m.icon} {name.replace("PPT ", "").split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>

              <input ref={pptInputRef} type="file" accept=".ppt,.pptx" style={{ display: "none" }} onChange={handlePptSelect} />

              <div className="vpp-upload-row">
                {/* Drop zone */}
                <div
                  className={`vpp-dropzone ${dragOver ? "drag-over" : ""} ${pptFile ? "has-file" : ""}`}
                  onClick={() => pptInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {pptFile ? (
                    <div className="vpp-file-preview">
                      <div className="vpp-file-pdf-icon">
                        <span>PPT</span>
                      </div>
                      <div className="vpp-file-info">
                        <span className="vpp-file-name">{pptFile.name}</span>
                        <span className="vpp-file-size">{formatBytes(pptFile.size)}</span>
                        <span className="vpp-file-ready">Ready to validate</span>
                      </div>
                      <button className="vpp-remove-btn"
                        onClick={(e) => { e.stopPropagation(); setPptFile(null); setRawResult(null); setSubmitError(""); }}
                        title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="vpp-dropzone-content">
                      <div className="vpp-drop-cloud">☁</div>
                      <p className="vpp-drop-title">Drag &amp; drop your PPT here</p>
                      <p className="vpp-drop-hint">or <span className="vpp-drop-link">click to browse</span></p>
                      <p className="vpp-drop-note">Only .ppt / .pptx files · Max 50MB recommended</p>
                    </div>
                  )}
                </div>

                {/* Run panel */}
                <div className="vpp-run-panel">
                  <div className="vpp-run-info">
                    <p className="vpp-run-label">What gets checked</p>
                    <ul className="vpp-run-checks">
                      <li><span className="vpp-check-icon">🏷️</span> Document metadata &amp; language</li>
                      <li><span className="vpp-check-icon">🧩</span> Slide &amp; heading structure</li>
                      <li><span className="vpp-check-icon">🖼️</span> Image alt-text &amp; contrast</li>
                      <li><span className="vpp-check-icon">📊</span> Tables, links &amp; reading order</li>
                    </ul>
                  </div>
                  <button
                    className="vpp-run-btn"
                    onClick={handleSubmit}
                    disabled={!pptFile || submitting}
                  >
                    {submitting
                      ? <><span className="vpp-btn-spin"></span> Validating PPT…</>
                      : <><span className="vpp-run-rocket">🚀</span> Run Accessibility Checks</>}
                  </button>
                  {submitError && (
                    <div className="vpp-error-banner">
                      <span className="vpp-error-ico">⚠</span>
                      <div>
                        <p className="vpp-error-ttl">Validation Failed</p>
                        <p className="vpp-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Results ══ */}
          <section className={`vpp-step-card ${!rawResult && !submitting ? "vpp-step-locked" : ""}`}>
            <div className="vpp-step-badge vpp-step-badge--2">
              <span>2</span>
            </div>
            <div className="vpp-step-body">
              <div className="vpp-step-head">
                <div>
                  <h2 className="vpp-step-title">Validation Report</h2>
                  <p className="vpp-step-desc">Detailed accessibility check results broken down by agent and category.</p>
                </div>
                {rawResult && parsed && (
                  <div className="vpp-results-header-right">
                    <div className={`vpp-overall-badge ${isFail ? "badge-fail" : "badge-pass"}`}>
                      {isFail ? "⚠️ FAIL" : "✅ PASS"}
                    </div>
                    <button
                      className="vpp-download-report-icon-btn"
                      onClick={handleDownloadReport}
                      title="Download Report"
                    >
                      <svg className="vpp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <div className="vpp-empty-state">
                  <div className="vpp-empty-illustration">
                    <div className="vpp-empty-doc">
                      <div className="vpp-empty-line"></div>
                      <div className="vpp-empty-line short"></div>
                      <div className="vpp-empty-line"></div>
                      <div className="vpp-empty-line medium"></div>
                    </div>
                    <div className="vpp-empty-scan"></div>
                  </div>
                  <p className="vpp-empty-title">No results yet</p>
                  <p className="vpp-empty-sub">Upload a PPT and run validation to see the report here.</p>
                </div>
              )}

              {/* Loading state */}
              {submitting && (
                <div className="vpp-empty-state">
                  <div className="vpp-scanning-wrap">
                    <div className="vpp-scanning-doc">
                      <div className="vpp-scan-beam"></div>
                      <div className="vpp-s-line"></div>
                      <div className="vpp-s-line short"></div>
                      <div className="vpp-s-line"></div>
                      <div className="vpp-s-line medium"></div>
                      <div className="vpp-s-line"></div>
                    </div>
                  </div>
                  <p className="vpp-empty-title" style={{ marginTop: 20 }}>Scanning PPT…</p>
                  <p className="vpp-empty-sub">Running multi-agent accessibility checks</p>
                </div>
              )}

              {/* ── Results ── */}
              {rawResult && !submitting && parsed && (
                <div className="vpp-results">

                  {/* ── Document Info ── */}
                  <div className="vpp-doc-info-card">

                    {/* Top row: file identity + overall status */}
                    <div className="vpp-dic-top">
                      <div className="vpp-dic-file">
                        <div className="vpp-dic-file-icon">
                          <span>PPT</span>
                        </div>
                        <div className="vpp-dic-file-meta">
                          <span className="vpp-dic-filename">{parsed.meta.document_name ?? "—"}</span>
                          <div className="vpp-dic-pills">
                            {parsed.meta.total_pages != null && (
                              <span className="vpp-dic-pill">
                                <span className="vpp-dic-pill-icon">🗒️</span>
                                {parsed.meta.total_pages} {parsed.meta.total_pages === 1 ? "slide" : "slides"}
                              </span>
                            )}
                            {parsed.meta.total_checks != null && (
                              <span className="vpp-dic-pill">
                                <span className="vpp-dic-pill-icon">🔍</span>
                                {parsed.meta.total_checks} checks
                              </span>
                            )}
                            {parsed.meta.execution_time_ms != null && (
                              <span className="vpp-dic-pill">
                                <span className="vpp-dic-pill-icon">⏱</span>
                                {parsed.meta.execution_time_ms} ms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`vpp-dic-verdict ${isFail ? "verdict-fail" : "verdict-pass"}`}>
                        <span className="vpp-dic-verdict-icon">{isFail ? "✗" : "✓"}</span>
                        <div>
                          <span className="vpp-dic-verdict-label">{isFail ? "FAIL" : "PASS"}</span>
                          <span className="vpp-dic-verdict-sub">
                            {isFail ? `${parsed.meta.total_issues} issue${parsed.meta.total_issues !== 1 ? "s" : ""} found` : "All checks passed"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Two-column body */}
                    <div className="vpp-dic-body">

                      {/* Left col — Severity breakdown */}
                      <div className="vpp-dic-col">
                        <p className="vpp-dic-col-label">Issue Severity</p>
                        <div className="vpp-dic-sev-list">
                          {[
                            { key: "critical_count", label: "Critical", cls: "sev-critical", dot: "#dc2626" },
                            { key: "high_count",     label: "High",     cls: "sev-high",     dot: "#ea580c" },
                            { key: "medium_count",   label: "Medium",   cls: "sev-medium",   dot: "#ca8a04" },
                            { key: "low_count",      label: "Low",      cls: "sev-low",      dot: "#16a34a" },
                            { key: "warning_count",  label: "Warning",  cls: "sev-info",      dot: "#0891b2" },
                          ].filter(s => parsed.meta[s.key] != null).map(s => (
                            <div key={s.key} className="vpp-dic-sev-row">
                              <span className="vpp-dic-sev-dot" style={{ background: s.dot }}></span>
                              <span className="vpp-dic-sev-label">{s.label}</span>
                              <div className="vpp-dic-sev-bar-wrap">
                                <div
                                  className={`vpp-dic-sev-bar ${s.cls}`}
                                  style={{ width: parsed.meta.total_issues > 0 ? `${Math.round(((parsed.meta[s.key] ?? 0) / parsed.meta.total_issues) * 100)}%` : "0%" }}
                                ></div>
                              </div>
                              <span className={`vpp-dic-sev-count ${s.cls}`}>{parsed.meta[s.key] ?? 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right col — Resolution breakdown */}
                      <div className="vpp-dic-col">
                        <p className="vpp-dic-col-label">Resolution Breakdown</p>
                        <div className="vpp-dic-res-list">
                          {parsed.meta.auto_fixable_count != null && (
                            <div className="vpp-dic-res-item res-auto">
                              <div className="vpp-dic-res-icon">⚡</div>
                              <div className="vpp-dic-res-info">
                                <span className="vpp-dic-res-count">{parsed.meta.auto_fixable_count}</span>
                                <span className="vpp-dic-res-label">Auto-fixable</span>
                              </div>
                            </div>
                          )}
                          {parsed.meta.manual_review_count != null && (
                            <div className="vpp-dic-res-item res-manual">
                              <div className="vpp-dic-res-icon">👁️</div>
                              <div className="vpp-dic-res-info">
                                <span className="vpp-dic-res-count">{parsed.meta.manual_review_count}</span>
                                <span className="vpp-dic-res-label">Manual review</span>
                              </div>
                            </div>
                          )}
                          {parsed.meta.ai_review_count != null && (
                            <div className="vpp-dic-res-item res-ai">
                              <div className="vpp-dic-res-icon">🤖</div>
                              <div className="vpp-dic-res-info">
                                <span className="vpp-dic-res-count">{parsed.meta.ai_review_count}</span>
                                <span className="vpp-dic-res-label">AI review</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ── Accessibility Score ── */}
                  {parsed.score && (
                    <div className="vpp-score-card">
                      <div className="vpp-score-top">
                        <div
                          className="vpp-score-ring"
                          style={{ "--score-pct": parsed.score.overall, "--score-color": scoreTheme.color }}
                        >
                          <span className="vpp-score-ring-value">
                            {parsed.score.overall}%
                          </span>
                        </div>
                        <div className="vpp-score-headline">
                          <div className="vpp-score-title-row">
                            <span className="vpp-score-title">Accessibility Score</span>
                            <span
                              className="vpp-score-band"
                              style={{ "--score-color": scoreTheme.color, "--score-bg": scoreTheme.bg }}
                            >
                              {parsed.score.band}
                            </span>
                          </div>
                          <p className="vpp-score-sub">
                            Based on {parsed.score.scored_checks ?? parsed.meta.total_checks} scored checks across all categories.
                          </p>
                        </div>
                        {parsed.score.counts && (
                          <div className="vpp-score-counts">
                            <span className="vpp-score-count-chip">
                              <span className="vpp-score-count-dot" style={{ background: "#16a34a" }}></span>
                              {parsed.score.counts.pass ?? 0} Pass
                            </span>
                            <span className="vpp-score-count-chip">
                              <span className="vpp-score-count-dot" style={{ background: "#dc2626" }}></span>
                              {parsed.score.counts.fail ?? 0} Fail
                            </span>
                            <span className="vpp-score-count-chip">
                              <span className="vpp-score-count-dot" style={{ background: "#0891b2" }}></span>
                              {parsed.score.counts.warning ?? 0} Warning
                            </span>
                            {parsed.score.counts.info != null && (
                              <span className="vpp-score-count-chip">
                                <span className="vpp-score-count-dot" style={{ background: "#94a3b8" }}></span>
                                {parsed.score.counts.info} Info
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {parsed.score.categories && (
                        <div className="vpp-score-categories">
                          {Object.entries(parsed.score.categories).map(([cat, val]) => {
                            const barColor = val >= 90 ? "#16a34a" : val >= 75 ? "#2563eb" : val >= 50 ? "#d97706" : "#dc2626";
                            return (
                              <div key={cat} className="vpp-score-cat-row">
                                <span className="vpp-score-cat-label">{cat}</span>
                                <div className="vpp-score-cat-bar-wrap">
                                  <div className="vpp-score-cat-bar" style={{ width: `${val}%`, background: barColor }}></div>
                                </div>
                                <span className="vpp-score-cat-val">{val}%</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Agent Cards ── */}
                  <div className="vpp-agents-grid">
                    {parsed.agents.map((agent) => {
                      const selectedCat = getSelectedCat(agent.name, agent.catKeys);
                      const visibleIssues = selectedCat ? (agent.catMap[selectedCat] ?? []) : agent.allIssues;
                      const hasProblem = agent.failCount > 0 || agent.warnCount > 0;

                      return (
                        <div
                          key={agent.name}
                          className={`vpp-agent-card ${hasProblem ? "has-issues" : "all-good"}`}
                          style={{ "--agent-color": agent.color, "--agent-bg": agent.bg }}
                        >
                          {/* Card header */}
                          <div className="vpp-ac-header">
                            <div className="vpp-ac-icon-wrap">
                              <span className="vpp-ac-icon">{agent.icon}</span>
                            </div>
                            <div className="vpp-ac-title-area">
                              <h4 className="vpp-ac-name">{agent.name}</h4>
                              <div className="vpp-ac-badges">
                                {agent.failCount > 0 && (
                                  <span className="vpp-ac-badge ac-fail">{agent.failCount} Failed</span>
                                )}
                                {agent.warnCount > 0 && (
                                  <span className="vpp-ac-badge ac-warn">{agent.warnCount} Warning{agent.warnCount !== 1 ? "s" : ""}</span>
                                )}
                                {agent.passCount > 0 && agent.failCount === 0 && agent.warnCount === 0 && (
                                  <span className="vpp-ac-badge ac-pass">✓ All Passed</span>
                                )}
                              </div>
                            </div>
                            <div className={`vpp-ac-status-dot ${hasProblem ? "dot-issue" : "dot-ok"}`}></div>
                          </div>

                          {/* Category radio tabs */}
                          {agent.catKeys.length > 1 && (
                            <div className="vpp-cat-tabs">
                              {agent.catKeys.map((cat) => {
                                const catProblems = (agent.catMap[cat] ?? []).filter(
                                  i => i.status === "FAIL" || i.status === "WARNING"
                                ).length;
                                return (
                                  <label key={cat} className={`vpp-cat-tab ${selectedCat === cat ? "tab-active" : ""}`}>
                                    <input
                                      type="radio"
                                      name={`cat-${agent.name}`}
                                      value={cat}
                                      checked={selectedCat === cat}
                                      onChange={() => setActiveCat(prev => ({ ...prev, [agent.name]: cat }))}
                                    />
                                    <span className="vpp-cat-tab-text">{cat}</span>
                                    {catProblems > 0 && (
                                      <span className="vpp-cat-tab-count">{catProblems}</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Issues list */}
                          <div className="vpp-issues-list">
                            {visibleIssues.length === 0 && (
                              <div className="vpp-no-issues">
                                <span>✅</span>
                                <p>No issues in this category</p>
                              </div>
                            )}
                            {visibleIssues.map((issue, ri) => (
                              <div
                                key={`${issue.rule_id}-${ri}`}
                                className={`vpp-issue-row issue-${issue.status.toLowerCase()}`}
                              >
                                <div className="vpp-issue-row-top">
                                  <div className="vpp-issue-left">
                                    <span className={`vpp-sev-dot-sm ${severityClass(issue.severity)}`} title={`${issue.severity} severity`}></span>
                                    <code className="vpp-rule-id">{issue.rule_id}</code>
                                  </div>
                                  <div className="vpp-issue-right">
                                    <span className={`vpp-status-badge ${statusClass(issue.status)}`}>{issue.status}</span>
                                    {issue.auto_fixable && (
                                      <span className="vpp-autofixable" title="Auto-fixable">⚡</span>
                                    )}
                                  </div>
                                </div>
                                <p className="vpp-issue-msg">{issue.message}</p>
                                {(issue.status === "FAIL" || issue.status === "WARNING") && issue.recommendation && (
                                  <div className="vpp-issue-rec">
                                    <span className="vpp-rec-bulb">💡</span>
                                    <p>{issue.recommendation}</p>
                                  </div>
                                )}
                                {issue.page_no != null && (
                                  <span className="vpp-page-tag">Slide {issue.page_no}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Summary ── */}
                  <div className="vpp-summary-card">
                    <div className="vpp-summary-header">
                      <span className="vpp-summary-icon">📊</span>
                      <h3 className="vpp-summary-title">Agent Summary</h3>
                    </div>
                    <div className="vpp-summary-rows">
                      {parsed.agents.map((agent) => {
                        const total = agent.issueCount;
                        const failPct = total > 0 ? Math.round((agent.failCount / total) * 100) : 0;
                        return (
                          <div key={agent.name} className="vpp-summary-row">
                            <div className="vpp-summary-row-left">
                              <span className="vpp-sum-icon">{agent.icon}</span>
                              <div className="vpp-sum-info">
                                <span className="vpp-sum-name">{agent.name}</span>
                                <span className="vpp-sum-counts">{total} checks</span>
                              </div>
                            </div>
                            <div className="vpp-summary-row-right">
                              {agent.failCount > 0 && (
                                <span className="vpp-sum-badge sum-fail">{agent.failCount} Failed</span>
                              )}
                              {agent.warnCount > 0 && (
                                <span className="vpp-sum-badge sum-warn">{agent.warnCount} Warnings</span>
                              )}
                              {agent.passCount > 0 && (
                                <span className="vpp-sum-badge sum-pass">{agent.passCount} Passed</span>
                              )}
                            </div>
                            <div className="vpp-sum-bar-wrap">
                              <div
                                className="vpp-sum-bar"
                                style={{ width: `${failPct}%`, background: agent.failCount > 0 ? "#ef4444" : "#22c55e" }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final verdict */}
                    <div className={`vpp-verdict ${isFail ? "verdict-fail" : "verdict-pass"}`}>
                      <div className="vpp-verdict-icon">{isFail ? "⚠️" : "🎉"}</div>
                      <div className="vpp-verdict-text">
                        <p className="vpp-verdict-main">
                          {isFail
                            ? `Presentation has ${parsed.meta.total_issues} accessibility issue${parsed.meta.total_issues !== 1 ? "s" : ""} that need attention`
                            : "Presentation passed all accessibility checks!"}
                        </p>
                        {isFail && (
                          <p className="vpp-verdict-sub">
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