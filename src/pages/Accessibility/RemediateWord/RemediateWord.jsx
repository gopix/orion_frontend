


import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  orionRemediateWord,
  getWordRemediationStatus,
  downloadRemediatedWord,
} from "../../../services/apiServices";
import "./RemediateWord.css";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
const POLL_INTERVAL_MS = 4000;
const DONE_STATUSES = ["completed", "done", "success", "succeeded"];
const FAILED_STATUSES = ["failed", "error", "errored"];

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

export default function RemediateWord() {
  const navigate = useNavigate();

  const [wordFile, setWordFile]         = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Job / status polling state ──────────────────────────────
  const [jobId, setJobId]             = useState(null);
  const [status, setStatus]           = useState(null);     // "pending" | "processing" | "completed" | "failed"
  const [jobMessage, setJobMessage]   = useState("");
  const [statusError, setStatusError] = useState("");
  const [polling, setPolling]         = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [resultData, setResultData]   = useState(null);

  // ── Download state ───────────────────────────────────────────
  const [downloading, setDownloading]     = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [downloaded, setDownloaded]       = useState(false);

  // ── Report state ─────────────────────────────────────────────
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData]       = useState(null);
  const [reportError, setReportError]     = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);

  // ── Dashboard (KPI) state ──────────────────────────────────────
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardData, setDashboardData]       = useState(null);
  const [dashboardError, setDashboardError]     = useState("");

  const wordInputRef = useRef(null);
  const pollRef = useRef(null);

  const isDone   = DONE_STATUSES.includes((status || "").toLowerCase());
  const isFailed = FAILED_STATUSES.includes((status || "").toLowerCase());

  const isWordFile = (name) => /\.(docx|doc)$/i.test(name || "");

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const resetJobState = () => {
    setJobId(null);
    setStatus(null);
    setJobMessage("");
    setStatusError("");
    setPolling(false);
    setLastChecked(null);
    setSubmittedAt(null);
    setResultData(null);
    setDownloading(false);
    setDownloadError("");
    setDownloaded(false);
    setReportLoading(false);
    setReportData(null);
    setReportError("");
    setDownloadingReport(false);
    setDashboardLoading(false);
    setDashboardData(null);
    setDashboardError("");
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const applyFile = (file) => {
    if (!isWordFile(file.name)) {
      setSubmitError("Please upload a Word file (.doc or .docx)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSubmitError("File exceeds the 200 MB limit. Please upload a smaller Word document.");
      return;
    }
    setWordFile(file);
    setSubmitError("");
    resetJobState();
  };

  const handleWordSelect = (e) => {
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
    setWordFile(null);
    setSubmitError("");
    resetJobState();
  };

  // ── Poll status until completed / failed ─────────────────────
  const checkStatusOnce = useCallback(async (id) => {
    try {
      const response = await getWordRemediationStatus(id);
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      const data = await response.json();
      const d = data?.data ?? data;
      const newStatus = d?.status ?? null;

      setStatus(newStatus);
      setJobMessage(data?.message || "");
      setLastChecked(new Date());
      setStatusError("");

      const lower = (newStatus || "").toLowerCase();
      if (DONE_STATUSES.includes(lower)) {
        setResultData(d);
      }
      if (FAILED_STATUSES.includes(lower)) {
        setStatusError(d?.error || data?.message || "Remediation failed.");
      }
      if (DONE_STATUSES.includes(lower) || FAILED_STATUSES.includes(lower)) {
        setPolling(false);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    } catch (err) {
      setStatusError(err.message || "Could not fetch remediation status.");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Submit — Remediate Word ────────────────────────────────────
  const handleSubmit = async () => {
    if (!wordFile) { setSubmitError("Please upload a Word document first."); return; }
    setSubmitting(true);
    setSubmitError("");
    resetJobState();

    try {
      const orgId     = sessionStorage.getItem("organization_id") || 1;
      const projectId = sessionStorage.getItem("project_id")      || 1;
      const userId    = sessionStorage.getItem("token")           || 1;
      const response  = await orionRemediateWord(wordFile, orgId, projectId, userId);

      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }

      const data = await response.json();
      const d = data?.data ?? data;
      const id = d?.job_id ?? null;

      if (!id) throw new Error("No job ID was returned by the server.");

      setJobId(id);
      setStatus(d?.status ?? "pending");
      setJobMessage(data?.message || "");
      setSubmittedAt(new Date());
      setPolling(true);

      // Poll immediately, then on an interval
      checkStatusOnce(id);
      pollRef.current = setInterval(() => checkStatusOnce(id), POLL_INTERVAL_MS);
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Download remediated Word document ─────────────────────────
  const handleDownload = async () => {
    if (!jobId) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await downloadRemediatedWord(jobId);
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
      link.download = wordFile?.name ? `remediated_${wordFile.name}` : `remediated_${jobId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      setDownloadError(err.message || "Could not download the remediated Word document. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Show remediation report (comes with the completed status) ──
  const handleViewReport = () => {
    if (!resultData) {
      setReportError("Report is not available yet. Please try again.");
      return;
    }
    setReportError("");
    setReportData(resultData);
  };

  const handleDownloadReport = () => {
    if (!reportData) return;
    setDownloadingReport(true);
    const timestamp = new Date().toISOString().split("T")[0];
    downloadAsJson(reportData, `word-remediation-report-${jobId}-${timestamp}.json`);
    setDownloadingReport(false);
  };

  const severityClass = (sev) => {
    const lower = (sev || "").toLowerCase();
    return lower === "critical" ? "high" : lower;
  };

  const prettify = (txt) => (txt || "—").replace(/_/g, " ");

  const statusBadgeClass = (st) => {
    const v = (st || "").toUpperCase();
    if (v === "PASS") return "res-ok";
    if (v === "FAIL") return "res-fail";
    if (v === "NOT_APPLICABLE") return "sev-low";
    return "sev-medium";
  };

  const allResults = Array.isArray(reportData?.remediation_results) ? reportData.remediation_results : [];

  const manualReviewItems = allResults.filter((r) => r.remediation_outcome === "manual_review_required");

  const resultsByCategory = allResults.reduce((acc, r) => {
    const key = r.category || "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const statusLabel = () => {
    if (isFailed) return "Failed";
    if (isDone) return "Completed";
    if (status === "processing") return "Processing";
    if (status) return status.charAt(0).toUpperCase() + status.slice(1);
    return "Pending";
  };

  return (
    <div className="rwd-page">
      <main className="rwd-main">

        {/* Topbar */}
        <div className="rwd-topbar">
          <div className="rwd-topbar-left">
            <button
              className="rwd-back-fab"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
              aria-label="Back to Accessibility"
            >
              ←
            </button>
            <div className="rwd-breadcrumb">
              <span className="rwd-bc-root">Accessibility</span>
              <span className="rwd-bc-sep">›</span>
              <span className="rwd-bc-current">Remediate Word</span>
            </div>
          </div>
          <div className="rwd-topbar-right">
            {wordFile && !submitting && !jobId && (
              <div className="rwd-status-chip chip-ready">
                <span className="rwd-chip-dot dot-green"></span>
                Word Ready
              </div>
            )}
            {submitting && (
              <div className="rwd-status-chip chip-running">
                <span className="rwd-chip-spin"></span>
                Starting remediation…
              </div>
            )}
            {jobId && polling && !submitting && (
              <div className="rwd-status-chip chip-running">
                <span className="rwd-chip-spin"></span>
                Remediating…
              </div>
            )}
            {jobId && isDone && (
              <div className="rwd-status-chip chip-pass">
                <span className="rwd-chip-dot dot-green"></span>
                Remediation Complete
              </div>
            )}
            {jobId && isFailed && (
              <div className="rwd-status-chip chip-fail">
                <span className="rwd-chip-dot dot-red"></span>
                Remediation Failed
              </div>
            )}
          </div>
        </div>

        <div className="rwd-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="rwd-step-card">
            <div className="rwd-step-badge">
              <span>1</span>
            </div>
            <div className="rwd-step-body">
              <div className="rwd-step-head">
                <div>
                  <h2 className="rwd-step-title">Upload Word Document</h2>
                  <p className="rwd-step-desc">
                    Upload a Word document to automatically fix accessibility issues —
                    missing alt text, heading structure, table headers, contrast and more.
                  </p>
                </div>
              </div>

              <input ref={wordInputRef} type="file" accept=".doc,.docx" style={{ display: "none" }} onChange={handleWordSelect} />

              <div className="rwd-upload-row">
                {/* Drop zone */}
                <div
                  className={`rwd-dropzone ${dragOver ? "drag-over" : ""} ${wordFile ? "has-file" : ""}`}
                  onClick={() => wordInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {wordFile ? (
                    <div className="rwd-file-preview">
                      <div className="rwd-file-pdf-icon">
                        <span>DOC</span>
                      </div>
                      <div className="rwd-file-info">
                        <span className="rwd-file-name">{wordFile.name}</span>
                        <span className="rwd-file-size">{formatBytes(wordFile.size)}</span>
                        <span className="rwd-file-ready">Ready to remediate</span>
                      </div>
                      <button className="rwd-remove-btn" onClick={handleRemove} title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="rwd-dropzone-content">
                      <div className="rwd-drop-cloud">☁</div>
                      <p className="rwd-drop-title">Drag &amp; drop your Word document here</p>
                      <p className="rwd-drop-hint">or <span className="rwd-drop-link">click to browse</span></p>
                      <p className="rwd-drop-note">Only .doc / .docx files · Max 200MB</p>
                    </div>
                  )}
                </div>

                {/* Run panel */}
                <div className="rwd-run-panel">
                  <div className="rwd-run-info">
                    <p className="rwd-run-label">What gets fixed</p>
                    <ul className="rwd-run-checks">
                      <li><span className="rwd-check-icon">🏷️</span> Document metadata &amp; language</li>
                      <li><span className="rwd-check-icon">🖼️</span> Missing image alt-text</li>
                      <li><span className="rwd-check-icon">🧩</span> Heading &amp; table structure</li>
                      <li><span className="rwd-check-icon">🎨</span> Colour contrast issues</li>
                    </ul>
                  </div>
                  <button
                    className="rwd-run-btn"
                    onClick={handleSubmit}
                    disabled={!wordFile || submitting || polling}
                  >
                    {submitting
                      ? <><span className="rwd-btn-spin"></span> Starting…</>
                      : polling
                        ? <><span className="rwd-btn-spin"></span> Remediating…</>
                        : <><span className="rwd-run-rocket">🛠️</span> Start Remediation</>}
                  </button>
                  {submitError && (
                    <div className="rwd-error-banner">
                      <span className="rwd-error-ico">⚠</span>
                      <div>
                        <p className="rwd-error-ttl">Could Not Start Remediation</p>
                        <p className="rwd-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Result cards ══ */}
          <section className={`rwd-step-card ${!jobId ? "rwd-step-locked" : ""}`}>
            <div className="rwd-step-badge rwd-step-badge--2">
              <span>2</span>
            </div>
            <div className="rwd-step-body">
              <div className="rwd-step-head">
                <div>
                  <h2 className="rwd-step-title">Remediation Result</h2>
                  <p className="rwd-step-desc">
                    Live job status, remediated file and detailed report.
                  </p>
                </div>
              </div>

              {/* Empty state */}
              {!jobId && (
                <div className="rwd-empty-state">
                  <div className="rwd-empty-illustration">
                    <div className="rwd-empty-doc">
                      <div className="rwd-empty-line"></div>
                      <div className="rwd-empty-line short"></div>
                      <div className="rwd-empty-line"></div>
                      <div className="rwd-empty-line medium"></div>
                    </div>
                    <div className="rwd-empty-scan"></div>
                  </div>
                  <p className="rwd-empty-title">No active job yet</p>
                  <p className="rwd-empty-sub">Upload a Word document and start remediation to see live results here.</p>
                </div>
              )}

              {/* ── result cards ── */}
              {jobId && (
                <div className="rwd-cards-grid">

                  {/* Card 1 — Status */}
                  <div className={`rwd-card rwd-card-status st-${(status || "pending").toLowerCase()}`}>
                    <div className={`rwd-card-icon-wrap ${isDone ? "ic-done" : isFailed ? "ic-failed" : "ic-pending"}`}>
                      {polling && !isDone && !isFailed
                        ? <span className="rwd-mini-spin"></span>
                        : <span>{isDone ? "✅" : isFailed ? "⚠️" : "⏳"}</span>}
                    </div>
                    <div className="rwd-card-body">
                      <span className="rwd-card-label">Status</span>
                      <span className={`rwd-status-pill ${isDone ? "pill-done" : isFailed ? "pill-failed" : "pill-pending"}`}>
                        {statusLabel()}
                      </span>
                      {jobMessage && <span className="rwd-card-sub">{jobMessage}</span>}
                      {submittedAt && (
                        <span className="rwd-card-sub">Started {submittedAt.toLocaleTimeString()}</span>
                      )}
                      {lastChecked && (
                        <span className="rwd-card-sub">Last checked {lastChecked.toLocaleTimeString()}</span>
                      )}
                      {statusError && <span className="rwd-card-sub rwd-card-sub-error">{statusError}</span>}
                    </div>
                  </div>

                  {/* Card 2 — Download */}
                  <div className="rwd-card rwd-card-action">
                    <div className={`rwd-card-icon-wrap ${isDone ? "ic-done" : "ic-locked"}`}>
                      <span>⬇️</span>
                    </div>
                    <div className="rwd-card-body">
                      <span className="rwd-card-label">Remediated File</span>
                      <span className="rwd-card-sub">
                        {isDone ? "Your fixed Word document is ready to download." : "Available once remediation completes."}
                      </span>
                      <button
                        className="rwd-card-btn"
                        onClick={handleDownload}
                        disabled={!isDone || downloading}
                      >
                        {downloading
                          ? <><span className="rwd-btn-spin"></span> Downloading…</>
                          : downloaded ? "Downloaded ✓ — Download Again" : "Download Word Document"}
                      </button>
                      {downloadError && <span className="rwd-card-sub rwd-card-sub-error">{downloadError}</span>}
                    </div>
                  </div>

                  {/* Card 3 — Report */}
                  <div className="rwd-card rwd-card-action">
                    <div className={`rwd-card-icon-wrap ${isDone ? "ic-done" : "ic-locked"}`}>
                      <span>📄</span>
                    </div>
                    <div className="rwd-card-body">
                      <span className="rwd-card-label">Remediation Report</span>
                      <span className="rwd-card-sub">
                        {isDone ? "View what was fixed and download the full report." : "Available once remediation completes."}
                      </span>
                      {!reportData ? (
                        <button
                          className="rwd-card-btn"
                          onClick={handleViewReport}
                          disabled={!isDone || reportLoading}
                        >
                          {reportLoading
                            ? <><span className="rwd-btn-spin"></span> Loading…</>
                            : "View Report"}
                        </button>
                      ) : (
                        <button
                          className="rwd-card-btn rwd-card-btn-secondary"
                          onClick={handleDownloadReport}
                          disabled={downloadingReport}
                        >
                          {downloadingReport ? "Downloading…" : "Download Report JSON"}
                        </button>
                      )}
                      {reportError && <span className="rwd-card-sub rwd-card-sub-error">{reportError}</span>}
                    </div>
                  </div>

                  {/* Card 4 — Word Dashboard */}
                  <div className="rwd-card rwd-card-action">
                    <div className={`rwd-card-icon-wrap ${isDone ? "ic-done" : "ic-locked"}`}>
                      <span>📊</span>
                    </div>
                    <div className="rwd-card-body">
                      <span className="rwd-card-label">Word Dashboard</span>
                      <span className="rwd-card-sub">
                        {isDone ? "See headline accessibility KPIs for this job." : "Available once remediation completes."}
                      </span>
                      {!dashboardData ? (
                        <button
                          className="rwd-card-btn"
                          disabled={!isDone || dashboardLoading}
                        >
                          {dashboardLoading
                            ? <><span className="rwd-btn-spin"></span> Loading…</>
                            : "View Dashboard"}
                        </button>
                      ) : (
                        <button
                          className="rwd-card-btn rwd-card-btn-secondary"
                          disabled={dashboardLoading}
                        >
                          {dashboardLoading
                            ? <><span className="rwd-btn-spin"></span> Refreshing…</>
                            : "Refresh Dashboard"}
                        </button>
                      )}
                      {dashboardError && <span className="rwd-card-sub rwd-card-sub-error">{dashboardError}</span>}
                    </div>
                  </div>

                </div>
              )}

              {/* ── Word Dashboard preview (KPIs) ── */}
              {dashboardData && (
                <div className="rwd-dashboard-preview">
                  <div className="rwd-report-preview-head">
                    <span className="rwd-report-preview-icon">📊</span>
                    <h3>Word Accessibility Dashboard</h3>
                  </div>
                  <p className="rwd-report-preview-msg">
                    {dashboardData?.document?.name || ""}
                  </p>

                  <div className="rwd-kpi-grid">
                    <div className="rwd-kpi-tile kpi-before">
                      <span className="rwd-kpi-label">Score Before</span>
                      <span className="rwd-kpi-value">
                        {dashboardData?.dashboard?.accessibility_score_before ?? "—"}
                      </span>
                    </div>
                    <div className="rwd-kpi-tile kpi-after">
                      <span className="rwd-kpi-label">Score After</span>
                      <span className="rwd-kpi-value">
                        {dashboardData?.dashboard?.accessibility_score_after ?? "—"}
                      </span>
                    </div>
                    <div className="rwd-kpi-tile kpi-fixed">
                      <span className="rwd-kpi-label">Issues Fixed</span>
                      <span className="rwd-kpi-value">
                        {dashboardData?.dashboard?.issues_fixed ?? "—"}
                      </span>
                    </div>
                    <div className="rwd-kpi-tile kpi-remaining">
                      <span className="rwd-kpi-label">Issues Remaining</span>
                      <span className="rwd-kpi-value">
                        {dashboardData?.dashboard?.issues_remaining ?? "—"}
                      </span>
                    </div>
                  </div>

                  {dashboardData?.summary && (
                    <div className="rwd-dashboard-subrow">
                      <span><strong>{dashboardData.summary.issues_before ?? "—"}</strong> issues before</span>
                      <span><strong>{dashboardData.summary.issues_failed ?? "—"}</strong> failed to fix</span>
                      <span><strong>{dashboardData.summary.agents_run ?? "—"}</strong> agents run</span>
                      <span><strong>{dashboardData.summary.agents_errored ?? "—"}</strong> agents errored</span>
                      <span><strong>{dashboardData.summary.regressions?.length ?? 0}</strong> regressions</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Report preview (full breakdown) ── */}
              {reportData && (
                <div className="rwd-report-preview">
                  <div className="rwd-report-preview-head">
                    <span className="rwd-report-preview-icon">📄</span>
                    <h3>Remediation Report</h3>
                  </div>
                  <p className="rwd-report-preview-msg">
                    {reportData?.document?.name ? `${reportData.document.name} · ` : ""}
                    Status: <strong>{reportData?.status || "—"}</strong>
                    {reportData?.created_at ? ` · ${new Date(reportData.created_at).toLocaleString()}` : ""}
                  </p>

                  {reportData?.summary && (
                    <div className="rwd-kpi-grid rwd-kpi-grid-7">
                      <div className="rwd-kpi-tile kpi-before">
                        <span className="rwd-kpi-label">Score Before</span>
                        <span className="rwd-kpi-value">{reportData.summary.score_before ?? "—"}</span>
                      </div>
                      <div className="rwd-kpi-tile kpi-after">
                        <span className="rwd-kpi-label">Score After</span>
                        <span className="rwd-kpi-value">{reportData.summary.score_after ?? "—"}</span>
                      </div>
                      <div className="rwd-kpi-tile kpi-fixed">
                        <span className="rwd-kpi-label">Fixed</span>
                        <span className="rwd-kpi-value">{reportData.summary.issues_fixed ?? "—"}</span>
                      </div>
                      <div className="rwd-kpi-tile kpi-failed">
                        <span className="rwd-kpi-label">Failed</span>
                        <span className="rwd-kpi-value">{reportData.summary.issues_failed ?? "—"}</span>
                      </div>
                      <div className="rwd-kpi-tile kpi-remaining">
                        <span className="rwd-kpi-label">Remaining</span>
                        <span className="rwd-kpi-value">{reportData.summary.issues_remaining ?? "—"}</span>
                      </div>
                      <div className="rwd-kpi-tile kpi-before">
                        <span className="rwd-kpi-label">Manual Review</span>
                        <span className="rwd-kpi-value">{reportData.summary.manual_review_required ?? "—"}</span>
                      </div>
                      <div className="rwd-kpi-tile kpi-failed">
                        <span className="rwd-kpi-label">Regressions</span>
                        <span className="rwd-kpi-value">{reportData.summary.regressions ?? "—"}</span>
                      </div>
                    </div>
                  )}

                  {reportData?.summary && (
                    <div className="rwd-dashboard-subrow">
                      <span><strong>{reportData.summary.issues_before ?? "—"}</strong> issues before</span>
                      <span><strong>{reportData.summary.changes_to_review ?? "—"}</strong> changes to review</span>
                      <span><strong>{reportData.summary.duration_ms ?? "—"}</strong> ms duration</span>
                      <span><strong>{allResults.length}</strong> rules checked</span>
                    </div>
                  )}

                  {Array.isArray(reportData?.issues_fixed) && reportData.issues_fixed.length > 0 && (
                    <div className="rwd-report-section">
                      <h4 className="rwd-report-section-title">
                        <span className="rwd-report-section-dot dot-fixed"></span>
                        Issues Fixed ({reportData.issues_fixed.length})
                      </h4>
                      <div className="rwd-issue-list">
                        {reportData.issues_fixed.map((issue, i) => (
                          <div className="rwd-issue-row" key={`fixed-${issue.rule_id}-${i}`}>
                            <span className={`rwd-severity-badge sev-${severityClass(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <div className="rwd-issue-body">
                              <span className="rwd-issue-rule">{issue.rule_id} · {issue.category}</span>
                              <span className="rwd-issue-msg">{issue.title}</span>
                              <span className="rwd-issue-msg">
                                {issue.status_before} → {issue.status_after} · Affected {issue.affected_before} → {issue.affected_after}
                                {issue.remediator ? ` · ${issue.remediator}` : ""}
                                {issue.fix_status ? ` · ${prettify(issue.fix_status)}` : ""}
                              </span>
                              {Array.isArray(issue.actions) && issue.actions.map((act, j) => (
                                <span className="rwd-issue-msg" key={`fixed-act-${issue.rule_id}-${j}`}>
                                  {act.location ? `${act.location}: ` : ""}{act.action}
                                  {act.detail ? ` — ${act.detail}` : ""}
                                  {act.review_recommended ? " (review recommended)" : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(reportData?.issues_failed) && reportData.issues_failed.length > 0 && (
                    <div className="rwd-report-section">
                      <h4 className="rwd-report-section-title">
                        <span className="rwd-report-section-dot dot-failed"></span>
                        Issues Failed ({reportData.issues_failed.length})
                      </h4>
                      <div className="rwd-issue-list">
                        {reportData.issues_failed.map((issue, i) => (
                          <div className="rwd-issue-row" key={`failed-${issue.rule_id}-${i}`}>
                            <span className={`rwd-severity-badge sev-${severityClass(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <div className="rwd-issue-body">
                              <span className="rwd-issue-rule">{issue.rule_id} · {issue.category}</span>
                              <span className="rwd-issue-msg">{issue.title}</span>
                              <span className="rwd-issue-msg">
                                {issue.status_before} → {issue.status_after} · Affected {issue.affected_before} → {issue.affected_after}
                              </span>
                              {issue.reason && (
                                <span className="rwd-issue-error">{issue.reason}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {manualReviewItems.length > 0 && (
                    <div className="rwd-report-section">
                      <h4 className="rwd-report-section-title">
                        <span className="rwd-report-section-dot dot-agent"></span>
                        Manual Review Required ({manualReviewItems.length})
                      </h4>
                      <div className="rwd-issue-list">
                        {manualReviewItems.map((item, i) => (
                          <div className="rwd-issue-row" key={`manual-${item.rule_id}-${i}`}>
                            <span className={`rwd-severity-badge sev-${severityClass(item.severity)}`}>
                              {item.severity}
                            </span>
                            <div className="rwd-issue-body">
                              <span className="rwd-issue-rule">{item.rule_id} · {item.category}</span>
                              <span className="rwd-issue-msg">{item.title}</span>
                              <span className="rwd-issue-msg">
                                {prettify(item.status_after)} · Affected {item.affected_before} → {item.affected_after}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allResults.length > 0 && (
                    <div className="rwd-report-section">
                      <h4 className="rwd-report-section-title">
                        <span className="rwd-report-section-dot dot-agent"></span>
                        All Rule Results ({allResults.length})
                      </h4>
                      {Object.entries(resultsByCategory).map(([category, items]) => (
                        <div className="rwd-report-section" key={`cat-${category}`}>
                          <h4 className="rwd-report-section-title">
                            {prettify(category)} ({items.length})
                          </h4>
                          <div className="rwd-issue-list">
                            {items.map((res, i) => (
                              <div className="rwd-issue-row" key={`res-${res.rule_id}-${i}`}>
                                <span className={`rwd-severity-badge ${statusBadgeClass(res.status_after)}`}>
                                  {prettify(res.status_after)}
                                </span>
                                <div className="rwd-issue-body">
                                  <span className="rwd-issue-rule">{res.rule_id} · {res.severity}</span>
                                  <span className="rwd-issue-msg">{res.title}</span>
                                  <span className="rwd-issue-msg">
                                    {prettify(res.status_before)} → {prettify(res.status_after)} · Affected {res.affected_before} → {res.affected_after} · {prettify(res.remediation_outcome)}
                                  </span>
                                  {res.reason && <span className="rwd-issue-error">{res.reason}</span>}
                                  {Array.isArray(res.actions) && res.actions.map((act, j) => (
                                    <span className="rwd-issue-msg" key={`res-act-${res.rule_id}-${j}`}>
                                      {act.location ? `${act.location}: ` : ""}{act.action}
                                      {act.detail ? ` — ${act.detail}` : ""}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}