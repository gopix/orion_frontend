
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitManuscript } from "../../services/apiServices";
import "./ValidatePdf.css";

export default function ValidatePdf() {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const pdfInputRef = useRef(null);

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) return alert("Please upload a PDF file");
    setPdfFile(file);
    setSubmitResult(null);
    setSubmitError("");
  };

  // ── POST /api/v1/submit/manuscripts ────────────────────────
  const handleSubmit = async () => {
    if (!title.trim()) return alert("Please enter the manuscript title");
    if (!author.trim()) return alert("Please enter the author name");
    const orgIdNum = parseInt(organizationId, 10);
    if (!organizationId.toString().trim() || isNaN(orgIdNum)) return alert("Please enter a valid numeric Organization ID");
    if (!pdfFile) return alert("Please upload a PDF file");

    setSubmitting(true);
    setSubmitResult(null);
    setSubmitError("");

    try {
      const response = await submitManuscript(pdfFile, title, author, orgIdNum);
      if (!response.ok) {
        // Try to extract the real error message from the backend response
        let errMsg = `Server error: ${response.status}`;
        try {
          const errBody = await response.json();
          errMsg = errBody.detail
            || errBody.message
            || errBody.error
            || JSON.stringify(errBody);
        } catch {
          try {
            const errText = await response.text();
            if (errText) errMsg = errText;
          } catch { /* ignore */ }
        }
        throw new Error(errMsg);
      }
      const data = await response.json();
      setSubmitResult(data);
    } catch (err) {
      setSubmitError(err.message || "Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tp-page">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="tp-sidebar">
        <div className="tp-logo">
          <span>Orion</span>
          <small>Accessibility & Remediation</small>
        </div>
        <nav className="tp-nav">
          <p className="tp-nav-section">Accessibility & Remediation</p>
          <div className="tp-nav-item" onClick={() => navigate("/template")}>
            <span className="tp-nav-icon">📋</span> Template
            <span className="tp-chevron">▸</span>
          </div>
          <div className="tp-nav-item active">
            <span className="tp-nav-icon">✅</span> Validate PDF
          </div>
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="tp-main">
        <div className="tp-topbar">
          <div className="tp-breadcrumb">
            <span>Accessibility & Remediation</span>
            <span className="tp-sep">›</span>
            <span className="tp-active">Validate PDF</span>
          </div>
        </div>

        <div className="tp-content">
          <section className="tp-validate-section">
            <h2 className="tp-section-title" style={{ marginBottom: 6 }}>Submit Manuscript</h2>
            <p className="tp-section-sub" style={{ marginBottom: 20 }}>
              Fill in the details and upload your PDF to submit the manuscript.
            </p>

            {/* Manuscript detail fields */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="tp-label">Title *</label>
                <input
                  className="tp-input"
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="Manuscript title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="tp-label">Author *</label>
                <input
                  className="tp-input"
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="Author name"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="tp-label">Organization ID *</label>
                <input
                  className="tp-input"
                  type="number"
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="e.g. 1"
                  value={organizationId}
                  onChange={e => setOrganizationId(e.target.value)}
                />
              </div>
            </div>

            {/* PDF Upload */}
            <input ref={pdfInputRef} type="file" accept=".pdf"
              style={{ display: "none" }} onChange={handlePdfSelect} />

            <div className="tp-drop-zone" onClick={() => pdfInputRef.current.click()}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <p>{pdfFile ? `✅ ${pdfFile.name}` : "Click to upload PDF"}</p>
              <small>Only .pdf files accepted</small>
            </div>

            {/* Submit Button */}
            <button
              className="tp-btn tp-btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "⏳ Submitting..." : "📨 Submit Manuscript"}
            </button>

            {/* Result */}
            {submitError && (
              <div className="tp-validation-result"
                style={{ marginTop: 16, borderColor: "#fca5a5" }}>
                <p className="tp-result-title" style={{ color: "#dc2626" }}>
                  ⚠ {submitError}
                </p>
              </div>
            )}

            {submitResult && !submitError && (
              <div className="tp-validation-result"
                style={{ marginTop: 16, borderColor: "#86efac", background: "#f0fdf4" }}>
                <p className="tp-result-title" style={{ color: "#15803d", fontSize: 15 }}>
                  🎉 Thank you! Your file has been submitted successfully.
                </p>
                <div style={{ padding: "8px 14px 14px", fontSize: 13, color: "#166534", lineHeight: 1.7 }}>
                  Please check back after <strong>2 minutes</strong> for the status update.<br />
                  Our system is processing your manuscript and the results will be available shortly.
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
