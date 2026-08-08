

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
//    Review → Export. Only the first three are implemented today; the
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

// /* Step number -> activeTab, for the implemented steps only. Lets the
//    stepper circles/labels jump straight to a step (no gating — a step
//    is reachable any time, same as the sidebar nav items). */
// const WIZARD_STEP_TABS = { 1: "new-project", 2: "upload-brief", 3: "sme-capture" };

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

//   /* ── SME Interview Capture (screen after Brief Upload) ───────
//      NOTE: mock/local-state only for now — there is no SME-Interview
//      API in apiServices.js yet. Everything below is shaped so it's
//      easy to swap for real calls once that endpoint exists:
//        - smeInterviewMode      -> POST payload "mode" field
//        - smeQuestions[].answer -> POST /sme-interview/{project}/answers
//        - smeNotes              -> POST /sme-interview/{project}/notes
//        - smeSummary            -> GET  /sme-interview/{project}/summary (AI)
//        - smeKeyTopics / smePedagogyFlags -> extracted-concepts response */
//   const SME_QUESTIONS_SEED = [
//     { id: "q1", question: "What topics do learners find hardest?" },
//     { id: "q2", question: "What's the best teaching sequence for this subject?" },
//     { id: "q3", question: "How many practice questions per chapter are ideal?" },
//     { id: "q4", question: "Which prior-year questions should be prioritized?" },
//   ];

//   const [smeInterviewMode, setSmeInterviewMode] = useState("live"); // "live" | "async"
//   const [smeQuestions, setSmeQuestions] = useState(
//     SME_QUESTIONS_SEED.map((q) => ({ ...q, answer: "" }))
//   );
//   const [smeActiveQuestionId, setSmeActiveQuestionId] = useState(SME_QUESTIONS_SEED[0].id);
//   const [smeNotes, setSmeNotes] = useState("");
//   const [smeSummary, setSmeSummary] = useState("");
//   const [smeApproved, setSmeApproved] = useState(false);
//   const [smeKeyTopics, setSmeKeyTopics] = useState([]);
//   const [smeKeyTopicInput, setSmeKeyTopicInput] = useState("");
//   const [smePedagogyFlags, setSmePedagogyFlags] = useState([]);
//   const [smePedagogyFlagInput, setSmePedagogyFlagInput] = useState("");

//   const smeActiveQuestion = smeQuestions.find((q) => q.id === smeActiveQuestionId) || null;

//   const smeQuestionStatus = (q) => {
//     if (q.id === smeActiveQuestionId) return "active";
//     if (q.answer.trim()) return "answered";
//     return "pending";
//   };

//   const updateSmeAnswer = (id, value) => {
//     setSmeQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, answer: value } : q)));
//   };

//   const handleGenerateSmeSummary = () => {
//     // Placeholder client-side "summary" until the real AI-summary API is wired up.
//     const answered = smeQuestions.filter((q) => q.answer.trim());
//     if (!smeNotes.trim() && answered.length === 0) return;
//     const bulletized = answered.map((q) => `• ${q.question} — ${q.answer.trim()}`).join("\n");
//     setSmeSummary([smeNotes.trim(), bulletized].filter(Boolean).join("\n\n"));
//   };

//   const handleAddSmeKeyTopic = () => {
//     const value = smeKeyTopicInput.trim();
//     if (!value || smeKeyTopics.includes(value)) return;
//     setSmeKeyTopics((prev) => [...prev, value]);
//     setSmeKeyTopicInput("");
//   };

//   const removeSmeKeyTopic = (topic) => {
//     setSmeKeyTopics((prev) => prev.filter((t) => t !== topic));
//   };

//   const handleAddSmePedagogyFlag = () => {
//     const value = smePedagogyFlagInput.trim();
//     if (!value) return;
//     setSmePedagogyFlags((prev) => [...prev, value]);
//     setSmePedagogyFlagInput("");
//   };

//   const removeSmePedagogyFlag = (index) => {
//     setSmePedagogyFlags((prev) => prev.filter((_, i) => i !== index));
//   };

//   const smePendingQuestions = smeQuestions.filter((q) => !q.answer.trim());

//   const handleMarkSmeApproved = () => {
//     setSmeApproved(true);
//     setSuccessBanner("SME interview marked as approved.");
//     window.setTimeout(() => setSuccessBanner(""), 4500);
//   };

