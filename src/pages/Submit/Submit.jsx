
// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getBookForgeProjects,
//   createBookForgeProject,
//   updateBookForgeProject,
//   deleteBookForgeProject,
//   uploadBookForgeDocument,
// } from "../../services/apiServices";
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

//   const [activeTab, setActiveTab] = useState("dashboard");
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
//           <div
//             className={`submit-nav-item${activeTab === "dashboard" ? " active" : ""}`}
//             onClick={() => setActiveTab("dashboard")}
//           >
//             <span className="submit-nav-icon">📊</span>
//             <span>Dashboard</span>
//             {activeTab === "dashboard" && <span className="submit-nav-dot"></span>}
//           </div>
//           <div
//             className={`submit-nav-item${activeTab === "new-project" ? " active" : ""}`}
//             onClick={goToNewProject}
//           >
//             <span className="submit-nav-icon">➕</span>
//             <span>New Project</span>
//             {activeTab === "new-project" && <span className="submit-nav-dot"></span>}
//           </div>
//           <div
//             className={`submit-nav-item${activeTab === "upload-brief" ? " active" : ""}`}
//             onClick={() => setActiveTab("upload-brief")}
//           >
//             <span className="submit-nav-icon">📎</span>
//             <span>Brief Upload</span>
//             {activeTab === "upload-brief" && <span className="submit-nav-dot"></span>}
//           </div>
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
//             <button className="bf-btn bf-btn-primary" onClick={goToNewProject}>
//               <span>+</span> New Project
//             </button>
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
//                             <td><strong>{p.title}</strong></td>
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

//               <div className="bf-card bf-wizard-card">
//                 <div className="bf-card-title">Create Project</div>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Book Title *</label>
//                     <input className="bf-form-input" value={form.book_title} onChange={(e) => updateField("book_title", e.target.value)} placeholder="e.g. SSC CGL Mathematics Complete Guide" />
//                   </div>
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Category</label>
//                     <select className="bf-form-input" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
//                       <option>Exam Preparation</option>
//                       <option>Academic / School</option>
//                       <option>Professional / Technical</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Book Subject</label>
//                     <input className="bf-form-input" value={form.book_subject} onChange={(e) => updateField("book_subject", e.target.value)} placeholder="e.g. Competitive Exam" />
//                   </div>
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Target Audience</label>
//                     <input className="bf-form-input" value={form.target_audience} onChange={(e) => updateField("target_audience", e.target.value)} placeholder="e.g. SSC CGL aspirants, graduates" />
//                   </div>
//                 </div>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Language</label>
//                     <select className="bf-form-input" value={form.language_code} onChange={(e) => updateField("language_code", e.target.value)}>
//                       <option value="en">English</option>
//                       <option value="hi">Hindi</option>
//                       <option value="en-hi">Bilingual (En + Hi)</option>
//                     </select>
//                   </div>
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Primary Output Format</label>
//                     <select className="bf-form-input" value={form.primary_output_format} onChange={(e) => updateField("primary_output_format", e.target.value)}>
//                       <option>Word + PDF</option>
//                       <option>Structured Chapter Package</option>
//                       <option>EPUB Ready</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Expected Pages</label>
//                     <input type="number" min="0" className="bf-form-input" value={form.expected_pages} onChange={(e) => updateField("expected_pages", e.target.value)} placeholder="e.g. 480" />
//                   </div>
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Chapter Count</label>
//                     <input type="number" min="0" className="bf-form-input" value={form.chapter_count} onChange={(e) => updateField("chapter_count", e.target.value)} placeholder="e.g. 24" />
//                   </div>
//                 </div>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Publisher Name</label>
//                     <input className="bf-form-input" value={form.publisher_name} onChange={(e) => updateField("publisher_name", e.target.value)} placeholder="e.g. Orion Publications" />
//                   </div>
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Edition</label>
//                     <input className="bf-form-input" value={form.edition} onChange={(e) => updateField("edition", e.target.value)} placeholder="e.g. Limited, 1st" />
//                   </div>
//                 </div>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Submission Deadline</label>
//                     <input type="date" className="bf-form-input" value={form.submission_deadline} onChange={(e) => updateField("submission_deadline", e.target.value)} />
//                   </div>
//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Book Status</label>
//                     <select className="bf-form-input" value={form.book_status} onChange={(e) => updateField("book_status", e.target.value)}>
//                       <option>Draft</option>
//                       <option>Outline</option>
//                       <option>Drafting</option>
//                       <option>In Review</option>
//                       <option>Export Ready</option>
//                       <option>Complete</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="bf-form-row">
//                   <div className="bf-form-group bf-form-group-full">
//                     <label className="bf-form-label">Book Description</label>
//                     <textarea className="bf-form-input bf-textarea" rows={3} value={form.book_description} onChange={(e) => updateField("book_description", e.target.value)} placeholder="What is this book about?" />
//                   </div>
//                 </div>

