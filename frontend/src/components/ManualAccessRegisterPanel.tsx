import { type FormEvent, useCallback, useEffect, useState } from "react";
import { getEmpleados, type Empleado } from "../api/empleados.api";
import {
  createRegistroManual,
  getRegistrosManualesHoy,
  type RegistroManualHoy,
} from "../api/registroAcceso.api";
import { getPuntosAutorizados } from "../api/puntosAutorizados.api";
import {
  getFechasEspeciales,
  type FechaEspecial,
} from "../api/fechasEspeciales.api";
import { SaveIcon } from "./Icons";
import "../App.css";

interface PuntoAutorizado {
  id_punto: number;
  nombre: string;
  direccion_fija: string;
  activo: boolean;
}

const REFRESH_INTERVAL_MS = 30_000;

const TIPO_REGISTRO_LABELS: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  salida_comida: "Salida a comida",
  regreso_comida: "Regreso de comida",
};

const getTodayLocal = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMinDateLocal = (fechasEspeciales: FechaEspecial[]) => {
  const cursor = new Date();

  let diasLaborables = 0;

  while (diasLaborables < 3) {
    cursor.setDate(cursor.getDate() - 1);

    if (esLaborable(cursor, fechasEspeciales)) diasLaborables++;
  }

  const year = cursor.getFullYear();
  const month = String(cursor.getMonth() + 1).padStart(2, "0");
  const day = String(cursor.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const esLaborable = (fecha: Date, fechasEspeciales: FechaEspecial[]) => {
  if (fecha.getDay() === 0) return false;

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  const key = `${year}-${month}-${day}`;

  const especial = fechasEspeciales.find(
    (f) => f.activo && f.fecha === key
  );

  return !especial || especial.tipo_jornada !== "no_laborable";
};

const getCurrentTimeLocal = () => {
  const today = new Date();

  const hour = String(today.getHours()).padStart(2, "0");
  const minute = String(today.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
};

const formatHoraLocal = (value: string) => {
  const text = String(value);
  const fecha = new Date(text.includes("T") ? text : text.replace(" ", "T"));

  if (Number.isNaN(fecha.getTime())) return text;

  const hour = fecha.getHours();
  const minute = fecha.getMinutes();

  const period = hour >= 12 ? "p.m." : "a.m.";
  const hour12 = hour % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )} ${period}`;
};

export const ManualAccessRegisterPanel = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [puntos, setPuntos] = useState<PuntoAutorizado[]>([]);

  const [idEmpleado, setIdEmpleado] = useState("");
  const [tipoRegistro, setTipoRegistro] = useState("entrada");
  const [fecha, setFecha] = useState(getTodayLocal());
  const [hora, setHora] = useState(getCurrentTimeLocal());
  const [tipoDireccion, setTipoDireccion] = useState<"manual" | "punto">("punto");
  const [idPunto, setIdPunto] = useState("");
  const [direccionManual, setDireccionManual] = useState("");
  const [observacion, setObservacion] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [registrosHoy, setRegistrosHoy] = useState<RegistroManualHoy[]>([]);
  const [fechasEspeciales, setFechasEspeciales] = useState<FechaEspecial[]>(
    []
  );

  const cargarRegistrosHoy = useCallback(() => {
    getRegistrosManualesHoy()
      .then(setRegistrosHoy)
      .catch(() => setError("No se pudieron cargar los registros de hoy."));
  }, []);

  useEffect(() => {
    getEmpleados()
      .then(setEmpleados)
      .catch(() => setError("No se pudieron cargar los empleados."));

    getPuntosAutorizados()
      .then((data) => setPuntos(data.filter((p) => p.activo)))
      .catch(() => setError("No se pudieron cargar los puntos autorizados."));

    getFechasEspeciales()
      .then(setFechasEspeciales)
      .catch(() => {});

    cargarRegistrosHoy();
  }, [cargarRegistrosHoy]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) cargarRegistrosHoy();
    }, REFRESH_INTERVAL_MS);

    const onFocus = () => cargarRegistrosHoy();

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [cargarRegistrosHoy]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!idEmpleado) {
      setError("Selecciona un empleado.");
      return;
    }

    if (!fecha || !hora) {
      setError("Selecciona fecha y hora del registro.");
      return;
    }

    if (fecha > getTodayLocal()) {
      setError("No se pueden registrar accesos en fechas futuras.");
      return;
    }

    if (fecha < getMinDateLocal(fechasEspeciales)) {
      setError(
        "Solo se permiten registros manuales de los últimos 3 días laborables."
      );
      return;
    }

    if (tipoDireccion === "punto" && !idPunto) {
      setError("Selecciona un punto autorizado.");
      return;
    }

    if (tipoDireccion === "manual" && !direccionManual.trim()) {
      setError("Escribe la dirección manual.");
      return;
    }

    setIsSaving(true);

    try {
      await createRegistroManual({
        id_empleado: Number(idEmpleado),
        tipo_registro: tipoRegistro,
        fecha,
        hora,
        tipo_direccion: tipoDireccion,
        id_punto: tipoDireccion === "punto" ? Number(idPunto) : undefined,
        direccion_manual:
          tipoDireccion === "manual" ? direccionManual.trim() : undefined,
        observacion,
      });

      setMessage("Registro manual guardado correctamente.");
      setTipoRegistro("entrada");
      setFecha(getTodayLocal());
      setHora(getCurrentTimeLocal());
      setTipoDireccion("punto");
      setIdPunto("");
      setDireccionManual("");
      setObservacion("");
      cargarRegistrosHoy();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-placeholder">
      {error && <p className="login-error">{error}</p>}
      {message && <p className="employee-success">{message}</p>}

      <div className="incidencias-layout">
        <form
          className="employee-admin-form incidencias-form"
          onSubmit={handleSubmit}
        >
        <label>
          Empleado
          <select value={idEmpleado} onChange={(e) => setIdEmpleado(e.target.value)}>
            <option value="">Selecciona un empleado</option>
            {empleados.map((empleado) => (
              <option key={empleado.id_empleado} value={empleado.id_empleado}>
                {empleado.id_empleado} - {empleado.nombre} {empleado.apellido_paterno}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo de registro
          <select value={tipoRegistro} onChange={(e) => setTipoRegistro(e.target.value)}>
            <option value="entrada">Entrada</option>
            <option value="salida_comida">Salida a comida</option>
            <option value="regreso_comida">Regreso de comida</option>
            <option value="salida">Salida</option>
          </select>
        </label>

        <label>
          Fecha
          <input
            type="date"
            value={fecha}
            min={getMinDateLocal(fechasEspeciales)}
            max={getTodayLocal()}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>

        <label>
          Hora
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </label>

        <label>
          Dirección
          <select
            value={tipoDireccion}
            onChange={(e) =>
              setTipoDireccion(e.target.value as "manual" | "punto")
            }
          >
            <option value="punto">Usar punto autorizado</option>
            <option value="manual">Escribir dirección manual</option>
          </select>
        </label>

        {tipoDireccion === "punto" && (
          <label>
            Punto autorizado
            <select value={idPunto} onChange={(e) => setIdPunto(e.target.value)}>
              <option value="">Selecciona un punto</option>
              {puntos.map((punto) => (
                <option key={punto.id_punto} value={punto.id_punto}>
                  {punto.nombre} - {punto.direccion_fija}
                </option>
              ))}
            </select>
          </label>
        )}

        {tipoDireccion === "manual" && (
          <label>
            Dirección manual
            <textarea
              placeholder="Ej. Blvr. Congreso de Chilpancingo, San Jerónimo 520..."
              value={direccionManual}
              onChange={(e) => setDireccionManual(e.target.value)}
            />
          </label>
        )}

        <label>
          Observación
          <textarea
            placeholder="Ej. Falta de internet."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="icon-button"
          title={isSaving ? "Guardando..." : "Guardar registro manual"}
          aria-label={isSaving ? "Guardando..." : "Guardar registro manual"}
          disabled={isSaving}
        >
          <SaveIcon size={20} />
          <span>{isSaving ? "Guardando..." : "Guardar registro"}</span>
        </button>
        </form>

        <div className="incidencias-hoy-card">
          <h3>Registros manuales de hoy</h3>

          {registrosHoy.length === 0 ? (
            <p className="incidencias-hoy-empty">
              No hay registros manuales registrados hoy.
            </p>
          ) : (
            <div className="incident-list">
              {registrosHoy.map((registro) => (
                <div className="incident-item" key={registro.id_registro}>
                  <div>
                    <h4>
                      {registro.empleado.nombre}{" "}
                      {registro.empleado.apellido_paterno}
                    </h4>
                    <span className="incident-tag">
                      {TIPO_REGISTRO_LABELS[registro.tipo_registro] ??
                        registro.tipo_registro}
                    </span>
                    <p>{formatHoraLocal(registro.fecha_y_hora)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};