
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   SHOW_EDITOR_PLUS,
//   SHOW_PUBLISH_PLUS,
//   SHOW_ACCESSIBILITY_PLUS,
// } from "../../constants/featureFlags";
// import { isAdmin } from "../../utils/auth";
// import { getBookForgeProjects, updateBookForgeProject, deleteBookForgeProject } from "../../services/apiServices";
// import "./Submit.css";

// /* ── Dummy seed data (no API yet) ─────────────────────────────── */
// const INITIAL_PROJECTS = [
//   { id: 1, title: "UPSC GS Paper 1", stage: "Review", sme: "Dr. Sharma", deadline: "Jul 10", overdue: true, progress: 72 },
//   { id: 2, title: "SSC CGL Mathematics", stage: "Drafting", sme: "Prof. Gupta", deadline: "Jul 25", overdue: false, progress: 45 },
//   { id: 3, title: "Class 10 Science NCERT+", stage: "Outline", sme: "Ms. Verma", deadline: "Aug 5", overdue: false, progress: 20 },
//   { id: 4, title: "JEE Advanced Chemistry", stage: "Export Ready", sme: "Dr. Mehta", deadline: "Done", overdue: false, progress: 100 },
//   { id: 5, title: "NEET Biology Vol.2", stage: "Overdue", sme: "Dr. Singh", deadline: "Jun 28", overdue: true, progress: 58 },
// ];

// const STEP_LABELS = ["Project Basics", "Audience & Format", "Subject Scope", "Collaborators"];

// const EMPTY_FORM = {
//   title: "",
//   category: "Exam Preparation",
//   description: "",
//   targetDate: "",
//   audience: "",
//   language: "English",
//   pages: "",
//   chapters: "",
//   format: "Word + PDF",
//   deadline: "",
//   subject: "",
//   topics: "",
//   difficulty: "Intermediate",
//   references: "",
//   sme: "",
//   editor: "",
//   reviewerEmail: "",
//   notes: "",
// };

// const bookStatusChipClass = (status) => {
//   const s = (status || "").toLowerCase();
//   if (s.includes("complete") || s.includes("done") || s.includes("export")) return "bf-chip-complete";
//   if (s.includes("review")) return "bf-chip-review";
//   if (s.includes("overdue")) return "bf-chip-overdue";
//   if (s.includes("progress") || s.includes("draft")) return "bf-chip-progress";
//   return "bf-chip-draft";
// };
 


// export default function Submit() {
//   const navigate = useNavigate();
//   const userIsAdmin = isAdmin();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

//   const [step, setStep] = useState(1);
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [stepError, setStepError] = useState("");
//   const [successBanner, setSuccessBanner] = useState("");


//   const updateField = (field, value) => {
//     setForm((f) => ({ ...f, [field]: value }));
//   };

//   const goToNewProject = () => {
//     setStep(1);
//     setForm(EMPTY_FORM);
//     setStepError("");
//     setActiveTab("new-project");
//   };

//   const validateStep = () => {
//     if (step === 1 && !form.title.trim()) return "Book title is required.";
//     if (step === 2 && !form.audience.trim()) return "Target audience is required.";
//     if (step === 4 && !form.sme.trim()) return "Please assign at least one SME.";
//     return "";
//   };

//   const handleNext = () => {
//     const err = validateStep();
//     if (err) { setStepError(err); return; }
//     setStepError("");
//     setStep((s) => Math.min(s + 1, 4));
//   };

//   const handleBack = () => {
//     setStepError("");
//     setStep((s) => Math.max(s - 1, 1));
//   };

//   const handleCreateProject = () => {
//     const err = validateStep();
//     if (err) { setStepError(err); return; }

//     const newProject = {
//       id: Date.now(),
//       title: form.title.trim(),
//       stage: "Outline",
//       sme: form.sme.trim(),
//       deadline: form.deadline || "Not set",
//       overdue: false,
//       progress: 0,
//     };

//     setProjects((p) => [newProject, ...p]);
//     setForm(EMPTY_FORM);
//     setStep(1);
//     setStepError("");
//     setSuccessBanner(`"${newProject.title}" was created and added to your pipeline.`);
//     setActiveTab("dashboard");
//     window.setTimeout(() => setSuccessBanner(""), 4500);
//   };

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
//       <aside className={`submit-sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
//         <div className="submit-logo">
//           <div className="submit-logo-mark">O</div>
//           <div className="submit-logo-text">
//             <span>ORION</span>
//             <small>BookForge</small>
//           </div>
//         </div>

