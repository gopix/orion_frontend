
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Editor.css";
import {
  SHOW_SUBMIT_PLUS,
  SHOW_PUBLISH_PLUS,
  SHOW_ACCESSIBILITY_PLUS,
} from "../../constants/featureFlags";

/* ────────────────────────────────────────────────────────────
   Small shared helpers
   ──────────────────────────────────────────────────────────── */
let idCounter = 5000;
const nextId = () => ++idCounter;

const todayStr = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const currentUser = () => sessionStorage.getItem("userEmail") || "admin@orion.com";

function paginateData(rows, page, rowsPerPage) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, total);
  const pageRows = rows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  return { pageRows, total, totalPages, safePage, start, end };
}

/* ── Reusable pagination bar ─────────────────────────────────── */
function PaginationBar({ page, setPage, rowsPerPage, setRowsPerPage, total, totalPages, start, end }) {
  return (
    <div className="pt-pagination">
      <button
        type="button"
        className="pt-page-btn"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        ‹ Previous
      </button>

      <span className="pt-page-info">
        Page {totalPages === 0 ? 0 : page} of {totalPages}
      </span>

      <span className="pt-divider" />

      <span className="pt-rows-select">
        Rows per page:
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </span>

      <span className="pt-divider" />

      <span className="pt-records-info">
        Displaying {start}-{end} of {total} Records
      </span>

      <button
        type="button"
        className="pt-page-btn pt-page-btn-next"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      >
        Next ›
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Active: "pt-badge-active",
    Inactive: "pt-badge-inactive",
    Pending: "pt-badge-pending",
    "In Progress": "pt-badge-progress",
    Completed: "pt-badge-active",
    Rejected: "pt-badge-inactive",
  };
  return <span className={`pt-badge ${map[status] || "pt-badge-pending"}`}>{status}</span>;
}

