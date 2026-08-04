

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


// GET all organizations  (GET /api/v1/auth/organization)
export const getOrganizations = async () => {
  const response = await fetch(`${BASE_URL}/auth/organization`, {
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
  formData.append("file", file);
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