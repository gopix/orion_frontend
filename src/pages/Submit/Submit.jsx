

// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   SHOW_EDITOR_PLUS,
//   SHOW_PUBLISH_PLUS,
//   SHOW_ACCESSIBILITY_PLUS,
// } from "../../constants/featureFlags";
// import { isAdmin } from "../../utils/auth";
// import "./Submit.css";

// export default function Submit() {
//   const navigate = useNavigate();
//   const userIsAdmin = isAdmin();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const [docFile, setDocFile] = useState(null);
//   const [dragOver, setDragOver] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [validationResult, setValidationResult] = useState(null);

//   const docInputRef = useRef(null);

//   const validateFile = (file) => {
//     if (!file) return null;
//     const validTypes = [".doc", ".docx", ".pdf"];
//     const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
//     if (!isValid) {
//       setUploadError("Only .doc, .docx, and .pdf files are supported.");
//       return null;
//     }
//     if (file.size > 50 * 1024 * 1024) {
//       setUploadError("File exceeds the 50 MB limit. Please upload a smaller file.");
//       return null;
//     }
//     return file;
//   };

//   const applyFile = (file) => {
//     const valid = validateFile(file);
//     if (!valid) return;
//     setDocFile(valid);
//     setUploadError("");
//     setValidationResult(null);
//   };

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) applyFile(file);
//     e.target.value = "";
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (file) applyFile(file);
//   };

//   const handleRemove = (e) => {
//     e.stopPropagation();
//     setDocFile(null);
//     setUploadError("");
//     setValidationResult(null);
//   };

//   const formatBytes = (bytes) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   const handleValidate = () => {
//     if (!docFile) {
//       setUploadError("Please upload a file first.");
//       return;
//     }
//     // Simulate validation
//     setValidationResult({
//       status: "success",
//       message: "Validation completed successfully",
//       metrics: {
//         originality: 98,
//         compliance: 95,
//         readability: 92,
//         formatting: 87
//       },
//       issues: [
//         { type: "warning", text: "Document contains 3 inconsistent formatting styles" },
//         { type: "warning", text: "Some references are not properly cited" }
//       ]
//     });
//   };

//   return (
//     <div className="submit-page">
//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className={`submit-sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
//         <div className="submit-logo">
//           <div className="submit-logo-mark">O</div>
//           <div className="submit-logo-text">
//             <span>ORION</span>
//             <small>Pre-Editorial Validation</small>
//           </div>
//         </div>

//         <nav className="submit-nav">
//           {userIsAdmin ? (
//             <>
//               <p className="submit-nav-label">WORKSPACE</p>
//               <div className="submit-nav-item active">
//                 <span className="submit-nav-icon">📑</span>
//                 <span>Submit+</span>
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
//         <div className="submit-container">
//           {!docFile ? (
//             <section className="submit-upload-section">
//               <div className="submit-upload-wrapper">
//                 <div className="submit-upload-icon">📤</div>
//                 <h1 className="submit-upload-title">Submit Document for Validation</h1>
//                 <p className="submit-upload-desc">
//                   Upload your manuscript or document for pre-editorial validation
//                 </p>
//                 <p className="submit-upload-subdesc">
//                   Maximum file size: 50 MB. Supports .doc, .docx, .pdf files.
//                 </p>

//                 <div
//                   className={`submit-drop-zone ${dragOver ? "submit-drag-over" : ""}`}
//                   onDragOver={() => setDragOver(true)}
//                   onDragLeave={() => setDragOver(false)}
//                   onDrop={handleDrop}
//                   onClick={() => docInputRef.current?.click()}
//                 >
//                   <div className="submit-drop-content">
//                     <div className="submit-drop-icon">📁</div>
//                     <p className="submit-drop-text">Drop your document here</p>
//                     <p className="submit-drop-subtext">or <strong>click to select</strong></p>
//                   </div>
//                 </div>

