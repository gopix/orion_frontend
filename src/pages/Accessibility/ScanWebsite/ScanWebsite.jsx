
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllWebsites, scanWebsite, getScan } from "../../../services/apiServices";
import "./ScanWebsite.css";

const MAX_PAGES_LIMIT = 20;

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const statusClass = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "PASS" || s === "PASSED" || s === "DONE" || s === "RESOLVED") return "ww-status-pass";
  if (s === "FAIL" || s === "FAILED") return "ww-status-fail";
  if (s === "IN_PROGRESS" || s === "SCANNING" || s === "QUEUED" || s === "OPEN") return "ww-status-progress";
  return "ww-status-unknown";
};

const severityClass = (severity) => {
  const s = (severity || "").toUpperCase();
  if (s === "CRITICAL") return "sw-severity-critical";
  if (s === "SERIOUS" || s === "HIGH") return "sw-severity-serious";
  if (s === "MODERATE" || s === "MEDIUM") return "sw-severity-moderate";
  if (s === "MINOR" || s === "LOW") return "sw-severity-minor";
  return "sw-severity-unknown";
};

const EMPTY_ISSUE_FILTERS = { status: "", severity: "", rule_code: "" };

/* ════════════════════════════════════════════════════════════
   SCAN DETAIL MODAL
   Fetches GET /web-accessibility/scans/{scan_id} and shows the
   page's own scan status/results, with its issues embedded inline.
   ════════════════════════════════════════════════════════════ */
