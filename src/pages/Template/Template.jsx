
// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Template.css";
// import { saveMasterTemplate, cloneMasterTemplate, runAccessibilityChecks } from "../../services/apiServices";

// const INITIAL_TEMPLATES = [
//   { id: 1, name: "Template #1", org: "Organization · Default", status: "Active" },
//   { id: 2, name: "Template #2", org: "Organization · Custom", status: "Draft" },
// ];

// export default function Template() {
//   const navigate = useNavigate();
//   const [activeNav, setActiveNav] = useState("organization");
//   const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
//   const [contextMenu, setContextMenu] = useState(null);

//   // New Template modal
//   const [showNewModal, setShowNewModal] = useState(false);
//   const [newName, setNewName] = useState("");
//   const [newOrg, setNewOrg] = useState("");
//   const [newStatus, setNewStatus] = useState("Draft");

//   // Edit modal
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editTemplate, setEditTemplate] = useState(null);

//   // Clone modal — shown after master template is saved
//   const [showCloneModal, setShowCloneModal] = useState(false);
//   const [cloneOrgId, setCloneOrgId] = useState("");
//   const [cloneProjectId, setCloneProjectId] = useState("");
//   const [cloning, setCloning] = useState(false);

//   // Master Template
//   const [masterMode, setMasterMode] = useState(null); // 'manual' | 'excel'
//   const [masterProceeded, setMasterProceeded] = useState(false);
//   const [manualItems, setManualItems] = useState([{
//     check_id: "",
//     check_code: "",
//     check_name: "",
//     description: "",
//     category: "",
//     default_priority: "HIGH",
//     wcag_reference: "",
//     pdfua_reference: "",
//     remediation_guidance: "",
//     agent_code: "",
//     is_active: true
//   }]);

//   const [masterSaved, setMasterSaved] = useState(false);
//   const [importing, setImporting] = useState(false);

//   // Organization — selected template + run-checks state
//   const [selectedTemplateId, setSelectedTemplateId] = useState(null);
//   const [orgProceeded, setOrgProceeded] = useState(false);
//   const [checksRunning, setChecksRunning] = useState(false);
//   const [checksResult, setChecksResult] = useState(null);
//   const [checksError, setChecksError] = useState("");

//   const importInputRef = useRef(null);
//   const excelInputRef = useRef(null);

//   // ── Add new template ────────────────────────────────────────
//   const handleAddTemplate = () => {
//     if (!newName.trim()) return alert("Please enter a template name");
//     const newTemplate = {
//       id: Date.now(),
//       name: newName.trim(),
//       org: newOrg.trim() || "Organization · Custom",
//       status: newStatus,
//     };
//     setTemplates([...templates, newTemplate]);
//     setShowNewModal(false);
//     setNewName("");
//     setNewOrg("");
//     setNewStatus("Draft");
//   };

//   // ── Edit template ───────────────────────────────────────────
//   const openEdit = (t) => {
//     setEditTemplate({ ...t });
//     setShowEditModal(true);
//     setContextMenu(null);
//   };

//   const handleEditSave = () => {
//     if (!editTemplate.name.trim()) return alert("Template name cannot be empty");
//     setTemplates(templates.map(t => t.id === editTemplate.id ? editTemplate : t));
//     setShowEditModal(false);
//     setEditTemplate(null);
//   };

//   // ── Delete template ─────────────────────────────────────────
//   const handleDelete = (id) => {
//     if (!window.confirm("Are you sure you want to delete this template?")) return;
//     setTemplates(templates.filter(t => t.id !== id));
//     setContextMenu(null);
//   };

//   // ── Update status ───────────────────────────────────────────
//   const handleUpdate = (id) => {
//     setTemplates(templates.map(t =>
//       t.id === id ? { ...t, status: t.status === "Active" ? "Draft" : "Active" } : t
//     ));
//     setContextMenu(null);
//   };

//   // ── Import Excel ────────────────────────────────────────────
//   const handleImportExcel = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setImporting(true);
//     setTimeout(() => {
//       alert(`Successfully imported templates from "${file.name}"`);
//       setImporting(false);
//     }, 1200);
//   };

//   // ── Manual Master Template Functions ────────────────────────
//   const addManualRow = () => {
//     setManualItems([...manualItems, {
//       check_id: "",
//       check_code: "",
//       check_name: "",
//       description: "",
//       category: "",
//       default_priority: "HIGH",
//       wcag_reference: "",
//       pdfua_reference: "",
//       remediation_guidance: "",
//       agent_code: "",
//       is_active: true
//     }]);
//   };

//   const removeManualRow = (i) => {
//     if (manualItems.length === 1) return alert("At least one check is required");
//     setManualItems(manualItems.filter((_, idx) => idx !== i));
//   };

//   const updateManualRow = (i, key, val) => {
//     const updated = [...manualItems];
//     updated[i][key] = val;
//     setManualItems(updated);
//   };

//   const saveMasterManual = async () => {
//     const filledRows = manualItems.filter(r => r.check_name.trim() || r.check_code.trim());
//     if (!filledRows.length) return alert("Please fill at least one check");

//     try {
//       const response = await saveMasterTemplate(filledRows);

//       if (response.ok) {
//         setMasterSaved(true);
//         // After successful save, ask if they want to clone to Organization
//         setCloneOrgId("");
//         setCloneProjectId("");
//         setShowCloneModal(true);
//       } else {
//         alert("Failed to save to backend. Please check server.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error. Is backend running?");
//     }
//   };