function SearchBox({ label, value, onChange, placeholder }) {
  return (
    <div className="pt-search-block">
      <label className="pt-search-label">{label}</label>
      <div className="pt-search-input-wrap">
        <span className="pt-search-icon">🔍</span>
        <input
          type="text"
          className="pt-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/* Local sub-tab strip used inside each section (List / Add-Update) */
function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="pt-subtabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`pt-subtab ${active === t.key ? "active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── Minimal line icons for the section nav (no emoji, stroke-based) ── */
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const IconCustomers = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 8.2c1.3.3 2.3 1.4 2.3 2.8 0 1.3-.9 2.4-2.1 2.8" />
    <path d="M15.5 14.2c2.3.4 4 2.1 4 4.3" />
  </svg>
);

const IconProjects = () => (
  <svg {...iconProps}>
    <path d="M3.5 7.2c0-.7.6-1.2 1.3-1.2H9l1.8 2h8.4c.7 0 1.3.5 1.3 1.2v9.1c0 .7-.6 1.3-1.3 1.3H4.8c-.7 0-1.3-.6-1.3-1.3z" />
  </svg>
);

const IconTemplates = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="8.3" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="15.6" cy="12.3" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="9.2" cy="14.6" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

const IconUsers = () => (
  <svg {...iconProps}>
    <circle cx="8.3" cy="7.6" r="3" />
    <path d="M2.8 18.3c0-2.9 2.4-4.9 5.5-4.9s5.5 2 5.5 4.9" />
    <path d="M16.3 6.4a2.9 2.9 0 010 5.6" />
    <path d="M15.7 13.6c2.3.4 3.9 2.1 3.9 4.4" />
  </svg>
);

const IconCopyEdit = () => (
  <svg {...iconProps}>
    <path d="M14.2 4.3l5.3 5.3-9.8 9.8-5.8 1 1-5.8z" />
    <path d="M12.6 5.9l5.3 5.3" />
  </svg>
);

/* ════════════════════════════════════════════════════════════
   CUSTOMERS SECTION
   ════════════════════════════════════════════════════════════ */
function CustomersSection({ customers, setCustomers }) {
  const emptyForm = { id: null, name: "", contact: "", email: "", address: "" };
  const [subTab, setSubTab] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.contact.toLowerCase().includes(term)
    );
  }, [customers, search]);

  const { pageRows, total, totalPages, safePage, start, end } = paginateData(filtered, page, rowsPerPage);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (form.id == null) {
      const newCustomer = {
        id: nextId(),
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        createdAt: todayStr(),
        createdBy: currentUser(),
      };
      setCustomers((prev) => [newCustomer, ...prev]);
    } else {
      setCustomers((prev) => prev.map((c) => (c.id === form.id ? { ...c, ...form } : c)));
    }
    resetForm();
    setSubTab("list");
  };

  const handleEdit = (c) => {
    setForm({ id: c.id, name: c.name, contact: c.contact, email: c.email, address: c.address });
    setSubTab("form");
  };

  const handleDelete = (id) => setCustomers((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="pt-card">
      <SubTabs
        tabs={[
          { key: "list", label: "Customers List" },
          { key: "form", label: "Add Or Update Customer" },
        ]}
        active={subTab}
        onChange={(k) => {
          if (k === "form" && form.id == null) resetForm();
          setSubTab(k);
        }}
      />

      {subTab === "list" && (
        <div className="pt-panel">
          <SearchBox
            label="Search for customer"
            placeholder="Search"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Created By</th>
                  <th className="pt-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((c) => (
                  <tr key={c.id}>
                    <td className="pt-cell-strong">{c.name}</td>
                    <td>{c.contact || "—"}</td>
                    <td>{c.email || "—"}</td>
                    <td>{c.createdAt}</td>
                    <td>{c.createdBy}</td>
                    <td className="pt-col-actions">
                      <button className="pt-icon-btn" title="Edit" onClick={() => handleEdit(c)}>✏️</button>
                      <button className="pt-icon-btn" title="Delete" onClick={() => handleDelete(c.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="pt-empty-row">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar page={safePage} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} total={total} totalPages={totalPages} start={start} end={end} />
        </div>
      )}

      {subTab === "form" && (
        <div className="pt-panel">
          <div className="pt-form-card">
            <div className="pt-form-idbar">
              Customer ID: <span>{form.id ?? 0}</span>
            </div>

            <div className="pt-form-body">
              <div className="pt-field">
                <label>Name</label>
                <input type="text" placeholder="First name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Contact</label>
                  <input type="text" placeholder="Phone number" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div className="pt-field">
                  <label>Email</label>
                  <div className="pt-input-icon-wrap">
                    <span className="pt-input-icon">✉️</span>
                    <input type="email" placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="pt-field">
                <label>Address</label>
                <input type="text" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            <div className="pt-form-footer">
              <button type="button" className="pt-btn pt-btn-outline" onClick={() => { resetForm(); setSubTab("list"); }}>Cancel</button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PROJECTS SECTION
   ════════════════════════════════════════════════════════════ */
function ProjectsSection({ projects, setProjects, customers }) {
  const emptyForm = { id: null, name: "", customerId: "", projectManager: "", description: "" };
  const [subTab, setSubTab] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortAsc, setSortAsc] = useState(true);

  const customerName = (id) => customers.find((c) => c.id === Number(id))?.name || "—";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let rows = projects;
    if (term) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          customerName(p.customerId).toLowerCase().includes(term) ||
          (p.projectManager || "").toLowerCase().includes(term)
      );
    }
    rows = [...rows].sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id));
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, search, sortAsc, customers]);

  const { pageRows, total, totalPages, safePage, start, end } = paginateData(filtered, page, rowsPerPage);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.name.trim() || !form.customerId) return;
    if (form.id == null) {
      const newProject = {
        id: nextId(),
        name: form.name.trim(),
        customerId: Number(form.customerId),
        projectManager: form.projectManager.trim(),
        description: form.description.trim(),
        createdAt: todayStr(),
        createdBy: currentUser(),
      };
      setProjects((prev) => [newProject, ...prev]);
    } else {
      setProjects((prev) => prev.map((p) => (p.id === form.id ? { ...p, ...form, customerId: Number(form.customerId) } : p)));
    }
    resetForm();
    setSubTab("list");
  };

  const handleEdit = (p) => {
    setForm({ id: p.id, name: p.name, customerId: String(p.customerId), projectManager: p.projectManager, description: p.description });
    setSubTab("form");
  };

  const handleDelete = (id) => setProjects((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="pt-card">
      <SubTabs
        tabs={[
          { key: "list", label: "Projects List" },
          { key: "form", label: "Add Or Update Project" },
        ]}
        active={subTab}
        onChange={(k) => {
          if (k === "form" && form.id == null) resetForm();
          setSubTab(k);
        }}
      />

      {subTab === "list" && (
        <div className="pt-panel">
          <SearchBox
            label="Search for projects"
            placeholder="Search"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  <th className="pt-sortable" onClick={() => setSortAsc((s) => !s)}>ID {sortAsc ? "▲" : "▼"}</th>
                  <th>Name</th>
                  <th>Customer</th>
                  <th>Description</th>
                  <th>Project Manager</th>
                  <th>Created At</th>
                  <th>Created By</th>
                  <th className="pt-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="pt-cell-strong">{p.name}</td>
                    <td>{customerName(p.customerId)}</td>
                    <td className="pt-cell-truncate">{p.description || "—"}</td>
                    <td>{p.projectManager || "—"}</td>
                    <td>{p.createdAt}</td>
                    <td>{p.createdBy}</td>
                    <td className="pt-col-actions">
                      <button className="pt-icon-btn" title="Edit" onClick={() => handleEdit(p)}>✏️</button>
                      <button className="pt-icon-btn" title="Delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="pt-empty-row">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar page={safePage} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} total={total} totalPages={totalPages} start={start} end={end} />
        </div>
      )}

      {subTab === "form" && (
        <div className="pt-panel">
          <div className="pt-form-card">
            <div className="pt-form-idbar">
              Project ID: <span>{form.id ?? 0}</span>
            </div>

            <div className="pt-form-body">
              <div className="pt-field">
                <label>Name</label>
                <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Customer</label>
                  <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Project Manager</label>
                  <input type="text" placeholder="Project Manager" value={form.projectManager} onChange={(e) => setForm({ ...form, projectManager: e.target.value })} />
                </div>
              </div>

              <div className="pt-field">
                <label>Description</label>
                <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <div className="pt-form-footer">
              <button type="button" className="pt-btn pt-btn-outline" onClick={() => { resetForm(); setSubTab("list"); }}>Cancel</button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TEMPLATES SECTION (Templates List / Add New Template)
   Includes the 3 selectable template designs from the reference
   ════════════════════════════════════════════════════════════ */
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const TEMPLATE_DESIGNS = [
  { key: "standard", name: "Standard Layout", icon: "📄", desc: "Classic single-column layout with header & footer." },
  { key: "modern", name: "Modern Layout", icon: "🗂️", desc: "Two-column layout with sidebar navigation & callouts." },
  { key: "compact", name: "Compact Layout", icon: "📘", desc: "Condensed layout optimized for EPUB & mobile reading." },
];

function TemplatesSection({
  templates,
  setTemplates,
  projects,
  features,
  setFeatures,
  featureGroups,
  setFeatureGroups,
  abbreviations,
  setAbbreviations,
}) {
  const emptyForm = {
    id: null,
    name: "",
    projectId: "",
    status: "Active",
    description: "",
    language: "",
    dateFormat: "",
    design: "standard",
    featureFileName: "",
  };
  const [subTab, setSubTab] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const fileInputRef = useRef(null);

  const projectName = (id) => projects.find((p) => p.id === Number(id))?.name || "—";
  const designName = (key) => TEMPLATE_DESIGNS.find((d) => d.key === key)?.name || "—";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((t) => t.name.toLowerCase().includes(term) || projectName(t.projectId).toLowerCase().includes(term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, search, projects]);

  const { pageRows, total, totalPages, safePage, start, end } = paginateData(filtered, page, rowsPerPage);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.name.trim() || !form.projectId || !form.language) return;
    if (form.id == null) {
      const newTemplate = {
        id: nextId(),
        name: form.name.trim(),
        projectId: Number(form.projectId),
        status: form.status,
        description: form.description.trim(),
        language: form.language,
        dateFormat: form.dateFormat,
        design: form.design,
        features: form.featureFileName || "—",
        createdAt: todayStr(),
        createdBy: currentUser(),
      };
      setTemplates((prev) => [newTemplate, ...prev]);
    } else {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === form.id ? { ...t, ...form, projectId: Number(form.projectId), features: form.featureFileName || t.features } : t
        )
      );
    }
    resetForm();
    setSubTab("list");
  };

  const handleEdit = (t) => {
    setForm({
      id: t.id,
      name: t.name,
      projectId: String(t.projectId),
      status: t.status,
      description: t.description,
      language: t.language,
      dateFormat: t.dateFormat,
      design: t.design || "standard",
      featureFileName: "",
    });
    setSubTab("form");
  };

  const handleDelete = (id) => setTemplates((prev) => prev.filter((t) => t.id !== id));

  const handleFeatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setForm((f) => ({ ...f, featureFileName: file.name }));
  };

  return (
    <div className="pt-card">
      <SubTabs
        tabs={[
          { key: "list", label: "Templates List" },
          { key: "form", label: "Add New Template" },
          { key: "features", label: "Features" },
          { key: "abbreviations", label: "Abbreviations" },
        ]}
        active={subTab}
        onChange={(k) => {
          if (k === "form" && form.id == null) resetForm();
          setSubTab(k);
        }}
      />

      {subTab === "list" && (
        <div className="pt-panel">
          <SearchBox
            label="Search for Templates"
            placeholder="Search"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Project</th>
                  <th>Design</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Created By</th>
                  <th>Features</th>
                  <th className="pt-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((t) => (
                  <tr key={t.id}>
                    <td className="pt-cell-strong">{t.name}</td>
                    <td>{projectName(t.projectId)}</td>
                    <td>{designName(t.design)}</td>
                    <td className="pt-cell-truncate">{t.description || "—"}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{t.createdAt}</td>
                    <td>{t.createdBy}</td>
                    <td>{t.features || "—"}</td>
                    <td className="pt-col-actions">
                      <button className="pt-icon-btn" title="Edit" onClick={() => handleEdit(t)}>✏️</button>
                      <button className="pt-icon-btn" title="Delete" onClick={() => handleDelete(t.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="pt-empty-row">No templates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar page={safePage} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} total={total} totalPages={totalPages} start={start} end={end} />
        </div>
      )}

      {subTab === "form" && (
        <div className="pt-panel">
          <div className="pt-form-card">
            <div className="pt-form-idbar">
              Template ID: <span>{form.id ?? 0}</span>
            </div>

            <div className="pt-form-body">
              <div className="pt-field">
                <label>Choose Template Design <span className="pt-required">*</span></label>
                <div className="pt-design-grid">
                  {TEMPLATE_DESIGNS.map((d) => (
                    <div
                      key={d.key}
                      className={`pt-design-card ${form.design === d.key ? "active" : ""}`}
                      onClick={() => setForm({ ...form, design: d.key })}
                    >
                      <div className="pt-design-icon">{d.icon}</div>
                      <p className="pt-design-name">{d.name}</p>
                      <p className="pt-design-desc">{d.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-field">
                <label>Name <span className="pt-required">*</span></label>
                <input type="text" placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Project <span className="pt-required">*</span></label>
                  <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-field">
                <label>Description</label>
                <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Language <span className="pt-required">*</span></label>
                  <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                    <option value="">Select Language</option>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Date Format</label>
                  <select value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}>
                    <option value="">Select Date Format</option>
                    {DATE_FORMATS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-form-footer pt-form-footer-split">
              <div>
                <input ref={fileInputRef} type="file" hidden onChange={handleFeatureUpload} />
                <button type="button" className="pt-btn pt-btn-primary" onClick={() => fileInputRef.current?.click()}>Upload Feature Data</button>
                {form.featureFileName && <span className="pt-file-chip">{form.featureFileName}</span>}
              </div>
              <div className="pt-form-footer-actions">
                <button type="button" className="pt-btn pt-btn-outline" onClick={() => { resetForm(); setSubTab("list"); }}>Cancel</button>
                <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "features" && (
        <FeaturesSection
          features={features}
          setFeatures={setFeatures}
          featureGroups={featureGroups}
          setFeatureGroups={setFeatureGroups}
        />
      )}

      {subTab === "abbreviations" && (
        <AbbreviationsSection abbreviations={abbreviations} setAbbreviations={setAbbreviations} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   USERS SECTION
   ════════════════════════════════════════════════════════════ */
const ROLES = ["Admin", "Editor", "Copy Editor", "Reviewer", "Publisher"];

function UsersSection({ users, setUsers }) {
  const emptyForm = { id: null, name: "", email: "", contact: "", role: "", status: "Active" };
  const [subTab, setSubTab] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.role || "").toLowerCase().includes(term)
    );
  }, [users, search]);

  const { pageRows, total, totalPages, safePage, start, end } = paginateData(filtered, page, rowsPerPage);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.role) return;
    if (form.id == null) {
      const newUser = {
        id: nextId(),
        name: form.name.trim(),
        email: form.email.trim(),
        contact: form.contact.trim(),
        role: form.role,
        status: form.status,
        createdAt: todayStr(),
        createdBy: currentUser(),
      };
      setUsers((prev) => [newUser, ...prev]);
    } else {
      setUsers((prev) => prev.map((u) => (u.id === form.id ? { ...u, ...form } : u)));
    }
    resetForm();
    setSubTab("list");
  };

  const handleEdit = (u) => {
    setForm({ id: u.id, name: u.name, email: u.email, contact: u.contact, role: u.role, status: u.status });
    setSubTab("form");
  };

  const handleDelete = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className="pt-card">
      <SubTabs
        tabs={[
          { key: "list", label: "User List" },
          { key: "form", label: "Add Or Update User" },
        ]}
        active={subTab}
        onChange={(k) => {
          if (k === "form" && form.id == null) resetForm();
          setSubTab(k);
        }}
      />

      {subTab === "list" && (
        <div className="pt-panel">
          <SearchBox
            label="Search for user"
            placeholder="Search"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="pt-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((u) => (
                  <tr key={u.id}>
                    <td className="pt-cell-strong">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.contact || "—"}</td>
                    <td>{u.role}</td>
                    <td><StatusBadge status={u.status} /></td>
                    <td>{u.createdAt}</td>
                    <td className="pt-col-actions">
                      <button className="pt-icon-btn" title="Edit" onClick={() => handleEdit(u)}>✏️</button>
                      <button className="pt-icon-btn" title="Delete" onClick={() => handleDelete(u.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="pt-empty-row">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar page={safePage} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} total={total} totalPages={totalPages} start={start} end={end} />
        </div>
      )}

      {subTab === "form" && (
        <div className="pt-panel">
          <div className="pt-form-card">
            <div className="pt-form-idbar">
              User ID: <span>{form.id ?? 0}</span>
            </div>

            <div className="pt-form-body">
              <div className="pt-field">
                <label>Name</label>
                <input type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Email</label>
                  <div className="pt-input-icon-wrap">
                    <span className="pt-input-icon">✉️</span>
                    <input type="email" placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="pt-field">
                  <label>Contact</label>
                  <input type="text" placeholder="Phone number" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </div>
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="">Select Role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-form-footer">
              <button type="button" className="pt-btn pt-btn-outline" onClick={() => { resetForm(); setSubTab("list"); }}>Cancel</button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FEATURES SECTION (Features / Feature Group)
   ════════════════════════════════════════════════════════════ */
function FeaturesSection({ features, setFeatures, featureGroups, setFeatureGroups }) {
  const emptyForm = { id: null, name: "", group: "", description: "", status: "Active" };
  const emptyGroupForm = { id: null, name: "", description: "" };
  const [subTab, setSubTab] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return features;
    return features.filter((f) => f.name.toLowerCase().includes(term) || f.group.toLowerCase().includes(term));
  }, [features, search]);

  const { pageRows, total, totalPages, safePage, start, end } = paginateData(filtered, page, rowsPerPage);

  const resetForm = () => setForm(emptyForm);
  const resetGroupForm = () => setGroupForm(emptyGroupForm);

  const handleSaveFeature = () => {
    if (!form.name.trim() || !form.group) return;
    if (form.id == null) {
      const newFeature = {
        id: nextId(),
        name: form.name.trim(),
        group: form.group,
        description: form.description.trim(),
        status: form.status,
        createdAt: todayStr(),
        createdBy: currentUser(),
      };
      setFeatures((prev) => [newFeature, ...prev]);
    } else {
      setFeatures((prev) => prev.map((f) => (f.id === form.id ? { ...f, ...form } : f)));
    }
    resetForm();
    setSubTab("list");
  };

  const handleEditFeature = (f) => {
    setForm({ id: f.id, name: f.name, group: f.group, description: f.description, status: f.status });
    setSubTab("form");
  };

  const handleDeleteFeature = (id) => setFeatures((prev) => prev.filter((f) => f.id !== id));

  const handleSaveGroup = () => {
    if (!groupForm.name.trim()) return;
    if (groupForm.id == null) {
      setFeatureGroups((prev) => [...prev, { id: nextId(), name: groupForm.name.trim(), description: groupForm.description.trim() }]);
    } else {
      setFeatureGroups((prev) => prev.map((g) => (g.id === groupForm.id ? { ...g, ...groupForm } : g)));
    }
    resetGroupForm();
  };

  const handleDeleteGroup = (id) => setFeatureGroups((prev) => prev.filter((g) => g.id !== id));

  return (
    <div className="pt-card">
      <SubTabs
        tabs={[
          { key: "list", label: "Features List" },
          { key: "form", label: "Add Or Update Feature" },
          { key: "group", label: "Feature Group" },
        ]}
        active={subTab}
        onChange={(k) => {
          if (k === "form" && form.id == null) resetForm();
          setSubTab(k);
        }}
      />

      {subTab === "list" && (
        <div className="pt-panel">
          <SearchBox
            label="Search for feature"
            placeholder="Search"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Group</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="pt-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((f) => (
                  <tr key={f.id}>
                    <td className="pt-cell-strong">{f.name}</td>
                    <td>{f.group}</td>
                    <td className="pt-cell-truncate">{f.description || "—"}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>{f.createdAt}</td>
                    <td className="pt-col-actions">
                      <button className="pt-icon-btn" title="Edit" onClick={() => handleEditFeature(f)}>✏️</button>
                      <button className="pt-icon-btn" title="Delete" onClick={() => handleDeleteFeature(f.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="pt-empty-row">No features found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar page={safePage} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} total={total} totalPages={totalPages} start={start} end={end} />
        </div>
      )}

      {subTab === "form" && (
        <div className="pt-panel">
          <div className="pt-form-card">
            <div className="pt-form-idbar">
              Feature ID: <span>{form.id ?? 0}</span>
            </div>

            <div className="pt-form-body">
              <div className="pt-field">
                <label>Feature Name <span className="pt-required">*</span></label>
                <input type="text" placeholder="Feature name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Feature Group <span className="pt-required">*</span></label>
                  <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                    <option value="">Select Group</option>
                    {featureGroups.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-field">
                <label>Description</label>
                <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <div className="pt-form-footer">
              <button type="button" className="pt-btn pt-btn-outline" onClick={() => { resetForm(); setSubTab("list"); }}>Cancel</button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSaveFeature}>Save</button>
            </div>
          </div>
        </div>
      )}

      {subTab === "group" && (
        <div className="pt-panel">
          <div className="pt-form-card">
            <div className="pt-form-idbar">
              Feature Group ID: <span>{groupForm.id ?? 0}</span>
            </div>

            <div className="pt-form-body">
              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Group Name <span className="pt-required">*</span></label>
                  <input type="text" placeholder="Group name" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} />
                </div>
                <div className="pt-field">
                  <label>Description</label>
                  <input type="text" placeholder="Description" value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="pt-form-footer">
              <button type="button" className="pt-btn pt-btn-outline" onClick={resetGroupForm}>Clear</button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSaveGroup}>Save Group</button>
            </div>
          </div>

          <div className="pt-table-wrap pt-mt-16">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Description</th>
                  <th className="pt-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((g) => (
                  <tr key={g.id}>
                    <td className="pt-cell-strong">{g.name}</td>
                    <td className="pt-cell-truncate">{g.description || "—"}</td>
                    <td className="pt-col-actions">
                      <button className="pt-icon-btn" title="Edit" onClick={() => setGroupForm({ id: g.id, name: g.name, description: g.description })}>✏️</button>
                      <button className="pt-icon-btn" title="Delete" onClick={() => handleDeleteGroup(g.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {featureGroups.length === 0 && (
                  <tr>
                    <td colSpan={3} className="pt-empty-row">No feature groups found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ABBREVIATIONS SECTION
   ════════════════════════════════════════════════════════════ */
function AbbreviationsSection({ abbreviations, setAbbreviations }) {
  const emptyForm = { id: null, shortForm: "", fullForm: "", description: "" };
  const [subTab, setSubTab] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return abbreviations;
    return abbreviations.filter(
      (a) => a.shortForm.toLowerCase().includes(term) || a.fullForm.toLowerCase().includes(term)
    );
  }, [abbreviations, search]);

  const { pageRows, total, totalPages, safePage, start, end } = paginateData(filtered, page, rowsPerPage);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.shortForm.trim() || !form.fullForm.trim()) return;
    if (form.id == null) {
      const newAbbr = {
        id: nextId(),
        shortForm: form.shortForm.trim(),
        fullForm: form.fullForm.trim(),
        description: form.description.trim(),
        createdAt: todayStr(),
        createdBy: currentUser(),
      };
      setAbbreviations((prev) => [newAbbr, ...prev]);
    } else {
      setAbbreviations((prev) => prev.map((a) => (a.id === form.id ? { ...a, ...form } : a)));
    }
    resetForm();
    setSubTab("list");
  };

  const handleEdit = (a) => {
    setForm({ id: a.id, shortForm: a.shortForm, fullForm: a.fullForm, description: a.description });
    setSubTab("form");
  };

  const handleDelete = (id) => setAbbreviations((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="pt-card">
      <SubTabs
        tabs={[
          { key: "list", label: "Abbreviations List" },
          { key: "form", label: "Add Or Update Abbreviation" },
        ]}
        active={subTab}
        onChange={(k) => {
          if (k === "form" && form.id == null) resetForm();
          setSubTab(k);
        }}
      />

      {subTab === "list" && (
        <div className="pt-panel">
          <SearchBox
            label="Search for abbreviation"
            placeholder="Search"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Short Form</th>
                  <th>Full Form</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Created By</th>
                  <th className="pt-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => (
                  <tr key={a.id}>
                    <td className="pt-cell-strong">{a.shortForm}</td>
                    <td>{a.fullForm}</td>
                    <td className="pt-cell-truncate">{a.description || "—"}</td>
                    <td>{a.createdAt}</td>
                    <td>{a.createdBy}</td>
                    <td className="pt-col-actions">
                      <button className="pt-icon-btn" title="Edit" onClick={() => handleEdit(a)}>✏️</button>
                      <button className="pt-icon-btn" title="Delete" onClick={() => handleDelete(a.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="pt-empty-row">No abbreviations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar page={safePage} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} total={total} totalPages={totalPages} start={start} end={end} />
        </div>
      )}

      {subTab === "form" && (
        <div className="pt-panel">
          <div className="pt-form-card">
            <div className="pt-form-idbar">
              Abbreviation ID: <span>{form.id ?? 0}</span>
            </div>

            <div className="pt-form-body">
              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Short Form <span className="pt-required">*</span></label>
                  <input type="text" placeholder="e.g. AI" value={form.shortForm} onChange={(e) => setForm({ ...form, shortForm: e.target.value })} />
                </div>
                <div className="pt-field">
                  <label>Full Form <span className="pt-required">*</span></label>
                  <input type="text" placeholder="e.g. Artificial Intelligence" value={form.fullForm} onChange={(e) => setForm({ ...form, fullForm: e.target.value })} />
                </div>
              </div>

              <div className="pt-field">
                <label>Description</label>
                <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <div className="pt-form-footer">
              <button type="button" className="pt-btn pt-btn-outline" onClick={() => { resetForm(); setSubTab("list"); }}>Cancel</button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COPY EDITOR SECTION
   ════════════════════════════════════════════════════════════ */
function CopyEditorSection({ files, setFiles, projects, templates }) {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const fileInputRef = useRef(null);

  const projectName = (id) => projects.find((p) => p.id === Number(id))?.name || "—";
  const templateName = (id) => templates.find((t) => t.id === Number(id))?.name || "—";

  const availableTemplates = useMemo(
    () => templates.filter((t) => String(t.projectId) === String(selectedProject)),
    [templates, selectedProject]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return files.filter((f) => {
      const matchesTerm = !term || f.fileName.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || f.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [files, search, statusFilter]);

  const { pageRows, total, totalPages, safePage, start, end } = paginateData(filtered, page, rowsPerPage);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newFile = {
      id: nextId(),
      fileName: file.name,
      projectId: selectedProject ? Number(selectedProject) : null,
      templateId: selectedTemplate ? Number(selectedTemplate) : null,
      date: todayStr(),
      uploadedBy: currentUser(),
      status: "Pending",
      copyEditor: "Unassigned",
    };
    setFiles((prev) => [newFile, ...prev]);
    e.target.value = "";
  };

  const handleDelete = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="pt-card">
      <div className="pt-panel">
        <div className="pt-copyedit-toolbar">
          <div className="pt-field pt-inline-field">
            <label>Project</label>
            <select value={selectedProject} onChange={(e) => { setSelectedProject(e.target.value); setSelectedTemplate(""); }}>
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-field pt-inline-field">
            <label>Template</label>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
              <option value="">Select Template</option>
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
          <button
            type="button"
            className="pt-btn pt-btn-primary"
            disabled={!selectedProject || !selectedTemplate}
            title={!selectedProject || !selectedTemplate ? "Select a project and template first" : "Upload File"}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </button>
        </div>

        <div className="pt-copyedit-filters">
          <SearchBox
            label="Search for file"
            placeholder="Search"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <div className="pt-field pt-status-filter">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">Filter by status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="pt-table-wrap">
          <table className="pt-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>File</th>
                <th>Project/Template</th>
                <th>Date</th>
                <th>Uploaded By</th>
                <th>Status</th>
                <th>Copy Editor</th>
                <th className="pt-col-actions">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td className="pt-cell-link">{f.fileName}</td>
                  <td>{projectName(f.projectId)} / {templateName(f.templateId)}</td>
                  <td>{f.date}</td>
                  <td>{f.uploadedBy}</td>
                  <td><StatusBadge status={f.status} /></td>
                  <td>{f.copyEditor}</td>
                  <td className="pt-col-actions">
                    <button className="pt-icon-btn" title="Delete" onClick={() => handleDelete(f.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="pt-empty-row">No files found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar page={safePage} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} total={total} totalPages={totalPages} start={start} end={end} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SEED DATA
   ════════════════════════════════════════════════════════════ */
const seedCustomers = [
  { id: 1, name: "Meditech Publishing", contact: "9876543210", email: "contact@meditech.com", address: "Pune, MH", createdAt: "02 Jul 2026", createdBy: "admin@orion.com" },
  { id: 2, name: "Bluewave Books", contact: "9123456780", email: "hello@bluewave.com", address: "Delhi, DL", createdAt: "28 Jun 2026", createdBy: "admin@orion.com" },
  { id: 3, name: "Nimbus Learning", contact: "9988776655", email: "info@nimbuslearn.com", address: "Bengaluru, KA", createdAt: "20 Jun 2026", createdBy: "admin@orion.com" },
];

const seedProjects = [
  { id: 101, name: "AI in Publishing", customerId: 1, projectManager: "John Doe", description: "Flagship AI publishing guide", createdAt: "03 Jul 2026", createdBy: "admin@orion.com" },
  { id: 102, name: "Cloud Essentials", customerId: 2, projectManager: "Jane Smith", description: "Cloud computing course material", createdAt: "29 Jun 2026", createdBy: "admin@orion.com" },
];

const seedTemplates = [
  { id: 201, name: "Standard EPUB Template", projectId: 101, status: "Active", description: "Default EPUB layout", language: "English", dateFormat: "DD/MM/YYYY", design: "standard", features: "features_v1.xlsx", createdAt: "04 Jul 2026", createdBy: "admin@orion.com" },
];

const seedUsers = [
  { id: 401, name: "Sara Lee", email: "sara.lee@orion.com", contact: "9812345670", role: "Copy Editor", status: "Active", createdAt: "01 Jul 2026", createdBy: "admin@orion.com" },
  { id: 402, name: "Mike Johnson", email: "mike.johnson@orion.com", contact: "9812345671", role: "Editor", status: "Active", createdAt: "28 Jun 2026", createdBy: "admin@orion.com" },
];

const seedFeatureGroups = [
  { id: 501, name: "Accessibility", description: "WCAG & accessibility related features" },
  { id: 502, name: "Formatting", description: "Layout and typography features" },
];

const seedFeatures = [
  { id: 601, name: "Alt Text Validation", group: "Accessibility", description: "Checks for missing alt text on images", status: "Active", createdAt: "02 Jul 2026", createdBy: "admin@orion.com" },
  { id: 602, name: "Heading Structure Check", group: "Formatting", description: "Validates heading hierarchy", status: "Active", createdAt: "01 Jul 2026", createdBy: "admin@orion.com" },
];

const seedAbbreviations = [
  { id: 701, shortForm: "AI", fullForm: "Artificial Intelligence", description: "Used across technical content", createdAt: "30 Jun 2026", createdBy: "admin@orion.com" },
  { id: 702, shortForm: "EPUB", fullForm: "Electronic Publication", description: "Standard eBook format", createdAt: "29 Jun 2026", createdBy: "admin@orion.com" },
];

const seedFiles = [
  { id: 801, fileName: "chapter-01-draft.docx", projectId: 101, templateId: 201, date: "05 Jul 2026", uploadedBy: "admin@orion.com", status: "In Progress", copyEditor: "Sara Lee" },
];

/* ════════════════════════════════════════════════════════════
   MAIN EDITOR+ PAGE
   ════════════════════════════════════════════════════════════ */
export default function Editor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customers");

  const [customers, setCustomers] = useState(seedCustomers);
  const [projects, setProjects] = useState(seedProjects);
  const [templates, setTemplates] = useState(seedTemplates);
  const [users, setUsers] = useState(seedUsers);
  const [featureGroups, setFeatureGroups] = useState(seedFeatureGroups);
  const [features, setFeatures] = useState(seedFeatures);
  const [abbreviations, setAbbreviations] = useState(seedAbbreviations);
  const [files, setFiles] = useState(seedFiles);

  const mainTabs = [
    {
      key: "customers",
      label: "Customer",
      desc: "Accounts & contacts",
      Icon: IconCustomers,
      count: customers.length,
    },
    {
      key: "projects",
      label: "Project",
      desc: "Active engagements",
      Icon: IconProjects,
      count: projects.length,
    },
    {
      key: "templates",
      label: "Template",
      desc: "Layouts & features",
      Icon: IconTemplates,
      count: templates.length,
    },
    {
      key: "users",
      label: "User",
      desc: "Team & roles",
      Icon: IconUsers,
      count: users.length,
    },
    {
      key: "copyedit",
      label: "Copy Edit",
      desc: "Files in review",
      Icon: IconCopyEdit,
      count: files.length,
    },
  ];

  const activeIndex = Math.max(0, mainTabs.findIndex((t) => t.key === activeTab));

  return (
    <div className="editor-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="editor-sidebar">
        <div className="editor-logo">
          <div className="editor-logo-mark">O</div>
          <div className="editor-logo-text">
            <span>ORION</span>
            <small>AI-Powered Editing</small>
          </div>
        </div>

        <nav className="editor-nav">
          <p className="editor-nav-label">WORKSPACE</p>
          {SHOW_SUBMIT_PLUS && (
            <div className="editor-nav-item" onClick={() => navigate("/submit")}>
              <span className="editor-nav-icon">📑</span>
              <span>Submit+</span>
            </div>
          )}
          <div className="editor-nav-item active">
            <span className="editor-nav-icon">📝</span>
            <span>Editor+</span>
            <span className="editor-nav-dot"></span>
          </div>
          {SHOW_PUBLISH_PLUS && (
            <div className="editor-nav-item" onClick={() => navigate("/publish")}>
              <span className="editor-nav-icon">📚</span>
              <span>Publish+</span>
            </div>
          )}
          {SHOW_ACCESSIBILITY_PLUS && (
            <div className="editor-nav-item" onClick={() => navigate("/remediate-pdf")}>
              <span className="editor-nav-icon">🔧</span>
              <span>Accessibility</span>
            </div>
          )}
        </nav>

        <div className="editor-sidebar-footer">
          <div className="editor-user-section">
            <p className="editor-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button className="editor-back-btn" onClick={() => navigate("/")} title="Back to Home">
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="editor-main">
        <div className="editor-container">
          <div className="publish-header">
            <h1 className="publish-title">Copy Editing Tool</h1>
            <p className="publish-subtitle">
              Manage customers, projects, templates, users, features and abbreviations for content editing
            </p>
          </div>

          {/* ── Main section selector — segmented control ─────── */}
          <div className="pt-segmented" role="tablist">
            <div
              className="pt-segmented-indicator"
              style={{
                width: `calc(100% / ${mainTabs.length})`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
            {mainTabs.map((t, i) => {
              const { Icon } = t;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t.key}
                  className={`pt-segment ${activeTab === t.key ? "active" : ""}`}
                  style={{ "--i": i }}
                  onClick={() => setActiveTab(t.key)}
                >
                  <span className="pt-segment-icon"><Icon /></span>
                  <span className="pt-segment-text">
                    <span className="pt-segment-label">{t.label}</span>
                    <span className="pt-segment-desc">{t.desc}</span>
                  </span>
                  <span className="pt-segment-count">{t.count}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-section-content" key={activeTab}>
            {activeTab === "customers" && <CustomersSection customers={customers} setCustomers={setCustomers} />}

            {activeTab === "projects" && (
              <ProjectsSection projects={projects} setProjects={setProjects} customers={customers} />
            )}

            {activeTab === "templates" && (
              <TemplatesSection
                templates={templates}
                setTemplates={setTemplates}
                projects={projects}
                features={features}
                setFeatures={setFeatures}
                featureGroups={featureGroups}
                setFeatureGroups={setFeatureGroups}
                abbreviations={abbreviations}
                setAbbreviations={setAbbreviations}
              />
            )}

            {activeTab === "users" && <UsersSection users={users} setUsers={setUsers} />}

            {activeTab === "copyedit" && (
              <CopyEditorSection files={files} setFiles={setFiles} projects={projects} templates={templates} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}