//         <nav className="submit-nav">
//           {userIsAdmin ? (
//             <>
//               <p className="submit-nav-label">WORKSPACE</p>
//               <div className="submit-nav-item active">
//                 <span className="submit-nav-icon">📑</span>
//                 <span>BookForge</span>
//                 <span className="submit-nav-dot"></span>
//               </div>
//               {SHOW_EDITOR_PLUS && (
//                 <div className="submit-nav-item" onClick={() => navigate("/editor")}>
//                   <span className="submit-nav-icon">📝</span>
//                   <span>Editor+</span>
//                 </div>
//               )}
//               {SHOW_PUBLISH_PLUS && (
//                 <div className="submit-nav-item" onClick={() => navigate("/publish")}>
//                   <span className="submit-nav-icon">📚</span>
//                   <span>Publish+</span>
//                 </div>
//               )}
//               {SHOW_ACCESSIBILITY_PLUS && (
//                 <div className="submit-nav-item" onClick={() => navigate("/remediate-pdf")}>
//                   <span className="submit-nav-icon">🔧</span>
//                   <span>Accessibility</span>
//                 </div>
//               )}
//             </>
//           ) : (
//             <button
//               type="button"
//               className="submit-nav-toggle"
//               onClick={() => setSidebarCollapsed((c) => !c)}
//               title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//               aria-label="Toggle sidebar"
//             >
//               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </button>
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
//             <button className="bf-btn bf-btn-primary" onClick={goToNewProject}>
//               <span>+</span> New Project
//             </button>
//           </div>

//           {successBanner && (
//             <div className="bf-success-banner">
//               <span>✓</span> {successBanner}
//             </div>
//           )}

//           <div className="bf-tabs">
//             <button
//               className={`bf-tab${activeTab === "dashboard" ? " active" : ""}`}
//               onClick={() => setActiveTab("dashboard")}
//             >
//               📊 Dashboard
//             </button>
//             <button
//               className={`bf-tab${activeTab === "new-project" ? " active" : ""}`}
//               onClick={goToNewProject}
//             >
//               ➕ New Book Project
//             </button>
//           </div>

//           {activeTab === "dashboard" ? (
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
//           ) : (
//             <div className="bf-wizard">
//               <div className="bf-steps">
//                 {STEP_LABELS.map((label, i) => {
//                   const n = i + 1;
//                   return (
//                     <div className="bf-step" key={label}>
//                       <div className={`bf-step-circle${n < step ? " done" : ""}${n === step ? " active" : ""}`}>
//                         {n < step ? "✓" : n}
//                       </div>
//                       <div className={`bf-step-label${n <= step ? " active" : ""}`}>{label}</div>
//                       {n < 4 && <div className={`bf-step-connector${n < step ? " done" : ""}`}></div>}
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="bf-card bf-wizard-card">
//                 <div className="bf-card-title">Step {step}: {STEP_LABELS[step - 1]}</div>

