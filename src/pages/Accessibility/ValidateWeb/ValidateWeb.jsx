import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createWebsite,
  getAllWebsites,
  getWebsiteById,
  updateWebsite,
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
  if (s === "PASS" || s === "PASSED") return "ww-status-pass";
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

export default function ValidateWeb() {
  const navigate = useNavigate();

  // ── Website list ──────────────────────────────────────────
  const [websites, setWebsites] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // ── Create form ───────────────────────────────────────────
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // ── Lookup by ID ──────────────────────────────────────────
  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // ── Selected website / details / edit ────────────────────
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openWebsite = async (id) => {
    setLookupError("");
    setUpdateError("");
    setUpdateSuccess("");
    setEditMode(false);
    setLookupLoading(true);
    try {
      const res = await getWebsiteById(id);
      if (res?.response_code >= 400 || !res?.data) {
        throw new Error(res?.errors?.[0]?.message || res?.message || `Website #${id} was not found.`);
      }
      setSelectedWebsite(res.data);
    } catch (err) {
      setLookupError(err.message || "Unable to connect. Please try again later.");
      setSelectedWebsite(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    openWebsite(lookupId.trim());
  };

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
      setSelectedWebsite(res.data);
    } catch (err) {
      setCreateError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = () => {
    if (!selectedWebsite) return;
    setEditForm({
      name: selectedWebsite.name || "",
      base_url: selectedWebsite.base_url || "",
      description: selectedWebsite.description || "",
      accessibility_status: selectedWebsite.accessibility_status || "",
      environment: selectedWebsite.environment || "PRODUCTION",
      crawl_enabled: !!selectedWebsite.crawl_enabled,
      crawl_frequency: selectedWebsite.crawl_frequency || "",
      authentication_required: !!selectedWebsite.authentication_required,
      authentication_type: selectedWebsite.authentication_type || "",
    });
    setUpdateError("");
    setUpdateSuccess("");
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm(null);
    setUpdateError("");
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWebsite || !editForm) return;

    setUpdateError("");
    setUpdateSuccess("");

    if (!editForm.name.trim() || !editForm.base_url.trim()) {
      setUpdateError("Name and Base URL are required.");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        base_url: editForm.base_url.trim(),
        description: editForm.description.trim(),
        accessibility_status: editForm.accessibility_status.trim(),
        environment: editForm.environment,
        crawl_enabled: editForm.crawl_enabled,
        crawl_frequency: editForm.crawl_frequency.trim(),
        authentication_required: editForm.authentication_required,
        authentication_type: editForm.authentication_required
          ? editForm.authentication_type.trim()
          : "",
      };
      const res = await updateWebsite(selectedWebsite.id, payload);
      if (res?.response_code >= 400 || !res?.data) {
        throw new Error(res?.errors?.[0]?.message || res?.message || "Failed to update website.");
      }
      setSelectedWebsite(res.data);
      setWebsites((prev) => prev.map((w) => (w.id === res.data.id ? res.data : w)));
      setUpdateSuccess("Website updated successfully.");
      setEditMode(false);
      setEditForm(null);
    } catch (err) {
      setUpdateError(err.message || "Unable to connect. Please try again later.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="ww-page">
      <main className="ww-main">
        {/* Topbar */}
        <div className="ww-topbar">
          <div className="ww-topbar-left">
            <button
              className="ww-back-fab"
              onClick={() => navigate("/accessibility")}
              title="Back to Accessibility"
              aria-label="Back to Accessibility"
            >
              ←
            </button>
            <div className="ww-breadcrumb">
              <span className="ww-bc-root">Accessibility</span>
              <span className="ww-bc-sep">›</span>
              <span className="ww-bc-current">Validate Web</span>
            </div>
          </div>
          <div className="ww-topbar-right">
            <div className="ww-status-chip">
              <span className="ww-chip-dot dot-blue"></span>
              {listLoading ? "Loading…" : `${websites.length} Website${websites.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        <div className="ww-content">
          {/* ══ STEP 1 — Register ══ */}
          <section className="ww-step-card">
            <div className="ww-step-badge"><span>1</span></div>
            <div className="ww-step-body">
              <div className="ww-step-head">
                <div>
                  <h2 className="ww-step-title">Register a Website</h2>
                  <p className="ww-step-desc">Add a website so it can be scanned for accessibility issues.</p>
                </div>
              </div>

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
                {createSuccess && <div className="ww-alert ww-alert-success ww-field-wide">{createSuccess}</div>}

                <div className="ww-field-wide">
                  <button type="submit" className="ww-btn-primary" disabled={creating}>
                    {creating ? "Registering…" : "Register Website"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* ══ STEP 2 — Your Websites ══ */}
          <section className="ww-step-card">
            <div className="ww-step-badge"><span>2</span></div>
            <div className="ww-step-body">
              <div className="ww-step-head">
                <div>
                  <h2 className="ww-step-title">Your Websites</h2>
                  <p className="ww-step-desc">Select a website to view its details, or look one up by ID.</p>
                </div>
                <form className="ww-lookup-form" onSubmit={handleLookupSubmit}>
                  <input
                    type="text"
                    className="ww-input ww-lookup-input"
                    placeholder="Website ID"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                  />
                  <button type="submit" className="ww-btn-secondary" disabled={lookupLoading}>
                    {lookupLoading ? "Looking up…" : "Get by ID"}
                  </button>
                </form>
              </div>

              {lookupError && <div className="ww-alert ww-alert-error">{lookupError}</div>}
              {listError && <div className="ww-alert ww-alert-error">{listError}</div>}

              {listLoading ? (
                <div className="ww-empty-state">Loading websites…</div>
              ) : websites.length === 0 ? (
                <div className="ww-empty-state">No websites registered yet. Add one above to get started.</div>
              ) : (
                <div className="ww-website-grid">
                  {websites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      className={`ww-website-card ${selectedWebsite?.id === site.id ? "ww-website-card-active" : ""}`}
                      onClick={() => openWebsite(site.id)}
                    >
                      <div className="ww-wc-top">
                        <span className="ww-wc-name">{site.name}</span>
                        <span className={`ww-status-badge ${statusClass(site.accessibility_status)}`}>
                          {site.accessibility_status || "UNKNOWN"}
                        </span>
                      </div>
                      <span className="ww-wc-url">{site.base_url}</span>
                      <span className="ww-wc-meta">#{site.id} · {site.environment}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ══ STEP 3 — Details / Update ══ */}
          {selectedWebsite && (
            <section className="ww-step-card">
              <div className="ww-step-badge"><span>3</span></div>
              <div className="ww-step-body">
                <div className="ww-step-head">
                  <div>
                    <h2 className="ww-step-title">Website Details</h2>
                    <p className="ww-step-desc">#{selectedWebsite.id} · {selectedWebsite.name}</p>
                  </div>
                  {!editMode && (
                    <button type="button" className="ww-btn-secondary" onClick={startEdit}>
                      Edit Website
                    </button>
                  )}
                </div>

                {updateSuccess && <div className="ww-alert ww-alert-success">{updateSuccess}</div>}

                {!editMode ? (
                  <div className="ww-detail-grid">
                    <div className="ww-detail-item"><span className="ww-detail-label">Name</span><span className="ww-detail-value">{selectedWebsite.name}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Base URL</span><span className="ww-detail-value">{selectedWebsite.base_url}</span></div>
                    <div className="ww-detail-item ww-field-wide"><span className="ww-detail-label">Description</span><span className="ww-detail-value">{selectedWebsite.description || "—"}</span></div>
                    <div className="ww-detail-item">
                      <span className="ww-detail-label">Accessibility Status</span>
                      <span className={`ww-status-badge ${statusClass(selectedWebsite.accessibility_status)}`}>
                        {selectedWebsite.accessibility_status || "UNKNOWN"}
                      </span>
                    </div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Environment</span><span className="ww-detail-value">{selectedWebsite.environment}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Crawl Enabled</span><span className="ww-detail-value">{selectedWebsite.crawl_enabled ? "Yes" : "No"}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Crawl Frequency</span><span className="ww-detail-value">{selectedWebsite.crawl_frequency || "—"}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Authentication Required</span><span className="ww-detail-value">{selectedWebsite.authentication_required ? "Yes" : "No"}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Authentication Type</span><span className="ww-detail-value">{selectedWebsite.authentication_type || "—"}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Created</span><span className="ww-detail-value">{formatDate(selectedWebsite.created_at)}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Updated</span><span className="ww-detail-value">{formatDate(selectedWebsite.updated_at)}</span></div>
                    <div className="ww-detail-item"><span className="ww-detail-label">Last Scan</span><span className="ww-detail-value">{formatDate(selectedWebsite.last_scan_at)}</span></div>
                  </div>
                ) : (
                  <form className="ww-form-grid" onSubmit={handleUpdateSubmit}>
                    <label className="ww-field">
                      <span className="ww-field-label">Name *</span>
                      <input
                        type="text"
                        className="ww-input"
                        value={editForm.name}
                        onChange={(e) => handleEditChange("name", e.target.value)}
                      />
                    </label>

                    <label className="ww-field">
                      <span className="ww-field-label">Base URL *</span>
                      <input
                        type="text"
                        className="ww-input"
                        value={editForm.base_url}
                        onChange={(e) => handleEditChange("base_url", e.target.value)}
                      />
                    </label>

                    <label className="ww-field ww-field-wide">
                      <span className="ww-field-label">Description</span>
                      <textarea
                        className="ww-input ww-textarea"
                        value={editForm.description}
                        onChange={(e) => handleEditChange("description", e.target.value)}
                      />
                    </label>

                    <label className="ww-field">
                      <span className="ww-field-label">Accessibility Status</span>
                      <input
                        type="text"
                        className="ww-input"
                        placeholder="e.g. UNKNOWN, PASS, FAIL"
                        value={editForm.accessibility_status}
                        onChange={(e) => handleEditChange("accessibility_status", e.target.value)}
                      />
                    </label>

                    <label className="ww-field">
                      <span className="ww-field-label">Environment</span>
                      <select
                        className="ww-input"
                        value={editForm.environment}
                        onChange={(e) => handleEditChange("environment", e.target.value)}
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
                        value={editForm.crawl_frequency}
                        onChange={(e) => handleEditChange("crawl_frequency", e.target.value)}
                      />
                    </label>

                    <label className="ww-checkbox-field">
                      <input
                        type="checkbox"
                        checked={editForm.crawl_enabled}
                        onChange={(e) => handleEditChange("crawl_enabled", e.target.checked)}
                      />
                      <span>Enable crawling</span>
                    </label>

                    <label className="ww-checkbox-field">
                      <input
                        type="checkbox"
                        checked={editForm.authentication_required}
                        onChange={(e) => handleEditChange("authentication_required", e.target.checked)}
                      />
                      <span>Requires authentication</span>
                    </label>

                    {editForm.authentication_required && (
                      <label className="ww-field">
                        <span className="ww-field-label">Authentication Type</span>
                        <input
                          type="text"
                          className="ww-input"
                          value={editForm.authentication_type}
                          onChange={(e) => handleEditChange("authentication_type", e.target.value)}
                        />
                      </label>
                    )}

                    {updateError && <div className="ww-alert ww-alert-error ww-field-wide">{updateError}</div>}

                    <div className="ww-field-wide ww-form-actions">
                      <button type="submit" className="ww-btn-primary" disabled={updating}>
                        {updating ? "Saving…" : "Save Changes"}
                      </button>
                      <button type="button" className="ww-btn-ghost" onClick={cancelEdit} disabled={updating}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}