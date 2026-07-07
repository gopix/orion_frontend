

// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
// import Home           from "../pages/Home/Home";
// import Login          from "../pages/Login/Login";
// import SignUp         from "../pages/SignUp/SignUp";
// import Template       from "../pages/Template/Template";
// import ValidatePdf    from "../pages/ValidatePdf/ValidatePdf";
// import RemediatePdf   from "../pages/RemediatePdf/RemediatePdf";
// import Submit         from "../pages/Submit/Submit";
// import Editor         from "../pages/Editor/Editor";

// // ─────────────────────────────────────────────────────────────
// // ProtectedRoute
// //
// // Checks sessionStorage for a token before allowing access.
// // sessionStorage is used (not localStorage) because we want the
// // token to disappear automatically when the tab/browser closes,
// // forcing the user to log in again on every fresh visit.
// //
// // If no token → redirect to /login.
// // If token exists → render the requested page normally.
// // ─────────────────────────────────────────────────────────────
// function ProtectedRoute({ children }) {
//   const token = sessionStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }

// function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/"                element={<Home />} />
//         <Route path="/login"           element={<Login />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/signup"          element={<SignUp />} />

//         {/* Protected routes — require login via sessionStorage token */}
//         {/* <Route
//           path="/template"
//           element={
//             <ProtectedRoute>
//               <Template />
//             </ProtectedRoute>
//           }
//         /> */}
//         <Route
//           path="/validate-pdf"
//           element={
//             <ProtectedRoute>
//               <ValidatePdf />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/remediate-pdf"
//           element={
//             <ProtectedRoute>
//               <RemediatePdf />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/submit"
//           element={
//             <ProtectedRoute>
//               <Submit />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/editor"
//           element={
//             <ProtectedRoute>
//               <Editor />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default AppRoutes;













import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Home           from "../pages/Home/Home";
import Login          from "../pages/Login/Login";
import SignUp         from "../pages/SignUp/SignUp";
import Template       from "../pages/Template/Template";
import ValidatePdf    from "../pages/ValidatePdf/ValidatePdf";
import RemediatePdf   from "../pages/RemediatePdf/RemediatePdf";
import RemediateEpub  from "../pages/RemediateEpub/RemediateEpub";
import ValidateEpub   from "../pages/ValidateEpub/ValidateEpub";
import Submit         from "../pages/Submit/Submit";
import Editor         from "../pages/Editor/Editor";
import Publish        from "../pages/Publish/Publish";

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
          path="/validate-pdf"
          element={
            <ProtectedRoute>
              <ValidatePdf />
            </ProtectedRoute>
          }
        />
        <Route
          path="/remediate-pdf"
          element={
            <ProtectedRoute>
              <RemediatePdf />
            </ProtectedRoute>
          }
        />
        <Route
          path="/remediate-epub"
          element={
            <ProtectedRoute>
              <RemediateEpub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/validate-epub"
          element={
            <ProtectedRoute>
              <ValidateEpub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/publish"
          element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <Submit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;