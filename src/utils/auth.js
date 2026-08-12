

// export const getUserRole = () => sessionStorage.getItem("userRole") || "";

// export const isAdmin = () => getUserRole().toUpperCase() === "ADMIN";

// // SME (Subject Matter Expert) role — used to gate the BookForge
// // "Dashboard" pipeline view and the "SME Capture" (interview Q&A)
// // screen, same as isAdmin() gates MIS/admin-only sections.
// export const isSme = () => getUserRole().toUpperCase() === "SME";

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

// Convenience helper: anyone allowed to see the BookForge management
// Dashboard tab and the SME Capture nav item — Admins and SMEs only.
// Plain USER accounts should never see either.
export const canAccessBookForgeDashboard = () => isAdmin() || isSme();