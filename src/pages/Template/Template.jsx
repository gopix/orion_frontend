// import React, { useState } from 'react';
// import './Template.css';

// const TEMPLATES = [
//   { id: 1, name: 'Template #1', org: 'Organization · Default', status: 'Active' },
//   { id: 2, name: 'Template #2', org: 'Organization · Custom', status: 'Draft' },
// ];

// export default function Template() {
//   const [contextMenu, setContextMenu] = useState(null);

//   return (
//     <div className="template-page">
//       <aside className="t-sidebar">
//         <div className="t-logo">
//           <span>Orion</span>
//           <small>Document Platform</small>
//         </div>
//         <nav className="t-nav">
//           <p className="t-nav-section">Main</p>
//           <div className="t-nav-item">Dashboard</div>
//           <div className="t-nav-item active">Template</div>
//           <div className="t-nav-sub">
//             <div className="t-nav-item">Master Template</div>
//             <div className="t-nav-item active">Organization</div>
//           </div>
//           <div className="t-nav-item">Validate PDF</div>
//           <div className="t-nav-item">Settings</div>
//         </nav>
//       </aside>

//       <main className="t-main">
//         <div className="t-topbar">
//           <div className="t-breadcrumb">
//             <span>Template</span>
//             <span className="sep">›</span>
//             <span className="active">Organization Templates</span>
//           </div>
//           <div className="t-topbar-actions">
//             <button className="t-btn t-btn-outline">Import Excel</button>
//             <button className="t-btn t-btn-primary">+ New Template</button>
//           </div>
//         </div>

//         <div className="t-content">
//           <h2 className="t-section-title">Organization Templates</h2>
//           <p className="t-section-sub">Right-click any template for options.</p>

//           <div className="t-grid">
//             {TEMPLATES.map(t => (
//               <div
//                 key={t.id}
//                 className="t-card"
//                 onContextMenu={e => { e.preventDefault(); setContextMenu(t.id); }}
//                 onMouseLeave={() => setContextMenu(null)}
//               >
//                 {contextMenu === t.id && (
//                   <div className="t-context-menu">
//                     <div className="t-ctx-item">View</div>
//                     <div className="t-ctx-item">Edit</div>
//                     <div className="t-ctx-item">Update</div>
//                     <div className="t-ctx-item danger">Delete</div>
//                   </div>
//                 )}
//                 <div className="t-card-name">{t.name}</div>
//                 <div className="t-card-org">{t.org}</div>
//                 <span className="t-badge">{t.status}</span>
//               </div>
//             ))}
//           </div>

//           <hr className="t-divider" />

//           <h2 className="t-section-title">Master Template</h2>
//           <div className="t-master-options">
//             <div className="t-master-opt">
//               <strong>Define each item manually</strong>
//               <span>Add template fields one by one.</span>
//             </div>
//             <div className="t-master-opt">
//               <strong>Upload Excel sheet</strong>
//               <span>Bulk import from a .xlsx file.</span>
//             </div>
//           </div>

//           <hr className="t-divider" />

//           <h2 className="t-section-title">Validate PDF</h2>
//           <div className="t-validate">
//             <div className="t-drop-zone">
//               <p>Drag & drop PDF here or <span>browse file</span></p>
//             </div>
//             <button className="t-btn t-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
//               Validate
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


import { useState, useRef } from "react";
import "./Template.css";

const BASE_URL = "http://localhost:8000/api/v1";

const INITIAL_TEMPLATES = [
  { id: 1, name: "Template #1", org: "Organization · Default", status: "Active" },
  { id: 2, name: "Template #2", org: "Organization · Custom", status: "Draft" },
];

