



// import { Fragment, useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   createWebsite,
//   getAllWebsites,
//   updateWebsite,
//   deleteWebsite,
//   getWebsiteCrawls,
//   getWebsiteCrawlDetail,
//   scanWebsite,
// } from "../../../services/apiServices";
// import "./ValidateWeb.css";

// const ENVIRONMENTS = ["PRODUCTION", "STAGING", "DEVELOPMENT", "TESTING"];

// // Number of columns in the websites table — used for the inline crawls
// // panel's colSpan so it stretches the full width of the row below it.
// const TABLE_COLUMN_COUNT = 5;

// const EMPTY_CREATE_FORM = {
//   name: "",
//   base_url: "",
//   description: "",
//   environment: "PRODUCTION",
//   crawl_enabled: false,
//   crawl_frequency: "",
//   authentication_required: false,
//   authentication_type: "",
// };

// const formatDate = (value) => {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return value;
//   return d.toLocaleString();
// };

// const crawlStatusClass = (status) => {
//   const s = (status || "").toUpperCase();
//   if (s === "COMPLETED" || s === "DONE") return "ww-status-pass";
//   if (s === "FAILED" || s === "BLOCKED") return "ww-status-fail";
//   if (s === "PARTIAL") return "ww-status-partial";
//   if (s === "RUNNING" || s === "QUEUED") return "ww-status-progress";
//   return "ww-status-unknown";
// };

// const issueSeverityClass = (severity) => {
//   const s = (severity || "").toUpperCase();
//   if (s === "CRITICAL") return "wc-sev-critical";
//   if (s === "SERIOUS" || s === "HIGH") return "wc-sev-serious";
//   if (s === "MODERATE" || s === "MEDIUM") return "wc-sev-moderate";
//   if (s === "MINOR" || s === "LOW") return "wc-sev-minor";
//   return "wc-sev-unknown";
// };

// /* ════════════════════════════════════════════════════════════
//    INLINE WEBSITE CRAWLS PANEL
//    Renders directly inside the dashboard table (as an extra row
//    under the website it belongs to) instead of a modal.
//    Step 1: GET /websites/{website_id}/crawls        → crawl list
//    Step 2: GET /websites/{website_id}/crawls/{id}    → crawl detail
//    ════════════════════════════════════════════════════════════ */
// function WebsiteCrawlsPanel({ website, onClose }) {
//   const [crawls, setCrawls] = useState([]);
//   const [crawlsLoading, setCrawlsLoading] = useState(true);
//   const [crawlsError, setCrawlsError] = useState("");

//   const [selectedCrawlId, setSelectedCrawlId] = useState("");
//   const [crawlDetail, setCrawlDetail] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [detailError, setDetailError] = useState("");

//   // ── Run new crawl ────────────────────────────────────────
//   const [runningCrawl, setRunningCrawl] = useState(false);
//   const [runCrawlError, setRunCrawlError] = useState("");

//   const fetchCrawls = async () => {
//     setCrawlsLoading(true);
//     setCrawlsError("");
//     try {
//       const res = await getWebsiteCrawls(website.id);
//       if (res?.response_code >= 400) {
//         throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load crawls.");
//       }
//       const items = Array.isArray(res?.data?.items) ? res.data.items : [];
//       setCrawls(items);
//     } catch (err) {
//       setCrawlsError(err.message || "Unable to connect. Please try again later.");
//     } finally {
//       setCrawlsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCrawls();
//     setSelectedCrawlId("");
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [website.id]);

//   useEffect(() => {
//     if (!selectedCrawlId) {
//       setCrawlDetail(null);
//       return;
//     }
//     const fetchDetail = async () => {
//       setDetailLoading(true);
//       setDetailError("");
//       try {
//         const res = await getWebsiteCrawlDetail(website.id, selectedCrawlId);
//         if (res?.response_code >= 400) {
//           throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load crawl detail.");
//         }
//         setCrawlDetail(res?.data || null);
//       } catch (err) {
//         setDetailError(err.message || "Unable to connect. Please try again later.");
//         setCrawlDetail(null);
//       } finally {
//         setDetailLoading(false);
//       }
//     };
//     fetchDetail();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCrawlId, website.id]);

//   const pages = Array.isArray(crawlDetail?.pages) ? crawlDetail.pages : [];

//   // Clicking "Review" swaps the panel body over to the detail view, in the
//   // same space the crawl list occupied — it no longer stacks below it.
//   const handleReviewCrawl = (crawlId) => {
//     setSelectedCrawlId(crawlId);
//   };

//   // Arrow button in the detail view returns to the crawl list.
//   const handleBackToList = () => {
//     setSelectedCrawlId("");
//     setCrawlDetail(null);
//     setDetailError("");
//   };

//   const handleRunNewCrawl = async () => {
//     setRunningCrawl(true);
//     setRunCrawlError("");
//     try {
//       const res = await scanWebsite(website.id, { all_pages: true });
//       if (res?.response_code >= 400) {
//         throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to start a new crawl.");
//       }
//       await fetchCrawls();
//     } catch (err) {
//       setRunCrawlError(err.message || "Unable to connect. Please try again later.");
//     } finally {
//       setRunningCrawl(false);
//     }
//   };

//   return (
//     <div className="wc-panel">
//       <div className="wc-panel-header">
//         <span className="wc-panel-title">
//           {selectedCrawlId && (
//             <button
//               type="button"
//               className="wc-back-arrow-btn"
//               onClick={handleBackToList}
//               title="Back to crawls list"
//               aria-label="Back to crawls list"
//             >
//               ←
//             </button>
//           )}
//           Crawls · {website.name}
//         </span>
//         <button type="button" className="wc-panel-close" onClick={onClose} title="Hide">
//           ✕
//         </button>
//       </div>

//       <div className="wc-panel-body">
//         {selectedCrawlId ? (
//           <div className="wc-detail-section">
//             {detailLoading ? (
//               <div className="ww-empty-state">Loading crawl detail…</div>
//             ) : detailError ? (
//               <div className="ww-alert ww-alert-error">{detailError}</div>
//             ) : crawlDetail ? (
//               <>
//                 <div className="wc-summary-row">
//                   <div className="wc-summary-chip">
//                     <span className="wc-summary-label">Status</span>
//                     <span className={`ww-status-badge ${crawlStatusClass(crawlDetail.status)}`}>
//                       {crawlDetail.status || "UNKNOWN"}
//                     </span>
//                   </div>
//                   <div className="wc-summary-chip">
//                     <span className="wc-summary-label">Discovery Source</span>
//                     <span className="wc-summary-value">{crawlDetail.discovery_source || "—"}</span>
//                   </div>
//                   <div className="wc-summary-chip">
//                     <span className="wc-summary-label">Pages Discovered</span>
//                     <span className="wc-summary-value">{crawlDetail.pages_discovered ?? pages.length}</span>
//                   </div>
//                 </div>

//                 <div className="ww-card-title-row wc-pages-title-row">
//                   <span className="ww-card-title">Issues · Crawl #{selectedCrawlId}</span>
//                 </div>

