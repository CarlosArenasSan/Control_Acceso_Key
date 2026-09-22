import { useCallback, useEffect, useState } from "react";
import {
  getStartPanelData,
  type StartPanelData,
} from "../api/adminDashboard.api";
import "../App.css";

const REFRESH_INTERVAL_MS = 30_000;

export const StartPanelAdmin = () => {
  const [data, setData] = useState<StartPanelData | null>(null);
  const [error, setError] = useState("");

  const formatDateTimeLocal = (value: string) => {
    if (!value) return "-";

    const text = String(value);
    const fecha = new Date(
      text.includes("T") ? text : text.replace(" ", "T")
    );

    if (Number.isNaN(fecha.getTime())) return text;

    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = fecha.getFullYear();

    const hour = fecha.getHours();
    const minute = fecha.getMinutes();

    const period = hour >= 12 ? "p.m." : "a.m.";
    const hour12 = hour % 12 || 12;

    return `${day}/${month}/${year} ${String(hour12).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")} ${period}`;
  };

  const loadData = useCallback(async () => {
    try {
      const panelData = await getStartPanelData();
      setData(panelData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) loadData();
    }, REFRESH_INTERVAL_MS);

    const onFocus = () => loadData();

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadData]);

  if (error) {
    return <p className="login-error">{error}</p>;
  }

  if (!data) {
    return <p>Cargando vista general...</p>;
  }

  return (
    <div className="admin-placeholder">

      <div className="start-kpi-grid">
        <div className="start-kpi-card">
          <span>📌 Presentes</span>
          <strong>{data.kpis.presentes}</strong>
        </div>

        <div className="start-kpi-card">
          <span>⏰ Retardos</span>
          <strong>{data.kpis.retardos}</strong>
        </div>

        <div className="start-kpi-card">
          <span>🍽️ En comida</span>
          <strong>{data.kpis.enComida}</strong>
        </div>

        <div className="start-kpi-card">
          <span>⛔ Excedidos comida</span>
          <strong>{data.kpis.excedidosComida}</strong>
        </div>

        <div className="start-kpi-card">
          <span>❌ Ausencias</span>
          <strong>{data.kpis.ausencias}</strong>
        </div>

        <div className="start-kpi-card">
          <span>⏱️ Horas extra aprobadas</span>
          <strong>{data.kpis.horasExtraAprobadas / 60}h</strong>
        </div>
      </div>

      <div className="start-panel-grid">
        <div className="start-chart-card">
          <h3>Puntualidad semanal</h3>

          <div className="weekly-chart">
            {data.puntualidadSemanal.map((item) => {
              const total = item.aTiempo + item.retardos || 1;
              const height = Math.max((item.aTiempo / total) * 100, 8);

              return (
                <div className="weekly-chart-item" key={item.dia}>
                  <div className="weekly-bar-wrapper">
                    <div
                      className="weekly-bar"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span>{item.dia.slice(0, 3)}</span>
                  <small>
                    {item.aTiempo} / {item.retardos}
                  </small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="start-alert-card">
          <h3>Incidencias</h3>

          {data.incidencias.length === 0 && (
            <p>No hay incidencias pendientes.</p>
          )}

          <div className="incident-list">
            {data.incidencias.map((item) => (
              <div className="incident-item" key={item.id_registro}>
                <div>
                  <h4>{item.empleado}</h4>
                  <span className="incident-tag">{item.detalle}</span>
                  {item.horasExtra && (
                    <span
                      className={
                        item.horasExtra.estado === "aprobada"
                          ? "incident-tag history-badge success"
                          : item.horasExtra.estado === "pendiente"
                            ? "incident-tag history-badge warning"
                            : "incident-tag history-badge neutral"
                      }
                      title={`Solicitada: ${item.horasExtra.minutos_solicitados} min | Autorizada: ${item.horasExtra.minutos_autorizados ?? "—"} min | Estado: ${item.horasExtra.estado}`}
                    >
                      {item.horasExtra.estado === "aprobada"
                        ? `${Math.round((item.horasExtra.minutos_autorizados ?? 0) / 60)}h extra aprobada`
                        : item.horasExtra.estado === "pendiente"
                          ? `${Math.round(item.horasExtra.minutos_solicitados / 60)}h extra pendiente`
                          : `${Math.round(item.horasExtra.minutos_solicitados / 60)}h extra ${item.horasExtra.estado}`}
                    </span>
                  )}
                  <p>{formatDateTimeLocal(item.fecha_y_hora)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};