



// export const getUserRole = () => sessionStorage.getItem("userRole") || "";

// export const isAdmin = () => getUserRole().toUpperCase() === "ADMIN";

// // SME (Subject Matter Expert) role — used to gate the BookForge
// // "Dashboard" pipeline view and the "SME Upload" (interview Q&A)
// // screen, same as isAdmin() gates MIS/admin-only sections.
// // role_name comes back from the backend as "BookForge_SME" (with the
// // module prefix), so it's normalized before comparison.
// export const isSme = () => getUserRole().toUpperCase().replace(/^BOOKFORGE_/, "") === "SME";

// // Convenience helper: anyone allowed to see the BookForge management
// // Dashboard tab and the SME Capture nav item — Admins and SMEs only.
// // Plain USER accounts should never see either.
// export const canAccessBookForgeDashboard = () => isAdmin() || isSme();


export const getUserRole = () => sessionStorage.getItem("userRole") || "";

export const isAdmin = () => getUserRole().toUpperCase() === "ADMIN";

// SME (Subject Matter Expert) role — used to gate the BookForge
// "Dashboard" pipeline view and the "SME Upload" (interview Q&A)
// screen, same as isAdmin() gates MIS/admin-only sections.
// role_name comes back from the backend as "BookForge_SME" (with the
// module prefix), so it's normalized before comparison.
export const isSme = () => getUserRole().toUpperCase().replace(/^BOOKFORGE_/, "") === "SME";

// Plain USER role — same "BookForge_" prefix normalization as isSme().
export const isUser = () => getUserRole().toUpperCase().replace(/^BOOKFORGE_/, "") === "USER";

// Convenience helper: anyone allowed to see the BookForge management
// Dashboard tab (Project Pipeline view) — Admins, SMEs, and plain
// Users can all see it. Users get a view-only dashboard (no
// Edit/Delete actions on the pipeline table — that stays Admin/SME).
export const canAccessBookForgeDashboard = () => isAdmin() || isSme() || isUser();