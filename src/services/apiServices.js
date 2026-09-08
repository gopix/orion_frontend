



const BASE_URL = import.meta.env.VITE_API_URL;

// ── Auth ─────────────────────────────────────────────────────

// export const registerUser = async (email, password) => {
//   const response = await fetch(`${BASE_URL}/auth/register`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password })
//   });
//   return response.json();
// };
export const registerUser = async (userName, email, password, organizationId) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: userName,
      email,
      password,
      organization_id: Number(organizationId)
    })
  });
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};


// // ── Master Setup ─────────────────────────────────────────────

// // GET all organizations  (GET /api/v1/master-setup/organizations)
// export const getOrganizations = async () => {
//   const response = await fetch(`${BASE_URL}/master-setup/organizations`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" }
//   });
//   return response.json();
// };

// ── Template ─────────────────────────────────────────────────

// GET all checks from master table
export const getMasterAccessibilityChecks = async () => {
  const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// POST save master template rows
export const saveMasterTemplate = async (rows) => {
  const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows })
  });
  return response;
};

// POST clone master template to organization
export const cloneMasterTemplate = async (organizationId, projectId) => {
  const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check/clone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organization_id: Number(organizationId), project_id: projectId })
  });
  return response;
};

// GET organization-wise cloned template entries
export const getOrganizationWiseTemplate = async (organizationId) => {
  const response = await fetch(
    `${BASE_URL}/accessibility/master_accessibility_check/OrganizationWiseTemplate/${organizationId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    }
  );
  return response.json();
};

// POST run accessibility checks
export const runAccessibilityChecks = async (organizationId, projectId) => {
  const response = await fetch(`${BASE_URL}/accessibility/run-checks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organization_id: Number(organizationId),
      project_id: projectId,
      context: {},
      include_org_level_fallback: true
    })
  });
  return response;
};


// ── Validate PDF ──────────────────────────────────────────────
// POST /api/v1/accessibility/validate-pdf
// Swagger: multipart/form-data — only field is "file" (required, binary)
export const validatePdf = async (pdfFile) => {
  const formData = new FormData();
  formData.append("file", pdfFile, pdfFile.name);

  const response = await fetch(`${BASE_URL}/accessibility/validate-pdf`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type header — browser sets it with boundary automatically
  });
  return response;
};

// ── Orion Validate PDF (new API) ──────────────────────────────
// POST /api/v1/accessibility/orion-validate-pdf
// Query params: organization_id, project_id
// Body: multipart/form-data with "file"
export const orionValidatePdf = async (pdfFile, organizationId = 1, projectId = 1) => {
  const formData = new FormData();
  formData.append("file", pdfFile, pdfFile.name);

  const url = `${BASE_URL}/accessibility/orion-validate-pdf?organization_id=${organizationId}&project_id=${projectId}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser sets it with boundary automatically
  });
  return response;
};

// ── Orion Validate PPT (new API) ────────────────────────────────
// POST /api/v1/ppt-accessibility/orion-validate-ppt
// Query params: organization_id, project_id
// Body: multipart/form-data with "file"
export const orionValidatePpt = async (pptFile, organizationId = 1, projectId = 1) => {
  const formData = new FormData();
  formData.append("file", pptFile, pptFile.name);

  const url = `${BASE_URL}/ppt-accessibility/orion-validate-ppt?organization_id=${organizationId}&project_id=${projectId}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser sets it with boundary automatically
  });
  return response;
};

// ── Orion Remediate PPT ────────────────────────────────────────
// POST /api/v1/ppt-accessibility/orion-remediate-ppt
// Query params: organization_id, project_id
// Body: multipart/form-data with "file"
// Returns: response_code 202, message, data { job_id, status, status_url, download_url, report_url }, errors
export const orionRemediatePpt = async (pptFile, organizationId = 1, projectId = 1) => {
  const formData = new FormData();
  formData.append("file", pptFile, pptFile.name);

  const url = `${BASE_URL}/ppt-accessibility/orion-remediate-ppt?organization_id=${organizationId}&project_id=${projectId}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser sets it with boundary automatically
  });
  return response;
};

// ── PPT Remediation Status ──────────────────────────────────────
// GET /api/v1/ppt-accessibility/ppt-remediation-status/{job_id}
// Path param: job_id (string, required)
export const getPptRemediationStatus = async (jobId) => {
  const response = await fetch(`${BASE_URL}/ppt-accessibility/ppt-remediation-status/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return response;
};

