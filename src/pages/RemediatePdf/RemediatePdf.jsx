
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orionRemediatePdf, getRemediationStatus, downloadRemediatedPdf, getRemediationReport, validatePdf } from "../../services/apiServices";
import "./RemediatePdf.css";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

export default function RemediatePdf() {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile]           = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const [mode, setMode]                 = useState("auto");   // "auto" | "manual"
  const [standard, setStandard]         = useState("wcag");   // "wcag" | "pdfua"
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState("");
  const [rawResult, setRawResult]       = useState(null);
  const [submitMessage, setSubmitMessage] = useState(""); // Message from API response

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

  // ── VeraPDF Validation state ────────────────────────────────────
  const [veraValidating, setVeraValidating] = useState(false);
  const [veraResult, setVeraResult] = useState(null);
  const [veraError, setVeraError] = useState("");
  const [downloadingVeraReport, setDownloadingVeraReport] = useState(false);
  const [downloadVeraReportError, setDownloadVeraReportError] = useState("");

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
    setSubmitMessage("");
    setJobId(null);
    setStatusData(null);
    setStatusError("");
    setDownloadError("");
    setJobReady(false);
    setShowDetailedResults(false);
    setReportData(null);
    setReportError("");
    setVeraResult(null);
    setVeraError("");
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
    setSubmitMessage("");
    setJobId(null);
    setStatusData(null);
    setStatusError("");
    setDownloadError("");
    setJobReady(false);
    setShowDetailedResults(false);
    setReportData(null);
    setReportError("");
    setVeraResult(null);
    setVeraError("");
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
    setSubmitMessage("");
    setJobId(null);
    setStatusData(null);
    setStatusError("");
    setDownloadError("");
    setJobReady(false);
    setShowDetailedResults(false);
    setReportData(null);
    setReportError("");
    setVeraResult(null);
    setVeraError("");

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
      
      // Extract and display message from API response
      if (data?.message) {
        setSubmitMessage(data.message);
      }

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

  // ── Validate PDF through VeraPDF ────────────────────────────────
  const handleValidateWithVeraPdf = async () => {
    if (!pdfFile) {
      setVeraError("No PDF file available. Please upload a PDF first.");
      return;
    }
    setVeraValidating(true);
    setVeraResult(null);
    setVeraError("");

    try {
      const response = await validatePdf(pdfFile);

      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setVeraResult(data);

    } catch (err) {
      setVeraError(err.message || "Could not validate the PDF via VeraPDF. Please try again.");
    } finally {
      setVeraValidating(false);
    }
  };

  // ── Download VeraPDF Validation Report as JSON ──────────────────
  const handleDownloadVeraReport = async () => {
    if (!veraResult) {
      setDownloadVeraReportError("No validation report available to download.");
      return;
    }

    try {
      setDownloadingVeraReport(true);
      setDownloadVeraReportError("");

      const jsonString = JSON.stringify(veraResult, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `verapdf-validation_${timestamp}.json`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadVeraReportError(err.message || "Could not download the report. Please try again.");
    } finally {
      setDownloadingVeraReport(false);
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
  const veraJob = veraResult?.data?.report?.jobs?.[0]?.validationResult?.[0] ?? null;

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
          <div className="rp-user-section">
            <p className="rp-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button 
              className="rp-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="rp-main">
        <div className="rp-container">

          {!pdfFile ? (
            <section className="rp-upload-section">
              <div className="rp-upload-wrapper">
                <div className="rp-upload-icon">📥</div>
                <h1 className="rp-upload-title">Upload PDF For Remediation</h1>
                
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
                          className="rp-file-restart-btn"
                          onClick={handleRemove}
                          title="Restart remediation"
                        >
                          <span className="rp-restart-icon">↻</span>
                          <span className="rp-restart-text">Restart</span>
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

                    <div className="rp-processing-indicator">
                      <div className="rp-processing-spinner"></div>
                      <div className="rp-processing-text">
                        <p className="rp-processing-title">Backend Processing</p>
                        <p className="rp-processing-msg">Your PDF is being remediated. This may take a moment...</p>
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

                        {/* Summary Statistics Cards */}
                        {statusData.data && statusData.data.summary && (
                          <div className="rp-status-summary-section">
                            <h4 className="rp-summary-section-title">Remediation Summary</h4>
                            <div className="rp-report-summary-cards">
                              <div className="rp-rem-summary-card rp-card-attempted">
                                <p className="rp-rem-card-value">{statusData.data.summary.issues_attempted || 0}</p>
                                <p className="rp-rem-card-label">Issues Attempted</p>
                              </div>
                              <div className="rp-rem-summary-card rp-card-fixed">
                                <p className="rp-rem-card-value">{statusData.data.summary.issues_fixed || 0}</p>
                                <p className="rp-rem-card-label">Issues Fixed</p>
                              </div>
                              <div className="rp-rem-summary-card rp-card-failed">
                                <p className="rp-rem-card-value">{statusData.data.summary.issues_failed || 0}</p>
                                <p className="rp-rem-card-label">Issues Failed</p>
                              </div>
                              <div className="rp-rem-summary-card rp-card-save-success">
                                <p className="rp-rem-card-label">Save Success</p>
                                <p className="rp-rem-card-value">{statusData.data.summary.save_success ? '✓ Yes' : '✗ No'}</p>
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

                          </div>
                        )}

                        {/* Action Buttons */}
                        {statusData.status === "completed" && (
                          <div className="rp-status-actions-row">
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
                            <div className="rp-report-summary-cards">
                              <div className="rp-rem-summary-card rp-card-attempted">
                                <p className="rp-rem-card-value">{statusData.data.summary.issues_attempted || 0}</p>
                                <p className="rp-rem-card-label">Issues Attempted</p>
                              </div>
                              <div className="rp-rem-summary-card rp-card-fixed">
                                <p className="rp-rem-card-value">{statusData.data.summary.issues_fixed || 0}</p>
                                <p className="rp-rem-card-label">Issues Fixed</p>
                              </div>
                              <div className="rp-rem-summary-card rp-card-failed">
                                <p className="rp-rem-card-value">{statusData.data.summary.issues_failed || 0}</p>
                                <p className="rp-rem-card-label">Issues Failed</p>
                              </div>
                              <div className="rp-rem-summary-card rp-card-save-success">
                                <p className="rp-rem-card-label">Save Success</p>
                                <p className="rp-rem-card-value">{statusData.data.summary.save_success ? '✓ Yes' : '✗ No'}</p>
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

                          </div>
                        )}
                      </div>
                    )}

                    <div className="rp-results-action-row">
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
                      <button
                        className="rp-action-btn rp-action-vera"
                        onClick={handleValidateWithVeraPdf}
                        disabled={veraValidating}
                      >
                        {veraValidating ? (
                          <><span className="rp-btn-spin"></span> Validating…</>
                        ) : (
                          <><span className="rp-btn-icon">🔍</span> Validate PDF through VeraPDF</>
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

                    {veraError && (
                      <div className="rp-error-banner" style={{ marginTop: 16 }}>
                        <span className="rp-error-ico">⚠</span>
                        <div>
                          <p className="rp-error-ttl">VeraPDF Validation Failed</p>
                          <p className="rp-error-msg">{veraError}</p>
                        </div>
                      </div>
                    )}

                    {/* ── VeraPDF Validation Report ── */}
                    {veraResult && (
                      <div className="rp-vera-report-section">
                        <div className="rp-vera-report-header">
                          <h3 className="rp-vera-report-title">
                            <span className="rp-vera-report-icon">🔍</span> VeraPDF Validation Report
                          </h3>
                          <button
                            className="rp-close-results-btn"
                            onClick={() => setVeraResult(null)}
                            title="Close report"
                          >
                            ✕
                          </button>
                        </div>

                        {veraJob && (
                          <div className={`rp-vera-compliance-banner ${veraJob.compliant ? "rp-vera-compliant" : "rp-vera-noncompliant"}`}>
                            <span className="rp-banner-icon">{veraJob.compliant ? "✓" : "✗"}</span>
                            <div className="rp-banner-content">
                              <p className="rp-banner-title">
                                {veraJob.compliant ? "PDF/A Compliant" : "Not PDF/A Compliant"}
                              </p>
                              <p className="rp-banner-message">
                                PDF/A-1b (ISO 19005-1:2005)
                              </p>
                            </div>
                          </div>
                        )}

                        {veraJob && veraJob.details && (
                          <div className="rp-vera-summary-cards">
                            <div className="rp-vera-card rp-vera-card-passed-rules">
                              <span className="rp-vera-card-value">{veraJob.details.passedRules ?? 0}</span>
                              <span className="rp-vera-card-label">Passed Rules</span>
                            </div>
                            <div className="rp-vera-card rp-vera-card-failed-rules">
                              <span className="rp-vera-card-value">{veraJob.details.failedRules ?? 0}</span>
                              <span className="rp-vera-card-label">Failed Rules</span>
                            </div>
                            <div className="rp-vera-card rp-vera-card-passed-checks">
                              <span className="rp-vera-card-value">{veraJob.details.passedChecks ?? 0}</span>
                              <span className="rp-vera-card-label">Passed Checks</span>
                            </div>
                            <div className="rp-vera-card rp-vera-card-failed-checks">
                              <span className="rp-vera-card-value">{veraJob.details.failedChecks ?? 0}</span>
                              <span className="rp-vera-card-label">Failed Checks</span>
                            </div>
                          </div>
                        )}

                        {veraJob && veraJob.details?.ruleSummaries?.length > 0 && (
                          <div className="rp-vera-rules-list">
                            <h4 className="rp-vera-rules-title">
                              Failed Rule Details ({veraJob.details.ruleSummaries.length})
                            </h4>
                            {veraJob.details.ruleSummaries.map((rule, idx) => (
                              <div key={idx} className="rp-vera-rule-card">
                                <div className="rp-vera-rule-header">
                                  <span className="rp-vera-rule-clause">
                                    Clause {rule.clause} · Test {rule.testNumber}
                                  </span>
                                  <span className="rp-vera-rule-count">
                                    {rule.failedChecks} failed check{rule.failedChecks !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <p className="rp-vera-rule-desc">{rule.description}</p>
                                <p className="rp-vera-rule-spec">{rule.specification} · {rule.object}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="rp-results-action-row">
                          <button
                            className="rp-action-btn rp-action-secondary"
                            onClick={handleDownloadVeraReport}
                            disabled={downloadingVeraReport}
                          >
                            {downloadingVeraReport ? (
                              <><span className="rp-btn-spin"></span> Downloading…</>
                            ) : (
                              <><span className="rp-btn-icon">⬇️</span> Download Full Report (JSON)</>
                            )}
                          </button>
                        </div>

                        {downloadVeraReportError && (
                          <div className="rp-error-banner" style={{ marginTop: 16 }}>
                            <span className="rp-error-ico">⚠</span>
                            <div>
                              <p className="rp-error-ttl">Report Download Failed</p>
                              <p className="rp-error-msg">{downloadVeraReportError}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── SECTION 4: Remediation Report Display ── */}
                {reportData && (
                  <div className="rp-report-display-section">
                    <div className="rp-report-header">
                      <div>
                        <h3 className="rp-report-title">Remediation Report</h3>
                        <p className="rp-report-desc">
                          PDF/UA + WCAG accessibility
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
                      <div className="rp-report-section-block">
                        <div className="rp-report-section-header">
                          <h3 className="rp-report-section-title">Remediation Summary</h3>
                        </div>
                        <div className="rp-report-summary-cards">
                          <div className="rp-report-card rp-card-detected-report">
                            <p className="rp-report-card-value">{reportData.data.summary.issues_detected}</p>
                            <p className="rp-report-card-label">Issues Detected</p>
                          </div>
                          <div className="rp-report-card rp-card-attempted-report">
                            <p className="rp-report-card-value">{reportData.data.summary.issues_attempted}</p>
                            <p className="rp-report-card-label">Issues Attempted</p>
                          </div>
                          <div className="rp-report-card rp-card-fixed-report">
                            <p className="rp-report-card-value">{reportData.data.summary.issues_fixed}</p>
                            <p className="rp-report-card-label">Issues Fixed</p>
                          </div>
                          <div className="rp-report-card rp-card-failed-report">
                            <p className="rp-report-card-value">{reportData.data.summary.issues_failed}</p>
                            <p className="rp-report-card-label">Issues Failed</p>
                          </div>
                          <div className="rp-report-card rp-card-remaining-report">
                            <p className="rp-report-card-value">{reportData.data.summary.issues_remaining}</p>
                            <p className="rp-report-card-label">Issues Remaining</p>
                          </div>
                          <div className="rp-report-card rp-card-duration-report">
                            <p className="rp-report-card-value">{reportData.data.summary.total_duration_ms}ms</p>
                            <p className="rp-report-card-label">Duration</p>
                          </div>
                          <div className="rp-report-card rp-card-save-report">
                            <p className="rp-report-card-value">{reportData.data.summary.save_success ? 'Yes' : 'No'}</p>
                            <p className="rp-report-card-label">Save Success</p>
                          </div>
                          {reportData.data.summary.font_encoding && (
                            <div className="rp-report-card rp-card-fonts-report">
                              <p className="rp-report-card-value">{reportData.data.summary.font_encoding.fonts_patched}</p>
                              <p className="rp-report-card-label">Fonts Patched</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Validation Result Overview */}
                    {reportData.data && reportData.data.validation_result && (
                      <div className="rp-report-section-block">
                        <div className="rp-report-section-header">
                          <h3 className="rp-report-section-title">Validation Overview</h3>
                        </div>
                        <div className="rp-validation-cards-grid">
                          <div className="rp-validation-card rp-card-document">
                            <p className="rp-card-label">Document Name</p>
                            <p className="rp-card-value">{reportData.data.validation_result.document_name}</p>
                          </div>
                          <div className="rp-validation-card rp-card-pages">
                            <p className="rp-card-label">Total Pages</p>
                            <p className="rp-card-value">{reportData.data.validation_result.total_pages}</p>
                          </div>
                          <div className="rp-validation-card rp-card-issues">
                            <p className="rp-card-label">Total Issues</p>
                            <p className="rp-card-value">{reportData.data.validation_result.total_issues}</p>
                          </div>
                          <div className={`rp-validation-card rp-card-status-${reportData.data.validation_result.overall_status?.toLowerCase()}`}>
                            <p className="rp-card-label">Overall Status</p>
                            <p className="rp-card-value">{reportData.data.validation_result.overall_status}</p>
                          </div>
                          <div className="rp-validation-card rp-card-execution">
                            <p className="rp-card-label">Execution Time</p>
                            <p className="rp-card-value">{reportData.data.validation_result.execution_time_ms}ms</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Severity Breakdown */}
                    {reportData.data && reportData.data.validation_result && (
                      <div className="rp-report-section-block">
                        <div className="rp-report-section-header">
                          <h3 className="rp-report-section-title">Issue Severity Breakdown</h3>
                        </div>
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

                    {/* ── Action Buttons ── */}
                    <div className="rp-results-action-row">
                      <button
                        className="rp-action-btn rp-action-primary"
                        onClick={handleDownloadReport}
                        disabled={downloadingReport}
                      >
                        {downloadingReport ? (
                          <><span className="rp-btn-spin"></span> Downloading…</>
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