import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

export const PrivacyNoticePage = () => {
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
          Corporativo Construcción y Mantenimiento S.A. de C.V., con domicilio para oír y recibir notificaciones,
          es responsable del tratamiento de los datos personales recabados
          a través de esta plataforma.
        </p>

        <h2>Datos que se recopilan</h2>

        <ul>
          <li>Nombre completo.</li>
          <li>Número de empleado.</li>
          <li>Usuario de acceso.</li>
          <li>Fotografías de evidencia.</li>
          <li>Ubicación geográfica del registro.</li>
          <li>Fechas y horarios de acceso.</li>
        </ul>

        <h2>Finalidad</h2>

        <p>
          Los datos serán utilizados exclusivamente para el control de acceso,
          asistencia, validación de registros y cumplimiento de procesos
          internos de la organización.
        </p>

        <h2>Protección de la información</h2>

        <p>
          La información será almacenada bajo medidas de seguridad
          administrativas y tecnológicas para evitar accesos no autorizados.
        </p>

        <h2>Contacto</h2>

        <p>
          Para cualquier duda relacionada con el tratamiento de sus datos,
          puede comunicarse a:
        </p>

        <p>
          <strong>valeria.chavez@e-ducatek.com</strong>
        </p>
      </div>
    </div>
  );
};