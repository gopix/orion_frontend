// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { getAllWebsites, scanWebsite } from "../../../services/apiServices";
// import "./ScanWebsite.css";

// const MAX_PAGES_LIMIT = 20;

// export default function ScanWebsite() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const preselectedId = searchParams.get("website_id");

//   // ── Websites list (for the name → id picker) ────────────────
//   const [websites, setWebsites] = useState([]);
//   const [listLoading, setListLoading] = useState(true);
//   const [listError, setListError] = useState("");

//   // ── Form state ───────────────────────────────────────────────
//   const [websiteId, setWebsiteId] = useState("");
//   const [url, setUrl] = useState("");
//   const [allPages, setAllPages] = useState(false);
//   const [maxPages, setMaxPages] = useState(MAX_PAGES_LIMIT);

//   // ── Submit state ─────────────────────────────────────────────
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState("");
//   const [result, setResult] = useState(null);

//   useEffect(() => {
//     const fetchWebsites = async () => {
//       setListLoading(true);
//       setListError("");
//       try {
//         const res = await getAllWebsites();
//         if (res?.response_code >= 400) {
//           throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load websites.");
//         }
//         const data = Array.isArray(res?.data) ? res.data : [];
//         setWebsites(data);

//         if (preselectedId && data.some((w) => String(w.id) === String(preselectedId))) {
//           setWebsiteId(String(preselectedId));
//         }
//       } catch (err) {
//         setListError(err.message || "Unable to connect. Please try again later.");
//       } finally {
//         setListLoading(false);
//       }
//     };
//     fetchWebsites();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const selectedWebsite = useMemo(
//     () => websites.find((w) => String(w.id) === String(websiteId)) || null,
//     [websites, websiteId]
//   );

//   const handleWebsiteChange = (id) => {
//     setWebsiteId(id);
//     const site = websites.find((w) => String(w.id) === String(id));
//     // Default the scan URL to the website's base URL — user can still edit it.
//     setUrl(site?.base_url || "");
//     setResult(null);
//     setSubmitError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitError("");
//     setResult(null);

//     if (!websiteId) {
//       setSubmitError("Please choose a website to scan.");
//       return;
//     }
//     if (!allPages && !url.trim()) {
//       setSubmitError("Please enter a URL to scan.");
//       return;
//     }

//     const payload = allPages
//       ? { all_pages: true, max_pages: Number(maxPages) || MAX_PAGES_LIMIT }
//       : { url: url.trim(), all_pages: false };

//     setSubmitting(true);
//     try {
//       const res = await scanWebsite(websiteId, payload);
//       if (res?.response_code >= 400) {
//         throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to queue scan.");
//       }
//       setResult(res?.data || null);
//     } catch (err) {
//       setSubmitError(err.message || "Unable to connect. Please try again later.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="ww-page">
//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="ww-sidebar">
//         <div className="ww-logo">
//           <div className="ww-logo-mark">O</div>
//           <div className="ww-logo-text">
//             <span>ORION</span>
//             <small>Web Accessibility</small>
//           </div>
//         </div>

//         <nav className="ww-nav">
//           <p className="ww-nav-label">WEB ACCESSIBILITY</p>
//           <div className="ww-nav-item" onClick={() => navigate("/validate-web")}>
//             <span className="ww-nav-icon">📊</span>
//             <span>Dashboard</span>
//           </div>
//           <div
//             className="ww-nav-item"
//             onClick={() => navigate("/validate-web?tab=new-website")}
//           >
//             <span className="ww-nav-icon">➕</span>
//             <span>New Website</span>
//           </div>
//           <div className="ww-nav-item active">
//             <span className="ww-nav-icon">🔍</span>
//             <span>Scan Website</span>
//             <span className="ww-nav-dot"></span>
//           </div>
//         </nav>

//         <div className="ww-sidebar-footer">
//           <div className="ww-user-section">
//             <p className="ww-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="ww-back-btn"
//               onClick={() => navigate("/validate-web")}
//               title="Back to Website Dashboard"
//             >
//               <span className="ww-back-icon">←</span>
//               <span className="ww-back-label">Back</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="ww-main">
//         <div className="ww-container">
//           <div className="ww-header">
//             <div>
//               <h1 className="ww-page-title">Scan Website</h1>
//               <p className="ww-page-subtitle">
//                 Queue an accessibility scan for a registered website — a single page or the entire site.
//               </p>
//             </div>
//           </div>

//           {listError && <div className="ww-alert ww-alert-error">{listError}</div>}

//           <div className="ww-card sw-form-card">
//             <form className="ww-form-grid" onSubmit={handleSubmit}>
//               <label className="ww-field ww-field-wide">
//                 <span className="ww-field-label">Website *</span>
//                 <select
//                   className="ww-input"
//                   value={websiteId}
//                   onChange={(e) => handleWebsiteChange(e.target.value)}
//                   disabled={listLoading}
//                 >
//                   <option value="">
//                     {listLoading ? "Loading websites…" : "Select a website"}
//                   </option>
//                   {websites.map((site) => (
//                     <option key={site.id} value={site.id}>
//                       {site.name}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               {selectedWebsite && (
//                 <div className="ww-field-wide sw-selected-info">
//                   Website ID <strong>#{selectedWebsite.id}</strong> · {selectedWebsite.base_url}
//                 </div>
//               )}