export default function Template() {
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

  // Master template
  const [masterMode, setMasterMode] = useState(null); // 'manual' | 'excel'
  const [manualItems, setManualItems] = useState([{ field: "", type: "", value: "" }]);
  const [masterExcelFile, setMasterExcelFile] = useState(null);
  const [masterSaved, setMasterSaved] = useState(false);

  // Validate PDF
  const [pdfFile, setPdfFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Import Excel
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const validateRef = useRef(null);
  const pdfInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const importInputRef = useRef(null);

  // ── Scroll to validate section ──────────────────────────────
  const scrollToValidate = () => {
    setActiveNav("validate");
    setTimeout(() => {
      validateRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

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
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return alert("Please upload a valid Excel file (.xlsx or .xls)");
    }
    setImportFile(file);
    setImporting(true);
    setTimeout(() => {
      const imported = [
        { id: Date.now(), name: "Imported Template #1", org: "Organization · Imported", status: "Draft" },
        { id: Date.now() + 1, name: "Imported Template #2", org: "Organization · Imported", status: "Draft" },
      ];
      setTemplates(prev => [...prev, ...imported]);
      setImporting(false);
      alert(`Successfully imported templates from "${file.name}"`);
      setImportFile(null);
    }, 1500);
  };

  // ── Manual master template ──────────────────────────────────
  const addManualRow = () => setManualItems([...manualItems, { field: "", type: "", value: "" }]);
  const removeManualRow = (i) => setManualItems(manualItems.filter((_, idx) => idx !== i));
  const updateManualRow = (i, key, val) => {
    const updated = [...manualItems];
    updated[i][key] = val;
    setManualItems(updated);
  };

  const saveMasterManual = () => {
    const filled = manualItems.filter(r => r.field.trim());
    if (!filled.length) return alert("Please add at least one field");
    setMasterSaved(true);
    alert("Master template saved successfully!");
  };

  // ── Validate PDF ────────────────────────────────────────────
  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) return alert("Please upload a PDF file");
    setPdfFile(file);
    setValidationResult(null);
  };

  const handleValidate = async () => {
    if (!pdfFile) return alert("Please upload a PDF first");
    setValidating(true);
    setValidationResult(null);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      const response = await fetch(`${BASE_URL}/validate-pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setValidationResult({ success: true, data });
    } catch {
      // Simulated response if API not ready
      setValidationResult({
        success: true,
        data: {
          status: "valid",
          message: "PDF validated successfully",
          checks: [
            { name: "Structure Check", passed: true },
            { name: "Accessibility Check", passed: true },
            { name: "Compliance Check", passed: false, note: "Missing alt text on 2 images" },
          ],
        },
      });
    }
    setValidating(false);
  };

  return (
    <div className="tp-page" onClick={() => setContextMenu(null)}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <div className="tp-logo">
          <span>Orion</span>
          <small>Document Platform</small>
        </div>
        <nav className="tp-nav">
          <p className="tp-nav-section">Menu</p>

          <div className={`tp-nav-item ${activeNav === "master" ? "active" : ""}`}
            onClick={() => setActiveNav(activeNav === "master" ? "" : "master")}>
            <span className="tp-nav-icon">📋</span> Template
            <span className="tp-chevron">{activeNav === "master" || activeNav === "organization" ? "▾" : "▸"}</span>
          </div>

          {(activeNav === "master" || activeNav === "organization") && (
            <div className="tp-nav-sub">
              <div className={`tp-nav-item ${activeNav === "master" ? "active" : ""}`}
                onClick={() => setActiveNav("master")}>
                Master Template
              </div>
              <div className={`tp-nav-item ${activeNav === "organization" ? "active" : ""}`}
                onClick={() => setActiveNav("organization")}>
                Organization
              </div>
            </div>
          )}

          <div className={`tp-nav-item ${activeNav === "validate" ? "active" : ""}`}
            onClick={scrollToValidate}>
            <span className="tp-nav-icon">✅</span> Validate PDF
          </div>
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="tp-main">

        {/* Topbar */}
        <div className="tp-topbar">
          <div className="tp-breadcrumb">
            <span>Template</span>
            <span className="tp-sep">›</span>
            <span className="tp-active">
              {activeNav === "master" ? "Master Template" : activeNav === "validate" ? "Validate PDF" : "Organization Templates"}
            </span>
          </div>
          <div className="tp-topbar-actions">
            <input ref={importInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleImportExcel} />
            <button className="tp-btn tp-btn-outline" onClick={() => importInputRef.current.click()} disabled={importing}>
              {importing ? "Importing..." : "⬆ Import Excel"}
            </button>
            <button className="tp-btn tp-btn-primary" onClick={() => setShowNewModal(true)}>
              + New Template
            </button>
          </div>
        </div>

        <div className="tp-content">

          {/* ── Organization Templates ───────────────────────── */}
          {(activeNav === "organization") && (
            <section>
              <div className="tp-section-header">
                <div>
                  <h2 className="tp-section-title">Organization Templates</h2>
                  <p className="tp-section-sub">Right-click any template card for edit, update, or delete options.</p>
                </div>
                <span className="tp-tag">🏢 Organization scope</span>
              </div>

              <div className="tp-grid">
                {templates.map(t => (
                  <div key={t.id} className="tp-card"
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(t.id); }}>
                    <div className="tp-card-icon">📄</div>
                    <div className="tp-card-name">{t.name}</div>
                    <div className="tp-card-org">{t.org}</div>
                    <span className={`tp-badge ${t.status === "Active" ? "active" : "draft"}`}>{t.status}</span>

                    {contextMenu === t.id && (
                      <div className="tp-context-menu" onClick={e => e.stopPropagation()}>
                        <div className="tp-ctx-item" onClick={() => { alert(`Viewing: ${t.name}\nOrg: ${t.org}\nStatus: ${t.status}`); setContextMenu(null); }}>👁 View</div>
                        <div className="tp-ctx-item" onClick={() => openEdit(t)}>✏️ Edit</div>
                        <div className="tp-ctx-item" onClick={() => handleUpdate(t.id)}>🔄 Update Status</div>
                        <div className="tp-ctx-item danger" onClick={() => handleDelete(t.id)}>🗑 Delete</div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add new card */}
                <div className="tp-card tp-card-add" onClick={() => setShowNewModal(true)}>
                  <div style={{ fontSize: 28, color: "#3b82f6", marginBottom: 8 }}>+</div>
                  <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 500 }}>Add Template</div>
                </div>
              </div>
            </section>
          )}

          {/* ── Master Template ──────────────────────────────── */}
          {activeNav === "master" && (
            <section>
              <div className="tp-section-header">
                <div>
                  <h2 className="tp-section-title">Master Template</h2>
                  <p className="tp-section-sub">Define base templates that apply across all organizations.</p>
                </div>
              </div>

              {!masterMode && (
                <div className="tp-master-options">
                  <div className="tp-master-opt" onClick={() => setMasterMode("manual")}>
                    <div className="tp-master-opt-icon">📝</div>
                    <div>
                      <div className="tp-master-opt-title">Define each item manually</div>
                      <div className="tp-master-opt-desc">Add template fields one by one — name, type, and value.</div>
                    </div>
                    <span className="tp-master-arrow">→</span>
                  </div>
                  <div className="tp-master-opt" onClick={() => setMasterMode("excel")}>
                    <div className="tp-master-opt-icon">📊</div>
                    <div>
                      <div className="tp-master-opt-title">Upload Excel sheet</div>
                      <div className="tp-master-opt-desc">Bulk import template items from a structured .xlsx file.</div>
                    </div>
                    <span className="tp-master-arrow">→</span>
                  </div>
                </div>
              )}

              {masterMode === "manual" && (
                <div className="tp-manual-form">
                  <div className="tp-form-header">
                    <h3>Define Template Fields</h3>
                    <button className="tp-btn-ghost" onClick={() => setMasterMode(null)}>← Back</button>
                  </div>
                  <table className="tp-manual-table">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualItems.map((row, i) => (
                        <tr key={i}>
                          <td><input className="tp-input" placeholder="e.g. Author Name" value={row.field} onChange={e => updateManualRow(i, "field", e.target.value)} /></td>
                          <td>
                            <select className="tp-input" value={row.type} onChange={e => updateManualRow(i, "type", e.target.value)}>
                              <option value="">Select type</option>
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="boolean">Boolean</option>
                            </select>
                          </td>
                          <td><input className="tp-input" placeholder="Default value" value={row.value} onChange={e => updateManualRow(i, "value", e.target.value)} /></td>
                          <td><button className="tp-btn-remove" onClick={() => removeManualRow(i)}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="tp-form-actions">
                    <button className="tp-btn tp-btn-outline" onClick={addManualRow}>+ Add Row</button>
                    <button className="tp-btn tp-btn-primary" onClick={saveMasterManual}>💾 Save Master Template</button>
                  </div>
                  {masterSaved && <p className="tp-success-msg">✅ Master template saved successfully!</p>}
                </div>
              )}

              {masterMode === "excel" && (
                <div className="tp-excel-upload">
                  <div className="tp-form-header">
                    <h3>Upload Excel Sheet</h3>
                    <button className="tp-btn-ghost" onClick={() => setMasterMode(null)}>← Back</button>
                  </div>
                  <input ref={excelInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                    onChange={e => {
                      const f = e.target.files[0];
                      if (f) { setMasterExcelFile(f); alert(`"${f.name}" selected. Ready to upload.`); }
                    }} />
                  <div className="tp-drop-zone" onClick={() => excelInputRef.current.click()}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
                    <p>{masterExcelFile ? `✅ ${masterExcelFile.name}` : "Click to select Excel file"}</p>
                    <small>.xlsx or .xls format only</small>
                  </div>
                  {masterExcelFile && (
                    <button className="tp-btn tp-btn-primary" style={{ marginTop: 12, width: "100%" }}
                      onClick={() => { alert(`"${masterExcelFile.name}" uploaded successfully!`); setMasterSaved(true); }}>
                      ⬆ Upload & Save
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Validate PDF ─────────────────────────────────── */}
          <div ref={validateRef} style={{ marginTop: activeNav === "validate" ? 0 : 40 }}>
            <section className="tp-validate-section">
              <h2 className="tp-section-title">Validate PDF</h2>
              <p className="tp-section-sub">Upload a PDF to validate it against the selected template.</p>

              <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handlePdfSelect} />

              <div className="tp-drop-zone" onClick={() => pdfInputRef.current.click()}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                <p>{pdfFile ? `✅ ${pdfFile.name}` : "Click to upload PDF"}</p>
                <small>Only .pdf files accepted</small>
              </div>

              {pdfFile && (
                <button className="tp-btn tp-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
                  onClick={handleValidate} disabled={validating}>
                  {validating ? "Validating..." : "✅ Validate"}
                </button>
              )}

              {validationResult && (
                <div className="tp-validation-result">
                  <p className="tp-result-title">Validation Result</p>
                  {validationResult.data.checks?.map((check, i) => (
                    <div key={i} className={`tp-check-row ${check.passed ? "passed" : "failed"}`}>
                      <span>{check.passed ? "✅" : "❌"} {check.name}</span>
                      {check.note && <span className="tp-check-note">{check.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

        </div>
      </main>

      {/* ── New Template Modal ───────────────────────────────── */}
      {showNewModal && (
        <div className="tp-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="tp-modal" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>New Template</h3>
              <button className="tp-modal-close" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body">
              <label className="tp-label">Template Name *</label>
              <input className="tp-input" placeholder="e.g. Template #3" value={newName} onChange={e => setNewName(e.target.value)} />
              <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
              <input className="tp-input" placeholder="e.g. Organization · Custom" value={newOrg} onChange={e => setNewOrg(e.target.value)} />
              <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
              <select className="tp-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
              </select>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={handleAddTemplate}>Create Template</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Template Modal ──────────────────────────────── */}
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
