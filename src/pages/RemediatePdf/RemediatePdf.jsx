
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orionRemediatePdf, getRemediationStatus, downloadRemediatedPdf, getRemediationReport } from "../../services/apiServices";
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
  const [downloading, setDownloading]   = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [jobReady, setJobReady]          = useState(false); // Track if job is complete
  const [showDetailedResults, setShowDetailedResults] = useState(false); // Toggle to show detailed results
  
  // ── Remediation Report state ──────────────────────────────────
  const [reportData, setReportData]     = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError]   = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadReportError, setDownloadReportError] = useState("");

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
    setDownloadError("");
    setJobReady(false);
    setShowDetailedResults(false);
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
    setDownloadError("");
    setJobReady(false);
    setShowDetailedResults(false);
    setReportData(null);
    setReportError("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
    setDownloadError("");
    setJobReady(false);
    setShowDetailedResults(false);
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
      
      // Check if job is complete based on response
      if (data?.status === "completed" || data?.status === "done" || data?.data?.status === "completed") {
        setJobReady(true);
      }
    } catch (err) {
      setStatusError(err.message || "Could not fetch status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Get Remediation Report ────────────────────────────────────
  const handleGetReport = async () => {
    if (!jobId) {
      setReportError("No job ID available. Please run remediation first.");
      return;
    }
    setReportLoading(true);
    setReportData(null);
    setReportError("");

    try {
      const response = await getRemediationReport(jobId);

      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
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

  // ── Download Remediation Report as JSON ────────────────────────
  const handleDownloadReport = async () => {
    if (!reportData) {
      setDownloadReportError("No report data available to download.");
      return;
    }
    
    try {
      setDownloadingReport(true);
      setDownloadReportError("");
      
      // Create JSON string with proper formatting
      const jsonString = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `remediation-report_${timestamp}.json`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadReportError(err.message || "Could not download the report. Please try again.");
    } finally {
      setDownloadingReport(false);
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
    if (jobReady)          return { cls: "chip-pass",    dot: "dot-green", text: "Ready for Results" };
    if (jobId && !jobReady) return { cls: "chip-ready",   dot: "dot-blue",  text: "Processing…" };
    if (pdfFile)           return { cls: "chip-ready",   dot: "dot-green", text: "PDF Ready" };
    return null;
  };
  const chip = statusLabel();

  // A job has already been run for the current file — re-running requires
  // removing/replacing the file first, so the submit button locks here.
  const isLockedAfterRun = submitting || Boolean(jobId);

  return (
    <div className="rp-page">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="rp-sidebar">
        <div className="rp-logo">
          <div className="rp-logo-mark">O</div>
          <div className="rp-logo-text">
            <span>ORION</span>
            <small>Accessibility & Remediation</small>
          </div>
        </div>

        <nav className="rp-nav">
          <p className="rp-nav-label">WORKSPACE</p>
          <div className="rp-nav-item active">
            <span className="rp-nav-icon">🛠️</span>
            <span>Remediate PDF</span>
            <span className="rp-nav-dot"></span>
          </div>
          <div className="rp-nav-item" onClick={() => navigate("/validate-pdf")}>
            <span className="rp-nav-icon">✅</span>
            <span>Validate PDF</span>
          </div>
          <div className="rp-nav-item" onClick={() => navigate("/template")}>
            <span className="rp-nav-icon">📋</span>
            <span>Template</span>
          </div>
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

          {!pdfFile ? (
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

                {/* ──────────────────────────────────────────────────
                    FLOW: PDF Upload → Check Job Status → Detailed Results (INLINE)
                    ────────────────────────────────────────────────── */}

                {/* ── SECTION 1: File Management & Job Submission ── */}
                <div className="rp-file-management-section">
                  <div className="rp-fm-header">
                    <h3 className="rp-fm-title">Step 1: Upload & Configure</h3>
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
                        ) : jobId ? (
                          <>
                            <span className="rp-btn-icon">✓</span>
                            Remediation Submitted
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

                {/* ── SECTION 2: Check Job Status ── */}
                {jobId && !jobReady && (
                  <div className="rp-job-status-section">
                    <div className="rp-status-header">
                      <div>
                        <h3 className="rp-status-title">Step 2: Monitor Job Status</h3>
                        <p className="rp-status-desc">
                          Check the current remediation status using your job ID
                        </p>
                      </div>
                    </div>

                    <div className="rp-job-id-display">
                      <div className="rp-job-id-row">
                        <span className="rp-job-id-label">Job ID</span>
                        <code className="rp-job-id-val">{jobId}</code>
                      </div>
                    </div>

                    <div className="rp-single-action-row">
                      <button
                        className="rp-status-btn"
                        onClick={handleCheckStatus}
                        disabled={statusLoading}
                      >
                        {statusLoading ? (
                          <><span className="rp-btn-spin"></span> Checking Status…</>
                        ) : (
                          <><span className="rp-btn-icon">🔄</span> Check Job Status</>
                        )}
                      </button>
                    </div>

                    {/* ── Status result ── */}
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
                        {/* Status Success Banner */}
                        {statusData.status === "completed" && (
                          <div className="rp-status-success-banner">
                            <span className="rp-banner-icon">✓</span>
                            <div className="rp-banner-content">
                              <p className="rp-banner-title">Remediation Complete</p>
                              <p className="rp-banner-message">{statusData.message || 'Your PDF has been successfully remediated'}</p>
                            </div>
                          </div>
                        )}

                        {/* Status In Progress Banner */}
                        {statusData.status === "processing" && (
                          <div className="rp-status-processing-banner">
                            <span className="rp-banner-spinner"></span>
                            <div className="rp-banner-content">
                              <p className="rp-banner-title">Remediation in Progress</p>
                              <p className="rp-banner-message">{statusData.message || 'Please wait, your PDF is being remediated'}</p>
                            </div>
                          </div>
                        )}

                        {/* Summary Statistics Cards */}
                        {statusData.data && statusData.data.summary && (
                          <div className="rp-status-summary-section">
                            <h4 className="rp-summary-section-title">Remediation Summary</h4>
                            <div className="rp-summary-stats-grid">
                              <div className="rp-stat-card rp-stat-attempted">
                                <div className="rp-stat-number">{statusData.data.summary.issues_attempted || 0}</div>
                                <div className="rp-stat-label">Issues Attempted</div>
                              </div>
                              <div className="rp-stat-card rp-stat-fixed">
                                <div className="rp-stat-number">{statusData.data.summary.issues_fixed || 0}</div>
                                <div className="rp-stat-label">Issues Fixed</div>
                              </div>
                              <div className="rp-stat-card rp-stat-failed">
                                <div className="rp-stat-number">{statusData.data.summary.issues_failed || 0}</div>
                                <div className="rp-stat-label">Issues Failed</div>
                              </div>
                              <div className="rp-stat-card rp-stat-success">
                                <div className="rp-stat-label">Save Success</div>
                                <div className="rp-stat-badge">{statusData.data.summary.save_success ? '✓ Yes' : '✗ No'}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Font Encoding Details */}
                        {statusData.data && statusData.data.font_encoding && (
                          <div className="rp-status-details-section">
                            <h4 className="rp-details-section-title">Font Encoding</h4>
                            <div className="rp-details-grid">
                              <div className="rp-detail-item">
                                <span className="rp-detail-label">Fonts Patched</span>
                                <span className="rp-detail-value">{statusData.data.font_encoding.fonts_patched || 'N/A'}</span>
                              </div>
                              <div className="rp-detail-item">
                                <span className="rp-detail-label">Save Success</span>
                                <span className="rp-detail-value">{statusData.data.font_encoding.save_success ? 'Yes' : 'No'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Duration and Timestamp */}
                        {statusData.data && (
                          <div className="rp-status-metadata">
                            {statusData.data.total_duration_ms && (
                              <div className="rp-metadata-item">
                                <span className="rp-metadata-label">Duration</span>
                                <span className="rp-metadata-value">{statusData.data.total_duration_ms}ms</span>
                              </div>
                            )}
                            {statusData.data.created_at && (
                              <div className="rp-metadata-item">
                                <span className="rp-metadata-label">Created</span>
                                <span className="rp-metadata-value">{new Date(statusData.data.created_at).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {statusData.status === "completed" && (
                          <div className="rp-status-actions-row">
                            <button
                              className="rp-action-btn rp-action-primary"
                              onClick={() => setShowDetailedResults(true)}
                            >
                              <span className="rp-btn-icon">📊</span> Show Result Summary
                            </button>
                            <button
                              className="rp-action-btn rp-action-primary"
                              onClick={handleGetReport}
                              disabled={reportLoading}
                            >
                              {reportLoading ? (
                                <><span className="rp-btn-spin"></span> Generating Report…</>
                              ) : (
                                <><span className="rp-btn-icon">📋</span> View Remediation Report</>
                              )}
                            </button>
                            <button
                              className="rp-action-btn rp-action-secondary"
                              onClick={handleDownloadRemediatedPdf}
                              disabled={downloading}
                            >
                              {downloading ? (
                                <><span className="rp-btn-spin"></span> Preparing Download…</>
                              ) : (
                                <><span className="rp-btn-icon">⬇️</span> Download PDF</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── SECTION 3: View Detailed Results Button (after job is ready) ── */}
                {jobReady && !showDetailedResults && (
                  <div className="rp-results-section">
                    <div className="rp-results-header">
                      <h3 className="rp-results-title">Step 3: Detailed Results</h3>
                      <p className="rp-results-desc">
                        Your PDF remediation is complete. View summary and download the remediated file.
                      </p>
                    </div>

                    {/* Professional Status Summary Display */}
                    {statusData && (
                      <div className="rp-status-result">
                        {/* Status Success Banner */}
                        {statusData.status === "completed" && (
                          <div className="rp-status-success-banner">
                            <span className="rp-banner-icon">✓</span>
                            <div className="rp-banner-content">
                              <p className="rp-banner-title">Remediation Complete</p>
                              <p className="rp-banner-message">{statusData.message || 'Your PDF has been successfully remediated'}</p>
                            </div>
                          </div>
                        )}

                        {/* Summary Statistics Cards */}
                        {statusData.data && statusData.data.summary && (
                          <div className="rp-status-summary-section">
                            <h4 className="rp-summary-section-title">Remediation Summary</h4>
                            <div className="rp-summary-stats-grid">
                              <div className="rp-stat-card rp-stat-attempted">
                                <div className="rp-stat-number">{statusData.data.summary.issues_attempted || 0}</div>
                                <div className="rp-stat-label">Issues Attempted</div>
                              </div>
                              <div className="rp-stat-card rp-stat-fixed">
                                <div className="rp-stat-number">{statusData.data.summary.issues_fixed || 0}</div>
                                <div className="rp-stat-label">Issues Fixed</div>
                              </div>
                              <div className="rp-stat-card rp-stat-failed">
                                <div className="rp-stat-number">{statusData.data.summary.issues_failed || 0}</div>
                                <div className="rp-stat-label">Issues Failed</div>
                              </div>
                              <div className="rp-stat-card rp-stat-success">
                                <div className="rp-stat-label">Save Success</div>
                                <div className="rp-stat-badge">{statusData.data.summary.save_success ? '✓ Yes' : '✗ No'}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Font Encoding Details */}
                        {statusData.data && statusData.data.font_encoding && (
                          <div className="rp-status-details-section">
                            <h4 className="rp-details-section-title">Font Encoding</h4>
                            <div className="rp-details-grid">
                              <div className="rp-detail-item">
                                <span className="rp-detail-label">Fonts Patched</span>
                                <span className="rp-detail-value">{statusData.data.font_encoding.fonts_patched || 'N/A'}</span>
                              </div>
                              <div className="rp-detail-item">
                                <span className="rp-detail-label">Save Success</span>
                                <span className="rp-detail-value">{statusData.data.font_encoding.save_success ? 'Yes' : 'No'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Duration and Timestamp */}
                        {statusData.data && (
                          <div className="rp-status-metadata">
                            {statusData.data.total_duration_ms && (
                              <div className="rp-metadata-item">
                                <span className="rp-metadata-label">Duration</span>
                                <span className="rp-metadata-value">{statusData.data.total_duration_ms}ms</span>
                              </div>
                            )}
                            {statusData.data.created_at && (
                              <div className="rp-metadata-item">
                                <span className="rp-metadata-label">Created</span>
                                <span className="rp-metadata-value">{new Date(statusData.data.created_at).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rp-results-action-row">
                      <button
                        className="rp-action-btn rp-action-primary"
                        onClick={() => setShowDetailedResults(true)}
                      >
                        <span className="rp-btn-icon">📊</span> Results Summary
                      </button>
                      <button
                        className="rp-action-btn rp-action-primary"
                        onClick={handleGetReport}
                        disabled={reportLoading}
                      >
                        {reportLoading ? (
                          <><span className="rp-btn-spin"></span> Generating Report…</>
                        ) : (
                          <><span className="rp-btn-icon">📄</span> Remediation Report</>
                        )}
                      </button>
                      {jobId && (
                        <button
                          className="rp-action-btn rp-action-secondary"
                          onClick={handleDownloadRemediatedPdf}
                          disabled={downloading}
                        >
                          {downloading ? (
                            <><span className="rp-btn-spin"></span> Preparing Download…</>
                          ) : (
                            <><span className="rp-btn-icon">⬇️</span> Download PDF</>
                          )}
                        </button>
                      )}
                    </div>

                    {reportError && (
                      <div className="rp-error-banner" style={{ marginTop: 16 }}>
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">Report Generation Failed</p>
                          <p className="rp-error-msg">{reportError}</p>
                        </div>
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
                )}

                {/* ── SECTION 4: Detailed Results Display (INLINE) ── */}
                {showDetailedResults && rawResult && (
                  <div className="rp-detailed-results-section">
                    <div className="rp-results-header">
                      <div>
                        <h3 className="rp-results-title">Remediation Results Summary</h3>
                        <p className="rp-results-desc">
                          Complete overview of the PDF remediation process
                        </p>
                      </div>
                      <button
                        className="rp-close-results-btn"
                        onClick={() => setShowDetailedResults(false)}
                        title="Hide results"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Primary Stats Grid */}
                    {rawResult.data && (
                      <div className="rp-detailed-stats-section">
                        <div className="rp-detailed-stats-grid">
                          <div className="rp-detailed-stat-card rp-stat-detected">
                            <div className="rp-stat-label">Issues Detected</div>
                            <div className="rp-stat-value">{rawResult.data.issues_detected || 0}</div>
                          </div>
                          <div className="rp-detailed-stat-card rp-stat-fixed">
                            <div className="rp-stat-label">Issues Fixed</div>
                            <div className="rp-stat-value">{rawResult.data.issues_fixed || 0}</div>
                          </div>
                          <div className="rp-detailed-stat-card rp-stat-remaining">
                            <div className="rp-stat-label">Issues Remaining</div>
                            <div className="rp-stat-value">{rawResult.data.issues_remaining || 0}</div>
                          </div>
                          <div className="rp-detailed-stat-card rp-stat-autofixable">
                            <div className="rp-stat-label">Auto-Fixable</div>
                            <div className="rp-stat-value">{rawResult.data.auto_fixable_count || 0}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Details Block */}
                    {rawResult.data && rawResult.data.summary && (
                      <div className="rp-summary-details-block">
                        <h4 className="rp-block-title">Summary Details</h4>
                        <div className="rp-summary-details-grid">
                          <div className="rp-detail-row">
                            <span className="rp-detail-key">Issues Attempted</span>
                            <span className="rp-detail-val">{rawResult.data.summary.issues_attempted || 0}</span>
                          </div>
                          <div className="rp-detail-row">
                            <span className="rp-detail-key">Issues Fixed</span>
                            <span className="rp-detail-val">{rawResult.data.summary.issues_fixed || 0}</span>
                          </div>
                          <div className="rp-detail-row">
                            <span className="rp-detail-key">Issues Failed</span>
                            <span className="rp-detail-val">{rawResult.data.summary.issues_failed || 0}</span>
                          </div>
                          <div className="rp-detail-row">
                            <span className="rp-detail-key">Save Success</span>
                            <span className="rp-detail-val">{rawResult.data.summary.save_success ? '✓ True' : '✗ False'}</span>
                          </div>
                          <div className="rp-detail-row">
                            <span className="rp-detail-key">Total Duration</span>
                            <span className="rp-detail-val">{rawResult.data.summary.total_duration_ms || 0}ms</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Font Encoding Details */}
                    {rawResult.data && rawResult.data.summary && rawResult.data.summary.font_encoding && (
                      <div className="rp-font-encoding-block">
                        <h4 className="rp-block-title">Font Encoding</h4>
                        <div className="rp-font-encoding-grid">
                          <div className="rp-font-item">
                            <span className="rp-font-key">Fonts Patched</span>
                            <span className="rp-font-val">{rawResult.data.summary.font_encoding.fonts_patched || 'N/A'}</span>
                          </div>
                          <div className="rp-font-item">
                            <span className="rp-font-key">Save Success</span>
                            <span className="rp-font-val">{rawResult.data.summary.font_encoding.save_success ? '✓ True' : '✗ False'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="rp-results-action-row">
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
                      <button
                        className="rp-action-btn rp-action-secondary"
                        onClick={() => setShowDetailedResults(false)}
                      >
                        <span className="rp-btn-icon">✕</span> Close
                      </button>
                    </div>

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
                )}

                {/* ── SECTION 5: Remediation Report Display (INLINE) ── */}
                {reportData && (
                  <div className="rp-report-display-section">
                    <div className="rp-results-header">
                      <div>
                        <h3 className="rp-results-title">Remediation Report</h3>
                        <p className="rp-results-desc">
                          Detailed validation and remediation analysis
                        </p>
                      </div>
                      <button
                        className="rp-close-results-btn"
                        onClick={() => setReportData(null)}
                        title="Close report"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Summary Section */}
                    {reportData.data && reportData.data.summary && (
                      <div className="rp-report-summary-block">
                        <div className="rp-report-section-header">
                          <h3 className="rp-report-section-title">Summary</h3>
                        </div>
                        <div className="rp-report-summary-grid">
                          <div className="rp-summary-item">
                            <span className="rp-summary-label">Issues Attempted</span>
                            <span className="rp-summary-value">{reportData.data.summary.issues_attempted || 0}</span>
                          </div>
                          <div className="rp-summary-item">
                            <span className="rp-summary-label">Issues Fixed</span>
                            <span className="rp-summary-value" style={{color: '#22c55e'}}>{reportData.data.summary.issues_fixed || 0}</span>
                          </div>
                          <div className="rp-summary-item">
                            <span className="rp-summary-label">Issues Failed</span>
                            <span className="rp-summary-value" style={{color: '#ef4444'}}>{reportData.data.summary.issues_failed || 0}</span>
                          </div>
                          <div className="rp-summary-item">
                            <span className="rp-summary-label">Save Success</span>
                            <span className="rp-summary-value">{reportData.data.summary.save_success ? '✓ True' : '✗ False'}</span>
                          </div>
                          {reportData.data.summary.total_duration_ms && (
                            <div className="rp-summary-item">
                              <span className="rp-summary-label">Total Duration</span>
                              <span className="rp-summary-value">{reportData.data.summary.total_duration_ms}ms</span>
                            </div>
                          )}
                          {reportData.data.summary.font_encoding && (
                            <div className="rp-summary-item">
                              <span className="rp-summary-label">Fonts Patched</span>
                              <span className="rp-summary-value">{reportData.data.summary.font_encoding.fonts_patched || 'N/A'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Validation Result Section */}
                    {reportData.data && reportData.data.validation_result && (
                      <div className="rp-report-section-block">
                        <div className="rp-report-section-header">
                          <h3 className="rp-report-section-title">Validation Result</h3>
                        </div>
                        <div className="rp-validation-grid">
                          {reportData.data.validation_result.document_name && (
                            <div className="rp-validation-item">
                              <span className="rp-validation-label">Document Name</span>
                              <span className="rp-validation-value">{reportData.data.validation_result.document_name}</span>
                            </div>
                          )}
                          {reportData.data.validation_result.total_pages !== undefined && (
                            <div className="rp-validation-item">
                              <span className="rp-validation-label">Total Pages</span>
                              <span className="rp-validation-value">{reportData.data.validation_result.total_pages}</span>
                            </div>
                          )}
                          {reportData.data.validation_result.execution_time_ms !== undefined && (
                            <div className="rp-validation-item">
                              <span className="rp-validation-label">Execution Time</span>
                              <span className="rp-validation-value">{reportData.data.validation_result.execution_time_ms}ms</span>
                            </div>
                          )}
                          {reportData.data.validation_result.total_issues !== undefined && (
                            <div className="rp-validation-item">
                              <span className="rp-validation-label">Total Issues</span>
                              <span className="rp-validation-value">{reportData.data.validation_result.total_issues}</span>
                            </div>
                          )}
                        </div>

                        {/* Issue Severity Breakdown */}
                        <div className="rp-severity-breakdown">
                          <h4 className="rp-breakdown-title">Issue Severity Breakdown</h4>
                          <div className="rp-severity-grid">
                            {reportData.data.validation_result.critical_count !== undefined && (
                              <div className="rp-severity-card rp-severity-critical">
                                <span className="rp-severity-count">{reportData.data.validation_result.critical_count}</span>
                                <span className="rp-severity-label">Critical</span>
                              </div>
                            )}
                            {reportData.data.validation_result.high_count !== undefined && (
                              <div className="rp-severity-card rp-severity-high">
                                <span className="rp-severity-count">{reportData.data.validation_result.high_count}</span>
                                <span className="rp-severity-label">High</span>
                              </div>
                            )}
                            {reportData.data.validation_result.medium_count !== undefined && (
                              <div className="rp-severity-card rp-severity-medium">
                                <span className="rp-severity-count">{reportData.data.validation_result.medium_count}</span>
                                <span className="rp-severity-label">Medium</span>
                              </div>
                            )}
                            {reportData.data.validation_result.low_count !== undefined && (
                              <div className="rp-severity-card rp-severity-low">
                                <span className="rp-severity-count">{reportData.data.validation_result.low_count}</span>
                                <span className="rp-severity-label">Low</span>
                              </div>
                            )}
                            {reportData.data.validation_result.auto_fixable_count !== undefined && (
                              <div className="rp-severity-card rp-severity-autofixable">
                                <span className="rp-severity-count">{reportData.data.validation_result.auto_fixable_count}</span>
                                <span className="rp-severity-label">Auto-Fixable</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Validation Report Section - show detailed issues */}
                    {reportData.data && reportData.data.validation_result && reportData.data.validation_result.agent_results && (
                      <div className="rp-report-section-block">
                        <div className="rp-report-section-header">
                          <h3 className="rp-report-section-title">Agent Results</h3>
                        </div>
                        <div className="rp-agent-results-container">
                          {reportData.data.validation_result.agent_results.map((agent, idx) => (
                            <div key={idx} className={`rp-agent-card ${agent.success ? 'rp-agent-success' : 'rp-agent-failed'}`}>
                              <div className="rp-agent-header">
                                <div className="rp-agent-status-badge">
                                  {agent.success ? (
                                    <span className="rp-badge-icon rp-badge-pass">✓</span>
                                  ) : (
                                    <span className="rp-badge-icon rp-badge-fail">✗</span>
                                  )}
                                </div>
                                <div className="rp-agent-info">
                                  <h4 className="rp-agent-name">{agent.agent_name}</h4>
                                  <p className="rp-agent-meta">{agent.issue_count} issue{agent.issue_count !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              {agent.issues && agent.issues.length > 0 && (
                                <div className="rp-agent-issues">
                                  {agent.issues.map((issue, issueIdx) => (
                                    <div key={issueIdx} className={`rp-issue-card rp-issue-${issue.severity?.toLowerCase()}`}>
                                      <div className="rp-issue-header">
                                        <div className="rp-issue-severity-dot" style={{
                                          backgroundColor: issue.severity === 'CRITICAL' ? '#dc2626' : 
                                                          issue.severity === 'HIGH' ? '#f97316' :
                                                          issue.severity === 'MEDIUM' ? '#eab308' :
                                                          issue.severity === 'LOW' ? '#22c55e' : '#6b7280'
                                        }}></div>
                                        <div className="rp-issue-title-section">
                                          <p className="rp-issue-rule-id">{issue.rule_id}</p>
                                          <p className="rp-issue-message">{issue.message}</p>
                                        </div>
                                        <div className="rp-issue-badges">
                                          <span className={`rp-issue-status rp-status-${issue.status?.toLowerCase()}`}>
                                            {issue.status}
                                          </span>
                                          {issue.auto_fixable && (
                                            <span className="rp-issue-autofixable">🔧 Auto-fixable</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="rp-issue-details">
                                        <div className="rp-detail-group">
                                          <span className="rp-detail-label">Category</span>
                                          <span className="rp-detail-text">{issue.category}</span>
                                        </div>
                                        {issue.recommendation && (
                                          <div className="rp-detail-group">
                                            <span className="rp-detail-label">Recommendation</span>
                                            <span className="rp-detail-text">{issue.recommendation}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remediation Results Section */}
                    {reportData.data && reportData.data.remediation_results && reportData.data.remediation_results.length > 0 && (
                      <div className="rp-report-section-block">
                        <div className="rp-report-section-header">
                          <h3 className="rp-report-section-title">Remediation Results</h3>
                        </div>
                        <div className="rp-remediation-results">
                          {reportData.data.remediation_results.map((result, idx) => (
                            <div key={idx} className={`rp-remediation-item ${result.success ? 'rp-remediation-success' : 'rp-remediation-failed'}`}>
                              <div className="rp-remediation-header">
                                <span className="rp-remediation-icon">{result.success ? '✓' : '✗'}</span>
                                <div className="rp-remediation-title">
                                  <p className="rp-remediation-rule">{result.rule_id}</p>
                                  <p className="rp-remediation-action">{result.action}</p>
                                </div>
                              </div>
                              {result.changes_made && result.changes_made.length > 0 && (
                                <div className="rp-remediation-changes">
                                  <p className="rp-changes-label">Changes Made:</p>
                                  <ul className="rp-changes-list">
                                    {result.changes_made.map((change, changeIdx) => (
                                      <li key={changeIdx}>{change}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {result.error && (
                                <div className="rp-remediation-error">
                                  <p className="rp-error-label">Error:</p>
                                  <p className="rp-error-text">{result.error}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Close Button ── */}
                    <div className="rp-results-action-row">
                      <button
                        className="rp-action-btn rp-action-primary"
                        onClick={handleDownloadReport}
                        disabled={downloadingReport}
                      >
                        {downloadingReport ? (
                          <><span className="rp-btn-spin"></span> Downloading Report…</>
                        ) : (
                          <><span className="rp-btn-icon">⬇️</span> Download Report</>
                        )}
                      </button>
                      <button
                        className="rp-action-btn rp-action-secondary"
                        onClick={() => setReportData(null)}
                      >
                        <span className="rp-btn-icon">✕</span> Close Report
                      </button>
                    </div>

                    {downloadReportError && (
                      <div className="rp-error-banner" style={{ marginTop: 16 }}>
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">Report Download Failed</p>
                          <p className="rp-error-msg">{downloadReportError}</p>
                        </div>
                      </div>
                    )}

                    {reportError && (
                      <div className="rp-error-banner" style={{ marginTop: 16 }}>
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">Report Generation Failed</p>
                          <p className="rp-error-msg">{reportError}</p>
                        </div>
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

