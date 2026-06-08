// const BASE_URL = import.meta.env.VITE_API_URL;

// // ── Auth ─────────────────────────────────────────────────────

// export const registerUser = async (email, password) => {
//   const response = await fetch(`${BASE_URL}/auth/register`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password })
//   });
//   return response.json();
// };

// export const loginUser = async (email, password) => {
//   const response = await fetch(`${BASE_URL}/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password })
//   });
//   return response.json();
// };


// // ── Master Setup ─────────────────────────────────────────────

// // GET all organizations  (GET /api/v1/master-setup/organizations)
// export const getOrganizations = async () => {
//   const response = await fetch(`${BASE_URL}/master-setup/organizations`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" }
//   });
//   return response.json();
// };

// // ── Template ─────────────────────────────────────────────────

// // GET all checks from master table
// export const getMasterAccessibilityChecks = async () => {
//   const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" }
//   });
//   return response.json();
// };

// // POST save master template rows
// export const saveMasterTemplate = async (rows) => {
//   const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ rows })
//   });
//   return response;
// };

// // POST clone master template to organization
// export const cloneMasterTemplate = async (organizationId, projectId) => {
//   const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check/clone`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ organization_id: Number(organizationId), project_id: projectId })
//   });
//   return response;
// };

// // GET organization-wise cloned template entries
// export const getOrganizationWiseTemplate = async (organizationId) => {
//   const response = await fetch(
//     `${BASE_URL}/accessibility/master_accessibility_check/OrganizationWiseTemplate/${organizationId}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" }
//     }
//   );
//   return response.json();
// };

// // POST run accessibility checks
// export const runAccessibilityChecks = async (organizationId, projectId) => {
//   const response = await fetch(`${BASE_URL}/accessibility/run-checks`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       organization_id: Number(organizationId),
//       project_id: projectId,
//       context: {},
//       include_org_level_fallback: true
//     })
//   });
//   return response;
// };


// // ── Validate PDF ──────────────────────────────────────────────
// // POST /api/v1/accessibility/validate-pdf
// // Swagger: multipart/form-data — only field is "file" (required, binary)
// export const validatePdf = async (pdfFile) => {
//   const formData = new FormData();
//   formData.append("file", pdfFile, pdfFile.name);

//   const response = await fetch(`${BASE_URL}/accessibility/validate-pdf`, {
//     method: "POST",
//     body: formData,
//     // Do NOT set Content-Type header — browser sets it with boundary automatically
//   });
//   return response;
// };


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