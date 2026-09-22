import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { LoginPage } from "./pages/login/LoginPage";
import { HomePage } from "./pages/home/HomePage";
import { EmployeePanelPage } from "./pages/user/EmployeePanelPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PrivacyNoticePage } from "./pages/legal/PrivacyNoticePage";
import { TermsConditionsPage } from "./pages/legal/TermsConditionsPage";
import { ManagerPanelPage } from "./pages/admin/ManagerPanelPage";
import { AUTH_UNAUTHORIZED_EVENT } from "./api/authHeaders";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

const SessionListener = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = () => {
      void logout().then(() => {
        navigate("/login", { replace: true });
      });
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout, navigate]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <SessionListener />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/user" element={<EmployeePanelPage />} />
          <Route path="/manager" element={<ManagerPanelPage />} />
        </Route>

        <Route
          path="/legal/aviso-privacidad"
          element={<PrivacyNoticePage />}
        />

        <Route
          path="/legal/terminos-condiciones"
          element={<TermsConditionsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
