import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllWebsites, getWebsiteCrawls } from "../../../services/apiServices";
import "./Crawls.css";

const crawlStatusClass = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED" || s === "DONE") return "ww-status-pass";
  if (s === "FAILED" || s === "BLOCKED") return "ww-status-fail";
  if (s === "PARTIAL") return "ww-status-partial";
  if (s === "RUNNING" || s === "QUEUED") return "ww-status-progress";
  return "ww-status-unknown";
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export default function Crawls() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("website_id");

  // ── Websites list (for the name → id picker) ────────────────
  const [websites, setWebsites] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(true);
  const [websitesError, setWebsitesError] = useState("");

  // ── Selected website ─────────────────────────────────────────
  const [websiteId, setWebsiteId] = useState("");

  // ── Crawl history ─────────────────────────────────────────────
  const [crawls, setCrawls] = useState([]);
  const [total, setTotal] = useState(0);
  const [crawlsLoading, setCrawlsLoading] = useState(false);
  const [crawlsError, setCrawlsError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const fetchWebsites = async () => {
      setWebsitesLoading(true);
      setWebsitesError("");
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
        setWebsitesError(err.message || "Unable to connect. Please try again later.");
      } finally {
        setWebsitesLoading(false);
      }
    };
    fetchWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCrawls = async (id) => {
    if (!id) return;
    setCrawlsLoading(true);
    setCrawlsError("");
    try {
      const res = await getWebsiteCrawls(id);
      if (res?.response_code >= 400) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load crawl history.");
      }
      setCrawls(Array.isArray(res?.data?.items) ? res.data.items : []);
      setTotal(res?.data?.total ?? 0);
    } catch (err) {
      setCrawlsError(err.message || "Unable to connect. Please try again later.");
      setCrawls([]);
      setTotal(0);
    } finally {
      setCrawlsLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    if (websiteId) {
      fetchCrawls(websiteId);
    } else {
      setCrawls([]);
      setTotal(0);
      setHasLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  const selectedWebsite = useMemo(
    () => websites.find((w) => String(w.id) === String(websiteId)) || null,
    [websites, websiteId]
  );

  // ── Summary stats ────────────────────────────────────────────
  const completedCount = crawls.filter((c) => (c.status || "").toUpperCase() === "COMPLETED").length;
  const partialCount = crawls.filter((c) => (c.status || "").toUpperCase() === "PARTIAL").length;
  const lastCrawlAt = crawls[0]?.created_at;

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
          <div className="ww-nav-item" onClick={() => navigate("/validate-web?tab=new-website")}>
            <span className="ww-nav-icon">➕</span>
            <span>New Website</span>
          </div>
          <div className="ww-nav-item" onClick={() => navigate("/scan-website")}>
            <span className="ww-nav-icon">🔍</span>
            <span>Scan Website</span>
          </div>
          <div className="ww-nav-item active">
            <span className="ww-nav-icon">🕓</span>
            <span>Crawls</span>
            <span className="ww-nav-dot"></span>
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
              <h1 className="ww-page-title">Crawl History</h1>
              <p className="ww-page-subtitle">
                Review every full-site crawl that has been run for a website.
              </p>
            </div>
            {selectedWebsite && (
              <button
                type="button"
                className="ww-btn-primary"
                onClick={() => navigate(`/scan-website?website_id=${selectedWebsite.id}`)}
              >
                + New Scan
              </button>
            )}
          </div>

          {websitesError && <div className="ww-alert ww-alert-error">{websitesError}</div>}

          <div className="ww-card cw-picker-card">
            <label className="ww-field">
              <span className="ww-field-label">Website *</span>
              <select
                className="ww-input"
                value={websiteId}
                onChange={(e) => setWebsiteId(e.target.value)}
                disabled={websitesLoading}
              >
                <option value="">
                  {websitesLoading ? "Loading websites…" : "Select a website"}
                </option>
                {websites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedWebsite && (
              <div className="cw-selected-info">
                Website ID <strong>#{selectedWebsite.id}</strong> · {selectedWebsite.base_url}
              </div>
            )}
          </div>

          {websiteId && (
            <>
              <div className="ww-kpi-row cw-kpi-row">
                <div className="ww-kpi-card ww-kpi-blue">
                  <div className="ww-kpi-label">Total Crawls</div>
                  <div className="ww-kpi-value">{total}</div>
                  <div className="ww-kpi-sub">Full-site crawl runs</div>
                </div>
                <div className="ww-kpi-card ww-kpi-green">
                  <div className="ww-kpi-label">Completed</div>
                  <div className="ww-kpi-value">{completedCount}</div>
                  <div className="ww-kpi-sub">Finished successfully</div>
                </div>
                <div className="ww-kpi-card ww-kpi-amber">
                  <div className="ww-kpi-label">Partial</div>
                  <div className="ww-kpi-value">{partialCount}</div>
                  <div className="ww-kpi-sub">Some pages still pending</div>
                </div>
                <div className="ww-kpi-card ww-kpi-navy">
                  <div className="ww-kpi-label">Last Crawl</div>
                  <div className="cw-kpi-date">{formatDate(lastCrawlAt)}</div>
                </div>
              </div>

              <div className="ww-card">
                <div className="ww-card-title-row">
                  <span className="ww-card-title">🕓 Crawl Runs</span>
                  <button
                    type="button"
                    className="ww-refresh-btn"
                    onClick={() => fetchCrawls(websiteId)}
                    title="Refresh from server"
                  >
                    🔄
                  </button>
                </div>

                {crawlsError && <div className="ww-alert ww-alert-error">{crawlsError}</div>}

                <div className="ww-table-wrap">
                  {crawlsLoading ? (
                    <div className="ww-empty-state">Loading crawl history…</div>
                  ) : hasLoaded && crawls.length === 0 && !crawlsError ? (
                    <div className="ww-empty-state">
                      No crawls yet. Run a full-site scan from “Scan Website” to see history here.
                    </div>
                  ) : (
                    crawls.length > 0 && (
                      <table className="ww-table">
                        <thead>
                          <tr>
                            <th>Crawl ID</th>
                            <th>Status</th>
                            <th>Discovery Source</th>
                            <th>Pages Discovered</th>
                            <th>Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crawls.map((crawl) => (
                            <tr key={crawl.crawl_id}>
                              <td className="ww-td-name">#{crawl.crawl_id}</td>
                              <td>
                                <span className={`ww-status-badge ${crawlStatusClass(crawl.status)}`}>
                                  {crawl.status}
                                </span>
                              </td>
                              <td>{crawl.discovery_source || "—"}</td>
                              <td>{crawl.pages_discovered ?? "—"}</td>
                              <td>{formatDate(crawl.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}