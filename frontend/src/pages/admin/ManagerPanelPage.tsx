import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminProfile } from "../../components/AdminProfile";
import { AuthorizedPointsPanel } from "../../components/AuthorizedPointsPanel";
import { EmployeeManagementPanel } from "../../components/EmployeeManagementPanel";
import { EmployeeRegistrationHistoryPanel } from "../../components/EmployeeRegistrationHistoryPanel";
import { FechasEspecialesPanel } from "../../components/FechasEspecialesPanel";
import { ManualAccessRegisterPanel } from "../../components/ManualAccessRegisterPanel";
import { StartPanelAdmin } from "../../components/StartPanelAdmin";
import { ViewRequestAdmin } from "../../components/ViewRequestAdmin";
import {
  AlertIcon,
  CalendarIcon,
  ClockPlusIcon,
  HistoryIcon,
  HomeIcon,
  LogOutIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
} from "../../components/Icons";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";
import "../../App.css";

type AdminSection =
  | "inicio"
  | "empleados"
  | "incidencias"
  | "historial"
  | "puntos"
  | "peticiones"
  | "fechas"
  | "perfil";

export const ManagerPanelPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState<AdminSection>("inicio");
  const [visitedSections, setVisitedSections] = useState<AdminSection[]>([
    "inicio",
  ]);

  const openSection = (section: AdminSection) => {
    setActiveSection(section);
    setVisitedSections((prev) =>
      prev.includes(section) ? prev : [...prev, section]
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isVisible = (section: AdminSection) =>
    activeSection === section ? undefined : "none";

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Logo" className="admin-logo" />
          <p>Panel de administración</p>
        </div>

        <nav className="admin-nav">
          <button
            title="Inicio"
            aria-label="Inicio"
            className={activeSection === "inicio" ? "active" : ""}
            onClick={() => openSection("inicio")}
          >
            <HomeIcon />
            <span>Inicio</span>
          </button>

          <button
            title="Empleados"
            aria-label="Empleados"
            className={activeSection === "empleados" ? "active" : ""}
            onClick={() => openSection("empleados")}
          >
            <UsersIcon />
            <span>Empleados</span>
          </button>

          <button
            title="Incidencias"
            aria-label="Incidencias"
            className={activeSection === "incidencias" ? "active" : ""}
            onClick={() => openSection("incidencias")}
          >
            <AlertIcon />
            <span>Incidencias</span>
          </button>

          <button
            title="Historial"
            aria-label="Historial"
            className={activeSection === "historial" ? "active" : ""}
            onClick={() => openSection("historial")}
          >
            <HistoryIcon />
            <span>Historial</span>
          </button>

          <button
            title="Puntos autorizados"
            aria-label="Puntos autorizados"
            className={activeSection === "puntos" ? "active" : ""}
            onClick={() => openSection("puntos")}
          >
            <MapPinIcon />
            <span>Puntos autorizados</span>
          </button>

          <button
            title="Peticiones"
            aria-label="Peticiones horas extras"
            className={activeSection === "peticiones" ? "active" : ""}
            onClick={() => openSection("peticiones")}
          >
            <ClockPlusIcon />
            <span>Peticiones</span>
          </button>

          <button
            title="Fechas especiales"
            aria-label="Fechas especiales"
            className={activeSection === "fechas" ? "active" : ""}
            onClick={() => openSection("fechas")}
          >
            <CalendarIcon />
            <span>Fechas especiales</span>
          </button>

          <button
            title="Perfil"
            aria-label="Perfil"
            className={activeSection === "perfil" ? "active" : ""}
            onClick={() => openSection("perfil")}
          >
            <UserIcon />
            <span>Perfil</span>
          </button>

          <button
            type="button"
            className="admin-logout"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={handleLogout}
          >
            <LogOutIcon />
            <span>Cerrar sesión</span>
          </button>

          <div className="login-legal-footer">
            <p>
              Plataforma operada por{" "}
              <strong>
                Corporativo Construcción y Mantenimiento S.A. de C.V.
              </strong>{" "}
              Todos los derechos reservados.
            </p>
            <div className="legal-links">
              <Link to="/legal/aviso-privacidad" state={{ from: "/manager" }}>
                Aviso de Privacidad
              </Link>
              <span> | </span>
              <Link
                to="/legal/terminos-condiciones"
                state={{ from: "/manager" }}
              >
                Términos de Uso
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <img src={logo} alt="Logo" className="admin-header-logo" />

          <div>
            <h1>Gestión de Accesos</h1>
            <p>
              Bienvenido, <strong>{user?.fullName || user?.username}</strong>
            </p>
          </div>
        </header>

        <section className="admin-content">
          {visitedSections.includes("inicio") && (
            <div style={{ display: isVisible("inicio") }}>
              <StartPanelAdmin />
            </div>
          )}

          {visitedSections.includes("empleados") && (
            <div style={{ display: isVisible("empleados") }}>
              <EmployeeManagementPanel />
            </div>
          )}

          {visitedSections.includes("historial") && (
            <div style={{ display: isVisible("historial") }}>
              <EmployeeRegistrationHistoryPanel />
            </div>
          )}

          {visitedSections.includes("perfil") && (
            <div style={{ display: isVisible("perfil") }}>
              <AdminProfile user={user} />
            </div>
          )}

          {visitedSections.includes("puntos") && (
            <div style={{ display: isVisible("puntos") }}>
              <AuthorizedPointsPanel />
            </div>
          )}

          {visitedSections.includes("incidencias") && (
            <div style={{ display: isVisible("incidencias") }}>
              <ManualAccessRegisterPanel />
            </div>
          )}

          {visitedSections.includes("peticiones") && (
            <div style={{ display: isVisible("peticiones") }}>
              <ViewRequestAdmin />
            </div>
          )}

          {visitedSections.includes("fechas") && (
            <div style={{ display: isVisible("fechas") }}>
              <FechasEspecialesPanel />
            </div>
          )}
        </section>
      </main>
    </div>
  );
};