function ScanDetailModal({ scanId, onClose }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(EMPTY_ISSUE_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_ISSUE_FILTERS);

  const fetchScan = async (activeFilters) => {
    setLoading(true);
    setError("");
    try {
      const res = await getScan(scanId, activeFilters);
      if (res?.response_code >= 400) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load scan.");
      }
      setScan(res?.data || null);
    } catch (err) {
      setError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan(EMPTY_ISSUE_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(filters);
    fetchScan(filters);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_ISSUE_FILTERS);
    setAppliedFilters(EMPTY_ISSUE_FILTERS);
    fetchScan(EMPTY_ISSUE_FILTERS);
  };

  const issues = Array.isArray(scan?.issues) ? scan.issues : [];
  const filtersActive = appliedFilters.status || appliedFilters.severity || appliedFilters.rule_code;

  return (
    <div className="ww-modal-overlay" onClick={onClose}>
      <div className="ww-modal sw-scan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ww-modal-header">
          <h3>Scan #{scanId}</h3>
          <button type="button" className="ww-modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="ww-empty-state">Loading scan…</div>
        ) : error ? (
          <div className="ww-alert ww-alert-error">{error}</div>
        ) : !scan ? (
          <div className="ww-empty-state">No data found for this scan.</div>
        ) : (
          <>
            <div className="sw-result-summary sw-modal-summary">
              <div className="sw-summary-chip">
                <span className="sw-summary-label">Status</span>
                <span className={`ww-status-badge ${statusClass(scan.status)}`}>
                  {scan.status || "UNKNOWN"}
                </span>
              </div>
              {scan.crawl_id !== undefined && scan.crawl_id !== null && (
                <div className="sw-summary-chip">
                  <span className="sw-summary-label">Crawl ID</span>
                  <span className="sw-summary-value">#{scan.crawl_id}</span>
                </div>
              )}
              {scan.website_id !== undefined && (
                <div className="sw-summary-chip">
                  <span className="sw-summary-label">Website ID</span>
                  <span className="sw-summary-value">#{scan.website_id}</span>
                </div>
              )}
              {scan.scanned_at || scan.created_at ? (
                <div className="sw-summary-chip">
                  <span className="sw-summary-label">Scanned At</span>
                  <span className="sw-summary-value">{formatDate(scan.scanned_at || scan.created_at)}</span>
                </div>
              ) : null}
            </div>

            {scan.url && <div className="sw-modal-url">{scan.url}</div>}

            <form className="sw-issue-filters" onSubmit={handleApplyFilters}>
              <label className="ww-field">
                <span className="ww-field-label">Status</span>
                <input
                  type="text"
                  className="ww-input"
                  placeholder="e.g. OPEN"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                />
              </label>
              <label className="ww-field">
                <span className="ww-field-label">Severity</span>
                <input
                  type="text"
                  className="ww-input"
                  placeholder="e.g. CRITICAL"
                  value={filters.severity}
                  onChange={(e) => handleFilterChange("severity", e.target.value)}
                />
              </label>
              <label className="ww-field">
                <span className="ww-field-label">Rule Code</span>
                <input
                  type="text"
                  className="ww-input"
                  placeholder="e.g. IMG-001"
                  value={filters.rule_code}
                  onChange={(e) => handleFilterChange("rule_code", e.target.value)}
                />
              </label>
              <div className="sw-issue-filters-actions">
                <button type="submit" className="ww-btn-primary">Apply</button>
                {filtersActive && (
                  <button type="button" className="ww-btn-ghost" onClick={handleClearFilters}>
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="ww-card-title-row sw-issues-title-row">
              <span className="ww-card-title">Issues ({issues.length})</span>
            </div>

            {issues.length === 0 ? (
              <div className="ww-empty-state">
                {filtersActive ? "No issues match those filters." : "No issues found for this scan."}
              </div>
            ) : (
              <div className="ww-table-wrap">
                <table className="ww-table">
                  <thead>
                    <tr>
                      <th>Rule Code</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Message</th>
                      <th>Times Seen</th>
                      <th>Resolved At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue, idx) => (
                      <tr key={issue.id ?? `${issue.rule_code}-${idx}`}>
                        <td>{issue.rule_code || "—"}</td>
                        <td>
                          <span className={`ww-status-badge ${severityClass(issue.severity)}`}>
                            {issue.severity || "—"}
                          </span>
                        </td>
                        <td>
                          <span className={`ww-status-badge ${statusClass(issue.status)}`}>
                            {issue.status || "—"}
                          </span>
                        </td>
                        <td className="ww-td-url">{issue.message || issue.description || "—"}</td>
                        <td>{issue.times_seen ?? "—"}</td>
                        <td>{formatDate(issue.resolved_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ScanWebsite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("website_id");

  // ── Websites list (for the name → id picker) ────────────────
  const [websites, setWebsites] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // ── Form state ───────────────────────────────────────────────
  const [websiteId, setWebsiteId] = useState("");
  const [url, setUrl] = useState("");
  const [allPages, setAllPages] = useState(false);
  const [maxPages, setMaxPages] = useState(MAX_PAGES_LIMIT);

  // ── Submit state ─────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  // ── Scan detail modal ────────────────────────────────────────
  const [selectedScanId, setSelectedScanId] = useState(null);

  useEffect(() => {
    const fetchWebsites = async () => {
      setListLoading(true);
      setListError("");
      try {
        const res = await getAllWebsites();
        if (res?.response_code >= 400) {
          throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load websites.");
        }
        const data = Array.isArray(res?.data) ? res.data : [];
        setWebsites(data);

        if (preselectedId && data.some((w) => String(w.id) === String(preselectedId))) {
          setWebsiteId(String(preselectedId));
        }
      } catch (err) {
        setListError(err.message || "Unable to connect. Please try again later.");
      } finally {
        setListLoading(false);
      }
    };
    fetchWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedWebsite = useMemo(
    () => websites.find((w) => String(w.id) === String(websiteId)) || null,
    [websites, websiteId]
  );

  const handleWebsiteChange = (id) => {
    setWebsiteId(id);
    const site = websites.find((w) => String(w.id) === String(id));
    // Default the scan URL to the website's base URL — user can still edit it.
    setUrl(site?.base_url || "");
    setResult(null);
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setResult(null);

    if (!websiteId) {
      setSubmitError("Please choose a website to scan.");
      return;
    }
    if (!allPages && !url.trim()) {
      setSubmitError("Please enter a URL to scan.");
      return;
    }

    const payload = allPages
      ? { all_pages: true, max_pages: Number(maxPages) || MAX_PAGES_LIMIT }
      : { url: url.trim(), all_pages: false };

    setSubmitting(true);
    try {
      const res = await scanWebsite(websiteId, payload);
      if (res?.response_code >= 400) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to queue scan.");
      }
      setResult(res?.data || null);
    } catch (err) {
      setSubmitError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ww-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="ww-sidebar">
        <div className="ww-logo">
          <div className="ww-logo-mark">O</div>
          <div className="ww-logo-text">
            <span>ORION</span>
            <small>Web Accessibility</small>
          </div>
        </div>

        <nav className="ww-nav">
          <p className="ww-nav-label">WEB ACCESSIBILITY</p>
          <div className="ww-nav-item" onClick={() => navigate("/validate-web")}>
            <span className="ww-nav-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div
            className="ww-nav-item"
            onClick={() => navigate("/validate-web?tab=new-website")}
          >
            <span className="ww-nav-icon">➕</span>
            <span>New Website</span>
          </div>
          <div className="ww-nav-item active">
            <span className="ww-nav-icon">🔍</span>
            <span>Scan Website</span>
            <span className="ww-nav-dot"></span>
          </div>
          <div className="ww-nav-item" onClick={() => navigate("/crawls")}>
            <span className="ww-nav-icon">🕓</span>
            <span>Crawls</span>
          </div>
        </nav>

        <div className="ww-sidebar-footer">
          <div className="ww-user-section">
            <p className="ww-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="ww-back-btn"
              onClick={() => navigate("/validate-web")}
              title="Back to Website Dashboard"
            >
              <span className="ww-back-icon">←</span>
              <span className="ww-back-label">Back</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="ww-main">
        <div className="ww-container">
          <div className="ww-header">
            <div>
              <h1 className="ww-page-title">Scan Website</h1>
              <p className="ww-page-subtitle">
                Queue an accessibility scan for a registered website — a single page or the entire site.
              </p>
            </div>
          </div>

          {listError && <div className="ww-alert ww-alert-error">{listError}</div>}

          <div className="ww-card sw-form-card">
            <form className="ww-form-grid" onSubmit={handleSubmit}>
              <label className="ww-field ww-field-wide">
                <span className="ww-field-label">Website *</span>
                <select
                  className="ww-input"
                  value={websiteId}
                  onChange={(e) => handleWebsiteChange(e.target.value)}
                  disabled={listLoading}
                >
                  <option value="">
                    {listLoading ? "Loading websites…" : "Select a website"}
                  </option>
                  {websites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedWebsite && (
                <div className="ww-field-wide sw-selected-info">
                  Website ID <strong>#{selectedWebsite.id}</strong> · {selectedWebsite.base_url}
                </div>
              )}

              <label className="ww-field ww-field-wide">
                <span className="ww-field-label">
                  Scan URL {!allPages && "*"}
                </span>
                <input
                  type="text"
                  className="ww-input"
                  placeholder="https://www.example.com/page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={allPages}
                />
                {allPages && (
                  <span className="sw-field-hint">
                    Ignored in full-site mode — every discovered page is scanned instead.
                  </span>
                )}
              </label>

              <div className="ww-field ww-field-wide">
                <span className="ww-field-label">Scan All Pages</span>
                <div className="sw-option-grid">
                  <label className={`sw-option-card${!allPages ? " sw-option-selected" : ""}`}>
                    <input
                      type="radio"
                      name="sw-all-pages"
                      className="ww-radio"
                      checked={!allPages}
                      onChange={() => setAllPages(false)}
                    />
                    <span className="sw-option-icon">📄</span>
                    <span className="sw-option-label">False</span>
                    <span className="sw-option-desc">Scan only the URL above (home page)</span>
                  </label>
                  <label className={`sw-option-card${allPages ? " sw-option-selected" : ""}`}>
                    <input
                      type="radio"
                      name="sw-all-pages"
                      className="ww-radio"
                      checked={allPages}
                      onChange={() => setAllPages(true)}
                    />
                    <span className="sw-option-icon">🌐</span>
                    <span className="sw-option-label">True</span>
                    <span className="sw-option-desc">Discover and scan the entire website</span>
                  </label>
                </div>
              </div>

              {allPages && (
                <label className="ww-field">
                  <span className="ww-field-label">Max Pages (up to {MAX_PAGES_LIMIT})</span>
                  <input
                    type="number"
                    className="ww-input"
                    min={1}
                    max={MAX_PAGES_LIMIT}
                    value={maxPages}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (Number.isNaN(val)) {
                        setMaxPages("");
                        return;
                      }
                      setMaxPages(Math.min(MAX_PAGES_LIMIT, Math.max(1, val)));
                    }}
                  />
                </label>
              )}

              {submitError && <div className="ww-alert ww-alert-error ww-field-wide">{submitError}</div>}

              <div className="ww-field-wide ww-form-actions">
                <button type="submit" className="ww-btn-primary" disabled={submitting}>
                  {submitting ? "Queuing Scan…" : "Start Scan"}
                </button>
                <button
                  type="button"
                  className="ww-btn-ghost"
                  onClick={() => navigate("/validate-web")}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {result && (
            <div className="ww-card sw-result-card">
              <div className="ww-card-title-row">
                <span className="ww-card-title">✅ Scan Queued</span>
                <button
                  type="button"
                  className="ww-btn-ghost sw-view-crawls-btn"
                  onClick={() => navigate(`/crawls?website_id=${result.website_id ?? websiteId}`)}
                >
                  View Crawl History
                </button>
              </div>

              <div className="sw-result-summary">
                {result.crawl_id !== undefined && (
                  <div className="sw-summary-chip">
                    <span className="sw-summary-label">Crawl ID</span>
                    <span className="sw-summary-value">#{result.crawl_id}</span>
                  </div>
                )}
                {result.scan_id !== undefined && (
                  <div className="sw-summary-chip">
                    <span className="sw-summary-label">Scan ID</span>
                    <span className="sw-summary-value">#{result.scan_id}</span>
                  </div>
                )}
                <div className="sw-summary-chip">
                  <span className="sw-summary-label">Website ID</span>
                  <span className="sw-summary-value">#{result.website_id ?? websiteId}</span>
                </div>
                {result.discovery_source && (
                  <div className="sw-summary-chip">
                    <span className="sw-summary-label">Discovery Source</span>
                    <span className="sw-summary-value">{result.discovery_source}</span>
                  </div>
                )}
                {result.pages_discovered !== undefined && (
                  <div className="sw-summary-chip">
                    <span className="sw-summary-label">Pages Discovered</span>
                    <span className="sw-summary-value">{result.pages_discovered}</span>
                  </div>
                )}
              </div>

              <p className="sw-scan-hint">Click a Scan ID below to view that page's scan results.</p>

              {Array.isArray(result.scans_queued) && result.scans_queued.length > 0 ? (
                <div className="ww-table-wrap">
                  <table className="ww-table">
                    <thead>
                      <tr>
                        <th>Scan ID</th>
                        <th>URL</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.scans_queued.map((scan) => (
                        <tr key={scan.scan_id}>
                          <td>
                            <button
                              type="button"
                              className="sw-scan-id-link"
                              onClick={() => setSelectedScanId(scan.scan_id)}
                            >
                              #{scan.scan_id}
                            </button>
                          </td>
                          <td className="ww-td-url">{scan.url}</td>
                          <td>
                            <span className="ww-status-badge ww-status-progress">
                              {scan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                result.url && (
                  <div className="ww-table-wrap">
                    <table className="ww-table">
                      <thead>
                        <tr>
                          <th>Scan ID</th>
                          <th>URL</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <button
                              type="button"
                              className="sw-scan-id-link"
                              onClick={() => setSelectedScanId(result.scan_id)}
                            >
                              #{result.scan_id}
                            </button>
                          </td>
                          <td className="ww-td-url">{result.url}</td>
                          <td>
                            <span className="ww-status-badge ww-status-progress">
                              {result.status || "QUEUED"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {selectedScanId !== null && selectedScanId !== undefined && (
        <ScanDetailModal
          scanId={selectedScanId}
          onClose={() => setSelectedScanId(null)}
        />
      )}
    </div>
  );
}