//                 <input
//                   ref={docInputRef}
//                   type="file"
//                   accept=".doc,.docx,.pdf"
//                   onChange={handleFileSelect}
//                   style={{ display: "none" }}
//                 />

//                 {uploadError && (
//                   <div className="submit-error-banner">
//                     <span className="submit-error-ico">⚠</span>
//                     <div>
//                       <p className="submit-error-ttl">Upload Failed</p>
//                       <p className="submit-error-msg">{uploadError}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </section>
//           ) : (
//             <section className="submit-work-section">
//               <div className="submit-work-container">
//                 <div className="submit-file-management-section">
//                   <div className="submit-fm-header">
//                     <h3 className="submit-fm-title">Step 1: Document Analysis</h3>
//                   </div>

//                   {docFile && (
//                     <div className="submit-fm-content">
//                       <div className="submit-file-card">
//                         <div className="submit-file-icon">📄</div>
//                         <div className="submit-file-info">
//                           <p className="submit-file-name">{docFile.name}</p>
//                           <p className="submit-file-size">{formatBytes(docFile.size)}</p>
//                         </div>
//                         <button
//                           className="submit-file-remove"
//                           onClick={handleRemove}
//                           title="Remove file"
//                         >
//                           ✕
//                         </button>
//                       </div>

//                       <button
//                         className="submit-btn"
//                         onClick={handleValidate}
//                       >
//                         <span className="submit-btn-icon">✓</span>
//                         Validate Document
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {validationResult && (
//                   <section className="submit-results-section">
//                     <div className="submit-results-header">
//                       <h3 className="submit-results-title">Validation Results</h3>
//                       <p className="submit-results-desc">
//                         Pre-editorial validation analysis complete
//                       </p>
//                     </div>

//                     {validationResult.status === "success" && (
//                       <div className="submit-success-banner">
//                         <span className="submit-banner-icon">✓</span>
//                         <div className="submit-banner-content">
//                           <p className="submit-banner-title">Validation Complete</p>
//                           <p className="submit-banner-message">{validationResult.message}</p>
//                         </div>
//                       </div>
//                     )}

//                     <div className="submit-metrics-section">
//                       <h4 className="submit-metrics-title">Quality Metrics</h4>
//                       <div className="submit-metrics-grid">
//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Originality</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.originality}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.originality}%</div>
//                         </div>

//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Compliance</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.compliance}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.compliance}%</div>
//                         </div>

//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Readability</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.readability}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.readability}%</div>
//                         </div>

//                         <div className="submit-metric-card">
//                           <div className="submit-metric-label">Formatting</div>
//                           <div className="submit-metric-bar">
//                             <div 
//                               className="submit-metric-fill" 
//                               style={{ width: `${validationResult.metrics.formatting}%` }}
//                             ></div>
//                           </div>
//                           <div className="submit-metric-value">{validationResult.metrics.formatting}%</div>
//                         </div>
//                       </div>
//                     </div>

//                     {validationResult.issues && validationResult.issues.length > 0 && (
//                       <div className="submit-issues-section">
//                         <h4 className="submit-issues-title">Found Issues</h4>
//                         <div className="submit-issues-list">
//                           {validationResult.issues.map((issue, idx) => (
//                             <div key={idx} className={`submit-issue-item submit-issue-${issue.type}`}>
//                               <span className="submit-issue-icon">⚠️</span>
//                               <p className="submit-issue-text">{issue.text}</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     <div className="submit-action-row">
//                       <button 
//                         className="submit-action-btn submit-action-primary"
//                         onClick={() => setValidationResult(null)}
//                       >
//                         <span className="submit-btn-icon">🔄</span> Validate Another
//                       </button>
//                       <button 
//                         className="submit-action-btn submit-action-secondary"
//                         onClick={() => setDocFile(null)}
//                       >
//                         <span className="submit-btn-icon">✕</span> Close
//                       </button>
//                     </div>
//                   </section>
//                 )}
//               </div>
//             </section>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }




import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SHOW_EDITOR_PLUS,
  SHOW_PUBLISH_PLUS,
  SHOW_ACCESSIBILITY_PLUS,
} from "../../constants/featureFlags";
import { isAdmin } from "../../utils/auth";
import "./Submit.css";

/* ── Dummy seed data (no API yet) ─────────────────────────────── */
const INITIAL_PROJECTS = [
  { id: 1, title: "UPSC GS Paper 1", stage: "Review", sme: "Dr. Sharma", deadline: "Jul 10", overdue: true, progress: 72 },
  { id: 2, title: "SSC CGL Mathematics", stage: "Drafting", sme: "Prof. Gupta", deadline: "Jul 25", overdue: false, progress: 45 },
  { id: 3, title: "Class 10 Science NCERT+", stage: "Outline", sme: "Ms. Verma", deadline: "Aug 5", overdue: false, progress: 20 },
  { id: 4, title: "JEE Advanced Chemistry", stage: "Export Ready", sme: "Dr. Mehta", deadline: "Done", overdue: false, progress: 100 },
  { id: 5, title: "NEET Biology Vol.2", stage: "Overdue", sme: "Dr. Singh", deadline: "Jun 28", overdue: true, progress: 58 },
];

const INITIAL_APPROVALS = [
  { id: 1, title: "Ch. 4 Draft — UPSC GS1", status: "Awaiting SME", type: "review", detail: "Dr. Sharma left 3 open comments about terminology consistency in Chapter 4. Resolve before the outline can move to drafting." },
  { id: 2, title: "Outline v2 — SSC CGL Math", status: "Awaiting Editor", type: "review", detail: "The editor flagged 2 sections that need more worked examples before this outline can be approved." },
  { id: 3, title: "Final Export — JEE Chemistry", status: "Approved", type: "download", detail: "JEE_Advanced_Chemistry_Final.pdf", size: "12.4 MB" },
];

const SME_ACTIVITY = [
  { initials: "DS", color: "purple", text: <><strong>Dr. Sharma</strong> added 3 interview notes</>, meta: "UPSC GS1 · 2 hours ago" },
  { initials: "PG", color: "green", text: <><strong>Prof. Gupta</strong> approved Chapter 2 outline</>, meta: "SSC CGL Math · Yesterday" },
  { initials: "MV", color: "blue", text: <><strong>Ms. Verma</strong> flagged a concept gap</>, meta: "Class 10 Science · 2 days ago" },
];

const STEP_LABELS = ["Project Basics", "Audience & Format", "Subject Scope", "Collaborators"];

const EMPTY_FORM = {
  title: "",
  category: "Exam Preparation",
  description: "",
  targetDate: "",
  audience: "",
  language: "English",
  pages: "",
  chapters: "",
  format: "Word + PDF",
  deadline: "",
  subject: "",
  topics: "",
  difficulty: "Intermediate",
  references: "",
  sme: "",
  editor: "",
  reviewerEmail: "",
  notes: "",
};

const stageChipClass = (stage) => {
  switch (stage) {
    case "Review": return "bf-chip-review";
    case "Drafting": return "bf-chip-progress";
    case "Outline": return "bf-chip-draft";
    case "Export Ready": return "bf-chip-complete";
    case "Overdue": return "bf-chip-overdue";
    default: return "bf-chip-draft";
  }
};

export default function Submit() {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stepError, setStepError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  const [reviewModal, setReviewModal] = useState(null); // approval object or null

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const goToNewProject = () => {
    setStep(1);
    setForm(EMPTY_FORM);
    setStepError("");
    setActiveTab("new-project");
  };

  const validateStep = () => {
    if (step === 1 && !form.title.trim()) return "Book title is required.";
    if (step === 2 && !form.audience.trim()) return "Target audience is required.";
    if (step === 4 && !form.sme.trim()) return "Please assign at least one SME.";
    return "";
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError("");
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStepError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleCreateProject = () => {
    const err = validateStep();
    if (err) { setStepError(err); return; }

    const newProject = {
      id: Date.now(),
      title: form.title.trim(),
      stage: "Outline",
      sme: form.sme.trim(),
      deadline: form.deadline || "Not set",
      overdue: false,
      progress: 0,
    };

    setProjects((p) => [newProject, ...p]);
    setForm(EMPTY_FORM);
    setStep(1);
    setStepError("");
    setSuccessBanner(`"${newProject.title}" was created and added to your pipeline.`);
    setActiveTab("dashboard");
    window.setTimeout(() => setSuccessBanner(""), 4500);
  };

  const openReview = (item) => setReviewModal(item);
  const closeReview = () => setReviewModal(null);

  const resolveApproval = (id, newStatus) => {
    setApprovals((list) => list.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    setReviewModal(null);
  };

  const handleDownload = (item) => {
    const content = `BookForge — dummy export\n\nFile: ${item.detail}\nSize: ${item.size}\nStatus: ${item.status}\nGenerated: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (item.detail || "export").replace(/\.[^/.]+$/, "") + ".txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const activeProjects = projects.length;
  const pendingReviews = projects.filter((p) => p.stage === "Review").length + approvals.filter(a => a.status.startsWith("Awaiting")).length;

  return (
    <div className="submit-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`submit-sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
        <div className="submit-logo">
          <div className="submit-logo-mark">O</div>
          <div className="submit-logo-text">
            <span>ORION</span>
            <small>BookForge</small>
          </div>
        </div>

        <nav className="submit-nav">
          {userIsAdmin ? (
            <>
              <p className="submit-nav-label">WORKSPACE</p>
              <div className="submit-nav-item active">
                <span className="submit-nav-icon">📑</span>
                <span>BookForge</span>
                <span className="submit-nav-dot"></span>
              </div>
              {SHOW_EDITOR_PLUS && (
                <div className="submit-nav-item" onClick={() => navigate("/editor")}>
                  <span className="submit-nav-icon">📝</span>
                  <span>Editor+</span>
                </div>
              )}
              {SHOW_PUBLISH_PLUS && (
                <div className="submit-nav-item" onClick={() => navigate("/publish")}>
                  <span className="submit-nav-icon">📚</span>
                  <span>Publish+</span>
                </div>
              )}
              {SHOW_ACCESSIBILITY_PLUS && (
                <div className="submit-nav-item" onClick={() => navigate("/remediate-pdf")}>
                  <span className="submit-nav-icon">🔧</span>
                  <span>Accessibility</span>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              className="submit-nav-toggle"
              onClick={() => setSidebarCollapsed((c) => !c)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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

          <div className="bf-tabs">
            <button
              className={`bf-tab${activeTab === "dashboard" ? " active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className={`bf-tab${activeTab === "new-project" ? " active" : ""}`}
              onClick={goToNewProject}
            >
              ➕ New Book Project
            </button>
          </div>

          {activeTab === "dashboard" ? (
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
                  <div className="bf-kpi-label">Chapters Drafted</div>
                  <div className="bf-kpi-value">84</div>
                  <div className="bf-kpi-sub">This month</div>
                </div>
                <div className="bf-kpi-card bf-kpi-navy">
                  <div className="bf-kpi-label">SME Sessions</div>
                  <div className="bf-kpi-value">5</div>
                  <div className="bf-kpi-sub">2 awaiting capture</div>
                </div>
              </div>

              <div className="bf-two-col">
                <div className="bf-card">
                  <div className="bf-card-title">📋 Project Pipeline</div>
                  <div className="bf-table-wrap">
                    <table className="bf-table">
                      <thead>
                        <tr>
                          <th>Book Title</th>
                          <th>Stage</th>
                          <th>SME</th>
                          <th>Deadline</th>
                          <th>Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p) => (
                          <tr key={p.id}>
                            <td><strong>{p.title}</strong></td>
                            <td><span className={`bf-chip ${stageChipClass(p.stage)}`}>{p.stage}</span></td>
                            <td>{p.sme || "Unassigned"}</td>
                            <td className={p.overdue ? "bf-deadline-overdue" : ""}>{p.deadline}</td>
                            <td>
                              <div className="bf-progress-wrap">
                                <div
                                  className={`bf-progress-bar${p.progress === 100 ? " complete" : p.overdue ? " overdue" : ""}`}
                                  style={{ width: `${p.progress}%` }}
                                ></div>
                              </div>
                              <div className={`bf-progress-label${p.overdue ? " overdue" : p.progress === 100 ? " complete" : ""}`}>{p.progress}%</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bf-side-col">
                  <div className="bf-card">
                    <div className="bf-card-title">⏳ Pending Approvals</div>
                    <div className="bf-approval-list">
                      {approvals.map((a) => (
                        <div className="bf-approval-row" key={a.id}>
                          <span className="bf-approval-title">{a.title}</span>
                          <div className="bf-approval-actions">
                            <span className={`bf-chip ${a.status === "Approved" ? "bf-chip-complete" : "bf-chip-review"}`}>{a.status}</span>
                            {a.type === "review" ? (
                              <button className="bf-btn bf-btn-sm bf-btn-primary" onClick={() => openReview(a)}>Review</button>
                            ) : (
                              <button className="bf-btn bf-btn-sm bf-btn-secondary" onClick={() => handleDownload(a)}>Download</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bf-card">
                    <div className="bf-card-title">🧠 Recent SME Activity</div>
                    <div className="bf-activity-list">
                      {SME_ACTIVITY.map((s, i) => (
                        <div className="bf-activity-row" key={i}>
                          <span className={`bf-avatar bf-avatar-${s.color}`}>{s.initials}</span>
                          <div>
                            <p className="bf-activity-text">{s.text}</p>
                            <span className="bf-activity-meta">{s.meta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bf-wizard">
              <div className="bf-steps">
                {STEP_LABELS.map((label, i) => {
                  const n = i + 1;
                  return (
                    <div className="bf-step" key={label}>
                      <div className={`bf-step-circle${n < step ? " done" : ""}${n === step ? " active" : ""}`}>
                        {n < step ? "✓" : n}
                      </div>
                      <div className={`bf-step-label${n <= step ? " active" : ""}`}>{label}</div>
                      {n < 4 && <div className={`bf-step-connector${n < step ? " done" : ""}`}></div>}
                    </div>
                  );
                })}
              </div>

              <div className="bf-card bf-wizard-card">
                <div className="bf-card-title">Step {step}: {STEP_LABELS[step - 1]}</div>

                {step === 1 && (
                  <>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Book Title *</label>
                        <input className="bf-form-input" value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. SSC CGL Mathematics Complete Guide" />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Category *</label>
                        <select className="bf-form-input" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                          <option>Exam Preparation</option>
                          <option>Academic / School</option>
                          <option>Professional / Technical</option>
                        </select>
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group bf-form-group-full">
                        <label className="bf-form-label">Brief Description</label>
                        <textarea className="bf-form-input bf-textarea" rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="What is this book about?" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Target Publish Date</label>
                        <input type="date" className="bf-form-input" value={form.targetDate} onChange={(e) => updateField("targetDate", e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Target Audience *</label>
                        <input className="bf-form-input" value={form.audience} onChange={(e) => updateField("audience", e.target.value)} placeholder="e.g. SSC CGL aspirants, graduates" />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Language *</label>
                        <select className="bf-form-input" value={form.language} onChange={(e) => updateField("language", e.target.value)}>
                          <option>English</option>
                          <option>Hindi</option>
                          <option>Bilingual (En + Hi)</option>
                        </select>
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Expected Length (pages)</label>
                        <input className="bf-form-input" value={form.pages} onChange={(e) => updateField("pages", e.target.value)} placeholder="e.g. 480" />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Chapter Count</label>
                        <input className="bf-form-input" value={form.chapters} onChange={(e) => updateField("chapters", e.target.value)} placeholder="e.g. 24" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Output Format</label>
                        <select className="bf-form-input" value={form.format} onChange={(e) => updateField("format", e.target.value)}>
                          <option>Word + PDF</option>
                          <option>Structured Chapter Package</option>
                          <option>EPUB Ready</option>
                        </select>
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Submission Deadline</label>
                        <input type="date" className="bf-form-input" value={form.deadline} onChange={(e) => updateField("deadline", e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Primary Subject</label>
                        <input className="bf-form-input" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} placeholder="e.g. Quantitative Aptitude" />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Difficulty Level</label>
                        <select className="bf-form-input" value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value)}>
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group bf-form-group-full">
                        <label className="bf-form-label">Key Topics</label>
                        <textarea className="bf-form-input bf-textarea" rows={2} value={form.topics} onChange={(e) => updateField("topics", e.target.value)} placeholder="Comma-separated, e.g. Algebra, Geometry, Data Interpretation" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group bf-form-group-full">
                        <label className="bf-form-label">Reference Materials</label>
                        <textarea className="bf-form-input bf-textarea" rows={2} value={form.references} onChange={(e) => updateField("references", e.target.value)} placeholder="Syllabus links, prior editions, source notes..." />
                      </div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Subject Matter Expert (SME) *</label>
                        <input className="bf-form-input" value={form.sme} onChange={(e) => updateField("sme", e.target.value)} placeholder="e.g. Dr. Sharma" />
                      </div>
                      <div className="bf-form-group">
                        <label className="bf-form-label">Editor</label>
                        <input className="bf-form-input" value={form.editor} onChange={(e) => updateField("editor", e.target.value)} placeholder="e.g. Prof. Gupta" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label className="bf-form-label">Reviewer Email</label>
                        <input type="email" className="bf-form-input" value={form.reviewerEmail} onChange={(e) => updateField("reviewerEmail", e.target.value)} placeholder="reviewer@example.com" />
                      </div>
                    </div>
                    <div className="bf-form-row">
                      <div className="bf-form-group bf-form-group-full">
                        <label className="bf-form-label">Team Notes</label>
                        <textarea className="bf-form-input bf-textarea" rows={2} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Anything the team should know before kickoff" />
                      </div>
                    </div>
                  </>
                )}

                {stepError && <p className="bf-step-error">{stepError}</p>}

                <div className="bf-step-actions">
                  <button className="bf-btn bf-btn-secondary" onClick={handleBack} disabled={step === 1}>← Back</button>
                  {step < 4 ? (
                    <button className="bf-btn bf-btn-primary" onClick={handleNext}>Next: {STEP_LABELS[step]} →</button>
                  ) : (
                    <button className="bf-btn bf-btn-primary" onClick={handleCreateProject}>Create Project ✓</button>
                  )}
                </div>
                <div className="bf-annotation">Auto-saved as draft · Step {step} of 4</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {reviewModal && (
        <div className="bf-modal-overlay" onClick={closeReview}>
          <div className="bf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bf-modal-header">
              <h3>{reviewModal.title}</h3>
              <button className="bf-modal-close" onClick={closeReview}>✕</button>
            </div>
            <p className="bf-modal-body">{reviewModal.detail}</p>
            <div className="bf-modal-actions">
              <button className="bf-btn bf-btn-secondary" onClick={() => resolveApproval(reviewModal.id, "Changes Requested")}>Request Changes</button>
              <button className="bf-btn bf-btn-primary" onClick={() => resolveApproval(reviewModal.id, "Approved")}>Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}