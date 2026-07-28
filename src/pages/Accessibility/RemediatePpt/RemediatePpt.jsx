


import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  orionRemediatePpt,
  getPptRemediationStatus,
  downloadRemediatedPpt,
  getPptRemediationReport,
  getPptAccessibilityDashboard,
} from "../../../services/apiServices";
import "./RemediatePpt.css";

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

export default function RemediatePpt() {
  const navigate = useNavigate();

  const [pptFile, setPptFile]         = useState(null);
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

  const pptInputRef = useRef(null);
  const pollRef = useRef(null);

  const isDone   = DONE_STATUSES.includes((status || "").toLowerCase());
  const isFailed = FAILED_STATUSES.includes((status || "").toLowerCase());

  const isPptFile = (name) => /\.(pptx|ppt)$/i.test(name || "");

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
    if (!isPptFile(file.name)) {
      setSubmitError("Please upload a PowerPoint file (.ppt or .pptx)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSubmitError("File exceeds the 200 MB limit. Please upload a smaller PPT.");
      return;
    }
    setPptFile(file);
    setSubmitError("");
    resetJobState();
  };

  const handlePptSelect = (e) => {
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
    setPptFile(null);
    setSubmitError("");
    resetJobState();
  };

  // ── Poll status until completed / failed ─────────────────────
  const checkStatusOnce = useCallback(async (id) => {
    try {
      const response = await getPptRemediationStatus(id);
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

  // ── Submit — Remediate PPT ────────────────────────────────────
  const handleSubmit = async () => {
    if (!pptFile) { setSubmitError("Please upload a PPT file first."); return; }
    setSubmitting(true);
    setSubmitError("");
    resetJobState();

    try {
      const orgId     = sessionStorage.getItem("organization_id") || 1;
      const projectId = sessionStorage.getItem("project_id")      || 1;
      const response  = await orionRemediatePpt(pptFile, orgId, projectId);

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

  // ── Download remediated PPT ───────────────────────────────────
  const handleDownload = async () => {
    if (!jobId) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await downloadRemediatedPpt(jobId);
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
      link.download = pptFile?.name ? `remediated_${pptFile.name}` : `remediated_${jobId}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      setDownloadError(err.message || "Could not download the remediated PPT. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Fetch + download remediation report ───────────────────────
  const handleViewReport = async () => {
    if (!jobId) return;
    setReportLoading(true);
    setReportError("");
    try {
      const response = await getPptRemediationReport(jobId);
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      const data = await response.json();
      const d = data?.data ?? data;
      setReportData(d);
    } catch (err) {
      setReportError(err.message || "Could not fetch the remediation report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) return;
    setDownloadingReport(true);
    const timestamp = new Date().toISOString().split("T")[0];
    downloadAsJson(reportData, `ppt-remediation-report-${jobId}-${timestamp}.json`);
    setDownloadingReport(false);
  };

  // ── Fetch PPT accessibility dashboard (KPIs) ──────────────────
  const handleViewDashboard = async () => {
    if (!jobId) return;
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const response = await getPptAccessibilityDashboard(jobId);
      if (!response.ok) {
        let errMsg = `Server error: ${response.status}`;
        try { const e = await response.json(); errMsg = e.detail || e.message || e.error || JSON.stringify(e); }
        catch { try { const t = await response.text(); if (t) errMsg = t; } catch {} }
        throw new Error(errMsg);
      }
      const data = await response.json();
      const d = data?.data ?? data;
      setDashboardData(d);
    } catch (err) {
      setDashboardError(err.message || "Could not fetch the accessibility dashboard. Please try again.");
    } finally {
      setDashboardLoading(false);
    }
  };

  const copyJobId = async () => {
    if (!jobId) return;
    try { await navigator.clipboard.writeText(jobId); } catch { /* clipboard not available */ }
  };

  const statusLabel = () => {
    if (isFailed) return "Failed";
    if (isDone) return "Completed";
    if (status === "processing") return "Processing";
    if (status) return status.charAt(0).toUpperCase() + status.slice(1);
    return "Pending";
  };

  return (
    <div className="rpp-page">
      <main className="rpp-main">

        {/* Topbar */}
        <div className="rpp-topbar">
          <div className="rpp-topbar-left">
            <button
              className="rpp-back-fab"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
              aria-label="Back to Accessibility"
            >
              ←
            </button>
            <div className="rpp-breadcrumb">
              <span className="rpp-bc-root">Accessibility</span>
              <span className="rpp-bc-sep">›</span>
              <span className="rpp-bc-current">Remediate PPT</span>
            </div>
          </div>
          <div className="rpp-topbar-right">
            {pptFile && !submitting && !jobId && (
              <div className="rpp-status-chip chip-ready">
                <span className="rpp-chip-dot dot-green"></span>
                PPT Ready
              </div>
            )}
            {submitting && (
              <div className="rpp-status-chip chip-running">
                <span className="rpp-chip-spin"></span>
                Starting remediation…
              </div>
            )}
            {jobId && polling && !submitting && (
              <div className="rpp-status-chip chip-running">
                <span className="rpp-chip-spin"></span>
                Remediating…
              </div>
            )}
            {jobId && isDone && (
              <div className="rpp-status-chip chip-pass">
                <span className="rpp-chip-dot dot-green"></span>
                Remediation Complete
              </div>
            )}
            {jobId && isFailed && (
              <div className="rpp-status-chip chip-fail">
                <span className="rpp-chip-dot dot-red"></span>
                Remediation Failed
              </div>
            )}
          </div>
        </div>

        <div className="rpp-content">

          {/* ══ STEP 1 — Upload ══ */}
          <section className="rpp-step-card">
            <div className="rpp-step-badge">
              <span>1</span>
            </div>
            <div className="rpp-step-body">
              <div className="rpp-step-head">
                <div>
                  <h2 className="rpp-step-title">Upload PPT</h2>
                  <p className="rpp-step-desc">
                    Upload a PowerPoint file to automatically fix accessibility issues —
                    missing alt text, heading structure, contrast, reading order and more.
                  </p>
                </div>
              </div>

              <input ref={pptInputRef} type="file" accept=".ppt,.pptx" style={{ display: "none" }} onChange={handlePptSelect} />

              <div className="rpp-upload-row">
                {/* Drop zone */}
                <div
                  className={`rpp-dropzone ${dragOver ? "drag-over" : ""} ${pptFile ? "has-file" : ""}`}
                  onClick={() => pptInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {pptFile ? (
                    <div className="rpp-file-preview">
                      <div className="rpp-file-pdf-icon">
                        <span>PPT</span>
                      </div>
                      <div className="rpp-file-info">
                        <span className="rpp-file-name">{pptFile.name}</span>
                        <span className="rpp-file-size">{formatBytes(pptFile.size)}</span>
                        <span className="rpp-file-ready">Ready to remediate</span>
                      </div>
                      <button className="rpp-remove-btn" onClick={handleRemove} title="Remove file">✕</button>
                    </div>
                  ) : (
                    <div className="rpp-dropzone-content">
                      <div className="rpp-drop-cloud">☁</div>
                      <p className="rpp-drop-title">Drag &amp; drop your PPT here</p>
                      <p className="rpp-drop-hint">or <span className="rpp-drop-link">click to browse</span></p>
                      <p className="rpp-drop-note">Only .ppt / .pptx files · Max 200MB</p>
                    </div>
                  )}
                </div>

                {/* Run panel */}
                <div className="rpp-run-panel">
                  <div className="rpp-run-info">
                    <p className="rpp-run-label">What gets fixed</p>
                    <ul className="rpp-run-checks">
                      <li><span className="rpp-check-icon">🏷️</span> Document metadata &amp; language</li>
                      <li><span className="rpp-check-icon">🖼️</span> Missing image alt-text</li>
                      <li><span className="rpp-check-icon">🧩</span> Heading &amp; reading order</li>
                      <li><span className="rpp-check-icon">🎨</span> Colour contrast issues</li>
                    </ul>
                  </div>
                  <button
                    className="rpp-run-btn"
                    onClick={handleSubmit}
                    disabled={!pptFile || submitting || polling}
                  >
                    {submitting
                      ? <><span className="rpp-btn-spin"></span> Starting…</>
                      : polling
                        ? <><span className="rpp-btn-spin"></span> Remediating…</>
                        : <><span className="rpp-run-rocket">🛠️</span> Start Remediation</>}
                  </button>
                  {submitError && (
                    <div className="rpp-error-banner">
                      <span className="rpp-error-ico">⚠</span>
                      <div>
                        <p className="rpp-error-ttl">Could Not Start Remediation</p>
                        <p className="rpp-error-msg">{submitError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══ STEP 2 — Result cards ══ */}
          <section className={`rpp-step-card ${!jobId ? "rpp-step-locked" : ""}`}>
            <div className="rpp-step-badge rpp-step-badge--2">
              <span>2</span>
            </div>
            <div className="rpp-step-body">
              <div className="rpp-step-head">
                <div>
                  <h2 className="rpp-step-title">Remediation Result</h2>
                  <p className="rpp-step-desc">
                    Live job status, remediated file and detailed report.
                  </p>
                </div>
              </div>

              {/* Empty state */}
              {!jobId && (
                <div className="rpp-empty-state">
                  <div className="rpp-empty-illustration">
                    <div className="rpp-empty-doc">
                      <div className="rpp-empty-line"></div>
                      <div className="rpp-empty-line short"></div>
                      <div className="rpp-empty-line"></div>
                      <div className="rpp-empty-line medium"></div>
                    </div>
                    <div className="rpp-empty-scan"></div>
                  </div>
                  <p className="rpp-empty-title">No active job yet</p>
                  <p className="rpp-empty-sub">Upload a PPT and start remediation to see live results here.</p>
                </div>
              )}

              {/* ── 4 result cards ── */}
              {jobId && (
                <div className="rpp-cards-grid">

                  {/* Card 1 — Job ID */}
                  <div className="rpp-card rpp-card-job">
                    <div className="rpp-card-icon-wrap ic-job">
                      <span>🆔</span>
                    </div>
                    <div className="rpp-card-body">
                      <span className="rpp-card-label">Job ID</span>
                      <div className="rpp-card-value-row">
                        <code className="rpp-job-id-value" title={jobId}>{jobId}</code>
                        <button className="rpp-copy-btn" onClick={copyJobId} title="Copy job ID">⧉</button>
                      </div>
                      {submittedAt && (
                        <span className="rpp-card-sub">Started {submittedAt.toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Card 2 — Status */}
                  <div className={`rpp-card rpp-card-status st-${(status || "pending").toLowerCase()}`}>
                    <div className={`rpp-card-icon-wrap ${isDone ? "ic-done" : isFailed ? "ic-failed" : "ic-pending"}`}>
                      {polling && !isDone && !isFailed
                        ? <span className="rpp-mini-spin"></span>
                        : <span>{isDone ? "✅" : isFailed ? "⚠️" : "⏳"}</span>}
                    </div>
                    <div className="rpp-card-body">
                      <span className="rpp-card-label">Status</span>
                      <span className={`rpp-status-pill ${isDone ? "pill-done" : isFailed ? "pill-failed" : "pill-pending"}`}>
                        {statusLabel()}
                      </span>
                      {jobMessage && <span className="rpp-card-sub">{jobMessage}</span>}
                      {lastChecked && (
                        <span className="rpp-card-sub">Last checked {lastChecked.toLocaleTimeString()}</span>
                      )}
                      {statusError && <span className="rpp-card-sub rpp-card-sub-error">{statusError}</span>}
                    </div>
                  </div>

                  {/* Card 3 — Download */}
                  <div className="rpp-card rpp-card-action">
                    <div className={`rpp-card-icon-wrap ${isDone ? "ic-done" : "ic-locked"}`}>
                      <span>⬇️</span>
                    </div>
                    <div className="rpp-card-body">
                      <span className="rpp-card-label">Remediated File</span>
                      <span className="rpp-card-sub">
                        {isDone ? "Your fixed PPT is ready to download." : "Available once remediation completes."}
                      </span>
                      <button
                        className="rpp-card-btn"
                        onClick={handleDownload}
                        disabled={!isDone || downloading}
                      >
                        {downloading
                          ? <><span className="rpp-btn-spin"></span> Downloading…</>
                          : downloaded ? "Downloaded ✓ — Download Again" : "Download PPT"}
                      </button>
                      {downloadError && <span className="rpp-card-sub rpp-card-sub-error">{downloadError}</span>}
                    </div>
                  </div>

                  {/* Card 4 — Report */}
                  <div className="rpp-card rpp-card-action">
                    <div className={`rpp-card-icon-wrap ${isDone ? "ic-done" : "ic-locked"}`}>
                      <span>📄</span>
                    </div>
                    <div className="rpp-card-body">
                      <span className="rpp-card-label">Remediation Report</span>
                      <span className="rpp-card-sub">
                        {isDone ? "View what was fixed and download the full report." : "Available once remediation completes."}
                      </span>
                      {!reportData ? (
                        <button
                          className="rpp-card-btn"
                          onClick={handleViewReport}
                          disabled={!isDone || reportLoading}
                        >
                          {reportLoading
                            ? <><span className="rpp-btn-spin"></span> Loading…</>
                            : "View Report"}
                        </button>
                      ) : (
                        <button
                          className="rpp-card-btn rpp-card-btn-secondary"
                          onClick={handleDownloadReport}
                          disabled={downloadingReport}
                        >
                          {downloadingReport ? "Downloading…" : "Download Report JSON"}
                        </button>
                      )}
                      {reportError && <span className="rpp-card-sub rpp-card-sub-error">{reportError}</span>}
                    </div>
                  </div>

                  {/* Card 5 — PPT Dashboard */}
                  <div className="rpp-card rpp-card-action">
                    <div className={`rpp-card-icon-wrap ${isDone ? "ic-done" : "ic-locked"}`}>
                      <span>📊</span>
                    </div>
                    <div className="rpp-card-body">
                      <span className="rpp-card-label">PPT Dashboard</span>
                      <span className="rpp-card-sub">
                        {isDone ? "See headline accessibility KPIs for this job." : "Available once remediation completes."}
                      </span>
                      {!dashboardData ? (
                        <button
                          className="rpp-card-btn"
                          onClick={handleViewDashboard}
                          disabled={!isDone || dashboardLoading}
                        >
                          {dashboardLoading
                            ? <><span className="rpp-btn-spin"></span> Loading…</>
                            : "View Dashboard"}
                        </button>
                      ) : (
                        <button
                          className="rpp-card-btn rpp-card-btn-secondary"
                          onClick={handleViewDashboard}
                          disabled={dashboardLoading}
                        >
                          {dashboardLoading
                            ? <><span className="rpp-btn-spin"></span> Refreshing…</>
                            : "Refresh Dashboard"}
                        </button>
                      )}
                      {dashboardError && <span className="rpp-card-sub rpp-card-sub-error">{dashboardError}</span>}
                    </div>
                  </div>

                </div>
              )}

              {/* ── PPT Dashboard preview (KPIs) ── */}
              {dashboardData && (
                <div className="rpp-dashboard-preview">
                  <div className="rpp-report-preview-head">
                    <span className="rpp-report-preview-icon">📊</span>
                    <h3>PPT Accessibility Dashboard</h3>
                  </div>
                  <p className="rpp-report-preview-msg">
                    {dashboardData?.document?.name ? `${dashboardData.document.name} · ` : ""}
                    Job <code className="rpp-inline-code">{dashboardData?.job_id || jobId}</code>
                  </p>

                  <div className="rpp-kpi-grid">
                    <div className="rpp-kpi-tile kpi-before">
                      <span className="rpp-kpi-label">Score Before</span>
                      <span className="rpp-kpi-value">
                        {dashboardData?.dashboard?.accessibility_score_before ?? "—"}
                      </span>
                    </div>
                    <div className="rpp-kpi-tile kpi-after">
                      <span className="rpp-kpi-label">Score After</span>
                      <span className="rpp-kpi-value">
                        {dashboardData?.dashboard?.accessibility_score_after ?? "—"}
                      </span>
                    </div>
                    <div className="rpp-kpi-tile kpi-fixed">
                      <span className="rpp-kpi-label">Issues Fixed</span>
                      <span className="rpp-kpi-value">
                        {dashboardData?.dashboard?.issues_fixed ?? "—"}
                      </span>
                    </div>
                    <div className="rpp-kpi-tile kpi-remaining">
                      <span className="rpp-kpi-label">Issues Remaining</span>
                      <span className="rpp-kpi-value">
                        {dashboardData?.dashboard?.issues_remaining ?? "—"}
                      </span>
                    </div>
                  </div>

                  {dashboardData?.summary && (
                    <div className="rpp-dashboard-subrow">
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
                <div className="rpp-report-preview">
                  <div className="rpp-report-preview-head">
                    <span className="rpp-report-preview-icon">📄</span>
                    <h3>Remediation Report</h3>
                  </div>
                  <p className="rpp-report-preview-msg">
                    {reportData?.document?.name ? `${reportData.document.name} · ` : ""}
                    Status: <strong>{reportData?.status || "—"}</strong>
                    {reportData?.created_at ? ` · ${new Date(reportData.created_at).toLocaleString()}` : ""}
                  </p>

                  {reportData?.summary && (
                    <div className="rpp-kpi-grid rpp-kpi-grid-7">
                      <div className="rpp-kpi-tile kpi-before">
                        <span className="rpp-kpi-label">Score Before</span>
                        <span className="rpp-kpi-value">{reportData.summary.score_before ?? "—"}</span>
                      </div>
                      <div className="rpp-kpi-tile kpi-after">
                        <span className="rpp-kpi-label">Score After</span>
                        <span className="rpp-kpi-value">{reportData.summary.score_after ?? "—"}</span>
                      </div>
                      <div className="rpp-kpi-tile kpi-fixed">
                        <span className="rpp-kpi-label">Fixed</span>
                        <span className="rpp-kpi-value">{reportData.summary.issues_fixed ?? "—"}</span>
                      </div>
                      <div className="rpp-kpi-tile kpi-failed">
                        <span className="rpp-kpi-label">Failed</span>
                        <span className="rpp-kpi-value">{reportData.summary.issues_failed ?? "—"}</span>
                      </div>
                      <div className="rpp-kpi-tile kpi-remaining">
                        <span className="rpp-kpi-label">Remaining</span>
                        <span className="rpp-kpi-value">{reportData.summary.issues_remaining ?? "—"}</span>
                      </div>
                      <div className="rpp-kpi-tile kpi-before">
                        <span className="rpp-kpi-label">Agents Run</span>
                        <span className="rpp-kpi-value">{reportData.summary.agents_run ?? "—"}</span>
                      </div>
                      <div className="rpp-kpi-tile kpi-failed">
                        <span className="rpp-kpi-label">Agents Errored</span>
                        <span className="rpp-kpi-value">{reportData.summary.agents_errored ?? "—"}</span>
                      </div>
                    </div>
                  )}

                  {Array.isArray(reportData?.issues_fixed) && reportData.issues_fixed.length > 0 && (
                    <div className="rpp-report-section">
                      <h4 className="rpp-report-section-title">
                        <span className="rpp-report-section-dot dot-fixed"></span>
                        Issues Fixed ({reportData.issues_fixed.length})
                      </h4>
                      <div className="rpp-issue-list">
                        {reportData.issues_fixed.map((issue, i) => (
                          <div className="rpp-issue-row" key={`fixed-${issue.rule_id}-${i}`}>
                            <span className={`rpp-severity-badge sev-${(issue.severity || "").toLowerCase()}`}>
                              {issue.severity}
                            </span>
                            <div className="rpp-issue-body">
                              <span className="rpp-issue-rule">{issue.rule_id} · {issue.category}</span>
                              <span className="rpp-issue-msg">{issue.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(reportData?.issues_failed) && reportData.issues_failed.length > 0 && (
                    <div className="rpp-report-section">
                      <h4 className="rpp-report-section-title">
                        <span className="rpp-report-section-dot dot-failed"></span>
                        Needs Manual Review ({reportData.issues_failed.length})
                      </h4>
                      <div className="rpp-issue-list">
                        {reportData.issues_failed.map((issue, i) => (
                          <div className="rpp-issue-row" key={`failed-${issue.rule_id}-${i}`}>
                            <span className={`rpp-severity-badge sev-${(issue.severity || "").toLowerCase()}`}>
                              {issue.severity}
                            </span>
                            <div className="rpp-issue-body">
                              <span className="rpp-issue-rule">{issue.rule_id} · {issue.category}</span>
                              <span className="rpp-issue-msg">{issue.message}</span>
                              {issue.remediation_error && (
                                <span className="rpp-issue-error">{issue.remediation_error}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(reportData?.remediation_results) && reportData.remediation_results.length > 0 && (
                    <div className="rpp-report-section">
                      <h4 className="rpp-report-section-title">
                        <span className="rpp-report-section-dot dot-agent"></span>
                        Remediation Actions ({reportData.remediation_results.length})
                      </h4>
                      <div className="rpp-issue-list">
                        {reportData.remediation_results.map((res, i) => (
                          <div className="rpp-issue-row" key={`res-${res.rule_id}-${i}`}>
                            <span className={`rpp-result-icon ${res.success ? "res-ok" : "res-fail"}`}>
                              {res.success ? "✓" : "✕"}
                            </span>
                            <div className="rpp-issue-body">
                              <span className="rpp-issue-rule">{res.rule_id} · {res.agent_name}</span>
                              {res.changes_made && res.changes_made.length > 0 && (
                                <span className="rpp-issue-msg">{res.changes_made.join("; ")}</span>
                              )}
                              {res.error && <span className="rpp-issue-error">{res.error}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
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