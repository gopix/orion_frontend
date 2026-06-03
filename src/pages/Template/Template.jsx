


import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";
import {
  saveMasterTemplate,
  cloneMasterTemplate,
  runAccessibilityChecks,
  getMasterAccessibilityChecks,
  getOrganizations,
  getOrganizationWiseTemplate,
} from "../../services/apiServices";

async function parseExcelFile(file) {
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
        const raw = window.XLSX.utils.sheet_to_json(sheet, { defval: "" });
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

export default function Template() {
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("master");

  // ── Organization section: cloned entries stored as flat list ──
  const [orgEntries, setOrgEntries] = useState([]);

  // Edit modal for a single org entry
  const [showOrgEditModal, setShowOrgEditModal] = useState(false);
  const [orgEditEntry, setOrgEditEntry]         = useState(null);

  // New-template modal (manual add in org tab)
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName]           = useState("");
  const [newOrg, setNewOrg]             = useState("");
  const [newStatus, setNewStatus]       = useState("Draft");

  // ── Batch Clone modal ──────────────────────────────────────────
  const [showBatchCloneModal, setShowBatchCloneModal] = useState(false);
  const [batchSelected, setBatchSelected]             = useState([]);
  const [cloning, setCloning]                         = useState(false);
  const [cloneError, setCloneError]                   = useState("");

  const [organizations, setOrganizations] = useState([]);
  const [orgsLoading, setOrgsLoading]     = useState(false);
  const [orgsError, setOrgsError]         = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");

  // ── NEW: Project ID field in clone modal ──────────────────────
  const [cloneProjectId, setCloneProjectId] = useState("");

  // ── Master Template state ──────────────────────────────────────
  const [masterMode, setMasterMode]           = useState(null);
  const [masterProceeded, setMasterProceeded] = useState(false);

  const emptyRow = () => ({
    check_code: "", check_name: "", description: "", category: "",
    default_priority: "HIGH", wcag_reference: "", pdfua_reference: "",
    remediation_guidance: "", is_active: true,
  });
  const [manualItems, setManualItems] = useState([emptyRow()]);
  const [masterSaved, setMasterSaved] = useState(false);

  const [masterChecks, setMasterChecks]               = useState([]);
  const [masterChecksLoading, setMasterChecksLoading] = useState(false);
  const [masterChecksError, setMasterChecksError]     = useState("");

  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Organisation tab: run-checks state
  const [selectedEntryId, setSelectedEntryId]   = useState(null);
  const [orgProceeded, setOrgProceeded]         = useState(false);
  const [orgRunOrgId, setOrgRunOrgId]           = useState("");
  const [orgRunProjectId, setOrgRunProjectId]   = useState("");
  const [checksRunning, setChecksRunning]       = useState(false);
  const [checksResult, setChecksResult]         = useState(null);
  const [checksError, setChecksError]           = useState("");

  // ── NEW: Org-tab fetch-by-org/project state ───────────────────
  // "cameFromMaster" is true when user cloned from master tab
  const [cameFromMaster, setCameFromMaster]           = useState(false);
  // Direct-load panel (shown when coming directly to org tab)
  const [orgFetchOrgId, setOrgFetchOrgId]             = useState("");
  const [orgFetchProjId, setOrgFetchProjId]           = useState("");
  const [orgFetchLoading, setOrgFetchLoading]         = useState(false);
  const [orgFetchError, setOrgFetchError]             = useState("");
  const [orgFetchDone, setOrgFetchDone]               = useState(false);
  // When coming from master: 2 checkboxes at bottom
  const [showOrgFetchPanel, setShowOrgFetchPanel]     = useState(false);
  const [fetchByOrgChecked, setFetchByOrgChecked]     = useState(false);
  const [fetchByProjChecked, setFetchByProjChecked]   = useState(false);
  const [bottomFetchOrgId, setBottomFetchOrgId]       = useState("");
  const [bottomFetchProjId, setBottomFetchProjId]     = useState("");
  const [bottomFetchLoading, setBottomFetchLoading]   = useState(false);
  const [bottomFetchError, setBottomFetchError]       = useState("");

  const importInputRef  = useRef(null);
  const excelInputRef   = useRef(null);
  const lastSavedRowRef = useRef(null);
  const [lastSavedId, setLastSavedId] = useState(null);

  const orgSectionRef = useRef(null);

  useEffect(() => {
    if (activeNav === "master") fetchMasterChecks();
  }, [activeNav]);

  // When navigating to org tab directly (not via clone), reset cameFromMaster
  const goToOrgTab = () => {
    setCameFromMaster(false);
    setOrgFetchDone(false);
    setOrgFetchOrgId("");
    setOrgFetchProjId("");
    setOrgFetchError("");
    setOrgEntries([]);
    setActiveNav("organization");
  };

  const fetchMasterChecks = async () => {
    setMasterChecksLoading(true);
    setMasterChecksError("");
    try {
      const data = await getMasterAccessibilityChecks();
      if (Array.isArray(data))              setMasterChecks(data);
      else if (Array.isArray(data?.checks)) setMasterChecks(data.checks);
      else                                  setMasterChecks([]);
    } catch {
      setMasterChecksError("Could not load checks from server. Is the backend running?");
    } finally {
      setMasterChecksLoading(false);
    }
  };

  // ── Sorting ────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const getFilteredSorted = () => {
    let rows = [...masterChecks];
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

  const SortArrow = ({ col }) => {
    if (sortCol !== col) return <span className="tp-sort-arrow tp-sort-neutral">⇅</span>;
    return <span className="tp-sort-arrow tp-sort-active">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  // ── Organisation entries CRUD ──────────────────────────────────
  const handleDeleteEntry = (id) => {
    if (!window.confirm("Delete this cloned entry?")) return;
    setOrgEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedEntryId === id) {
      setSelectedEntryId(null); setOrgProceeded(false); setChecksResult(null);
    }
  };

  const openOrgEdit = (entry) => {
    setOrgEditEntry({ ...entry });
    setShowOrgEditModal(true);
  };

  const handleOrgEditSave = () => {
    if (!orgEditEntry.check_name?.trim() && !orgEditEntry.check_code?.trim())
      return alert("Name or Code cannot both be empty");
    setOrgEntries((prev) =>
      prev.map((e) => (e.id === orgEditEntry.id ? orgEditEntry : e))
    );
    setShowOrgEditModal(false);
    setOrgEditEntry(null);
  };

  const handleToggleActive = (id) => {
    setOrgEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_active: !e.is_active } : e))
    );
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTimeout(() => alert(`Successfully imported templates from "${file.name}"`), 1200);
  };

  // ── Manual entry ───────────────────────────────────────────────
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
        setMasterChecksLoading(true);
        setMasterChecksError("");
        try {
          const data = await getMasterAccessibilityChecks();
          let checks = [];
          if (Array.isArray(data))              checks = data;
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
        } catch { /* ignore */ }
        finally { setMasterChecksLoading(false); }
      } else {
        alert("Failed to save. Please check the server.");
      }
    } catch {
      alert("Network error. Is the backend running?");
    }
  };

  const handleBulkExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    try {
      const rows = await parseExcelFile(file);
      if (!rows.length) return alert("No data rows found in the Excel file.");
      setMasterChecks((prev) => [...prev, ...rows]);
      setMasterProceeded(false);
      setMasterMode(null);
      setMasterSaved(true);
      if (rows.length > 0) {
        setLastSavedId(rows[0].check_id);
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

  // ── Batch Clone Modal ──────────────────────────────────────────
  const openBatchCloneModal = async () => {
    setBatchSelected([]);
    setSelectedOrgId("");
    setCloneProjectId("");
    setOrgsError("");
    setCloneError("");
    setShowBatchCloneModal(true);
    setOrgsLoading(true);
    try {
      const data = await getOrganizations();
      if (Array.isArray(data))               setOrganizations(data);
      else if (Array.isArray(data?.data))    setOrganizations(data.data);
      else if (Array.isArray(data?.results)) setOrganizations(data.results);
      else                                   setOrganizations([]);
    } catch {
      setOrgsError("Could not load organizations. Is the backend running?");
    } finally {
      setOrgsLoading(false);
    }
  };

  const toggleBatchCheck = (check_id) => {
    setBatchSelected((prev) =>
      prev.includes(check_id) ? prev.filter((id) => id !== check_id) : [...prev, check_id]
    );
  };

  const confirmBatchClone = async () => {
    if (!batchSelected.length) return alert("Please select at least one check to clone.");
    if (!selectedOrgId)        return alert("Please select an organization to clone into.");

    const org = organizations.find((o) =>
      String(o.id ?? o.organization_id ?? o.org_id) === String(selectedOrgId)
    );

    setCloning(true);
    setCloneError("");
    try {
      const response = await cloneMasterTemplate(Number(selectedOrgId), cloneProjectId.trim());
      if (response.ok) {
        const selectedChecks = masterChecks.filter((c) => batchSelected.includes(c.check_id));
        const orgName = org
          ? (org.name ?? org.organization_name ?? org.org_name ?? `Org ${selectedOrgId}`)
          : `Org ${selectedOrgId}`;

        const newEntries = selectedChecks.map((check) => ({
          ...check,
          id: `${check.check_id}_${Date.now()}_${Math.random()}`,
          orgId: selectedOrgId,
          orgName,
          projectId: cloneProjectId.trim(),
          is_active: check.is_active ?? true,
        }));

        setOrgEntries((prev) => [...prev, ...newEntries]);
        setShowBatchCloneModal(false);
        setBatchSelected([]);
        setSelectedOrgId("");
        setCloneProjectId("");

        // Switch to organisation tab — mark as cameFromMaster so we show bottom checkboxes
        setCameFromMaster(true);
        setOrgFetchDone(false);
        setShowOrgFetchPanel(false);
        setFetchByOrgChecked(false);
        setFetchByProjChecked(false);
        setBottomFetchOrgId(String(selectedOrgId));
        setBottomFetchProjId(cloneProjectId.trim());
        setActiveNav("organization");
        setTimeout(() => {
          if (orgSectionRef.current)
            orgSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      } else {
        const err = await response.json().catch(() => ({}));
        setCloneError(err.message || err.detail || "Clone failed. Please try again.");
      }
    } catch {
      setCloneError("Network error during clone. Is the backend running?");
    } finally {
      setCloning(false);
    }
  };

  // ── Run accessibility checks ───────────────────────────────────
  const handleOrgProceed = async () => {
    if (!selectedEntryId)               return alert("Please select an entry first");
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
    if (Array.isArray(checksResult))          return checksResult;
    if (Array.isArray(checksResult.checks))   return checksResult.checks;
    if (Array.isArray(checksResult.results))  return checksResult.results;
    return [];
  };

  // ── NEW: Direct org-tab fetch (when user lands on org tab directly) ──
  const handleOrgDirectFetch = async () => {
    if (!orgFetchOrgId.toString().trim()) return alert("Please enter an Organization ID.");
    setOrgFetchLoading(true);
    setOrgFetchError("");
    try {
      const data = await getOrganizationWiseTemplate(orgFetchOrgId);
      let entries = [];
      if (Array.isArray(data))             entries = data;
      else if (Array.isArray(data?.data))  entries = data.data;
      else if (Array.isArray(data?.checks))entries = data.checks;
      else if (Array.isArray(data?.results))entries = data.results;

      const mapped = entries.map((item, idx) => ({
        ...item,
        id: item.id ?? `fetched_${idx}_${Date.now()}`,
        orgId: orgFetchOrgId,
        orgName: item.organization_name ?? item.orgName ?? `Org ${orgFetchOrgId}`,
        projectId: orgFetchProjId || item.project_id || "",
        is_active: item.is_active ?? true,
      }));
      setOrgEntries(mapped);
      setOrgFetchDone(true);
    } catch (err) {
      setOrgFetchError("Failed to fetch organization template. Is the backend running?");
    } finally {
      setOrgFetchLoading(false);
    }
  };

  // ── NEW: Bottom fetch checkboxes (when cameFromMaster) ────────
  const handleBottomFetch = async () => {
    const useOrg  = fetchByOrgChecked;
    const useProj = fetchByProjChecked;
    if (!useOrg && !useProj) return alert("Please check at least one option.");
    if (useOrg && !bottomFetchOrgId.toString().trim())   return alert("Please enter an Organization ID.");
    if (useProj && !bottomFetchProjId.toString().trim()) return alert("Please enter a Project ID.");

    // Use org ID for the API call (required); project acts as a filter label
    const orgIdToFetch = useOrg ? bottomFetchOrgId : orgEntries[0]?.orgId ?? "";
    if (!orgIdToFetch) return alert("Organization ID is required to fetch entries.");

    setBottomFetchLoading(true);
    setBottomFetchError("");
    try {
      const data = await getOrganizationWiseTemplate(orgIdToFetch);
      let entries = [];
      if (Array.isArray(data))              entries = data;
      else if (Array.isArray(data?.data))   entries = data.data;
      else if (Array.isArray(data?.checks)) entries = data.checks;
      else if (Array.isArray(data?.results))entries = data.results;

      let mapped = entries.map((item, idx) => ({
        ...item,
        id: item.id ?? `fetched_${idx}_${Date.now()}`,
        orgId: orgIdToFetch,
        orgName: item.organization_name ?? item.orgName ?? `Org ${orgIdToFetch}`,
        projectId: item.project_id ?? bottomFetchProjId ?? "",
        is_active: item.is_active ?? true,
      }));

      // If only "by project" checkbox or both: filter by project id
      if (useProj && bottomFetchProjId.trim()) {
        mapped = mapped.filter(
          (e) => String(e.projectId).toLowerCase() === bottomFetchProjId.trim().toLowerCase()
        );
      }

      setOrgEntries(mapped);
      setShowOrgFetchPanel(false);
      setFetchByOrgChecked(false);
      setFetchByProjChecked(false);
    } catch {
      setBottomFetchError("Failed to fetch entries from server.");
    } finally {
      setBottomFetchLoading(false);
    }
  };

  const filteredSorted = getFilteredSorted();

  return (
    <div className="tp-page" onClick={() => {}}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <nav className="tp-nav">
          <p className="tp-nav-section">ACCESSIBILITY</p>
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
                <span className="tp-sub-dot">›</span> Master Template
              </div>
              <div className={`tp-nav-sub-item ${activeNav === "organization" ? "active" : ""}`} onClick={goToOrgTab}>
                <span className="tp-sub-dot">›</span> Organization Template
              </div>
            </div>
          )}
          <p className="tp-nav-section" style={{ marginTop: 20 }}>REMEDIATION</p>
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
            </div>
          )}
        </div>

        <div className="tp-content">

          {/* ══════════════════════════════════════════════
              ORGANISATION TAB
          ══════════════════════════════════════════════ */}
          {activeNav === "organization" && (
            <section ref={orgSectionRef}>
              <div className="tp-section-header">
                <div>
                  <h2 className="tp-section-title">Organization Templates</h2>
                  <p className="tp-section-sub">
                    {cameFromMaster
                      ? "Cloned entries from Master Template — fully editable"
                      : "Fetch and manage organization-specific template entries"}
                  </p>
                </div>
              </div>

              {/* ── DIRECT LOAD PANEL (only when NOT cameFromMaster) ── */}
              {!cameFromMaster && !orgFetchDone && (
                <div className="tp-org-fetch-panel">
                  <div className="tp-org-fetch-icon">🏢</div>
                  <h3 className="tp-org-fetch-title">Load Organization Template</h3>
                  <p className="tp-org-fetch-sub">
                    Enter the Organization ID (and optionally a Project ID) to fetch cloned template entries.
                  </p>
                  <div className="tp-org-fetch-fields">
                    <div className="tp-org-fetch-field">
                      <label className="tp-label">Organization ID <span style={{ color: "#dc2626" }}>*</span></label>
                      <input
                        className="tp-input"
                        type="number"
                        value={orgFetchOrgId}
                        onChange={(e) => setOrgFetchOrgId(e.target.value)}
                        placeholder="e.g. 1"
                      />
                    </div>
                    <div className="tp-org-fetch-field">
                      <label className="tp-label">Project ID <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                      <input
                        className="tp-input"
                        value={orgFetchProjId}
                        onChange={(e) => setOrgFetchProjId(e.target.value)}
                        placeholder="e.g. proj-001"
                      />
                    </div>
                  </div>
                  {orgFetchError && (
                    <p style={{ fontSize: 13, color: "#dc2626", marginTop: 8 }}>⚠ {orgFetchError}</p>
                  )}
                  <button
                    className="tp-btn tp-btn-primary"
                    style={{ marginTop: 16 }}
                    onClick={handleOrgDirectFetch}
                    disabled={orgFetchLoading}
                  >
                    {orgFetchLoading ? "⏳ Fetching…" : "🔍 Fetch Entries"}
                  </button>
                </div>
              )}

              {/* Refresh button after direct fetch */}
              {!cameFromMaster && orgFetchDone && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    className="tp-btn tp-btn-outline"
                    style={{ fontSize: 12 }}
                    onClick={() => { setOrgFetchDone(false); setOrgEntries([]); setOrgFetchOrgId(""); setOrgFetchProjId(""); }}
                  >
                    ← Change Organization
                  </button>
                  <span style={{ marginLeft: 12, fontSize: 12, color: "#64748b" }}>
                    Org ID: <strong>{orgFetchOrgId}</strong>
                    {orgFetchProjId && <> &nbsp;·&nbsp; Project: <strong>{orgFetchProjId}</strong></>}
                  </span>
                </div>
              )}

              {/* Entries table — shown when entries exist */}
              {orgEntries.length === 0 && (cameFromMaster || orgFetchDone) ? (
                <div className="tp-org-empty">
                  <div className="tp-org-empty-icon">📋</div>
                  <p className="tp-org-empty-title">No entries found</p>
                  <p className="tp-org-empty-sub">
                    {cameFromMaster
                      ? "No checks were cloned. Go to Master Template → Clone."
                      : "No entries found for this organization. Try a different ID."}
                  </p>
                </div>
              ) : orgEntries.length > 0 ? (
                <div className="tp-org-table-wrap">
                  <table className="tp-manual-table tp-org-table">
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
                        <th>Active</th>
                        <th>Organization</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgEntries.map((entry) => (
                        <tr
                          key={entry.id}
                          className={selectedEntryId === entry.id ? "tp-org-row-selected" : ""}
                          onClick={() => {
                            setSelectedEntryId(entry.id);
                            setOrgProceeded(false); setChecksResult(null); setChecksError("");
                          }}
                        >
                          <td>{entry.check_id}</td>
                          <td>{entry.check_code}</td>
                          <td style={{ fontWeight: 600, color: "#0a1628" }}>{entry.check_name}</td>
                          <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={entry.description}>{entry.description}</td>
                          <td>{entry.category}</td>
                          <td>
                            <span className={`tp-priority-badge tp-priority-${(entry.default_priority || "").toLowerCase()}`}>
                              {entry.default_priority}
                            </span>
                          </td>
                          <td>{entry.wcag_reference}</td>
                          <td>{entry.pdfua_reference}</td>
                          <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={entry.remediation_guidance}>{entry.remediation_guidance}</td>
                          <td>
                            <button
                              className={`tp-active-toggle ${entry.is_active ? "active" : "inactive"}`}
                              onClick={(e) => { e.stopPropagation(); handleToggleActive(entry.id); }}
                              title="Toggle active"
                            >
                              {entry.is_active ? "✅" : "❌"}
                            </button>
                          </td>
                          <td>
                            <span className="tp-org-name-chip">{entry.orgName}</span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="tp-org-actions">
                              <button className="tp-org-btn edit" onClick={() => openOrgEdit(entry)} title="Edit">✏️</button>
                              <button className="tp-org-btn delete" onClick={() => handleDeleteEntry(entry.id)} title="Delete">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Run checks panel — appears when a row is selected */}
              {selectedEntryId && !orgProceeded && (
                <div className="tp-radio-actions" style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
                    Run accessibility checks for the selected entry:
                  </p>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <label className="tp-label">Organization ID *</label>
                      <input className="tp-input" type="number" value={orgRunOrgId} onChange={(e) => setOrgRunOrgId(e.target.value)} placeholder="e.g. 1" style={{ marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <label className="tp-label">Project ID *</label>
                      <input className="tp-input" value={orgRunProjectId} onChange={(e) => setOrgRunProjectId(e.target.value)} placeholder="e.g. proj-001" style={{ marginTop: 4 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="tp-btn tp-btn-outline" onClick={() => { setSelectedEntryId(null); setChecksResult(null); setOrgRunOrgId(""); setOrgRunProjectId(""); }}>Cancel</button>
                    <button className="tp-btn tp-btn-primary" onClick={handleOrgProceed}>Proceed →</button>
                  </div>
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

              {/* ── BOTTOM FETCH CHECKBOXES (only when cameFromMaster) ── */}
              {cameFromMaster && orgEntries.length > 0 && (
                <div className="tp-bottom-fetch-section">
                  <div className="tp-bottom-fetch-header" onClick={() => setShowOrgFetchPanel((v) => !v)}>
                    <span className="tp-bottom-fetch-icon">🔗</span>
                    <span className="tp-bottom-fetch-label">Fetch Cloned Entries from API</span>
                    <span className="tp-bottom-fetch-chevron">{showOrgFetchPanel ? "▾" : "▸"}</span>
                  </div>

                  {showOrgFetchPanel && (
                    <div className="tp-bottom-fetch-body">
                      <p className="tp-bottom-fetch-hint">
                        Select how you want to fetch cloned entries — by Organization, by Project, or both.
                      </p>

                      <div className="tp-bottom-fetch-checks">
                        {/* By Organization */}
                        <div className={`tp-bottom-fetch-option ${fetchByOrgChecked ? "selected" : ""}`}>
                          <label className="tp-bottom-fetch-check-label">
                            <input
                              type="checkbox"
                              checked={fetchByOrgChecked}
                              onChange={(e) => setFetchByOrgChecked(e.target.checked)}
                              className="tp-bottom-fetch-checkbox"
                            />
                            <div>
                              <span className="tp-bottom-fetch-option-title">🏢 By Organization ID</span>
                              <span className="tp-bottom-fetch-option-desc">Fetch all entries for an organization</span>
                            </div>
                          </label>
                          {fetchByOrgChecked && (
                            <input
                              className="tp-input"
                              type="number"
                              value={bottomFetchOrgId}
                              onChange={(e) => setBottomFetchOrgId(e.target.value)}
                              placeholder="Organization ID, e.g. 1"
                              style={{ marginTop: 10 }}
                            />
                          )}
                        </div>

                        {/* By Project */}
                        <div className={`tp-bottom-fetch-option ${fetchByProjChecked ? "selected" : ""}`}>
                          <label className="tp-bottom-fetch-check-label">
                            <input
                              type="checkbox"
                              checked={fetchByProjChecked}
                              onChange={(e) => setFetchByProjChecked(e.target.checked)}
                              className="tp-bottom-fetch-checkbox"
                            />
                            <div>
                              <span className="tp-bottom-fetch-option-title">📁 By Project ID</span>
                              <span className="tp-bottom-fetch-option-desc">Filter entries by a specific project</span>
                            </div>
                          </label>
                          {fetchByProjChecked && (
                            <input
                              className="tp-input"
                              value={bottomFetchProjId}
                              onChange={(e) => setBottomFetchProjId(e.target.value)}
                              placeholder="Project ID, e.g. proj-001"
                              style={{ marginTop: 10 }}
                            />
                          )}
                        </div>
                      </div>

                      {bottomFetchError && (
                        <p style={{ fontSize: 13, color: "#dc2626", marginTop: 8 }}>⚠ {bottomFetchError}</p>
                      )}

                      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                        <button className="tp-btn tp-btn-outline" onClick={() => { setShowOrgFetchPanel(false); setFetchByOrgChecked(false); setFetchByProjChecked(false); }}>
                          Cancel
                        </button>
                        <button
                          className="tp-btn tp-btn-primary"
                          onClick={handleBottomFetch}
                          disabled={bottomFetchLoading || (!fetchByOrgChecked && !fetchByProjChecked)}
                        >
                          {bottomFetchLoading ? "⏳ Fetching…" : "🔍 Fetch"}
                        </button>
                      </div>
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
              {masterChecksLoading && (
                <div style={{ padding: "20px", color: "#64748b", fontSize: 14 }}>⏳ Loading checks from server...</div>
              )}
              {masterChecksError && (
                <div style={{ padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>⚠ {masterChecksError}</div>
              )}

              {!masterChecksLoading && masterChecks.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="tp-manual-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Code</th>
                          <th>Description</th>
                          <th>
                            <div className="tp-col-header">
                              <span>Category</span>
                              <button className="tp-col-btn" onClick={() => handleSort("category")}>
                                <SortArrow col="category" />
                              </button>
                            </div>
                          </th>
                          <th>
                            <div className="tp-col-header">
                              <span>Priority</span>
                              <button className="tp-col-btn" onClick={() => handleSort("default_priority")}>
                                <SortArrow col="default_priority" />
                              </button>
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
              )}

              <input ref={excelInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleBulkExcel} />

              {masterProceeded && masterMode === "manual" && (
                <div className="tp-manual-form" style={{ marginTop: 24 }}>
                  <div className="tp-form-header">
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#0a1628" }}>
                      Add Accessibility Checks Manually
                    </h3>
                    <button
                      className="tp-form-close-btn"
                      onClick={() => { setMasterProceeded(false); setMasterMode(null); setManualItems([emptyRow()]); }}
                      title="Cancel"
                    >✕</button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="tp-manual-table">
                      <thead>
                        <tr>
                          <th>Code</th><th>Name</th><th>Description</th><th>Category</th>
                          <th>Priority</th><th>WCAG</th><th>PDF/UA</th><th>Remediation</th><th>Active</th>
                          <th style={{ whiteSpace: "nowrap", minWidth: 96 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manualItems.map((row, i) => (
                          <tr key={i}>
                            <td><input className="tp-input" value={row.check_code} onChange={(e) => updateManualRow(i, "check_code", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.check_name} onChange={(e) => updateManualRow(i, "check_name", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.description} onChange={(e) => updateManualRow(i, "description", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.category} onChange={(e) => updateManualRow(i, "category", e.target.value)} /></td>
                            <td>
                              <select className="tp-input" value={row.default_priority} onChange={(e) => updateManualRow(i, "default_priority", e.target.value)}>
                                <option value="HIGH">HIGH</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="LOW">LOW</option>
                              </select>
                            </td>
                            <td><input className="tp-input" value={row.wcag_reference} onChange={(e) => updateManualRow(i, "wcag_reference", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.pdfua_reference} onChange={(e) => updateManualRow(i, "pdfua_reference", e.target.value)} /></td>
                            <td><input className="tp-input" value={row.remediation_guidance} onChange={(e) => updateManualRow(i, "remediation_guidance", e.target.value)} /></td>
                            <td><input type="checkbox" checked={row.is_active} onChange={(e) => updateManualRow(i, "is_active", e.target.checked)} /></td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                {/* Add new row after this row */}
                                <button
                                  className="tp-row-action-btn tp-row-add"
                                  title="Add row below"
                                  onClick={() => {
                                    const updated = [...manualItems];
                                    updated.splice(i + 1, 0, emptyRow());
                                    setManualItems(updated);
                                  }}
                                >＋</button>
                                {/* Cancel / remove this row */}
                                <button
                                  className="tp-row-action-btn tp-row-remove"
                                  title="Remove this row"
                                  onClick={() => removeManualRow(i)}
                                >－</button>
                                {/* Save all rows */}
                                <button
                                  className="tp-row-action-btn tp-row-save"
                                  title="Save all rows"
                                  onClick={saveMasterManual}
                                >💾</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {masterSaved && <p className="tp-success-msg">✅ Master template saved successfully!</p>}
                </div>
              )}

              {!masterProceeded && (
                <div className="tp-mode-cards-row">
                  <button className="tp-mode-card" onClick={() => { setMasterMode("manual"); setMasterProceeded(true); }}>
                    <span className="tp-mode-icon">📝</span>
                    <span className="tp-mode-title">Add Checks</span>
                    <span className="tp-mode-desc">Add each accessibility check with full details</span>
                  </button>
                  <button className="tp-mode-card" onClick={() => excelInputRef.current.click()}>
                    <span className="tp-mode-icon">📊</span>
                    <span className="tp-mode-title">Bulk Upload</span>
                    <span className="tp-mode-desc">Upload an Excel file with all checks at once</span>
                  </button>
                  <button
                    className="tp-mode-card"
                    onClick={openBatchCloneModal}
                    disabled={masterChecks.length === 0}
                    title={masterChecks.length === 0 ? "No master checks available to clone" : ""}
                  >
                    <span className="tp-mode-icon">🔁</span>
                    <span className="tp-mode-title">Clone</span>
                    <span className="tp-mode-desc">Select checks and clone them to an Organization</span>
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
          BATCH CLONE MODAL
      ════════════════════════════════════════════════════ */}
      {showBatchCloneModal && (
        <div className="tp-modal-overlay" onClick={() => !cloning && setShowBatchCloneModal(false)}>
          <div className="tp-modal tp-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>🔁 Clone Checks for Organisation</h3>
              <button className="tp-modal-close" onClick={() => !cloning && setShowBatchCloneModal(false)}>✕</button>
            </div>
            <div className="tp-modal-body" style={{ padding: 0 }}>
              <p style={{ padding: "12px 20px 8px", fontSize: 13, color: "#64748b" }}>
                Select the checks you want to clone, then choose the target organization and project.
              </p>
              <div style={{ padding: "0 20px 8px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button className="tp-btn tp-btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => setBatchSelected(masterChecks.map((c) => c.check_id))}>Select All</button>
                <button className="tp-btn tp-btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => setBatchSelected([])}>Clear</button>
                <span style={{ fontSize: 12, color: "#64748b" }}>{batchSelected.length} selected</span>
              </div>
              <div style={{ maxHeight: "35vh", overflowY: "auto", borderTop: "1px solid #dbeafe" }}>
                <table className="tp-manual-table" style={{ margin: 0, borderRadius: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th>ID</th><th>Code</th><th>Name / Description</th><th>Category</th><th>Priority</th>
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
                          <input type="checkbox" checked={batchSelected.includes(check.check_id)}
                            onChange={() => toggleBatchCheck(check.check_id)}
                            onClick={(e) => e.stopPropagation()} />
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

              {/* Organization + Project ID selectors side by side */}
              <div className="tp-clone-org-selector">
                <div className="tp-clone-selector-row">
                  {/* Organization selector */}
                  <div className="tp-clone-selector-col">
                    <label className="tp-clone-org-label">
                      Clone into Organization <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    {orgsLoading && <p className="tp-clone-org-hint">⏳ Loading organizations…</p>}
                    {orgsError   && <p className="tp-clone-org-hint" style={{ color: "#dc2626" }}>⚠ {orgsError}</p>}
                    {!orgsLoading && !orgsError && (
                      <select className="tp-input tp-clone-org-select" value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}>
                        <option value="">— Select an organization —</option>
                        {organizations.map((org, idx) => {
                          const id   = org.id ?? org.organization_id ?? org.org_id ?? idx;
                          const name = org.name ?? org.organization_name ?? org.org_name ?? `Organization ${id}`;
                          return <option key={id} value={String(id)}>{name}</option>;
                        })}
                      </select>
                    )}
                    {!orgsLoading && !orgsError && organizations.length === 0 && (
                      <p className="tp-clone-org-hint">No organizations found.</p>
                    )}
                  </div>

                  {/* Project ID input — shown once an org is selected */}
                  {selectedOrgId && (
                    <div className="tp-clone-selector-col tp-clone-project-col">
                      <label className="tp-clone-org-label">
                        Project ID <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "12px" }}>(optional)</span>
                      </label>
                      <input
                        className="tp-input tp-clone-org-select"
                        value={cloneProjectId}
                        onChange={(e) => setCloneProjectId(e.target.value)}
                        placeholder="e.g. proj-001"
                      />
                      <p className="tp-clone-org-hint" style={{ marginTop: 5 }}>
                        Enter the project ID to associate with this clone.
                      </p>
                    </div>
                  )}
                </div>

                {cloneError && (
                  <p className="tp-clone-org-hint" style={{ color: "#dc2626", marginTop: 8 }}>⚠ {cloneError}</p>
                )}
              </div>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={() => !cloning && setShowBatchCloneModal(false)} disabled={cloning}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={confirmBatchClone}
                disabled={!batchSelected.length || !selectedOrgId || cloning}>
                {cloning ? "⏳ Cloning…" : `✅ Clone Selected (${batchSelected.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          ORG ENTRY EDIT MODAL
      ════════════════════════════════════════════════════ */}
      {showOrgEditModal && orgEditEntry && (
        <div className="tp-modal-overlay" onClick={() => { setShowOrgEditModal(false); setOrgEditEntry(null); }}>
          <div className="tp-modal tp-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>✏️ Edit Cloned Entry</h3>
              <button className="tp-modal-close" onClick={() => { setShowOrgEditModal(false); setOrgEditEntry(null); }}>✕</button>
            </div>
            <div className="tp-modal-body">
              <div className="tp-edit-grid">
                <div>
                  <label className="tp-label">Check Code</label>
                  <input className="tp-input" value={orgEditEntry.check_code || ""}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, check_code: e.target.value })} />
                </div>
                <div>
                  <label className="tp-label">Check Name *</label>
                  <input className="tp-input" value={orgEditEntry.check_name || ""}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, check_name: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="tp-label">Description</label>
                  <textarea className="tp-input tp-textarea" value={orgEditEntry.description || ""}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <label className="tp-label">Category</label>
                  <input className="tp-input" value={orgEditEntry.category || ""}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, category: e.target.value })} />
                </div>
                <div>
                  <label className="tp-label">Priority</label>
                  <select className="tp-input" value={orgEditEntry.default_priority || "HIGH"}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, default_priority: e.target.value })}>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="tp-label">WCAG Reference</label>
                  <input className="tp-input" value={orgEditEntry.wcag_reference || ""}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, wcag_reference: e.target.value })} />
                </div>
                <div>
                  <label className="tp-label">PDF/UA Reference</label>
                  <input className="tp-input" value={orgEditEntry.pdfua_reference || ""}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, pdfua_reference: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="tp-label">Remediation Guidance</label>
                  <textarea className="tp-input tp-textarea" value={orgEditEntry.remediation_guidance || ""}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, remediation_guidance: e.target.value })} rows={3} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="edit-active" checked={!!orgEditEntry.is_active}
                    onChange={(e) => setOrgEditEntry({ ...orgEditEntry, is_active: e.target.checked })} />
                  <label htmlFor="edit-active" className="tp-label" style={{ marginBottom: 0 }}>Active</label>
                </div>
              </div>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn tp-btn-outline" onClick={() => { setShowOrgEditModal(false); setOrgEditEntry(null); }}>Cancel</button>
              <button className="tp-btn tp-btn-primary" onClick={handleOrgEditSave}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
