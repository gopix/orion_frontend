
// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getBookForgeProjects,
//   getBookForgeProjectById,
//   createBookForgeProject,
//   updateBookForgeProject,
//   deleteBookForgeProject,
//   uploadBookForgeDocument,
//   getBookForgeDocuments,
//   deleteBookForgeDocument,
//   downloadBookForgeDocument,
// } from "../../services/apiServices";
// import { canAccessBookForgeDashboard, isSme } from "../../utils/auth";
// import SmeCapture from "./SmeCapture/SmeCapture";
// import "./Submit.css";

// /* ── Form matches POST /api/v1/book-forge/projects exactly ─────── */
// const EMPTY_FORM = {
//   book_title: "",
//   category: "Exam Preparation",
//   book_subject: "",
//   target_audience: "",
//   language_code: "en",
//   expected_pages: "",
//   chapter_count: "",
//   publisher_name: "",
//   edition: "",
//   primary_output_format: "Word + PDF",
//   book_description: "",
//   submission_deadline: "",
//   book_status: "Draft",
// };

// const bookStatusChipClass = (status) => {
//   const s = (status || "").toLowerCase();
//   if (s.includes("complete") || s.includes("done") || s.includes("export")) return "bf-chip-complete";
//   if (s.includes("review")) return "bf-chip-review";
//   if (s.includes("overdue")) return "bf-chip-overdue";
//   if (s.includes("progress") || s.includes("draft")) return "bf-chip-progress";
//   return "bf-chip-draft";
// };

// /* ── Document helpers (used by Brief Upload list + Dashboard) ──── */
// const docIconFor = (ext) => {
//   const e = (ext || "").toLowerCase();
//   if (e === "pdf") return "📕";
//   if (e === "doc" || e === "docx") return "📘";
//   if (e === "txt") return "📃";
//   return "📄";
// };

// const formatFileSize = (bytes) => {
//   const n = Number(bytes);
//   if (!n || Number.isNaN(n)) return "—";
//   if (n < 1024) return `${n} B`;
//   if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
//   return `${(n / (1024 * 1024)).toFixed(1)} MB`;
// };

// const formatDocDate = (value) => {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
// };

// /* ── BookForge wizard sequence (screen order) ───────────────────
//    Create Project → Upload Brief → SME Capture → Outline → Draft →
//    Review → Export. Only the first two are implemented today; the
//    rest render as upcoming, non-clickable steps in the stepper. */
// const WIZARD_STEPS = [
//   "Create Project",
//   "Upload Brief",
//   "SME Capture",
//   "Outline",
//   "Draft",
//   "Review",
//   "Export",
// ];

// const UPLOAD_ACCEPT = ".doc,.docx,.pdf,.txt";

// export default function Submit() {
//   const navigate = useNavigate();

//   // The BookForge "Dashboard" pipeline view is Admin + SME only —
//   // plain USER accounts create projects and upload briefs, but
//   // aren't authorized to see the management dashboard, so they
//   // never land there and never see it in the nav.
//   const canSeeDashboard = canAccessBookForgeDashboard();

//   // SME accounts only work the Dashboard + SME Upload screens — New
//   // Project / Brief Upload stay Admin + USER only. Admins keep the
//   // full original nav (Dashboard, New Project, Brief Upload) and do
//   // not get the SME Upload item.
//   const isSmeUser = isSme();

//   const [activeTab, setActiveTab] = useState(canSeeDashboard ? "dashboard" : "new-project");

//   // Defensive guard: if activeTab is ever on a screen a role isn't
//   // authorized for (e.g. role changes mid-session), bounce them back
//   // to a screen they're allowed to see instead of rendering a
//   // blank/forbidden tab.
//   useEffect(() => {
//     if (!canSeeDashboard && (activeTab === "dashboard" || activeTab === "sme")) {
//       setActiveTab("new-project");
//     }
//     if (isSmeUser && (activeTab === "new-project" || activeTab === "upload-brief")) {
//       setActiveTab("dashboard");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [canSeeDashboard, isSmeUser, activeTab]);

//   // Continue / Cancel / Back-to-Dashboard buttons inside the wizard:
//   // Admins and SMEs go back to the BookForge Dashboard tab; everyone
//   // else (plain USER) is sent to the main ORION user dashboard, since
//   // they aren't authorized to see the BookForge management dashboard.
//   const goBackFromWizard = () => {
//     if (canSeeDashboard) {
//       setActiveTab("dashboard");
//     } else {
//       navigate("/");
//     }
//   };
//   const [projects, setProjects] = useState([]);
//   const [projectsLoading, setProjectsLoading] = useState(true);
//   const [projectsError, setProjectsError] = useState("");

//   const mapApiProject = (p) => ({
//     ...p,
//     title: p.book_title || "Untitled",
//     stage: p.book_status || "Unknown",
//     sme: p.publisher_name || "Unassigned",
//     deadline: p.submission_deadline || "Not set",
//     overdue: p.submission_deadline
//       ? new Date(p.submission_deadline) < new Date() &&
//         !(p.book_status || "").toLowerCase().includes("complete")
//       : false,
//     progress:
//       p.chapter_count && p.expected_pages
//         ? Math.min(100, Math.round((p.chapter_count / p.expected_pages) * 100))
//         : null,
//   });

//   const [refreshTick, setRefreshTick] = useState(0);
//   const refreshProjects = () => setRefreshTick((t) => t + 1);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       setProjectsLoading(true);
//       setProjectsError("");
//       try {
//         const res = await getBookForgeProjects(0, 100);
//         const rows = Array.isArray(res?.data) ? res.data : [];
//         if (!cancelled) setProjects(rows.filter((p) => !p.is_deleted).map(mapApiProject));
//       } catch (err) {
//         console.error("Failed to load Book Forge projects:", err);
//         if (!cancelled) {
//           setProjectsError("Failed to load projects from the server. Please try again.");
//           setProjects([]);
//         }
//       } finally {
//         if (!cancelled) setProjectsLoading(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [refreshTick]);

//   const [form, setForm] = useState(EMPTY_FORM);
//   const [formError, setFormError] = useState("");
//   const [creating, setCreating] = useState(false);
//   const [successBanner, setSuccessBanner] = useState("");

//   /* ── Brief Upload (screen after Create Project) ────────────── */
//   const [createdProject, setCreatedProject] = useState(null);
//   const [briefFiles, setBriefFiles] = useState([]);
//   const [isDraggingFile, setIsDraggingFile] = useState(false);
//   const fileInputRef = useRef(null);

//   /* ── Uploaded documents list (GET .../documents) ─────────────
//      Shown just below the drop-zone in Brief Upload, and behind a
//      per-row dropdown arrow on the Dashboard pipeline table. */
//   const [briefDocs, setBriefDocs] = useState([]);
//   const [briefDocsLoading, setBriefDocsLoading] = useState(false);
//   const [briefDocsError, setBriefDocsError] = useState("");

//   const fetchBriefDocs = async (projectId) => {
//     if (!projectId) { setBriefDocs([]); return; }
//     setBriefDocsLoading(true);
//     setBriefDocsError("");
//     try {
//       const res = await getBookForgeDocuments(projectId, 0, 100);
//       const rows = Array.isArray(res?.data) ? res.data : [];
//       setBriefDocs(rows.filter((d) => !d.is_deleted));
//     } catch (err) {
//       console.error("Failed to load documents:", err);
//       setBriefDocsError("Failed to load uploaded documents.");
//       setBriefDocs([]);
//     } finally {
//       setBriefDocsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (createdProject?.id) fetchBriefDocs(createdProject.id);
//     else setBriefDocs([]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [createdProject?.id]);

//   /* ── Dashboard: per-project documents dropdown ───────────────── */
//   /* ── Dashboard: "view documents" modal (per project) ─────────
//      Clicking the chevron on a pipeline row opens a modal listing
//      that project's documents, each with metadata / download /
//      delete actions wired to the book-forge documents API. */
//   const [docsModalProjectId, setDocsModalProjectId] = useState(null);
//   const [projectDocsById, setProjectDocsById] = useState({});
//   const [docActionError, setDocActionError] = useState("");
//   const [deletingDocId, setDeletingDocId] = useState(null);
//   const [downloadingDocId, setDownloadingDocId] = useState(null);
//   const [docsModalUploading, setDocsModalUploading] = useState(false);
//   const docsModalFileInputRef = useRef(null);

//   const loadProjectDocs = async (projectId) => {
//     setProjectDocsById((prev) => ({ ...prev, [projectId]: { loading: true, docs: [], error: "" } }));
//     try {
//       const res = await getBookForgeDocuments(projectId, 0, 100);
//       const rows = Array.isArray(res?.data) ? res.data : [];
//       setProjectDocsById((prev) => ({
//         ...prev,
//         [projectId]: { loading: false, docs: rows.filter((d) => !d.is_deleted), error: "" },
//       }));
//     } catch (err) {
//       console.error("Failed to load project documents:", err);
//       setProjectDocsById((prev) => ({
//         ...prev,
//         [projectId]: { loading: false, docs: [], error: "Failed to load documents." },
//       }));
//     }
//   };

//   const openDocsModal = (projectId) => {
//     setDocActionError("");
//     setDocsModalProjectId(projectId);
//     loadProjectDocs(projectId); // always fetch fresh so the modal reflects real backend state
//   };

//   const closeDocsModal = () => {
//     setDocsModalProjectId(null);
//     setDocActionError("");
//   };

//   /* ── Dashboard: upload document from the documents modal ─────
//      Uses the same POST /api/v1/book-forge/projects/{id}/documents
//      API as the Brief Upload screen (uploadBookForgeDocument). */
//   const handleDocsModalUpload = async (projectId, fileList) => {
//     const files = Array.from(fileList || []);
//     if (files.length === 0 || !projectId) return;

//     const createdBy = Number(sessionStorage.getItem("token")) || 0;
//     setDocActionError("");
//     setDocsModalUploading(true);

//     try {
//       for (const file of files) {
//         const res = await uploadBookForgeDocument(projectId, file, createdBy);
//         if (res?.errors && res.errors.length > 0) {
//           throw new Error(res.errors[0]?.message || "Upload failed.");
//         }
//       }
//       loadProjectDocs(projectId); // refresh the modal's document list
//       if (createdProject?.id === projectId) {
//         fetchBriefDocs(projectId); // keep Brief Upload panel in sync if same project
//       }
//     } catch (err) {
//       console.error("Failed to upload document:", err);
//       setDocActionError(err.message || "Failed to upload the document. Please try again.");
//     } finally {
//       setDocsModalUploading(false);
//     }
//   };

//   const handleDocsModalFileInputChange = (e) => {
//     handleDocsModalUpload(docsModalProjectId, e.target.files);
//     e.target.value = "";
//   };

//   /* ── Project metadata (nested modal) ─────────────────────────
//      One "ℹ️" icon in the documents modal header (per project, not
//      per document) fetches GET /api/v1/book-forge/projects/{id}
//      and shows the project's own details. */
//   const [projectMetadataModal, setProjectMetadataModal] = useState(null); // { loading, error, data } | null

//   const handleViewProjectMetadata = async (projectId) => {
//     setProjectMetadataModal({ loading: true, error: "", data: null });
//     try {
//       const res = await getBookForgeProjectById(projectId);
//       if (res?.errors && res.errors.length > 0) {
//         throw new Error(res.errors[0]?.message || "Failed to load project details.");
//       }
//       setProjectMetadataModal({ loading: false, error: "", data: res?.data || null });
//     } catch (err) {
//       console.error("Failed to load project details:", err);
//       setProjectMetadataModal({ loading: false, error: "Failed to load project details.", data: null });
//     }
//   };

