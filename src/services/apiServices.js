

// const BASE_URL = "http://localhost:8000/api/v1";


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


// // ── Template ─────────────────────────────────────────────────

// export const saveMasterTemplate = async (rows) => {
//   const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ rows })
//   });
//   return response;
// };

// // POST /api/v1/accessibility/master_accessibility_check/clone
// // Clones the master template into an organization template
// export const cloneMasterTemplate = async (organizationId, projectId) => {
//   const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check/clone`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ organization_id: Number(organizationId), project_id: projectId })
//   });
//   return response;
// };

// // POST /api/v1/accessibility/run-checks
// // Runs accessibility checks on a selected organization template
// export const runAccessibilityChecks = async (templateId) => {
//   const response = await fetch(`${BASE_URL}/accessibility/run-checks`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ template_id: templateId })
//   });
//   return response;
// };


// // ── Validate PDF ─────────────────────────────────────────────

// export const validatePdf = async (pdfFile) => {
//   const formData = new FormData();
//   formData.append("file", pdfFile);

//   const response = await fetch(`${BASE_URL}/accessibility/run-checks`, {
//     method: "POST",
//     body: formData,
//     // Do NOT set Content-Type manually — browser sets it automatically for FormData
//   });
//   return response;
// };

// // POST /api/v1/submit/manuscripts
// // Submits the validated manuscript
// export const submitManuscript = async (pdfFile, validationData) => {
//   const formData = new FormData();
//   formData.append("file", pdfFile);
//   if (validationData) {
//     formData.append("validation_result", JSON.stringify(validationData));
//   }

//   const response = await fetch(`${BASE_URL}/submit/manuscripts`, {
//     method: "POST",
//     body: formData,
//   });
//   return response;
// };



// ── All API calls for the project are here ───────────────────
// If the backend URL changes, update only BASE_URL below.

const BASE_URL = "http://localhost:8000/api/v1";


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


// ── Template ─────────────────────────────────────────────────

export const saveMasterTemplate = async (rows) => {
  const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows })
  });
  return response;
};

// POST /api/v1/accessibility/master_accessibility_check/clone
// Clones the master template into an organization template
export const cloneMasterTemplate = async (organizationId, projectId) => {
  const response = await fetch(`${BASE_URL}/accessibility/master_accessibility_check/clone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organization_id: Number(organizationId), project_id: projectId })
  });
  return response;
};

// POST /api/v1/accessibility/run-checks
// Runs accessibility checks on a selected organization template
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


// ── Validate PDF ─────────────────────────────────────────────

export const validatePdf = async (pdfFile) => {
  const formData = new FormData();
  formData.append("file", pdfFile);

  const response = await fetch(`${BASE_URL}/accessibility/run-checks`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type manually — browser sets it automatically for FormData
  });
  return response;
};

// POST /api/v1/submit/manuscripts
// Submits the validated manuscript
export const submitManuscript = async (pdfFile, validationData) => {
  const formData = new FormData();
  formData.append("file", pdfFile);
  if (validationData) {
    formData.append("validation_result", JSON.stringify(validationData));
  }

  const response = await fetch(`${BASE_URL}/submit/manuscripts`, {
    method: "POST",
    body: formData,
  });
  return response;
};