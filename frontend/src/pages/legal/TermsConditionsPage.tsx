import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

export const TermsConditionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/login";

  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Aviso de Privacidad</h1>
          <button className="legal-back-button" onClick={() => navigate(from)}>
            Regresar
          </button>
        </div>

        <p>
          El uso de esta plataforma implica la aceptación de los presentes
          términos y condiciones.
        </p>

        <h2>Uso autorizado</h2>

        <p>
          La plataforma está destinada exclusivamente para el registro y
          control de acceso del personal autorizado por Corporativo Construcción
          y Mantenimiento S.A. de C.V.
        </p>

        <h2>Responsabilidades del usuario</h2>

        <ul>
          <li>Mantener la confidencialidad de sus credenciales.</li>
          <li>Registrar información verídica.</li>
          <li>No compartir accesos con terceros.</li>
          <li>Utilizar la plataforma únicamente para fines laborales.</li>
        </ul>

        <h2>Evidencia fotográfica y geolocalización</h2>

        <p>
          Algunos registros podrán requerir evidencia fotográfica y
          geolocalización como mecanismos de validación de asistencia.
        </p>

        <h2>Suspensión de acceso</h2>

        <p>
          Corporativo Construcción y Mantenimiento S.A. de C.V. podrá suspender
          el acceso a cualquier usuario que incumpla los presentes términos.
        </p>

        <h2>Actualizaciones</h2>

        <p>
          Estos términos podrán ser modificados en cualquier momento sin previo
          aviso.
        </p>
      </div>
    </div>
  );
};