//   const handleConvertToChapterNotes = () => {
//     // Placeholder — will POST to the chapter-notes API once it exists.
//     setSuccessBanner("Converted to chapter notes (draft).");
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
//           <div
//             className={`submit-nav-item${activeTab === "sme-capture" ? " active" : ""}`}
//             onClick={() => setActiveTab("sme-capture")}
//           >
//             <span className="submit-nav-icon">🎙️</span>
//             <span>SME Capture</span>
//             {activeTab === "sme-capture" && <span className="submit-nav-dot"></span>}
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
//                   const stepTab = WIZARD_STEP_TABS[n];
//                   return (
//                     <div
//                       className={`bf-step${stepTab ? " bf-step-clickable" : ""}`}
//                       key={label}
//                       onClick={stepTab ? () => setActiveTab(stepTab) : undefined}
//                     >
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
//                   const stepTab = WIZARD_STEP_TABS[n];
//                   const done = n === 1 && !!createdProject?.id;
//                   const active = n === 2;
//                   return (
//                     <div
//                       className={`bf-step${stepTab ? " bf-step-clickable" : ""}`}
//                       key={label}
//                       onClick={stepTab ? () => setActiveTab(stepTab) : undefined}
//                     >
//                       <div className={`bf-step-circle${done ? " done" : ""}${active ? " active" : ""}`}>
//                         {done ? "✓" : n}
//                       </div>
//                       <div className={`bf-step-label${done || active ? " active" : ""}`}>{label}</div>
//                       {n < WIZARD_STEPS.length && <div className={`bf-step-connector${done ? " done" : ""}`}></div>}
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
//                   <button className="bf-btn bf-btn-secondary" onClick={() => setActiveTab("dashboard")}>
//                     Back to Dashboard
//                   </button>
//                   <button
//                     className="bf-btn bf-btn-primary"
//                     onClick={() => setActiveTab("sme-capture")}
//                   >
//                     Continue →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "sme-capture" && (
//             <div className="bf-wizard">
//               <div className="bf-steps">
//                 {WIZARD_STEPS.map((label, i) => {
//                   const n = i + 1;
//                   const stepTab = WIZARD_STEP_TABS[n];
//                   const done = (n === 1 && !!createdProject?.id) || (n === 2 && hasUploadedBrief);
//                   const active = n === 3;
//                   return (
//                     <div
//                       className={`bf-step${stepTab ? " bf-step-clickable" : ""}`}
//                       key={label}
//                       onClick={stepTab ? () => setActiveTab(stepTab) : undefined}
//                     >
//                       <div className={`bf-step-circle${done ? " done" : ""}${active ? " active" : ""}`}>
//                         {done ? "✓" : n}
//                       </div>
//                       <div className={`bf-step-label${done || active ? " active" : ""}`}>{label}</div>
//                       {n < WIZARD_STEPS.length && <div className={`bf-step-connector${done ? " done" : ""}`}></div>}
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="bf-sme-header">
//                 <div>
//                   <div className="bf-card-title" style={{ marginBottom: "4px" }}>SME Interview Capture</div>
//                   <p className="bf-upload-subtitle" style={{ margin: 0 }}>
//                     Capture expert knowledge via live interview or async Q&amp;A. AI summarizes and extracts concepts.
//                   </p>
//                 </div>
//                 <div className="bf-sme-meta">
//                   SME: <strong>{createdProject?.publisher_name || "Unassigned"}</strong>
//                   <span className="bf-sme-meta-divider">|</span>
//                   Project: <strong>{createdProject?.book_title || "Untitled"}</strong>
//                 </div>
//               </div>

//               <div className="bf-sme-mode-toggle">
//                 <button
//                   type="button"
//                   className={`bf-sme-mode-btn${smeInterviewMode === "live" ? " active" : ""}`}
//                   onClick={() => setSmeInterviewMode("live")}
//                 >
//                   🎙️ Live Mode
//                 </button>
//                 <button
//                   type="button"
//                   className={`bf-sme-mode-btn${smeInterviewMode === "async" ? " active" : ""}`}
//                   onClick={() => setSmeInterviewMode("async")}
//                 >
//                   📝 Async Q&amp;A Mode
//                 </button>
//               </div>

//               <div className="bf-sme-grid">
//                 {/* ── Interview Questions ─────────────────────── */}
//                 <div className="bf-card bf-sme-col">
//                   <div className="bf-card-title">Interview Questions</div>
//                   <div className="bf-sme-question-list">
//                     {smeQuestions.map((q, i) => {
//                       const status = smeQuestionStatus(q);
//                       return (
//                         <div
//                           key={q.id}
//                           className={`bf-sme-question${status === "active" ? " active" : ""}`}
//                           onClick={() => setSmeActiveQuestionId(q.id)}
//                         >
//                           <div className="bf-sme-question-meta">
//                             <span>Q{i + 1} · {status === "answered" ? "Answered" : status === "active" ? "Active" : "Pending"}</span>
//                           </div>
//                           <div className="bf-sme-question-text">{q.question}</div>
//                           <div className="bf-sme-question-answer">
//                             {q.answer.trim() ? q.answer : <span className="bf-sme-question-placeholder">Awaiting response…</span>}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 {/* ── Notes / Transcript ──────────────────────── */}
//                 <div className="bf-card bf-sme-col">
//                   <div className="bf-card-title">Notes / Transcript</div>