//                 {formError && <p className="bf-step-error">{formError}</p>}

//                 <div className="bf-step-actions">
//                   <button className="bf-btn bf-btn-secondary" onClick={() => setActiveTab("dashboard")}>Cancel</button>
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

//                 <div className="bf-step-actions">
//                   <button className="bf-btn bf-btn-secondary" onClick={() => setActiveTab("dashboard")}>
//                     Back to Dashboard
//                   </button>
//                   <button
//                     className="bf-btn bf-btn-primary"
//                     disabled={!hasUploadedBrief}
//                     onClick={() => setActiveTab("dashboard")}
//                   >
//                     Continue →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
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




import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookForgeProjects,
  createBookForgeProject,
  updateBookForgeProject,
  deleteBookForgeProject,
  uploadBookForgeDocument,
  getBookForgeDocuments,
} from "../../services/apiServices";
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

  const [activeTab, setActiveTab] = useState("dashboard");
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
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [projectDocsById, setProjectDocsById] = useState({});

  const toggleProjectDocs = async (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
      return;
    }
    setExpandedProjectId(projectId);
    if (projectDocsById[projectId]) return; // already fetched — use cache

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
          <div
            className={`submit-nav-item${activeTab === "dashboard" ? " active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="submit-nav-icon">📊</span>
            <span>Dashboard</span>
            {activeTab === "dashboard" && <span className="submit-nav-dot"></span>}
          </div>
          <div
            className={`submit-nav-item${activeTab === "new-project" ? " active" : ""}`}
            onClick={goToNewProject}
          >
            <span className="submit-nav-icon">➕</span>
            <span>New Project</span>
            {activeTab === "new-project" && <span className="submit-nav-dot"></span>}
          </div>
          <div
            className={`submit-nav-item${activeTab === "upload-brief" ? " active" : ""}`}
            onClick={() => setActiveTab("upload-brief")}
          >
            <span className="submit-nav-icon">📎</span>
            <span>Brief Upload</span>
            {activeTab === "upload-brief" && <span className="submit-nav-dot"></span>}
          </div>
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
            <button className="bf-btn bf-btn-primary" onClick={goToNewProject}>
              <span>+</span> New Project
            </button>
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
                        {projects.map((p) => {
                          const isExpanded = expandedProjectId === p.id;
                          const docsState = projectDocsById[p.id];
                          return (
                            <Fragment key={p.id}>
                              <tr className={isExpanded ? "bf-row-expanded" : ""}>
                                <td className="bf-td-toggle">
                                  <button
                                    type="button"
                                    className={`bf-doc-toggle${isExpanded ? " open" : ""}`}
                                    title="Show uploaded documents"
                                    aria-label="Show uploaded documents"
                                    onClick={() => toggleProjectDocs(p.id)}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                </td>
                                <td><strong>{p.title}</strong></td>
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
                              {isExpanded && (
                                <tr className="bf-docs-row">
                                  <td colSpan={7}>
                                    <div className="bf-docs-row-panel">
                                      {docsState?.loading ? (
                                        <p className="bf-doc-empty">Loading documents…</p>
                                      ) : docsState?.error ? (
                                        <p className="bf-doc-empty bf-doc-empty-error">{docsState.error}</p>
                                      ) : !docsState?.docs?.length ? (
                                        <p className="bf-doc-empty">No documents uploaded for this project yet.</p>
                                      ) : (
                                        <div className="bf-doc-list">
                                          {docsState.docs.map((doc) => (
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
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
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
                  <button className="bf-btn bf-btn-secondary" onClick={() => setActiveTab("dashboard")}>Cancel</button>
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
                  <button className="bf-btn bf-btn-secondary" onClick={() => setActiveTab("dashboard")}>
                    Back to Dashboard
                  </button>
                  <button
                    className="bf-btn bf-btn-primary"
                    disabled={!hasUploadedBrief}
                    onClick={() => setActiveTab("dashboard")}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}
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
 