//   const handleMasterProceed = () => {
//     if (!masterMode) return alert("Please select an option first");
//     setMasterProceeded(true);
//     if (masterMode === "excel") {
//       excelInputRef.current.click();
//     }
//   };

//   // ── Clone master to organization ─────────────────────────────
//   const handleCloneYes = async () => {
//     if (!cloneOrgId.toString().trim()) return alert("Please enter an Organization ID");
//     if (!cloneProjectId.trim()) return alert("Please enter a Project ID");
//     setCloning(true);
//     try {
//       const response = await cloneMasterTemplate(cloneOrgId, cloneProjectId);
//       if (response.ok) {
//         const data = await response.json().catch(() => ({}));
//         const newTemplate = {
//           id: data.id || Date.now(),
//           name: `Project: ${cloneProjectId}`,
//           org: `Org ID: ${cloneOrgId}`,
//           status: data.status || "Active",
//         };
//         setTemplates(prev => [...prev, newTemplate]);
//         setShowCloneModal(false);
//         setActiveNav("organization");
//         alert("✅ Master template cloned to Organization successfully!");
//       } else {
//         const err = await response.json().catch(() => ({}));
//         alert(`Clone failed: ${err.message || err.detail || "Unknown error"}`);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error during clone.");
//     } finally {
//       setCloning(false);
//     }
//   };

//   const handleCloneNo = () => {
//     setShowCloneModal(false);
//     // Template still shows in organization (without clone API call)
//     const newTemplate = {
//       id: Date.now(),
//       name: "Master Template",
//       org: "Organization · Default",
//       status: "Draft",
//     };
//     setTemplates(prev => [...prev, newTemplate]);
//     setActiveNav("organization");
//   };

//   // ── Organization: Proceed → Run Checks ──────────────────────
//   const handleOrgProceed = async () => {
//     if (!selectedTemplateId) return alert("Please select a template first");
//     setOrgProceeded(true);
//     setChecksRunning(true);
//     setChecksResult(null);
//     setChecksError("");

//     try {
//       const response = await runAccessibilityChecks(selectedTemplateId);
//       if (!response.ok) {
//         const err = await response.json().catch(() => ({}));
//         throw new Error(err.detail || `Server error: ${response.status}`);
//       }
//       const data = await response.json();
//       setChecksResult(data);
//     } catch (err) {
//       setChecksError(`Error: ${err.message}`);
//     } finally {
//       setChecksRunning(false);
//     }
//   };

//   const getChecks = () => {
//     if (!checksResult) return [];
//     if (Array.isArray(checksResult)) return checksResult;
//     if (Array.isArray(checksResult.checks)) return checksResult.checks;
//     if (Array.isArray(checksResult.results)) return checksResult.results;
//     return [];
//   };

//   return (
//     <div className="tp-page" onClick={() => setContextMenu(null)}>

//       {/* Sidebar */}
//       <aside className="tp-sidebar">
//         <div className="tp-logo">
//           <span>Orion</span>
//           <small>Accessibility & Remediation</small>
//         </div>
//         <nav className="tp-nav">
//           <p className="tp-nav-section">MAIN</p>

//           <div className={`tp-nav-item ${activeNav === "master" || activeNav === "organization" ? "active" : ""}`}
//             onClick={() => setActiveNav(activeNav === "master" ? "" : "master")}>
//             <span className="tp-nav-icon">📋</span> Template
//             <span className="tp-chevron">{(activeNav === "master" || activeNav === "organization") ? "▾" : "▸"}</span>
//           </div>

//           {(activeNav === "master" || activeNav === "organization") && (
//             <div className="tp-nav-sub">
//               <div className={`tp-nav-item ${activeNav === "master" ? "active" : ""}`}
//                 onClick={() => setActiveNav("master")}>Master Template</div>
//               <div className={`tp-nav-item ${activeNav === "organization" ? "active" : ""}`}
//                 onClick={() => setActiveNav("organization")}>Organization</div>
//             </div>
//           )}

//           <div className="tp-nav-item" onClick={() => navigate("/validate-pdf")}>
//             <span className="tp-nav-icon">✅</span> Validate PDF
//           </div>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="tp-main">
//         <div className="tp-topbar">
//           <div className="tp-breadcrumb">
//             <span>Accessibility & Remediation</span>
//             <span className="tp-sep">›</span>
//             <span className="tp-active">
//               {activeNav === "master" ? "Master Template" : "Organization Templates"}
//             </span>
//           </div>

//           {activeNav === "organization" && (
//             <div className="tp-topbar-actions">
//               <input ref={importInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleImportExcel} />
//               <button className="tp-btn tp-btn-outline" onClick={() => importInputRef.current.click()} disabled={importing}>
//                 {importing ? "Importing..." : "⬆ Import Excel"}
//               </button>
//               <button className="tp-btn tp-btn-primary" onClick={() => setShowNewModal(true)}>
//                 + New Template
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="tp-content">

//           {/* ── Organization Templates ────────────────────────── */}
//           {activeNav === "organization" && (
//             <section>
//               <div className="tp-section-header">
//                 <div>
//                   <h2 className="tp-section-title">Organization Templates</h2>
//                   <p className="tp-section-sub">Select a template to run accessibility checks</p>
//                 </div>
//               </div>

