// ─────────────────────────────────────────────────────────────
// SME Interview → PDF
//
// Builds a simple, readable PDF from a list of SME Q&A entries so it
// can be uploaded into a Book Forge project's Documents list using
// the existing (real) uploadBookForgeDocument API.
//
// Requires the "jspdf" package. If it isn't installed yet, run:
//   npm install jspdf
// ─────────────────────────────────────────────────────────────
import { jsPDF } from "jspdf";

const MARGIN = 48;
const PAGE_WIDTH = 595.28; // A4 in pt
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * Builds a PDF (as a Blob) containing the project's SME interview
 * Q&A entries, and wraps it in a File object ready for upload.
 *
 * @param {{ book_title?: string, id?: number|string }} project
 * @param {Array<{ question: string, answer: string, updated_at?: string }>} qaEntries
 * @param {string} smeLabel - display label for who answered (email/name)
 * @returns {File}
 */
export function buildSmeQaPdfFile(project, qaEntries, smeLabel = "") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  const addPageIfNeeded = (neededHeight) => {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SME Interview Capture", MARGIN, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90, 100, 115);
  doc.text(`Project: ${project?.book_title || project?.title || "Untitled Project"}`, MARGIN, y);
  y += 16;
  if (smeLabel) {
    doc.text(`Captured by: ${smeLabel}`, MARGIN, y);
    y += 16;
  }
  doc.text(`Generated: ${new Date().toLocaleString()}`, MARGIN, y);
  y += 24;

  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 20;

  doc.setTextColor(15, 23, 42);

  qaEntries.forEach((qa, index) => {
    const questionLines = doc.splitTextToSize(`Q${index + 1}. ${qa.question || "(No question text)"}`, CONTENT_WIDTH);
    const answerLines = doc.splitTextToSize(qa.answer || "(No answer provided)", CONTENT_WIDTH);

    addPageIfNeeded(questionLines.length * 14 + 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(questionLines, MARGIN, y);
    y += questionLines.length * 14 + 6;

    addPageIfNeeded(answerLines.length * 13 + 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(answerLines, MARGIN, y);
    y += answerLines.length * 13 + 18;
    doc.setTextColor(15, 23, 42);
  });

  const blob = doc.output("blob");
  const safeTitle = (project?.book_title || project?.title || "project").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  const filename = `sme-interview-${safeTitle}-${Date.now()}.pdf`;
  return new File([blob], filename, { type: "application/pdf" });
}