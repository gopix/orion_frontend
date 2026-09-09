

// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   createWebsite,
//   getAllWebsites,
//   updateWebsite,
//   deleteWebsite,
// } from "../../../services/apiServices";
// import "./ValidateWeb.css";

// const ENVIRONMENTS = ["PRODUCTION", "STAGING", "DEVELOPMENT", "TESTING"];

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

// const statusClass = (status) => {
//   const s = (status || "").toUpperCase();
//   if (s === "PASS" || s === "PASSED" || s === "DONE") return "ww-status-pass";
//   if (s === "FAIL" || s === "FAILED") return "ww-status-fail";
//   if (s === "IN_PROGRESS" || s === "SCANNING") return "ww-status-progress";
//   return "ww-status-unknown";
// };

// const formatDate = (value) => {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return value;
//   return d.toLocaleString();
// };

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
//     } catch (err) {
//       setListError(err.message || "Failed to delete the website. Please try again.");
//     } finally {
//       setDeletingId(null);
//     }
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
//                   <div className="ww-kpi-sub">Registered for scanning</div>
//                 </div>
//                 <div className="ww-kpi-card ww-kpi-green">
//                   <div className="ww-kpi-label">Currently Running</div>
//                   <div className="ww-kpi-value">{runningWebsites}</div>
//                   <div className="ww-kpi-sub">Crawling enabled</div>
//                 </div>
//                 <div className="ww-kpi-card ww-kpi-amber">
//                   <div className="ww-kpi-label">Scans Completed</div>
//                   <div className="ww-kpi-value">{scansCompleted}</div>
//                   <div className="ww-kpi-sub">Accessibility status: done</div>
//                 </div>
//                 <div className="ww-kpi-card ww-kpi-navy">
//                   <div className="ww-kpi-label">Production Sites</div>
//                   <div className="ww-kpi-value">{productionSites}</div>
//                   <div className="ww-kpi-sub">Live environment</div>
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
//                           <th>Status</th>
//                           <th>Last Scan</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {websites.map((site) => (
//                           <tr key={site.id}>
//                             <td className="ww-td-name">{site.name}</td>
//                             <td className="ww-td-url">{site.base_url}</td>
//                             <td>{site.environment}</td>
//                             <td>
//                               <span className={`ww-crawl-chip ${site.crawl_enabled ? "on" : "off"}`}>
//                                 {site.crawl_enabled ? "Enabled" : "Disabled"}
//                               </span>
//                             </td>
//                             <td>
//                               <span className={`ww-status-badge ${statusClass(site.accessibility_status)}`}>
//                                 {site.accessibility_status || "UNKNOWN"}
//                               </span>
//                             </td>
//                             <td>{formatDate(site.last_scan_at)}</td>
//                             <td>
//                               <div className="ww-row-actions">
//                                 <button
//                                   type="button"
//                                   className="ww-icon-btn"
//                                   title="Scan website"
//                                   aria-label="Scan website"
//                                   onClick={() => navigate(`/scan-website?website_id=${site.id}`)}
//                                 >
//                                   🔍
//                                 </button>
//                                 <button
//                                   type="button"
//                                   className="ww-icon-btn"
//                                   title="View crawl history"
//                                   aria-label="View crawl history"
//                                   onClick={() => navigate(`/crawls?website_id=${site.id}`)}
//                                 >
//                                   🕓
//                                 </button>
//                                 <button
//                                   type="button"
//                                   className="ww-icon-btn"
//                                   title="Edit website"
//                                   aria-label="Edit website"
//                                   onClick={() => {
//                                     setEditError("");
//                                     setEditingWebsite(site);
//                                   }}
//                                 >
//                                   ✏️
//                                 </button>
//                                 <button
//                                   type="button"
//                                   className="ww-icon-btn"
//                                   title="Delete website"
//                                   aria-label="Delete website"
//                                   disabled={deletingId === site.id}
//                                   onClick={() => handleDeleteWebsite(site)}
//                                 >
//                                   {deletingId === site.id ? "…" : "🗑️"}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
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




import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createWebsite,
  getAllWebsites,
  updateWebsite,
  deleteWebsite,
  getWebsiteCrawls,
  getWebsiteCrawlDetail,
} from "../../../services/apiServices";
import "./ValidateWeb.css";

const ENVIRONMENTS = ["PRODUCTION", "STAGING", "DEVELOPMENT", "TESTING"];

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

const statusClass = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "PASS" || s === "PASSED" || s === "DONE") return "ww-status-pass";
  if (s === "FAIL" || s === "FAILED") return "ww-status-fail";
  if (s === "IN_PROGRESS" || s === "SCANNING") return "ww-status-progress";
  return "ww-status-unknown";
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

/* ════════════════════════════════════════════════════════════
   WEBSITE CRAWLS MODAL
   Step 1: GET /websites/{website_id}/crawls        → crawl list
   Step 2: GET /websites/{website_id}/crawls/{id}    → crawl detail
   ════════════════════════════════════════════════════════════ */
