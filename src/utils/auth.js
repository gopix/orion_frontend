// // ─────────────────────────────────────────────────────────────
// // Role helpers
// //
// // role_name comes back from POST /auth/login (e.g. "USER", "ADMIN")
// // and is stored in sessionStorage at login time. These helpers are
// // used across pages to gate admin-only UI (MIS sections, Editor+
// // management tabs, etc.) without repeating the same checks everywhere.
// // ─────────────────────────────────────────────────────────────

// export const getUserRole = () => sessionStorage.getItem("userRole") || "";

// export const isAdmin = () => getUserRole().toUpperCase() === "ADMIN";



// ─────────────────────────────────────────────────────────────
// Role helpers
//
// role_name comes back from POST /auth/login (e.g. "USER", "ADMIN")
// and is stored in sessionStorage at login time. These helpers are
// used across pages to gate admin-only UI (MIS sections, Editor+
// management tabs, etc.) without repeating the same checks everywhere.
//
// BookForge roles (per Gopal, 7/8/2026): USER and ADMIN stay as-is;
// two new roles were added — SME and EDITOR:
//   - USER   -> creates BookForge projects and uploads the brief doc
//   - SME    -> views documents uploaded for a project, and uploads/
//               pastes the Q&A (SME Interview Capture screen)
//   - EDITOR -> reviews the SME's document/Q&A submissions and
//               approves them
//   - ADMIN  -> allocates roles and projects to users
// role_name may come back with or without the "BookForge_" prefix
// (e.g. "ADMIN" or "BookForge_SME"), so it's normalized before
// comparison.
// ─────────────────────────────────────────────────────────────

export const getUserRole = () => sessionStorage.getItem("userRole") || "";

const normalizeRole = (role) => (role || "").toUpperCase().replace(/^BOOKFORGE_/, "");

export const isAdmin = () => normalizeRole(getUserRole()) === "ADMIN";
export const isUser = () => normalizeRole(getUserRole()) === "USER";
export const isSME = () => normalizeRole(getUserRole()) === "SME";
export const isEditor = () => normalizeRole(getUserRole()) === "EDITOR";