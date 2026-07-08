import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Publish.css";

/* ────────────────────────────────────────────────────────────
   Small shared helpers
   ──────────────────────────────────────────────────────────── */
let idCounter = 1000;
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

/* ── Reusable pagination bar (mirrors the reference screens) ── */
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

/* ════════════════════════════════════════════════════════════
   CUSTOMERS SECTION
   ════════════════════════════════════════════════════════════ */
function CustomersSection({ customers, setCustomers, onUseInProject }) {
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
      setCustomers((prev) =>
        prev.map((c) => (c.id === form.id ? { ...c, ...form } : c))
      );
    }
    resetForm();
    setSubTab("list");
  };

  const handleEdit = (c) => {
    setForm({ id: c.id, name: c.name, contact: c.contact, email: c.email, address: c.address });
    setSubTab("form");
  };

  const handleDelete = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

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

          <PaginationBar
            page={safePage}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            total={total}
            totalPages={totalPages}
            start={start}
            end={end}
          />
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
                <input
                  type="text"
                  placeholder="First name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Contact</label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                </div>
                <div className="pt-field">
                  <label>Email</label>
                  <div className="pt-input-icon-wrap">
                    <span className="pt-input-icon">✉️</span>
                    <input
                      type="email"
                      placeholder="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-field">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-form-footer">
              <button
                type="button"
                className="pt-btn pt-btn-outline"
                onClick={() => {
                  resetForm();
                  setSubTab("list");
                }}
              >
                Cancel
              </button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>
                Save
              </button>
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
    let rows = customers.length >= 0 ? projects : projects;
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
      setProjects((prev) =>
        prev.map((p) => (p.id === form.id ? { ...p, ...form, customerId: Number(form.customerId) } : p))
      );
    }
    resetForm();
    setSubTab("list");
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      customerId: String(p.customerId),
      projectManager: p.projectManager,
      description: p.description,
    });
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
                  <th className="pt-sortable" onClick={() => setSortAsc((s) => !s)}>
                    ID {sortAsc ? "▲" : "▼"}
                  </th>
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

          <PaginationBar
            page={safePage}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            total={total}
            totalPages={totalPages}
            start={start}
            end={end}
          />
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
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Customer</label>
                  <select
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Project Manager</label>
                  <input
                    type="text"
                    placeholder="Project Manager"
                    value={form.projectManager}
                    onChange={(e) => setForm({ ...form, projectManager: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-field">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-form-footer">
              <button
                type="button"
                className="pt-btn pt-btn-outline"
                onClick={() => {
                  resetForm();
                  setSubTab("list");
                }}
              >
                Cancel
              </button>
              <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TEMPLATES SECTION
   ════════════════════════════════════════════════════════════ */
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

function TemplatesSection({ templates, setTemplates, projects }) {
  const emptyForm = {
    id: null,
    name: "",
    projectId: "",
    status: "Active",
    description: "",
    language: "",
    dateFormat: "",
    featureFileName: "",
  };
  const [subTab, setSubTab] = useState("list");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const fileInputRef = useRef(null);

  const projectName = (id) => projects.find((p) => p.id === Number(id))?.name || "—";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        projectName(t.projectId).toLowerCase().includes(term)
    );
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
        features: form.featureFileName || "—",
        createdAt: todayStr(),
        createdBy: currentUser(),
      };
      setTemplates((prev) => [newTemplate, ...prev]);
    } else {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === form.id
            ? { ...t, ...form, projectId: Number(form.projectId), features: form.featureFileName || t.features }
            : t
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
          { key: "form", label: "Add Or Update Template" },
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
                    <td colSpan={8} className="pt-empty-row">No templates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar
            page={safePage}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            total={total}
            totalPages={totalPages}
            start={start}
            end={end}
          />
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
                <label>Name <span className="pt-required">*</span></label>
                <input
                  type="text"
                  placeholder="Template name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Project <span className="pt-required">*</span></label>
                  <select
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-field">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="pt-field-row">
                <div className="pt-field">
                  <label>Language <span className="pt-required">*</span></label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    <option value="">Select Language</option>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-field">
                  <label>Date Format</label>
                  <select
                    value={form.dateFormat}
                    onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                  >
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
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFeatureUpload}
                />
                <button
                  type="button"
                  className="pt-btn pt-btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Feature Data
                </button>
                {form.featureFileName && (
                  <span className="pt-file-chip">{form.featureFileName}</span>
                )}
              </div>
              <div className="pt-form-footer-actions">
                <button
                  type="button"
                  className="pt-btn pt-btn-outline"
                  onClick={() => {
                    resetForm();
                    setSubTab("list");
                  }}
                >
                  Cancel
                </button>
                <button type="button" className="pt-btn pt-btn-primary" onClick={handleSave}>
                  Save
                </button>
              </div>
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

        <PaginationBar
          page={safePage}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          total={total}
          totalPages={totalPages}
          start={start}
          end={end}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD SECTION (existing content, unchanged)
   ════════════════════════════════════════════════════════════ */
function DashboardSection() {
  const metrics = [
    { label: "Active Projects", value: "18", change: "+3 this month", icon: "📦" },
    { label: "Titles Published", value: "142", change: "+12 this quarter", icon: "📗" },
    { label: "Avg. Turnaround", value: "9.4 days", change: "-1.2 days", icon: "⏱️" },
    { label: "On-Time Rate", value: "94%", change: "+2% vs last month", icon: "✅" },
  ];

  const workflows = [
    { title: "The Future of AI in Publishing", stage: "Design & Layout", owner: "John Doe", status: "On Track", updated: "2h ago" },
    { title: "Digital Transformation Guide", stage: "Accessibility QA", owner: "Jane Smith", status: "In Review", updated: "5h ago" },
    { title: "Cloud Computing Essentials", stage: "Editorial Review", owner: "Mike Johnson", status: "Delayed", updated: "1d ago" },
    { title: "Modern Data Architecture", stage: "Pre-Press", owner: "Sara Lee", status: "On Track", updated: "1d ago" },
  ];

  const statusClass = (status) => {
    switch (status) {
      case "On Track": return "publish-status-ontrack";
      case "In Review": return "publish-status-review";
      case "Delayed": return "publish-status-delayed";
      default: return "";
    }
  };

  return (
    <>
      <div className="publish-metrics-grid">
        {metrics.map((m, idx) => (
          <div className="publish-metric-card" key={idx}>
            <div className="publish-metric-icon">{m.icon}</div>
            <p className="publish-metric-value">{m.value}</p>
            <p className="publish-metric-label">{m.label}</p>
            <p className="publish-metric-change">{m.change}</p>
          </div>
        ))}
      </div>

      <div className="publish-workflows-section">
        <div className="publish-workflows-header">
          <h2 className="publish-workflows-title">Active Workflows</h2>
          <span className="publish-workflows-count">{workflows.length} in progress</span>
        </div>

        <div className="publish-table-wrapper">
          <table className="publish-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Stage</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((w, idx) => (
                <tr key={idx}>
                  <td className="publish-table-title">{w.title}</td>
                  <td>{w.stage}</td>
                  <td>{w.owner}</td>
                  <td>
                    <span className={`publish-status-badge ${statusClass(w.status)}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="publish-table-updated">{w.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="publish-soon-banner">
        <span className="publish-soon-ico">🚧</span>
        <div>
          <p className="publish-soon-ttl">Live Data Coming Soon</p>
          <p className="publish-soon-msg">
            This dashboard is currently showing sample data. Live integration
            with backend publishing workflows will be enabled shortly.
          </p>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   SEED DATA (frontend-only sample rows so the new screens
   demonstrate working list/search/pagination behaviour)
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
  { id: 201, name: "Standard EPUB Template", projectId: 101, status: "Active", description: "Default EPUB layout", language: "English", dateFormat: "DD/MM/YYYY", features: "features_v1.xlsx", createdAt: "04 Jul 2026", createdBy: "admin@orion.com" },
];

const seedFiles = [
  { id: 301, fileName: "chapter-01-draft.docx", projectId: 101, templateId: 201, date: "05 Jul 2026", uploadedBy: "admin@orion.com", status: "In Progress", copyEditor: "Sara Lee" },
];

/* ════════════════════════════════════════════════════════════
   MAIN PUBLISH+ PAGE
   ════════════════════════════════════════════════════════════ */
export default function Publish() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [customers, setCustomers] = useState(seedCustomers);
  const [projects, setProjects] = useState(seedProjects);
  const [templates, setTemplates] = useState(seedTemplates);
  const [files, setFiles] = useState(seedFiles);

  const mainTabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "customers", label: "Customers" },
    { key: "projects", label: "Projects" },
    { key: "templates", label: "Templates" },
    { key: "copyedit", label: "Copy Editor" },
  ];

  return (
    <div className="publish-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="publish-sidebar">
        <div className="publish-logo">
          <div className="publish-logo-mark">O</div>
          <div className="publish-logo-text">
            <span>ORION</span>
            <small>Publishing Intelligence</small>
          </div>
        </div>

        <nav className="publish-nav">
          <p className="publish-nav-label">WORKSPACE</p>
          <div className="publish-nav-item" onClick={() => navigate("/submit")}>
            <span className="publish-nav-icon">📑</span>
            <span>Submit+</span>
          </div>
          <div className="publish-nav-item" onClick={() => navigate("/editor")}>
            <span className="publish-nav-icon">📝</span>
            <span>Editor+</span>
          </div>
          <div className="publish-nav-item active">
            <span className="publish-nav-icon">📚</span>
            <span>Publish+</span>
            <span className="publish-nav-dot"></span>
          </div>
          <div className="publish-nav-item" onClick={() => navigate("/remediate-pdf")}>
            <span className="publish-nav-icon">🔧</span>
            <span>Accessibility</span>
          </div>
        </nav>

        <div className="publish-sidebar-footer">
          <div className="publish-user-section">
            <p className="publish-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="publish-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="publish-main">
        <div className="publish-container">
          <div className="publish-header">
            <h1 className="publish-title">Publishing Intelligence Dashboard</h1>
            <p className="publish-subtitle">
              Real-time visibility into publishing workflows across your organization
            </p>
          </div>

          {/* ── Main section tabs ─────────────────────────────── */}
          <div className="pt-maintabs">
            {mainTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`pt-maintab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "dashboard" && <DashboardSection />}

          {activeTab === "customers" && (
            <CustomersSection customers={customers} setCustomers={setCustomers} />
          )}

          {activeTab === "projects" && (
            <ProjectsSection projects={projects} setProjects={setProjects} customers={customers} />
          )}

          {activeTab === "templates" && (
            <TemplatesSection templates={templates} setTemplates={setTemplates} projects={projects} />
          )}

          {activeTab === "copyedit" && (
            <CopyEditorSection files={files} setFiles={setFiles} projects={projects} templates={templates} />
          )}
        </div>
      </main>
    </div>
  );
}