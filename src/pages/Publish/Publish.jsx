
// import { useNavigate } from "react-router-dom";
// import {
//   SHOW_SUBMIT_PLUS,
//   SHOW_EDITOR_PLUS,
//   SHOW_ACCESSIBILITY_PLUS,
// } from "../../constants/featureFlags";
// import "./Publish.css";

// /* ════════════════════════════════════════════════════════════
//    DASHBOARD SECTION (existing content, unchanged)
//    ════════════════════════════════════════════════════════════ */
// function DashboardSection() {
//   const metrics = [
//     { label: "Active Projects", value: "18", change: "+3 this month", icon: "📦" },
//     { label: "Titles Published", value: "142", change: "+12 this quarter", icon: "📗" },
//     { label: "Avg. Turnaround", value: "9.4 days", change: "-1.2 days", icon: "⏱️" },
//     { label: "On-Time Rate", value: "94%", change: "+2% vs last month", icon: "✅" },
//   ];

//   const workflows = [
//     { title: "The Future of AI in Publishing", stage: "Design & Layout", owner: "John Doe", status: "On Track", updated: "2h ago" },
//     { title: "Digital Transformation Guide", stage: "Accessibility QA", owner: "Jane Smith", status: "In Review", updated: "5h ago" },
//     { title: "Cloud Computing Essentials", stage: "Editorial Review", owner: "Mike Johnson", status: "Delayed", updated: "1d ago" },
//     { title: "Modern Data Architecture", stage: "Pre-Press", owner: "Sara Lee", status: "On Track", updated: "1d ago" },
//   ];

//   const statusClass = (status) => {
//     switch (status) {
//       case "On Track": return "publish-status-ontrack";
//       case "In Review": return "publish-status-review";
//       case "Delayed": return "publish-status-delayed";
//       default: return "";
//     }
//   };

//   return (
//     <>
//       <div className="publish-metrics-grid">
//         {metrics.map((m, idx) => (
//           <div className="publish-metric-card" key={idx}>
//             <div className="publish-metric-icon">{m.icon}</div>
//             <p className="publish-metric-value">{m.value}</p>
//             <p className="publish-metric-label">{m.label}</p>
//             <p className="publish-metric-change">{m.change}</p>
//           </div>
//         ))}
//       </div>

//       <div className="publish-workflows-section">
//         <div className="publish-workflows-header">
//           <h2 className="publish-workflows-title">Active Workflows</h2>
//           <span className="publish-workflows-count">{workflows.length} in progress</span>
//         </div>

//         <div className="publish-table-wrapper">
//           <table className="publish-table">
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>Stage</th>
//                 <th>Owner</th>
//                 <th>Status</th>
//                 <th>Updated</th>
//               </tr>
//             </thead>
//             <tbody>
//               {workflows.map((w, idx) => (
//                 <tr key={idx}>
//                   <td className="publish-table-title">{w.title}</td>
//                   <td>{w.stage}</td>
//                   <td>{w.owner}</td>
//                   <td>
//                     <span className={`publish-status-badge ${statusClass(w.status)}`}>
//                       {w.status}
//                     </span>
//                   </td>
//                   <td className="publish-table-updated">{w.updated}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="publish-soon-banner">
//         <span className="publish-soon-ico">🚧</span>
//         <div>
//           <p className="publish-soon-ttl">Live Data Coming Soon</p>
//           <p className="publish-soon-msg">
//             This dashboard is currently showing sample data. Live integration
//             with backend publishing workflows will be enabled shortly.
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }

// /* ════════════════════════════════════════════════════════════
//    MAIN PUBLISH+ PAGE
//    ════════════════════════════════════════════════════════════ */
// export default function Publish() {
//   const navigate = useNavigate();

//   return (
//     <div className="publish-page">
//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="publish-sidebar">
//         <div className="publish-logo">
//           <div className="publish-logo-mark">O</div>
//           <div className="publish-logo-text">
//             <span>ORION</span>
//             <small>Publishing Intelligence</small>
//           </div>
//         </div>

//         <nav className="publish-nav">
//           <p className="publish-nav-label">WORKSPACE</p>
//           {SHOW_SUBMIT_PLUS && (
//             <div className="publish-nav-item" onClick={() => navigate("/submit")}>
//               <span className="publish-nav-icon">📑</span>
//               <span>Submit+</span>
//             </div>
//           )}
//           {SHOW_EDITOR_PLUS && (
//             <div className="publish-nav-item" onClick={() => navigate("/editor")}>
//               <span className="publish-nav-icon">📝</span>
//               <span>Editor+</span>
//             </div>
//           )}
//           <div className="publish-nav-item active">
//             <span className="publish-nav-icon">📚</span>
//             <span>Publish+</span>
//             <span className="publish-nav-dot"></span>
//           </div>
//           {SHOW_ACCESSIBILITY_PLUS && (
//             <div className="publish-nav-item" onClick={() => navigate("/remediate-pdf")}>
//               <span className="publish-nav-icon">🔧</span>
//               <span>Accessibility</span>
//             </div>
//           )}
//         </nav>

//         <div className="publish-sidebar-footer">
//           <div className="publish-user-section">
//             <p className="publish-user-email">{sessionStorage.getItem("userEmail")}</p>
//             <button
//               className="publish-back-btn"
//               onClick={() => navigate("/")}
//               title="Back to Home"
//             >
//               ← Back
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────────── */}
//       <main className="publish-main">
//         <div className="publish-container">
//           <div className="publish-header">
//             <h1 className="publish-title">Publishing Intelligence Dashboard</h1>
//             <p className="publish-subtitle">
//               Real-time visibility into publishing workflows across your organization
//             </p>
//           </div>

