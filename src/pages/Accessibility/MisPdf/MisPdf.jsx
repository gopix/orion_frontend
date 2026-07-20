

// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getAccessibilityAuditTemplate, exportAccessibilityAuditTemplateCsv } from "../../../services/apiServices";
// import "./MisPdf.css";

// // ── Helpers ──────────────────────────────────────────────────
// // Turns a raw key like "organization_name" into "Organization Name"
// const formatHeader = (key) =>
//   key
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());

// // ISO date strings ("2026-07-15T05:46:11") render as readable local dates
// const isIsoDateString = (value) =>
//   typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);

// const formatCellValue = (value) => {
//   if (value === null || value === undefined || value === "") return "—";
//   if (isIsoDateString(value)) {
//     const d = new Date(value);
//     if (!isNaN(d.getTime())) {
//       return d.toLocaleString(undefined, {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     }
//   }
//   if (typeof value === "boolean") return value ? "Yes" : "No";
//   if (typeof value === "object") return JSON.stringify(value);
//   return String(value);
// };

// export default function MisPdf() {
//   const navigate = useNavigate();

//   const organizationId = sessionStorage.getItem("organization_id") || 1;

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [exporting, setExporting] = useState(false);
//   const [exportError, setExportError] = useState("");

//   const [search, setSearch] = useState("");

//   // ── Load MIS history ─────────────────────────────────────────
//   const loadHistory = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await getAccessibilityAuditTemplate(organizationId);

//       if (!response.ok) {
//         let msg = `Server error: ${response.status}`;
//         try {
//           const e = await response.json();
//           msg = e.detail || e.message || e.error || msg;
//         } catch {}
//         throw new Error(msg);
//       }

//       const data = await response.json();
//       const list = Array.isArray(data) ? data : (data?.data ?? data?.rows ?? []);
//       setRows(Array.isArray(list) ? list : []);
//     } catch (err) {
//       setError(err.message || "Could not load the MIS report. Please try again.");
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadHistory();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ── Columns derived dynamically from the data itself ─────────
//   const columns = useMemo(() => {
//     if (!rows.length) return [];
//     const keys = new Set();
//     rows.forEach((row) => Object.keys(row || {}).forEach((k) => keys.add(k)));
//     return Array.from(keys);
//   }, [rows]);

//   const filteredRows = useMemo(() => {
//     if (!search.trim()) return rows;
//     const q = search.trim().toLowerCase();
//     return rows.filter((row) =>
//       Object.values(row || {}).some((v) => String(v ?? "").toLowerCase().includes(q))
//     );
//   }, [rows, search]);

//   // ── Summary stats ─────────────────────────────────────────────
//   const uniqueUsers = useMemo(() => {
//     const key = columns.find((c) => /user.*name|user.*email/i.test(c));
//     if (!key) return null;
//     return new Set(rows.map((r) => r[key])).size;
//   }, [rows, columns]);

//   const orgLabel = useMemo(() => {
//     const key = columns.find((c) => /organization.*name/i.test(c));
//     if (!key) return null;
//     return rows[0]?.[key] ?? null;
//   }, [rows, columns]);

//   // ── Export CSV ───────────────────────────────────────────────
//   const handleExportCsv = async () => {
//     setExporting(true);
//     setExportError("");
//     try {
//       const response = await exportAccessibilityAuditTemplateCsv(organizationId);

