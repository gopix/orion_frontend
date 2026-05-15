import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
  path="/signup"
  element={<SignUp />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;