//                 {pages.length === 0 ? (
//                   <div className="ww-empty-state">No pages found for this crawl.</div>
//                 ) : (
//                   <div className="ww-table-wrap">
//                     <table className="ww-table wc-pages-table">
//                       <thead>
//                         <tr>
//                           <th>URL</th>
//                           <th>Status</th>
//                           <th>HTTP Status</th>
//                           <th>Issues</th>
//                           <th>Completed At</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {pages.map((page) => {
//                           const pageIssues = Array.isArray(page.issues) ? page.issues : [];
//                           const visibleIssues = pageIssues.slice(0, 2);
//                           const remainingCount = pageIssues.length - visibleIssues.length;
//                           return (
//                             <tr key={page.id}>
//                               <td className="ww-td-url" title={page.url}>{page.url}</td>
//                               <td>
//                                 <span className={`ww-status-badge ${crawlStatusClass(page.status)}`}>
//                                   {page.status || "—"}
//                                 </span>
//                               </td>
//                               <td>{page.http_status ?? "—"}</td>
//                               <td>
//                                 {pageIssues.length === 0 ? (
//                                   <span className="wc-no-issue-badge">
//                                     <span className="wc-no-issue-dot" aria-hidden="true">✓</span>
//                                     No Issue
//                                   </span>
//                                 ) : (
//                                   <div className="wc-issue-chip-list">
//                                     {visibleIssues.map((issue, idx) => (
//                                       <span
//                                         key={issue.id ?? `${page.id}-issue-${idx}`}
//                                         className={`wc-issue-chip ${issueSeverityClass(issue.severity)}`}
//                                         title={issue.message || issue.description || issue.rule_code || "Accessibility issue"}
//                                       >
//                                         {issue.rule_code || issue.severity || "Issue"}
//                                       </span>
//                                     ))}
//                                     {remainingCount > 0 && (
//                                       <span className="wc-issue-chip wc-issue-chip-more">
//                                         +{remainingCount} more
//                                       </span>
//                                     )}
//                                   </div>
//                                 )}
//                               </td>
//                               <td>{formatDate(page.completed_at)}</td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </>
//             ) : null}
//           </div>
//         ) : (
//           <>
//             <div className="wc-list-toolbar">
//               {runCrawlError && <div className="ww-alert ww-alert-error wc-run-crawl-alert">{runCrawlError}</div>}
//               <button
//                 type="button"
//                 className="wc-run-crawl-btn"
//                 onClick={handleRunNewCrawl}
//                 disabled={runningCrawl}
//               >
//                 <span className="wc-run-crawl-icon" aria-hidden="true">⟳</span>
//                 {runningCrawl ? "Starting Crawl…" : "Run New Crawl"}
//               </button>
//             </div>

//             {crawlsLoading ? (
//               <div className="ww-empty-state">Loading crawls…</div>
//             ) : crawlsError ? (
//               <div className="ww-alert ww-alert-error">{crawlsError}</div>
//             ) : crawls.length === 0 ? (
//               <div className="ww-empty-state">
//                 No crawls yet for this website. Run a new crawl to see history here.
//               </div>
//             ) : (
//               <div className="ww-table-wrap">
//                 <table className="ww-table wc-crawls-table">
//                   <thead>
//                     <tr>
//                       <th>Crawl ID</th>
//                       <th>Execution Time</th>
//                       <th>Status</th>
//                       <th>Review</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {crawls.map((crawl) => (
//                       <tr key={crawl.crawl_id}>
//                         <td>
//                           <span className="wc-crawl-id-badge">#{crawl.crawl_id}</span>
//                         </td>
//                         <td>{formatDate(crawl.created_at)}</td>
//                         <td>
//                           <span className={`ww-status-badge ${crawlStatusClass(crawl.status)}`}>
//                             {crawl.status || "UNKNOWN"}
//                           </span>
//                         </td>
//                         <td>
//                           <button
//                             type="button"
//                             className="wc-review-btn"
//                             onClick={() => handleReviewCrawl(crawl.crawl_id)}
//                           >
//                             Review
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════════════
//    EDIT WEBSITE MODAL
//    ════════════════════════════════════════════════════════════ */
// function EditWebsiteModal({ website, onClose, onSave, saving, error }) {
//   const [form, setForm] = useState({
//     name: website.name || "",
//     base_url: website.base_url || "",
//     description: website.description || "",
//     accessibility_status: website.accessibility_status || "",
//     environment: website.environment || "PRODUCTION",
//     crawl_enabled: !!website.crawl_enabled,
//     crawl_frequency: website.crawl_frequency || "",
//     authentication_required: !!website.authentication_required,
//     authentication_type: website.authentication_type || "",
//   });

//   const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.name.trim() || !form.base_url.trim()) return;
//     onSave({
//       name: form.name.trim(),
//       base_url: form.base_url.trim(),
//       description: form.description.trim(),
//       accessibility_status: form.accessibility_status.trim(),
//       environment: form.environment,
//       crawl_enabled: form.crawl_enabled,
//       crawl_frequency: form.crawl_frequency.trim(),
//       authentication_required: form.authentication_required,
//       authentication_type: form.authentication_required ? form.authentication_type.trim() : "",
//     });
//   };

//   return (
//     <div className="ww-modal-overlay" onClick={onClose}>
//       <div className="ww-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="ww-modal-header">
//           <h3>Edit Website</h3>
//           <button type="button" className="ww-modal-close" onClick={onClose}>✕</button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="ww-modal-form-grid">
//             <label className="ww-field">
//               <span className="ww-field-label">Name *</span>
//               <input
//                 type="text"
//                 className="ww-input"
//                 value={form.name}
//                 onChange={(e) => updateField("name", e.target.value)}
//               />
//             </label>

//             <label className="ww-field">
//               <span className="ww-field-label">Base URL *</span>
//               <input
//                 type="text"
//                 className="ww-input"
//                 value={form.base_url}
//                 onChange={(e) => updateField("base_url", e.target.value)}
//               />
//             </label>

//             <label className="ww-field ww-field-wide">
//               <span className="ww-field-label">Description</span>
//               <textarea
//                 className="ww-input ww-textarea"
//                 value={form.description}
//                 onChange={(e) => updateField("description", e.target.value)}
//               />
//             </label>

//             <label className="ww-field">
//               <span className="ww-field-label">Accessibility Status</span>
//               <input
//                 type="text"
//                 className="ww-input"
//                 placeholder="e.g. UNKNOWN, PASS, FAIL"
//                 value={form.accessibility_status}
//                 onChange={(e) => updateField("accessibility_status", e.target.value)}
//               />
//             </label>

//             <label className="ww-field">
//               <span className="ww-field-label">Environment</span>
//               <select
//                 className="ww-input"
//                 value={form.environment}
//                 onChange={(e) => updateField("environment", e.target.value)}
//               >
//                 {ENVIRONMENTS.map((env) => (
//                   <option key={env} value={env}>{env}</option>
//                 ))}
//               </select>
//             </label>

//             <label className="ww-field">
//               <span className="ww-field-label">Crawl Frequency</span>
//               <input
//                 type="text"
//                 className="ww-input"
//                 value={form.crawl_frequency}
//                 onChange={(e) => updateField("crawl_frequency", e.target.value)}
//               />
//             </label>

//             <label className="ww-checkbox-field">
//               <input
//                 type="checkbox"
//                 checked={form.crawl_enabled}
//                 onChange={(e) => updateField("crawl_enabled", e.target.checked)}
//               />
//               <span>Enable crawling</span>
//             </label>

//             <label className="ww-checkbox-field">
//               <input
//                 type="checkbox"
//                 checked={form.authentication_required}
//                 onChange={(e) => updateField("authentication_required", e.target.checked)}
//               />
//               <span>Requires authentication</span>
//             </label>

