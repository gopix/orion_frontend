

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { isAdmin } from "../../../utils/auth";
// import "./AccessibilitySelect.css";

// const FILE_TYPES = [
//   { id: "pdf", label: "PDF", icon: "📄", desc: "Portable Document Format" },
//   { id: "epub", label: "EPUB", icon: "📘", desc: "eBook Publication" },
//   { id: "ppt", label: "PPT", icon: "📽️", desc: "PowerPoint Presentation" },
//   { id: "web", label: "Web", icon: "🌐", desc: "Web Pages / HTML Content" },
// ];

// const MIS_TYPE = { id: "mis", label: "MIS", icon: "📊", desc: "Reports & Analytics" };

// const ACTIONS = [
//   { id: "validate", label: "Validate", icon: "✅", desc: "Check compliance against accessibility standards" },
//   { id: "remediate", label: "Remediate", icon: "🛠️", desc: "Automatically fix accessibility issues" },
// ];

// // Where each (fileType, action) combination should go.
// // "web" only supports Validate (its website management dashboard) —
// // it has no Remediate flow, so that action is filtered out in
// // handleActionSelect below before ACTIONS is rendered.
// const ROUTES = {
//   "pdf-remediate": "/remediate-pdf",
//   "pdf-validate": "/validate-pdf",
//   "epub-remediate": "/remediate-epub",
//   "epub-validate": "/validate-epub",
//   "ppt-validate": "/validate-ppt",
//   "ppt-remediate": "/remediate-ppt",
//   "web-validate": "/validate-web",
// };

// export default function AccessibilitySelect() {
//   const navigate = useNavigate();
//   const userIsAdmin = isAdmin();

//   const [fileType, setFileType] = useState(null);   // "pdf" | "epub" | "ppt" | "mis"
//   const [action, setAction]     = useState(null);   // "remediate" | "validate"

//   const fileTypes = userIsAdmin ? [...FILE_TYPES, MIS_TYPE] : FILE_TYPES;

//   // The Web card only ever offers Validate — it has no Remediate flow.
//   const actions = fileType === "web" ? ACTIONS.filter((act) => act.id === "validate") : ACTIONS;

//   const handleFileTypeSelect = (id) => {
//     setFileType(id);
//     setAction(null);

//     // MIS has no Remediate/Validate step — it goes straight to the report.
//     if (id === "mis") {
//       navigate("/mis-pdf");
//     }
//   };

//   const handleActionSelect = (id) => {
//     setAction(id);

//     const route = ROUTES[`${fileType}-${id}`];
//     if (route) navigate(route);
//   };

//   return (
//     <div className="as-page">
//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="as-sidebar">
//         <div className="as-logo">
//           <div className="as-logo-mark">O</div>
//           <div className="as-logo-text">
//             <span>ORION</span>
//             <small>Accessibility & Remediation</small>
//           </div>
//         </div>

//         <div className="as-sidebar-footer">
//           <div className="as-user-section">
//             <p className="as-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="as-back-btn"
//               onClick={() => navigate("/")}
//               title="Back to Home"
//             >
//               ← Back
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="as-main">
//         <div className="as-container">
//           <div className="as-intro">
//             <h1 className="as-title">Accessibility & Remediation</h1>
//             <p className="as-subtitle">
//               Select a file type and an action to get started.
//             </p>
//           </div>

//           <section className="as-step">
//             <p className="as-step-label">Step 1 · File Type</p>
//             <div className={`as-option-grid ${userIsAdmin ? "as-option-grid-5" : "as-option-grid-4"}`}>
//               {fileTypes.map((type) => (
//                 <label
//                   key={type.id}
//                   className={`as-option-card${fileType === type.id ? " as-option-selected" : ""}`}
//                 >
//                   <input
//                     type="radio"
//                     name="as-file-type"
//                     value={type.id}
//                     checked={fileType === type.id}
//                     onChange={() => handleFileTypeSelect(type.id)}
//                     className="as-radio"
//                   />
//                   <span className="as-option-icon">{type.icon}</span>
//                   <span className="as-option-label">{type.label}</span>
//                   <span className="as-option-desc">{type.desc}</span>
//                 </label>
//               ))}
//             </div>
//           </section>

//           {fileType && fileType !== "mis" && (
//             <section className="as-step">
//               <p className="as-step-label">Step 2 · Action</p>
//               <div className={`as-option-grid ${actions.length === 1 ? "as-option-grid-1" : "as-option-grid-2"}`}>
//                 {actions.map((act) => (
//                   <label
//                     key={act.id}
//                     className={`as-option-card${action === act.id ? " as-option-selected" : ""}`}
//                   >
//                     <input
//                       type="radio"
//                       name="as-action"
//                       value={act.id}
//                       checked={action === act.id}
//                       onChange={() => handleActionSelect(act.id)}
//                       className="as-radio"
//                     />
//                     <span className="as-option-icon">{act.icon}</span>
//                     <span className="as-option-label">{act.label}</span>
//                     <span className="as-option-desc">{act.desc}</span>
//                   </label>
//                 ))}
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
import { isAdmin } from "../../../utils/auth";
import "./AccessibilitySelect.css";