//                   {smeActiveQuestion && (
//                     <div className="bf-form-group" style={{ marginBottom: "14px" }}>
//                       <label className="bf-form-label">Answer — {smeActiveQuestion.question}</label>
//                       <textarea
//                         className="bf-form-input bf-textarea"
//                         rows={3}
//                         value={smeActiveQuestion.answer}
//                         onChange={(e) => updateSmeAnswer(smeActiveQuestion.id, e.target.value)}
//                         placeholder="Type or paste the SME's response…"
//                       />
//                     </div>
//                   )}

//                   <div className="bf-form-group">
//                     <label className="bf-form-label">Transcript / Notes</label>
//                     <textarea
//                       className="bf-form-input bf-textarea"
//                       rows={6}
//                       value={smeNotes}
//                       onChange={(e) => setSmeNotes(e.target.value)}
//                       placeholder="Free-form notes captured during the interview…"
//                     />
//                   </div>

//                   <div className="bf-sme-summary-box">
//                     <div className="bf-sme-summary-title">🤖 AI-Generated Summary</div>
//                     {smeSummary ? (
//                       <p className="bf-sme-summary-text">{smeSummary}</p>
//                     ) : (
//                       <p className="bf-sme-summary-empty">No summary yet — add notes or answers, then generate one.</p>
//                     )}
//                     <button type="button" className="bf-btn bf-btn-secondary bf-btn-sm" onClick={handleGenerateSmeSummary}>
//                       Generate Summary
//                     </button>
//                   </div>

//                   <div className="bf-step-actions">
//                     <button type="button" className="bf-btn bf-btn-secondary" onClick={handleMarkSmeApproved}>
//                       {smeApproved ? "✓ Approved" : "Mark as Approved"}
//                     </button>
//                     <button type="button" className="bf-btn bf-btn-primary" onClick={handleConvertToChapterNotes}>
//                       Convert to Chapter Notes →
//                     </button>
//                   </div>
//                 </div>

//                 {/* ── Extracted Concepts ──────────────────────── */}
//                 <div className="bf-card bf-sme-col">
//                   <div className="bf-card-title">Extracted Concepts</div>

//                   <div className="bf-sme-subsection-label">Key Topics</div>
//                   <div className="bf-sme-tag-row">
//                     {smeKeyTopics.map((topic) => (
//                       <span className="bf-sme-tag" key={topic}>
//                         {topic}
//                         <button type="button" onClick={() => removeSmeKeyTopic(topic)} aria-label={`Remove ${topic}`}>✕</button>
//                       </span>
//                     ))}
//                     {smeKeyTopics.length === 0 && <p className="bf-doc-empty" style={{ padding: "2px 0" }}>No topics added yet.</p>}
//                   </div>
//                   <div className="bf-sme-inline-add">
//                     <input
//                       className="bf-form-input"
//                       value={smeKeyTopicInput}
//                       onChange={(e) => setSmeKeyTopicInput(e.target.value)}
//                       onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSmeKeyTopic())}
//                       placeholder="e.g. Percentage"
//                     />
//                     <button type="button" className="bf-btn bf-btn-secondary bf-btn-sm" onClick={handleAddSmeKeyTopic}>Add</button>
//                   </div>

//                   <div className="bf-sme-subsection-label" style={{ marginTop: "18px" }}>Pedagogy Flags</div>
//                   <div className="bf-sme-flag-list">
//                     {smePedagogyFlags.map((flag, i) => (
//                       <div className="bf-sme-flag" key={`${flag}-${i}`}>
//                         <span>⚠️ {flag}</span>
//                         <button type="button" onClick={() => removeSmePedagogyFlag(i)} aria-label="Remove flag">✕</button>
//                       </div>
//                     ))}
//                     {smePedagogyFlags.length === 0 && <p className="bf-doc-empty" style={{ padding: "2px 0" }}>No flags yet.</p>}
//                   </div>
//                   <div className="bf-sme-inline-add">
//                     <input
//                       className="bf-form-input"
//                       value={smePedagogyFlagInput}
//                       onChange={(e) => setSmePedagogyFlagInput(e.target.value)}
//                       onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSmePedagogyFlag())}
//                       placeholder="e.g. Bilingual glossary needed"
//                     />
//                     <button type="button" className="bf-btn bf-btn-secondary bf-btn-sm" onClick={handleAddSmePedagogyFlag}>Add</button>
//                   </div>