//             {form.authentication_required && (
//               <label className="ww-field">
//                 <span className="ww-field-label">Authentication Type</span>
//                 <input
//                   type="text"
//                   className="ww-input"
//                   value={form.authentication_type}
//                   onChange={(e) => updateField("authentication_type", e.target.value)}
//                 />
//               </label>
//             )}
//           </div>

//           {error && <div className="ww-alert ww-alert-error">{error}</div>}

//           <div className="ww-modal-actions">
//             <button type="button" className="ww-btn-ghost" onClick={onClose} disabled={saving}>
//               Cancel
//             </button>
//             <button type="submit" className="ww-btn-primary" disabled={saving}>
//               {saving ? "Saving…" : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════════════
//    MAIN PAGE
//    ════════════════════════════════════════════════════════════ */
// export default function ValidateWeb() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get("tab") === "new-website" ? "new-website" : "dashboard"
//   );

//   // ── Website list ──────────────────────────────────────────
//   const [websites, setWebsites] = useState([]);
//   const [listLoading, setListLoading] = useState(true);
//   const [listError, setListError] = useState("");

//   // ── Create form ───────────────────────────────────────────
//   const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
//   const [creating, setCreating] = useState(false);
//   const [createError, setCreateError] = useState("");
//   const [createSuccess, setCreateSuccess] = useState("");

//   // ── Edit / Delete ─────────────────────────────────────────
//   const [editingWebsite, setEditingWebsite] = useState(null);
//   const [savingEdit, setSavingEdit] = useState(false);
//   const [editError, setEditError] = useState("");
//   const [deletingId, setDeletingId] = useState(null);

//   // ── Inline crawls panel ───────────────────────────────────
//   // Holds the id of the website whose crawls row is currently expanded.
//   // Only one row can be expanded at a time; the panel renders directly
//   // under that website's row, in-line, before the next website's row.
//   const [expandedCrawlsId, setExpandedCrawlsId] = useState(null);

//   const fetchWebsites = async () => {
//     setListLoading(true);
//     setListError("");
//     try {
//       const res = await getAllWebsites();
//       if (res?.response_code >= 400) {
//         throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load websites.");
//       }
//       setWebsites(Array.isArray(res?.data) ? res.data : []);
//     } catch (err) {
//       setListError(err.message || "Unable to connect. Please try again later.");
//     } finally {
//       setListLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWebsites();
//   }, []);

//   const handleCreateChange = (field, value) => {
//     setCreateForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleCreateSubmit = async (e) => {
//     e.preventDefault();
//     setCreateError("");
//     setCreateSuccess("");

//     if (!createForm.name.trim() || !createForm.base_url.trim()) {
//       setCreateError("Name and Base URL are required.");
//       return;
//     }