// ── Download Remediated PPT ─────────────────────────────────────
// GET /api/v1/ppt-accessibility/download-remediated-ppt/{job_id}
// Path param: job_id (string, required)
// Returns: the remediated PPT file (binary)
export const downloadRemediatedPpt = async (jobId) => {
  const response = await fetch(`${BASE_URL}/ppt-accessibility/download-remediated-ppt/${jobId}`, {
    method: "GET",
  });
  return response;
};

// ── PPT Remediation Report ──────────────────────────────────────
// GET /api/v1/ppt-accessibility/remediation-report/{job_id}
// Path param: job_id (string, required)
export const getPptRemediationReport = async (jobId) => {
  const response = await fetch(`${BASE_URL}/ppt-accessibility/remediation-report/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return response;
};

// ── PPT Accessibility Dashboard ─────────────────────────────────
// GET /api/v1/ppt-accessibility/dashboard/ppt/{job_id}
// Path param: job_id (string, required)
// Returns: four headline KPIs for a completed remediation job
export const getPptAccessibilityDashboard = async (jobId) => {
  const response = await fetch(`${BASE_URL}/ppt-accessibility/dashboard/ppt/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return response;
};

// ── Orion Remediate PDF ───────────────────────────────────────
// POST /api/v1/accessibility/orion-remediate-pdf
// Query params: organization_id, project_id
// Body: multipart/form-data with "file"
// Returns: job_id, status, issues_detected, issues_fixed, issues_remaining,
//          auto_fixable_count, download_url, report_url
export const orionRemediatePdf = async (pdfFile, organizationId = 1, projectId = 1) => {
  const formData = new FormData();
  formData.append("file", pdfFile, pdfFile.name);

  const url = `${BASE_URL}/accessibility/orion-remediate-pdf?organization_id=${organizationId}&project_id=${projectId}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser sets it with boundary automatically
  });
  return response;
};

// ── Remediation Status ────────────────────────────────────────
// GET /api/v1/accessibility/remediation-status/{job_id}
// Path param: job_id (string, required)
// Returns: response_code, message, data, errors
export const getRemediationStatus = async (jobId) => {
  const response = await fetch(`${BASE_URL}/accessibility/remediation-status/${jobId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
};

// ── Remediation Report (NEW) ──────────────────────────────────
// GET /api/v1/accessibility/remediation-report/{job_id}
// Path param: job_id (string, required)
// Returns: response_code, message, data (full validation + remediation + re-validation report), errors
export const getRemediationReport = async (jobId) => {
  const response = await fetch(`${BASE_URL}/accessibility/remediation-report/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return response;
};

// ── Download Remediated PDF ────────────────────────────────────
// GET /api/v1/accessibility/download-remediated-pdf/{job_id}
// Path param: job_id (string, required)
// Returns: the remediated PDF file (binary)
export const downloadRemediatedPdf = async (jobId) => {
  const response = await fetch(`${BASE_URL}/accessibility/download-remediated-pdf/${jobId}`, {
    method: "GET",
  });
  return response;
};

// ── Accessibility Dashboard (NEW) ───────────────────────────────
// GET /api/v1/accessibility/dashboard/{job_id}
// Path param: job_id (string, required)
// Returns: response_code, message, data (dashboard: accessibility_score, pdfua_compliance, wcag_risk, critical_issues, ...)
export const getAccessibilityDashboard = async (jobId) => {
  const response = await fetch(`${BASE_URL}/accessibility/dashboard/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return response;
};

// ── MIS — Accessibility Audit Template (NEW) ────────────────────
// GET /api/v1/accessibility/accessibility-audit-template/{organization_id}
// Path param: organization_id (integer, required)
// Returns: accessibility MIS rows for an organization with user/role/org metadata
export const getAccessibilityAuditTemplate = async (organizationId) => {
  const response = await fetch(
    `${BASE_URL}/accessibility/accessibility-audit-template/${organizationId}`,
    {
      method: "GET",
      headers: { "Accept": "application/json" },
    }
  );
  return response;
};

// GET /api/v1/accessibility/accessibility-audit-template/{organization_id}/csv
// Path param: organization_id (integer, required)
// Returns: a CSV file (binary) of accessibility MIS rows for the organization
export const exportAccessibilityAuditTemplateCsv = async (organizationId) => {
  const response = await fetch(
    `${BASE_URL}/accessibility/accessibility-audit-template/${organizationId}/csv`,
    {
      method: "GET",
      headers: { "Accept": "application/octet-stream" },
    }
  );
  return response;
};


// GET all organizations  (GET /api/v1/master-setup/organizations)
export const getOrganizations = async () => {
  const response = await fetch(`${BASE_URL}/master-setup/organizations`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// ── Book Forge ───────────────────────────────────────────────

// POST /api/v1/book-forge/projects  (Create Project)
export const createBookForgeProject = async (payload) => {
  const response = await fetch(`${BASE_URL}/book-forge/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
};

// GET /api/v1/book-forge/projects  (List Projects, paginated)
export const getBookForgeProjects = async (skip = 0, limit = 100, bookStatus) => {
  const params = new URLSearchParams({ skip, limit });
  if (bookStatus) params.append("book_status", bookStatus);
  const response = await fetch(`${BASE_URL}/book-forge/projects?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// GET /api/v1/book-forge/projects/{project_id}  (Get Project)
export const getBookForgeProjectById = async (projectId) => {
  const response = await fetch(`${BASE_URL}/book-forge/projects/${projectId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// PUT /api/v1/book-forge/projects/{project_id}  (Update Project)
export const updateBookForgeProject = async (projectId, payload) => {
  const response = await fetch(`${BASE_URL}/book-forge/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
};

// DELETE /api/v1/book-forge/projects/{project_id}  (Soft-delete Project)
export const deleteBookForgeProject = async (projectId) => {
  const response = await fetch(`${BASE_URL}/book-forge/projects/${projectId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// POST /api/v1/book-forge/projects/{project_id}/documents  (Upload Document)
export const uploadBookForgeDocument = async (projectId, file, createdBy, documentType = "") => {
  const formData = new FormData();
  // Backend expects the multipart field named "files" (see Swagger: POST
  // /book-forge/projects/{project_id}/documents) — sending it as "file" is
  // what was silently failing against the real API.
  formData.append("files", file);
  formData.append("created_by", createdBy);
  formData.append("document_type", documentType);
  const response = await fetch(`${BASE_URL}/book-forge/projects/${projectId}/documents`, {
    method: "POST",
    body: formData
  });
  return response.json();
};

// GET /api/v1/book-forge/projects/{project_id}/documents  (List Documents, paginated)
export const getBookForgeDocuments = async (projectId, skip = 0, limit = 100) => {
  const params = new URLSearchParams({ skip, limit });
  const response = await fetch(`${BASE_URL}/book-forge/projects/${projectId}/documents?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// GET /api/v1/book-forge/documents/{document_id}  (Get Document Metadata)
export const getBookForgeDocumentMetadata = async (documentId) => {
  const response = await fetch(`${BASE_URL}/book-forge/documents/${documentId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// DELETE /api/v1/book-forge/documents/{document_id}  (Delete Document)
export const deleteBookForgeDocument = async (documentId) => {
  const response = await fetch(`${BASE_URL}/book-forge/documents/${documentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// GET /api/v1/book-forge/documents/{document_id}/download  (Download Document)
export const downloadBookForgeDocument = async (documentId) => {
  const response = await fetch(`${BASE_URL}/book-forge/documents/${documentId}/download`, {
    method: "GET",
    headers: { accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const disposition = response.headers.get("content-disposition") || "";
  let filename = "document";
  const utf8Match = disposition.match(/filename\*=utf-8''([^;]+)/i);
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (utf8Match && utf8Match[1]) {
    filename = decodeURIComponent(utf8Match[1]);
  } else if (plainMatch && plainMatch[1]) {
    filename = plainMatch[1];
  }

  const blob = await response.blob();
  return { blob, filename };
};

// POST /api/v1/book-forge/projects/{project_id}/interview  (Submit SME Interview)
// Pass either `text` (typed Q&A — the backend renders it to a PDF) or a
// `file` (an existing PDF, stored as-is). If a file is given, it takes
// priority over text. Either way it's stored under document_type
// "sme_interview" and shows up in the project's Documents list.
export const submitBookForgeInterview = async (projectId, createdBy, { text, file } = {}) => {
  const formData = new FormData();
  formData.append("created_by", createdBy);
  if (file) {
    formData.append("file", file);
  } else {
    formData.append("text", text || "");
  }
  const response = await fetch(`${BASE_URL}/book-forge/projects/${projectId}/interview`, {
    method: "POST",
    body: formData
  });
  return response.json();
};

// ── Book Forge — SME Interview Capture ─────────────────────────
// ⚠️ PLACEHOLDER / MOCK — the backend does not have SME Q&A entry
// endpoints yet. Everything below is kept in localStorage so the
// SME Capture screen is fully usable today. Final submission
// (submitSmeQaSession) is REAL — it calls submitBookForgeInterview
// above.
//
// When Gopal Sir ships the real entry endpoints, replace the body of
// each function below with the matching fetch() call. Function
// names, params, and the { response_code, message, data, errors }
// return shape are already written to match the rest of this file,
// so nothing in the UI should need to change.

const smeQaStorageKey = (projectId) => `bf_sme_qa_${projectId}`;

const readSmeQaStore = (projectId) => {
  try {
    const raw = localStorage.getItem(smeQaStorageKey(projectId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeSmeQaStore = (projectId, entries) => {
  localStorage.setItem(smeQaStorageKey(projectId), JSON.stringify(entries));
};

// GET-equivalent — list Q&A entries captured so far for a project.
// TODO(backend): replace with GET /api/v1/book-forge/projects/{project_id}/sme-qa
export const getSmeQaEntries = async (projectId) => {
  const data = readSmeQaStore(projectId);
  return { response_code: 200, message: "OK (mock)", data, errors: [] };
};

// POST-equivalent — create one Q&A entry.
// TODO(backend): replace with POST /api/v1/book-forge/projects/{project_id}/sme-qa
export const createSmeQaEntry = async (projectId, { question, answer }, createdBy) => {
  const entries = readSmeQaStore(projectId);
  const entry = {
    id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    project_id: projectId,
    question: (question || "").trim(),
    answer: (answer || "").trim(),
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  entries.push(entry);
  writeSmeQaStore(projectId, entries);
  return { response_code: 201, message: "Question added (mock)", data: entry, errors: [] };
};

// PUT-equivalent — update one Q&A entry's question/answer text.
// TODO(backend): replace with PUT /api/v1/book-forge/sme-qa/{entry_id}
export const updateSmeQaEntry = async (projectId, entryId, { question, answer }) => {
  const entries = readSmeQaStore(projectId);
  const idx = entries.findIndex((e) => e.id === entryId);
  if (idx === -1) {
    return { response_code: 404, message: "Not found (mock)", data: null, errors: [{ message: "Entry not found" }] };
  }
  entries[idx] = { ...entries[idx], question, answer, updated_at: new Date().toISOString() };
  writeSmeQaStore(projectId, entries);
  return { response_code: 200, message: "Updated (mock)", data: entries[idx], errors: [] };
};

// DELETE-equivalent — remove one Q&A entry.
// TODO(backend): replace with DELETE /api/v1/book-forge/sme-qa/{entry_id}
export const deleteSmeQaEntry = async (projectId, entryId) => {
  const entries = readSmeQaStore(projectId).filter((e) => e.id !== entryId);
  writeSmeQaStore(projectId, entries);
  return { response_code: 200, message: "Deleted (mock)", data: null, errors: [] };
};

// Clears every draft Q&A entry for a project — called after the
// draft has been converted into a PDF, since those questions now
// live in the submitted document instead of the draft list.
// TODO(backend): once sme-qa entries live server-side, this should
// likely just be a side effect of the submit endpoint rather than a
// separate bulk-delete call.
export const clearSmeQaEntries = async (projectId) => {
  writeSmeQaStore(projectId, []);
  return { response_code: 200, message: "Cleared (mock)", data: null, errors: [] };
};

// Which projects should an SME see when they open SME Capture?
// TODO(backend): replace with a real filtered endpoint, e.g.
//   GET /api/v1/book-forge/projects?assigned_sme={sme_id}
// For now this calls the REAL "list projects" API and returns every
// non-deleted project, since the backend can't yet tell us which
// ones are actually assigned to this SME.
export const getAssignedBookForgeProjectsForSme = async (skip = 0, limit = 100) => {
  const res = await getBookForgeProjects(skip, limit);
  const rows = Array.isArray(res?.data) ? res.data.filter((p) => !p.is_deleted) : [];
  return { ...res, data: rows };
};

// Turns the captured Q&A entries into a single readable text block —
// this is what the backend renders into the sme_interview PDF.
const formatSmeQaAsText = (project, qaEntries, smeLabel) => {
  const lines = [
    `SME Interview — ${project.title || "Untitled Project"}`,
    smeLabel ? `Captured by: ${smeLabel}` : null,
    `Date: ${new Date().toLocaleString()}`,
    ""
  ].filter(Boolean);

  qaEntries.forEach((qa, i) => {
    lines.push(`Q${i + 1}: ${qa.question}`);
    lines.push(`A${i + 1}: ${qa.answer}`);
    lines.push("");
  });

  return lines.join("\n");
};

// Submit a project's Q&A session: sends the captured questions and
// answers as text to the REAL interview API, which stores it as a
// PDF under that project's documents — so it shows up immediately
// in the project's Documents list. If an interview file is passed
// instead (e.g. a PDF the SME already has), that's uploaded as-is.
export const submitSmeQaSession = async (project, qaEntries, createdBy, smeLabel = "", file = null) => {
  if (!file && (!qaEntries || qaEntries.length === 0)) {
    return { response_code: 400, message: "Nothing to submit.", data: null, errors: [{ message: "Add at least one question, or attach a file, before submitting." }] };
  }
  const text = file ? "" : formatSmeQaAsText(project, qaEntries, smeLabel);
  const res = await submitBookForgeInterview(project.id, createdBy, { text, file });
  return res;
};

// ── User & Role Management (BookForge, Admin only) ─────────────

// GET /api/v1/auth/users  (List Users)
export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}/auth/users`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// GET /api/v1/auth/roles  (List Roles)
export const getRoles = async () => {
  const response = await fetch(`${BASE_URL}/auth/roles`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// POST /api/v1/auth/roles  (Create Role)
export const createRole = async (roleName, roleDescription, isActive = 1) => {
  const response = await fetch(`${BASE_URL}/auth/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role_name: roleName,
      role_description: roleDescription,
      is_active: isActive
    })
  });
  return response.json();
};

// ── Book Forge: Categories ──────────────────────────────────────

// POST /api/v1/book-forge/categories  (Create Category)
// Idempotent on normalized category name; returns the created category's id.
export const createBookForgeCategory = async (categoryName, categoryDescription) => {
  const response = await fetch(`${BASE_URL}/book-forge/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: categoryName,
      category_description: categoryDescription
    })
  });
  return response.json();
};

// GET /api/v1/book-forge/categories  (List Categories)
export const getBookForgeCategories = async () => {
  const response = await fetch(`${BASE_URL}/book-forge/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// ── Book Forge: Guidelines ───────────────────────────────────────

// GET /api/v1/book-forge/prompts/book-types/{category_id}  (Get Guidance)
// Returns the current plain-English guidance for a book type/category.
export const getBookForgeGuidance = async (categoryId) => {
  const response = await fetch(`${BASE_URL}/book-forge/prompts/book-types/${categoryId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// PUT /api/v1/book-forge/prompts/book-types/{category_id}  (Save Guidance)
// Saves new guidance for a book type/category — composes, versions, and
// activates it. Returns { category, active_version, model, guidance }.
export const saveBookForgeGuidance = async (categoryId, guidance, createdBy, model) => {
  const response = await fetch(`${BASE_URL}/book-forge/prompts/book-types/${categoryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      guidance,
      created_by: createdBy,
      model
    })
  });
  return response.json();
};

// POST /api/v1/book-forge/prompts/book-types/{category_id}/preview  (Preview Guidance)
// Previews the composed prompt for some guidance — no LLM call, no tokens spent.
export const previewBookForgeGuidance = async (categoryId, guidance) => {
  const response = await fetch(`${BASE_URL}/book-forge/prompts/book-types/${categoryId}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guidance })
  });
  return response.json();
};

// ── Book Forge: AI Pipeline (Knowledge Base) ────────────────────

// POST /api/v1/book-forge/projects/{project_id}/process  (Process Project)
// Fetches every document belonging to the project and runs it through
// the AI pipeline (parse -> chunk -> knowledge graph), returning a
// per-document and aggregate summary.
export const processBookForgeProject = async (projectId) => {
  const response = await fetch(`${BASE_URL}/book-forge/projects/${projectId}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// ── Web Accessibility: Websites ─────────────────────────────────

// POST /api/v1/web-accessibility/websites  (Create Website)
// Registers a new website for accessibility scanning.
export const createWebsite = async (payload) => {
  const response = await fetch(`${BASE_URL}/web-accessibility/websites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
};

// GET /api/v1/web-accessibility/websites  (Get All Websites)
export const getAllWebsites = async () => {
  const response = await fetch(`${BASE_URL}/web-accessibility/websites`, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });
  return response.json();
};

// GET /api/v1/web-accessibility/websites/{website_id}  (Get Website)
export const getWebsiteById = async (websiteId) => {
  const response = await fetch(`${BASE_URL}/web-accessibility/websites/${websiteId}`, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });
  return response.json();
};

// PUT /api/v1/web-accessibility/websites/{website_id}  (Update Website)
// Only fields present in the payload are changed.
export const updateWebsite = async (websiteId, payload) => {
  const response = await fetch(`${BASE_URL}/web-accessibility/websites/${websiteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
};

// DELETE /api/v1/web-accessibility/websites/{website_id}  (Delete Website)
// NOTE: endpoint follows the same REST convention as the other CRUD
// routes above (GET/PUT already use /websites/{website_id}). Update
// the path here once the real Delete Website endpoint is confirmed.
export const deleteWebsite = async (websiteId) => {
  const response = await fetch(`${BASE_URL}/web-accessibility/websites/${websiteId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

// POST /api/v1/web-accessibility/websites/{website_id}/scan  (Create Scan)
// Queues scan(s) for a website and kicks off the fetch(es) in the background.
// Returns 202 immediately.
//   - all_pages false/omitted: queues exactly the one page at payload.url.
//   - all_pages true: discovers every page on the site and queues a scan
//     for each; payload.url is ignored in this mode and max_pages caps
//     how many discovered pages are queued.
export const scanWebsite = async (websiteId, payload) => {
  const response = await fetch(`${BASE_URL}/web-accessibility/websites/${websiteId}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
};

// GET /api/v1/web-accessibility/websites/{website_id}/crawls  (Get Website Crawls)
// Lists a website's crawl runs (each one an all_pages=true request),
// most recent first. Trimmed summary per crawl, not the page-wise detail.
export const getWebsiteCrawls = async (websiteId) => {
  const response = await fetch(`${BASE_URL}/web-accessibility/websites/${websiteId}/crawls`, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });
  return response.json();
};

// GET /api/v1/web-accessibility/scans/{scan_id}  (Get Scan)
// Returns one page's own scan — status/results, with its issues embedded
// inline (there is no separate .../issues endpoint). status/severity/rule_code
// optionally filter the embedded issues the same way the old .../issues
// endpoint did.
export const getScan = async (scanId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.severity) params.append("severity", filters.severity);
  if (filters.rule_code) params.append("rule_code", filters.rule_code);
  const query = params.toString();
  const response = await fetch(
    `${BASE_URL}/web-accessibility/scans/${scanId}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: { "Accept": "application/json" }
    }
  );
  return response.json();
};