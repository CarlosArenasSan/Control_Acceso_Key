import { useEffect, useState } from "react";
import {
  getSolicitudesHorasExtra,
  responderSolicitudHoraExtra,
  type EstadoSolicitud,
  type SolicitudHoraExtra,
} from "../api/solicitudHoraExtra.api";
import { XIcon } from "./Icons";
import "../App.css";

const NOMBRES_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

const MINUTOS_OPCIONES = [60, 120, 180];

const NOMBRES_MINUTOS: Record<number, string> = {
  60: "1 hora",
  120: "2 horas",
  180: "3 horas",
};

const formatoFechaKey = (fechaKey: string) => {
  return new Date(fechaKey + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatoFechaHora = (fechaISO: string) => {
  return new Date(fechaISO).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const nombreEmpleado = (solicitud: SolicitudHoraExtra) => {
  const { nombre, apellido_paterno, apellido_materno } = solicitud.empleado;
  return `${nombre} ${apellido_paterno} ${apellido_materno ?? ""}`.trim();
};

export const ViewRequestAdmin = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudHoraExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<SolicitudHoraExtra | null>(null);
  const [tipoRespuesta, setTipoRespuesta] = useState<"aprobada" | "rechazada">(
    "aprobada"
  );
  const [minutosAutorizados, setMinutosAutorizados] = useState(60);
  const [comentario, setComentario] = useState("");
  const [respondiendo, setRespondiendo] = useState(false);

  const loadSolicitudes = async () => {
    try {
      setError("");
      const data = await getSolicitudesHorasExtra();
      setSolicitudes(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSolicitudes();
  }, []);

  const pendientes = solicitudes
    .filter((solicitud) => solicitud.estado === "pendiente")
    .sort((a, b) => a.fecha_trabajo.localeCompare(b.fecha_trabajo));

  const historial = solicitudes.filter(
    (solicitud) => solicitud.estado !== "pendiente"
  );

  const abrirModal = (solicitud: SolicitudHoraExtra) => {
    setSolicitudSeleccionada(solicitud);
    setTipoRespuesta("aprobada");
    setMinutosAutorizados(solicitud.minutos_solicitados);
    setComentario("");
    setMessage("");
    setError("");
  };

  const cerrarModal = () => {
    setSolicitudSeleccionada(null);
    setTipoRespuesta("aprobada");
    setMinutosAutorizados(60);
    setComentario("");
  };

  const enviarRespuesta = async () => {
    if (!solicitudSeleccionada) return;

    if (tipoRespuesta === "aprobada" && !minutosAutorizados) {
      setError("Selecciona los minutos a autorizar.");
      return;
    }

    if (tipoRespuesta === "rechazada" && !comentario.trim()) {
      setError("Escribe un comentario para el empleado al rechazar.");
      return;
    }

    setRespondiendo(true);
    setError("");

    try {
      await responderSolicitudHoraExtra(solicitudSeleccionada.id_solicitud, {
        estado: tipoRespuesta,
        minutos_autorizados:
          tipoRespuesta === "aprobada" ? minutosAutorizados : undefined,
        comentario_respuesta:
          tipoRespuesta === "rechazada" ? comentario.trim() : undefined,
      });

      setMessage(
        tipoRespuesta === "aprobada"
          ? "Solicitud aprobada correctamente."
          : "Solicitud rechazada correctamente."
      );

      await loadSolicitudes();
      cerrarModal();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setRespondiendo(false);
    }
  };

  return (
    <div className="admin-placeholder">

      {error && <p className="login-error">{error}</p>}
      {message && <p className="employee-success">{message}</p>}

      {loading ? (
        <p className="employee-info">Cargando solicitudes...</p>
      ) : (
        <>
          <div className="employee-table-card">
            <h3>Pendientes ({pendientes.length})</h3>

            <div className="employee-table-wrapper">
              {pendientes.length === 0 ? (
                <p className="employee-info">
                  No hay solicitudes pendientes por revisar.
                </p>
              ) : (
                <table className="employee-admin-table">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Fecha de trabajo</th>
                      <th>Horas solicitadas</th>
                      <th>Motivo</th>
                      <th>Recibida</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((solicitud) => (
                      <tr key={solicitud.id_solicitud}>
                        <td>
                          <strong>{nombreEmpleado(solicitud)}</strong>
                        </td>
                        <td>{formatoFechaKey(solicitud.fecha_trabajo)}</td>
                        <td>
                          {NOMBRES_MINUTOS[solicitud.minutos_solicitados] ??
                            `${solicitud.minutos_solicitados} minutos`}
                        </td>
                        <td>{solicitud.motivo}</td>
                        <td>{formatoFechaHora(solicitud.fecha_solicitud)}</td>
                        <td>
                          <div className="employee-table-actions">
                            <button
                              type="button"
                              title="Responder solicitud"
                              aria-label="Responder solicitud"
                              onClick={() => abrirModal(solicitud)}
                            >
                              <CheckCircleIcon />
                              <span>Responder</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="employee-table-card">
            <h3>Historial de respuestas ({historial.length})</h3>

            <div className="employee-table-wrapper">
              {historial.length === 0 ? (
                <p className="employee-info">
                  Aún no hay solicitudes respondidas.
                </p>
              ) : (
                <table className="employee-admin-table">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Fecha de trabajo</th>
                      <th>Horas</th>
                      <th>Estado</th>
                      <th>Respuesta del administrador</th>
                      <th>Respondida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((solicitud) => (
                      <tr key={solicitud.id_solicitud}>
                        <td>
                          <strong>{nombreEmpleado(solicitud)}</strong>
                        </td>
                        <td>{formatoFechaKey(solicitud.fecha_trabajo)}</td>
                        <td>
                          {solicitud.estado === "aprobada" &&
                          solicitud.minutos_autorizados
                            ? `${NOMBRES_MINUTOS[solicitud.minutos_autorizados] ?? solicitud.minutos_autorizados + " minutos"} autorizada(s)`
                            : `${NOMBRES_MINUTOS[solicitud.minutos_solicitados] ?? solicitud.minutos_solicitados + " minutos"} solicitada(s)`}
                        </td>
                        <td>
                          <span
                            className={`solicitud-estado solicitud-estado-${solicitud.estado}`}
                          >
                            {NOMBRES_ESTADO[solicitud.estado]}
                          </span>
                        </td>
                        <td>{solicitud.comentario_respuesta ?? "—"}</td>
                        <td>
                          {solicitud.fecha_respuesta
                            ? formatoFechaHora(solicitud.fecha_respuesta)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {solicitudSeleccionada && (
        <div
          className="access-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <div className="access-modal solicitudes-modal">
            <button
              type="button"
              className="access-modal-close"
              title="Cerrar"
              aria-label="Cerrar"
              onClick={cerrarModal}
            >
              <XIcon size={22} />
            </button>

            <h3>Responder solicitud</h3>

            <p>
              <strong>{nombreEmpleado(solicitudSeleccionada)}</strong>{" "}
              solicita{" "}
              <strong>
                {NOMBRES_MINUTOS[
                  solicitudSeleccionada.minutos_solicitados
                ] ?? `${solicitudSeleccionada.minutos_solicitados} minutos`}
              </strong>{" "}
              para el día{" "}
              <strong>
                {formatoFechaKey(solicitudSeleccionada.fecha_trabajo)}
              </strong>
            </p>

            <p>
              Motivo: <em>{solicitudSeleccionada.motivo}</em>
            </p>

            <div className="solicitudes-tipo-grid">
              <label
                className={`solicitudes-tipo-opcion ${
                  tipoRespuesta === "aprobada"
                    ? "solicitudes-tipo-aprobada"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="tipo_respuesta"
                  value="aprobada"
                  checked={tipoRespuesta === "aprobada"}
                  onChange={() => setTipoRespuesta("aprobada")}
                />
                <strong>Aprobar</strong>
              </label>

              <label
                className={`solicitudes-tipo-opcion ${
                  tipoRespuesta === "rechazada"
                    ? "solicitudes-tipo-rechazada"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="tipo_respuesta"
                  value="rechazada"
                  checked={tipoRespuesta === "rechazada"}
                  onChange={() => setTipoRespuesta("rechazada")}
                />
                <strong>Rechazar</strong>
              </label>
            </div>

            {tipoRespuesta === "aprobada" ? (
              <label className="solicitudes-campo">
                Horas a autorizar
                <select
                  value={minutosAutorizados}
                  onChange={(event) =>
                    setMinutosAutorizados(Number(event.target.value))
                  }
                >
                  {MINUTOS_OPCIONES.filter(
                    (minutos) =>
                      minutos <= solicitudSeleccionada.minutos_solicitados
                  ).map((minutos) => (
                    <option key={minutos} value={minutos}>
                      {NOMBRES_MINUTOS[minutos]}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="solicitudes-campo">
                Comentario para el empleado (obligatorio)
                <textarea
                  maxLength={500}
                  placeholder="Explica el motivo de la negativa..."
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                />
              </label>
            )}

            {error && <p className="login-error">{error}</p>}

            <div className="fechas-modal-acciones">
              <button
                type="button"
                className="fechas-boton-secundario"
                onClick={cerrarModal}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="fechas-boton-principal"
                disabled={respondiendo}
                onClick={enviarRespuesta}
              >
                {respondiendo
                  ? "Enviando..."
                  : tipoRespuesta === "aprobada"
                    ? "Aprobar solicitud"
                    : "Rechazar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);