//               {/* Template selection grid */}
//               <div className="tp-grid">
//                 {templates.map(t => (
//                   <div
//                     key={t.id}
//                     className={`tp-card ${selectedTemplateId === t.id ? "tp-card-selected" : ""}`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setSelectedTemplateId(t.id);
//                       setOrgProceeded(false);
//                       setChecksResult(null);
//                       setChecksError("");
//                     }}
//                     onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(t.id); }}
//                   >
//                     {/* Radio indicator */}
//                     <div className="tp-card-radio">
//                       <input
//                         type="radio"
//                         name="orgTemplate"
//                         checked={selectedTemplateId === t.id}
//                         onChange={() => {
//                           setSelectedTemplateId(t.id);
//                           setOrgProceeded(false);
//                           setChecksResult(null);
//                           setChecksError("");
//                         }}
//                         onClick={e => e.stopPropagation()}
//                       />
//                     </div>
//                     <div className="tp-card-icon">📄</div>
//                     <div className="tp-card-name">{t.name}</div>
//                     <div className="tp-card-org">{t.org}</div>
//                     <span className={`tp-badge ${t.status === "Active" ? "active" : "draft"}`}>{t.status}</span>

//                     {contextMenu === t.id && (
//                       <div className="tp-context-menu" onClick={e => e.stopPropagation()}>
//                         <div className="tp-ctx-item" onClick={() => { alert(`Viewing: ${t.name}`); setContextMenu(null); }}>👁 View</div>
//                         <div className="tp-ctx-item" onClick={() => openEdit(t)}>✏️ Edit</div>
//                         <div className="tp-ctx-item" onClick={() => handleUpdate(t.id)}>🔄 Toggle Status</div>
//                         <div className="tp-ctx-item danger" onClick={() => handleDelete(t.id)}>🗑 Delete</div>
//                       </div>
//                     )}
//                   </div>
//                 ))}

//                 <div className="tp-card tp-card-add" onClick={() => setShowNewModal(true)}>
//                   <div style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }}>+</div>
//                   <div className="tp-card-name">Add New Template</div>
//                 </div>
//               </div>

//               {/* Proceed button — only appears after a radio is selected */}
//               {selectedTemplateId && !orgProceeded && (
//                 <div className="tp-radio-actions" style={{ marginTop: 20 }}>
//                   <button className="tp-btn tp-btn-outline" onClick={() => { setSelectedTemplateId(null); setChecksResult(null); }}>
//                     Cancel
//                   </button>
//                   <button className="tp-btn tp-btn-primary" onClick={handleOrgProceed}>
//                     Proceed →
//                   </button>
//                 </div>
//               )}

//               {/* Checks result table */}
//               {orgProceeded && (
//                 <div className="tp-validation-result" style={{ marginTop: 24 }}>
//                   <p className="tp-result-title">
//                     {checksRunning
//                       ? "⏳ Running accessibility checks..."
//                       : checksError
//                         ? `⚠ ${checksError}`
//                         : `Accessibility Check Results — ${getChecks().length} checks run`
//                     }
//                   </p>

//                   {checksRunning && (
//                     <div style={{ padding: "16px 20px", color: "#64748b", fontSize: 13 }}>
//                       Running checks on the selected template...
//                     </div>
//                   )}

//                   {!checksRunning && checksError && (
//                     <div style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
//                       {checksError}
//                     </div>
//                   )}

//                   {!checksRunning && checksResult && (
//                     <>
//                       {getChecks().map((check, i) => (
//                         <div key={i} className={`tp-check-row ${check.passed ? "passed" : "failed"}`}>
//                           <span>
//                             {check.passed ? "✅" : "❌"} {check.check_name || check.name || `Check ${i + 1}`}
//                           </span>
//                           {check.remediation_guidance && (
//                             <span className="tp-check-note">{check.remediation_guidance}</span>
//                           )}
//                         </div>
//                       ))}
//                       {getChecks().length === 0 && (
//                         <div style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
//                           Checks complete. Raw: {JSON.stringify(checksResult)}
//                         </div>
//                       )}
//                     </>
//                   )}

//                   {!checksRunning && !checksError && !checksResult && (
//                     <div style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
//                       No results returned from server.
//                     </div>
//                   )}
//                 </div>
//               )}
//             </section>
//           )}

//           {/* ── Master Template ───────────────────────────────── */}
//           {activeNav === "master" && (
//             <section>
//               <div className="tp-section-header">
//                 <div>
//                   <h2 className="tp-section-title">Master Accessibility Check</h2>
//                   <p className="tp-section-sub">Define all accessibility checks (11 fields)</p>
//                 </div>
//               </div>

//               {/* Radio options */}
//               {!masterProceeded && (
//                 <>
//                   <div className="tp-radio-group">
//                     <p className="tp-radio-label">Select how you want to add checks:</p>
//                     <label className="tp-radio-option">
//                       <input
//                         type="radio"
//                         name="masterMode"
//                         value="manual"
//                         checked={masterMode === "manual"}
//                         onChange={() => setMasterMode("manual")}
//                       />
//                       📝 Define Manually — Add each accessibility check with full details
//                     </label>
//                     <label className="tp-radio-option">
//                       <input
//                         type="radio"
//                         name="masterMode"
//                         value="excel"
//                         checked={masterMode === "excel"}
//                         onChange={() => setMasterMode("excel")}
//                       />
//                       📊 Upload Excel — Bulk import from Excel file
//                     </label>
//                   </div>

//                   {/* Proceed button — only shows after radio is selected */}
//                   {masterMode && (
//                     <div className="tp-radio-actions">
//                       <button className="tp-btn tp-btn-outline" onClick={() => setMasterMode(null)}>Cancel</button>
//                       <button className="tp-btn tp-btn-primary" onClick={handleMasterProceed}>
//                         Proceed →
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Excel file input (hidden) */}
//               <input
//                 ref={excelInputRef}
//                 type="file"
//                 accept=".xlsx,.xls"
//                 style={{ display: "none" }}
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) alert(`Excel file selected: ${file.name}`);
//                 }}
//               />

