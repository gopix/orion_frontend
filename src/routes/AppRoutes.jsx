





import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ForgotPassword from "../pages/Auth/ForgotPassword/ForgotPassword";
import Home           from "../pages/Home/Home";
import Login          from "../pages/Auth/Login/Login";
import SignUp         from "../pages/Auth/SignUp/SignUp";
import Template       from "../pages/Template/Template";
import AccessibilitySelect from "../pages/Accessibility/AccessibilitySelect/AccessibilitySelect";
import ValidatePdf    from "../pages/Accessibility/ValidatePdf/ValidatePdf";
import ValidatePpt    from "../pages/Accessibility/ValidatePpt/ValidatePpt";
import RemediatePdf   from "../pages/Accessibility/RemediatePdf/RemediatePdf";
import RemediatePpt   from "../pages/Accessibility/RemediatePpt/RemediatePpt";
import RemediateEpub  from "../pages/Accessibility/RemediateEpub/RemediateEpub";
import ValidateEpub   from "../pages/Accessibility/ValidateEpub/ValidateEpub";
import MisPdf         from "../pages/Accessibility/MisPdf/MisPdf";
import Submit         from "../pages/Submit/Submit";
import Editor         from "../pages/Editor/Editor";
import Publish        from "../pages/Publish/Publish";
import {
  SHOW_SUBMIT_PLUS,
  SHOW_EDITOR_PLUS,
  SHOW_PUBLISH_PLUS,
  SHOW_ACCESSIBILITY_PLUS,
} from "../constants/featureFlags";
import { isAdmin } from "../utils/auth";

// ─────────────────────────────────────────────────────────────
// ProtectedRoute
//
// Checks sessionStorage for a token before allowing access.
// sessionStorage is used (not localStorage) because we want the
// token to disappear automatically when the tab/browser closes,
// forcing the user to log in again on every fresh visit.
//
// If no token → redirect to /login.
// If token exists → render the requested page normally.
// ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ─────────────────────────────────────────────────────────────
// AdminRoute
//
// Same as ProtectedRoute, but also requires the logged-in user's
// role to be ADMIN. Regular USER accounts are redirected to the
// dashboard if they try to open an admin-only route (e.g. MIS)
// directly via URL.
// 
// ─────────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup"          element={<SignUp />} />

        {/* Protected routes — require login via sessionStorage token */}
        {/* <Route
          path="/template"
          element={
            <ProtectedRoute>
              <Template />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/accessibility"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <ProtectedRoute>
                <AccessibilitySelect />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/validate-pdf"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <ProtectedRoute>
                <ValidatePdf />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/validate-ppt"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <ProtectedRoute>
                <ValidatePpt />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/remediate-pdf"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <ProtectedRoute>
                <RemediatePdf />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/remediate-ppt"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <ProtectedRoute>
                <RemediatePpt />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/remediate-epub"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <ProtectedRoute>
                <RemediateEpub />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/validate-epub"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <ProtectedRoute>
                <ValidateEpub />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/mis-pdf"
          element={
            SHOW_ACCESSIBILITY_PLUS ? (
              <AdminRoute>
                <MisPdf />
              </AdminRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/publish"
          element={
            SHOW_PUBLISH_PLUS ? (
              <ProtectedRoute>
                <Publish />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/submit"
          element={
            SHOW_SUBMIT_PLUS ? (
              <ProtectedRoute>
                <Submit />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/editor"
          element={
            SHOW_EDITOR_PLUS ? (
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;