//   const closeProjectMetadataModal = () => setProjectMetadataModal(null);

//   /* ── Document download ────────────────────────────────────── */
//   const handleDownloadDocument = async (doc) => {
//     setDocActionError("");
//     setDownloadingDocId(doc.id);
//     try {
//       const { blob, filename } = await downloadBookForgeDocument(doc.id);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = filename || doc.original_filename || "document";
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Failed to download document:", err);
//       setDocActionError("Failed to download the document. Please try again.");
//     } finally {
//       setDownloadingDocId(null);
//     }
//   };

//   /* ── Document delete ──────────────────────────────────────── */
//   const handleDeleteDocument = async (doc) => {
//     const confirmed = window.confirm(`Delete "${doc.original_filename}"? This cannot be undone.`);
//     if (!confirmed) return;

//     setDocActionError("");
//     setDeletingDocId(doc.id);
//     try {
//       const res = await deleteBookForgeDocument(doc.id);
//       if (res?.errors && res.errors.length > 0) {
//         throw new Error(res.errors[0]?.message || "Failed to delete document.");
//       }
//       setProjectDocsById((prev) => {
//         const state = prev[doc.project_id] || prev[docsModalProjectId];
//         if (!state) return prev;
//         return {
//           ...prev,
//           [doc.project_id ?? docsModalProjectId]: {
//             ...state,
//             docs: state.docs.filter((d) => d.id !== doc.id),
//           },
//         };
//       });
//       // keep the Brief Upload documents panel in sync if it's the same project
//       if (createdProject?.id === (doc.project_id ?? docsModalProjectId)) {
//         fetchBriefDocs(createdProject.id);
//       }
//     } catch (err) {
//       console.error("Failed to delete document:", err);
//       setDocActionError("Failed to delete the document. Please try again.");
//     } finally {
//       setDeletingDocId(null);
//     }
//   };

//   const updateField = (field, value) => {
//     setForm((f) => ({ ...f, [field]: value }));
//   };

//   const goToNewProject = () => {
//     setForm(EMPTY_FORM);
//     setFormError("");
//     setCreatedProject(null);
//     setBriefFiles([]);
//     setActiveTab("new-project");
//   };

//   const handleCreateProject = async () => {
//     if (!form.book_title.trim()) {
//       setFormError("Book title is required.");
//       return;
//     }

//     setCreating(true);
//     setFormError("");

//     const payload = {
//       book_title: form.book_title.trim(),
//       category: form.category,
//       book_subject: form.book_subject.trim(),
//       target_audience: form.target_audience.trim(),
//       language_code: form.language_code,
//       expected_pages: form.expected_pages ? Number(form.expected_pages) : 0,
//       chapter_count: form.chapter_count ? Number(form.chapter_count) : 0,
//       publisher_name: form.publisher_name.trim(),
//       edition: form.edition.trim(),
//       primary_output_format: form.primary_output_format,
//       book_description: form.book_description.trim(),
//       submission_deadline: form.submission_deadline || null,
//       book_status: form.book_status,
//       created_by: Number(sessionStorage.getItem("token")) || 0,
//     };

//     try {
//       const res = await createBookForgeProject(payload);
//       if (res?.errors && res.errors.length > 0) {
//         throw new Error(res.errors[0]?.message || "Failed to create project.");
//       }
//       setForm(EMPTY_FORM);
//       setSuccessBanner(`"${payload.book_title}" was created. Now upload the brief to continue.`);
//       setCreatedProject(res?.data || null);
//       setBriefFiles([]);
//       setActiveTab("upload-brief");
//       refreshProjects();
//       window.setTimeout(() => setSuccessBanner(""), 4500);
//     } catch (err) {
//       console.error("Failed to create project:", err);
//       setFormError(err.message || "Failed to create the project. Please try again.");
//     } finally {
//       setCreating(false);
//     }
//   };

//   /* ── Brief document upload — auto-uploads on drop/select ────── */
//   const processBriefFiles = (fileList) => {
//     const files = Array.from(fileList || []);
//     if (files.length === 0 || !createdProject?.id) return;

//     const createdBy = Number(sessionStorage.getItem("token")) || 0;

//     const entries = files.map((file) => ({
//       localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//       file,
//       name: file.name,
//       size: file.size,
//       status: "uploading",
//       message: "",
//     }));

//     setBriefFiles((prev) => [...prev, ...entries]);

//     entries.forEach(async (entry) => {
//       try {
//         const res = await uploadBookForgeDocument(createdProject.id, entry.file, createdBy);
//         if (res?.errors && res.errors.length > 0) {
//           throw new Error(res.errors[0]?.message || "Upload failed.");
//         }
//         const successMessage = res?.message || "Document uploaded successfully";
//         setBriefFiles((prev) =>
//           prev.map((f) =>
//             f.localId === entry.localId
//               ? { ...f, status: "uploaded", message: successMessage }
//               : f
//           )
//         );
//         setSuccessBanner(`${successMessage}: "${entry.name}"`);
//         window.setTimeout(() => setSuccessBanner(""), 4500);
//         fetchBriefDocs(createdProject.id);
//         setProjectDocsById((prev) => {
//           const next = { ...prev };
//           delete next[createdProject.id];
//           return next;
//         });
//       } catch (err) {
//         console.error("Failed to upload document:", err);
//         setBriefFiles((prev) =>
//           prev.map((f) =>
//             f.localId === entry.localId
//               ? { ...f, status: "failed", message: err.message || "Upload failed." }
//               : f
//           )
//         );
//       }
//     });
//   };

//   const handleBrowseClick = () => fileInputRef.current?.click();

//   const handleFileInputChange = (e) => {
//     processBriefFiles(e.target.files);
//     e.target.value = "";
//   };

//   const handleBriefDragOver = (e) => {
//     e.preventDefault();
//     setIsDraggingFile(true);
//   };

//   const handleBriefDragLeave = (e) => {
//     e.preventDefault();
//     setIsDraggingFile(false);
//   };

//   const handleBriefDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingFile(false);
//     processBriefFiles(e.dataTransfer.files);
//   };

//   const retryBriefUpload = (localId) => {
//     const entry = briefFiles.find((f) => f.localId === localId);
//     if (!entry) return;
//     setBriefFiles((prev) => prev.filter((f) => f.localId !== localId));
//     processBriefFiles([entry.file]);
//   };

//   const removeBriefFile = (localId) => {
//     setBriefFiles((prev) => prev.filter((f) => f.localId !== localId));
//   };

//   const hasUploadedBrief = briefFiles.some((f) => f.status === "uploaded");

//   const [editingProject, setEditingProject] = useState(null);
//   const [savingEdit, setSavingEdit] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);

