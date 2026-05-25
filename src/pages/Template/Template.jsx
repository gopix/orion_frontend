
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";
import { saveMasterTemplate, cloneMasterTemplate, runAccessibilityChecks, getMasterAccessibilityChecks } from "../../services/apiServices";

const INITIAL_TEMPLATES = [];

export default function Template() {
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("master");
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [contextMenu, setContextMenu] = useState(null);

  // New Template modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");

  // Edit modal (org tab)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  // Clone modal — shown after master template is saved (whole-master clone)
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneOrgId, setCloneOrgId] = useState("");
  const [cloneProjectId, setCloneProjectId] = useState("");
  const [cloning, setCloning] = useState(false);

  // ── NEW: Per-row clone modal ──────────────────────────────
  const [showRowCloneModal, setShowRowCloneModal] = useState(false);
  const [rowCloneSource, setRowCloneSource] = useState(null); // the master check row being cloned
  const [rowCloneName, setRowCloneName] = useState("");
  const [rowCloneOrg, setRowCloneOrg] = useState("");
  const [rowCloneStatus, setRowCloneStatus] = useState("Active");

  // ── NEW: Org-tab row editing ──────────────────────────────
  // Each org template can have an optional `sourceCheck` (full check data) for display/edit
  const [showOrgRowEditModal, setShowOrgRowEditModal] = useState(false);
  const [orgRowEditData, setOrgRowEditData] = useState(null); // { templateId, check }

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

  // State for master checks loaded from API
  const [masterChecks, setMasterChecks] = useState([]);
  const [masterChecksLoading, setMasterChecksLoading] = useState(false);
  const [masterChecksError, setMasterChecksError] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

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
  const lastSavedRowRef = useRef(null);
  const [lastSavedId, setLastSavedId] = useState(null);

  useEffect(() => {
    if (activeNav === "master") {
      fetchMasterChecks();
    }
  }, [activeNav]);

  const fetchMasterChecks = async () => {
    setMasterChecksLoading(true);
    setMasterChecksError("");
    try {
      const data = await getMasterAccessibilityChecks();
      if (Array.isArray(data)) {
        setMasterChecks(data);
      } else if (Array.isArray(data?.checks)) {
        setMasterChecks(data.checks);
      } else {
        setMasterChecks([]);
      }
    } catch (err) {
      setMasterChecksError("Could not load checks from server. Is backend running?");
    } finally {
      setMasterChecksLoading(false);
    }
  };

  // ── Add new org template ─────────────────────────────────
  const handleAddTemplate = () => {
    if (!newName.trim()) return alert("Please enter a template name");
    const newTemplate = {
      id: Date.now(),
      name: newName.trim(),
      org: newOrg.trim() || "Organization · Custom",
      status: newStatus,
      sourceCheck: null,
    };
    setTemplates([...templates, newTemplate]);
    setShowNewModal(false);
    setNewName("");
    setNewOrg("");
    setNewStatus("Draft");
  };

  // ── Edit org template card ───────────────────────────────
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

  // ── Delete org template ──────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    setTemplates(templates.filter(t => t.id !== id));
    setContextMenu(null);
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
      setOrgProceeded(false);
      setChecksResult(null);
    }
  };

  // ── Toggle status ────────────────────────────────────────
  const handleUpdate = (id) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, status: t.status === "Active" ? "Draft" : "Active" } : t
    ));
    setContextMenu(null);
  };

  // ── Import Excel ─────────────────────────────────────────
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      alert(`Successfully imported templates from "${file.name}"`);
      setImporting(false);
    }, 1200);
  };

  // ── Manual Master Template Functions ─────────────────────
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
        // Collapse the manual form and show the saved entries table
        setMasterProceeded(false);
        setMasterMode(null);
        // Re-fetch master checks so the new entries appear in the table
        setMasterChecksLoading(true);
        setMasterChecksError("");
        try {
          const data = await getMasterAccessibilityChecks();
          let checks = [];
          if (Array.isArray(data)) checks = data;
          else if (Array.isArray(data?.checks)) checks = data.checks;
          setMasterChecks(checks);
          // Highlight and scroll to the last entry
          if (checks.length > 0) {
            const last = checks[checks.length - 1];
            setLastSavedId(last.check_id ?? checks.length - 1);
            // Scroll after render
            setTimeout(() => {
              if (lastSavedRowRef.current) {
                lastSavedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }, 120);
            // Clear highlight after 3s
            setTimeout(() => setLastSavedId(null), 3000);
          }
        } catch (_) {
          // silently ignore re-fetch error; saved data is still on server
        } finally {
          setMasterChecksLoading(false);
        }
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

  // ── Whole-master clone to org ────────────────────────────
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
          sourceCheck: null,
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
    const newTemplate = {
      id: Date.now(),
      name: "Master Template",
      org: "Organization · Default",
      status: "Draft",
      sourceCheck: null,
    };
    setTemplates(prev => [...prev, newTemplate]);
    setActiveNav("organization");
  };

  // ── NEW: Per-row clone → open modal ──────────────────────
  const openRowCloneModal = (check) => {
    setRowCloneSource(check);
    setRowCloneName(check.check_name || check.check_code || "Cloned Check");
    setRowCloneOrg("");
    setRowCloneStatus("Active");
    setShowRowCloneModal(true);
  };

  // ── NEW: Confirm per-row clone → add to org templates ────
  const handleRowCloneConfirm = () => {
    if (!rowCloneName.trim()) return alert("Please enter a template name");
    const newTemplate = {
      id: Date.now(),
      name: rowCloneName.trim(),
      org: rowCloneOrg.trim() || "Organization · Custom",
      status: rowCloneStatus,
      sourceCheck: { ...rowCloneSource }, // carry full check data
    };
    setTemplates(prev => [...prev, newTemplate]);
    setShowRowCloneModal(false);
    setRowCloneSource(null);
    setActiveNav("organization");
  };

  // ── NEW: Open org-row check detail/edit modal ─────────────
  const openOrgRowEdit = (template) => {
    if (!template.sourceCheck) return;
    setOrgRowEditData({ templateId: template.id, check: { ...template.sourceCheck } });
    setShowOrgRowEditModal(true);
    setContextMenu(null);
  };

  // ── NEW: Save org-row check edits ────────────────────────
  const handleOrgRowEditSave = () => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === orgRowEditData.templateId
          ? { ...t, sourceCheck: { ...orgRowEditData.check } }
          : t
      )
    );
    setShowOrgRowEditModal(false);
    setOrgRowEditData(null);
  };

  // ── Organization: Proceed → Run Checks ───────────────────
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
        <nav className="tp-nav">
          <p className="tp-nav-section">TEMPLATE</p>
          <div className={`tp-nav-item tp-nav-parent ${activeNav === "master" || activeNav === "organization" ? "active" : ""}`}
            onClick={() => setActiveNav(activeNav === "master" || activeNav === "organization" ? "" : "master")}>
            <span className="tp-nav-icon">📋</span> Template
            <span className="tp-chevron">{(activeNav === "master" || activeNav === "organization") ? "▾" : "▸"}</span>
          </div>
          {(activeNav === "master" || activeNav === "organization") && (
            <div className="tp-nav-sub">
              <div className={`tp-nav-sub-item ${activeNav === "master" ? "active" : ""}`}
                onClick={() => setActiveNav("master")}>
                <span className="tp-sub-dot">›</span> Main Template
              </div>
              <div className={`tp-nav-sub-item ${activeNav === "organization" ? "active" : ""}`}
                onClick={() => setActiveNav("organization")}>
                <span className="tp-sub-dot">›</span> Organization Template
              </div>
            </div>
          )}

          <p className="tp-nav-section" style={{ marginTop: 20 }}>ACCESSIBILITY</p>
          <div className={`tp-nav-item tp-nav-parent ${activeNav === "validate" ? "active" : ""}`}
            onClick={() => setActiveNav(activeNav === "validate" ? "" : "validate")}>
            <span className="tp-nav-icon">🔍</span> Validation
            <span className="tp-chevron">{activeNav === "validate" ? "▾" : "▸"}</span>
          </div>
          {activeNav === "validate" && (
            <div className="tp-nav-sub">
              <div className="tp-nav-sub-item active" onClick={() => navigate("/validate-pdf")}>
                <span className="tp-sub-dot">›</span> Validate PDF
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="tp-main">
        <div className="tp-topbar">
          <div className="tp-breadcrumb">
            <span>Accessibility &amp; Remediation</span>
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

          {/* ── Organization Templates ────────────────────── */}
          {activeNav === "organization" && (
            <section>
              <div className="tp-section-header">
                <div>
                  <h2 className="tp-section-title">Organization Templates</h2>
                  <p className="tp-section-sub">Select a template to run accessibility checks</p>
                </div>
              </div>

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

                    {/* Show "From Master Check" badge if it was row-cloned */}
                    {t.sourceCheck && (
                      <span className="tp-badge tp-badge-source" title={`Cloned from: ${t.sourceCheck.check_code || ""}`}>
                        🔗 Cloned
                      </span>
                    )}

                    {contextMenu === t.id && (
                      <div className="tp-context-menu" onClick={e => e.stopPropagation()}>
                        {t.sourceCheck ? (
                          <div className="tp-ctx-item" onClick={() => openOrgRowEdit(t)}>📝 Edit Check Details</div>
                        ) : (
                          <div className="tp-ctx-item" onClick={() => { alert(`Viewing: ${t.name}`); setContextMenu(null); }}>👁 View</div>
                        )}
                        <div className="tp-ctx-item" onClick={() => openEdit(t)}>✏️ Edit Card</div>
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

          {/* ── Master Template ───────────────────────────── */}
          {activeNav === "master" && (
            <section>
              {masterChecksLoading && (
                <div style={{ padding: "20px", color: "#64748b", fontSize: 14 }}>
                  ⏳ Loading checks from server...
                </div>
              )}

              {masterChecksError && (
                <div style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
                  ⚠ {masterChecksError}
                </div>
              )}

              {!masterChecksLoading && masterChecks.length > 0 && (() => {
                const priorities = ["ALL", ...Array.from(new Set(masterChecks.map(r => r.default_priority).filter(Boolean)))];
                const categories = ["ALL", ...Array.from(new Set(masterChecks.map(r => r.category).filter(Boolean)))];
                const filtered = masterChecks.filter(r =>
                  (filterPriority === "ALL" || r.default_priority === filterPriority) &&
                  (filterCategory === "ALL" || r.category === filterCategory)
                );
                return (
                  <div style={{ marginBottom: 32 }}>
                    {/* Filters */}
                    <div className="tp-filter-bar">
                      <div className="tp-filter-group">
                        <label className="tp-filter-label">Priority</label>
                        <div className="tp-filter-pills">
                          {priorities.map(p => (
                            <button
                              key={p}
                              className={`tp-filter-pill tp-priority-${p.toLowerCase()} ${filterPriority === p ? "active" : ""}`}
                              onClick={() => setFilterPriority(p)}
                            >{p}</button>
                          ))}
                        </div>
                      </div>
                      <div className="tp-filter-group">
                        <label className="tp-filter-label">Category</label>
                        <div className="tp-filter-pills">
                          {categories.map(c => (
                            <button
                              key={c}
                              className={`tp-filter-pill ${filterCategory === c ? "active" : ""}`}
                              onClick={() => setFilterCategory(c)}
                            >{c}</button>
                          ))}
                        </div>
                      </div>
                      <span className="tp-filter-count">{filtered.length} of {masterChecks.length} checks</span>
                    </div>

                    {/* Table with per-row Clone button */}
                    <table className="tp-manual-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Code</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>WCAG</th>
                          <th>PDF/UA</th>
                          <th>Remediation</th>
                          <th>Active</th>
                          <th>Clone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((row, i) => {
                          const isLast = lastSavedId !== null && (row.check_id === lastSavedId || i === filtered.length - 1 && lastSavedId !== null);
                          const isHighlighted = lastSavedId !== null && (row.check_id == lastSavedId || (i === filtered.length - 1));
                          return (
                          <tr
                            key={i}
                            ref={i === filtered.length - 1 ? lastSavedRowRef : null}
                            className={isHighlighted ? "tp-row-highlight" : ""}
                          >
                            <td>{row.check_id}</td>
                            <td>{row.check_code}</td>
                            <td>{row.description}</td>
                            <td>{row.category}</td>
                            <td>
                              <span className={`tp-priority-badge tp-priority-${(row.default_priority || "").toLowerCase()}`}>
                                {row.default_priority}
                              </span>
                            </td>
                            <td>{row.wcag_reference}</td>
                            <td>{row.pdfua_reference}</td>
                            <td>{row.remediation_guidance}</td>
                            <td>{row.is_active ? "✅" : "❌"}</td>
                            <td>
                              <button
                                className="tp-btn-clone-row"
                                title="Clone this check to Organization"
                                onClick={() => openRowCloneModal(row)}
                              >
                                🔁 Clone
                              </button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

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

              {/* Add Manually / Bulk Upload cards */}
              {!masterProceeded && (
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "stretch",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 40,
                  paddingBottom: 40
                }}>
                  <button
                    className="tp-mode-card"
                    onClick={() => { setMasterMode("manual"); setMasterProceeded(true); }}
                  >
                    <span className="tp-mode-icon">📝</span>
                    <span className="tp-mode-title">Add Manually</span>
                    <span className="tp-mode-desc">Add each accessibility check with full details</span>
                  </button>
                  <button
                    className="tp-mode-card"
                    onClick={() => { setMasterMode("excel"); setMasterProceeded(true); excelInputRef.current.click(); }}
                  >
                    <span className="tp-mode-icon">📊</span>
                    <span className="tp-mode-title">Bulk Upload</span>
                    <span className="tp-mode-desc">Upload an Excel file with all checks at once</span>
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ── Whole-master Clone Modal ──────────────────────────── */}
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
              <button className="tp-btn tp-btn-outline" onClick={handleCloneNo} disabled={cloning}>No, Skip</button>
              <button className="tp-btn tp-btn-primary" onClick={handleCloneYes} disabled={cloning}>
                {cloning ? "Cloning..." : "✅ Yes, Clone"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Per-row Clone Modal ──────────────────────────── */}
      {showRowCloneModal && rowCloneSource && (
        <div className="tp-modal-overlay" onClick={() => setShowRowCloneModal(false)}>
          <div className="tp-modal tp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>🔁 Clone Check to Organization</h3>
              <button className="tp-modal-close" onClick={() => setShowRowCloneModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body">
              {/* Source check summary */}
              <div className="tp-clone-source-box">
                <p className="tp-clone-source-label">Cloning from Master Check</p>
                <div className="tp-clone-source-row">
                  <span><strong>Code:</strong> {rowCloneSource.check_code}</span>
                  <span><strong>Category:</strong> {rowCloneSource.category}</span>
                  <span>
                    <strong>Priority:</strong>
                    <span className={`tp-priority-badge tp-priority-${(rowCloneSource.default_priority || "").toLowerCase()}`} style={{ marginLeft: 6 }}>
                      {rowCloneSource.default_priority}
                    </span>
                  </span>
                </div>
                {rowCloneSource.description && (
                  <p className="tp-clone-source-desc">{rowCloneSource.description}</p>
                )}
              </div>

              <label className="tp-label" style={{ marginTop: 16 }}>Template Name *</label>
              <input
                className="tp-input"
                value={rowCloneName}
                onChange={e => setRowCloneName(e.target.value)}
                placeholder="e.g. WCAG 1.1 — Image Alt"
                style={{ width: "100%", marginTop: 4 }}
              />
              <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
              <input
                className="tp-input"
                value={rowCloneOrg}
                onChange={e => setRowCloneOrg(e.target.value)}
                placeholder="e.g. Organization · Custom"
                style={{ width: "100%", marginTop: 4 }}
              />
              <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
              <select className="tp-input" value={rowCloneStatus} onChange={e => setRowCloneStatus(e.target.value)} style={{ width: "100%", marginTop: 4 }}>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={() => setShowRowCloneModal(false)}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={handleRowCloneConfirm}>
                ✅ Clone to Organization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Org Row Check Edit Modal ────────────────────── */}
      {showOrgRowEditModal && orgRowEditData && (
        <div className="tp-modal-overlay" onClick={() => { setShowOrgRowEditModal(false); setOrgRowEditData(null); }}>
          <div className="tp-modal tp-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>📝 Edit Check Details</h3>
              {/* Discard cross — closes without saving */}
              <button
                className="tp-modal-close tp-modal-discard"
                title="Discard changes"
                onClick={() => { setShowOrgRowEditModal(false); setOrgRowEditData(null); }}
              >✕</button>
            </div>
            <div className="tp-modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {[
                { label: "Check ID", key: "check_id" },
                { label: "Check Code", key: "check_code" },
                { label: "Check Name", key: "check_name" },
                { label: "Description", key: "description" },
                { label: "Category", key: "category" },
                { label: "WCAG Reference", key: "wcag_reference" },
                { label: "PDF/UA Reference", key: "pdfua_reference" },
                { label: "Remediation Guidance", key: "remediation_guidance" },
                { label: "Agent Code", key: "agent_code" },
              ].map(({ label, key }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label className="tp-label">{label}</label>
                  <input
                    className="tp-input"
                    value={orgRowEditData.check[key] || ""}
                    onChange={e => setOrgRowEditData(prev => ({ ...prev, check: { ...prev.check, [key]: e.target.value } }))}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label className="tp-label">Priority</label>
                <select
                  className="tp-input"
                  value={orgRowEditData.check.default_priority || "HIGH"}
                  onChange={e => setOrgRowEditData(prev => ({ ...prev, check: { ...prev.check, default_priority: e.target.value } }))}
                  style={{ width: "100%", marginTop: 4 }}
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label className="tp-label" style={{ margin: 0 }}>Active</label>
                <input
                  type="checkbox"
                  checked={!!orgRowEditData.check.is_active}
                  onChange={e => setOrgRowEditData(prev => ({ ...prev, check: { ...prev.check, is_active: e.target.checked } }))}
                />
              </div>
            </div>
            {/* Footer: only Save button */}
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-primary tp-btn-save-full" onClick={handleOrgRowEditSave}>
                💾 Save Changes
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

      {/* ── Edit Template Card Modal ───────────────────────────── */}
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