//                 {step === 1 && (
//                   <>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Book Title *</label>
//                         <input className="bf-form-input" value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. SSC CGL Mathematics Complete Guide" />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Category *</label>
//                         <select className="bf-form-input" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
//                           <option>Exam Preparation</option>
//                           <option>Academic / School</option>
//                           <option>Professional / Technical</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group bf-form-group-full">
//                         <label className="bf-form-label">Brief Description</label>
//                         <textarea className="bf-form-input bf-textarea" rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="What is this book about?" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Target Publish Date</label>
//                         <input type="date" className="bf-form-input" value={form.targetDate} onChange={(e) => updateField("targetDate", e.target.value)} />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {step === 2 && (
//                   <>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Target Audience *</label>
//                         <input className="bf-form-input" value={form.audience} onChange={(e) => updateField("audience", e.target.value)} placeholder="e.g. SSC CGL aspirants, graduates" />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Language *</label>
//                         <select className="bf-form-input" value={form.language} onChange={(e) => updateField("language", e.target.value)}>
//                           <option>English</option>
//                           <option>Hindi</option>
//                           <option>Bilingual (En + Hi)</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Expected Length (pages)</label>
//                         <input className="bf-form-input" value={form.pages} onChange={(e) => updateField("pages", e.target.value)} placeholder="e.g. 480" />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Chapter Count</label>
//                         <input className="bf-form-input" value={form.chapters} onChange={(e) => updateField("chapters", e.target.value)} placeholder="e.g. 24" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Output Format</label>
//                         <select className="bf-form-input" value={form.format} onChange={(e) => updateField("format", e.target.value)}>
//                           <option>Word + PDF</option>
//                           <option>Structured Chapter Package</option>
//                           <option>EPUB Ready</option>
//                         </select>
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Submission Deadline</label>
//                         <input type="date" className="bf-form-input" value={form.deadline} onChange={(e) => updateField("deadline", e.target.value)} />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {step === 3 && (
//                   <>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Primary Subject</label>
//                         <input className="bf-form-input" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} placeholder="e.g. Quantitative Aptitude" />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Difficulty Level</label>
//                         <select className="bf-form-input" value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value)}>
//                           <option>Beginner</option>
//                           <option>Intermediate</option>
//                           <option>Advanced</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group bf-form-group-full">
//                         <label className="bf-form-label">Key Topics</label>
//                         <textarea className="bf-form-input bf-textarea" rows={2} value={form.topics} onChange={(e) => updateField("topics", e.target.value)} placeholder="Comma-separated, e.g. Algebra, Geometry, Data Interpretation" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group bf-form-group-full">
//                         <label className="bf-form-label">Reference Materials</label>
//                         <textarea className="bf-form-input bf-textarea" rows={2} value={form.references} onChange={(e) => updateField("references", e.target.value)} placeholder="Syllabus links, prior editions, source notes..." />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {step === 4 && (
//                   <>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Subject Matter Expert (SME) *</label>
//                         <input className="bf-form-input" value={form.sme} onChange={(e) => updateField("sme", e.target.value)} placeholder="e.g. Dr. Sharma" />
//                       </div>
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Editor</label>
//                         <input className="bf-form-input" value={form.editor} onChange={(e) => updateField("editor", e.target.value)} placeholder="e.g. Prof. Gupta" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group">
//                         <label className="bf-form-label">Reviewer Email</label>
//                         <input type="email" className="bf-form-input" value={form.reviewerEmail} onChange={(e) => updateField("reviewerEmail", e.target.value)} placeholder="reviewer@example.com" />
//                       </div>
//                     </div>
//                     <div className="bf-form-row">
//                       <div className="bf-form-group bf-form-group-full">
//                         <label className="bf-form-label">Team Notes</label>
//                         <textarea className="bf-form-input bf-textarea" rows={2} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Anything the team should know before kickoff" />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {stepError && <p className="bf-step-error">{stepError}</p>}

//                 <div className="bf-step-actions">
//                   <button className="bf-btn bf-btn-secondary" onClick={handleBack} disabled={step === 1}>← Back</button>
//                   {step < 4 ? (
//                     <button className="bf-btn bf-btn-primary" onClick={handleNext}>Next: {STEP_LABELS[step]} →</button>
//                   ) : (
//                     <button className="bf-btn bf-btn-primary" onClick={handleCreateProject}>Create Project ✓</button>
//                   )}
//                 </div>
//                 <div className="bf-annotation">Auto-saved as draft · Step {step} of 4</div>
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



import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookForgeProjects,
  createBookForgeProject,
  updateBookForgeProject,
  deleteBookForgeProject,
  uploadBookForgeDocument,
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

              <div className="bf-card bf-wizard-card">
                <div className="bf-card-title">Create Project</div>

                <div className="bf-form-row">
                  <div className="bf-form-group">
                    <label className="bf-form-label">Book Title *</label>
                    <input className="bf-form-input" value={form.book_title} onChange={(e) => updateField("book_title", e.target.value)} placeholder="e.g. SSC CGL Mathematics Complete Guide" />
                  </div>
                  <div className="bf-form-group">
                    <label className="bf-form-label">Category</label>
                    <select className="bf-form-input" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                      <option>Exam Preparation</option>
                      <option>Academic / School</option>
                      <option>Professional / Technical</option>
                    </select>
                  </div>
                </div>

                <div className="bf-form-row">
                  <div className="bf-form-group">
                    <label className="bf-form-label">Book Subject</label>
                    <input className="bf-form-input" value={form.book_subject} onChange={(e) => updateField("book_subject", e.target.value)} placeholder="e.g. Competitive Exam" />
                  </div>
                  <div className="bf-form-group">
                    <label className="bf-form-label">Target Audience</label>
                    <input className="bf-form-input" value={form.target_audience} onChange={(e) => updateField("target_audience", e.target.value)} placeholder="e.g. SSC CGL aspirants, graduates" />
                  </div>
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

                <div className="bf-form-row">
                  <div className="bf-form-group bf-form-group-full">
                    <label className="bf-form-label">Book Description</label>
                    <textarea className="bf-form-input bf-textarea" rows={3} value={form.book_description} onChange={(e) => updateField("book_description", e.target.value)} placeholder="What is this book about?" />
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