//                   <div className="bf-sme-subsection-label" style={{ marginTop: "18px" }}>Follow-up Flags</div>
//                   {smePendingQuestions.length === 0 ? (
//                     <p className="bf-doc-empty" style={{ padding: "2px 0" }}>All questions answered.</p>
//                   ) : (
//                     <div className="bf-sme-followup-list">
//                       {smePendingQuestions.map((q) => {
//                         const idx = smeQuestions.findIndex((x) => x.id === q.id) + 1;
//                         return (
//                           <div className="bf-sme-followup" key={q.id}>❓ Q{idx} answer pending</div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bf-step-actions">
//                 <button className="bf-btn bf-btn-secondary" onClick={() => setActiveTab("upload-brief")}>
//                   ← Back
//                 </button>
//                 <button className="bf-btn bf-btn-primary" onClick={() => setActiveTab("dashboard")}>
//                   Save &amp; Return to Dashboard
//                 </button>
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
} from "../../services/apiServices";
import { isAdmin, isUser } from "../../utils/auth";
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
   Review → Export. Only the first three are implemented today; the
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

/* Step number -> activeTab, for the implemented steps only. Lets the
   stepper circles/labels jump straight to a step (no gating — a step
   is reachable any time, same as the sidebar nav items). */
const WIZARD_STEP_TABS = { 1: "new-project", 2: "upload-brief", 3: "sme-capture" };

const UPLOAD_ACCEPT = ".doc,.docx,.pdf,.txt";

/* ── Admin allocation — mock/local-only store ────────────────────
   NOTE: there is no GET /users, PATCH /users/{id}/role, or project-
   assignment API yet (see message to Gopal), so the Admin "Allocate
   Roles & Projects" screen persists to localStorage instead of the
   backend. This keeps it usable across logins in the same browser
   for demo/testing, but it is NOT synced to the real DB — role
   changes here do not affect what /auth/login actually returns.
   Swap ADMIN_DIRECTORY_KEY/ADMIN_ASSIGN_KEY reads/writes for real
   API calls once those endpoints exist. */
const ADMIN_DIRECTORY_KEY = "bf_admin_user_directory";   // [{ id, name, email, role }]
const ADMIN_ASSIGN_KEY = "bf_admin_project_assignments"; // { [projectId]: userId }
const ROLE_OPTIONS = ["USER", "SME", "EDITOR", "ADMIN"];