//           <DashboardSection />
//         </div>
//       </main>
//     </div>
//   );
// }






import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SHOW_SUBMIT_PLUS,
  SHOW_EDITOR_PLUS,
  SHOW_ACCESSIBILITY_PLUS,
} from "../../constants/featureFlags";
import { isAdmin } from "../../utils/auth";
import "./Publish.css";

/* ════════════════════════════════════════════════════════════
   DASHBOARD SECTION (existing content, unchanged)
   ════════════════════════════════════════════════════════════ */
function DashboardSection() {
  const metrics = [
    { label: "Active Projects", value: "18", change: "+3 this month", icon: "📦" },
    { label: "Titles Published", value: "142", change: "+12 this quarter", icon: "📗" },
    { label: "Avg. Turnaround", value: "9.4 days", change: "-1.2 days", icon: "⏱️" },
    { label: "On-Time Rate", value: "94%", change: "+2% vs last month", icon: "✅" },
  ];

  const workflows = [
    { title: "The Future of AI in Publishing", stage: "Design & Layout", owner: "John Doe", status: "On Track", updated: "2h ago" },
    { title: "Digital Transformation Guide", stage: "Accessibility QA", owner: "Jane Smith", status: "In Review", updated: "5h ago" },
    { title: "Cloud Computing Essentials", stage: "Editorial Review", owner: "Mike Johnson", status: "Delayed", updated: "1d ago" },
    { title: "Modern Data Architecture", stage: "Pre-Press", owner: "Sara Lee", status: "On Track", updated: "1d ago" },
  ];

  const statusClass = (status) => {
    switch (status) {
      case "On Track": return "publish-status-ontrack";
      case "In Review": return "publish-status-review";
      case "Delayed": return "publish-status-delayed";
      default: return "";
    }
  };

  return (
    <>
      <div className="publish-metrics-grid">
        {metrics.map((m, idx) => (
          <div className="publish-metric-card" key={idx}>
            <div className="publish-metric-icon">{m.icon}</div>
            <p className="publish-metric-value">{m.value}</p>
            <p className="publish-metric-label">{m.label}</p>
            <p className="publish-metric-change">{m.change}</p>
          </div>
        ))}
      </div>

      <div className="publish-workflows-section">
        <div className="publish-workflows-header">
          <h2 className="publish-workflows-title">Active Workflows</h2>
          <span className="publish-workflows-count">{workflows.length} in progress</span>
        </div>

        <div className="publish-table-wrapper">
          <table className="publish-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Stage</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((w, idx) => (
                <tr key={idx}>
                  <td className="publish-table-title">{w.title}</td>
                  <td>{w.stage}</td>
                  <td>{w.owner}</td>
                  <td>
                    <span className={`publish-status-badge ${statusClass(w.status)}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="publish-table-updated">{w.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="publish-soon-banner">
        <span className="publish-soon-ico">🚧</span>
        <div>
          <p className="publish-soon-ttl">Live Data Coming Soon</p>
          <p className="publish-soon-msg">
            This dashboard is currently showing sample data. Live integration
            with backend publishing workflows will be enabled shortly.
          </p>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PUBLISH+ PAGE
   ════════════════════════════════════════════════════════════ */
export default function Publish() {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="publish-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`publish-sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
        <div className="publish-logo">
          <div className="publish-logo-mark">O</div>
          <div className="publish-logo-text">
            <span>ORION</span>
            <small>Publishing Intelligence</small>
          </div>
        </div>

        <nav className="publish-nav">
          {userIsAdmin ? (
            <>
              <p className="publish-nav-label">WORKSPACE</p>
              {SHOW_SUBMIT_PLUS && (
                <div className="publish-nav-item" onClick={() => navigate("/submit")}>
                  <span className="publish-nav-icon">📑</span>
                  <span>Submit+</span>
                </div>
              )}
              {SHOW_EDITOR_PLUS && (
                <div className="publish-nav-item" onClick={() => navigate("/editor")}>
                  <span className="publish-nav-icon">📝</span>
                  <span>Editor+</span>
                </div>
              )}
              <div className="publish-nav-item active">
                <span className="publish-nav-icon">📚</span>
                <span>Publish+</span>
                <span className="publish-nav-dot"></span>
              </div>
              {SHOW_ACCESSIBILITY_PLUS && (
                <div className="publish-nav-item" onClick={() => navigate("/remediate-pdf")}>
                  <span className="publish-nav-icon">🔧</span>
                  <span>Accessibility</span>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              className="publish-nav-toggle"
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

        <div className="publish-sidebar-footer">
          <div className="publish-user-section">
            <p className="publish-user-email">{sessionStorage.getItem("userEmail")}</p>
            <button
              className="publish-back-btn"
              onClick={() => navigate("/")}
              title="Back to Home"
            >
              <span className="publish-back-icon">←</span>
              <span className="publish-back-label">Back</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="publish-main">
        <div className="publish-container">
          <div className="publish-header">
            <h1 className="publish-title">Publishing Intelligence Dashboard</h1>
            <p className="publish-subtitle">
              Real-time visibility into publishing workflows across your organization
            </p>
          </div>

          <DashboardSection />
        </div>
      </main>
    </div>
  );
}