//   const handleEditSave = async (payload) => {
//     if (!editingProject) return;
//     setSavingEdit(true);
//     try {
//       await updateBookForgeProject(editingProject.id, payload);
//       setEditingProject(null);
//       refreshProjects();
//     } catch (err) {
//       console.error("Failed to update project:", err);
//       setProjectsError("Failed to update the project. Please try again.");
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   const handleDeleteProject = async (project) => {
//     const confirmed = window.confirm(`Delete "${project.title}"? This cannot be undone.`);
//     if (!confirmed) return;
//     setDeletingId(project.id);
//     try {
//       await deleteBookForgeProject(project.id);
//       refreshProjects();
//     } catch (err) {
//       console.error("Failed to delete project:", err);
//       setProjectsError("Failed to delete the project. Please try again.");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const activeProjects = projects.length;
//   const pendingReviews = projects.filter((p) => p.stage.toLowerCase().includes("review")).length;
//   const chaptersTotal = projects.reduce((sum, p) => sum + (Number(p.chapter_count) || 0), 0);
//   const pagesTotal = projects.reduce((sum, p) => sum + (Number(p.expected_pages) || 0), 0);

//   return (
//     <div className="submit-page">
//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="submit-sidebar">
//         <div className="submit-logo">
//           <div className="submit-logo-mark">O</div>
//           <div className="submit-logo-text">
//             <span>ORION</span>
//             <small>BookForge</small>
//           </div>
//         </div>

//         <nav className="submit-nav">
//           <p className="submit-nav-label">BOOKFORGE</p>
//           {canSeeDashboard && (
//             <div
//               className={`submit-nav-item${activeTab === "dashboard" ? " active" : ""}`}
//               onClick={() => setActiveTab("dashboard")}
//             >
//               <span className="submit-nav-icon">📊</span>
//               <span>Dashboard</span>
//               {activeTab === "dashboard" && <span className="submit-nav-dot"></span>}
//             </div>
//           )}
//           {!isSmeUser && (
//             <div
//               className={`submit-nav-item${activeTab === "new-project" ? " active" : ""}`}
//               onClick={goToNewProject}
//             >
//               <span className="submit-nav-icon">➕</span>
//               <span>New Project</span>
//               {activeTab === "new-project" && <span className="submit-nav-dot"></span>}
//             </div>
//           )}
//           {!isSmeUser && (
//             <div
//               className={`submit-nav-item${activeTab === "upload-brief" ? " active" : ""}`}
//               onClick={() => setActiveTab("upload-brief")}
//             >
//               <span className="submit-nav-icon">📎</span>
//               <span>Brief Upload</span>
//               {activeTab === "upload-brief" && <span className="submit-nav-dot"></span>}
//             </div>
//           )}
//           {isSmeUser && (
//             <div
//               className={`submit-nav-item${activeTab === "sme" ? " active" : ""}`}
//               onClick={() => setActiveTab("sme")}
//             >
//               <span className="submit-nav-icon">🎤</span>
//               <span>SME Upload</span>
//               {activeTab === "sme" && <span className="submit-nav-dot"></span>}
//             </div>
//           )}
//         </nav>

//         <div className="submit-sidebar-footer">
//           <div className="submit-user-section">
//             <p className="submit-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="submit-back-btn"
//               onClick={() => navigate("/")}
//               title="Back to Home"
//             >
//               <span className="submit-back-icon">←</span>
//               <span className="submit-back-label">Back</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="submit-main">
//         <div className="submit-container bf-container">

//           <div className="bf-header">
//             <div>
//               <h1 className="bf-title">BookForge</h1>
//               <p className="bf-subtitle">Plan, brief, and track manuscripts through the publishing pipeline.</p>
//             </div>
//             {!isSmeUser && (
//               <button className="bf-btn bf-btn-primary" onClick={goToNewProject}>
//                 <span>+</span> New Project
//               </button>
//             )}
//           </div>

//           {successBanner && (
//             <div className="bf-success-banner">
//               <span>✓</span> {successBanner}
//             </div>
//           )}

//           {activeTab === "dashboard" && (
//             <div className="bf-dashboard">
//               <div className="bf-kpi-row">
//                 <div className="bf-kpi-card bf-kpi-blue">
//                   <div className="bf-kpi-label">Active Projects</div>
//                   <div className="bf-kpi-value">{activeProjects}</div>
//                   <div className="bf-kpi-sub">↑ Updated live</div>
//                 </div>
//                 <div className="bf-kpi-card bf-kpi-amber">
//                   <div className="bf-kpi-label">Pending Reviews</div>
//                   <div className="bf-kpi-value">{pendingReviews}</div>
//                   <div className="bf-kpi-sub">Needs attention</div>
//                 </div>
//                 <div className="bf-kpi-card bf-kpi-green">
//                   <div className="bf-kpi-label">Chapters (Total)</div>
//                   <div className="bf-kpi-value">{chaptersTotal}</div>
//                   <div className="bf-kpi-sub">Across all projects</div>
//                 </div>
//                 <div className="bf-kpi-card bf-kpi-navy">
//                   <div className="bf-kpi-label">Expected Pages (Total)</div>
//                   <div className="bf-kpi-value">{pagesTotal}</div>
//                   <div className="bf-kpi-sub">Across all projects</div>
//                 </div>
//               </div>

//               <div className="bf-card">
//                 <div className="bf-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <span>📋 Project Pipeline</span>
//                   <button
//                     type="button"
//                     onClick={refreshProjects}
//                     title="Refresh from server"
//                     style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.7 }}
//                   >
//                     🔄
//                   </button>
//                 </div>
//                 {projectsError && <div className="bf-error-banner">{projectsError}</div>}
//                 <div className="bf-table-wrap">
//                   {projectsLoading ? (
//                     <p style={{ padding: "16px", opacity: 0.7 }}>Loading projects…</p>
//                   ) : projects.length === 0 ? (
//                     <p style={{ padding: "16px", opacity: 0.7 }}>No projects found yet.</p>
//                   ) : (
//                     <table className="bf-table">
//                       <thead>
//                         <tr>
//                           <th className="bf-th-toggle"></th>
//                           <th>Book Title</th>
//                           <th>Status</th>
//                           <th>Publisher</th>
//                           <th>Deadline</th>
//                           <th>Progress</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {projects.map((p) => (
//                           <tr key={p.id}>
//                             <td className="bf-td-toggle">
//                               <button
//                                 type="button"
//                                 className="bf-doc-toggle"
//                                 title="View documents"
//                                 aria-label="View documents"
//                                 onClick={() => openDocsModal(p.id)}
//                               >
//                                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                   <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                                 </svg>
//                               </button>
//                             </td>
//                             <td>
//                               <button
//                                 type="button"
//                                 className="bf-project-title-btn"
//                                 title="View documents"
//                                 onClick={() => openDocsModal(p.id)}
//                               >
//                                 <strong>{p.title}</strong>
//                               </button>
//                             </td>
//                             <td><span className={`bf-chip ${bookStatusChipClass(p.stage)}`}>{p.stage}</span></td>
//                             <td>{p.sme}</td>
//                             <td className={p.overdue ? "bf-deadline-overdue" : ""}>{p.deadline}</td>
//                             <td>
//                               {p.progress === null ? (
//                                 <span style={{ opacity: 0.6 }}>—</span>
//                               ) : (
//                                 <>
//                                   <div className="bf-progress-wrap">
//                                     <div
//                                       className={`bf-progress-bar${p.progress === 100 ? " complete" : p.overdue ? " overdue" : ""}`}
//                                       style={{ width: `${p.progress}%` }}
//                                     ></div>
//                                   </div>
//                                   <div className={`bf-progress-label${p.overdue ? " overdue" : p.progress === 100 ? " complete" : ""}`}>{p.progress}%</div>
//                                 </>
//                               )}
//                             </td>
//                             <td>
//                               <div style={{ display: "flex", gap: "8px" }}>
//                                 <button
//                                   type="button"
//                                   className="bf-icon-btn"
//                                   title="Edit project"
//                                   aria-label="Edit project"
//                                   onClick={() => setEditingProject(p)}
//                                   style={{ background: "none", border: "1px solid var(--slate-200)", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer" }}
//                                 >
//                                   ✏️
//                                 </button>
//                                 <button
//                                   type="button"
//                                   className="bf-icon-btn"
//                                   title="Delete project"
//                                   aria-label="Delete project"
//                                   disabled={deletingId === p.id}
//                                   onClick={() => handleDeleteProject(p)}
//                                   style={{ background: "none", border: "1px solid var(--slate-200)", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer" }}
//                                 >
//                                   {deletingId === p.id ? "…" : "🗑️"}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "new-project" && (
//             <div className="bf-wizard">
//               <div className="bf-steps">
//                 {WIZARD_STEPS.map((label, i) => {
//                   const n = i + 1;
//                   return (
//                     <div className="bf-step" key={label}>
//                       <div className={`bf-step-circle${n === 1 ? " active" : ""}`}>{n}</div>
//                       <div className={`bf-step-label${n === 1 ? " active" : ""}`}>{label}</div>
//                       {n < WIZARD_STEPS.length && <div className="bf-step-connector"></div>}
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="bf-card bf-wizard-card bf-create-card">
//                 <div className="bf-card-title">Create Project</div>

//                 <div className="bf-form-sections">
//                   <div className="bf-form-section">
//                     <div className="bf-form-section-title">
//                       <span className="bf-form-section-icon">📘</span> Basic Information
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group bf-form-group-full">
//                         <label className="bf-form-label">Book Title *</label>
//                         <input className="bf-form-input" value={form.book_title} onChange={(e) => updateField("book_title", e.target.value)} placeholder="e.g. SSC CGL Mathematics Complete Guide" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Category</label>
//                         <select className="bf-form-input" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
//                           <option>Exam Preparation</option>
//                           <option>Academic / School</option>
//                           <option>Professional / Technical</option>
//                         </select>
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Book Subject</label>
//                         <input className="bf-form-input" value={form.book_subject} onChange={(e) => updateField("book_subject", e.target.value)} placeholder="e.g. Competitive Exam" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group bf-form-group-full">
//                         <label className="bf-form-label">Target Audience</label>
//                         <input className="bf-form-input" value={form.target_audience} onChange={(e) => updateField("target_audience", e.target.value)} placeholder="e.g. SSC CGL aspirants, graduates" />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bf-form-section">
//                     <div className="bf-form-section-title">
//                       <span className="bf-form-section-icon">🧩</span> Content &amp; Format
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Language</label>
//                         <select className="bf-form-input" value={form.language_code} onChange={(e) => updateField("language_code", e.target.value)}>
//                           <option value="en">English</option>
//                           <option value="hi">Hindi</option>
//                           <option value="en-hi">Bilingual (En + Hi)</option>
//                         </select>
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Primary Output Format</label>
//                         <select className="bf-form-input" value={form.primary_output_format} onChange={(e) => updateField("primary_output_format", e.target.value)}>
//                           <option>Word + PDF</option>
//                           <option>Structured Chapter Package</option>
//                           <option>EPUB Ready</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Expected Pages</label>
//                         <input type="number" min="0" className="bf-form-input" value={form.expected_pages} onChange={(e) => updateField("expected_pages", e.target.value)} placeholder="e.g. 480" />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Chapter Count</label>
//                         <input type="number" min="0" className="bf-form-input" value={form.chapter_count} onChange={(e) => updateField("chapter_count", e.target.value)} placeholder="e.g. 24" />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bf-form-section">
//                     <div className="bf-form-section-title">
//                       <span className="bf-form-section-icon">🏢</span> Publishing Details
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Publisher Name</label>
//                         <input className="bf-form-input" value={form.publisher_name} onChange={(e) => updateField("publisher_name", e.target.value)} placeholder="e.g. Orion Publications" />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Edition</label>
//                         <input className="bf-form-input" value={form.edition} onChange={(e) => updateField("edition", e.target.value)} placeholder="e.g. Limited, 1st" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Submission Deadline</label>
//                         <input type="date" className="bf-form-input" value={form.submission_deadline} onChange={(e) => updateField("submission_deadline", e.target.value)} />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Book Status</label>
//                         <select className="bf-form-input" value={form.book_status} onChange={(e) => updateField("book_status", e.target.value)}>
//                           <option>Draft</option>
//                           <option>Outline</option>
//                           <option>Drafting</option>
//                           <option>In Review</option>
//                           <option>Export Ready</option>
//                           <option>Complete</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bf-form-section">
//                     <div className="bf-form-section-title">
//                       <span className="bf-form-section-icon">📝</span> Description
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group bf-form-group-full">
//                         <label className="bf-form-label">Book Description</label>
//                         <textarea className="bf-form-input bf-textarea" rows={4} value={form.book_description} onChange={(e) => updateField("book_description", e.target.value)} placeholder="What is this book about?" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {formError && <p className="bf-step-error">{formError}</p>}

//                 <div className="bf-step-actions">
//                   <button className="bf-btn bf-btn-secondary" onClick={goBackFromWizard}>Cancel</button>
//                   <button className="bf-btn bf-btn-primary" onClick={handleCreateProject} disabled={creating}>
//                     {creating ? "Creating…" : "Create Project ✓"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "upload-brief" && (
//             <div className="bf-wizard">
//               <div className="bf-steps">
//                 {WIZARD_STEPS.map((label, i) => {
//                   const n = i + 1;
//                   return (
//                     <div className="bf-step" key={label}>
//                       <div className={`bf-step-circle${n === 1 ? " done" : ""}${n === 2 ? " active" : ""}`}>
//                         {n === 1 ? "✓" : n}
//                       </div>
//                       <div className={`bf-step-label${n <= 2 ? " active" : ""}`}>{label}</div>
//                       {n < WIZARD_STEPS.length && <div className={`bf-step-connector${n === 1 ? " done" : ""}`}></div>}
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="bf-card bf-wizard-card bf-upload-card">
//                 <div className="bf-card-title">Brief Upload</div>
//                 <p className="bf-upload-subtitle">
//                   Upload the syllabus, brief, or sample TOC for “{createdProject?.book_title || "your project"}”.
//                 </p>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group bf-form-group-full">
//                     <label className="bf-form-label">Project *</label>
//                     <select
//                       className="bf-form-input"
//                       value={createdProject?.id || ""}
//                       onChange={(e) => {
//                         const selected = projects.find((p) => String(p.id) === e.target.value);
//                         setCreatedProject(selected ? { id: selected.id, book_title: selected.title } : null);
//                         setBriefFiles([]);
//                       }}
//                     >
//                       <option value="">
//                         {projectsLoading ? "Loading projects…" : "Select a project…"}
//                       </option>
//                       {projects.map((p) => (
//                         <option key={p.id} value={p.id}>{p.title}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {!createdProject?.id && (
//                   <p className="bf-step-error" style={{ marginTop: "-6px" }}>
//                     Select a project above (or create a new one) before uploading a brief.
//                   </p>
//                 )}

//                 <div
//                   className={`bf-upload-zone${isDraggingFile ? " drag-active" : ""}${!createdProject?.id ? " disabled" : ""}`}
//                   onDragOver={createdProject?.id ? handleBriefDragOver : undefined}
//                   onDragLeave={createdProject?.id ? handleBriefDragLeave : undefined}
//                   onDrop={createdProject?.id ? handleBriefDrop : undefined}
//                 >
//                   <div className="bf-upload-icon">📎</div>
//                   <div className="bf-upload-title">Drag &amp; drop files here</div>
//                   <div className="bf-upload-hint">Word, PDF, TXT or paste raw text</div>
//                   <button
//                     type="button"
//                     className="bf-btn bf-btn-secondary"
//                     onClick={handleBrowseClick}
//                     disabled={!createdProject?.id}
//                   >
//                     Browse Files
//                   </button>
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept={UPLOAD_ACCEPT}
//                     multiple
//                     hidden
//                     onChange={handleFileInputChange}
//                   />
//                 </div>

//                 {briefFiles.length > 0 && (
//                   <div className="bf-uploaded-list">
//                     {briefFiles.map((f) => (
//                       <div className="bf-uploaded-item" key={f.localId}>
//                         <span className="bf-uploaded-item-icon">📄</span>
//                         <div className="bf-uploaded-item-main">
//                           <div className="bf-uploaded-item-name">{f.name}</div>
//                           {f.status === "uploaded" && <div className="bf-uploaded-item-msg success">{f.message}</div>}
//                           {f.status === "failed" && <div className="bf-uploaded-item-msg failed">{f.message}</div>}
//                         </div>
//                         {f.status === "uploading" && <span className="bf-upload-status uploading">Uploading…</span>}
//                         {f.status === "uploaded" && <span className="bf-upload-status uploaded">✓ Uploaded</span>}
//                         {f.status === "failed" && (
//                           <div className="bf-uploaded-item-actions">
//                             <span className="bf-upload-status failed">Failed</span>
//                             <button type="button" className="bf-uploaded-retry" onClick={() => retryBriefUpload(f.localId)}>
//                               Retry
//                             </button>
//                           </div>
//                         )}
//                         {f.status !== "uploading" && (
//                           <button
//                             type="button"
//                             className="bf-uploaded-remove"
//                             title="Remove"
//                             aria-label="Remove"
//                             onClick={() => removeBriefFile(f.localId)}
//                           >
//                             ✕
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <div className="bf-docs-panel">
//                   <div className="bf-docs-panel-title">
//                     <span>📚 Documents in this Project</span>
//                     <button
//                       type="button"
//                       onClick={() => createdProject?.id && fetchBriefDocs(createdProject.id)}
//                       title="Refresh"
//                       className="bf-docs-refresh"
//                       disabled={!createdProject?.id}
//                     >
//                       🔄
//                     </button>
//                   </div>

//                   {briefDocsError && <div className="bf-error-banner">{briefDocsError}</div>}

//                   {briefDocsLoading ? (
//                     <p className="bf-doc-empty">Loading documents…</p>
//                   ) : briefDocs.length === 0 ? (
//                     <p className="bf-doc-empty">No documents uploaded for this project yet.</p>
//                   ) : (
//                     <div className="bf-doc-list">
//                       {briefDocs.map((doc) => (
//                         <div className="bf-doc-item" key={doc.id}>
//                           <span className="bf-doc-icon">{docIconFor(doc.file_extension)}</span>
//                           <div className="bf-doc-main">
//                             <div className="bf-doc-name">{doc.original_filename}</div>
//                             <div className="bf-doc-meta">
//                               {formatFileSize(doc.file_size)} · {formatDocDate(doc.created_at)}
//                               {doc.document_type ? ` · ${doc.document_type}` : ""}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div className="bf-step-actions">
//                   <button className="bf-btn bf-btn-secondary" onClick={goBackFromWizard}>
//                     {canSeeDashboard ? "Back to Dashboard" : "Back to Home"}
//                   </button>
//                   <button
//                     className="bf-btn bf-btn-primary"
//                     disabled={!hasUploadedBrief}
//                     onClick={() => navigate("/")}
//                   >
//                     Continue →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "sme" && isSmeUser && <SmeCapture />}
//         </div>
//       </main>

//       {editingProject && (
//         <EditProjectModal
//           project={editingProject}
//           onClose={() => setEditingProject(null)}
//           onSave={handleEditSave}
//           saving={savingEdit}
//         />
//       )}

//       {docsModalProjectId && (
//         <>
//           <input
//             ref={docsModalFileInputRef}
//             type="file"
//             accept={UPLOAD_ACCEPT}
//             multiple
//             hidden
//             onChange={handleDocsModalFileInputChange}
//           />
//           <DocumentsModal
//             project={projects.find((p) => p.id === docsModalProjectId) || null}
//             docsState={projectDocsById[docsModalProjectId]}
//             actionError={docActionError}
//             deletingDocId={deletingDocId}
//             downloadingDocId={downloadingDocId}
//             uploading={docsModalUploading}
//             onClose={closeDocsModal}
//             onRefresh={() => loadProjectDocs(docsModalProjectId)}
//             onViewProjectInfo={() => handleViewProjectMetadata(docsModalProjectId)}
//             onUploadClick={() => docsModalFileInputRef.current?.click()}
//             onDownload={handleDownloadDocument}
//             onDelete={handleDeleteDocument}
//           />
//         </>
//       )}

//       {projectMetadataModal && (
//         <ProjectMetadataModal state={projectMetadataModal} onClose={closeProjectMetadataModal} />
//       )}
//     </div>
//   );
// }

// function DocumentsModal({
//   project,
//   docsState,
//   actionError,
//   deletingDocId,
//   downloadingDocId,
//   uploading,
//   onClose,
//   onRefresh,
//   onViewProjectInfo,
//   onUploadClick,
//   onDownload,
//   onDelete,
// }) {
//   return (
//     <div className="bf-modal-overlay" onClick={onClose}>
//       <div className="bf-modal bf-modal-docs" onClick={(e) => e.stopPropagation()}>
//         <div className="bf-modal-header">
//           <h3>📚 {project?.title || "Documents"}</h3>
//           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//             <button
//               type="button"
//               onClick={onUploadClick}
//               title="Upload document"
//               aria-label="Upload document"
//               className="bf-docs-refresh bf-docs-upload"
//               disabled={uploading}
//             >
//               {uploading ? "…" : "⬆️"}
//             </button>
//             <button
//               type="button"
//               onClick={onViewProjectInfo}
//               title="Project details"
//               aria-label="Project details"
//               className="bf-docs-refresh bf-docs-info"
//             >
//               ℹ️
//             </button>
//             <button
//               type="button"
//               onClick={onRefresh}
//               title="Refresh"
//               className="bf-docs-refresh"
//               disabled={docsState?.loading}
//             >
//               🔄
//             </button>
//             <button className="bf-modal-close" onClick={onClose} title="Close" aria-label="Close">✕</button>
//           </div>
//         </div>

//         {actionError && <div className="bf-error-banner">{actionError}</div>}

//         <div className="bf-modal-body" style={{ marginBottom: "8px" }}>
//           {docsState?.loading ? (
//             <p className="bf-doc-empty">Loading documents…</p>
//           ) : docsState?.error ? (
//             <p className="bf-doc-empty bf-doc-empty-error">{docsState.error}</p>
//           ) : !docsState?.docs?.length ? (
//             <p className="bf-doc-empty">No documents uploaded for this project yet.</p>
//           ) : (
//             <div className="bf-doc-list">
//               {docsState.docs.map((doc) => (
//                 <div className="bf-doc-item bf-doc-item-modal" key={doc.id}>
//                   <span className="bf-doc-icon">{docIconFor(doc.file_extension)}</span>
//                   <div className="bf-doc-main">
//                     <div className="bf-doc-name">{doc.original_filename}</div>
//                     <div className="bf-doc-meta">
//                       {formatFileSize(doc.file_size)} · {formatDocDate(doc.created_at)}
//                       {doc.document_type ? ` · ${doc.document_type}` : ""}
//                     </div>
//                   </div>
//                   <div className="bf-doc-actions">
//                     <button
//                       type="button"
//                       className="bf-doc-action-btn"
//                       title="Download document"
//                       aria-label="Download document"
//                       disabled={downloadingDocId === doc.id}
//                       onClick={() => onDownload(doc)}
//                     >
//                       {downloadingDocId === doc.id ? "…" : "⬇️"}
//                     </button>
//                     <button
//                       type="button"
//                       className="bf-doc-action-btn bf-doc-action-danger"
//                       title="Delete document"
//                       aria-label="Delete document"
//                       disabled={deletingDocId === doc.id}
//                       onClick={() => onDelete(doc)}
//                     >
//                       {deletingDocId === doc.id ? "…" : "🗑️"}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="bf-modal-actions">
//           <button type="button" className="bf-btn bf-btn-secondary" onClick={onClose}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ProjectMetadataModal({ state, onClose }) {
//   const { loading, error, data } = state;
//   const rows = data
//     ? [
//         ["ID", data.id],
//         ["Book Title", data.book_title],
//         ["Category", data.category],
//         ["Book Subject", data.book_subject],
//         ["Target Audience", data.target_audience],
//         ["Language", data.language_code],
//         ["Expected Pages", data.expected_pages],
//         ["Chapter Count", data.chapter_count],
//         ["Publisher Name", data.publisher_name],
//         ["Edition", data.edition],
//         ["Primary Output Format", data.primary_output_format],
//         ["Book Description", data.book_description],
//         ["Submission Deadline", data.submission_deadline],
//         ["Book Status", data.book_status],
//         ["Created By", data.created_by],
//         ["Created At", formatDocDate(data.created_at)],
//         ["Updated At", formatDocDate(data.updated_at)],
//         ["Deleted", data.is_deleted ? "Yes" : "No"],
//       ]
//     : [];

//   return (
//     <div className="bf-modal-overlay" onClick={onClose}>
//       <div className="bf-modal bf-modal-metadata" onClick={(e) => e.stopPropagation()}>
//         <div className="bf-modal-header">
//           <h3>Project Details</h3>
//           <button className="bf-modal-close" onClick={onClose} title="Close" aria-label="Close">✕</button>
//         </div>

//         {loading ? (
//           <p className="bf-doc-empty">Loading project details…</p>
//         ) : error ? (
//           <p className="bf-doc-empty bf-doc-empty-error">{error}</p>
//         ) : (
//           <div className="bf-metadata-table">
//             {rows.map(([label, value]) => (
//               <div className="bf-metadata-row" key={label}>
//                 <span className="bf-metadata-label">{label}</span>
//                 <span className="bf-metadata-value">{value ?? "—"}</span>
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="bf-modal-actions">
//           <button type="button" className="bf-btn bf-btn-secondary" onClick={onClose}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EditProjectModal({ project, onClose, onSave, saving }) {
//   const [bookTitle, setBookTitle] = useState(project.book_title || "");
//   const [bookStatus, setBookStatus] = useState(project.book_status || "");
//   const [publisherName, setPublisherName] = useState(project.publisher_name || "");
//   const [submissionDeadline, setSubmissionDeadline] = useState(project.submission_deadline || "");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave({
//       book_title: bookTitle,
//       book_status: bookStatus,
//       publisher_name: publisherName,
//       submission_deadline: submissionDeadline || null,
//     });
//   };

//   return (
//     <div className="bf-modal-overlay" onClick={onClose}>
//       <div className="bf-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="bf-modal-header">
//           <h3>Edit Project</h3>
//           <button className="bf-modal-close" onClick={onClose}>✕</button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
//             <label style={{ fontSize: "13px", fontWeight: 600 }}>
//               Book Title
//               <input
//                 type="text"
//                 value={bookTitle}
//                 onChange={(e) => setBookTitle(e.target.value)}
//                 required
//                 style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
//               />
//             </label>
//             <label style={{ fontSize: "13px", fontWeight: 600 }}>
//               Status
//               <input
//                 type="text"
//                 value={bookStatus}
//                 onChange={(e) => setBookStatus(e.target.value)}
//                 placeholder="e.g. Drafting, In Review, Complete"
//                 style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
//               />
//             </label>
//             <label style={{ fontSize: "13px", fontWeight: 600 }}>
//               Publisher
//               <input
//                 type="text"
//                 value={publisherName}
//                 onChange={(e) => setPublisherName(e.target.value)}
//                 style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
//               />
//             </label>
//             <label style={{ fontSize: "13px", fontWeight: 600 }}>
//               Submission Deadline
//               <input
//                 type="date"
//                 value={submissionDeadline}
//                 onChange={(e) => setSubmissionDeadline(e.target.value)}
//                 style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
//               />
//             </label>
//           </div>
//           <div className="bf-modal-actions">
//             <button type="button" className="bf-btn bf-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
//             <button type="submit" className="bf-btn bf-btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookForgeProjects,
  getBookForgeProjectById,
  createBookForgeProject,
  updateBookForgeProject,
  deleteBookForgeProject,
  uploadBookForgeDocument,
  getBookForgeDocuments,
  deleteBookForgeDocument,
  downloadBookForgeDocument,
  getUsers,
  getRoles,
  createRole,
} from "../../services/apiServices";
import { canAccessBookForgeDashboard, isSme, isAdmin } from "../../utils/auth";
import SmeCapture from "./SmeCapture/SmeCapture";
import "./Submit.css";

