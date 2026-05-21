import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import Template from "../pages/Template/Template";
import ValidatePdf from "../pages/ValidatePdf/ValidatePdf";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/template" element={<Template />} />
        <Route path="/validate-pdf" element={<ValidatePdf />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
