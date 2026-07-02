
const BASE_URL = import.meta.env.VITE_API_URL;

// ── Auth ─────────────────────────────────────────────────────

export const registerUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
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


// ── Master Setup ─────────────────────────────────────────────

// GET all organizations  (GET /api/v1/master-setup/organizations)
export const getOrganizations = async () => {
  const response = await fetch(`${BASE_URL}/master-setup/organizations`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  return response.json();
};

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