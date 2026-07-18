// ─────────────────────────────────────────────────────────────
// Role helpers
//
// role_name comes back from POST /auth/login (e.g. "USER", "ADMIN")
// and is stored in sessionStorage at login time. These helpers are
// used across pages to gate admin-only UI (MIS sections, Editor+
// management tabs, etc.) without repeating the same checks everywhere.
// ─────────────────────────────────────────────────────────────

export const getUserRole = () => sessionStorage.getItem("userRole") || "";

export const isAdmin = () => getUserRole().toUpperCase() === "ADMIN";