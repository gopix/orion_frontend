
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orionRemediatePdf, getRemediationStatus, downloadRemediatedPdf } from "../../services/apiServices";
import "./RemediatePdf.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default function RemediatePdf() {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile]           = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const [mode, setMode]                 = useState("auto");   // "auto" | "manual"
  const [standard, setStandard]         = useState("wcag");   // "wcag" | "pdfua"
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState("");
  const [rawResult, setRawResult]       = useState(null);

  // ── Status polling state ──────────────────────────────────────
  const [jobId, setJobId]               = useState(null);
  const [statusData, setStatusData]     = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError]   = useState("");
  const [reportData, setReportData]     = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError]   = useState("");
  const [downloading, setDownloading]   = useState(false);
  const [downloadError, setDownloadError] = useState("");

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
    setJobId(null);
    setStatusData(null);
    setStatusError("");
    setReportData(null);
    setReportError("");
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
    setJobId(null);
    setStatusData(null);
    setStatusError("");
    setReportData(null);
    setReportError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── Check Remediation Report (NEW - from API) ──────────────────
  const handleCheckRemediationReport = async () => {
    if (!jobId) {
      setReportError("No job ID available. Please run remediation first.");
      return;
    }
    setReportLoading(true);
    setReportData(null);
    setReportError("");

    try {
      // GET /api/v1/accessibility/remediation-report/{job_id}
      const response = await fetch(
        `/api/v1/accessibility/remediation-report/${jobId}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try {
          const e = await response.json();
          errMsg = e.detail || e.message || e.error || JSON.stringify(e);
        } catch {
          try {
            const t = await response.text();
            if (t) errMsg = t;
          } catch {}
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setReportError(err.message || "Could not fetch remediation report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  // ── Submit — Remediate PDF ────────────────────────────────────
  const handleSubmit = async () => {
    if (!pdfFile) {
      setSubmitError("Please upload a PDF file first.");
      return;
    }
    setSubmitting(true);
    setRawResult(null);
    setSubmitError("");
    setJobId(null);
    setStatusData(null);
    setStatusError("");
    setReportData(null);
    setReportError("");

    try {
      const orgId     = sessionStorage.getItem("organization_id") || 1;
      const projectId = sessionStorage.getItem("project_id")      || 1;
      const response  = await orionRemediatePdf(pdfFile, orgId, projectId);

      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setRawResult(data);

      // Save job_id for status polling
      const id = data?.job_id ?? data?.data?.job_id ?? null;
      if (id) setJobId(id);

    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Check Remediation Status ──────────────────────────────────
  const handleCheckStatus = async () => {
    if (!jobId) {
      setStatusError("No job ID available. Please run remediation first.");
      return;
    }
    setStatusLoading(true);
    setStatusData(null);
    setStatusError("");

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
      setStatusError(err.message || "Could not fetch status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Download Remediated PDF ─────────────────────────────────────
  const handleDownloadRemediatedPdf = async () => {
    if (!jobId) {
      setDownloadError("No job ID available. Please run remediation first.");
      return;
    }
    setDownloading(true);
    setDownloadError("");

    try {
      const response = await downloadRemediatedPdf(jobId);

      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFile?.name
        ? `remediated_${pdfFile.name}`
        : `remediated_${jobId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.message || "Could not download the remediated PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Parse remediation result ──────────────────────────────────
  const parseResult = (raw) => {
    if (!raw) return null;
    const d = raw?.data ?? raw;
    return {
      job_id:             d.job_id,
      status:             d.status,
      issues_detected:    d.issues_detected,
      issues_fixed:       d.issues_fixed,
      issues_remaining:   d.issues_remaining,
      auto_fixable_count: d.auto_fixable_count,
      download_url:       d.download_url,
      report_url:         d.report_url,
    };
  };

  const parsed = parseResult(rawResult);

  // ── Derived ──────────────────────────────────────────────────
  const statusLabel = () => {
    if (submitting)        return { cls: "chip-running", dot: "dot-amber", text: "Remediating…" };
    if (rawResult)         return { cls: "chip-pass",    dot: "dot-green", text: "Done" };
    if (pdfFile)           return { cls: "chip-ready",   dot: "dot-green", text: "PDF Ready" };
    return null;
  };
  const chip = statusLabel();

  const fixRate = parsed && parsed.issues_detected > 0
    ? Math.round((parsed.issues_fixed / parsed.issues_detected) * 100)
    : 0;

  // A job has already been run for the current file — re-running requires
  // removing/replacing the file first, so the submit button locks here.
  const isLockedAfterRun = submitting || Boolean(rawResult) || Boolean(jobId);

  return (
    <div className="rp-page">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="rp-sidebar">
        <div className="rp-logo">
          <div className="rp-logo-mark">O</div>
          <div className="rp-logo-text">
            <span>Orion</span>
            <small>Accessibility</small>
          </div>
        </div>

        <nav className="rp-nav">
          <p className="rp-nav-label">WORKSPACE</p>
          <button className="rp-nav-item" onClick={() => navigate("/template")}>
            <span className="rp-nav-icon">📋</span>
            <span className="rp-nav-text">Template</span>
          </button>
          <button className="rp-nav-item" onClick={() => navigate("/validate-pdf")}>
            <span className="rp-nav-icon">✓</span>
            <span className="rp-nav-text">Validate PDF</span>
          </button>
          <button className="rp-nav-item active">
            <span className="rp-nav-icon">🛠️</span>
            <span className="rp-nav-text">Remediate PDF</span>
            <span className="rp-nav-dot"></span>
          </button>
        </nav>

        <div className="rp-sidebar-footer">
          <button className="rp-help-btn">
            <span>?</span>
          </button>
          <p className="rp-help-text">Need help?</p>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="rp-main">
        <div className="rp-container">

          {!pdfFile && !jobId ? (
            <section className="rp-upload-section">
              <div className="rp-upload-wrapper">
                <div className="rp-upload-icon">📥</div>
                <h1 className="rp-upload-title">Upload PDF for Remediation</h1>
                <p className="rp-upload-desc">
                  Drag and drop your PDF file or click to browse
                </p>
                <p className="rp-upload-subdesc">
                  Maximum file size: 50 MB. Supports .pdf files.
                </p>

                <div
                  className={`rp-drop-zone ${dragOver ? "rp-drag-over" : ""}`}
                  onDragOver={() => setDragOver(true)}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <div className="rp-drop-content">
                    <div className="rp-drop-icon">📁</div>
                    <p className="rp-drop-text">Drop your PDF here</p>
                    <p className="rp-drop-subtext">or <strong>click to select</strong></p>
                  </div>
                </div>

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfSelect}
                  style={{ display: "none" }}
                />

                {submitError && (
                  <div className="rp-error-banner">
                    <span className="rp-error-ico">⚠</span>
                    <div>
                      <p className="rp-error-ttl">Upload Failed</p>
                      <p className="rp-error-msg">{submitError}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="rp-work-section">
              <div className="rp-work-container">
                {/* ── STATUS BADGE ROW ─────────────────────────── */}
                {chip && (
                  <div className="rp-status-badge-row">
                    <div className={`rp-status-chip ${chip.cls}`}>
                      <span className={`rp-status-dot ${chip.dot}`}></span>
                      <span className="rp-status-text">{chip.text}</span>
                    </div>
                  </div>
                )}

                {/* ────────────────────────────────────────────────
                    SWAPPED LAYOUT: Status Report FIRST (Left), 
                    Remediate PDF SECOND (Right)
                    ──────────────────────────────────────────────── */}

                {/* ── SECTION 1: Check Job Status / Remediation Report (LEFT) ── */}
                {jobId && (
                  <div className="rp-status-section">
                    <div className="rp-status-header">
                      <div>
                        <h3 className="rp-status-title">Remediation Report</h3>
                        <p className="rp-status-desc">
                          View detailed validation, remediation, and re-validation results
                        </p>
                      </div>
                    </div>

                    <div className="rp-job-id-row">
                      <span className="rp-job-id-label">Job ID</span>
                      <code className="rp-job-id-val">{jobId}</code>
                    </div>

                    {/* Both actions are independent — checking one never hides the other */}
                    <div className="rp-dual-action-row">
                      <button
                        className="rp-status-btn"
                        onClick={handleCheckRemediationReport}
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <><span className="rp-btn-spin"></span> Loading…</>
                        ) : (
                          <><span className="rp-btn-icon">📋</span> Get Report</>
                        )}
                      </button>

                      <button
                        className="rp-alt-btn"
                        onClick={handleCheckStatus}
                        disabled={statusLoading}
                      >
                        {statusLoading ? (
                          <><span className="rp-btn-spin rp-btn-spin-alt"></span> Checking…</>
                        ) : (
                          <><span className="rp-btn-icon">🔄</span> Check Job Status</>
                        )}
                      </button>
                    </div>

                    {/* ── Report result ── */}
                    {reportError && (
                      <div className="rp-error-banner" style={{ marginTop: 16 }}>
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">Report Fetch Failed</p>
                          <p className="rp-error-msg">{reportError}</p>
                        </div>
                      </div>
                    )}

                    {reportData && !reportLoading && (
                      <div className="rp-report-result">
                        <p className="rp-result-block-label">Remediation Report</p>

                        {reportData.message && (
                          <div className="rp-report-summary-card">
                            <div className="rp-report-summary-item">
                              <span className="rp-report-label">Status Message</span>
                              <span className="rp-report-message">{reportData.message}</span>
                            </div>
                          </div>
                        )}

                        {/* Report data as professional cards */}
                        {reportData.data && (
                          <div className="rp-report-data-grid">
                            {typeof reportData.data === 'object' ? (
                              Object.entries(reportData.data).map(([key, value]) => (
                                <div key={key} className="rp-report-data-card">
                                  <span className="rp-report-data-label">
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                  <span className="rp-report-data-value">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="rp-report-data-card">
                                <span className="rp-report-data-label">DATA</span>
                                <span className="rp-report-data-value">{String(reportData.data)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Errors if any */}
                        {reportData.errors && reportData.errors.length > 0 && (
                          <div className="rp-report-errors">
                            <p className="rp-report-errors-label">⚠️ Errors Encountered</p>
                            <div className="rp-report-errors-list">
                              {reportData.errors.map((err, i) => (
                                <div key={i} className="rp-report-error-item">
                                  <span className="rp-error-badge">✕</span>
                                  <span>{err}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Success state when no errors */}
                        {(!reportData.errors || reportData.errors.length === 0) && reportData.data && (
                          <div className="rp-report-success">
                            <span className="rp-success-icon">✓</span>
                            <p className="rp-success-text">Report retrieved successfully</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Job status result (independent of report) ── */}
                    {statusError && (
                      <div className="rp-error-banner" style={{ marginTop: 16 }}>
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">Status Check Failed</p>
                          <p className="rp-error-msg">{statusError}</p>
                        </div>
                      </div>
                    )}

                    {statusData && !statusLoading && (
                      <div className="rp-status-result">
                        <p className="rp-result-block-label">Job Status</p>
                        {(statusData.message || statusData.status) && (
                          <div className="rp-status-message-card">
                            <p className="rp-status-message">{statusData.message || statusData.status}</p>
                          </div>
                        )}
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
                      </div>
                    )}
                  </div>
                )}

                {/* ── SECTION 2: Remediate PDF Results (RIGHT) ── */}
                {parsed && (
                  <div className="rp-results-section">
                    <div className="rp-results-header">
                      <h3 className="rp-results-title">Remediation Results</h3>
                      <p className="rp-results-desc">
                        Summary of issues detected and fixed
                      </p>
                    </div>

                    <div className="rp-results-content">
                      <div className="rp-dic-grid">
                        <div className="rp-dic-col">
                          <p className="rp-dic-col-label">Issue Detection</p>
                          <div className="rp-dic-res-list">
                            <div className="rp-dic-res-item res-detected">
                              <div className="rp-dic-res-icon">🔍</div>
                              <div className="rp-dic-res-info">
                                <span className="rp-dic-res-count">{parsed.issues_detected ?? 0}</span>
                                <span className="rp-dic-res-label">Issues Detected</span>
                              </div>
                            </div>
                            <div className="rp-dic-res-item res-fixed">
                              <div className="rp-dic-res-icon">✨</div>
                              <div className="rp-dic-res-info">
                                <span className="rp-dic-res-count">{parsed.issues_fixed ?? 0}</span>
                                <span className="rp-dic-res-label">Issues Fixed</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rp-dic-col">
                          <p className="rp-dic-col-label">Remaining Issues</p>
                          <div className="rp-dic-severity-list">
                            <div className="rp-dic-sev-item" style={{ borderTop: "3px solid #dc2626" }}>
                              <div className="rp-dic-sev-bar">
                                <div
                                  className="rp-dic-sev-fill"
                                  style={{
                                    width: `${Math.min(100, ((parsed.issues_remaining ?? 0) / (parsed.issues_detected ?? 1)) * 100)}%`,
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

                      {/* Download button — wired to GET /accessibility/download-remediated-pdf/{job_id} */}
                      {jobId && (
                        <div className="rp-action-row">
                          <button
                            className="rp-action-btn rp-action-primary"
                            onClick={handleDownloadRemediatedPdf}
                            disabled={downloading}
                          >
                            {downloading ? (
                              <><span className="rp-btn-spin"></span> Preparing Download…</>
                            ) : (
                              <><span className="rp-btn-icon">⬇️</span> Download Remediated PDF</>
                            )}
                          </button>
                        </div>
                      )}

                      {downloadError && (
                        <div className="rp-error-banner" style={{ marginTop: 16 }}>
                          <span className="rp-error-ico">⚠</span>
                          <div>
                            <p className="rp-error-ttl">Download Failed</p>
                            <p className="rp-error-msg">{downloadError}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── File Management Section ────────────────────── */}
                <div className="rp-file-management-section">
                  <div className="rp-fm-header">
                    <h3 className="rp-fm-title">Current File</h3>
                  </div>

                  {pdfFile && (
                    <div className="rp-fm-content">
                      <div className="rp-file-card">
                        <div className="rp-file-icon">📄</div>
                        <div className="rp-file-info">
                          <p className="rp-file-name">{pdfFile.name}</p>
                          <p className="rp-file-size">{formatBytes(pdfFile.size)}</p>
                        </div>
                        <button
                          className="rp-file-remove"
                          onClick={handleRemove}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="rp-controls-row">
                        <div className="rp-control-group">
                          <label className="rp-control-label">Mode</label>
                          <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className="rp-control-select"
                            disabled={isLockedAfterRun}
                          >
                            <option value="auto">Auto</option>
                            <option value="manual">Manual</option>
                          </select>
                        </div>

                        <div className="rp-control-group">
                          <label className="rp-control-label">Standard</label>
                          <select
                            value={standard}
                            onChange={(e) => setStandard(e.target.value)}
                            className="rp-control-select"
                            disabled={isLockedAfterRun}
                          >
                            <option value="wcag">WCAG</option>
                            <option value="pdfua">PDF/UA</option>
                          </select>
                        </div>
                      </div>

                      <button
                        className="rp-submit-btn"
                        onClick={handleSubmit}
                        disabled={isLockedAfterRun}
                        title={isLockedAfterRun && !submitting ? "Remove the current file to run a new remediation" : undefined}
                      >
                        {submitting ? (
                          <>
                            <span className="rp-btn-spin"></span>
                            Remediating PDF…
                          </>
                        ) : rawResult ? (
                          <>
                            <span className="rp-btn-icon">✓</span>
                            Remediation Complete
                          </>
                        ) : (
                          <>
                            <span className="rp-btn-icon">🚀</span>
                            Start Remediation
                          </>
                        )}
                      </button>

                      {isLockedAfterRun && !submitting && (
                        <p className="rp-rerun-hint">
                          Remove the current file to remediate a new PDF.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}