function WebsiteCrawlsModal({ website, onClose }) {
  const [crawls, setCrawls] = useState([]);
  const [crawlsLoading, setCrawlsLoading] = useState(true);
  const [crawlsError, setCrawlsError] = useState("");

  const [selectedCrawlId, setSelectedCrawlId] = useState("");
  const [crawlDetail, setCrawlDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
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
        if (items.length > 0) {
          setSelectedCrawlId(String(items[0].crawl_id));
        }
      } catch (err) {
        setCrawlsError(err.message || "Unable to connect. Please try again later.");
      } finally {
        setCrawlsLoading(false);
      }
    };
    fetchCrawls();
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

  return (
    <div className="ww-modal-overlay" onClick={onClose}>
      <div className="ww-modal wc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ww-modal-header">
          <h3>Crawls · {website.name}</h3>
          <button type="button" className="ww-modal-close" onClick={onClose}>✕</button>
        </div>

        {crawlsLoading ? (
          <div className="ww-empty-state">Loading crawls…</div>
        ) : crawlsError ? (
          <div className="ww-alert ww-alert-error">{crawlsError}</div>
        ) : crawls.length === 0 ? (
          <div className="ww-empty-state">
            No crawls yet for this website. Run a full-site scan to see history here.
          </div>
        ) : (
          <>
            <label className="ww-field wc-select-field">
              <span className="ww-field-label">Select Crawl *</span>
              <select
                className="ww-input"
                value={selectedCrawlId}
                onChange={(e) => setSelectedCrawlId(e.target.value)}
              >
                {crawls.map((crawl) => (
                  <option key={crawl.crawl_id} value={crawl.crawl_id}>
                    #{crawl.crawl_id} · {crawl.status} · {crawl.pages_discovered ?? 0} pages · {formatDate(crawl.created_at)}
                  </option>
                ))}
              </select>
            </label>

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
                  <span className="ww-card-title">Pages ({pages.length})</span>
                </div>

                {pages.length === 0 ? (
                  <div className="ww-empty-state">No pages found for this crawl.</div>
                ) : (
                  <div className="ww-table-wrap">
                    <table className="ww-table">
                      <thead>
                        <tr>
                          <th>URL</th>
                          <th>Status</th>
                          <th>HTTP Status</th>
                          <th>Total Issues</th>
                          <th>Completed At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pages.map((page) => (
                          <tr key={page.id}>
                            <td className="ww-td-url" title={page.url}>{page.url}</td>
                            <td>
                              <span className={`ww-status-badge ${crawlStatusClass(page.status)}`}>
                                {page.status || "—"}
                              </span>
                            </td>
                            <td>{page.http_status ?? "—"}</td>
                            <td>{page.total_issues ?? (Array.isArray(page.issues) ? page.issues.length : 0)}</td>
                            <td>{formatDate(page.completed_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
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

  // ── Crawls modal ─────────────────────────────────────────────
  const [crawlsWebsite, setCrawlsWebsite] = useState(null);

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
    } catch (err) {
      setListError(err.message || "Failed to delete the website. Please try again.");
    } finally {
      setDeletingId(null);
    }
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
              <div className="ww-header">
                <div>
                  <h1 className="ww-page-title">Website Accessibility Dashboard</h1>
                  <p className="ww-page-subtitle">
                    Real-time visibility into every website registered for accessibility scanning.
                  </p>
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

              {createSuccess && <div className="ww-alert ww-alert-success">{createSuccess}</div>}

              <div className="ww-kpi-row">
                <div className="ww-kpi-card ww-kpi-blue">
                  <div className="ww-kpi-label">Total Websites</div>
                  <div className="ww-kpi-value">{totalWebsites}</div>
                  <div className="ww-kpi-sub">Registered for scanning</div>
                </div>
                <div className="ww-kpi-card ww-kpi-green">
                  <div className="ww-kpi-label">Currently Running</div>
                  <div className="ww-kpi-value">{runningWebsites}</div>
                  <div className="ww-kpi-sub">Crawling enabled</div>
                </div>
                <div className="ww-kpi-card ww-kpi-amber">
                  <div className="ww-kpi-label">Scans Completed</div>
                  <div className="ww-kpi-value">{scansCompleted}</div>
                  <div className="ww-kpi-sub">Accessibility status: done</div>
                </div>
                <div className="ww-kpi-card ww-kpi-navy">
                  <div className="ww-kpi-label">Production Sites</div>
                  <div className="ww-kpi-value">{productionSites}</div>
                  <div className="ww-kpi-sub">Live environment</div>
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
                          <th>Status</th>
                          {/* <th>Last Scan</th> */}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {websites.map((site) => (
                          <tr key={site.id}>
                            <td className="ww-td-name">{site.name}</td>
                            <td className="ww-td-url">{site.base_url}</td>
                            <td>{site.environment}</td>
                            <td>
                              <span className={`ww-crawl-chip ${site.crawl_enabled ? "on" : "off"}`}>
                                {site.crawl_enabled ? "Enabled" : "Disabled"}
                              </span>
                            </td>
                            <td>
                              <span className={`ww-status-badge ${statusClass(site.accessibility_status)}`}>
                                {site.accessibility_status || "UNKNOWN"}
                              </span>
                            </td>
                            {/* <td>{formatDate(site.last_scan_at)}</td> */}
                            <td>
                              <div className="ww-row-actions">
                                {/* <button
                                  type="button"
                                  className="ww-icon-btn"
                                  title="Scan website"
                                  aria-label="Scan website"
                                  onClick={() => navigate(`/scan-website?website_id=${site.id}`)}
                                >
                                  🔍
                                </button> */}
                                {/* <button
                                  type="button"
                                  className="ww-icon-btn"
                                  title="View crawl history"
                                  aria-label="View crawl history"
                                  onClick={() => navigate(`/crawls?website_id=${site.id}`)}
                                >
                                  🕓
                                </button> */}
                                <button
                                  type="button"
                                  className="ww-icon-btn"
                                  title="View crawls"
                                  aria-label="View crawls"
                                  onClick={() => setCrawlsWebsite(site)}
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

      {crawlsWebsite && (
        <WebsiteCrawlsModal
          website={crawlsWebsite}
          onClose={() => setCrawlsWebsite(null)}
        />
      )}
    </div>
  );
}