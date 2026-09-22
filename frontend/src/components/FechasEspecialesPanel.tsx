import { useEffect, useMemo, useState } from "react";
import {
  createFechaEspecial,
  getFechasEspeciales,
  updateFechaEspecial,
  updateFechaEspecialStatus,
  type FechaEspecial,
  type TipoJornada,
} from "../api/fechasEspeciales.api";
import { XIcon } from "./Icons";
import "../App.css";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const NOMBRES_TIPO: Record<TipoJornada, string> = {
  jornada_completa: "Día completo",
  media_jornada: "Medio día",
  no_laborable: "Día no laboral",
};

const DESCRIPCIONES_TIPO: Record<TipoJornada, string> = {
  jornada_completa: "Entrada 8:50–9:10, salida 18:30–19:10, con comida.",
  media_jornada: "Entrada 8:50–9:10, salida 13:30–14:10, sin comida.",
  no_laborable: "No se permiten registros de acceso.",
};

const formatoFechaKey = (fecha: Date) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

interface DiaCalendario {
  fechaKey: string;
  dia: number;
  fecha: Date;
}

export const FechasEspecialesPanel = () => {
  const anioActual = useMemo(() => new Date().getFullYear(), []);

  const [fechasPorDia, setFechasPorDia] = useState<
    Map<string, FechaEspecial>
  >(new Map());

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [diaSeleccionado, setDiaSeleccionado] =
    useState<DiaCalendario | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoJornada | null>(
    null
  );
  const [observaciones, setObservaciones] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadFechas = async () => {
    try {
      setError("");
      const data = await getFechasEspeciales();
      setFechasPorDia(
        new Map(data.map((fechaEspecial) => [fechaEspecial.fecha, fechaEspecial]))
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFechas();
  }, []);

  const mesesDelAnio = useMemo(() => {
    return MESES.map((nombreMes, indexMes) => {
      const primerDia = new Date(anioActual, indexMes, 1);
      const offsetInicio = (primerDia.getDay() + 6) % 7;
      const totalDias = new Date(anioActual, indexMes + 1, 0).getDate();

      const celdas: (DiaCalendario | null)[] = Array.from(
        { length: offsetInicio },
        () => null
      );

      for (let dia = 1; dia <= totalDias; dia++) {
        const fecha = new Date(anioActual, indexMes, dia);
        celdas.push({
          fechaKey: formatoFechaKey(fecha),
          dia,
          fecha,
        });
      }

      return { nombreMes, celdas };
    });
  }, [anioActual]);

  const hoyKey = formatoFechaKey(new Date());

  const abrirModal = (dia: DiaCalendario) => {
    const existente = fechasPorDia.get(dia.fechaKey);

    setDiaSeleccionado(dia);
    setTipoSeleccionado(existente?.tipo_jornada ?? null);
    setObservaciones(existente?.observaciones ?? "");
    setMessage("");
    setError("");
  };

  const cerrarModal = () => {
    setDiaSeleccionado(null);
    setTipoSeleccionado(null);
    setObservaciones("");
  };

  const guardarAsignacion = async () => {
    if (!diaSeleccionado || !tipoSeleccionado) {
      setError("Selecciona un tipo de jornada para el día.");
      return;
    }

    setIsSaving(true);
    setError("");

    const fechaKey = diaSeleccionado.fechaKey;
    const existente = fechasPorDia.get(fechaKey);

    const datos = {
      fecha: fechaKey,
      nombre: NOMBRES_TIPO[tipoSeleccionado],
      tipo_jornada: tipoSeleccionado,
      observaciones: observaciones.trim(),
    };

    try {
      if (existente) {
        await updateFechaEspecial(existente.id_fecha_especial, {
          nombre: datos.nombre,
          tipo_jornada: datos.tipo_jornada,
          observaciones: datos.observaciones,
        });

        if (!existente.activo) {
          await updateFechaEspecialStatus(existente.id_fecha_especial, true);
        }

        setMessage(
          `Fecha del ${fechaKey} actualizada como ${NOMBRES_TIPO[tipoSeleccionado].toLowerCase()}.`
        );
      } else {
        await createFechaEspecial(datos);
        setMessage(
          `Fecha del ${fechaKey} asignada como ${NOMBRES_TIPO[tipoSeleccionado].toLowerCase()}.`
        );
      }

      await loadFechas();
      cerrarModal();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const cambiarEstado = async (
    fechaEspecial: FechaEspecial,
    activo: boolean
  ) => {
    setError("");

    try {
      await updateFechaEspecialStatus(fechaEspecial.id_fecha_especial, activo);

      setMessage(
        activo
          ? `Fecha del ${fechaEspecial.fecha} activada.`
          : `Fecha del ${fechaEspecial.fecha} desactivada.`
      );

      await loadFechas();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const existenteSeleccionado = diaSeleccionado
    ? fechasPorDia.get(diaSeleccionado.fechaKey)
    : undefined;

  return (
    <div className="admin-placeholder">

      {error && <p className="login-error">{error}</p>}
      {message && <p className="employee-success">{message}</p>}

      <div className="fechas-especiales-legend">
        <span>
          <i className="legend-dot legend-dia-completo" /> Día completo
        </span>
        <span>
          <i className="legend-dot legend-medio-dia" /> Medio día
        </span>
        <span>
          <i className="legend-dot legend-no-laboral" /> Día no laboral
        </span>
        <span>
          <i className="legend-dot legend-inactiva" /> Inactiva
        </span>
        <span>Haz clic en un día para asignarlo.</span>
      </div>

      <div className="fechas-especiales-grid">
        {mesesDelAnio.map(({ nombreMes, celdas }) => (
          <div className="mes-calendario" key={nombreMes}>
            <h3>{nombreMes}</h3>

            <div className="calendario-dias-semana">
              {DIAS_SEMANA.map((dia) => (
                <span key={dia}>{dia}</span>
              ))}
            </div>

            <div className="calendario-dias">
              {celdas.map((dia, index) => {
                if (!dia) {
                  return <span className="calendario-dia-vacio" key={index} />;
                }

                const asignacion = fechasPorDia.get(dia.fechaKey);
                const esHoy = dia.fechaKey === hoyKey;
                const esDomingo = dia.fecha.getDay() === 0;

                return (
                  <button
                    type="button"
                    className={[
                      "calendario-dia",
                      asignacion
                        ? `calendario-dia-${asignacion.tipo_jornada}`
                        : "",
                      asignacion && !asignacion.activo
                        ? "calendario-dia-inactiva"
                        : "",
                      esHoy ? "calendario-dia-hoy" : "",
                      esDomingo && !asignacion ? "calendario-dia-domingo" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={dia.fechaKey}
                    title={
                      asignacion
                        ? `${NOMBRES_TIPO[asignacion.tipo_jornada]}${asignacion.activo ? "" : " (inactiva)"
                        }`
                        : "Sin asignar"
                    }
                    onClick={() => abrirModal(dia)}
                  >
                    <span>{dia.dia}</span>
                    {asignacion && (
                      <small>
                        {asignacion.tipo_jornada === "jornada_completa"
                          ? "Completo"
                          : asignacion.tipo_jornada === "media_jornada"
                            ? "Medio"
                            : "No laboral"}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {diaSeleccionado && (
        <div
          className="access-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <div className="access-modal fechas-especiales-modal">
            <button
              type="button"
              className="access-modal-close"
              title="Cerrar"
              aria-label="Cerrar"
              onClick={cerrarModal}
            >
              <XIcon size={22} />
            </button>

            <h3>Asignar fecha especial</h3>

            <p>
              <strong>
                {diaSeleccionado.fecha.toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </p>

            {existenteSeleccionado && (
              <p>
                Asignación actual:{" "}
                <strong>{existenteSeleccionado.nombre}</strong>{" "}
                <span
                  className={
                    existenteSeleccionado.activo
                      ? "fechas-estado-activa"
                      : "fechas-estado-inactiva"
                  }
                >
                  {existenteSeleccionado.activo ? "Activa" : "Inactiva"}
                </span>
              </p>
            )}

            <div className="fechas-tipo-grid">
              {(Object.keys(NOMBRES_TIPO) as TipoJornada[]).map((tipo) => (
                <label
                  key={tipo}
                  className={`fechas-tipo-opcion ${tipoSeleccionado === tipo ? "fechas-tipo-seleccionada" : ""
                    }`}
                >
                  <input
                    type="radio"
                    name="tipo_jornada"
                    value={tipo}
                    checked={tipoSeleccionado === tipo}
                    onChange={() => setTipoSeleccionado(tipo)}
                  />
                  <strong>{NOMBRES_TIPO[tipo]}</strong>
                  <span>{DESCRIPCIONES_TIPO[tipo]}</span>
                </label>
              ))}
            </div>

            <label className="fechas-observaciones">
              Observaciones (opcional)
              <textarea
                placeholder="Ej. Puente oficial por decreto"
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
              />
            </label>

            {error && <p className="login-error">{error}</p>}

            <div className="fechas-modal-acciones">
              {existenteSeleccionado && (
                <button
                  type="button"
                  className="fechas-boton-secundario"
                  onClick={() =>
                    cambiarEstado(
                      existenteSeleccionado,
                      !existenteSeleccionado.activo
                    )
                  }
                >
                  {existenteSeleccionado.activo
                    ? "Desactivar"
                    : "Activar"}
                </button>
              )}

              <button
                type="button"
                className="fechas-boton-principal"
                disabled={isSaving}
                onClick={guardarAsignacion}
              >
                {isSaving
                  ? "Guardando..."
                  : existenteSeleccionado
                    ? "Guardar cambios"
                    : "Asignar fecha"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};