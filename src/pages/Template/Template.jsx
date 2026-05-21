




import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";

const BASE_URL = "http://localhost:8000/api/v1";

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

  // Master template — radio button selection
  const [masterMode, setMasterMode] = useState(null); // 'manual' | 'excel' | null
  const [manualItems, setManualItems] = useState([{ field: "", type: "", value: "" }]);
  const [masterExcelFile, setMasterExcelFile] = useState(null);
  const [masterSaved, setMasterSaved] = useState(false);

  // Import Excel
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const excelInputRef = useRef(null);
  const importInputRef = useRef(null);

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

  // ── Proceed handler ─────────────────────────────────────────
  const handleProceed = () => {
    if (!masterMode) return alert("Please select an option first");
    if (masterMode === "manual") {
      // show manual form inline
    } else {
      excelInputRef.current.click();
    }
  };

  return (
    <div className="tp-page" onClick={() => setContextMenu(null)}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <div className="tp-logo">
          <span>Orion</span>
        </div>
        <nav className="tp-nav">
          <p className="tp-nav-section">Accessibility & Remediation</p>

          <div className={`tp-nav-item ${activeNav === "master" || activeNav === "organization" ? "active" : ""}`}
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
            onClick={() => navigate("/validate-pdf")}>
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
              {activeNav === "master" ? "Master Template" : "Organization Templates"}
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
          {activeNav === "organization" && (
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
                  <p className="tp-section-sub">Choose how you want to define your master template.</p>
                </div>
              </div>

              {/* Radio buttons */}
              <div className="tp-radio-group">
                <label className={`tp-radio-card ${masterMode === "manual" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="masterMode"
                    value="manual"
                    checked={masterMode === "manual"}
                    onChange={() => { setMasterMode("manual"); setMasterSaved(false); }}
                  />
                  <div className="tp-radio-icon">📝</div>
                  <div>
                    <div className="tp-master-opt-title">Define each item manually</div>
                    <div className="tp-master-opt-desc">Add template fields one by one — name, type, and value.</div>
                  </div>
                </label>

                <label className={`tp-radio-card ${masterMode === "excel" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="masterMode"
                    value="excel"
                    checked={masterMode === "excel"}
                    onChange={() => { setMasterMode("excel"); setMasterSaved(false); }}
                  />
                  <div className="tp-radio-icon">📊</div>
                  <div>
                    <div className="tp-master-opt-title">Upload Excel sheet</div>
                    <div className="tp-master-opt-desc">Bulk import template items from a structured .xlsx file.</div>
                  </div>
                </label>
              </div>

              {/* Proceed / Cancel buttons */}
              <div className="tp-radio-actions">
                <button className="tp-btn tp-btn-outline" onClick={() => setMasterMode(null)}>Cancel</button>
                <button className="tp-btn tp-btn-primary" onClick={handleProceed} disabled={!masterMode}>Proceed →</button>
              </div>

              {/* Manual form — shown after Proceed */}
              {masterMode === "manual" && (
                <div className="tp-manual-form" style={{ marginTop: 24 }}>
                  <div className="tp-form-header">
                    <h3>Define Template Fields</h3>
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

              {/* Excel upload — shown after Proceed */}
              {masterMode === "excel" && (
                <div className="tp-excel-upload" style={{ marginTop: 24 }}>
                  <input ref={excelInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                    onChange={e => {
                      const f = e.target.files[0];
                      if (f) { setMasterExcelFile(f); }
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
                  {masterSaved && <p className="tp-success-msg">✅ Master template saved successfully!</p>}
                </div>
              )}
            </section>
          )}

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
