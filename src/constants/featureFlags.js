
// ─────────────────────────────────────────────────────────────
// Feature flags
//
// Each SHOW_* flag controls visibility of one workspace/module
// across the whole app: the Home dashboard card, the sidebar nav
// links on other pages, the route(s) for that module, and the
// post-login redirect. Flip a flag to `false` to hide that card
// (e.g. before a client demo) — when a card is turned off, the
// remaining cards automatically reflow to fill the screen.
//
//   SHOW_SUBMIT_PLUS        -> BookForge          (/submit)
//   SHOW_EDITOR_PLUS        -> Editor+            (/editor)
//   SHOW_PUBLISH_PLUS       -> Publish+           (/publish)
//   SHOW_ACCESSIBILITY_PLUS -> Accessibility
//                              Remediation+       (/remediate-pdf,
//                              /validate-pdf, /remediate-epub,
//                              /validate-epub)
// ─────────────────────────────────────────────────────────────
export const SHOW_SUBMIT_PLUS = true;
export const SHOW_EDITOR_PLUS = true;
export const SHOW_PUBLISH_PLUS = true;
export const SHOW_ACCESSIBILITY_PLUS = true;
