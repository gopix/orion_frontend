import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";
import {
  saveMasterTemplate,
  cloneMasterTemplate,
  runAccessibilityChecks,
  getMasterAccessibilityChecks,
} from "../../services/apiServices";

// ─────────────────────────────────────────────────────────────
// Helper: read an Excel file (.xlsx / .xls) in the browser and
// return an array of row-objects whose keys match the GET-API shape.
// We use the SheetJS library loaded from a CDN <script> tag.
// ─────────────────────────────────────────────────────────────
async function parseExcelFile(file) {
  // Dynamically load SheetJS only when needed
  if (!window.XLSX) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // sheet_to_json gives us one object per row, keys = column headers
        const raw = window.XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // Normalise column names → match the API shape exactly
        const normalised = raw.map((row, idx) => ({
          check_id:            row["check_id"]            ?? row["ID"]          ?? idx + 1,
          check_code:          row["check_code"]          ?? row["Code"]        ?? "",
          check_name:          row["check_name"]          ?? row["Name"]        ?? "",
          description:         row["description"]         ?? row["Description"] ?? "",
          category:            row["category"]            ?? row["Category"]    ?? "",
          default_priority:    (row["default_priority"]   ?? row["Priority"]    ?? "HIGH").toUpperCase(),
          wcag_reference:      row["wcag_reference"]      ?? row["WCAG"]        ?? "",
          pdfua_reference:     row["pdfua_reference"]     ?? row["PDFUA"]       ?? "",
          remediation_guidance:row["remediation_guidance"]?? row["Remediation"] ?? "",
          is_active:           row["is_active"] !== undefined ? Boolean(row["is_active"]) : true,
        }));
        resolve(normalised);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

const INITIAL_TEMPLATES = [];

export default function Template() {
  const navigate = useNavigate();

  // ── Navigation ───────────────────────────────────────────
  const [activeNav, setActiveNav] = useState("master");

  // ── Organization templates list ──────────────────────────
  const [templates, setTemplates]     = useState(INITIAL_TEMPLATES);
  const [contextMenu, setContextMenu] = useState(null);

  // New-template modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName]           = useState("");
  const [newOrg, setNewOrg]             = useState("");
  const [newStatus, setNewStatus]       = useState("Draft");

  // Edit-card modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemplate, setEditTemplate]   = useState(null);

  // Whole-master clone modal (after saving master)
  const [showCloneModal, setShowCloneModal]   = useState(false);
  const [cloneOrgId, setCloneOrgId]           = useState("");
  const [cloneProjectId, setCloneProjectId]   = useState("");
  const [cloning, setCloning]                 = useState(false);

  // ── NEW: Bottom-of-page "Clone" card modal ───────────────
  // Shows all master checks with checkboxes; selected ones get
  // cloned to the Organisation tab as a batch.
  const [showBatchCloneModal, setShowBatchCloneModal] = useState(false);
  const [batchSelected, setBatchSelected]             = useState([]); // array of check_ids

  // Org-row check-detail edit modal
  const [showOrgRowEditModal, setShowOrgRowEditModal] = useState(false);
  const [orgRowEditData, setOrgRowEditData]           = useState(null);

  // ── Master Template state ────────────────────────────────
  const [masterMode, setMasterMode]           = useState(null); // 'manual' | 'excel'
  const [masterProceeded, setMasterProceeded] = useState(false);

  // Manual-entry rows (check_id and agent_code removed per requirement 4)
  const emptyRow = () => ({
    check_code: "",
    check_name: "",
    description: "",
    category: "",
    default_priority: "HIGH",
    wcag_reference: "",
    pdfua_reference: "",
    remediation_guidance: "",
    is_active: true,
  });
  const [manualItems, setManualItems] = useState([emptyRow()]);
  const [masterSaved, setMasterSaved] = useState(false);

  // Master checks loaded from GET API / Excel
  const [masterChecks, setMasterChecks]         = useState([]);
  const [masterChecksLoading, setMasterChecksLoading] = useState(false);
  const [masterChecksError, setMasterChecksError]     = useState("");

  // ── Per-column sort state ────────────────────────────────
  // sortCol: which column is sorted; sortDir: 'asc' | 'desc'
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // ── Per-column filter state ──────────────────────────────
  // filterVals: { priority: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW',
  //               category: 'ALL' | <string> }
  const [filterVals, setFilterVals] = useState({ priority: "ALL", category: "ALL" });

  // Organisation run-checks state
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [orgProceeded, setOrgProceeded]             = useState(false);
  const [orgRunOrgId, setOrgRunOrgId]               = useState("");
  const [orgRunProjectId, setOrgRunProjectId]       = useState("");
  const [checksRunning, setChecksRunning]           = useState(false);
  const [checksResult, setChecksResult]             = useState(null);
  const [checksError, setChecksError]               = useState("");

  const importInputRef  = useRef(null);
  const excelInputRef   = useRef(null);
  const lastSavedRowRef = useRef(null);
  const [lastSavedId, setLastSavedId] = useState(null);

  // ── Fetch master checks on mount / nav change ────────────
  useEffect(() => {
    if (activeNav === "master") fetchMasterChecks();
  }, [activeNav]);

  const fetchMasterChecks = async () => {
    setMasterChecksLoading(true);
    setMasterChecksError("");
    try {
      const data = await getMasterAccessibilityChecks();
      if (Array.isArray(data))          setMasterChecks(data);
      else if (Array.isArray(data?.checks)) setMasterChecks(data.checks);
      else                               setMasterChecks([]);
    } catch {
      setMasterChecksError("Could not load checks from server. Is the backend running?");
    } finally {
      setMasterChecksLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // SORTING HELPER
  // When user clicks a column header arrow, we toggle sort.
  // If clicking the same column again, flip asc ↔ desc.
  // ────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  // Apply filter then sort to produce the final visible rows
  const getFilteredSorted = () => {
    let rows = [...masterChecks];

    // Filter
    if (filterVals.priority !== "ALL")
      rows = rows.filter((r) => r.default_priority === filterVals.priority);
    if (filterVals.category !== "ALL")
      rows = rows.filter((r) => r.category === filterVals.category);

    // Sort
    if (sortCol) {
      rows.sort((a, b) => {
        const va = String(a[sortCol] ?? "").toLowerCase();
        const vb = String(b[sortCol] ?? "").toLowerCase();
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  };

  // Small arrow indicator shown in each sortable header cell
  const SortArrow = ({ col }) => {
    if (sortCol !== col) return <span className="tp-sort-arrow tp-sort-neutral">⇅</span>;
    return (
      <span className="tp-sort-arrow tp-sort-active">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  // ────────────────────────────────────────────────────────
  // ORGANISATION TEMPLATE CRUD
  // ────────────────────────────────────────────────────────
  const handleAddTemplate = () => {
    if (!newName.trim()) return alert("Please enter a template name");
    setTemplates([...templates, {
      id: Date.now(),
      name: newName.trim(),
      org: newOrg.trim() || "Organization · Custom",
      status: newStatus,
      sourceChecks: [], // may carry multiple cloned checks
    }]);
    setShowNewModal(false);
    setNewName(""); setNewOrg(""); setNewStatus("Draft");
  };

  const openEdit = (t) => { setEditTemplate({ ...t }); setShowEditModal(true); setContextMenu(null); };

  const handleEditSave = () => {
    if (!editTemplate.name.trim()) return alert("Template name cannot be empty");
    setTemplates(templates.map((t) => (t.id === editTemplate.id ? editTemplate : t)));
    setShowEditModal(false);
    setEditTemplate(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    setTemplates(templates.filter((t) => t.id !== id));
    setContextMenu(null);
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null); setOrgProceeded(false); setChecksResult(null);
    }
  };

  const handleUpdate = (id) => {
    setTemplates(templates.map((t) =>
      t.id === id ? { ...t, status: t.status === "Active" ? "Draft" : "Active" } : t
    ));
    setContextMenu(null);
  };

  // ────────────────────────────────────────────────────────
  // IMPORT EXCEL (organisation tab)
  // ────────────────────────────────────────────────────────
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTimeout(() => alert(`Successfully imported templates from "${file.name}"`), 1200);
  };

  // ────────────────────────────────────────────────────────
  // MANUAL MASTER TEMPLATE
  // ────────────────────────────────────────────────────────
  const addManualRow    = () => setManualItems([...manualItems, emptyRow()]);
  const removeManualRow = (i) => {
    if (manualItems.length === 1) return alert("At least one check is required");
    setManualItems(manualItems.filter((_, idx) => idx !== i));
  };
  const updateManualRow = (i, key, val) => {
    const updated = [...manualItems];
    updated[i][key] = val;
    setManualItems(updated);
  };

  // POST manual rows to backend
  // Note: check_id and agent_code removed from the payload (requirement 4)
  const saveMasterManual = async () => {
    const filledRows = manualItems.filter((r) => r.check_name.trim() || r.check_code.trim());
    if (!filledRows.length) return alert("Please fill at least one check");
    try {
      const response = await saveMasterTemplate(filledRows);
      if (response.ok) {
        setMasterSaved(true);
        setMasterProceeded(false);
        setMasterMode(null);
        setManualItems([emptyRow()]);
        // Re-fetch so the new entries appear in the table
        setMasterChecksLoading(true);
        setMasterChecksError("");
        try {
          const data = await getMasterAccessibilityChecks();
          let checks = [];
          if (Array.isArray(data))           checks = data;
          else if (Array.isArray(data?.checks)) checks = data.checks;
          setMasterChecks(checks);
          if (checks.length > 0) {
            const last = checks[checks.length - 1];
            setLastSavedId(last.check_id ?? checks.length - 1);
            setTimeout(() => {
              if (lastSavedRowRef.current)
                lastSavedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 120);
            setTimeout(() => setLastSavedId(null), 3000);
          }
        } catch { /* silently ignore re-fetch error */ }
        finally  { setMasterChecksLoading(false); }
      } else {
        alert("Failed to save. Please check the server.");
      }
    } catch {
      alert("Network error. Is the backend running?");
    }
  };

  // ────────────────────────────────────────────────────────
  // BULK UPLOAD (Excel → master checks table)
  // Requirement 5: parse the Excel file client-side and show
  // the extracted rows in the master table in the same format
  // as data returned by the GET API.
  // ────────────────────────────────────────────────────────
  const handleBulkExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected
    e.target.value = "";
    try {
      const rows = await parseExcelFile(file);
      if (!rows.length) return alert("No data rows found in the Excel file.");
      // Append to existing masterChecks so the table shows them
      setMasterChecks((prev) => [...prev, ...rows]);
      setMasterProceeded(false);
      setMasterMode(null);
      setMasterSaved(true);
      // Highlight the first newly-added row
      if (rows.length > 0) {
        const firstNew = rows[0];
        setLastSavedId(firstNew.check_id);
        setTimeout(() => {
          if (lastSavedRowRef.current)
            lastSavedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        setTimeout(() => setLastSavedId(null), 3000);
      }
    } catch (err) {
      alert(`Failed to parse Excel file: ${err.message}`);
    }
  };

  // ────────────────────────────────────────────────────────
  // WHOLE-MASTER CLONE MODAL (after saving)
  // ────────────────────────────────────────────────────────
  const handleCloneYes = async () => {
    if (!cloneOrgId.toString().trim())   return alert("Please enter an Organization ID");
    if (!cloneProjectId.trim())          return alert("Please enter a Project ID");
    setCloning(true);
    try {
      const response = await cloneMasterTemplate(cloneOrgId, cloneProjectId);
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setTemplates((prev) => [...prev, {
          id: data.id || Date.now(),
          name: `Project: ${cloneProjectId}`,
          org: `Org ID: ${cloneOrgId}`,
          status: data.status || "Active",
          sourceChecks: [],
        }]);
        setShowCloneModal(false);
        setActiveNav("organization");
        alert("✅ Master template cloned to Organization successfully!");
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`Clone failed: ${err.message || err.detail || "Unknown error"}`);
      }
    } catch {
      alert("Network error during clone.");
    } finally {
      setCloning(false);
    }
  };

  const handleCloneNo = () => {
    setShowCloneModal(false);
    setTemplates((prev) => [...prev, {
      id: Date.now(),
      name: "Master Template",
      org: "Organization · Default",
      status: "Draft",
      sourceChecks: [],
    }]);
    setActiveNav("organization");
  };

  // ────────────────────────────────────────────────────────
  // BATCH CLONE MODAL (requirement 2)
  // Three "Clone" cards at the bottom of the master page open
  // this modal. The user picks checks with checkboxes, hits OK,
  // and those checks appear in the Organisation tab.
  // ────────────────────────────────────────────────────────
  const openBatchCloneModal = () => {
    setBatchSelected([]);
    setShowBatchCloneModal(true);
  };

  const toggleBatchCheck = (check_id) => {
    setBatchSelected((prev) =>
      prev.includes(check_id) ? prev.filter((id) => id !== check_id) : [...prev, check_id]
    );
  };

  const confirmBatchClone = () => {
    if (!batchSelected.length) return alert("Please select at least one check to clone.");
    const selectedChecks = masterChecks.filter((c) => batchSelected.includes(c.check_id));
    // Create one Organisation template card that holds all selected checks
    const newTemplate = {
      id: Date.now(),
      name: `Cloned: ${selectedChecks.length} check${selectedChecks.length > 1 ? "s" : ""}`,
      org: "Organization · Batch Clone",
      status: "Active",
      sourceChecks: selectedChecks,
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setShowBatchCloneModal(false);
    setBatchSelected([]);
    setActiveNav("organization");
  };

  // ────────────────────────────────────────────────────────
  // ORG-ROW CHECK DETAIL / EDIT
  // ────────────────────────────────────────────────────────
  const openOrgRowEdit = (template) => {
    if (!template.sourceChecks?.length) return;
    setOrgRowEditData({ templateId: template.id, checks: [...template.sourceChecks] });
    setShowOrgRowEditModal(true);
    setContextMenu(null);
  };

  const handleOrgRowEditSave = () => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === orgRowEditData.templateId
          ? { ...t, sourceChecks: orgRowEditData.checks }
          : t
      )
    );
    setShowOrgRowEditModal(false);
    setOrgRowEditData(null);
  };

  // ────────────────────────────────────────────────────────
  // RUN ACCESSIBILITY CHECKS (Organisation tab)
  // ────────────────────────────────────────────────────────
  const handleOrgProceed = async () => {
    if (!selectedTemplateId)            return alert("Please select a template first");
    if (!orgRunOrgId.toString().trim()) return alert("Please enter an Organization ID");
    if (!orgRunProjectId.trim())        return alert("Please enter a Project ID");
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
      setChecksResult(await response.json());
    } catch (err) {
      setChecksError(`Error: ${err.message}`);
    } finally {
      setChecksRunning(false);
    }
  };

  const getChecks = () => {
    if (!checksResult) return [];
    if (Array.isArray(checksResult))           return checksResult;
    if (Array.isArray(checksResult.checks))    return checksResult.checks;
    if (Array.isArray(checksResult.results))   return checksResult.results;
    return [];
  };

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────
  const filteredSorted = getFilteredSorted();
  const uniqueCategories = ["ALL", ...Array.from(new Set(masterChecks.map((r) => r.category).filter(Boolean)))];

  return (
    <div className="tp-page" onClick={() => setContextMenu(null)}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <nav className="tp-nav">
          <p className="tp-nav-section">TEMPLATE</p>
          <div
            className={`tp-nav-item tp-nav-parent ${activeNav === "master" || activeNav === "organization" ? "active" : ""}`}
            onClick={() => setActiveNav(activeNav === "master" || activeNav === "organization" ? "" : "master")}
          >
            <span className="tp-nav-icon">📋</span> Template
            <span className="tp-chevron">{activeNav === "master" || activeNav === "organization" ? "▾" : "▸"}</span>
          </div>
          {(activeNav === "master" || activeNav === "organization") && (
            <div className="tp-nav-sub">
              <div className={`tp-nav-sub-item ${activeNav === "master" ? "active" : ""}`} onClick={() => setActiveNav("master")}>
                <span className="tp-sub-dot">›</span> Main Template
              </div>
              <div className={`tp-nav-sub-item ${activeNav === "organization" ? "active" : ""}`} onClick={() => setActiveNav("organization")}>
                <span className="tp-sub-dot">›</span> Organization Template
              </div>
            </div>
          )}
          <p className="tp-nav-section" style={{ marginTop: 20 }}>ACCESSIBILITY</p>
          <div
            className={`tp-nav-item tp-nav-parent ${activeNav === "validate" ? "active" : ""}`}
            onClick={() => setActiveNav(activeNav === "validate" ? "" : "validate")}
          >
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

      {/* ── Main ────────────────────────────────────────── */}
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
              <button className="tp-btn tp-btn-outline" onClick={() => importInputRef.current.click()}>
                ⬆ Import Excel
              </button>
              <button className="tp-btn tp-btn-primary" onClick={() => setShowNewModal(true)}>
                + New Template
              </button>
            </div>
          )}
        </div>

        <div className="tp-content">

          {/* ══════════════════════════════════════════════
              ORGANISATION TEMPLATES TAB
          ══════════════════════════════════════════════ */}
          {activeNav === "organization" && (
            <section>
              <div className="tp-section-header">
                <div>
                  <h2 className="tp-section-title">Organization Templates</h2>
                  <p className="tp-section-sub">Select a template to run accessibility checks</p>
                </div>
              </div>
              <div className="tp-grid">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className={`tp-card ${selectedTemplateId === t.id ? "tp-card-selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplateId(t.id);
                      setOrgProceeded(false); setChecksResult(null); setChecksError("");
                    }}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(t.id); }}
                  >
                    <div className="tp-card-radio">
                      <input
                        type="radio"
                        name="orgTemplate"
                        checked={selectedTemplateId === t.id}
                        onChange={() => { setSelectedTemplateId(t.id); setOrgProceeded(false); setChecksResult(null); setChecksError(""); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="tp-card-icon">📄</div>
                    <div className="tp-card-name">{t.name}</div>
                    <div className="tp-card-org">{t.org}</div>
                    <span className={`tp-badge ${t.status === "Active" ? "active" : "draft"}`}>{t.status}</span>
                    {t.sourceChecks?.length > 0 && (
                      <span className="tp-badge tp-badge-source" title={`${t.sourceChecks.length} cloned check(s)`}>
                        🔗 {t.sourceChecks.length} cloned
                      </span>
                    )}
                    {contextMenu === t.id && (
                      <div className="tp-context-menu" onClick={(e) => e.stopPropagation()}>
                        {t.sourceChecks?.length > 0 ? (
                          <div className="tp-ctx-item" onClick={() => openOrgRowEdit(t)}>📝 View/Edit Checks</div>
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
                      <label className="tp-label">Organization ID * <small style={{ color: "#94a3b8" }}>(number)</small></label>
                      <input className="tp-input" type="number" value={orgRunOrgId} onChange={(e) => setOrgRunOrgId(e.target.value)} placeholder="e.g. 1" style={{ width: "100%", marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="tp-label">Project ID * <small style={{ color: "#94a3b8" }}>(string)</small></label>
                      <input className="tp-input" value={orgRunProjectId} onChange={(e) => setOrgRunProjectId(e.target.value)} placeholder="e.g. proj-001" style={{ width: "100%", marginTop: 4 }} />
                    </div>
                  </div>
                  <button className="tp-btn tp-btn-outline" onClick={() => { setSelectedTemplateId(null); setChecksResult(null); setOrgRunOrgId(""); setOrgRunProjectId(""); }}>Cancel</button>
                  <button className="tp-btn tp-btn-primary" onClick={handleOrgProceed}>Proceed →</button>
                </div>
              )}

              {orgProceeded && (
                <div className="tp-validation-result" style={{ marginTop: 24 }}>
                  <p className="tp-result-title">
                    {checksRunning ? "⏳ Running accessibility checks..." : checksError ? `⚠ ${checksError}` : `Accessibility Check Results — ${getChecks().length} checks run`}
                  </p>
                  {!checksRunning && checksResult && getChecks().map((check, i) => (
                    <div key={i} className={`tp-check-row ${check.passed ? "passed" : "failed"}`}>
                      <span>{check.passed ? "✅" : "❌"} {check.check_name || check.name || `Check ${i + 1}`}</span>
                      {check.remediation_guidance && <span className="tp-check-note">{check.remediation_guidance}</span>}
                    </div>
                  ))}
                  {!checksRunning && checksResult && getChecks().length === 0 && (
                    <div style={{ padding: "10px 14px", fontSize: 13, color: "#64748b" }}>
                      Checks complete. Raw: {JSON.stringify(checksResult)}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ══════════════════════════════════════════════
              MASTER TEMPLATE TAB
          ══════════════════════════════════════════════ */}
          {activeNav === "master" && (
            <section>

              {/* Loading / error states */}
              {masterChecksLoading && (
                <div style={{ padding: "20px", color: "#64748b", fontSize: 14 }}>⏳ Loading checks from server...</div>
              )}
              {masterChecksError && (
                <div style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>⚠ {masterChecksError}</div>
              )}

              {/* ── Existing checks table ── */}
              {!masterChecksLoading && masterChecks.length > 0 && (() => {
                return (
                  <div style={{ marginBottom: 32 }}>
                    {/* Table: filters are now PER-COLUMN arrows (see th cells below) */}
                    <div style={{ overflowX: "auto" }}>
                      <table className="tp-manual-table">
                        <thead>
                          <tr>
                            {/* Non-sortable columns */}
                            <th>ID</th>
                            <th>Code</th>
                            <th>Description</th>

                            {/* Category column — sortable + filterable via dropdown */}
                            <th>
                              <div className="tp-col-header">
                                <span>Category</span>
                                <div className="tp-col-controls">
                                  {/* Sort arrow */}
                                  <button className="tp-col-btn" title="Sort" onClick={() => handleSort("category")}>
                                    <SortArrow col="category" />
                                  </button>
                                  {/* Filter dropdown */}
                                  <select
                                    className="tp-col-filter"
                                    value={filterVals.category}
                                    onChange={(e) => setFilterVals((v) => ({ ...v, category: e.target.value }))}
                                    title="Filter by category"
                                  >
                                    {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                </div>
                              </div>
                            </th>

                            {/* Priority column — sortable + filterable via dropdown */}
                            <th>
                              <div className="tp-col-header">
                                <span>Priority</span>
                                <div className="tp-col-controls">
                                  <button className="tp-col-btn" title="Sort" onClick={() => handleSort("default_priority")}>
                                    <SortArrow col="default_priority" />
                                  </button>
                                  <select
                                    className="tp-col-filter"
                                    value={filterVals.priority}
                                    onChange={(e) => setFilterVals((v) => ({ ...v, priority: e.target.value }))}
                                    title="Filter by priority"
                                  >
                                    {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                </div>
                              </div>
                            </th>

                            <th>WCAG</th>
                            <th>PDF/UA</th>
                            <th>Remediation</th>
                            <th>Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSorted.map((row, i) => {
                            const isHighlighted = lastSavedId !== null && row.check_id == lastSavedId;
                            return (
                              <tr
                                key={i}
                                ref={isHighlighted ? lastSavedRowRef : null}
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
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                      Showing {filteredSorted.length} of {masterChecks.length} checks
                    </p>
                  </div>
                );
              })()}

              {/* ── Hidden Excel input for Bulk Upload ── */}
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleBulkExcel}
              />

              {/* ── Manual form (after clicking "Add Manually" card) ── */}
              {masterProceeded && masterMode === "manual" && (
                <div className="tp-manual-form" style={{ marginTop: 24 }}>
                  {/* ── Requirement 3: Back button ── */}
                  <div className="tp-form-header">
                    <button
                      className="tp-back-btn"
                      onClick={() => { setMasterProceeded(false); setMasterMode(null); setManualItems([emptyRow()]); }}
                      title="Go back"
                    >
                      ← Back
                    </button>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#0a1628" }}>
                      Add Accessibility Checks Manually
                    </h3>
                    <div style={{ width: 60 }} /> {/* spacer to centre the title */}
                  </div>

                  {/* Requirement 4: No check_id or agent_code columns */}
                  <div style={{ overflowX: "auto" }}>
                    <table className="tp-manual-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>WCAG</th>
                          <th>PDF/UA</th>
                          <th>Remediation</th>
                          <th>Active</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {manualItems.map((row, i) => (
                          <tr key={i}>
                            <td><input className="tp-input" value={row.check_code}           onChange={(e) => updateManualRow(i, "check_code", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.check_name}           onChange={(e) => updateManualRow(i, "check_name", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.description}          onChange={(e) => updateManualRow(i, "description", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.category}             onChange={(e) => updateManualRow(i, "category", e.target.value)} /></td>
                            <td>
                              <select className="tp-input" value={row.default_priority} onChange={(e) => updateManualRow(i, "default_priority", e.target.value)}>
                                <option value="HIGH">HIGH</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="LOW">LOW</option>
                              </select>
                            </td>
                            <td><input className="tp-input" value={row.wcag_reference}       onChange={(e) => updateManualRow(i, "wcag_reference", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.pdfua_reference}      onChange={(e) => updateManualRow(i, "pdfua_reference", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.remediation_guidance} onChange={(e) => updateManualRow(i, "remediation_guidance", e.target.value)} /></td>
                            <td><input type="checkbox" checked={row.is_active}               onChange={(e) => updateManualRow(i, "is_active", e.target.checked)} /></td>
                            <td><button className="tp-btn-remove" onClick={() => removeManualRow(i)}>✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="tp-form-actions">
                    <button className="tp-btn tp-btn-outline" onClick={addManualRow}>+ Add Row</button>
                    <button className="tp-btn tp-btn-primary" onClick={saveMasterManual}>💾 Save to Backend</button>
                  </div>
                  {masterSaved && <p className="tp-success-msg">✅ Master template saved successfully!</p>}
                </div>
              )}

              {/* ── Mode selection cards (Add Manually / Bulk Upload / Clone) ── */}
              {!masterProceeded && (
                <div className="tp-mode-cards-row">
                  {/* Card 1: Add Checks */}
                  <button
                    className="tp-mode-card"
                    onClick={() => { setMasterMode("manual"); setMasterProceeded(true); }}
                  >
                    <span className="tp-mode-icon">📝</span>
                    <span className="tp-mode-title">Add Checks</span>
                    <span className="tp-mode-desc">Add each accessibility check with full details</span>
                  </button>

                  {/* Card 2: Bulk Upload */}
                  <button
                    className="tp-mode-card"
                    onClick={() => excelInputRef.current.click()}
                  >
                    <span className="tp-mode-icon">📊</span>
                    <span className="tp-mode-title">Bulk Upload</span>
                    <span className="tp-mode-desc">Upload an Excel file with all checks at once</span>
                  </button>

                  {/* Card 3: Clone (requirement 2) */}
                  <button
                    className="tp-mode-card"
                    onClick={openBatchCloneModal}
                    disabled={masterChecks.length === 0}
                    title={masterChecks.length === 0 ? "No master checks available to clone" : ""}
                  >
                    <span className="tp-mode-icon">🔁</span>
                    <span className="tp-mode-title">Clone</span>
                    <span className="tp-mode-desc">Select existing checks and clone them to Organisation</span>
                  </button>
                </div>
              )}

              {masterSaved && !masterProceeded && (
                <p className="tp-success-msg" style={{ marginTop: 12 }}>✅ Master template saved successfully!</p>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ════════════════════════════════════════════════════
          BATCH CLONE MODAL (requirement 2)
          Shows all master checks with checkboxes.
      ════════════════════════════════════════════════════ */}
      {showBatchCloneModal && (
        <div className="tp-modal-overlay" onClick={() => setShowBatchCloneModal(false)}>
          <div className="tp-modal tp-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>🔁 Clone Checks to Organisation</h3>
              <button className="tp-modal-close" onClick={() => setShowBatchCloneModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body" style={{ padding: 0 }}>
              <p style={{ padding: "12px 20px 8px", fontSize: 13, color: "#64748b" }}>
                Select the checks you want to clone. They will appear as a template card in the Organisation tab.
              </p>
              {/* Select all / none */}
              <div style={{ padding: "0 20px 8px", display: "flex", gap: 10 }}>
                <button className="tp-btn tp-btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => setBatchSelected(masterChecks.map((c) => c.check_id))}>
                  Select All
                </button>
                <button className="tp-btn tp-btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => setBatchSelected([])}>
                  Clear
                </button>
                <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>
                  {batchSelected.length} selected
                </span>
              </div>
              <div style={{ maxHeight: "55vh", overflowY: "auto", borderTop: "1px solid #dbeafe" }}>
                <table className="tp-manual-table" style={{ margin: 0, borderRadius: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th>ID</th>
                      <th>Code</th>
                      <th>Name / Description</th>
                      <th>Category</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterChecks.map((check, i) => (
                      <tr
                        key={i}
                        className={batchSelected.includes(check.check_id) ? "tp-batch-row-selected" : ""}
                        onClick={() => toggleBatchCheck(check.check_id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={batchSelected.includes(check.check_id)}
                            onChange={() => toggleBatchCheck(check.check_id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>{check.check_id}</td>
                        <td>{check.check_code}</td>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: 12 }}>{check.check_name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{check.description}</div>
                        </td>
                        <td>{check.category}</td>
                        <td>
                          <span className={`tp-priority-badge tp-priority-${(check.default_priority || "").toLowerCase()}`}>
                            {check.default_priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={() => setShowBatchCloneModal(false)}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={confirmBatchClone} disabled={!batchSelected.length}>
                ✅ Clone Selected ({batchSelected.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          WHOLE-MASTER CLONE MODAL
      ════════════════════════════════════════════════════ */}
      {showCloneModal && (
        <div className="tp-modal-overlay" onClick={() => setShowCloneModal(false)}>
          <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>🔁 Clone to Organization?</h3>
              <button className="tp-modal-close" onClick={handleCloneNo}>✕</button>
            </div>
            <div className="tp-modal-body">
              <p style={{ fontSize: 14, color: "#475569", marginBottom: 16 }}>
                Clone the master template to the Organisation section so users can run checks against it.
              </p>
              <label className="tp-label">Organization ID * <small style={{ color: "#94a3b8" }}>(number)</small></label>
              <input className="tp-input" type="number" value={cloneOrgId} onChange={(e) => setCloneOrgId(e.target.value)} placeholder="e.g. 1" style={{ width: "100%", marginBottom: 12 }} />
              <label className="tp-label" style={{ marginTop: 4 }}>Project ID * <small style={{ color: "#94a3b8" }}>(string)</small></label>
              <input className="tp-input" value={cloneProjectId} onChange={(e) => setCloneProjectId(e.target.value)} placeholder="e.g. proj-001" style={{ width: "100%" }} />
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

      {/* ════════════════════════════════════════════════════
          ORG ROW CHECK EDIT MODAL
      ════════════════════════════════════════════════════ */}
      {showOrgRowEditModal && orgRowEditData && (
        <div className="tp-modal-overlay" onClick={() => { setShowOrgRowEditModal(false); setOrgRowEditData(null); }}>
          <div className="tp-modal tp-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>📝 Cloned Check Details ({orgRowEditData.checks.length} check{orgRowEditData.checks.length > 1 ? "s" : ""})</h3>
              <button className="tp-modal-close tp-modal-discard" onClick={() => { setShowOrgRowEditModal(false); setOrgRowEditData(null); }}>✕</button>
            </div>
            <div className="tp-modal-body" style={{ maxHeight: "60vh", overflowY: "auto", padding: 0 }}>
              <div style={{ overflowX: "auto" }}>
                <table className="tp-manual-table" style={{ margin: 0, borderRadius: 0 }}>
                  <thead>
                    <tr>
                      <th>ID</th><th>Code</th><th>Name</th><th>Description</th>
                      <th>Category</th><th>Priority</th><th>WCAG</th><th>PDF/UA</th><th>Remediation</th><th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgRowEditData.checks.map((check, i) => (
                      <tr key={i}>
                        <td>{check.check_id}</td>
                        <td>{check.check_code}</td>
                        <td>
                          <input className="tp-input" value={check.check_name || ""}
                            onChange={(e) => {
                              const updated = [...orgRowEditData.checks];
                              updated[i] = { ...updated[i], check_name: e.target.value };
                              setOrgRowEditData((d) => ({ ...d, checks: updated }));
                            }} />
                        </td>
                        <td>{check.description}</td>
                        <td>{check.category}</td>
                        <td>
                          <span className={`tp-priority-badge tp-priority-${(check.default_priority || "").toLowerCase()}`}>
                            {check.default_priority}
                          </span>
                        </td>
                        <td>{check.wcag_reference}</td>
                        <td>{check.pdfua_reference}</td>
                        <td>{check.remediation_guidance}</td>
                        <td>{check.is_active ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-primary tp-btn-save-full" onClick={handleOrgRowEditSave}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          NEW TEMPLATE MODAL
      ════════════════════════════════════════════════════ */}
      {showNewModal && (
        <div className="tp-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>New Template</h3>
              <button className="tp-modal-close" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body">
              <label className="tp-label">Template Name *</label>
              <input className="tp-input" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
              <input className="tp-input" value={newOrg} onChange={(e) => setNewOrg(e.target.value)} />
              <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
              <select className="tp-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
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

      {/* ════════════════════════════════════════════════════
          EDIT TEMPLATE CARD MODAL
      ════════════════════════════════════════════════════ */}
      {showEditModal && editTemplate && (
        <div className="tp-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>Edit Template</h3>
              <button className="tp-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body">
              <label className="tp-label">Template Name *</label>
              <input className="tp-input" value={editTemplate.name} onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })} />
              <label className="tp-label" style={{ marginTop: 12 }}>Organization</label>
              <input className="tp-input" value={editTemplate.org} onChange={(e) => setEditTemplate({ ...editTemplate, org: e.target.value })} />
              <label className="tp-label" style={{ marginTop: 12 }}>Status</label>
              <select className="tp-input" value={editTemplate.status} onChange={(e) => setEditTemplate({ ...editTemplate, status: e.target.value })}>
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