//               {/* Manual 11-Field Form — only after Proceed */}
//               {masterProceeded && masterMode === "manual" && (
//                 <div className="tp-manual-form" style={{ marginTop: 24 }}>
//                   <table className="tp-manual-table">
//                     <thead>
//                       <tr>
//                         <th>ID</th>
//                         <th>Code</th>
//                         <th>Name</th>
//                         <th>Description</th>
//                         <th>Category</th>
//                         <th>Priority</th>
//                         <th>WCAG</th>
//                         <th>PDF/UA</th>
//                         <th>Remediation</th>
//                         <th>Agent Code</th>
//                         <th>Active</th>
//                         <th></th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {manualItems.map((row, i) => (
//                         <tr key={i}>
//                           <td><input className="tp-input" value={row.check_id} onChange={e => updateManualRow(i, "check_id", e.target.value)} /></td>
//                           <td><input className="tp-input" value={row.check_code} onChange={e => updateManualRow(i, "check_code", e.target.value)} /></td>
//                           <td><input className="tp-input" value={row.check_name} onChange={e => updateManualRow(i, "check_name", e.target.value)} /></td>
//                           <td><input className="tp-input" value={row.description} onChange={e => updateManualRow(i, "description", e.target.value)} /></td>
//                           <td><input className="tp-input" value={row.category} onChange={e => updateManualRow(i, "category", e.target.value)} /></td>
//                           <td>
//                             <select className="tp-input" value={row.default_priority} onChange={e => updateManualRow(i, "default_priority", e.target.value)}>
//                               <option value="HIGH">HIGH</option>
//                               <option value="MEDIUM">MEDIUM</option>
//                               <option value="LOW">LOW</option>
//                             </select>
//                           </td>
//                           <td><input className="tp-input" value={row.wcag_reference} onChange={e => updateManualRow(i, "wcag_reference", e.target.value)} /></td>
//                           <td><input className="tp-input" value={row.pdfua_reference} onChange={e => updateManualRow(i, "pdfua_reference", e.target.value)} /></td>
//                           <td><input className="tp-input" value={row.remediation_guidance} onChange={e => updateManualRow(i, "remediation_guidance", e.target.value)} /></td>
//                           <td><input className="tp-input" value={row.agent_code} onChange={e => updateManualRow(i, "agent_code", e.target.value)} /></td>
//                           <td>
//                             <input type="checkbox" checked={row.is_active} onChange={e => updateManualRow(i, "is_active", e.target.checked)} />
//                           </td>
//                           <td><button className="tp-btn-remove" onClick={() => removeManualRow(i)}>✕</button></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                   <div className="tp-form-actions">
//                     <button className="tp-btn tp-btn-outline" onClick={addManualRow}>+ Add Check</button>
//                     <button className="tp-btn tp-btn-primary" onClick={saveMasterManual}>💾 Save to Backend</button>
//                   </div>
//                   {masterSaved && <p className="tp-success-msg">✅ Master template saved successfully!</p>}
//                 </div>
//               )}
//             </section>
//           )}
//         </div>
//       </main>

//       {/* ── Clone Modal ────────────────────────────────────────── */}
//       {showCloneModal && (
//         <div className="tp-modal-overlay" onClick={() => setShowCloneModal(false)}>
//           <div className="tp-modal" onClick={e => e.stopPropagation()}>
//             <div className="tp-modal-header">
//               <h3>🔁 Clone to Organization?</h3>
//               <button className="tp-modal-close" onClick={() => handleCloneNo()}>✕</button>
//             </div>
//             <div className="tp-modal-body">
//               <p style={{ fontSize: 14, color: "#475569", marginBottom: 16 }}>
//                 The master template was saved. Would you like to clone it into the Organization section so users can use it?
//               </p>
//               <label className="tp-label">Organization ID * <small style={{color:"#94a3b8"}}>(number)</small></label>
//               <input
//                 className="tp-input"
//                 type="number"
//                 value={cloneOrgId}
//                 onChange={e => setCloneOrgId(e.target.value)}
//                 placeholder="e.g. 1"
//                 style={{ width: "100%", marginBottom: 12 }}
//               />
//               <label className="tp-label" style={{ marginTop: 4 }}>Project ID * <small style={{color:"#94a3b8"}}>(string)</small></label>
//               <input
//                 className="tp-input"
//                 value={cloneProjectId}
//                 onChange={e => setCloneProjectId(e.target.value)}
//                 placeholder="e.g. proj-001"
//                 style={{ width: "100%" }}
//               />
//             </div>
//             <div className="tp-modal-footer">
//               <button className="tp-btn tp-btn-outline" onClick={handleCloneNo} disabled={cloning}>
//                 No, Skip
//               </button>
//               <button className="tp-btn tp-btn-primary" onClick={handleCloneYes} disabled={cloning}>
//                 {cloning ? "Cloning..." : "✅ Yes, Clone"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── New Template Modal ─────────────────────────────────── */}
//       {showNewModal && (
//         <div className="tp-modal-overlay" onClick={() => setShowNewModal(false)}>
//           <div className="tp-modal" onClick={e => e.stopPropagation()}>
//             <div className="tp-modal-header">
//               <h3>New Template</h3>
//               <button className="tp-modal-close" onClick={() => setShowNewModal(false)}>✕</button>
//             </div>
//             <div className="tp-modal-body">
//               <label className="tp-label">Template Name *</label>
//               <input className="tp-input" value={newName} onChange={e => setNewName(e.target.value)} />
//               <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
//               <input className="tp-input" value={newOrg} onChange={e => setNewOrg(e.target.value)} />
//               <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
//               <select className="tp-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
//                 <option value="Draft">Draft</option>
//                 <option value="Active">Active</option>
//               </select>
//             </div>
//             <div className="tp-modal-footer">
//               <button className="tp-btn tp-btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
//               <button className="tp-btn tp-btn-primary" onClick={handleAddTemplate}>Create</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Edit Template Modal ────────────────────────────────── */}
//       {showEditModal && editTemplate && (
//         <div className="tp-modal-overlay" onClick={() => setShowEditModal(false)}>
//           <div className="tp-modal" onClick={e => e.stopPropagation()}>
//             <div className="tp-modal-header">
//               <h3>Edit Template</h3>
//               <button className="tp-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
//             </div>
//             <div className="tp-modal-body">
//               <label className="tp-label">Template Name *</label>
//               <input className="tp-input" value={editTemplate.name} onChange={e => setEditTemplate({ ...editTemplate, name: e.target.value })} />
//               <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
//               <input className="tp-input" value={editTemplate.org} onChange={e => setEditTemplate({ ...editTemplate, org: e.target.value })} />
//               <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
//               <select className="tp-input" value={editTemplate.status} onChange={e => setEditTemplate({ ...editTemplate, status: e.target.value })}>
//                 <option value="Draft">Draft</option>
//                 <option value="Active">Active</option>
//               </select>
//             </div>
//             <div className="tp-modal-footer">
//               <button className="tp-btn tp-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
//               <button className="tp-btn tp-btn-primary" onClick={handleEditSave}>Save Changes</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";
import { saveMasterTemplate, cloneMasterTemplate, runAccessibilityChecks } from "../../services/apiServices";