/* ── Form matches POST /api/v1/book-forge/projects exactly ─────── */
const EMPTY_FORM = {
  book_title: "",
  category: "Exam Preparation",
  book_subject: "",
  target_audience: "",
  language_code: "en",
  expected_pages: "",
  chapter_count: "",
  publisher_name: "",
  edition: "",
  primary_output_format: "Word + PDF",
  book_description: "",
  submission_deadline: "",
  book_status: "Draft",
};

const bookStatusChipClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("complete") || s.includes("done") || s.includes("export")) return "bf-chip-complete";
  if (s.includes("review")) return "bf-chip-review";
  if (s.includes("overdue")) return "bf-chip-overdue";
  if (s.includes("progress") || s.includes("draft")) return "bf-chip-progress";
  return "bf-chip-draft";
};

// Colour-codes role chips on the Manage Users & Roles screen —
// Admin stands out (overdue/red-amber), SME distinct from plain USER.
const roleChipClass = (roleName) => {
  const r = (roleName || "").toUpperCase().replace(/^BOOKFORGE_/, "");
  if (r === "ADMIN") return "bf-chip-overdue";
  if (r === "SME") return "bf-chip-review";
  if (r === "EDITOR") return "bf-chip-progress";
  return "bf-chip-complete";
};

/* ── Document helpers (used by Brief Upload list + Dashboard) ──── */
const docIconFor = (ext) => {
  const e = (ext || "").toLowerCase();
  if (e === "pdf") return "📕";
  if (e === "doc" || e === "docx") return "📘";
  if (e === "txt") return "📃";
  return "📄";
};