//       if (!response.ok) {
//         let msg = `Server error: ${response.status}`;
//         try {
//           const e = await response.json();
//           msg = e.detail || e.message || e.error || msg;
//         } catch {}
//         throw new Error(msg);
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `accessibility-mis-report-org-${organizationId}.csv`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       setExportError(err.message || "Could not export the CSV report. Please try again.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   return (
//     <div className="mp-page">

//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="mp-sidebar">
//         <div className="mp-logo">
//           <div className="mp-logo-mark">O</div>
//           <div className="mp-logo-text">
//             <span>ORION</span>
//             <small>Accessibility & Remediation</small>
//           </div>
//         </div>

//         <nav className="mp-nav">
//           <p className="mp-nav-label">PDF</p>
//           <div className="mp-nav-item" onClick={() => navigate("/remediate-pdf")}>
//             <span className="mp-nav-icon">🛠️</span>
//             <span>Remediate PDF</span>
//           </div>
//           <div className="mp-nav-item" onClick={() => navigate("/validate-pdf")}>
//             <span className="mp-nav-icon">✅</span>
//             <span>Validate PDF</span>
//           </div>

//           <p className="mp-nav-label" style={{ marginTop: 14 }}>EPUB</p>
//           <div className="mp-nav-item" onClick={() => navigate("/remediate-epub")}>
//             <span className="mp-nav-icon">📘</span>
//             <span>Remediate EPUB</span>
//           </div>
//           <div className="mp-nav-item" onClick={() => navigate("/validate-epub")}>
//             <span className="mp-nav-icon">📗</span>
//             <span>Validate EPUB</span>
//           </div>

//           <p className="mp-nav-label" style={{ marginTop: 14 }}>MIS</p>
//           <div className="mp-nav-item active">
//             <span className="mp-nav-icon">📊</span>
//             <span>PDF</span>
//             <span className="mp-nav-dot"></span>
//           </div>
//           <div className="mp-nav-item" onClick={() => alert("EPUB MIS report is coming soon.")}>
//             <span className="mp-nav-icon">📊</span>
//             <span>EPUB</span>
//           </div>
//         </nav>

//         <div className="mp-sidebar-footer">
//           <div className="mp-user-section">
//             <p className="mp-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="mp-back-btn"
//               onClick={() => navigate("/")}
//               title="Back to Home"
//             >
//               ← Back
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="mp-main">

//         {/* Topbar */}
//         <div className="mp-topbar">
//           <div className="mp-breadcrumb">
//             <span className="mp-bc-root">Accessibility</span>
//             <span className="mp-bc-sep">›</span>
//             <span className="mp-bc-root">MIS</span>
//             <span className="mp-bc-sep">›</span>
//             <span className="mp-bc-current">PDF</span>
//           </div>
//         </div>

//         <div className="mp-container">

//           <div className="mp-page-header">
//             <div>
//               <h1 className="mp-page-title">PDF Accessibility MIS Report</h1>
//               <p className="mp-page-subtitle">
//                 Remediation history and audit trail for your organization.
//               </p>
//             </div>

//             <div className="mp-header-actions">
//               <button className="mp-refresh-btn" onClick={loadHistory} disabled={loading}>
//                 {loading ? "Refreshing…" : "⟳ Refresh"}
//               </button>
//               <button
//                 className="mp-export-btn"
//                 onClick={handleExportCsv}
//                 disabled={exporting || loading}
//               >
//                 {exporting ? <span className="mp-btn-spinner"></span> : "⬇ Download Full Report (CSV)"}
//               </button>
//             </div>
//           </div>

//           {exportError && (
//             <div className="mp-error-banner">
//               <span className="mp-error-ico">⚠</span>
//               <div>
//                 <p className="mp-error-ttl">Export failed</p>
//                 <p className="mp-error-msg">{exportError}</p>
//               </div>
//             </div>
//           )}

//           {/* Summary cards */}
//           <div className="mp-summary-grid">
//             <div className="mp-summary-card">
//               <span className="mp-summary-label">Organization</span>
//               <span className="mp-summary-value">{orgLabel || `#${organizationId}`}</span>
//             </div>
//             <div className="mp-summary-card">
//               <span className="mp-summary-label">Total Records</span>
//               <span className="mp-summary-value">{loading ? "—" : rows.length}</span>
//             </div>
//             {uniqueUsers !== null && (
//               <div className="mp-summary-card">
//                 <span className="mp-summary-label">Unique Users</span>
//                 <span className="mp-summary-value">{loading ? "—" : uniqueUsers}</span>
//               </div>
//             )}
//           </div>

//           {/* Table card */}
//           <div className="mp-table-card">
//             <div className="mp-table-toolbar">
//               <h2 className="mp-table-title">Remediation History</h2>
//               <input
//                 type="text"
//                 className="mp-search-input"
//                 placeholder="Search records…"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 disabled={loading || rows.length === 0}
//               />
//             </div>

//             {loading && (
//               <div className="mp-state-block">
//                 <span className="mp-spinner"></span>
//                 <p>Loading MIS report…</p>
//               </div>
//             )}

//             {!loading && error && (
//               <div className="mp-state-block mp-state-error">
//                 <span className="mp-error-ico">⚠</span>
//                 <p>{error}</p>
//                 <button className="mp-retry-btn" onClick={loadHistory}>Try Again</button>
//               </div>
//             )}

//             {!loading && !error && rows.length === 0 && (
//               <div className="mp-state-block">
//                 <span className="mp-empty-ico">📄</span>
//                 <p>No accessibility MIS records found for this organization yet.</p>
//               </div>
//             )}

//             {!loading && !error && rows.length > 0 && (
//               <div className="mp-table-scroll">
//                 <table className="mp-table">
//                   <thead>
//                     <tr>
//                       {columns.map((col) => (
//                         <th key={col}>{formatHeader(col)}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredRows.map((row, i) => (
//                       <tr key={row.id ?? i}>
//                         {columns.map((col) => (
//                           <td key={col}>{formatCellValue(row[col])}</td>
//                         ))}
//                       </tr>
//                     ))}
//                     {filteredRows.length === 0 && (
//                       <tr>
//                         <td colSpan={columns.length} className="mp-no-match">
//                           No records match your search.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }








import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessibilityAuditTemplate, exportAccessibilityAuditTemplateCsv } from "../../../services/apiServices";
import "./MisPdf.css";