//               <label className="ww-field ww-field-wide">
//                 <span className="ww-field-label">
//                   Scan URL {!allPages && "*"}
//                 </span>
//                 <input
//                   type="text"
//                   className="ww-input"
//                   placeholder="https://www.example.com/page"
//                   value={url}
//                   onChange={(e) => setUrl(e.target.value)}
//                   disabled={allPages}
//                 />
//                 {allPages && (
//                   <span className="sw-field-hint">
//                     Ignored in full-site mode — every discovered page is scanned instead.
//                   </span>
//                 )}
//               </label>

//               <div className="ww-field ww-field-wide">
//                 <span className="ww-field-label">Scan All Pages</span>
//                 <div className="sw-option-grid">
//                   <label className={`sw-option-card${!allPages ? " sw-option-selected" : ""}`}>
//                     <input
//                       type="radio"
//                       name="sw-all-pages"
//                       className="ww-radio"
//                       checked={!allPages}
//                       onChange={() => setAllPages(false)}
//                     />
//                     <span className="sw-option-icon">📄</span>
//                     <span className="sw-option-label">False</span>
//                     <span className="sw-option-desc">Scan only the URL above (home page)</span>
//                   </label>
//                   <label className={`sw-option-card${allPages ? " sw-option-selected" : ""}`}>
//                     <input
//                       type="radio"
//                       name="sw-all-pages"
//                       className="ww-radio"
//                       checked={allPages}
//                       onChange={() => setAllPages(true)}
//                     />
//                     <span className="sw-option-icon">🌐</span>
//                     <span className="sw-option-label">True</span>
//                     <span className="sw-option-desc">Discover and scan the entire website</span>
//                   </label>
//                 </div>
//               </div>

//               {allPages && (
//                 <label className="ww-field">
//                   <span className="ww-field-label">Max Pages (up to {MAX_PAGES_LIMIT})</span>
//                   <input
//                     type="number"
//                     className="ww-input"
//                     min={1}
//                     max={MAX_PAGES_LIMIT}
//                     value={maxPages}
//                     onChange={(e) => {
//                       const val = Number(e.target.value);
//                       if (Number.isNaN(val)) {
//                         setMaxPages("");
//                         return;
//                       }
//                       setMaxPages(Math.min(MAX_PAGES_LIMIT, Math.max(1, val)));
//                     }}
//                   />
//                 </label>
//               )}

//               {submitError && <div className="ww-alert ww-alert-error ww-field-wide">{submitError}</div>}

//               <div className="ww-field-wide ww-form-actions">
//                 <button type="submit" className="ww-btn-primary" disabled={submitting}>
//                   {submitting ? "Queuing Scan…" : "Start Scan"}
//                 </button>
//                 <button
//                   type="button"
//                   className="ww-btn-ghost"
//                   onClick={() => navigate("/validate-web")}
//                   disabled={submitting}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>

//           {result && (
//             <div className="ww-card sw-result-card">
//               <div className="ww-card-title-row">
//                 <span className="ww-card-title">✅ Scan Queued</span>
//               </div>

//               <div className="sw-result-summary">
//                 {result.crawl_id !== undefined && (
//                   <div className="sw-summary-chip">
//                     <span className="sw-summary-label">Crawl ID</span>
//                     <span className="sw-summary-value">#{result.crawl_id}</span>
//                   </div>
//                 )}
//                 {result.scan_id !== undefined && (
//                   <div className="sw-summary-chip">
//                     <span className="sw-summary-label">Scan ID</span>
//                     <span className="sw-summary-value">#{result.scan_id}</span>
//                   </div>
//                 )}
//                 <div className="sw-summary-chip">
//                   <span className="sw-summary-label">Website ID</span>
//                   <span className="sw-summary-value">#{result.website_id ?? websiteId}</span>
//                 </div>
//                 {result.discovery_source && (
//                   <div className="sw-summary-chip">
//                     <span className="sw-summary-label">Discovery Source</span>
//                     <span className="sw-summary-value">{result.discovery_source}</span>
//                   </div>
//                 )}
//                 {result.pages_discovered !== undefined && (
//                   <div className="sw-summary-chip">
//                     <span className="sw-summary-label">Pages Discovered</span>
//                     <span className="sw-summary-value">{result.pages_discovered}</span>
//                   </div>
//                 )}
//               </div>

//               {Array.isArray(result.scans_queued) && result.scans_queued.length > 0 ? (
//                 <div className="ww-table-wrap">
//                   <table className="ww-table">
//                     <thead>
//                       <tr>
//                         <th>Scan ID</th>
//                         <th>URL</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {result.scans_queued.map((scan) => (
//                         <tr key={scan.scan_id}>
//                           <td>#{scan.scan_id}</td>
//                           <td className="ww-td-url">{scan.url}</td>
//                           <td>
//                             <span className="ww-status-badge ww-status-progress">
//                               {scan.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 result.url && (
//                   <div className="ww-table-wrap">
//                     <table className="ww-table">
//                       <thead>
//                         <tr>
//                           <th>Scan ID</th>
//                           <th>URL</th>
//                           <th>Status</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         <tr>
//                           <td>#{result.scan_id}</td>
//                           <td className="ww-td-url">{result.url}</td>
//                           <td>
//                             <span className="ww-status-badge ww-status-progress">
//                               {result.status || "QUEUED"}
//                             </span>
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 )
//               )}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllWebsites, scanWebsite } from "../../../services/apiServices";
import "./ScanWebsite.css";

const MAX_PAGES_LIMIT = 20;

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
                          <td>#{scan.scan_id}</td>
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
                          <td>#{result.scan_id}</td>
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
    </div>
  );
}