const FILE_TYPES = [
  { id: "pdf", label: "PDF", icon: "📄", desc: "Portable Document Format" },
  { id: "epub", label: "EPUB", icon: "📘", desc: "eBook Publication" },
  { id: "ppt", label: "PPT", icon: "📽️", desc: "PowerPoint Presentation" },
  { id: "web", label: "Web", icon: "🌐", desc: "Web Pages / HTML Content" },
];

const MIS_TYPE = { id: "mis", label: "MIS", icon: "📊", desc: "Reports & Analytics" };

const ACTIONS = [
  { id: "validate", label: "Validate", icon: "✅", desc: "Check compliance against accessibility standards" },
  { id: "remediate", label: "Remediate", icon: "🛠️", desc: "Automatically fix accessibility issues" },
];

// Where each (fileType, action) combination should go.
// "web" is handled separately in handleFileTypeSelect — it has no
// Remediate/Validate step of its own, it jumps straight to its dashboard.
const ROUTES = {
  "pdf-remediate": "/remediate-pdf",
  "pdf-validate": "/validate-pdf",
  "epub-remediate": "/remediate-epub",
  "epub-validate": "/validate-epub",
  "ppt-validate": "/validate-ppt",
  "ppt-remediate": "/remediate-ppt",
};

export default function AccessibilitySelect() {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();

  const [fileType, setFileType] = useState(null);   // "pdf" | "epub" | "ppt" | "mis"
  const [action, setAction]     = useState(null);   // "remediate" | "validate"

  const fileTypes = userIsAdmin ? [...FILE_TYPES, MIS_TYPE] : FILE_TYPES;

  const handleFileTypeSelect = (id) => {
    // MIS has no Remediate/Validate step — it goes straight to the report.
    if (id === "mis") {
      setFileType(id);
      setAction(null);
      navigate("/mis-pdf");
      return;
    }

    // Web has no Remediate/Validate step either — it goes straight to its
    // accessibility dashboard, skipping the unnecessary "Validate" card.
    if (id === "web") {
      setFileType(id);
      setAction(null);
      navigate("/validate-web");
      return;
    }

    setFileType(id);
    setAction(null);
  };

  const handleActionSelect = (id) => {
    setAction(id);

    const route = ROUTES[`${fileType}-${id}`];
    if (route) navigate(route);
  };

  return (
    <div className="as-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="as-sidebar">
        <div className="as-logo">
          <div className="as-logo-mark">O</div>
          <div className="as-logo-text">
            <span>ORION</span>
            <small>Accessibility & Remediation</small>
          </div>
        </div>

        <div className="as-sidebar-footer">
          <div className="as-user-section">
            <p className="as-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="as-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              ← Back
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="as-main">
        <div className="as-container">
          <div className="as-intro">
            <h1 className="as-title">Accessibility & Remediation</h1>
            <p className="as-subtitle">
              Select a file type and an action to get started.
            </p>
          </div>

          <section className="as-step">
            <p className="as-step-label">Step 1 · File Type</p>
            <div className={`as-option-grid ${userIsAdmin ? "as-option-grid-5" : "as-option-grid-4"}`}>
              {fileTypes.map((type) => (
                <label
                  key={type.id}
                  className={`as-option-card${fileType === type.id ? " as-option-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="as-file-type"
                    value={type.id}
                    checked={fileType === type.id}
                    onChange={() => handleFileTypeSelect(type.id)}
                    className="as-radio"
                  />
                  <span className="as-option-icon">{type.icon}</span>
                  <span className="as-option-label">{type.label}</span>
                  <span className="as-option-desc">{type.desc}</span>
                </label>
              ))}
            </div>
          </section>

          {fileType && fileType !== "mis" && fileType !== "web" && (
            <section className="as-step">
              <p className="as-step-label">Step 2 · Action</p>
              <div className="as-option-grid as-option-grid-2">
                {ACTIONS.map((act) => (
                  <label
                    key={act.id}
                    className={`as-option-card${action === act.id ? " as-option-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="as-action"
                      value={act.id}
                      checked={action === act.id}
                      onChange={() => handleActionSelect(act.id)}
                      className="as-radio"
                    />
                    <span className="as-option-icon">{act.icon}</span>
                    <span className="as-option-label">{act.label}</span>
                    <span className="as-option-desc">{act.desc}</span>
                  </label>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}