//     setCreating(true);
//     try {
//       const payload = {
//         name: createForm.name.trim(),
//         base_url: createForm.base_url.trim(),
//         description: createForm.description.trim(),
//         environment: createForm.environment,
//         crawl_enabled: createForm.crawl_enabled,
//         crawl_frequency: createForm.crawl_frequency.trim(),
//         authentication_required: createForm.authentication_required,
//         authentication_type: createForm.authentication_required
//           ? createForm.authentication_type.trim()
//           : "",
//       };
//       const res = await createWebsite(payload);
//       if (res?.response_code >= 400 || !res?.data) {
//         throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to register website.");
//       }
//       setWebsites((prev) => [res.data, ...prev]);
//       setCreateForm(EMPTY_CREATE_FORM);
//       setCreateSuccess(`"${res.data.name}" was registered successfully.`);
//       setActiveTab("dashboard");
//     } catch (err) {
//       setCreateError(err.message || "Unable to connect. Please try again later.");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleEditSave = async (payload) => {
//     if (!editingWebsite) return;
//     setSavingEdit(true);
//     setEditError("");
//     try {
//       const res = await updateWebsite(editingWebsite.id, payload);
//       if (res?.response_code >= 400 || !res?.data) {
//         throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to update website.");
//       }
//       setWebsites((prev) => prev.map((w) => (w.id === res.data.id ? res.data : w)));
//       setEditingWebsite(null);
//     } catch (err) {
//       setEditError(err.message || "Unable to connect. Please try again later.");
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   const handleDeleteWebsite = async (website) => {
//     const confirmed = window.confirm(`Delete "${website.name}"? This cannot be undone.`);
//     if (!confirmed) return;
//     setDeletingId(website.id);
//     setListError("");
//     try {
//       const res = await deleteWebsite(website.id);
//       if (res?.response_code >= 400) {
//         throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to delete website.");
//       }
//       setWebsites((prev) => prev.filter((w) => w.id !== website.id));
//       if (expandedCrawlsId === website.id) setExpandedCrawlsId(null);
//     } catch (err) {
//       setListError(err.message || "Failed to delete the website. Please try again.");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const toggleCrawlsRow = (websiteId) => {
//     setExpandedCrawlsId((prev) => (prev === websiteId ? null : websiteId));
//   };

//   // ── Dashboard stats ───────────────────────────────────────
//   const totalWebsites = websites.length;
//   const runningWebsites = websites.filter((w) => w.crawl_enabled).length;
//   const scansCompleted = websites.filter((w) =>
//     ["done", "pass", "passed"].includes((w.accessibility_status || "").toLowerCase())
//   ).length;
//   const productionSites = websites.filter((w) => w.environment === "PRODUCTION").length;

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
//           <div
//             className={`ww-nav-item${activeTab === "dashboard" ? " active" : ""}`}
//             onClick={() => setActiveTab("dashboard")}
//           >
//             <span className="ww-nav-icon">📊</span>
//             <span>Dashboard</span>
//             {activeTab === "dashboard" && <span className="ww-nav-dot"></span>}
//           </div>
//           <div
//             className={`ww-nav-item${activeTab === "new-website" ? " active" : ""}`}
//             onClick={() => {
//               setCreateError("");
//               setCreateSuccess("");
//               setActiveTab("new-website");
//             }}
//           >
//             <span className="ww-nav-icon">➕</span>
//             <span>New Website</span>
//             {activeTab === "new-website" && <span className="ww-nav-dot"></span>}
//           </div>
//           <div
//             className="ww-nav-item"
//             onClick={() => navigate("/scan-website")}
//           >
//             <span className="ww-nav-icon">🔍</span>
//             <span>Scan Website</span>
//           </div>
//           <div
//             className="ww-nav-item"
//             onClick={() => navigate("/crawls")}
//           >
//             <span className="ww-nav-icon">🕓</span>
//             <span>Crawls</span>
//           </div>
//         </nav>

//         <div className="ww-sidebar-footer">
//           <div className="ww-user-section">
//             <p className="ww-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="ww-back-btn"
//               onClick={() => navigate("/accessibility")}
//               title="Back to Accessibility"
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
//           {activeTab === "dashboard" ? (
//             <>
//               <div className="ww-header">
//                 <div>
//                   <h1 className="ww-page-title">Website Accessibility Dashboard</h1>
//                   <p className="ww-page-subtitle">
//                     Real-time visibility into every website registered for accessibility scanning.
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   className="ww-btn-primary"
//                   onClick={() => {
//                     setCreateError("");
//                     setCreateSuccess("");
//                     setActiveTab("new-website");
//                   }}
//                 >
//                   + New Website
//                 </button>
//               </div>

//               {createSuccess && <div className="ww-alert ww-alert-success">{createSuccess}</div>}

//               <div className="ww-kpi-row">
//                 <div className="ww-kpi-card ww-kpi-blue">
//                   <div className="ww-kpi-label">Total Websites</div>
//                   <div className="ww-kpi-value">{totalWebsites}</div>
//                 </div>
//                 <div className="ww-kpi-card ww-kpi-green">
//                   <div className="ww-kpi-label">Currently Running</div>
//                   <div className="ww-kpi-value">{runningWebsites}</div>
//                 </div>
//                 <div className="ww-kpi-card ww-kpi-amber">
//                   <div className="ww-kpi-label">Scans Completed</div>
//                   <div className="ww-kpi-value">{scansCompleted}</div>
//                 </div>
//                 <div className="ww-kpi-card ww-kpi-navy">
//                   <div className="ww-kpi-label">Production Sites</div>
//                   <div className="ww-kpi-value">{productionSites}</div>
//                 </div>
//               </div>

//               <div className="ww-card">
//                 <div className="ww-card-title-row">
//                   <span className="ww-card-title">🌐 Registered Websites</span>
//                   <button
//                     type="button"
//                     className="ww-refresh-btn"
//                     onClick={fetchWebsites}
//                     title="Refresh from server"
//                   >
//                     🔄
//                   </button>
//                 </div>

//                 {listError && <div className="ww-alert ww-alert-error">{listError}</div>}

//                 <div className="ww-table-wrap">
//                   {listLoading ? (
//                     <div className="ww-empty-state">Loading websites…</div>
//                   ) : websites.length === 0 ? (
//                     <div className="ww-empty-state">
//                       No websites registered yet. Click “New Website” to add one.
//                     </div>
//                   ) : (
//                     <table className="ww-table">
//                       <thead>
//                         <tr>
//                           <th>Name</th>
//                           <th>Base URL</th>
//                           <th>Environment</th>
//                           <th>Crawl</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {websites.map((site) => (
//                           <Fragment key={site.id}>
//                             <tr>
//                               <td className="ww-td-name">{site.name}</td>
//                               <td className="ww-td-url">{site.base_url}</td>
//                               <td>{site.environment}</td>
//                               <td>
//                                 <span className={`ww-crawl-chip ${site.crawl_enabled ? "on" : "off"}`}>
//                                   {site.crawl_enabled ? "Enabled" : "Disabled"}
//                                 </span>
//                               </td>
//                               <td>
//                                 <div className="ww-row-actions">
//                                   <button
//                                     type="button"
//                                     className={`ww-icon-btn${expandedCrawlsId === site.id ? " active" : ""}`}
//                                     title="View crawls"
//                                     aria-label="View crawls"
//                                     onClick={() => toggleCrawlsRow(site.id)}
//                                   >
//                                     🕓
//                                   </button>
//                                   <button
//                                     type="button"
//                                     className="ww-icon-btn"
//                                     title="Edit website"
//                                     aria-label="Edit website"
//                                     onClick={() => {
//                                       setEditError("");
//                                       setEditingWebsite(site);
//                                     }}
//                                   >
//                                     ✏️
//                                   </button>
//                                   <button
//                                     type="button"
//                                     className="ww-icon-btn"
//                                     title="Delete website"
//                                     aria-label="Delete website"
//                                     disabled={deletingId === site.id}
//                                     onClick={() => handleDeleteWebsite(site)}
//                                   >
//                                     {deletingId === site.id ? "…" : "🗑️"}
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                             {expandedCrawlsId === site.id && (
//                               <tr className="wc-inline-row">
//                                 <td colSpan={TABLE_COLUMN_COUNT}>
//                                   <WebsiteCrawlsPanel
//                                     website={site}
//                                     onClose={() => setExpandedCrawlsId(null)}
//                                   />
//                                 </td>
//                               </tr>
//                             )}
//                           </Fragment>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="ww-header">
//                 <div>
//                   <h1 className="ww-page-title">Register a Website</h1>
//                   <p className="ww-page-subtitle">
//                     Add a website so it can be scanned for accessibility issues.
//                   </p>
//                 </div>
//               </div>

//               <div className="ww-card ww-create-card">
//                 <form className="ww-form-grid" onSubmit={handleCreateSubmit}>
//                   <label className="ww-field">
//                     <span className="ww-field-label">Name *</span>
//                     <input
//                       type="text"
//                       className="ww-input"
//                       placeholder="e.g. Bajaj"
//                       value={createForm.name}
//                       onChange={(e) => handleCreateChange("name", e.target.value)}
//                     />
//                   </label>

//                   <label className="ww-field">
//                     <span className="ww-field-label">Base URL *</span>
//                     <input
//                       type="text"
//                       className="ww-input"
//                       placeholder="https://www.example.com"
//                       value={createForm.base_url}
//                       onChange={(e) => handleCreateChange("base_url", e.target.value)}
//                     />
//                   </label>

//                   <label className="ww-field ww-field-wide">
//                     <span className="ww-field-label">Description</span>
//                     <textarea
//                       className="ww-input ww-textarea"
//                       placeholder="What is this website used for?"
//                       value={createForm.description}
//                       onChange={(e) => handleCreateChange("description", e.target.value)}
//                     />
//                   </label>

//                   <label className="ww-field">
//                     <span className="ww-field-label">Environment</span>
//                     <select
//                       className="ww-input"
//                       value={createForm.environment}
//                       onChange={(e) => handleCreateChange("environment", e.target.value)}
//                     >
//                       {ENVIRONMENTS.map((env) => (
//                         <option key={env} value={env}>{env}</option>
//                       ))}
//                     </select>
//                   </label>

//                   <label className="ww-field">
//                     <span className="ww-field-label">Crawl Frequency</span>
//                     <input
//                       type="text"
//                       className="ww-input"
//                       placeholder="e.g. daily, weekly"
//                       value={createForm.crawl_frequency}
//                       onChange={(e) => handleCreateChange("crawl_frequency", e.target.value)}
//                     />
//                   </label>

//                   <label className="ww-checkbox-field">
//                     <input
//                       type="checkbox"
//                       checked={createForm.crawl_enabled}
//                       onChange={(e) => handleCreateChange("crawl_enabled", e.target.checked)}
//                     />
//                     <span>Enable crawling</span>
//                   </label>

//                   <label className="ww-checkbox-field">
//                     <input
//                       type="checkbox"
//                       checked={createForm.authentication_required}
//                       onChange={(e) => handleCreateChange("authentication_required", e.target.checked)}
//                     />
//                     <span>Requires authentication</span>
//                   </label>

//                   {createForm.authentication_required && (
//                     <label className="ww-field">
//                       <span className="ww-field-label">Authentication Type</span>
//                       <input
//                         type="text"
//                         className="ww-input"
//                         placeholder="e.g. password, oauth"
//                         value={createForm.authentication_type}
//                         onChange={(e) => handleCreateChange("authentication_type", e.target.value)}
//                       />
//                     </label>
//                   )}

//                   {createError && <div className="ww-alert ww-alert-error ww-field-wide">{createError}</div>}

//                   <div className="ww-field-wide ww-form-actions">
//                     <button type="submit" className="ww-btn-primary" disabled={creating}>
//                       {creating ? "Registering…" : "Register Website"}
//                     </button>
//                     <button
//                       type="button"
//                       className="ww-btn-ghost"
//                       onClick={() => setActiveTab("dashboard")}
//                       disabled={creating}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </>
//           )}
//         </div>
//       </main>

//       {editingWebsite && (
//         <EditWebsiteModal
//           website={editingWebsite}
//           onClose={() => {
//             setEditingWebsite(null);
//             setEditError("");
//           }}
//           onSave={handleEditSave}
//           saving={savingEdit}
//           error={editError}
//         />
//       )}
//     </div>
//   );
// }

import { Fragment, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createWebsite,
  getAllWebsites,
  updateWebsite,
  deleteWebsite,
  getWebsiteCrawls,
  getWebsiteCrawlDetail,
  scanWebsite,
} from "../../../services/apiServices";
import "./ValidateWeb.css";

const ENVIRONMENTS = ["PRODUCTION", "STAGING", "DEVELOPMENT", "TESTING"];

// Number of columns in the websites table — used for the inline crawls
// panel's colSpan so it stretches the full width of the row below it.
const TABLE_COLUMN_COUNT = 5;

// Number of columns in the crawl-detail pages table — used as the colSpan of
// the expanded issue-details row so it stretches the full table width.
const PAGES_TABLE_COLUMN_COUNT = 5;

const EMPTY_CREATE_FORM = {
  name: "",
  base_url: "",
  description: "",
  environment: "PRODUCTION",
  crawl_enabled: false,
  crawl_frequency: "",
  authentication_required: false,
  authentication_type: "",
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const crawlStatusClass = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED" || s === "DONE") return "ww-status-pass";
  if (s === "FAILED" || s === "BLOCKED") return "ww-status-fail";
  if (s === "PARTIAL") return "ww-status-partial";
  if (s === "RUNNING" || s === "QUEUED") return "ww-status-progress";
  return "ww-status-unknown";
};

const issueSeverityClass = (severity) => {
  const s = (severity || "").toUpperCase();
  if (s === "CRITICAL") return "wc-sev-critical";
  if (s === "SERIOUS" || s === "HIGH") return "wc-sev-serious";
  if (s === "MODERATE" || s === "MEDIUM") return "wc-sev-moderate";
  if (s === "MINOR" || s === "LOW") return "wc-sev-minor";
  return "wc-sev-unknown";
};

const issueStatusClass = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "RESOLVED" || s === "FIXED" || s === "CLOSED") return "ww-status-pass";
  if (s === "OPEN") return "ww-status-fail";
  if (s === "IN_PROGRESS") return "ww-status-progress";
  return "ww-status-unknown";
};

/* ════════════════════════════════════════════════════════════
   ISSUE DETAIL CARD
   Full breakdown of a single accessibility issue as returned by
   GET /websites/{id}/crawls/{crawl_id} → pages[].issues[].
   ════════════════════════════════════════════════════════════ */
function IssueDetailCard({ issue, index }) {
  const wcag = [issue.wcag_criterion, issue.wcag_level && `Level ${issue.wcag_level}`]
    .filter(Boolean)
    .join(" · ");

  const meta = [
    { label: "Category", value: issue.category },
    { label: "WCAG", value: wcag },
    { label: "Times Seen", value: issue.times_seen },
    { label: "Issue ID", value: issue.id !== undefined ? `#${issue.id}` : "" },
    { label: "Scan ID", value: issue.scan_id !== undefined ? `#${issue.scan_id}` : "" },
    {
      label: "Last Seen In Scan",
      value:
        issue.last_seen_scan_id !== undefined && issue.last_seen_scan_id !== null
          ? `#${issue.last_seen_scan_id}`
          : "",
    },
    { label: "Resolved At", value: issue.resolved_at ? formatDate(issue.resolved_at) : "" },
    {
      label: "Resolved In Scan",
      value:
        issue.resolved_in_scan_id !== undefined && issue.resolved_in_scan_id !== null
          ? `#${issue.resolved_in_scan_id}`
          : "",
    },
  ].filter((m) => m.value !== undefined && m.value !== null && m.value !== "");

  return (
    <div className="wc-issue-detail">
      <div className="wc-issue-detail-head">
        <span className="wc-issue-index">#{index + 1}</span>
        <span className={`wc-issue-chip ${issueSeverityClass(issue.severity)}`}>
          {issue.severity || "UNKNOWN"}
        </span>
        <span className="wc-issue-rule">{issue.rule_code || "—"}</span>
        {issue.status && (
          <span className={`ww-status-badge ${issueStatusClass(issue.status)}`}>
            {issue.status}
          </span>
        )}
      </div>

      {issue.rule_name && <p className="wc-issue-rule-name">{issue.rule_name}</p>}

      {issue.message && <p className="wc-issue-message">{issue.message}</p>}

      {issue.element_selector && (
        <div className="wc-issue-block">
          <span className="wc-issue-block-label">Element Selector</span>
          <code className="wc-issue-code">{issue.element_selector}</code>
        </div>
      )}

      {issue.html_snippet && (
        <div className="wc-issue-block">
          <span className="wc-issue-block-label">HTML Snippet</span>
          <code className="wc-issue-code">{issue.html_snippet}</code>
        </div>
      )}

      {meta.length > 0 && (
        <div className="wc-issue-meta-row">
          {meta.map((m) => (
            <div className="wc-issue-meta" key={m.label}>
              <span className="wc-issue-meta-label">{m.label}</span>
              <span className="wc-issue-meta-value">{String(m.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   INLINE WEBSITE CRAWLS PANEL
   Renders directly inside the dashboard table (as an extra row
   under the website it belongs to) instead of a modal.
   Step 1: GET /websites/{website_id}/crawls        → crawl list
   Step 2: GET /websites/{website_id}/crawls/{id}    → crawl detail
   ════════════════════════════════════════════════════════════ */
function WebsiteCrawlsPanel({ website, onClose }) {
  const [crawls, setCrawls] = useState([]);
  const [crawlsLoading, setCrawlsLoading] = useState(true);
  const [crawlsError, setCrawlsError] = useState("");

  const [selectedCrawlId, setSelectedCrawlId] = useState("");
  const [crawlDetail, setCrawlDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // ── Run new crawl ────────────────────────────────────────
  const [runningCrawl, setRunningCrawl] = useState(false);
  const [runCrawlError, setRunCrawlError] = useState("");

  // Id of the page whose full issue details are currently expanded.
  const [expandedPageId, setExpandedPageId] = useState(null);

  const fetchCrawls = async () => {
    setCrawlsLoading(true);
    setCrawlsError("");
    try {
      const res = await getWebsiteCrawls(website.id);
      if (res?.response_code >= 400) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load crawls.");
      }
      const items = Array.isArray(res?.data?.items) ? res.data.items : [];
      setCrawls(items);
    } catch (err) {
      setCrawlsError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setCrawlsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawls();
    setSelectedCrawlId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website.id]);

  useEffect(() => {
    if (!selectedCrawlId) {
      setCrawlDetail(null);
      return;
    }
    const fetchDetail = async () => {
      setDetailLoading(true);
      setDetailError("");
      try {
        const res = await getWebsiteCrawlDetail(website.id, selectedCrawlId);
        if (res?.response_code >= 400) {
          throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load crawl detail.");
        }
        setCrawlDetail(res?.data || null);
      } catch (err) {
        setDetailError(err.message || "Unable to connect. Please try again later.");
        setCrawlDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrawlId, website.id]);

  const pages = Array.isArray(crawlDetail?.pages) ? crawlDetail.pages : [];

  // Clicking "Review" swaps the panel body over to the detail view, in the
  // same space the crawl list occupied — it no longer stacks below it.
  const handleReviewCrawl = (crawlId) => {
    setExpandedPageId(null);
    setSelectedCrawlId(crawlId);
  };

  // Arrow button in the detail view returns to the crawl list.
  const handleBackToList = () => {
    setSelectedCrawlId("");
    setCrawlDetail(null);
    setDetailError("");
    setExpandedPageId(null);
  };

  // Expands / collapses the full issue breakdown for a single page.
  const togglePageIssues = (pageId) => {
    setExpandedPageId((prev) => (prev === pageId ? null : pageId));
  };

  const handleRunNewCrawl = async () => {
    setRunningCrawl(true);
    setRunCrawlError("");
    try {
      const res = await scanWebsite(website.id, { all_pages: true });
      if (res?.response_code >= 400) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to start a new crawl.");
      }
      await fetchCrawls();
    } catch (err) {
      setRunCrawlError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setRunningCrawl(false);
    }
  };

  return (
    <div className="wc-panel">
      <div className="wc-panel-header">
        <span className="wc-panel-title">
          {selectedCrawlId && (
            <button
              type="button"
              className="wc-back-arrow-btn"
              onClick={handleBackToList}
              title="Back to crawls list"
              aria-label="Back to crawls list"
            >
              ←
            </button>
          )}
          Crawls · {website.name}
        </span>
        <button type="button" className="wc-panel-close" onClick={onClose} title="Hide">
          ✕
        </button>
      </div>

      <div className="wc-panel-body">
        {selectedCrawlId ? (
          <div className="wc-detail-section">
            {detailLoading ? (
              <div className="ww-empty-state">Loading crawl detail…</div>
            ) : detailError ? (
              <div className="ww-alert ww-alert-error">{detailError}</div>
            ) : crawlDetail ? (
              <>
                <div className="wc-summary-row">
                  <div className="wc-summary-chip">
                    <span className="wc-summary-label">Status</span>
                    <span className={`ww-status-badge ${crawlStatusClass(crawlDetail.status)}`}>
                      {crawlDetail.status || "UNKNOWN"}
                    </span>
                  </div>
                  <div className="wc-summary-chip">
                    <span className="wc-summary-label">Discovery Source</span>
                    <span className="wc-summary-value">{crawlDetail.discovery_source || "—"}</span>
                  </div>
                  <div className="wc-summary-chip">
                    <span className="wc-summary-label">Pages Discovered</span>
                    <span className="wc-summary-value">{crawlDetail.pages_discovered ?? pages.length}</span>
                  </div>
                </div>

                <div className="ww-card-title-row wc-pages-title-row">
                  <span className="ww-card-title">Issues · Crawl #{selectedCrawlId}</span>
                </div>

                {pages.length === 0 ? (
                  <div className="ww-empty-state">No pages found for this crawl.</div>
                ) : (
                  <div className="ww-table-wrap">
                    <table className="ww-table wc-pages-table">
                      <thead>
                        <tr>
                          <th>URL</th>
                          <th>Status</th>
                          <th>HTTP Status</th>
                          <th>Issues</th>
                          <th>Completed At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pages.map((page) => {
                          const pageIssues = Array.isArray(page.issues) ? page.issues : [];
                          const isExpanded = expandedPageId === page.id;
                          return (
                            <Fragment key={page.id}>
                              <tr>
                                <td className="ww-td-url" title={page.url}>{page.url}</td>
                                <td>
                                  <span className={`ww-status-badge ${crawlStatusClass(page.status)}`}>
                                    {page.status || "—"}
                                  </span>
                                </td>
                                <td>{page.http_status ?? "—"}</td>
                                <td>
                                  {pageIssues.length === 0 ? (
                                    <span className="wc-no-issue-badge">
                                      <span className="wc-no-issue-dot" aria-hidden="true">✓</span>
                                      No Issue
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className={`wc-issue-toggle${isExpanded ? " active" : ""}`}
                                      onClick={() => togglePageIssues(page.id)}
                                      aria-expanded={isExpanded}
                                    >
                                      <span className="wc-issue-count">
                                        {pageIssues.length} {pageIssues.length === 1 ? "Issue" : "Issues"}
                                      </span>
                                      <span className="wc-issue-toggle-caret" aria-hidden="true">
                                        {isExpanded ? "▴" : "▾"}
                                      </span>
                                    </button>
                                  )}
                                </td>
                                <td>{formatDate(page.completed_at)}</td>
                              </tr>

                              {isExpanded && pageIssues.length > 0 && (
                                <tr className="wc-issue-detail-row">
                                  <td colSpan={PAGES_TABLE_COLUMN_COUNT}>
                                    <div className="wc-issue-detail-list">
                                      {pageIssues.map((issue, idx) => (
                                        <IssueDetailCard
                                          key={issue.id ?? `${page.id}-issue-${idx}`}
                                          issue={issue}
                                          index={idx}
                                        />
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <>
            <div className="wc-list-toolbar">
              {runCrawlError && <div className="ww-alert ww-alert-error wc-run-crawl-alert">{runCrawlError}</div>}
              <button
                type="button"
                className="wc-run-crawl-btn"
                onClick={handleRunNewCrawl}
                disabled={runningCrawl}
              >
                <span className="wc-run-crawl-icon" aria-hidden="true">⟳</span>
                {runningCrawl ? "Starting Crawl…" : "Run New Crawl"}
              </button>
            </div>

            {crawlsLoading ? (
              <div className="ww-empty-state">Loading crawls…</div>
            ) : crawlsError ? (
              <div className="ww-alert ww-alert-error">{crawlsError}</div>
            ) : crawls.length === 0 ? (
              <div className="ww-empty-state">
                No crawls yet for this website. Run a new crawl to see history here.
              </div>
            ) : (
              <div className="ww-table-wrap">
                <table className="ww-table wc-crawls-table">
                  <thead>
                    <tr>
                      <th>Crawl ID</th>
                      <th>Execution Time</th>
                      <th>Status</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crawls.map((crawl) => (
                      <tr key={crawl.crawl_id}>
                        <td>
                          <span className="wc-crawl-id-badge">#{crawl.crawl_id}</span>
                        </td>
                        <td>{formatDate(crawl.created_at)}</td>
                        <td>
                          <span className={`ww-status-badge ${crawlStatusClass(crawl.status)}`}>
                            {crawl.status || "UNKNOWN"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="wc-review-btn"
                            onClick={() => handleReviewCrawl(crawl.crawl_id)}
                          >
                            Review
                          </button>
                        </td>
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

/* ════════════════════════════════════════════════════════════
   EDIT WEBSITE MODAL
   ════════════════════════════════════════════════════════════ */
function EditWebsiteModal({ website, onClose, onSave, saving, error }) {
  const [form, setForm] = useState({
    name: website.name || "",
    base_url: website.base_url || "",
    description: website.description || "",
    accessibility_status: website.accessibility_status || "",
    environment: website.environment || "PRODUCTION",
    crawl_enabled: !!website.crawl_enabled,
    crawl_frequency: website.crawl_frequency || "",
    authentication_required: !!website.authentication_required,
    authentication_type: website.authentication_type || "",
  });

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.base_url.trim()) return;
    onSave({
      name: form.name.trim(),
      base_url: form.base_url.trim(),
      description: form.description.trim(),
      accessibility_status: form.accessibility_status.trim(),
      environment: form.environment,
      crawl_enabled: form.crawl_enabled,
      crawl_frequency: form.crawl_frequency.trim(),
      authentication_required: form.authentication_required,
      authentication_type: form.authentication_required ? form.authentication_type.trim() : "",
    });
  };

  return (
    <div className="ww-modal-overlay" onClick={onClose}>
      <div className="ww-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ww-modal-header">
          <h3>Edit Website</h3>
          <button type="button" className="ww-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ww-modal-form-grid">
            <label className="ww-field">
              <span className="ww-field-label">Name *</span>
              <input
                type="text"
                className="ww-input"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </label>

            <label className="ww-field">
              <span className="ww-field-label">Base URL *</span>
              <input
                type="text"
                className="ww-input"
                value={form.base_url}
                onChange={(e) => updateField("base_url", e.target.value)}
              />
            </label>

            <label className="ww-field ww-field-wide">
              <span className="ww-field-label">Description</span>
              <textarea
                className="ww-input ww-textarea"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </label>

            <label className="ww-field">
              <span className="ww-field-label">Accessibility Status</span>
              <input
                type="text"
                className="ww-input"
                placeholder="e.g. UNKNOWN, PASS, FAIL"
                value={form.accessibility_status}
                onChange={(e) => updateField("accessibility_status", e.target.value)}
              />
            </label>

            <label className="ww-field">
              <span className="ww-field-label">Environment</span>
              <select
                className="ww-input"
                value={form.environment}
                onChange={(e) => updateField("environment", e.target.value)}
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </label>

            <label className="ww-field">
              <span className="ww-field-label">Crawl Frequency</span>
              <input
                type="text"
                className="ww-input"
                value={form.crawl_frequency}
                onChange={(e) => updateField("crawl_frequency", e.target.value)}
              />
            </label>

            <label className="ww-checkbox-field">
              <input
                type="checkbox"
                checked={form.crawl_enabled}
                onChange={(e) => updateField("crawl_enabled", e.target.checked)}
              />
              <span>Enable crawling</span>
            </label>

            <label className="ww-checkbox-field">
              <input
                type="checkbox"
                checked={form.authentication_required}
                onChange={(e) => updateField("authentication_required", e.target.checked)}
              />
              <span>Requires authentication</span>
            </label>

            {form.authentication_required && (
              <label className="ww-field">
                <span className="ww-field-label">Authentication Type</span>
                <input
                  type="text"
                  className="ww-input"
                  value={form.authentication_type}
                  onChange={(e) => updateField("authentication_type", e.target.value)}
                />
              </label>
            )}
          </div>

          {error && <div className="ww-alert ww-alert-error">{error}</div>}

          <div className="ww-modal-actions">
            <button type="button" className="ww-btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="ww-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
export default function ValidateWeb() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "new-website" ? "new-website" : "dashboard"
  );

  // ── Website list ──────────────────────────────────────────
  const [websites, setWebsites] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // ── Create form ───────────────────────────────────────────
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // ── Edit / Delete ─────────────────────────────────────────
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // ── Inline crawls panel ───────────────────────────────────
  // Holds the id of the website whose crawls row is currently expanded.
  // Only one row can be expanded at a time; the panel renders directly
  // under that website's row, in-line, before the next website's row.
  const [expandedCrawlsId, setExpandedCrawlsId] = useState(null);

  const fetchWebsites = async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await getAllWebsites();
      if (res?.response_code >= 400) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to load websites.");
      }
      setWebsites(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setListError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  // Success message shows as a floating toast and clears itself after a few
  // seconds, so it never pushes the dashboard content down.
  useEffect(() => {
    if (!createSuccess) return undefined;
    const timer = setTimeout(() => setCreateSuccess(""), 3500);
    return () => clearTimeout(timer);
  }, [createSuccess]);

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!createForm.name.trim() || !createForm.base_url.trim()) {
      setCreateError("Name and Base URL are required.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        base_url: createForm.base_url.trim(),
        description: createForm.description.trim(),
        environment: createForm.environment,
        crawl_enabled: createForm.crawl_enabled,
        crawl_frequency: createForm.crawl_frequency.trim(),
        authentication_required: createForm.authentication_required,
        authentication_type: createForm.authentication_required
          ? createForm.authentication_type.trim()
          : "",
      };
      const res = await createWebsite(payload);
      if (res?.response_code >= 400 || !res?.data) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to register website.");
      }
      setWebsites((prev) => [res.data, ...prev]);
      setCreateForm(EMPTY_CREATE_FORM);
      setCreateSuccess(`"${res.data.name}" was registered successfully.`);
      setActiveTab("dashboard");
    } catch (err) {
      setCreateError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setCreating(false);
    }
  };

  const handleEditSave = async (payload) => {
    if (!editingWebsite) return;
    setSavingEdit(true);
    setEditError("");
    try {
      const res = await updateWebsite(editingWebsite.id, payload);
      if (res?.response_code >= 400 || !res?.data) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to update website.");
      }
      setWebsites((prev) => prev.map((w) => (w.id === res.data.id ? res.data : w)));
      setEditingWebsite(null);
    } catch (err) {
      setEditError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteWebsite = async (website) => {
    const confirmed = window.confirm(`Delete "${website.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(website.id);
    setListError("");
    try {
      const res = await deleteWebsite(website.id);
      if (res?.response_code >= 400) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to delete website.");
      }
      setWebsites((prev) => prev.filter((w) => w.id !== website.id));
      if (expandedCrawlsId === website.id) setExpandedCrawlsId(null);
    } catch (err) {
      setListError(err.message || "Failed to delete the website. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCrawlsRow = (websiteId) => {
    setExpandedCrawlsId((prev) => (prev === websiteId ? null : websiteId));
  };

  // ── Dashboard stats ───────────────────────────────────────
  const totalWebsites = websites.length;
  const runningWebsites = websites.filter((w) => w.crawl_enabled).length;
  const scansCompleted = websites.filter((w) =>
    ["done", "pass", "passed"].includes((w.accessibility_status || "").toLowerCase())
  ).length;
  const productionSites = websites.filter((w) => w.environment === "PRODUCTION").length;

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
          <div
            className={`ww-nav-item${activeTab === "dashboard" ? " active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="ww-nav-icon">📊</span>
            <span>Dashboard</span>
            {activeTab === "dashboard" && <span className="ww-nav-dot"></span>}
          </div>
          <div
            className={`ww-nav-item${activeTab === "new-website" ? " active" : ""}`}
            onClick={() => {
              setCreateError("");
              setCreateSuccess("");
              setActiveTab("new-website");
            }}
          >
            <span className="ww-nav-icon">➕</span>
            <span>New Website</span>
            {activeTab === "new-website" && <span className="ww-nav-dot"></span>}
          </div>
          <div
            className="ww-nav-item"
            onClick={() => navigate("/scan-website")}
          >
            <span className="ww-nav-icon">🔍</span>
            <span>Scan Website</span>
          </div>
          <div
            className="ww-nav-item"
            onClick={() => navigate("/crawls")}
          >
            <span className="ww-nav-icon">🕓</span>
            <span>Crawls</span>
          </div>
        </nav>

        <div className="ww-sidebar-footer">
          <div className="ww-user-section">
            <p className="ww-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="ww-back-btn"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
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
          {activeTab === "dashboard" ? (
            <>
              <div className="ww-header ww-header-compact">
                <div>
                  <h1 className="ww-page-title">Website Accessibility Dashboard</h1>
                </div>
                <button
                  type="button"
                  className="ww-btn-primary"
                  onClick={() => {
                    setCreateError("");
                    setCreateSuccess("");
                    setActiveTab("new-website");
                  }}
                >
                  + New Website
                </button>
              </div>

              <div className="ww-kpi-row">
                <div className="ww-kpi-card ww-kpi-blue">
                  <div className="ww-kpi-label">Total Websites</div>
                  <div className="ww-kpi-value">{totalWebsites}</div>
                </div>
                <div className="ww-kpi-card ww-kpi-green">
                  <div className="ww-kpi-label">Currently Running</div>
                  <div className="ww-kpi-value">{runningWebsites}</div>
                </div>
                <div className="ww-kpi-card ww-kpi-amber">
                  <div className="ww-kpi-label">Scans Completed</div>
                  <div className="ww-kpi-value">{scansCompleted}</div>
                </div>
                <div className="ww-kpi-card ww-kpi-navy">
                  <div className="ww-kpi-label">Production Sites</div>
                  <div className="ww-kpi-value">{productionSites}</div>
                </div>
              </div>

              <div className="ww-card">
                <div className="ww-card-title-row">
                  <span className="ww-card-title">🌐 Registered Websites</span>
                  <button
                    type="button"
                    className="ww-refresh-btn"
                    onClick={fetchWebsites}
                    title="Refresh from server"
                  >
                    🔄
                  </button>
                </div>

                {listError && <div className="ww-alert ww-alert-error">{listError}</div>}

                <div className="ww-table-wrap">
                  {listLoading ? (
                    <div className="ww-empty-state">Loading websites…</div>
                  ) : websites.length === 0 ? (
                    <div className="ww-empty-state">
                      No websites registered yet. Click “New Website” to add one.
                    </div>
                  ) : (
                    <table className="ww-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Base URL</th>
                          <th>Environment</th>
                          <th>Crawl</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {websites.map((site) => (
                          <Fragment key={site.id}>
                            <tr>
                              <td className="ww-td-name">{site.name}</td>
                              <td className="ww-td-url">{site.base_url}</td>
                              <td>{site.environment}</td>
                              <td>
                                <span className={`ww-crawl-chip ${site.crawl_enabled ? "on" : "off"}`}>
                                  {site.crawl_enabled ? "Enabled" : "Disabled"}
                                </span>
                              </td>
                              <td>
                                <div className="ww-row-actions">
                                  <button
                                    type="button"
                                    className={`ww-icon-btn${expandedCrawlsId === site.id ? " active" : ""}`}
                                    title="View crawls"
                                    aria-label="View crawls"
                                    onClick={() => toggleCrawlsRow(site.id)}
                                  >
                                    🕓
                                  </button>
                                  <button
                                    type="button"
                                    className="ww-icon-btn"
                                    title="Edit website"
                                    aria-label="Edit website"
                                    onClick={() => {
                                      setEditError("");
                                      setEditingWebsite(site);
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    className="ww-icon-btn"
                                    title="Delete website"
                                    aria-label="Delete website"
                                    disabled={deletingId === site.id}
                                    onClick={() => handleDeleteWebsite(site)}
                                  >
                                    {deletingId === site.id ? "…" : "🗑️"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedCrawlsId === site.id && (
                              <tr className="wc-inline-row">
                                <td colSpan={TABLE_COLUMN_COUNT}>
                                  <WebsiteCrawlsPanel
                                    website={site}
                                    onClose={() => setExpandedCrawlsId(null)}
                                  />
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="ww-header">
                <div>
                  <h1 className="ww-page-title">Register a Website</h1>
                  <p className="ww-page-subtitle">
                    Add a website so it can be scanned for accessibility issues.
                  </p>
                </div>
              </div>

              <div className="ww-card ww-create-card">
                <form className="ww-form-grid" onSubmit={handleCreateSubmit}>
                  <label className="ww-field">
                    <span className="ww-field-label">Name *</span>
                    <input
                      type="text"
                      className="ww-input"
                      placeholder="e.g. Bajaj"
                      value={createForm.name}
                      onChange={(e) => handleCreateChange("name", e.target.value)}
                    />
                  </label>

                  <label className="ww-field">
                    <span className="ww-field-label">Base URL *</span>
                    <input
                      type="text"
                      className="ww-input"
                      placeholder="https://www.example.com"
                      value={createForm.base_url}
                      onChange={(e) => handleCreateChange("base_url", e.target.value)}
                    />
                  </label>

                  <label className="ww-field ww-field-wide">
                    <span className="ww-field-label">Description</span>
                    <textarea
                      className="ww-input ww-textarea"
                      placeholder="What is this website used for?"
                      value={createForm.description}
                      onChange={(e) => handleCreateChange("description", e.target.value)}
                    />
                  </label>

                  <label className="ww-field">
                    <span className="ww-field-label">Environment</span>
                    <select
                      className="ww-input"
                      value={createForm.environment}
                      onChange={(e) => handleCreateChange("environment", e.target.value)}
                    >
                      {ENVIRONMENTS.map((env) => (
                        <option key={env} value={env}>{env}</option>
                      ))}
                    </select>
                  </label>

                  <label className="ww-field">
                    <span className="ww-field-label">Crawl Frequency</span>
                    <input
                      type="text"
                      className="ww-input"
                      placeholder="e.g. daily, weekly"
                      value={createForm.crawl_frequency}
                      onChange={(e) => handleCreateChange("crawl_frequency", e.target.value)}
                    />
                  </label>

                  <label className="ww-checkbox-field">
                    <input
                      type="checkbox"
                      checked={createForm.crawl_enabled}
                      onChange={(e) => handleCreateChange("crawl_enabled", e.target.checked)}
                    />
                    <span>Enable crawling</span>
                  </label>

                  <label className="ww-checkbox-field">
                    <input
                      type="checkbox"
                      checked={createForm.authentication_required}
                      onChange={(e) => handleCreateChange("authentication_required", e.target.checked)}
                    />
                    <span>Requires authentication</span>
                  </label>

                  {createForm.authentication_required && (
                    <label className="ww-field">
                      <span className="ww-field-label">Authentication Type</span>
                      <input
                        type="text"
                        className="ww-input"
                        placeholder="e.g. password, oauth"
                        value={createForm.authentication_type}
                        onChange={(e) => handleCreateChange("authentication_type", e.target.value)}
                      />
                    </label>
                  )}

                  {createError && <div className="ww-alert ww-alert-error ww-field-wide">{createError}</div>}

                  <div className="ww-field-wide ww-form-actions">
                    <button type="submit" className="ww-btn-primary" disabled={creating}>
                      {creating ? "Registering…" : "Register Website"}
                    </button>
                    <button
                      type="button"
                      className="ww-btn-ghost"
                      onClick={() => setActiveTab("dashboard")}
                      disabled={creating}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      {createSuccess && (
        <div className="ww-toast ww-toast-success" role="status">
          <span className="ww-toast-icon" aria-hidden="true">✓</span>
          <span className="ww-toast-text">{createSuccess}</span>
          <button
            type="button"
            className="ww-toast-close"
            onClick={() => setCreateSuccess("")}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {editingWebsite && (
        <EditWebsiteModal
          website={editingWebsite}
          onClose={() => {
            setEditingWebsite(null);
            setEditError("");
          }}
          onSave={handleEditSave}
          saving={savingEdit}
          error={editError}
        />
      )}
    </div>
  );
}