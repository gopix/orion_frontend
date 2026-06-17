

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orionRemediatePdf, getRemediationStatus } from "../../services/apiServices";
import "./RemediatePdf.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default function RemediatePdf() {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState("auto");
  const [standard, setStandard] = useState("wcag");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [rawResult, setRawResult] = useState(null);
  
  // Remediation status
  const [jobId, setJobId] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [statusInputs, setStatusInputs] = useState({
    mode: "auto",
    standard: "wcag"
  });

  const pdfInputRef = useRef(null);

  // ── File validation ──────────────────────────────────────────
  const validateFile = (file) => {
    if (!file) return null;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setSubmitError("Only .pdf files are supported.");
      return null;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSubmitError("File exceeds the 50 MB limit. Please upload a smaller PDF.");
      return null;
    }
    return file;
  };

  const applyFile = (file) => {
    const valid = validateFile(file);
    if (!valid) return;
    setPdfFile(valid);
    setRawResult(null);
    setSubmitError("");
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handlePdfSelect = (e) => {
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
    setPdfFile(null);
    setRawResult(null);
    setSubmitError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!pdfFile) {
      setSubmitError("Please upload a PDF file first.");
      return;
    }
    setSubmitting(true);
    setRawResult(null);
    setSubmitError("");

    try {
      const orgId = sessionStorage.getItem("organization_id") || 1;
      const projectId = sessionStorage.getItem("project_id") || 1;
      const response = await orionRemediatePdf(pdfFile, orgId, projectId, mode, standard);
      
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      
      const data = await response.json();
      setRawResult(data);
      
      // Extract job ID from response
      const jid = data?.data?.job_id || data?.job_id;
      if (jid) {
        setJobId(jid);
        setStatusInputs({ mode, standard });
      }
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Check Remediation Status ─────────────────────────────────
  const handleCheckStatus = async () => {
    if (!jobId) {
      setStatusError("No job ID available. Please remediate a PDF first.");
      return;
    }

    setStatusLoading(true);
    setStatusError("");
    setStatusData(null);

    try {
      const response = await getRemediationStatus(jobId);
      
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      
      const data = await response.json();
      setStatusData(data);
    } catch (err) {
      setStatusError(err.message || "Failed to check status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Parse result ─────────────────────────────────────────────
  const parseResult = (raw) => {
    if (!raw) return null;
    const d = raw?.data ?? raw;
    return {
      job_id: d.job_id,
      file_name: d.file_name,
      issues_detected: d.issues_detected ?? 0,
      issues_fixed: d.issues_fixed ?? 0,
      issues_remaining: d.issues_remaining ?? 0,
      auto_fixable_count: d.auto_fixable_count ?? 0,
      manual_fixable_count: d.manual_fixable_count ?? 0,
      execution_time_ms: d.execution_time_ms,
      download_url: d.download_url,
      report_url: d.report_url,
      remediation_summary: d.remediation_summary,
      detailed_results: d.detailed_results,
    };
  };

  const parsed = parseResult(rawResult);
  const fixRate = parsed && parsed.issues_detected > 0
    ? Math.round(((parsed.issues_fixed ?? 0) / parsed.issues_detected) * 100)
    : 0;

  // ── Derived ──────────────────────────────────────────────────
  const statusLabel = () => {
    if (submitting) return { cls: "chip-running", dot: "dot-amber", text: "Remediating…" };
    if (rawResult) return { cls: "chip-pass", dot: "dot-green", text: "Done" };
    if (pdfFile) return { cls: "chip-ready", dot: "dot-green", text: "PDF Ready" };
    return null;
  };
  const chip = statusLabel();

  return (
    <div className="rp-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="rp-sidebar">
        <div className="rp-logo">
          <div className="rp-logo-mark">O</div>
          <div className="rp-logo-text">
            <span>ORION</span>
            <small>Accessibility &amp; Remediation</small>
          </div>
        </div>

        <nav className="rp-nav">
          <p className="rp-nav-label">Workspace</p>

          <div className="rp-nav-item" onClick={() => navigate("/template")}>
            <span className="rp-nav-icon">📋</span>
            <span>Template</span>
          </div>

          <div className="rp-nav-item" onClick={() => navigate("/validate-pdf")}>
            <span className="rp-nav-icon">✅</span>
            <span>Validate PDF</span>
          </div>

          <div className="rp-nav-item active">
            <span className="rp-nav-icon">🛠️</span>
            <span>Remediate PDF</span>
            <span className="rp-nav-dot"></span>
          </div>
        </nav>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="rp-main">
        {/* Topbar */}
        <div className="rp-topbar">
          <div className="rp-breadcrumb">
            <span className="rp-bc-root">Accessibility</span>
            <span className="rp-bc-sep">›</span>
            <span className="rp-bc-current">Remediate PDF</span>
          </div>

          <div className="rp-topbar-right">
            {chip && (
              <div className={`rp-status-chip ${chip.cls}`}>
                <span className={`rp-chip-dot ${chip.dot}`}></span>
                {chip.text}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="rp-content">
          {/* ══ STEP 1 — Upload ══ */}
          <section className="rp-step-card">
            <div className="rp-step-inner">
              <div className="rp-step-badge-col">
                <div className="rp-step-badge"><span>1</span></div>
              </div>

              <div className="rp-step-body">
                <div className="rp-step-head">
                  <div>
                    <h2 className="rp-step-title">Upload PDF</h2>
                    <p className="rp-step-desc">Choose a PDF file to remediate for accessibility</p>
                  </div>
                </div>

                <div
                  className={`rp-drop-zone ${dragOver ? "active" : ""}`}
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={() => setDragOver(true)}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {pdfFile ? (
                    <>
                      <div className="rp-dz-icon">📄</div>
                      <div className="rp-dz-text">
                        <span className="rp-dz-name">{pdfFile.name}</span>
                        <span className="rp-dz-size">{formatBytes(pdfFile.size)}</span>
                      </div>
                      <button
                        className="rp-dz-remove"
                        onClick={handleRemove}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="rp-dz-icon">📁</div>
                      <div className="rp-dz-text">
                        <span className="rp-dz-title">Drag & drop your PDF here</span>
                        <span className="rp-dz-sub">or click to browse</span>
                        <span className="rp-dz-limit">Max 50 MB</span>
                      </div>
                    </>
                  )}
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfSelect}
                    style={{ display: "none" }}
                  />
                </div>

                {submitError && (
                  <div className="rp-error-banner">
                    <span className="rp-error-ico">⚠</span>
                    <div>
                      <p className="rp-error-ttl">Error</p>
                      <p className="rp-error-msg">{submitError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Configure ══ */}
          <section className="rp-step-card">
            <div className="rp-step-inner">
              <div className="rp-step-badge-col">
                <div className="rp-step-badge"><span>2</span></div>
              </div>

              <div className="rp-step-body">
                <div className="rp-step-head">
                  <div>
                    <h2 className="rp-step-title">Remediation Settings</h2>
                    <p className="rp-step-desc">Configure how your PDF should be remediated</p>
                  </div>
                </div>

                <div className="rp-options">
                  <div className="rp-option">
                    <p className="rp-option-label">Remediation Mode</p>
                    <div className="rp-radio-group">
                      <label className="rp-radio">
                        <input
                          type="radio"
                          value="auto"
                          checked={mode === "auto"}
                          onChange={(e) => setMode(e.target.value)}
                        />
                        <span className="rp-radio-label">⚡ Automatic</span>
                        <span className="rp-radio-hint">AI-powered automatic remediation</span>
                      </label>
                      <label className="rp-radio">
                        <input
                          type="radio"
                          value="manual"
                          checked={mode === "manual"}
                          onChange={(e) => setMode(e.target.value)}
                        />
                        <span className="rp-radio-label">🎯 Manual Review</span>
                        <span className="rp-radio-hint">Step-by-step assisted remediation</span>
                      </label>
                    </div>
                  </div>

                  <div className="rp-option">
                    <p className="rp-option-label">Standard</p>
                    <div className="rp-radio-group">
                      <label className="rp-radio">
                        <input
                          type="radio"
                          value="wcag"
                          checked={standard === "wcag"}
                          onChange={(e) => setStandard(e.target.value)}
                        />
                        <span className="rp-radio-label">📋 WCAG</span>
                        <span className="rp-radio-hint">Web Content Accessibility Guidelines 2.1</span>
                      </label>
                      <label className="rp-radio">
                        <input
                          type="radio"
                          value="pdfua"
                          checked={standard === "pdfua"}
                          onChange={(e) => setStandard(e.target.value)}
                        />
                        <span className="rp-radio-label">📄 PDF/UA-1</span>
                        <span className="rp-radio-hint">PDF/Universal Accessibility standard</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 3 — Submit ══ */}
          <section className="rp-step-card">
            <div className="rp-step-inner">
              <div className="rp-step-badge-col">
                <div className="rp-step-badge"><span>3</span></div>
              </div>

              <div className="rp-step-body">
                <div className="rp-step-head">
                  <div>
                    <h2 className="rp-step-title">Start Remediation</h2>
                    <p className="rp-step-desc">Process your PDF and generate remediated version</p>
                  </div>
                </div>

                <button
                  className="rp-submit-btn"
                  onClick={handleSubmit}
                  disabled={!pdfFile || submitting}
                >
                  {submitting ? (
                    <><span className="rp-btn-spin"></span> Remediating…</>
                  ) : (
                    <>🚀 Start Remediation</>
                  )}
                </button>

                {!pdfFile && (
                  <div className="rp-info-banner">
                    <span className="rp-info-ico">ℹ</span>
                    <div>
                      <p className="rp-info-ttl">Upload a PDF First</p>
                      <p className="rp-info-msg">Please upload a PDF file in Step 1 to enable remediation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ══ RESULTS ══ */}
          {rawResult && !submitting && parsed && (
            <section className="rp-step-card rp-results-section">
              <div className="rp-step-inner">
                <div className="rp-doc-info-card">
                  {/* Top row: file identity + overall verdict */}
                  <div className="rp-dic-top">
                    <div className="rp-dic-file">
                      <div className="rp-dic-file-icon">
                        <span>PDF</span>
                      </div>
                      <div className="rp-dic-file-meta">
                        <span className="rp-dic-filename">{parsed.file_name ?? "Remediated PDF"}</span>
                        {parsed.execution_time_ms != null && (
                          <div className="rp-dic-pills">
                            <span className="rp-dic-pill">
                              <span className="rp-dic-pill-icon">⏱</span>
                              {parsed.execution_time_ms} ms
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="rp-dic-verdict verdict-success">
                      <span className="rp-dic-verdict-icon">✓</span>
                      <div>
                        <span className="rp-dic-verdict-label">REMEDIATION COMPLETE</span>
                        <span className="rp-dic-verdict-sub">PDF processed successfully</span>
                      </div>
                    </div>
                  </div>

                  {/* Two-column body */}
                  <div className="rp-dic-body">
                    <div className="rp-dic-col">
                      <p className="rp-dic-col-label">Issue Breakdown</p>
                      <div className="rp-dic-sev-list">
                        <div className="rp-dic-sev-row">
                          <span className="rp-dic-sev-dot" style={{ background: "#6366f1" }}></span>
                          <span className="rp-dic-sev-label">Detected</span>
                          <div className="rp-dic-sev-bar-wrap">
                            <div className="rp-dic-sev-bar" style={{ width: "100%", background: "#6366f1" }}></div>
                          </div>
                          <span className="rp-dic-sev-count" style={{ color: "#6366f1" }}>{parsed.issues_detected ?? 0}</span>
                        </div>
                        <div className="rp-dic-sev-row">
                          <span className="rp-dic-sev-dot" style={{ background: "#16a34a" }}></span>
                          <span className="rp-dic-sev-label">Fixed</span>
                          <div className="rp-dic-sev-bar-wrap">
                            <div
                              className="rp-dic-sev-bar"
                              style={{
                                width: parsed.issues_detected > 0
                                  ? `${Math.round(((parsed.issues_fixed ?? 0) / parsed.issues_detected) * 100)}%`
                                  : "0%",
                                background: "#16a34a"
                              }}
                            ></div>
                          </div>
                          <span className="rp-dic-sev-count" style={{ color: "#16a34a" }}>{parsed.issues_fixed ?? 0}</span>
                        </div>
                        <div className="rp-dic-sev-row">
                          <span className="rp-dic-sev-dot" style={{ background: "#dc2626" }}></span>
                          <span className="rp-dic-sev-label">Remaining</span>
                          <div className="rp-dic-sev-bar-wrap">
                            <div
                              className="rp-dic-sev-bar"
                              style={{
                                width: parsed.issues_detected > 0
                                  ? `${Math.round(((parsed.issues_remaining ?? 0) / parsed.issues_detected) * 100)}%`
                                  : "0%",
                                background: "#dc2626"
                              }}
                            ></div>
                          </div>
                          <span className="rp-dic-sev-count" style={{ color: "#dc2626" }}>{parsed.issues_remaining ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rp-dic-col">
                      <p className="rp-dic-col-label">Fix Summary</p>
                      <div className="rp-dic-res-list">
                        <div className="rp-dic-res-item res-auto">
                          <div className="rp-dic-res-icon">⚡</div>
                          <div className="rp-dic-res-info">
                            <span className="rp-dic-res-count">{parsed.auto_fixable_count ?? 0}</span>
                            <span className="rp-dic-res-label">Auto-fixed</span>
                          </div>
                        </div>
                        <div className="rp-dic-res-item res-manual">
                          <div className="rp-dic-res-icon">👁️</div>
                          <div className="rp-dic-res-info">
                            <span className="rp-dic-res-count">{fixRate}%</span>
                            <span className="rp-dic-res-label">Resolution Rate</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download button */}
                  {parsed.download_url && (
                    <div className="rp-action-row">
                      <a
                        href={parsed.download_url}
                        className="rp-action-btn rp-action-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ⬇️ Download Remediated PDF
                      </a>
                    </div>
                  )}

                  {/* Remediation Summary */}
                  {parsed.remediation_summary && (
                    <div className="rp-summary-section">
                      <h3 className="rp-summary-title">Remediation Summary</h3>
                      <div className="rp-summary-content">
                        {Array.isArray(parsed.remediation_summary) ? (
                          <ul className="rp-summary-list">
                            {parsed.remediation_summary.map((item, idx) => (
                              <li key={idx} className="rp-summary-item">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="rp-summary-text">{parsed.remediation_summary}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detailed Results */}
                  {parsed.detailed_results && (
                    <div className="rp-details-section">
                      <h3 className="rp-details-title">Detailed Results</h3>
                      <div className="rp-details-content">
                        {typeof parsed.detailed_results === 'object' ? (
                          <div className="rp-details-grid">
                            {Object.entries(parsed.detailed_results).map(([key, value]) => (
                              <div key={key} className="rp-detail-item">
                                <span className="rp-detail-key">{key.replace(/_/g, ' ').toUpperCase()}</span>
                                <span className="rp-detail-value">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="rp-details-text">{parsed.detailed_results}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Remediation Status Section ── */}
                {jobId && (
                  <div className="rp-status-section">
                    <div className="rp-status-header">
                      <div>
                        <h3 className="rp-status-title">Check Job Status</h3>
                        <p className="rp-status-desc">
                          Monitor the progress of your remediation job using the job ID
                        </p>
                      </div>
                      <button
                        className="rp-status-btn"
                        onClick={handleCheckStatus}
                        disabled={statusLoading}
                      >
                        {statusLoading ? (
                          <><span className="rp-btn-spin"></span> Checking…</>
                        ) : (
                          <>🔄 Check Status</>
                        )}
                      </button>
                    </div>

                    <div className="rp-job-id-row">
                      <span className="rp-job-id-label">Job ID</span>
                      <code className="rp-job-id-val">{jobId}</code>
                    </div>

                    {statusError && (
                      <div className="rp-error-banner" style={{ marginTop: 12 }}>
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">Status Check Failed</p>
                          <p className="rp-error-msg">{statusError}</p>
                        </div>
                      </div>
                    )}

                    {/* Status result with card layout */}
                    {statusData && !statusLoading && (
                      <div className="rp-status-result">
                        {/* Message and status overview */}
                        {(statusData.message || statusData.status) && (
                          <div className="rp-status-message-card">
                            <p className="rp-status-message">{statusData.message || statusData.status}</p>
                          </div>
                        )}

                        {/* Status data as cards */}
                        {statusData.data && (
                          <div className="rp-status-data-grid">
                            {typeof statusData.data === 'object' ? (
                              Object.entries(statusData.data).map(([key, value]) => (
                                <div key={key} className="rp-status-data-card">
                                  <span className="rp-status-data-label">{key.replace(/_/g, ' ').toUpperCase()}</span>
                                  <span className="rp-status-data-value">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="rp-status-data-card">
                                <span className="rp-status-data-label">STATUS</span>
                                <span className="rp-status-data-value">{String(statusData.data)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Errors if any */}
                        {statusData.errors && statusData.errors.length > 0 && (
                          <div className="rp-status-errors">
                            <p className="rp-status-errors-label">Issues Found</p>
                            <div className="rp-status-errors-list">
                              {statusData.errors.map((err, i) => (
                                <div key={i} className="rp-status-error-item">
                                  <span className="rp-error-badge">⚠</span>
                                  <span>{err}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Success state when no errors */}
                        {(!statusData.errors || statusData.errors.length === 0) && (
                          <div className="rp-status-success">
                            <span className="rp-success-icon">✓</span>
                            <p className="rp-success-text">Job processed successfully</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
