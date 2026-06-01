


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


// // ── Submit Manuscript ─────────────────────────────────────────
// // POST /api/v1/submit/manuscripts
// // Sends: title, author, organization_id, file (multipart/form-data)

// export const submitManuscript = async (pdfFile, title, author, organizationId) => {
//   const formData = new FormData();
//   formData.append("file", pdfFile);
//   formData.append("title", title);
//   formData.append("author", author);
//   formData.append("organization_id", Number(organizationId));

//   const response = await fetch(`${BASE_URL}/submit/manuscripts`, {
//     method: "POST",
//     body: formData,
//     // Do NOT set Content-Type manually — browser sets it automatically for FormData
//   });
//   return response;
// };


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


// // ── Submit Manuscript ─────────────────────────────────────────
// // POST /api/v1/submit/manuscripts
// // Sends: title, author, organization_id, file (multipart/form-data)

// export const submitManuscript = async (pdfFile, title, author, organizationId) => {
//   const formData = new FormData();
//   formData.append("file", pdfFile);
//   formData.append("title", title);
//   formData.append("author", author);
//   formData.append("organization_id", Number(organizationId));

//   const response = await fetch(`${BASE_URL}/submit/manuscripts`, {
//     method: "POST",
//     body: formData,
//     // Do NOT set Content-Type manually — browser sets it automatically for FormData
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
// GET /api/v1/accessibility/master_accessibility_check/OrganizationWiseTemplate/{organization_id}
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


// ── Submit Manuscript ─────────────────────────────────────────
// POST /api/v1/submit/manuscripts
// Sends: title, author, organization_id, file (multipart/form-data)

export const submitManuscript = async (pdfFile, title, author, organizationId) => {
  const formData = new FormData();
  // Order matches Swagger schema exactly: title → author → organization_id → file
  formData.append("title", title);
  formData.append("author", author);
  formData.append("organization_id", parseInt(organizationId, 10));
  formData.append("file", pdfFile, pdfFile.name);

  const response = await fetch(`${BASE_URL}/submit/manuscripts`, {
    method: "POST",
    body: formData,
  });
  return response;
};