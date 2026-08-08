
import {
  SHOW_SUBMIT_PLUS,
  SHOW_EDITOR_PLUS,
  SHOW_PUBLISH_PLUS,
  SHOW_ACCESSIBILITY_PLUS,
} from "./featureFlags";

export const services = [
  {
    title: "BookForge",
    description:
      "BookForge is an AI-powered book planning and authoring platform that transforms a prescribed syllabus, reference materials, and SME expertise into a structured, publisher-ready book blueprint. Its purpose is to assist authors and publishers in creating high-quality books efficiently through AI-guided collaboration, rather than replacing the author by autonomously writing an entire book..",

    icon: "📑",
    hidden: !SHOW_SUBMIT_PLUS,
  },

  {
    title: " EDITOR+",
    description:
      "AI-powered editorial intelligence helping publishers improve content quality and turnaround time.",

    icon: "📝",
    hidden: !SHOW_EDITOR_PLUS,
  },

  {
    title: " PUBLISH+",
    description:
      "Business intelligence dashboard offering real-time visibility into publishing workflows.",

    icon: "📚",
    hidden: !SHOW_PUBLISH_PLUS,
  },

  {
  title: " Accessibility \n Remediation +",
  description: "End-to-end accessibility and remediation solution helping publishers create WCAG and PDF/UA compliant digital content with automated validation, correction, and reporting.",
  icon: "🔧",
  hidden: !SHOW_ACCESSIBILITY_PLUS,
}
];