const INITIAL_TEMPLATES = [
  { id: 1, name: "Template #1", org: "Organization · Default", status: "Active" },
  { id: 2, name: "Template #2", org: "Organization · Custom", status: "Draft" },
];

export default function Template() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("organization");
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [contextMenu, setContextMenu] = useState(null);

  // New Template modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  // Clone modal — shown after master template is saved
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneOrgId, setCloneOrgId] = useState("");
  const [cloneProjectId, setCloneProjectId] = useState("");
  const [cloning, setCloning] = useState(false);

  // Master Template
  const [masterMode, setMasterMode] = useState(null); // 'manual' | 'excel'
  const [masterProceeded, setMasterProceeded] = useState(false);
  const [manualItems, setManualItems] = useState([{
    check_id: "",
    check_code: "",
    check_name: "",
    description: "",
    category: "",
    default_priority: "HIGH",
    wcag_reference: "",
    pdfua_reference: "",
    remediation_guidance: "",
    agent_code: "",
    is_active: true
  }]);

  const [masterSaved, setMasterSaved] = useState(false);
  const [importing, setImporting] = useState(false);

  // Organization — selected template + run-checks state
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [orgProceeded, setOrgProceeded] = useState(false);
  const [orgRunOrgId, setOrgRunOrgId] = useState("");
  const [orgRunProjectId, setOrgRunProjectId] = useState("");
  const [checksRunning, setChecksRunning] = useState(false);
  const [checksResult, setChecksResult] = useState(null);
  const [checksError, setChecksError] = useState("");

  const importInputRef = useRef(null);
  const excelInputRef = useRef(null);

  // ── Add new template ────────────────────────────────────────
  const handleAddTemplate = () => {
    if (!newName.trim()) return alert("Please enter a template name");
    const newTemplate = {
      id: Date.now(),
      name: newName.trim(),
      org: newOrg.trim() || "Organization · Custom",
      status: newStatus,
    };
    setTemplates([...templates, newTemplate]);
    setShowNewModal(false);
    setNewName("");
    setNewOrg("");
    setNewStatus("Draft");
  };

  // ── Edit template ───────────────────────────────────────────
  const openEdit = (t) => {
    setEditTemplate({ ...t });
    setShowEditModal(true);
    setContextMenu(null);
  };

  const handleEditSave = () => {
    if (!editTemplate.name.trim()) return alert("Template name cannot be empty");
    setTemplates(templates.map(t => t.id === editTemplate.id ? editTemplate : t));
    setShowEditModal(false);
    setEditTemplate(null);
  };

  // ── Delete template ─────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    setTemplates(templates.filter(t => t.id !== id));
    setContextMenu(null);
  };

  // ── Update status ───────────────────────────────────────────
  const handleUpdate = (id) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, status: t.status === "Active" ? "Draft" : "Active" } : t
    ));
    setContextMenu(null);
  };

  // ── Import Excel ────────────────────────────────────────────
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      alert(`Successfully imported templates from "${file.name}"`);
      setImporting(false);
    }, 1200);
  };

  // ── Manual Master Template Functions ────────────────────────
  const addManualRow = () => {
    setManualItems([...manualItems, {
      check_id: "",
      check_code: "",
      check_name: "",
      description: "",
      category: "",
      default_priority: "HIGH",
      wcag_reference: "",
      pdfua_reference: "",
      remediation_guidance: "",
      agent_code: "",
      is_active: true
    }]);
  };

  const removeManualRow = (i) => {
    if (manualItems.length === 1) return alert("At least one check is required");
    setManualItems(manualItems.filter((_, idx) => idx !== i));
  };

  const updateManualRow = (i, key, val) => {
    const updated = [...manualItems];
    updated[i][key] = val;
    setManualItems(updated);
  };

  const saveMasterManual = async () => {
    const filledRows = manualItems.filter(r => r.check_name.trim() || r.check_code.trim());
    if (!filledRows.length) return alert("Please fill at least one check");

    try {
      const response = await saveMasterTemplate(filledRows);

      if (response.ok) {
        setMasterSaved(true);
        // After successful save, ask if they want to clone to Organization
        setCloneOrgId("");
        setCloneProjectId("");
        setShowCloneModal(true);
      } else {
        alert("Failed to save to backend. Please check server.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Is backend running?");
    }
  };

  const handleMasterProceed = () => {
    if (!masterMode) return alert("Please select an option first");
    setMasterProceeded(true);
    if (masterMode === "excel") {
      excelInputRef.current.click();
    }
  };

  // ── Clone master to organization ─────────────────────────────
  const handleCloneYes = async () => {
    if (!cloneOrgId.toString().trim()) return alert("Please enter an Organization ID");
    if (!cloneProjectId.trim()) return alert("Please enter a Project ID");
    setCloning(true);
    try {
      const response = await cloneMasterTemplate(cloneOrgId, cloneProjectId);
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const newTemplate = {
          id: data.id || Date.now(),
          name: `Project: ${cloneProjectId}`,
          org: `Org ID: ${cloneOrgId}`,
          status: data.status || "Active",
        };
        setTemplates(prev => [...prev, newTemplate]);
        setShowCloneModal(false);
        setActiveNav("organization");
        alert("✅ Master template cloned to Organization successfully!");
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`Clone failed: ${err.message || err.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error during clone.");
    } finally {
      setCloning(false);
    }
  };

  const handleCloneNo = () => {
    setShowCloneModal(false);
    // Template still shows in organization (without clone API call)
    const newTemplate = {
      id: Date.now(),
      name: "Master Template",
      org: "Organization · Default",
      status: "Draft",
    };
    setTemplates(prev => [...prev, newTemplate]);
    setActiveNav("organization");
  };

  // ── Organization: Proceed → Run Checks ──────────────────────
  const handleOrgProceed = async () => {
    if (!selectedTemplateId) return alert("Please select a template first");
    if (!orgRunOrgId.toString().trim()) return alert("Please enter an Organization ID");
    if (!orgRunProjectId.trim()) return alert("Please enter a Project ID");
    setOrgProceeded(true);
    setChecksRunning(true);
    setChecksResult(null);
    setChecksError("");

    try {
      const response = await runAccessibilityChecks(orgRunOrgId, orgRunProjectId);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.detail || `Server error: ${response.status}`);
      }
      const data = await response.json();
      setChecksResult(data);
    } catch (err) {
      setChecksError(`Error: ${err.message}`);
    } finally {
      setChecksRunning(false);
    }
  };

  const getChecks = () => {
    if (!checksResult) return [];
    if (Array.isArray(checksResult)) return checksResult;
    if (Array.isArray(checksResult.checks)) return checksResult.checks;
    if (Array.isArray(checksResult.results)) return checksResult.results;
    return [];
  };

  return (
    <div className="tp-page" onClick={() => setContextMenu(null)}>

      {/* Sidebar */}
      <aside className="tp-sidebar">
        <div className="tp-logo">
          <span>Orion</span>
          <small>Accessibility & Remediation</small>
        </div>
        <nav className="tp-nav">
          <p className="tp-nav-section">MAIN</p>

          <div className={`tp-nav-item ${activeNav === "master" || activeNav === "organization" ? "active" : ""}`}
            onClick={() => setActiveNav(activeNav === "master" ? "" : "master")}>
            <span className="tp-nav-icon">📋</span> Template
            <span className="tp-chevron">{(activeNav === "master" || activeNav === "organization") ? "▾" : "▸"}</span>
          </div>

          {(activeNav === "master" || activeNav === "organization") && (
            <div className="tp-nav-sub">
              <div className={`tp-nav-item ${activeNav === "master" ? "active" : ""}`}
                onClick={() => setActiveNav("master")}>Master Template</div>
              <div className={`tp-nav-item ${activeNav === "organization" ? "active" : ""}`}
                onClick={() => setActiveNav("organization")}>Organization</div>
            </div>
          )}

          <div className="tp-nav-item" onClick={() => navigate("/validate-pdf")}>
            <span className="tp-nav-icon">✅</span> Validate PDF
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="tp-main">
        <div className="tp-topbar">
          <div className="tp-breadcrumb">
            <span>Accessibility & Remediation</span>
            <span className="tp-sep">›</span>
            <span className="tp-active">
              {activeNav === "master" ? "Master Template" : "Organization Templates"}
            </span>
          </div>

          {activeNav === "organization" && (
            <div className="tp-topbar-actions">
              <input ref={importInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleImportExcel} />
              <button className="tp-btn tp-btn-outline" onClick={() => importInputRef.current.click()} disabled={importing}>
                {importing ? "Importing..." : "⬆ Import Excel"}
              </button>
              <button className="tp-btn tp-btn-primary" onClick={() => setShowNewModal(true)}>
                + New Template
              </button>
            </div>
          )}
        </div>

        <div className="tp-content">

          {/* ── Organization Templates ────────────────────────── */}
          {activeNav === "organization" && (
            <section>
              <div className="tp-section-header">
                <div>
                  <h2 className="tp-section-title">Organization Templates</h2>
                  <p className="tp-section-sub">Select a template to run accessibility checks</p>
                </div>
              </div>

              {/* Template selection grid */}
              <div className="tp-grid">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`tp-card ${selectedTemplateId === t.id ? "tp-card-selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplateId(t.id);
                      setOrgProceeded(false);
                      setChecksResult(null);
                      setChecksError("");
                    }}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(t.id); }}
                  >
                    {/* Radio indicator */}
                    <div className="tp-card-radio">
                      <input
                        type="radio"
                        name="orgTemplate"
                        checked={selectedTemplateId === t.id}
                        onChange={() => {
                          setSelectedTemplateId(t.id);
                          setOrgProceeded(false);
                          setChecksResult(null);
                          setChecksError("");
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <div className="tp-card-icon">📄</div>
                    <div className="tp-card-name">{t.name}</div>
                    <div className="tp-card-org">{t.org}</div>
                    <span className={`tp-badge ${t.status === "Active" ? "active" : "draft"}`}>{t.status}</span>

                    {contextMenu === t.id && (
                      <div className="tp-context-menu" onClick={e => e.stopPropagation()}>
                        <div className="tp-ctx-item" onClick={() => { alert(`Viewing: ${t.name}`); setContextMenu(null); }}>👁 View</div>
                        <div className="tp-ctx-item" onClick={() => openEdit(t)}>✏️ Edit</div>
                        <div className="tp-ctx-item" onClick={() => handleUpdate(t.id)}>🔄 Toggle Status</div>
                        <div className="tp-ctx-item danger" onClick={() => handleDelete(t.id)}>🗑 Delete</div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="tp-card tp-card-add" onClick={() => setShowNewModal(true)}>
                  <div style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }}>+</div>
                  <div className="tp-card-name">Add New Template</div>
                </div>
              </div>

              {/* Proceed button — only appears after a radio is selected */}
              {selectedTemplateId && !orgProceeded && (
                <div className="tp-radio-actions" style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, width: "100%" }}>
                    <div style={{ flex: 1 }}>
                      <label className="tp-label">Organization ID * <small style={{color:"#94a3b8"}}>(number)</small></label>
                      <input
                        className="tp-input"
                        type="number"
                        value={orgRunOrgId}
                        onChange={e => setOrgRunOrgId(e.target.value)}
                        placeholder="e.g. 1"
                        style={{ width: "100%", marginTop: 4 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="tp-label">Project ID * <small style={{color:"#94a3b8"}}>(string)</small></label>
                      <input
                        className="tp-input"
                        value={orgRunProjectId}
                        onChange={e => setOrgRunProjectId(e.target.value)}
                        placeholder="e.g. proj-001"
                        style={{ width: "100%", marginTop: 4 }}
                      />
                    </div>
                  </div>
                  <button className="tp-btn tp-btn-outline" onClick={() => { setSelectedTemplateId(null); setChecksResult(null); setOrgRunOrgId(""); setOrgRunProjectId(""); }}>
                    Cancel
                  </button>
                  <button className="tp-btn tp-btn-primary" onClick={handleOrgProceed}>
                    Proceed →
                  </button>
                </div>
              )}

              {/* Checks result table */}
              {orgProceeded && (
                <div className="tp-validation-result" style={{ marginTop: 24 }}>
                  <p className="tp-result-title">
                    {checksRunning
                      ? "⏳ Running accessibility checks..."
                      : checksError
                        ? `⚠ ${checksError}`
                        : `Accessibility Check Results — ${getChecks().length} checks run`
                    }
                  </p>

                  {checksRunning && (
                    <div style={{ padding: "16px 20px", color: "#64748b", fontSize: 13 }}>
                      Running checks on the selected template...
                    </div>
                  )}

                  {!checksRunning && checksError && (
                    <div style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
                      {checksError}
                    </div>
                  )}

                  {!checksRunning && checksResult && (
                    <>
                      {getChecks().map((check, i) => (
                        <div key={i} className={`tp-check-row ${check.passed ? "passed" : "failed"}`}>
                          <span>
                            {check.passed ? "✅" : "❌"} {check.check_name || check.name || `Check ${i + 1}`}
                          </span>
                          {check.remediation_guidance && (
                            <span className="tp-check-note">{check.remediation_guidance}</span>
                          )}
                        </div>
                      ))}
                      {getChecks().length === 0 && (
                        <div style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
                          Checks complete. Raw: {JSON.stringify(checksResult)}
                        </div>
                      )}
                    </>
                  )}

                  {!checksRunning && !checksError && !checksResult && (
                    <div style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
                      No results returned from server.
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Master Template ───────────────────────────────── */}
          {activeNav === "master" && (
            <section>
              <div className="tp-section-header">
                <div>
                  <h2 className="tp-section-title">Master Accessibility Check</h2>
                  <p className="tp-section-sub">Define all accessibility checks (11 fields)</p>
                </div>
              </div>

              {/* Radio options */}
              {!masterProceeded && (
                <>
                  <div className="tp-radio-group">
                    <p className="tp-radio-label">Select how you want to add checks:</p>
                    <label className="tp-radio-option">
                      <input
                        type="radio"
                        name="masterMode"
                        value="manual"
                        checked={masterMode === "manual"}
                        onChange={() => setMasterMode("manual")}
                      />
                      📝 Define Manually — Add each accessibility check with full details
                    </label>
                    <label className="tp-radio-option">
                      <input
                        type="radio"
                        name="masterMode"
                        value="excel"
                        checked={masterMode === "excel"}
                        onChange={() => setMasterMode("excel")}
                      />
                      📊 Upload Excel — Bulk import from Excel file
                    </label>
                  </div>

                  {/* Proceed button — only shows after radio is selected */}
                  {masterMode && (
                    <div className="tp-radio-actions">
                      <button className="tp-btn tp-btn-outline" onClick={() => setMasterMode(null)}>Cancel</button>
                      <button className="tp-btn tp-btn-primary" onClick={handleMasterProceed}>
                        Proceed →
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Excel file input (hidden) */}
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) alert(`Excel file selected: ${file.name}`);
                }}
              />

              {/* Manual 11-Field Form — only after Proceed */}
              {masterProceeded && masterMode === "manual" && (
                <div className="tp-manual-form" style={{ marginTop: 24 }}>
                  <table className="tp-manual-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>WCAG</th>
                        <th>PDF/UA</th>
                        <th>Remediation</th>
                        <th>Agent Code</th>
                        <th>Active</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualItems.map((row, i) => (
                        <tr key={i}>
                          <td><input className="tp-input" value={row.check_id} onChange={e => updateManualRow(i, "check_id", e.target.value)} /></td>
                          <td><input className="tp-input" value={row.check_code} onChange={e => updateManualRow(i, "check_code", e.target.value)} /></td>
                          <td><input className="tp-input" value={row.check_name} onChange={e => updateManualRow(i, "check_name", e.target.value)} /></td>
                          <td><input className="tp-input" value={row.description} onChange={e => updateManualRow(i, "description", e.target.value)} /></td>
                          <td><input className="tp-input" value={row.category} onChange={e => updateManualRow(i, "category", e.target.value)} /></td>
                          <td>
                            <select className="tp-input" value={row.default_priority} onChange={e => updateManualRow(i, "default_priority", e.target.value)}>
                              <option value="HIGH">HIGH</option>
                              <option value="MEDIUM">MEDIUM</option>
                              <option value="LOW">LOW</option>
                            </select>
                          </td>
                          <td><input className="tp-input" value={row.wcag_reference} onChange={e => updateManualRow(i, "wcag_reference", e.target.value)} /></td>
                          <td><input className="tp-input" value={row.pdfua_reference} onChange={e => updateManualRow(i, "pdfua_reference", e.target.value)} /></td>
                          <td><input className="tp-input" value={row.remediation_guidance} onChange={e => updateManualRow(i, "remediation_guidance", e.target.value)} /></td>
                          <td><input className="tp-input" value={row.agent_code} onChange={e => updateManualRow(i, "agent_code", e.target.value)} /></td>
                          <td>
                            <input type="checkbox" checked={row.is_active} onChange={e => updateManualRow(i, "is_active", e.target.checked)} />
                          </td>
                          <td><button className="tp-btn-remove" onClick={() => removeManualRow(i)}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="tp-form-actions">
                    <button className="tp-btn tp-btn-outline" onClick={addManualRow}>+ Add Check</button>
                    <button className="tp-btn tp-btn-primary" onClick={saveMasterManual}>💾 Save to Backend</button>
                  </div>
                  {masterSaved && <p className="tp-success-msg">✅ Master template saved successfully!</p>}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ── Clone Modal ────────────────────────────────────────── */}
      {showCloneModal && (
        <div className="tp-modal-overlay" onClick={() => setShowCloneModal(false)}>
          <div className="tp-modal" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>🔁 Clone to Organization?</h3>
              <button className="tp-modal-close" onClick={() => handleCloneNo()}>✕</button>
            </div>
            <div className="tp-modal-body">
              <p style={{ fontSize: 14, color: "#475569", marginBottom: 16 }}>
                The master template was saved. Would you like to clone it into the Organization section so users can use it?
              </p>
              <label className="tp-label">Organization ID * <small style={{color:"#94a3b8"}}>(number)</small></label>
              <input
                className="tp-input"
                type="number"
                value={cloneOrgId}
                onChange={e => setCloneOrgId(e.target.value)}
                placeholder="e.g. 1"
                style={{ width: "100%", marginBottom: 12 }}
              />
              <label className="tp-label" style={{ marginTop: 4 }}>Project ID * <small style={{color:"#94a3b8"}}>(string)</small></label>
              <input
                className="tp-input"
                value={cloneProjectId}
                onChange={e => setCloneProjectId(e.target.value)}
                placeholder="e.g. proj-001"
                style={{ width: "100%" }}
              />
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={handleCloneNo} disabled={cloning}>
                No, Skip
              </button>
              <button className="tp-btn tp-btn-primary" onClick={handleCloneYes} disabled={cloning}>
                {cloning ? "Cloning..." : "✅ Yes, Clone"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Template Modal ─────────────────────────────────── */}
      {showNewModal && (
        <div className="tp-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="tp-modal" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>New Template</h3>
              <button className="tp-modal-close" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body">
              <label className="tp-label">Template Name *</label>
              <input className="tp-input" value={newName} onChange={e => setNewName(e.target.value)} />
              <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
              <input className="tp-input" value={newOrg} onChange={e => setNewOrg(e.target.value)} />
              <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
              <select className="tp-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
              </select>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={handleAddTemplate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Template Modal ────────────────────────────────── */}
      {showEditModal && editTemplate && (
        <div className="tp-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="tp-modal" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>Edit Template</h3>
              <button className="tp-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body">
              <label className="tp-label">Template Name *</label>
              <input className="tp-input" value={editTemplate.name} onChange={e => setEditTemplate({ ...editTemplate, name: e.target.value })} />
              <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
              <input className="tp-input" value={editTemplate.org} onChange={e => setEditTemplate({ ...editTemplate, org: e.target.value })} />
              <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
              <select className="tp-input" value={editTemplate.status} onChange={e => setEditTemplate({ ...editTemplate, status: e.target.value })}>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
              </select>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