const loadAdminDirectory = () => {
  try {
    const raw = localStorage.getItem(ADMIN_DIRECTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadAdminAssignments = () => {
  try {
    const raw = localStorage.getItem(ADMIN_ASSIGN_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export default function Submit() {
  const navigate = useNavigate();

  /* ── Role gates (BookForge-scoped) ────────────────────────────
     USER  -> Dashboard / New Project / Brief Upload only, own
               projects only, no edit/delete, read-only elsewhere.
     ADMIN -> full access + the new Allocate Roles & Projects screen.
     SME / EDITOR -> unrestricted for now (not in scope yet). */
  const userIsAdmin = isAdmin();
  const userIsUser = isUser();
  const currentUserId = Number(sessionStorage.getItem("token")) || 0;

  const [activeTab, setActiveTab] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  /* ── Admin: user directory + project assignments (mock/local) ── */
  const [adminDirectory, setAdminDirectory] = useState(loadAdminDirectory);
  const [adminAssignments, setAdminAssignments] = useState(loadAdminAssignments);
  const [newDirUserId, setNewDirUserId] = useState("");
  const [newDirUserName, setNewDirUserName] = useState("");
  const [newDirUserEmail, setNewDirUserEmail] = useState("");

  const persistAdminDirectory = (next) => {
    setAdminDirectory(next);
    localStorage.setItem(ADMIN_DIRECTORY_KEY, JSON.stringify(next));
  };

  const persistAdminAssignments = (next) => {
    setAdminAssignments(next);
    localStorage.setItem(ADMIN_ASSIGN_KEY, JSON.stringify(next));
  };

  const handleAddDirectoryUser = () => {
    const id = newDirUserId.trim();
    const name = newDirUserName.trim();
    const email = newDirUserEmail.trim();
    if (!id || !email) return;
    if (adminDirectory.some((u) => String(u.id) === String(id))) return;
    persistAdminDirectory([...adminDirectory, { id, name: name || email, email, role: "USER" }]);
    setNewDirUserId("");
    setNewDirUserName("");
    setNewDirUserEmail("");
  };

  const handleRemoveDirectoryUser = (id) => {
    persistAdminDirectory(adminDirectory.filter((u) => String(u.id) !== String(id)));
    const nextAssignments = { ...adminAssignments };
    Object.keys(nextAssignments).forEach((projectId) => {
      if (String(nextAssignments[projectId]) === String(id)) delete nextAssignments[projectId];
    });
    persistAdminAssignments(nextAssignments);
  };

  const handleChangeDirectoryUserRole = (id, role) => {
    persistAdminDirectory(adminDirectory.map((u) => (String(u.id) === String(id) ? { ...u, role } : u)));
  };

  const handleAssignProjectToUser = (projectId, userId) => {
    const next = { ...adminAssignments };
    // Enforce one active assignment per user — drop any prior project they had.
    Object.keys(next).forEach((pid) => {
      if (String(next[pid]) === String(userId)) delete next[pid];
    });
    if (projectId) next[projectId] = userId;
    persistAdminAssignments(next);
  };

  /* ── User role: which projects are "his" ──────────────────────
     Own creations (created_by) + anything Admin assigned to him
     via the mock directory above. */
  const visibleProjects = userIsUser
    ? projects.filter(
        (p) =>
          Number(p.created_by) === currentUserId ||
          String(adminAssignments[p.id]) === String(currentUserId)
      )
    : projects;

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

  /* ── SME Interview Capture (screen after Brief Upload) ───────
     NOTE: mock/local-state only for now — there is no SME-Interview
     API in apiServices.js yet. Everything below is shaped so it's
     easy to swap for real calls once that endpoint exists:
       - smeInterviewMode      -> POST payload "mode" field
       - smeQuestions[].answer -> POST /sme-interview/{project}/answers
       - smeNotes              -> POST /sme-interview/{project}/notes
       - smeSummary            -> GET  /sme-interview/{project}/summary (AI)
       - smeKeyTopics / smePedagogyFlags -> extracted-concepts response */
  const SME_QUESTIONS_SEED = [
    { id: "q1", question: "What topics do learners find hardest?" },
    { id: "q2", question: "What's the best teaching sequence for this subject?" },
    { id: "q3", question: "How many practice questions per chapter are ideal?" },
    { id: "q4", question: "Which prior-year questions should be prioritized?" },
  ];

  const [smeInterviewMode, setSmeInterviewMode] = useState("live"); // "live" | "async"
  const [smeQuestions, setSmeQuestions] = useState(
    SME_QUESTIONS_SEED.map((q) => ({ ...q, answer: "" }))
  );
  const [smeActiveQuestionId, setSmeActiveQuestionId] = useState(SME_QUESTIONS_SEED[0].id);
  const [smeNotes, setSmeNotes] = useState("");
  const [smeSummary, setSmeSummary] = useState("");
  const [smeApproved, setSmeApproved] = useState(false);
  const [smeKeyTopics, setSmeKeyTopics] = useState([]);
  const [smeKeyTopicInput, setSmeKeyTopicInput] = useState("");
  const [smePedagogyFlags, setSmePedagogyFlags] = useState([]);
  const [smePedagogyFlagInput, setSmePedagogyFlagInput] = useState("");

  const smeActiveQuestion = smeQuestions.find((q) => q.id === smeActiveQuestionId) || null;

  const smeQuestionStatus = (q) => {
    if (q.id === smeActiveQuestionId) return "active";
    if (q.answer.trim()) return "answered";
    return "pending";
  };

  const updateSmeAnswer = (id, value) => {
    setSmeQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, answer: value } : q)));
  };

  const handleGenerateSmeSummary = () => {
    // Placeholder client-side "summary" until the real AI-summary API is wired up.
    const answered = smeQuestions.filter((q) => q.answer.trim());
    if (!smeNotes.trim() && answered.length === 0) return;
    const bulletized = answered.map((q) => `• ${q.question} — ${q.answer.trim()}`).join("\n");
    setSmeSummary([smeNotes.trim(), bulletized].filter(Boolean).join("\n\n"));
  };

  const handleAddSmeKeyTopic = () => {
    const value = smeKeyTopicInput.trim();
    if (!value || smeKeyTopics.includes(value)) return;
    setSmeKeyTopics((prev) => [...prev, value]);
    setSmeKeyTopicInput("");
  };

  const removeSmeKeyTopic = (topic) => {
    setSmeKeyTopics((prev) => prev.filter((t) => t !== topic));
  };

  const handleAddSmePedagogyFlag = () => {
    const value = smePedagogyFlagInput.trim();
    if (!value) return;
    setSmePedagogyFlags((prev) => [...prev, value]);
    setSmePedagogyFlagInput("");
  };

  const removeSmePedagogyFlag = (index) => {
    setSmePedagogyFlags((prev) => prev.filter((_, i) => i !== index));
  };

  const smePendingQuestions = smeQuestions.filter((q) => !q.answer.trim());

  const handleMarkSmeApproved = () => {
    setSmeApproved(true);
    setSuccessBanner("SME interview marked as approved.");
    window.setTimeout(() => setSuccessBanner(""), 4500);
  };

  const handleConvertToChapterNotes = () => {
    // Placeholder — will POST to the chapter-notes API once it exists.
    setSuccessBanner("Converted to chapter notes (draft).");
    window.setTimeout(() => setSuccessBanner(""), 4500);
  };

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

  const activeProjects = visibleProjects.length;
  const pendingReviews = visibleProjects.filter((p) => p.stage.toLowerCase().includes("review")).length;
  const chaptersTotal = visibleProjects.reduce((sum, p) => sum + (Number(p.chapter_count) || 0), 0);
  const pagesTotal = visibleProjects.reduce((sum, p) => sum + (Number(p.expected_pages) || 0), 0);

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
          {!userIsUser && (
            <div
              className={`submit-nav-item${activeTab === "sme-capture" ? " active" : ""}`}
              onClick={() => setActiveTab("sme-capture")}
            >
              <span className="submit-nav-icon">🎙️</span>
              <span>SME Capture</span>
              {activeTab === "sme-capture" && <span className="submit-nav-dot"></span>}
            </div>
          )}
          {userIsAdmin && (
            <div
              className={`submit-nav-item${activeTab === "allocate" ? " active" : ""}`}
              onClick={() => setActiveTab("allocate")}
            >
              <span className="submit-nav-icon">🛠️</span>
              <span>Allocate Roles &amp; Projects</span>
              {activeTab === "allocate" && <span className="submit-nav-dot"></span>}
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
                  ) : visibleProjects.length === 0 ? (
                    <p style={{ padding: "16px", opacity: 0.7 }}>
                      {userIsUser ? "No projects assigned to you yet." : "No projects found yet."}
                    </p>
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
                          {!userIsUser && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleProjects.map((p) => (
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
                            {!userIsUser && (
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
                            )}
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
                  const stepTab = WIZARD_STEP_TABS[n];
                  return (
                    <div
                      className={`bf-step${stepTab ? " bf-step-clickable" : ""}`}
                      key={label}
                      onClick={stepTab ? () => setActiveTab(stepTab) : undefined}
                    >
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
                  const stepTab = WIZARD_STEP_TABS[n];
                  const done = n === 1 && !!createdProject?.id;
                  const active = n === 2;
                  return (
                    <div
                      className={`bf-step${stepTab ? " bf-step-clickable" : ""}`}
                      key={label}
                      onClick={stepTab ? () => setActiveTab(stepTab) : undefined}
                    >
                      <div className={`bf-step-circle${done ? " done" : ""}${active ? " active" : ""}`}>
                        {done ? "✓" : n}
                      </div>
                      <div className={`bf-step-label${done || active ? " active" : ""}`}>{label}</div>
                      {n < WIZARD_STEPS.length && <div className={`bf-step-connector${done ? " done" : ""}`}></div>}
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
                        const selected = visibleProjects.find((p) => String(p.id) === e.target.value);
                        setCreatedProject(selected ? { id: selected.id, book_title: selected.title } : null);
                        setBriefFiles([]);
                      }}
                    >
                      <option value="">
                        {projectsLoading ? "Loading projects…" : "Select a project…"}
                      </option>
                      {visibleProjects.map((p) => (
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
                    onClick={() => setActiveTab("sme-capture")}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sme-capture" && (
            <div className="bf-wizard">
              <div className="bf-steps">
                {WIZARD_STEPS.map((label, i) => {
                  const n = i + 1;
                  const stepTab = WIZARD_STEP_TABS[n];
                  const done = (n === 1 && !!createdProject?.id) || (n === 2 && hasUploadedBrief);
                  const active = n === 3;
                  return (
                    <div
                      className={`bf-step${stepTab ? " bf-step-clickable" : ""}`}
                      key={label}
                      onClick={stepTab ? () => setActiveTab(stepTab) : undefined}
                    >
                      <div className={`bf-step-circle${done ? " done" : ""}${active ? " active" : ""}`}>
                        {done ? "✓" : n}
                      </div>
                      <div className={`bf-step-label${done || active ? " active" : ""}`}>{label}</div>
                      {n < WIZARD_STEPS.length && <div className={`bf-step-connector${done ? " done" : ""}`}></div>}
                    </div>
                  );
                })}
              </div>

              <div className="bf-sme-header">
                <div>
                  <div className="bf-card-title" style={{ marginBottom: "4px" }}>SME Interview Capture</div>
                  <p className="bf-upload-subtitle" style={{ margin: 0 }}>
                    Capture expert knowledge via live interview or async Q&amp;A. AI summarizes and extracts concepts.
                  </p>
                </div>
                <div className="bf-sme-meta">
                  SME: <strong>{createdProject?.publisher_name || "Unassigned"}</strong>
                  <span className="bf-sme-meta-divider">|</span>
                  Project: <strong>{createdProject?.book_title || "Untitled"}</strong>
                </div>
              </div>

              {userIsUser && (
                <div className="bf-readonly-banner">
                  👁️ View only — your role doesn't have edit access on this screen.
                </div>
              )}

              <div className="bf-sme-mode-toggle">
                <button
                  type="button"
                  className={`bf-sme-mode-btn${smeInterviewMode === "live" ? " active" : ""}`}
                  onClick={() => setSmeInterviewMode("live")}
                  disabled={userIsUser}
                >
                  🎙️ Live Mode
                </button>
                <button
                  type="button"
                  className={`bf-sme-mode-btn${smeInterviewMode === "async" ? " active" : ""}`}
                  onClick={() => setSmeInterviewMode("async")}
                  disabled={userIsUser}
                >
                  📝 Async Q&amp;A Mode
                </button>
              </div>

              <div className={`bf-sme-grid${userIsUser ? " bf-readonly" : ""}`}>
                {/* ── Interview Questions ─────────────────────── */}
                <div className="bf-card bf-sme-col">
                  <div className="bf-card-title">Interview Questions</div>
                  <div className="bf-sme-question-list">
                    {smeQuestions.map((q, i) => {
                      const status = smeQuestionStatus(q);
                      return (
                        <div
                          key={q.id}
                          className={`bf-sme-question${status === "active" ? " active" : ""}`}
                          onClick={userIsUser ? undefined : () => setSmeActiveQuestionId(q.id)}
                        >
                          <div className="bf-sme-question-meta">
                            <span>Q{i + 1} · {status === "answered" ? "Answered" : status === "active" ? "Active" : "Pending"}</span>
                          </div>
                          <div className="bf-sme-question-text">{q.question}</div>
                          <div className="bf-sme-question-answer">
                            {q.answer.trim() ? q.answer : <span className="bf-sme-question-placeholder">Awaiting response…</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Notes / Transcript ──────────────────────── */}
                <div className="bf-card bf-sme-col">
                  <div className="bf-card-title">Notes / Transcript</div>

                  {smeActiveQuestion && (
                    <div className="bf-form-group" style={{ marginBottom: "14px" }}>
                      <label className="bf-form-label">Answer — {smeActiveQuestion.question}</label>
                      <textarea
                        className="bf-form-input bf-textarea"
                        rows={3}
                        value={smeActiveQuestion.answer}
                        onChange={(e) => updateSmeAnswer(smeActiveQuestion.id, e.target.value)}
                        placeholder="Type or paste the SME's response…"
                        disabled={userIsUser}
                      />
                    </div>
                  )}

                  <div className="bf-form-group">
                    <label className="bf-form-label">Transcript / Notes</label>
                    <textarea
                      className="bf-form-input bf-textarea"
                      rows={6}
                      value={smeNotes}
                      onChange={(e) => setSmeNotes(e.target.value)}
                      placeholder="Free-form notes captured during the interview…"
                      disabled={userIsUser}
                    />
                  </div>

                  <div className="bf-sme-summary-box">
                    <div className="bf-sme-summary-title">🤖 AI-Generated Summary</div>
                    {smeSummary ? (
                      <p className="bf-sme-summary-text">{smeSummary}</p>
                    ) : (
                      <p className="bf-sme-summary-empty">No summary yet — add notes or answers, then generate one.</p>
                    )}
                    <button type="button" className="bf-btn bf-btn-secondary bf-btn-sm" onClick={handleGenerateSmeSummary} disabled={userIsUser}>
                      Generate Summary
                    </button>
                  </div>

                  <div className="bf-step-actions">
                    <button type="button" className="bf-btn bf-btn-secondary" onClick={handleMarkSmeApproved} disabled={userIsUser}>
                      {smeApproved ? "✓ Approved" : "Mark as Approved"}
                    </button>
                    <button type="button" className="bf-btn bf-btn-primary" onClick={handleConvertToChapterNotes} disabled={userIsUser}>
                      Convert to Chapter Notes →
                    </button>
                  </div>
                </div>

                {/* ── Extracted Concepts ──────────────────────── */}
                <div className="bf-card bf-sme-col">
                  <div className="bf-card-title">Extracted Concepts</div>

                  <div className="bf-sme-subsection-label">Key Topics</div>
                  <div className="bf-sme-tag-row">
                    {smeKeyTopics.map((topic) => (
                      <span className="bf-sme-tag" key={topic}>
                        {topic}
                        <button type="button" onClick={() => removeSmeKeyTopic(topic)} aria-label={`Remove ${topic}`} disabled={userIsUser}>✕</button>
                      </span>
                    ))}
                    {smeKeyTopics.length === 0 && <p className="bf-doc-empty" style={{ padding: "2px 0" }}>No topics added yet.</p>}
                  </div>
                  <div className="bf-sme-inline-add">
                    <input
                      className="bf-form-input"
                      value={smeKeyTopicInput}
                      onChange={(e) => setSmeKeyTopicInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSmeKeyTopic())}
                      placeholder="e.g. Percentage"
                      disabled={userIsUser}
                    />
                    <button type="button" className="bf-btn bf-btn-secondary bf-btn-sm" onClick={handleAddSmeKeyTopic} disabled={userIsUser}>Add</button>
                  </div>

                  <div className="bf-sme-subsection-label" style={{ marginTop: "18px" }}>Pedagogy Flags</div>
                  <div className="bf-sme-flag-list">
                    {smePedagogyFlags.map((flag, i) => (
                      <div className="bf-sme-flag" key={`${flag}-${i}`}>
                        <span>⚠️ {flag}</span>
                        <button type="button" onClick={() => removeSmePedagogyFlag(i)} aria-label="Remove flag" disabled={userIsUser}>✕</button>
                      </div>
                    ))}
                    {smePedagogyFlags.length === 0 && <p className="bf-doc-empty" style={{ padding: "2px 0" }}>No flags yet.</p>}
                  </div>
                  <div className="bf-sme-inline-add">
                    <input
                      className="bf-form-input"
                      value={smePedagogyFlagInput}
                      onChange={(e) => setSmePedagogyFlagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSmePedagogyFlag())}
                      placeholder="e.g. Bilingual glossary needed"
                      disabled={userIsUser}
                    />
                    <button type="button" className="bf-btn bf-btn-secondary bf-btn-sm" onClick={handleAddSmePedagogyFlag} disabled={userIsUser}>Add</button>
                  </div>

                  <div className="bf-sme-subsection-label" style={{ marginTop: "18px" }}>Follow-up Flags</div>
                  {smePendingQuestions.length === 0 ? (
                    <p className="bf-doc-empty" style={{ padding: "2px 0" }}>All questions answered.</p>
                  ) : (
                    <div className="bf-sme-followup-list">
                      {smePendingQuestions.map((q) => {
                        const idx = smeQuestions.findIndex((x) => x.id === q.id) + 1;
                        return (
                          <div className="bf-sme-followup" key={q.id}>❓ Q{idx} answer pending</div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bf-step-actions">
                <button className="bf-btn bf-btn-secondary" onClick={() => setActiveTab("upload-brief")}>
                  ← Back
                </button>
                <button className="bf-btn bf-btn-primary" onClick={() => setActiveTab("dashboard")}>
                  Save &amp; Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {activeTab === "allocate" && userIsAdmin && (
            <div className="bf-dashboard">
              <div className="bf-header" style={{ marginBottom: "8px" }}>
                <div>
                  <h2 className="bf-card-title" style={{ marginBottom: "4px", fontSize: "18px" }}>Allocate Roles &amp; Projects</h2>
                  <p className="bf-upload-subtitle" style={{ margin: 0 }}>
                    Add a user to the directory, set their role, and assign them a project.
                  </p>
                </div>
              </div>

              <div className="bf-readonly-banner">
                ℹ️ There's no user-list / role-assign / project-assign API yet, so this directory is stored locally
                in your browser (not the real database). It's ready to swap for real API calls once those endpoints exist.
              </div>

              <div className="bf-card" style={{ marginBottom: "18px" }}>
                <div className="bf-card-title">Add User to Directory</div>
                <div className="bf-form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
                  <div className="bf-form-group">
                    <label className="bf-form-label">User ID</label>
                    <input
                      className="bf-form-input"
                      value={newDirUserId}
                      onChange={(e) => setNewDirUserId(e.target.value)}
                      placeholder="e.g. 4"
                    />
                  </div>
                  <div className="bf-form-group">
                    <label className="bf-form-label">Name</label>
                    <input
                      className="bf-form-input"
                      value={newDirUserName}
                      onChange={(e) => setNewDirUserName(e.target.value)}
                      placeholder="e.g. Rajat"
                    />
                  </div>
                  <div className="bf-form-group">
                    <label className="bf-form-label">Email</label>
                    <input
                      className="bf-form-input"
                      value={newDirUserEmail}
                      onChange={(e) => setNewDirUserEmail(e.target.value)}
                      placeholder="e.g. rajat@gmail.com"
                    />
                  </div>
                  <div className="bf-form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                    <button type="button" className="bf-btn bf-btn-primary" onClick={handleAddDirectoryUser}>
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="bf-card">
                <div className="bf-card-title">User Directory</div>
                {adminDirectory.length === 0 ? (
                  <p className="bf-doc-empty">No users added yet — add one above to assign a role and project.</p>
                ) : (
                  <div className="bf-table-wrap">
                    <table className="bf-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Assigned Project</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminDirectory.map((u) => (
                          <tr key={u.id}>
                            <td><strong>{u.name}</strong> <span style={{ color: "var(--slate-400)", fontSize: "11.5px" }}>#{u.id}</span></td>
                            <td>{u.email}</td>
                            <td>
                              <select
                                className="bf-form-input"
                                value={u.role}
                                onChange={(e) => handleChangeDirectoryUserRole(u.id, e.target.value)}
                              >
                                {ROLE_OPTIONS.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="bf-form-input"
                                value={
                                  Object.keys(adminAssignments).find(
                                    (projectId) => String(adminAssignments[projectId]) === String(u.id)
                                  ) || ""
                                }
                                onChange={(e) => handleAssignProjectToUser(e.target.value || null, u.id)}
                              >
                                <option value="">Unassigned</option>
                                {projects.map((p) => (
                                  <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="bf-icon-btn"
                                title="Remove from directory"
                                aria-label="Remove from directory"
                                onClick={() => handleRemoveDirectoryUser(u.id)}
                                style={{ background: "none", border: "1px solid var(--slate-200)", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer" }}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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