// ── Helpers ──────────────────────────────────────────────────
// Turns a raw key like "organization_name" into "Organization Name"
const formatHeader = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ISO date strings ("2026-07-15T05:46:11") render as readable local dates
const isIsoDateString = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);

const formatCellValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (isIsoDateString(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const ROWS_PER_PAGE = 10;

export default function MisPdf() {
  const navigate = useNavigate();

  const organizationId = sessionStorage.getItem("organization_id") || 1;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const [search, setSearch] = useState("");

  // ── Sorting ─────────────────────────────────────────────────
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"

  // ── Pagination ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── Load MIS history ─────────────────────────────────────────
  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAccessibilityAuditTemplate(organizationId);

      if (!response.ok) {
        let msg = `Server error: ${response.status}`;
        try {
          const e = await response.json();
          msg = e.detail || e.message || e.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.data ?? data?.rows ?? []);
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Could not load the MIS report. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Columns derived dynamically from the data itself ─────────
  const columns = useMemo(() => {
    if (!rows.length) return [];
    const keys = new Set();
    rows.forEach((row) => Object.keys(row || {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) =>
      Object.values(row || {}).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [rows, search]);

  // ── Sort filtered rows by the selected column ─────────────────
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const av = a?.[sortColumn];
      const bv = b?.[sortColumn];
      if (av === null || av === undefined || av === "") return 1;
      if (bv === null || bv === undefined || bv === "") return -1;

      // Numbers compare numerically
      const aNum = Number(av);
      const bNum = Number(bv);
      if (!isNaN(aNum) && !isNaN(bNum) && av !== "" && bv !== "") {
        return (aNum - bNum) * dir;
      }

      // ISO dates compare chronologically
      if (isIsoDateString(av) && isIsoDateString(bv)) {
        return (new Date(av).getTime() - new Date(bv).getTime()) * dir;
      }

      // Fallback: case-insensitive string compare
      return String(av).localeCompare(String(bv), undefined, { sensitivity: "base" }) * dir;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Reset to page 1 whenever the underlying data set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, rows]);

  // ── Paginate sorted rows — 10 records per page ─────────────────
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / ROWS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedRows.slice(start, start + ROWS_PER_PAGE);
  }, [sortedRows, currentPage]);

  // ── Summary stats ─────────────────────────────────────────────
  const uniqueUsers = useMemo(() => {
    const key = columns.find((c) => /user.*name|user.*email/i.test(c));
    if (!key) return null;
    return new Set(rows.map((r) => r[key])).size;
  }, [rows, columns]);

  const orgLabel = useMemo(() => {
    const key = columns.find((c) => /organization.*name/i.test(c));
    if (!key) return null;
    return rows[0]?.[key] ?? null;
  }, [rows, columns]);

  // ── Export CSV ───────────────────────────────────────────────
  const handleExportCsv = async () => {
    setExporting(true);
    setExportError("");
    try {
      const response = await exportAccessibilityAuditTemplateCsv(organizationId);

      if (!response.ok) {
        let msg = `Server error: ${response.status}`;
        try {
          const e = await response.json();
          msg = e.detail || e.message || e.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `accessibility-mis-report-org-${organizationId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message || "Could not export the CSV report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mp-page">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="mp-sidebar">
        <div className="mp-logo">
          <div className="mp-logo-mark">O</div>
          <div className="mp-logo-text">
            <span>ORION</span>
            <small>Accessibility & Remediation</small>
          </div>
        </div>

        <nav className="mp-nav">
          <p className="mp-nav-label">PDF</p>
          <div className="mp-nav-item" onClick={() => navigate("/remediate-pdf")}>
            <span className="mp-nav-icon">🛠️</span>
            <span>Remediate PDF</span>
          </div>
          <div className="mp-nav-item" onClick={() => navigate("/validate-pdf")}>
            <span className="mp-nav-icon">✅</span>
            <span>Validate PDF</span>
          </div>

          <p className="mp-nav-label" style={{ marginTop: 14 }}>EPUB</p>
          <div className="mp-nav-item" onClick={() => navigate("/remediate-epub")}>
            <span className="mp-nav-icon">📘</span>
            <span>Remediate EPUB</span>
          </div>
          <div className="mp-nav-item" onClick={() => navigate("/validate-epub")}>
            <span className="mp-nav-icon">📗</span>
            <span>Validate EPUB</span>
          </div>

          <p className="mp-nav-label" style={{ marginTop: 14 }}>MIS</p>
          <div className="mp-nav-item active">
            <span className="mp-nav-icon">📊</span>
            <span>PDF</span>
            <span className="mp-nav-dot"></span>
          </div>
          <div className="mp-nav-item" onClick={() => alert("EPUB MIS report is coming soon.")}>
            <span className="mp-nav-icon">📊</span>
            <span>EPUB</span>
          </div>
        </nav>

        <div className="mp-sidebar-footer">
          <div className="mp-user-section">
            <p className="mp-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="mp-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="mp-main">

        {/* Topbar */}
        <div className="mp-topbar">
          <div className="mp-breadcrumb">
            <span className="mp-bc-root">Accessibility</span>
            <span className="mp-bc-sep">›</span>
            <span className="mp-bc-root">MIS</span>
            <span className="mp-bc-sep">›</span>
            <span className="mp-bc-current">PDF</span>
          </div>
        </div>

        <div className="mp-container">

          <div className="mp-page-header">
            <div>
              <h1 className="mp-page-title">PDF Accessibility MIS Report</h1>
              <p className="mp-page-subtitle">
                Remediation history and audit trail for your organization.
              </p>
            </div>

            <div className="mp-header-actions">
              <button className="mp-refresh-btn" onClick={loadHistory} disabled={loading}>
                {loading ? "Refreshing…" : "⟳ Refresh"}
              </button>
              <button
                className="mp-export-btn"
                onClick={handleExportCsv}
                disabled={exporting || loading}
              >
                {exporting ? <span className="mp-btn-spinner"></span> : "⬇ Download Full Report (CSV)"}
              </button>
            </div>
          </div>

          {exportError && (
            <div className="mp-error-banner">
              <span className="mp-error-ico">⚠</span>
              <div>
                <p className="mp-error-ttl">Export failed</p>
                <p className="mp-error-msg">{exportError}</p>
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="mp-summary-grid">
            <div className="mp-summary-card">
              <span className="mp-summary-label">Organization</span>
              <span className="mp-summary-value">{orgLabel || `#${organizationId}`}</span>
            </div>
            <div className="mp-summary-card">
              <span className="mp-summary-label">Total Records</span>
              <span className="mp-summary-value">{loading ? "—" : rows.length}</span>
            </div>
            {uniqueUsers !== null && (
              <div className="mp-summary-card">
                <span className="mp-summary-label">Unique Users</span>
                <span className="mp-summary-value">{loading ? "—" : uniqueUsers}</span>
              </div>
            )}
          </div>

          {/* Table card */}
          <div className="mp-table-card">
            <div className="mp-table-toolbar">
              <h2 className="mp-table-title">Remediation History</h2>
              <input
                type="text"
                className="mp-search-input"
                placeholder="Search records…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading || rows.length === 0}
              />
            </div>

            {loading && (
              <div className="mp-state-block">
                <span className="mp-spinner"></span>
                <p>Loading MIS report…</p>
              </div>
            )}

            {!loading && error && (
              <div className="mp-state-block mp-state-error">
                <span className="mp-error-ico">⚠</span>
                <p>{error}</p>
                <button className="mp-retry-btn" onClick={loadHistory}>Try Again</button>
              </div>
            )}

            {!loading && !error && rows.length === 0 && (
              <div className="mp-state-block">
                <span className="mp-empty-ico">📄</span>
                <p>No accessibility MIS records found for this organization yet.</p>
              </div>
            )}

            {!loading && !error && rows.length > 0 && (
              <>
                <div className="mp-table-scroll">
                  <table className="mp-table">
                    <thead>
                      <tr>
                        {columns.map((col) => {
                          const isActive = sortColumn === col;
                          return (
                            <th
                              key={col}
                              className={`mp-th-sortable${isActive ? " mp-th-sorted" : ""}`}
                              onClick={() => handleSort(col)}
                              title={`Sort by ${formatHeader(col)}`}
                            >
                              <span className="mp-th-label">
                                {formatHeader(col)}
                                <span className="mp-sort-icon">
                                  {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "⇅"}
                                </span>
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, i) => (
                        <tr key={row.id ?? i}>
                          {columns.map((col) => (
                            <td key={col}>{formatCellValue(row[col])}</td>
                          ))}
                        </tr>
                      ))}
                      {sortedRows.length === 0 && (
                        <tr>
                          <td colSpan={columns.length} className="mp-no-match">
                            No records match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {sortedRows.length > 0 && (
                  <div className="mp-pagination">
                    <span className="mp-pagination-info">
                      Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                      {Math.min(currentPage * ROWS_PER_PAGE, sortedRows.length)} of {sortedRows.length}
                    </span>
                    <div className="mp-pagination-controls">
                      <button
                        type="button"
                        className="mp-page-btn"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        ‹ Prev
                      </button>
                      <span className="mp-page-indicator">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        className="mp-page-btn"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next ›
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}