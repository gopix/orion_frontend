


import { useEffect, useRef, useState } from "react";
import {
  getAssignedBookForgeProjectsForSme,
  getBookForgeProjects,
  getBookForgeProjectById,
  getSmeQaEntries,
  createSmeQaEntry,
  updateSmeQaEntry,
  deleteSmeQaEntry,
  clearSmeQaEntries,
  submitSmeQaSession,
  getBookForgeDocuments,
  updateBookForgeProject,
} from "../../../services/apiServices";
import { isAdmin } from "../../../utils/auth";
import "./SmeCapture.css";
 
const EMPTY_ENTRY_FORM = { question: "", answer: "" };
 
// Compares book_status values ignoring case/whitespace differences — an
// exact string match against "SME Review" was silently hiding every
// project from the SME whenever the backend echoed the status back with
// different casing/whitespace.
const normStatus = (s) => (s || "").trim().toLowerCase();

export default function SmeCapture() {
  const admin = isAdmin();
  const smeLabel = sessionStorage.getItem("userEmail") || "";
  const createdBy = Number(sessionStorage.getItem("token")) || 0;
 
  /* ── Step 1: project selection ─────────────────────────────── */
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProjectsLoading(true);
      setProjectsError("");
      try {
        // Admins browse every project; SMEs only see projects assigned
        // to them (see TODO note in apiServices.js — filtering is not
        // yet real on the backend, so today this still returns every
        // active project for SMEs too).
        const res = admin ? await getBookForgeProjects(0, 100) : await getAssignedBookForgeProjectsForSme();
        let rows = Array.isArray(res?.data) ? res.data.filter((p) => !p.is_deleted) : [];
        // A plain SME only has work to do on projects the User has
        // actually submitted for review — everything else (still
        // being drafted, or already sent back) isn't actionable for
        // them. Admins keep seeing every project, as before.
        // Confirmed against the real API (2026-08-26): book_status only
        // ever contains snake_case values set automatically by the
        // backend as a side effect of specific actions — "sources_added"
        // after document upload, "knowledge_ready" after POST
        // /projects/{id}/process. There is no "SME Review" status; that
        // was never a real backend value, which is why this list was
        // always empty.
        if (!admin) rows = rows.filter((p) => normStatus(p.book_status) === normStatus("knowledge_ready"));
        if (!cancelled) setProjects(rows);
      } catch (err) {
        console.error("Failed to load projects for SME Capture:", err);
        if (!cancelled) setProjectsError("Failed to load projects. Please try again.");
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  /* ── Step 2: Q&A capture for the selected project ──────────── */
  const [qaEntries, setQaEntries] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");
 
  const [entryForm, setEntryForm] = useState(EMPTY_ENTRY_FORM);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [savingEntry, setSavingEntry] = useState(false);
  const [entryFormError, setEntryFormError] = useState("");
  const [deletingEntryId, setDeletingEntryId] = useState(null);
 
  const [projectDocs, setProjectDocs] = useState([]);
  const [projectDocsLoading, setProjectDocsLoading] = useState(false);
 
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [interviewFile, setInterviewFile] = useState(null);
  const interviewFileInputRef = useRef(null);
 
  const loadQaEntries = async (projectId) => {
    setQaLoading(true);
    setQaError("");
    try {
      const res = await getSmeQaEntries(projectId);
      setQaEntries(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load SME Q&A entries:", err);
      setQaError("Failed to load captured questions.");
    } finally {
      setQaLoading(false);
    }
  };
 
  const loadProjectDocs = async (projectId) => {
    setProjectDocsLoading(true);
    try {
      const res = await getBookForgeDocuments(projectId, 0, 100);
      const rows = Array.isArray(res?.data) ? res.data : [];
      setProjectDocs(rows.filter((d) => !d.is_deleted));
    } catch (err) {
      console.error("Failed to load project documents:", err);
      setProjectDocs([]);
    } finally {
      setProjectDocsLoading(false);
    }
  };
 
  const selectProject = (project) => {
    setSelectedProject(project);
    setEntryForm(EMPTY_ENTRY_FORM);
    setEditingEntryId(null);
    setEntryFormError("");
    setSubmitError("");
    setSubmitSuccess("");
    setInterviewFile(null);
    loadQaEntries(project.id);
    loadProjectDocs(project.id);
  };
 
  const backToProjects = () => {
    setSelectedProject(null);
    setQaEntries([]);
    setProjectDocs([]);
  };
 
  const startNewEntry = () => {
    setEditingEntryId(null);
    setEntryForm(EMPTY_ENTRY_FORM);
    setEntryFormError("");
  };
 
  const startEditEntry = (entry) => {
    setEditingEntryId(entry.id);
    setEntryForm({ question: entry.question, answer: entry.answer });
    setEntryFormError("");
  };
 
  const handleSaveEntry = async () => {
    if (!entryForm.question.trim()) {
      setEntryFormError("Please enter a question.");
      return;
    }
    if (!entryForm.answer.trim()) {
      setEntryFormError("Please enter an answer.");
      return;
    }
    setSavingEntry(true);
    setEntryFormError("");
    try {
      if (editingEntryId) {
        await updateSmeQaEntry(selectedProject.id, editingEntryId, entryForm);
      } else {
        await createSmeQaEntry(selectedProject.id, entryForm, createdBy);
      }
      await loadQaEntries(selectedProject.id);
      setEntryForm(EMPTY_ENTRY_FORM);
      setEditingEntryId(null);
    } catch (err) {
      console.error("Failed to save Q&A entry:", err);
      setEntryFormError("Failed to save. Please try again.");
    } finally {
      setSavingEntry(false);
    }
  };
 
  const handleDeleteEntry = async (entry) => {
    const confirmed = window.confirm("Delete this question and answer? This cannot be undone.");
    if (!confirmed) return;
    setDeletingEntryId(entry.id);
    try {
      await deleteSmeQaEntry(selectedProject.id, entry.id);
      await loadQaEntries(selectedProject.id);
      if (editingEntryId === entry.id) {
        setEditingEntryId(null);
        setEntryForm(EMPTY_ENTRY_FORM);
      }
    } catch (err) {
      console.error("Failed to delete Q&A entry:", err);
      setQaError("Failed to delete the entry. Please try again.");
    } finally {
      setDeletingEntryId(null);
    }
  };
 
  const handleInterviewFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setInterviewFile(file || null);
    setSubmitError("");
  };
 
  const handleClearInterviewFile = () => {
    setInterviewFile(null);
  };
 
  const handleSubmitSession = async () => {
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitting(true);
    try {
      const res = await submitSmeQaSession(
        { id: selectedProject.id, title: selectedProject.title },
        qaEntries,
        createdBy,
        smeLabel,
        interviewFile
      );
      if (res?.errors && res.errors.length > 0) {
        throw new Error(res.errors[0]?.message || "Failed to submit interview.");
      }
      setSubmitSuccess("Interview submitted — the PDF now appears in this project's Documents.");
      const usedTypedEntries = !interviewFile;
      setInterviewFile(null);
      if (usedTypedEntries) {
        await clearSmeQaEntries(selectedProject.id);
        await loadQaEntries(selectedProject.id);
      }
      loadProjectDocs(selectedProject.id);
      window.setTimeout(() => setSubmitSuccess(""), 5000);
    } catch (err) {
      console.error("Failed to submit SME Q&A session:", err);
      setSubmitError(err.message || "Failed to submit the interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Send Back to User ───────────────────────────────────────
     Once the SME's work is done, this hands the project back:
     book_status moves to "Guidelines", which pulls it out of this
     SME's actionable list and surfaces it under the User's
     Guidelines → "Returned from SME" tab. */
  const [sendingBack, setSendingBack] = useState(false);
  const [sendBackError, setSendBackError] = useState("");

  const handleSendBackToUser = async () => {
    if (!selectedProject) return;
    const confirmed = window.confirm(
      `Send "${selectedProject.title}" back to the User? It will move to their Guidelines screen.`
    );
    if (!confirmed) return;
    setSendingBack(true);
    setSendBackError("");
    try {
      // Sending book_status on its own leaves the backend with nothing
      // else it recognises to update (same "No fields provided to
      // update" issue the Submit-to-SME flow hit) — so send it
      // alongside the project's other known fields, same pattern
      // Submit.jsx's handleSubmitToSme uses.
      const res = await updateBookForgeProject(selectedProject.id, {
        book_title: selectedProject.book_title || "",
        category_id: selectedProject.category_id || 0,
        book_subject: selectedProject.book_subject || "",
        target_audience: selectedProject.target_audience || "",
        language_code: selectedProject.language_code || "",
        expected_pages: selectedProject.expected_pages ?? 0,
        chapter_count: selectedProject.chapter_count ?? 0,
        publisher_name: selectedProject.publisher_name || "",
        edition: selectedProject.edition || "",
        primary_output_format: selectedProject.primary_output_format || "",
        book_description: selectedProject.book_description || "",
        submission_deadline: selectedProject.submission_deadline || null,
        book_status: "Guidelines",
      });
      if (res?.errors && res.errors.length > 0) {
        throw new Error(res.errors[0]?.message || "Failed to send this project back.");
      }
      // Confirm the backend actually applied the new status before
      // treating this as a success — a 200 with the status silently
      // unchanged was leaving the project stuck as an SME's problem.
      const verify = await getBookForgeProjectById(selectedProject.id);
      const persistedStatus = verify?.data?.book_status || "";
      if (normStatus(persistedStatus) !== normStatus("Guidelines")) {
        throw new Error(
          `The server did not accept the "Guidelines" status (it still shows "${persistedStatus || "unknown"}"). ` +
          `This looks like a backend issue — check with Gopal Sir on what book_status values are valid.`
        );
      }
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      backToProjects();
    } catch (err) {
      console.error("Failed to send project back to user:", err);
      setSendBackError(err.message || "Failed to send this project back. Please try again.");
    } finally {
      setSendingBack(false);
    }
  };

  const answeredCount = qaEntries.length;
 
  /* ── Screen: pick a project first ──────────────────────────── */
  if (!selectedProject) {
    return (
      <div className="sme-page">
        <div className="sme-header">
          <div>
            <h1 className="bf-title">{admin ? "SME Upload — Admin View" : "SME Interview Upload"}</h1>
            <p className="bf-subtitle">
              {admin
                ? "Review or manage SME interview Q&A for any project."
                : "Select one of your assigned projects to begin uploading SME knowledge."}
            </p>
          </div>
        </div>
 
        {projectsError && <div className="bf-error-banner">{projectsError}</div>}
 
        {projectsLoading ? (
          <p className="bf-doc-empty">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="bf-doc-empty">
            {admin ? "No projects found yet." : "No projects are assigned to you yet."}
          </p>
        ) : (
          <div className="sme-project-grid">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                className="sme-project-card"
                onClick={() => selectProject({ ...p, title: p.book_title || "Untitled" })}
              >
                <div className="sme-project-card-icon">📘</div>
                <div className="sme-project-card-title">{p.book_title || "Untitled"}</div>
                <div className="sme-project-card-meta">{p.book_status || "Draft"}</div>
              </button>
            ))}
          </div>
        )}
 
        {!admin && (
          <p className="sme-assign-note">
            Showing all active projects for now — assignment-based filtering will narrow this
            down once it's available from the backend.
          </p>
        )}
      </div>
    );
  }
 
  /* ── Screen: capture Q&A for selectedProject ───────────────── */
  return (
    <div className="sme-page">
      <div className="sme-header">
        <div>
          <button type="button" className="sme-back-link" onClick={backToProjects}>
            ← All Projects
          </button>
          <h1 className="bf-title">{admin ? "SME Upload — Admin View" : "SME Interview Upload"}</h1>
          <p className="bf-subtitle">
            Project: <strong>{selectedProject.title}</strong> · Captured by {smeLabel || "you"}
          </p>
        </div>
        <button
          type="button"
          className="bf-btn bf-btn-primary"
          disabled={sendingBack}
          onClick={handleSendBackToUser}
        >
          {sendingBack ? "Sending…" : "Send Back to User ✓"}
        </button>
      </div>
 
      {submitSuccess && <div className="bf-success-banner"><span>✓</span> {submitSuccess}</div>}
      {submitError && <div className="bf-error-banner">{submitError}</div>}
      {sendBackError && <div className="bf-error-banner">{sendBackError}</div>}
 
      <div className="sme-columns">
        {/* ── Left: captured questions ──────────────────────── */}
        <div className="bf-card sme-col">
          <div className="bf-card-title sme-col-title">
            <span>Interview Questions</span>
            <span className="sme-count-chip">{answeredCount}</span>
            {answeredCount > 0 && <span className="bf-chip-draft" style={{ marginLeft: "6px" }}>Draft</span>}
          </div>
          {answeredCount > 0 && (
            <p className="bf-doc-empty" style={{ marginTop: "-4px" }}>
              Saved as a draft — come back anytime, then convert it to a PDF when ready.
            </p>
          )}
 
          {qaError && <div className="bf-error-banner">{qaError}</div>}
 
          {qaLoading ? (
            <p className="bf-doc-empty">Loading…</p>
          ) : qaEntries.length === 0 ? (
            <p className="bf-doc-empty">No questions captured yet. Add the first one on the right.</p>
          ) : (
            <div className="sme-qa-list">
              {qaEntries.map((qa, i) => (
                <div className={`sme-qa-item${editingEntryId === qa.id ? " editing" : ""}`} key={qa.id}>
                  <div className="sme-qa-item-head">
                    <span className="sme-qa-index">Q{i + 1}</span>
                    <div className="sme-qa-item-actions">
                      <button type="button" className="sme-qa-action" title="Edit" onClick={() => startEditEntry(qa)}>✏️</button>
                      <button
                        type="button"
                        className="sme-qa-action sme-qa-action-danger"
                        title="Delete"
                        disabled={deletingEntryId === qa.id}
                        onClick={() => handleDeleteEntry(qa)}
                      >
                        {deletingEntryId === qa.id ? "…" : "🗑️"}
                      </button>
                    </div>
                  </div>
                  <div className="sme-qa-question">{qa.question}</div>
                  <div className="sme-qa-answer">{qa.answer}</div>
                </div>
              ))}
            </div>
          )}
 
          <input
            ref={interviewFileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={handleInterviewFileChange}
          />
 
          <div className="sme-file-row">
            <span className="sme-file-divider">— or —</span>
            {interviewFile ? (
              <div className="sme-file-chip">
                <span className="sme-file-chip-name" title={interviewFile.name}>
                  📎 {interviewFile.name}
                </span>
                <button type="button" className="sme-file-chip-remove" title="Remove file" onClick={handleClearInterviewFile}>
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="bf-btn bf-btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => interviewFileInputRef.current?.click()}
              >
                📎 Attach a PDF Interview Instead
              </button>
            )}
          </div>
 
          <button
            type="button"
            className="bf-btn bf-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
            disabled={submitting || (!interviewFile && qaEntries.length === 0)}
            onClick={handleSubmitSession}
          >
            {submitting ? "Submitting…" : interviewFile ? "Submit PDF Interview" : "Submit"}
          </button>
        </div>
 
        {/* ── Right: add / edit form + submitted docs ───────── */}
        <div className="sme-col">
          <div className="bf-card sme-form-card">
            <div className="bf-card-title">{editingEntryId ? "Edit Question" : "Add Question"}</div>
 
            <div className="bf-form-group bf-form-group-full" style={{ marginBottom: "14px" }}>
              <label className="bf-form-label">Question</label>
              <textarea
                className="bf-form-input bf-textarea"
                rows={2}
                placeholder="Type the question here…"
                value={entryForm.question}
                onChange={(e) => setEntryForm((f) => ({ ...f, question: e.target.value }))}
              />
            </div>
            <div className="bf-form-group bf-form-group-full" style={{ marginBottom: "10px" }}>
              <label className="bf-form-label">Answer / Notes</label>
              <textarea
                className="bf-form-input bf-textarea"
                rows={5}
                placeholder="Capture the SME's answer or transcript notes…"
                value={entryForm.answer}
                onChange={(e) => setEntryForm((f) => ({ ...f, answer: e.target.value }))}
              />
            </div>
 
            {entryFormError && <p className="bf-step-error">{entryFormError}</p>}
 
            <div className="bf-step-actions" style={{ marginTop: "6px" }}>
              {editingEntryId && (
                <button type="button" className="bf-btn bf-btn-secondary" onClick={startNewEntry} disabled={savingEntry}>
                  Cancel Edit
                </button>
              )}
              <button type="button" className="bf-btn bf-btn-primary" onClick={handleSaveEntry} disabled={savingEntry}>
                {savingEntry ? "Saving…" : editingEntryId ? "💾 Update Draft" : "💾 Save as Draft"}
              </button>
            </div>
          </div>
 
          <div className="bf-card" style={{ marginTop: "18px" }}>
            <div className="bf-card-title">📄 Submitted Documents</div>
            {projectDocsLoading ? (
              <p className="bf-doc-empty">Loading…</p>
            ) : projectDocs.length === 0 ? (
              <p className="bf-doc-empty">No documents uploaded for this project yet.</p>
            ) : (
              <div className="bf-doc-list">
                {projectDocs.map((doc) => (
                  <div className="bf-doc-item" key={doc.id}>
                    <span className="bf-doc-icon">📕</span>
                    <div className="bf-doc-main">
                      <div className="bf-doc-name">{doc.original_filename}</div>
                      <div className="bf-doc-meta">{doc.document_type || "Document"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}