const formatFileSize = (bytes) => {
  const n = Number(bytes);
  if (!n || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDocDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

/* ── BookForge wizard sequence (screen order) ───────────────────
   Create Project → Upload Brief → SME Capture → Outline → Draft →
   Review → Export. Only the first two are implemented today; the
   rest render as upcoming, non-clickable steps in the stepper. */
const WIZARD_STEPS = [
  "Create Project",
  "Upload Brief",
  "SME Capture",
  "Outline",
  "Draft",
  "Review",
  "Export",
];

const UPLOAD_ACCEPT = ".doc,.docx,.pdf,.txt";

export default function Submit() {
  const navigate = useNavigate();

  // The BookForge "Dashboard" pipeline view is Admin + SME only —
  // plain USER accounts create projects and upload briefs, but
  // aren't authorized to see the management dashboard, so they
  // never land there and never see it in the nav.
  const canSeeDashboard = canAccessBookForgeDashboard();

  // SME accounts only work the Dashboard + SME Upload screens — New
  // Project / Brief Upload stay Admin + USER only. Admins keep the
  // full original nav (Dashboard, New Project, Brief Upload) and do
  // not get the SME Upload item.
  const isSmeUser = isSme();

  // Manage Users & Roles is Admin-only — SMEs and plain USER accounts
  // never see this nav item or the screen behind it.
  const isAdminUser = isAdmin();

  const [activeTab, setActiveTab] = useState(canSeeDashboard ? "dashboard" : "new-project");

  // Defensive guard: if activeTab is ever on a screen a role isn't
  // authorized for (e.g. role changes mid-session), bounce them back
  // to a screen they're allowed to see instead of rendering a
  // blank/forbidden tab.
  useEffect(() => {
    if (!canSeeDashboard && (activeTab === "dashboard" || activeTab === "sme")) {
      setActiveTab("new-project");
    }
    if (isSmeUser && (activeTab === "new-project" || activeTab === "upload-brief")) {
      setActiveTab("dashboard");
    }
    if (!isAdminUser && activeTab === "manage-users") {
      setActiveTab(canSeeDashboard ? "dashboard" : "new-project");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSeeDashboard, isSmeUser, isAdminUser, activeTab]);

  // Continue / Cancel / Back-to-Dashboard buttons inside the wizard:
  // Admins and SMEs go back to the BookForge Dashboard tab; everyone
  // else (plain USER) is sent to the main ORION user dashboard, since
  // they aren't authorized to see the BookForge management dashboard.
  const goBackFromWizard = () => {
    if (canSeeDashboard) {
      setActiveTab("dashboard");
    } else {
      navigate("/");
    }
  };
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const mapApiProject = (p) => ({
    ...p,
    title: p.book_title || "Untitled",
    stage: p.book_status || "Unknown",
    sme: p.publisher_name || "Unassigned",
    deadline: p.submission_deadline || "Not set",
    overdue: p.submission_deadline
      ? new Date(p.submission_deadline) < new Date() &&
        !(p.book_status || "").toLowerCase().includes("complete")
      : false,
    progress:
      p.chapter_count && p.expected_pages
        ? Math.min(100, Math.round((p.chapter_count / p.expected_pages) * 100))
        : null,
  });

  const [refreshTick, setRefreshTick] = useState(0);
  const refreshProjects = () => setRefreshTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProjectsLoading(true);
      setProjectsError("");
      try {
        const res = await getBookForgeProjects(0, 100);
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) setProjects(rows.filter((p) => !p.is_deleted).map(mapApiProject));
      } catch (err) {
        console.error("Failed to load Book Forge projects:", err);
        if (!cancelled) {
          setProjectsError("Failed to load projects from the server. Please try again.");
          setProjects([]);
        }
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  /* ── Brief Upload (screen after Create Project) ────────────── */
  const [createdProject, setCreatedProject] = useState(null);
  const [briefFiles, setBriefFiles] = useState([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Uploaded documents list (GET .../documents) ─────────────
     Shown just below the drop-zone in Brief Upload, and behind a
     per-row dropdown arrow on the Dashboard pipeline table. */
  const [briefDocs, setBriefDocs] = useState([]);
  const [briefDocsLoading, setBriefDocsLoading] = useState(false);
  const [briefDocsError, setBriefDocsError] = useState("");

  const fetchBriefDocs = async (projectId) => {
    if (!projectId) { setBriefDocs([]); return; }
    setBriefDocsLoading(true);
    setBriefDocsError("");
    try {
      const res = await getBookForgeDocuments(projectId, 0, 100);
      const rows = Array.isArray(res?.data) ? res.data : [];
      setBriefDocs(rows.filter((d) => !d.is_deleted));
    } catch (err) {
      console.error("Failed to load documents:", err);
      setBriefDocsError("Failed to load uploaded documents.");
      setBriefDocs([]);
    } finally {
      setBriefDocsLoading(false);
    }
  };

  useEffect(() => {
    if (createdProject?.id) fetchBriefDocs(createdProject.id);
    else setBriefDocs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdProject?.id]);

  /* ── Dashboard: per-project documents dropdown ───────────────── */
  /* ── Dashboard: "view documents" modal (per project) ─────────
     Clicking the chevron on a pipeline row opens a modal listing
     that project's documents, each with metadata / download /
     delete actions wired to the book-forge documents API. */
  const [docsModalProjectId, setDocsModalProjectId] = useState(null);
  const [projectDocsById, setProjectDocsById] = useState({});
  const [docActionError, setDocActionError] = useState("");
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [docsModalUploading, setDocsModalUploading] = useState(false);
  const docsModalFileInputRef = useRef(null);

  const loadProjectDocs = async (projectId) => {
    setProjectDocsById((prev) => ({ ...prev, [projectId]: { loading: true, docs: [], error: "" } }));
    try {
      const res = await getBookForgeDocuments(projectId, 0, 100);
      const rows = Array.isArray(res?.data) ? res.data : [];
      setProjectDocsById((prev) => ({
        ...prev,
        [projectId]: { loading: false, docs: rows.filter((d) => !d.is_deleted), error: "" },
      }));
    } catch (err) {
      console.error("Failed to load project documents:", err);
      setProjectDocsById((prev) => ({
        ...prev,
        [projectId]: { loading: false, docs: [], error: "Failed to load documents." },
      }));
    }
  };

  const openDocsModal = (projectId) => {
    setDocActionError("");
    setDocsModalProjectId(projectId);
    loadProjectDocs(projectId); // always fetch fresh so the modal reflects real backend state
  };

  const closeDocsModal = () => {
    setDocsModalProjectId(null);
    setDocActionError("");
  };

  /* ── Dashboard: upload document from the documents modal ─────
     Uses the same POST /api/v1/book-forge/projects/{id}/documents
     API as the Brief Upload screen (uploadBookForgeDocument). */
  const handleDocsModalUpload = async (projectId, fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0 || !projectId) return;

    const createdBy = Number(sessionStorage.getItem("token")) || 0;
    setDocActionError("");
    setDocsModalUploading(true);

    try {
      for (const file of files) {
        const res = await uploadBookForgeDocument(projectId, file, createdBy);
        if (res?.errors && res.errors.length > 0) {
          throw new Error(res.errors[0]?.message || "Upload failed.");
        }
      }
      loadProjectDocs(projectId); // refresh the modal's document list
      if (createdProject?.id === projectId) {
        fetchBriefDocs(projectId); // keep Brief Upload panel in sync if same project
      }
    } catch (err) {
      console.error("Failed to upload document:", err);
      setDocActionError(err.message || "Failed to upload the document. Please try again.");
    } finally {
      setDocsModalUploading(false);
    }
  };

  const handleDocsModalFileInputChange = (e) => {
    handleDocsModalUpload(docsModalProjectId, e.target.files);
    e.target.value = "";
  };

  /* ── Project metadata (nested modal) ─────────────────────────
     One "ℹ️" icon in the documents modal header (per project, not
     per document) fetches GET /api/v1/book-forge/projects/{id}
     and shows the project's own details. */
  const [projectMetadataModal, setProjectMetadataModal] = useState(null); // { loading, error, data } | null

  const handleViewProjectMetadata = async (projectId) => {
    setProjectMetadataModal({ loading: true, error: "", data: null });
    try {
      const res = await getBookForgeProjectById(projectId);
      if (res?.errors && res.errors.length > 0) {
        throw new Error(res.errors[0]?.message || "Failed to load project details.");
      }
      setProjectMetadataModal({ loading: false, error: "", data: res?.data || null });
    } catch (err) {
      console.error("Failed to load project details:", err);
      setProjectMetadataModal({ loading: false, error: "Failed to load project details.", data: null });
    }
  };

  const closeProjectMetadataModal = () => setProjectMetadataModal(null);

  /* ── Document download ────────────────────────────────────── */
  const handleDownloadDocument = async (doc) => {
    setDocActionError("");
    setDownloadingDocId(doc.id);
    try {
      const { blob, filename } = await downloadBookForgeDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || doc.original_filename || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download document:", err);
      setDocActionError("Failed to download the document. Please try again.");
    } finally {
      setDownloadingDocId(null);
    }
  };

  /* ── Document delete ──────────────────────────────────────── */
  const handleDeleteDocument = async (doc) => {
    const confirmed = window.confirm(`Delete "${doc.original_filename}"? This cannot be undone.`);
    if (!confirmed) return;

    setDocActionError("");
    setDeletingDocId(doc.id);
    try {
      const res = await deleteBookForgeDocument(doc.id);
      if (res?.errors && res.errors.length > 0) {
        throw new Error(res.errors[0]?.message || "Failed to delete document.");
      }
      setProjectDocsById((prev) => {
        const state = prev[doc.project_id] || prev[docsModalProjectId];
        if (!state) return prev;
        return {
          ...prev,
          [doc.project_id ?? docsModalProjectId]: {
            ...state,
            docs: state.docs.filter((d) => d.id !== doc.id),
          },
        };
      });
      // keep the Brief Upload documents panel in sync if it's the same project
      if (createdProject?.id === (doc.project_id ?? docsModalProjectId)) {
        fetchBriefDocs(createdProject.id);
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
      setDocActionError("Failed to delete the document. Please try again.");
    } finally {
      setDeletingDocId(null);
    }
  };

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const goToNewProject = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setCreatedProject(null);
    setBriefFiles([]);
    setActiveTab("new-project");
  };

  const handleCreateProject = async () => {
    if (!form.book_title.trim()) {
      setFormError("Book title is required.");
      return;
    }

    setCreating(true);
    setFormError("");

    const payload = {
      book_title: form.book_title.trim(),
      category: form.category,
      book_subject: form.book_subject.trim(),
      target_audience: form.target_audience.trim(),
      language_code: form.language_code,
      expected_pages: form.expected_pages ? Number(form.expected_pages) : 0,
      chapter_count: form.chapter_count ? Number(form.chapter_count) : 0,
      publisher_name: form.publisher_name.trim(),
      edition: form.edition.trim(),
      primary_output_format: form.primary_output_format,
      book_description: form.book_description.trim(),
      submission_deadline: form.submission_deadline || null,
      book_status: form.book_status,
      created_by: Number(sessionStorage.getItem("token")) || 0,
    };

    try {
      const res = await createBookForgeProject(payload);
      if (res?.errors && res.errors.length > 0) {
        throw new Error(res.errors[0]?.message || "Failed to create project.");
      }
      setForm(EMPTY_FORM);
      setSuccessBanner(`"${payload.book_title}" was created. Now upload the brief to continue.`);
      setCreatedProject(res?.data || null);
      setBriefFiles([]);
      setActiveTab("upload-brief");
      refreshProjects();
      window.setTimeout(() => setSuccessBanner(""), 4500);
    } catch (err) {
      console.error("Failed to create project:", err);
      setFormError(err.message || "Failed to create the project. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  /* ── Brief document upload — auto-uploads on drop/select ────── */
  const processBriefFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0 || !createdProject?.id) return;

    const createdBy = Number(sessionStorage.getItem("token")) || 0;

    const entries = files.map((file) => ({
      localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      name: file.name,
      size: file.size,
      status: "uploading",
      message: "",
    }));

    setBriefFiles((prev) => [...prev, ...entries]);

    entries.forEach(async (entry) => {
      try {
        const res = await uploadBookForgeDocument(createdProject.id, entry.file, createdBy);
        if (res?.errors && res.errors.length > 0) {
          throw new Error(res.errors[0]?.message || "Upload failed.");
        }
        const successMessage = res?.message || "Document uploaded successfully";
        setBriefFiles((prev) =>
          prev.map((f) =>
            f.localId === entry.localId
              ? { ...f, status: "uploaded", message: successMessage }
              : f
          )
        );
        setSuccessBanner(`${successMessage}: "${entry.name}"`);
        window.setTimeout(() => setSuccessBanner(""), 4500);
        fetchBriefDocs(createdProject.id);
        setProjectDocsById((prev) => {
          const next = { ...prev };
          delete next[createdProject.id];
          return next;
        });
      } catch (err) {
        console.error("Failed to upload document:", err);
        setBriefFiles((prev) =>
          prev.map((f) =>
            f.localId === entry.localId
              ? { ...f, status: "failed", message: err.message || "Upload failed." }
              : f
          )
        );
      }
    });
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileInputChange = (e) => {
    processBriefFiles(e.target.files);
    e.target.value = "";
  };

  const handleBriefDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleBriefDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleBriefDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    processBriefFiles(e.dataTransfer.files);
  };

  const retryBriefUpload = (localId) => {
    const entry = briefFiles.find((f) => f.localId === localId);
    if (!entry) return;
    setBriefFiles((prev) => prev.filter((f) => f.localId !== localId));
    processBriefFiles([entry.file]);
  };

  const removeBriefFile = (localId) => {
    setBriefFiles((prev) => prev.filter((f) => f.localId !== localId));
  };

  const hasUploadedBrief = briefFiles.some((f) => f.status === "uploaded");

  const [editingProject, setEditingProject] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleEditSave = async (payload) => {
    if (!editingProject) return;
    setSavingEdit(true);
    try {
      await updateBookForgeProject(editingProject.id, payload);
      setEditingProject(null);
      refreshProjects();
    } catch (err) {
      console.error("Failed to update project:", err);
      setProjectsError("Failed to update the project. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProject = async (project) => {
    const confirmed = window.confirm(`Delete "${project.title}"? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(project.id);
    try {
      await deleteBookForgeProject(project.id);
      refreshProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setProjectsError("Failed to delete the project. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const activeProjects = projects.length;
  const pendingReviews = projects.filter((p) => p.stage.toLowerCase().includes("review")).length;
  const chaptersTotal = projects.reduce((sum, p) => sum + (Number(p.chapter_count) || 0), 0);
  const pagesTotal = projects.reduce((sum, p) => sum + (Number(p.expected_pages) || 0), 0);

  /* ── Manage Users & Roles (Admin-only screen) ────────────────
     Lives just below "Brief Upload" in the BookForge nav. Lists
     users (GET /auth/users), lists roles (GET /auth/roles), and
     lets an Admin create a new role (POST /auth/roles). */
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [createRoleError, setCreateRoleError] = useState("");

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsersError("Failed to load users from the server. Please try again.");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError("");
    try {
      const res = await getRoles();
      setRoles(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load roles:", err);
      setRolesError("Failed to load roles from the server. Please try again.");
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  // Load users + roles the first time an Admin opens the tab.
  useEffect(() => {
    if (activeTab === "manage-users" && isAdminUser) {
      fetchUsers();
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdminUser]);

  const handleCreateRole = async ({ role_name, role_description, is_active }) => {
    setCreatingRole(true);
    setCreateRoleError("");
    try {
      const res = await createRole(role_name, role_description, is_active);
      if (res?.response_code && res.response_code >= 400) {
        setCreateRoleError(res?.message || "Failed to create role. Please try again.");
        return;
      }
      if (Array.isArray(res?.detail)) {
        const messages = res.detail.map((d) => d.msg).filter(Boolean);
        setCreateRoleError(messages.join(" ") || "Please check the role details and try again.");
        return;
      }
      setShowCreateRoleModal(false);
      fetchRoles();
      setSuccessBanner(`Role "${role_name}" created successfully.`);
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (err) {
      console.error("Failed to create role:", err);
      setCreateRoleError("Failed to create role. Please try again.");
    } finally {
      setCreatingRole(false);
    }
  };

  return (
    <div className="submit-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="submit-sidebar">
        <div className="submit-logo">
          <div className="submit-logo-mark">O</div>
          <div className="submit-logo-text">
            <span>ORION</span>
            <small>BookForge</small>
          </div>
        </div>

        <nav className="submit-nav">
          <p className="submit-nav-label">BOOKFORGE</p>
          {canSeeDashboard && (
            <div
              className={`submit-nav-item${activeTab === "dashboard" ? " active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="submit-nav-icon">📊</span>
              <span>Dashboard</span>
              {activeTab === "dashboard" && <span className="submit-nav-dot"></span>}
            </div>
          )}
          {!isSmeUser && (
            <div
              className={`submit-nav-item${activeTab === "new-project" ? " active" : ""}`}
              onClick={goToNewProject}
            >
              <span className="submit-nav-icon">➕</span>
              <span>New Project</span>
              {activeTab === "new-project" && <span className="submit-nav-dot"></span>}
            </div>
          )}
          {!isSmeUser && (
            <div
              className={`submit-nav-item${activeTab === "upload-brief" ? " active" : ""}`}
              onClick={() => setActiveTab("upload-brief")}
            >
              <span className="submit-nav-icon">📎</span>
              <span>Brief Upload</span>
              {activeTab === "upload-brief" && <span className="submit-nav-dot"></span>}
            </div>
          )}
          {isAdminUser && (
            <div
              className={`submit-nav-item${activeTab === "manage-users" ? " active" : ""}`}
              onClick={() => setActiveTab("manage-users")}
            >
              <span className="submit-nav-icon">👥</span>
              <span>Manage Users</span>
              {activeTab === "manage-users" && <span className="submit-nav-dot"></span>}
            </div>
          )}
          {isSmeUser && (
            <div
              className={`submit-nav-item${activeTab === "sme" ? " active" : ""}`}
              onClick={() => setActiveTab("sme")}
            >
              <span className="submit-nav-icon">🎤</span>
              <span>SME Upload</span>
              {activeTab === "sme" && <span className="submit-nav-dot"></span>}
            </div>
          )}
        </nav>

        <div className="submit-sidebar-footer">
          <div className="submit-user-section">
            <p className="submit-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="submit-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              <span className="submit-back-icon">←</span>
              <span className="submit-back-label">Back</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="submit-main">
        <div className="submit-container bf-container">

          <div className="bf-header">
            <div>
              <h1 className="bf-title">BookForge</h1>
              <p className="bf-subtitle">Plan, brief, and track manuscripts through the publishing pipeline.</p>
            </div>
            {!isSmeUser && (
              <button className="bf-btn bf-btn-primary" onClick={goToNewProject}>
                <span>+</span> New Project
              </button>
            )}
          </div>

          {successBanner && (
            <div className="bf-success-banner">
              <span>✓</span> {successBanner}
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="bf-dashboard">
              <div className="bf-kpi-row">
                <div className="bf-kpi-card bf-kpi-blue">
                  <div className="bf-kpi-label">Active Projects</div>
                  <div className="bf-kpi-value">{activeProjects}</div>
                  <div className="bf-kpi-sub">↑ Updated live</div>
                </div>
                <div className="bf-kpi-card bf-kpi-amber">
                  <div className="bf-kpi-label">Pending Reviews</div>
                  <div className="bf-kpi-value">{pendingReviews}</div>
                  <div className="bf-kpi-sub">Needs attention</div>
                </div>
                <div className="bf-kpi-card bf-kpi-green">
                  <div className="bf-kpi-label">Chapters (Total)</div>
                  <div className="bf-kpi-value">{chaptersTotal}</div>
                  <div className="bf-kpi-sub">Across all projects</div>
                </div>
                <div className="bf-kpi-card bf-kpi-navy">
                  <div className="bf-kpi-label">Expected Pages (Total)</div>
                  <div className="bf-kpi-value">{pagesTotal}</div>
                  <div className="bf-kpi-sub">Across all projects</div>
                </div>
              </div>

              <div className="bf-card">
                <div className="bf-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>📋 Project Pipeline</span>
                  <button
                    type="button"
                    onClick={refreshProjects}
                    title="Refresh from server"
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.7 }}
                  >
                    🔄
                  </button>
                </div>
                {projectsError && <div className="bf-error-banner">{projectsError}</div>}
                <div className="bf-table-wrap">
                  {projectsLoading ? (
                    <p style={{ padding: "16px", opacity: 0.7 }}>Loading projects…</p>
                  ) : projects.length === 0 ? (
                    <p style={{ padding: "16px", opacity: 0.7 }}>No projects found yet.</p>
                  ) : (
                    <table className="bf-table">
                      <thead>
                        <tr>
                          <th className="bf-th-toggle"></th>
                          <th>Book Title</th>
                          <th>Status</th>
                          <th>Publisher</th>
                          <th>Deadline</th>
                          <th>Progress</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p) => (
                          <tr key={p.id}>
                            <td className="bf-td-toggle">
                              <button
                                type="button"
                                className="bf-doc-toggle"
                                title="View documents"
                                aria-label="View documents"
                                onClick={() => openDocsModal(p.id)}
                              >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="bf-project-title-btn"
                                title="View documents"
                                onClick={() => openDocsModal(p.id)}
                              >
                                <strong>{p.title}</strong>
                              </button>
                            </td>
                            <td><span className={`bf-chip ${bookStatusChipClass(p.stage)}`}>{p.stage}</span></td>
                            <td>{p.sme}</td>
                            <td className={p.overdue ? "bf-deadline-overdue" : ""}>{p.deadline}</td>
                            <td>
                              {p.progress === null ? (
                                <span style={{ opacity: 0.6 }}>—</span>
                              ) : (
                                <>
                                  <div className="bf-progress-wrap">
                                    <div
                                      className={`bf-progress-bar${p.progress === 100 ? " complete" : p.overdue ? " overdue" : ""}`}
                                      style={{ width: `${p.progress}%` }}
                                    ></div>
                                  </div>
                                  <div className={`bf-progress-label${p.overdue ? " overdue" : p.progress === 100 ? " complete" : ""}`}>{p.progress}%</div>
                                </>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  type="button"
                                  className="bf-icon-btn"
                                  title="Edit project"
                                  aria-label="Edit project"
                                  onClick={() => setEditingProject(p)}
                                  style={{ background: "none", border: "1px solid var(--slate-200)", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer" }}
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="bf-icon-btn"
                                  title="Delete project"
                                  aria-label="Delete project"
                                  disabled={deletingId === p.id}
                                  onClick={() => handleDeleteProject(p)}
                                  style={{ background: "none", border: "1px solid var(--slate-200)", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer" }}
                                >
                                  {deletingId === p.id ? "…" : "🗑️"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "new-project" && (
            <div className="bf-wizard">
              <div className="bf-steps">
                {WIZARD_STEPS.map((label, i) => {
                  const n = i + 1;
                  return (
                    <div className="bf-step" key={label}>
                      <div className={`bf-step-circle${n === 1 ? " active" : ""}`}>{n}</div>
                      <div className={`bf-step-label${n === 1 ? " active" : ""}`}>{label}</div>
                      {n < WIZARD_STEPS.length && <div className="bf-step-connector"></div>}
                    </div>
                  );
                })}
              </div>

              <div className="bf-card bf-wizard-card bf-create-card">
                <div className="bf-card-title">Create Project</div>

                <div className="bf-form-sections">
                  <div className="bf-form-section">
                    <div className="bf-form-section-title">
                      <span className="bf-form-section-icon">📘</span> Basic Information
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group bf-form-group-full">
                        <label className="bf-form-label">Book Title *</label>
                        <input className="bf-form-input" value={form.book_title} onChange={(e) => updateField("book_title", e.target.value)} placeholder="e.g. SSC CGL Mathematics Complete Guide" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Category</label>
                        <select className="bf-form-input" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                          <option>Exam Preparation</option>
                          <option>Academic / School</option>
                          <option>Professional / Technical</option>
                        </select>
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Book Subject</label>
                        <input className="bf-form-input" value={form.book_subject} onChange={(e) => updateField("book_subject", e.target.value)} placeholder="e.g. Competitive Exam" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group bf-form-group-full">
                        <label className="bf-form-label">Target Audience</label>
                        <input className="bf-form-input" value={form.target_audience} onChange={(e) => updateField("target_audience", e.target.value)} placeholder="e.g. SSC CGL aspirants, graduates" />
                      </div>
                    </div>
                  </div>

                  <div className="bf-form-section">
                    <div className="bf-form-section-title">
                      <span className="bf-form-section-icon">🧩</span> Content &amp; Format
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Language</label>
                        <select className="bf-form-input" value={form.language_code} onChange={(e) => updateField("language_code", e.target.value)}>
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="en-hi">Bilingual (En + Hi)</option>
                        </select>
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Primary Output Format</label>
                        <select className="bf-form-input" value={form.primary_output_format} onChange={(e) => updateField("primary_output_format", e.target.value)}>
                          <option>Word + PDF</option>
                          <option>Structured Chapter Package</option>
                          <option>EPUB Ready</option>
                        </select>
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Expected Pages</label>
                        <input type="number" min="0" className="bf-form-input" value={form.expected_pages} onChange={(e) => updateField("expected_pages", e.target.value)} placeholder="e.g. 480" />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Chapter Count</label>
                        <input type="number" min="0" className="bf-form-input" value={form.chapter_count} onChange={(e) => updateField("chapter_count", e.target.value)} placeholder="e.g. 24" />
                      </div>
                    </div>
                  </div>

                  <div className="bf-form-section">
                    <div className="bf-form-section-title">
                      <span className="bf-form-section-icon">🏢</span> Publishing Details
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Publisher Name</label>
                        <input className="bf-form-input" value={form.publisher_name} onChange={(e) => updateField("publisher_name", e.target.value)} placeholder="e.g. Orion Publications" />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Edition</label>
                        <input className="bf-form-input" value={form.edition} onChange={(e) => updateField("edition", e.target.value)} placeholder="e.g. Limited, 1st" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Submission Deadline</label>
                        <input type="date" className="bf-form-input" value={form.submission_deadline} onChange={(e) => updateField("submission_deadline", e.target.value)} />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Book Status</label>
                        <select className="bf-form-input" value={form.book_status} onChange={(e) => updateField("book_status", e.target.value)}>
                          <option>Draft</option>
                          <option>Outline</option>
                          <option>Drafting</option>
                          <option>In Review</option>
                          <option>Export Ready</option>
                          <option>Complete</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bf-form-section">
                    <div className="bf-form-section-title">
                      <span className="bf-form-section-icon">📝</span> Description
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group bf-form-group-full">
                        <label className="bf-form-label">Book Description</label>
                        <textarea className="bf-form-input bf-textarea" rows={4} value={form.book_description} onChange={(e) => updateField("book_description", e.target.value)} placeholder="What is this book about?" />
                      </div>
                    </div>
                  </div>
                </div>

                {formError && <p className="bf-step-error">{formError}</p>}

                <div className="bf-step-actions">
                  <button className="bf-btn bf-btn-secondary" onClick={goBackFromWizard}>Cancel</button>
                  <button className="bf-btn bf-btn-primary" onClick={handleCreateProject} disabled={creating}>
                    {creating ? "Creating…" : "Create Project ✓"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "upload-brief" && (
            <div className="bf-wizard">
              <div className="bf-steps">
                {WIZARD_STEPS.map((label, i) => {
                  const n = i + 1;
                  return (
                    <div className="bf-step" key={label}>
                      <div className={`bf-step-circle${n === 1 ? " done" : ""}${n === 2 ? " active" : ""}`}>
                        {n === 1 ? "✓" : n}
                      </div>
                      <div className={`bf-step-label${n <= 2 ? " active" : ""}`}>{label}</div>
                      {n < WIZARD_STEPS.length && <div className={`bf-step-connector${n === 1 ? " done" : ""}`}></div>}
                    </div>
                  );
                })}
              </div>

              <div className="bf-card bf-wizard-card bf-upload-card">
                <div className="bf-card-title">Brief Upload</div>
                <p className="bf-upload-subtitle">
                  Upload the syllabus, brief, or sample TOC for “{createdProject?.book_title || "your project"}”.
                </p>

                <div className="bf-form-row">
                  <div className="bf-form-group bf-form-group-full">
                    <label className="bf-form-label">Project *</label>
                    <select
                      className="bf-form-input"
                      value={createdProject?.id || ""}
                      onChange={(e) => {
                        const selected = projects.find((p) => String(p.id) === e.target.value);
                        setCreatedProject(selected ? { id: selected.id, book_title: selected.title } : null);
                        setBriefFiles([]);
                      }}
                    >
                      <option value="">
                        {projectsLoading ? "Loading projects…" : "Select a project…"}
                      </option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!createdProject?.id && (
                  <p className="bf-step-error" style={{ marginTop: "-6px" }}>
                    Select a project above (or create a new one) before uploading a brief.
                  </p>
                )}

                <div
                  className={`bf-upload-zone${isDraggingFile ? " drag-active" : ""}${!createdProject?.id ? " disabled" : ""}`}
                  onDragOver={createdProject?.id ? handleBriefDragOver : undefined}
                  onDragLeave={createdProject?.id ? handleBriefDragLeave : undefined}
                  onDrop={createdProject?.id ? handleBriefDrop : undefined}
                >
                  <div className="bf-upload-icon">📎</div>
                  <div className="bf-upload-title">Drag &amp; drop files here</div>
                  <div className="bf-upload-hint">Word, PDF, TXT or paste raw text</div>
                  <button
                    type="button"
                    className="bf-btn bf-btn-secondary"
                    onClick={handleBrowseClick}
                    disabled={!createdProject?.id}
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={UPLOAD_ACCEPT}
                    multiple
                    hidden
                    onChange={handleFileInputChange}
                  />
                </div>

                {briefFiles.length > 0 && (
                  <div className="bf-uploaded-list">
                    {briefFiles.map((f) => (
                      <div className="bf-uploaded-item" key={f.localId}>
                        <span className="bf-uploaded-item-icon">📄</span>
                        <div className="bf-uploaded-item-main">
                          <div className="bf-uploaded-item-name">{f.name}</div>
                          {f.status === "uploaded" && <div className="bf-uploaded-item-msg success">{f.message}</div>}
                          {f.status === "failed" && <div className="bf-uploaded-item-msg failed">{f.message}</div>}
                        </div>
                        {f.status === "uploading" && <span className="bf-upload-status uploading">Uploading…</span>}
                        {f.status === "uploaded" && <span className="bf-upload-status uploaded">✓ Uploaded</span>}
                        {f.status === "failed" && (
                          <div className="bf-uploaded-item-actions">
                            <span className="bf-upload-status failed">Failed</span>
                            <button type="button" className="bf-uploaded-retry" onClick={() => retryBriefUpload(f.localId)}>
                              Retry
                            </button>
                          </div>
                        )}
                        {f.status !== "uploading" && (
                          <button
                            type="button"
                            className="bf-uploaded-remove"
                            title="Remove"
                            aria-label="Remove"
                            onClick={() => removeBriefFile(f.localId)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bf-docs-panel">
                  <div className="bf-docs-panel-title">
                    <span>📚 Documents in this Project</span>
                    <button
                      type="button"
                      onClick={() => createdProject?.id && fetchBriefDocs(createdProject.id)}
                      title="Refresh"
                      className="bf-docs-refresh"
                      disabled={!createdProject?.id}
                    >
                      🔄
                    </button>
                  </div>

                  {briefDocsError && <div className="bf-error-banner">{briefDocsError}</div>}

                  {briefDocsLoading ? (
                    <p className="bf-doc-empty">Loading documents…</p>
                  ) : briefDocs.length === 0 ? (
                    <p className="bf-doc-empty">No documents uploaded for this project yet.</p>
                  ) : (
                    <div className="bf-doc-list">
                      {briefDocs.map((doc) => (
                        <div className="bf-doc-item" key={doc.id}>
                          <span className="bf-doc-icon">{docIconFor(doc.file_extension)}</span>
                          <div className="bf-doc-main">
                            <div className="bf-doc-name">{doc.original_filename}</div>
                            <div className="bf-doc-meta">
                              {formatFileSize(doc.file_size)} · {formatDocDate(doc.created_at)}
                              {doc.document_type ? ` · ${doc.document_type}` : ""}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bf-step-actions">
                  <button className="bf-btn bf-btn-secondary" onClick={goBackFromWizard}>
                    {canSeeDashboard ? "Back to Dashboard" : "Back to Home"}
                  </button>
                  <button
                    className="bf-btn bf-btn-primary"
                    disabled={!hasUploadedBrief}
                    onClick={() => navigate("/")}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "manage-users" && isAdminUser && (
            <div className="bf-dashboard">
              <div className="bf-card">
                <div className="bf-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>👥 All Users</span>
                  <button
                    type="button"
                    onClick={fetchUsers}
                    title="Refresh from server"
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.7 }}
                  >
                    🔄
                  </button>
                </div>
                {usersError && <div className="bf-error-banner">{usersError}</div>}
                <div className="bf-table-wrap">
                  {usersLoading ? (
                    <p style={{ padding: "16px", opacity: 0.7 }}>Loading users…</p>
                  ) : users.length === 0 ? (
                    <p style={{ padding: "16px", opacity: 0.7 }}>No users found yet.</p>
                  ) : (
                    <table className="bf-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Organization</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td><strong>{u.user_name}</strong></td>
                            <td>{u.email}</td>
                            <td><span className={`bf-chip ${roleChipClass(u.role_name)}`}>{u.role_name}</span></td>
                            <td>{u.organization_name || "—"}</td>
                            <td>{formatDocDate(u.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="bf-card">
                <div className="bf-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>🛡️ All Roles</span>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={fetchRoles}
                      title="Refresh from server"
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.7 }}
                    >
                      🔄
                    </button>
                    <button
                      type="button"
                      className="bf-btn bf-btn-primary"
                      onClick={() => { setCreateRoleError(""); setShowCreateRoleModal(true); }}
                    >
                      <span>+</span> Create Role
                    </button>
                  </div>
                </div>
                {rolesError && <div className="bf-error-banner">{rolesError}</div>}
                <div className="bf-table-wrap">
                  {rolesLoading ? (
                    <p style={{ padding: "16px", opacity: 0.7 }}>Loading roles…</p>
                  ) : roles.length === 0 ? (
                    <p style={{ padding: "16px", opacity: 0.7 }}>No roles found yet.</p>
                  ) : (
                    <table className="bf-table">
                      <thead>
                        <tr>
                          <th>Role Name</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((r) => (
                          <tr key={r.id}>
                            <td><span className={`bf-chip ${roleChipClass(r.role_name)}`}>{r.role_name}</span></td>
                            <td>{r.role_description || "—"}</td>
                            <td>
                              {(r.is_Active ?? r.is_active) ? (
                                <span className="bf-chip bf-chip-complete">Active</span>
                              ) : (
                                <span className="bf-chip bf-chip-overdue">Inactive</span>
                              )}
                            </td>
                            <td>{formatDocDate(r.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sme" && isSmeUser && <SmeCapture />}
        </div>
      </main>

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleEditSave}
          saving={savingEdit}
        />
      )}

      {showCreateRoleModal && (
        <CreateRoleModal
          onClose={() => setShowCreateRoleModal(false)}
          onSave={handleCreateRole}
          saving={creatingRole}
          error={createRoleError}
        />
      )}

      {docsModalProjectId && (
        <>
          <input
            ref={docsModalFileInputRef}
            type="file"
            accept={UPLOAD_ACCEPT}
            multiple
            hidden
            onChange={handleDocsModalFileInputChange}
          />
          <DocumentsModal
            project={projects.find((p) => p.id === docsModalProjectId) || null}
            docsState={projectDocsById[docsModalProjectId]}
            actionError={docActionError}
            deletingDocId={deletingDocId}
            downloadingDocId={downloadingDocId}
            uploading={docsModalUploading}
            onClose={closeDocsModal}
            onRefresh={() => loadProjectDocs(docsModalProjectId)}
            onViewProjectInfo={() => handleViewProjectMetadata(docsModalProjectId)}
            onUploadClick={() => docsModalFileInputRef.current?.click()}
            onDownload={handleDownloadDocument}
            onDelete={handleDeleteDocument}
          />
        </>
      )}

      {projectMetadataModal && (
        <ProjectMetadataModal state={projectMetadataModal} onClose={closeProjectMetadataModal} />
      )}
    </div>
  );
}

function DocumentsModal({
  project,
  docsState,
  actionError,
  deletingDocId,
  downloadingDocId,
  uploading,
  onClose,
  onRefresh,
  onViewProjectInfo,
  onUploadClick,
  onDownload,
  onDelete,
}) {
  return (
    <div className="bf-modal-overlay" onClick={onClose}>
      <div className="bf-modal bf-modal-docs" onClick={(e) => e.stopPropagation()}>
        <div className="bf-modal-header">
          <h3>📚 {project?.title || "Documents"}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={onUploadClick}
              title="Upload document"
              aria-label="Upload document"
              className="bf-docs-refresh bf-docs-upload"
              disabled={uploading}
            >
              {uploading ? "…" : "⬆️"}
            </button>
            <button
              type="button"
              onClick={onViewProjectInfo}
              title="Project details"
              aria-label="Project details"
              className="bf-docs-refresh bf-docs-info"
            >
              ℹ️
            </button>
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh"
              className="bf-docs-refresh"
              disabled={docsState?.loading}
            >
              🔄
            </button>
            <button className="bf-modal-close" onClick={onClose} title="Close" aria-label="Close">✕</button>
          </div>
        </div>

        {actionError && <div className="bf-error-banner">{actionError}</div>}

        <div className="bf-modal-body" style={{ marginBottom: "8px" }}>
          {docsState?.loading ? (
            <p className="bf-doc-empty">Loading documents…</p>
          ) : docsState?.error ? (
            <p className="bf-doc-empty bf-doc-empty-error">{docsState.error}</p>
          ) : !docsState?.docs?.length ? (
            <p className="bf-doc-empty">No documents uploaded for this project yet.</p>
          ) : (
            <div className="bf-doc-list">
              {docsState.docs.map((doc) => (
                <div className="bf-doc-item bf-doc-item-modal" key={doc.id}>
                  <span className="bf-doc-icon">{docIconFor(doc.file_extension)}</span>
                  <div className="bf-doc-main">
                    <div className="bf-doc-name">{doc.original_filename}</div>
                    <div className="bf-doc-meta">
                      {formatFileSize(doc.file_size)} · {formatDocDate(doc.created_at)}
                      {doc.document_type ? ` · ${doc.document_type}` : ""}
                    </div>
                  </div>
                  <div className="bf-doc-actions">
                    <button
                      type="button"
                      className="bf-doc-action-btn"
                      title="Download document"
                      aria-label="Download document"
                      disabled={downloadingDocId === doc.id}
                      onClick={() => onDownload(doc)}
                    >
                      {downloadingDocId === doc.id ? "…" : "⬇️"}
                    </button>
                    <button
                      type="button"
                      className="bf-doc-action-btn bf-doc-action-danger"
                      title="Delete document"
                      aria-label="Delete document"
                      disabled={deletingDocId === doc.id}
                      onClick={() => onDelete(doc)}
                    >
                      {deletingDocId === doc.id ? "…" : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bf-modal-actions">
          <button type="button" className="bf-btn bf-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ProjectMetadataModal({ state, onClose }) {
  const { loading, error, data } = state;
  const rows = data
    ? [
        ["ID", data.id],
        ["Book Title", data.book_title],
        ["Category", data.category],
        ["Book Subject", data.book_subject],
        ["Target Audience", data.target_audience],
        ["Language", data.language_code],
        ["Expected Pages", data.expected_pages],
        ["Chapter Count", data.chapter_count],
        ["Publisher Name", data.publisher_name],
        ["Edition", data.edition],
        ["Primary Output Format", data.primary_output_format],
        ["Book Description", data.book_description],
        ["Submission Deadline", data.submission_deadline],
        ["Book Status", data.book_status],
        ["Created By", data.created_by],
        ["Created At", formatDocDate(data.created_at)],
        ["Updated At", formatDocDate(data.updated_at)],
        ["Deleted", data.is_deleted ? "Yes" : "No"],
      ]
    : [];

  return (
    <div className="bf-modal-overlay" onClick={onClose}>
      <div className="bf-modal bf-modal-metadata" onClick={(e) => e.stopPropagation()}>
        <div className="bf-modal-header">
          <h3>Project Details</h3>
          <button className="bf-modal-close" onClick={onClose} title="Close" aria-label="Close">✕</button>
        </div>

        {loading ? (
          <p className="bf-doc-empty">Loading project details…</p>
        ) : error ? (
          <p className="bf-doc-empty bf-doc-empty-error">{error}</p>
        ) : (
          <div className="bf-metadata-table">
            {rows.map(([label, value]) => (
              <div className="bf-metadata-row" key={label}>
                <span className="bf-metadata-label">{label}</span>
                <span className="bf-metadata-value">{value ?? "—"}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bf-modal-actions">
          <button type="button" className="bf-btn bf-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function EditProjectModal({ project, onClose, onSave, saving }) {
  const [bookTitle, setBookTitle] = useState(project.book_title || "");
  const [bookStatus, setBookStatus] = useState(project.book_status || "");
  const [publisherName, setPublisherName] = useState(project.publisher_name || "");
  const [submissionDeadline, setSubmissionDeadline] = useState(project.submission_deadline || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      book_title: bookTitle,
      book_status: bookStatus,
      publisher_name: publisherName,
      submission_deadline: submissionDeadline || null,
    });
  };

  return (
    <div className="bf-modal-overlay" onClick={onClose}>
      <div className="bf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bf-modal-header">
          <h3>Edit Project</h3>
          <button className="bf-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>
              Book Title
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
              />
            </label>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>
              Status
              <input
                type="text"
                value={bookStatus}
                onChange={(e) => setBookStatus(e.target.value)}
                placeholder="e.g. Drafting, In Review, Complete"
                style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
              />
            </label>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>
              Publisher
              <input
                type="text"
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
              />
            </label>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>
              Submission Deadline
              <input
                type="date"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
              />
            </label>
          </div>
          <div className="bf-modal-actions">
            <button type="button" className="bf-btn bf-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="bf-btn bf-btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
function CreateRoleModal({ onClose, onSave, saving, error }) {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
 
  const isValid = roleName.trim().length > 0;
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      role_name: roleName.trim(),
      role_description: roleDescription.trim(),
      is_active: isActive ? 1 : 0,
    });
  };
 
  return (
    <div className="bf-modal-overlay" onClick={onClose}>
      <div className="bf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bf-modal-header">
          <h3>Create Role</h3>
          <button className="bf-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="bf-error-banner" style={{ marginBottom: "14px" }}>{error}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>
              Role Name *
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. BookForge_Editor"
                required
                autoFocus
                style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
              />
            </label>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>
              Description
              <input
                type="text"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="e.g. Reviews and edits SME drafts"
                style={{ width: "100%", marginTop: "6px", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--slate-200)", fontSize: "13.5px" }}
              />
            </label>
            <label style={{ fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Active
            </label>
          </div>
          <div className="bf-modal-actions">
            <button type="button" className="bf-btn bf-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="bf-btn bf-btn-primary" disabled={saving || !isValid}>{saving ? "Creating…" : "Create Role"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
 