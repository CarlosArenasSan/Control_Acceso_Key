import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  getRegistroHistorial,
  type HistoryRow,
} from "../api/registroHistorial.api";
import { DownloadIcon, EyeIcon, SearchIcon } from "./Icons";
import "../App.css";

const API_URL = "/api";
const MAX_RANGE_DAYS = 90;
const REFRESH_INTERVAL_MS = 30_000;

// Configuración del reporte .xlsx (se genera desde cero, sin plantilla)
const HEADER_ROW = 6;

const EXPORT_COLUMNS = [
  { header: "Fecha", width: 14 },
  { header: "ID empleado", width: 14 },
  { header: "Empleado", width: 32 },
  { header: "Entrada", width: 14 },
  { header: "Comida minutos", width: 18 },
  { header: "Salida", width: 14 },
  { header: "Ubic. Entrada", width: 30 },
  { header: "Ubic. Salida comida", width: 30 },
  { header: "Ubic. Regreso comida", width: 30 },
  { header: "Ubic. Salida", width: 30 },
  { header: "Estado del día", width: 20 },
  { header: "Hora extra", width: 16 },
] as const;

const THIN_BORDER = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
} as const;

const getTodayLocal = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const EmployeeRegistrationHistoryPanel = () => {
  const today = getTodayLocal();

  const [desde, setDesde] = useState(today);
  const [hasta, setHasta] = useState(today);
  const [empleado, setEmpleado] = useState("");
  const [incidencia, setIncidencia] = useState("todos");
  const [estadoEmpleado, setEstadoEmpleado] = useState("todos");

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<HistoryRow | null>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async (silent = false) => {
    setError("");
    if (!silent) setIsLoading(true);

    const diffDays =
      Math.round(
        (new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000
      ) + 1;

    if (diffDays > MAX_RANGE_DAYS) {
      setError(`El rango máximo permitido es de ${MAX_RANGE_DAYS} días.`);
      setIsLoading(false);
      return;
    }

    if (hasta < desde) {
      setError("La fecha 'Hasta' no puede ser anterior a 'Desde'.");
      setIsLoading(false);
      return;
    }

    if (hasta > getTodayLocal()) {
      setError("La fecha 'Hasta' no puede ser posterior a hoy.");
      setIsLoading(false);
      return;
    }

    try {
      const data = await getRegistroHistorial({
        desde,
        hasta,
        empleado,
        incidencia,
        estadoEmpleado,
      });

      setRows(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [desde, hasta, empleado, incidencia, estadoEmpleado]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) loadHistory(true);
    }, REFRESH_INTERVAL_MS);

    const onFocus = () => loadHistory(true);

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadHistory]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadHistory();
  };

  const formatTime = (value?: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoRegistroLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      entrada: "Entrada",
      salida_comida: "Salida a comida",
      regreso_comida: "Regreso de comida",
      salida: "Salida",
    };

    return labels[tipo] || tipo;
  };

  const getEstatusLabel = (estatus?: string | null) => {
    if (!estatus) return "Sin incidencia";

    const labels: Record<string, string> = {
      a_tiempo: "A tiempo",
      retardo: "Retardo",
      fuera_de_rango: "Fuera de rango",
      antes_de_tiempo: "Antes de tiempo",
    };

    return labels[estatus] || estatus;
  };

  const formatUbicacion = (
    direccion?: string | null,
    gps?: string | null
  ) => {
    const partes: string[] = [];

    if (direccion) partes.push(direccion);

    if (gps) partes.push(`GPS: ${gps}`);

    return partes.join(" | ") || "";
  };

  const exportExcel = async () => {
    setError("");

    try {
      const ExcelJS = (await import("exceljs")).default;

      const workbook = new ExcelJS.Workbook();

      workbook.creator = "Okostrom - Control de Acceso";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("F-RIP-001", {
        views: [{ state: "frozen", ySplit: HEADER_ROW }],
        pageSetup: {
          paperSize: 9,
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.25,
            right: 0.25,
            top: 0.25,
            bottom: 0.25,
            header: 0.1,
            footer: 0.1,
          },
        },
      });

      // Ancho de columnas
      worksheet.columns = EXPORT_COLUMNS.map((column) => ({
        width: column.width,
      }));

      // Membrete
      worksheet.mergeCells(1, 1, 1, EXPORT_COLUMNS.length);
      const titleCell = worksheet.getCell(1, 1);

      titleCell.value = "REGISTRO DE INCIDENCIAS DE PERSONAL";
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(1).height = 22;

      worksheet.mergeCells(2, 1, 2, EXPORT_COLUMNS.length);
      const codeCell = worksheet.getCell(2, 1);

      codeCell.value = "F-RIP-001";
      codeCell.font = { bold: true, size: 10 };
      codeCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.getCell("A3").value = "PERIODO";
      worksheet.getCell("A3").font = { bold: true, size: 9 };
      worksheet.getCell("B3").value = `${desde} a ${hasta}`;
      worksheet.getCell("B3").font = { size: 9 };

      worksheet.getCell("A4").value = "GENERADO";
      worksheet.getCell("A4").font = { bold: true, size: 9 };
      worksheet.getCell("B4").value = new Date();
      worksheet.getCell("B4").numFmt = "dd/mm/yyyy hh:mm";
      worksheet.getCell("B4").font = { size: 9 };

      // Encabezados de la tabla
      const headerRow = worksheet.getRow(HEADER_ROW);

      EXPORT_COLUMNS.forEach((column, index) => {
        const cell = headerRow.getCell(index + 1);

        cell.value = column.header;
        cell.font = { bold: true, size: 9 };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9D9D9" },
        };
        cell.border = THIN_BORDER;
      });

      headerRow.height = 28;
      headerRow.commit();

      // Datos
      rows.forEach((row, index) => {
        const excelRowNumber = HEADER_ROW + 1 + index;
        const worksheetRow = worksheet.getRow(excelRowNumber);

        worksheetRow.getCell(1).value = row.fecha
          ? new Date(`${row.fecha}T00:00:00`)
          : "";
        worksheetRow.getCell(1).numFmt = "dd/mm/yyyy";

        worksheetRow.getCell(2).value = row.empleado.id_empleado;
        worksheetRow.getCell(3).value = row.empleado.nombre;
        worksheetRow.getCell(4).value = formatTime(row.entrada?.hora);
        worksheetRow.getCell(5).value = row.comida.minutos ?? "";
        worksheetRow.getCell(6).value = formatTime(row.salida?.hora);

        worksheetRow.getCell(7).value = formatUbicacion(
          row.entrada?.direccion,
          row.entrada
            ? `${row.entrada.latitud}, ${row.entrada.longitud}`
            : null
        );

        worksheetRow.getCell(8).value = formatUbicacion(
          row.comida.salidaDireccion,
          row.comida.salidaGps
        );

        worksheetRow.getCell(9).value = formatUbicacion(
          row.comida.regresoDireccion,
          row.comida.regresoGps
        );

        worksheetRow.getCell(10).value = formatUbicacion(
          row.salida?.direccion,
          row.salida ? `${row.salida.latitud}, ${row.salida.longitud}` : null
        );

        worksheetRow.getCell(11).value = row.estadoDia ?? "";

        worksheetRow.getCell(12).value = row.horasExtra
          ? `${Math.round(
              (row.horasExtra.minutos_autorizados ??
                row.horasExtra.minutos_solicitados) / 60
            )}h (${row.horasExtra.estado})`
          : "";

        for (let colNumber = 1; colNumber <= EXPORT_COLUMNS.length; colNumber++) {
          const cell = worksheetRow.getCell(colNumber);

          cell.font = { size: 9 };
          cell.alignment = { vertical: "middle", wrapText: true };
          cell.border = THIN_BORDER;
        }

        worksheetRow.commit();
      });

      const lastRow = HEADER_ROW + rows.length;

      worksheet.autoFilter = {
        from: { row: HEADER_ROW, column: 1 },
        to: { row: Math.max(lastRow, HEADER_ROW), column: EXPORT_COLUMNS.length },
      };

      worksheet.pageSetup.printArea = `A1:L${Math.max(lastRow, HEADER_ROW)}`;
      worksheet.pageSetup.printTitlesRow = `${HEADER_ROW}:${HEADER_ROW}`;

      // Descargar archivo
      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `historial_accesos_${desde}_a_${hasta}.xlsx`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudo generar el reporte: ${err.message}`
          : "No se pudo generar el reporte."
      );
    }
  };

  return (
    <div className="admin-placeholder">
      <form className="history-filters" onSubmit={handleSubmit}>
        <label>
          Desde
          <input
            type="date"
            value={desde}
            max={today}
            onChange={(e) => setDesde(e.target.value)}
          />
        </label>

        <label>
          Hasta
          <input
            type="date"
            value={hasta}
            max={today}
            onChange={(e) => setHasta(e.target.value)}
          />
        </label>

        <label>
          Empleado
          <input
            type="text"
            placeholder="Nombre o ID"
            value={empleado}
            onChange={(e) => setEmpleado(e.target.value)}
          />
        </label>

        <label>
          Incidencia
          <select
            value={incidencia}
            onChange={(e) => setIncidencia(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="puntuales">Puntuales</option>
            <option value="retardos">Retardos</option>
            <option value="exceso_comida">Exceso de comida</option>
            <option value="salidas_anticipadas">Salidas anticipadas</option>
            <option value="ausencias">Ausencias</option>
          </select>
        </label>

        <label>
          Estado empleado
          <select
            value={estadoEmpleado}
            onChange={(e) => setEstadoEmpleado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </label>

        <button
          type="submit"
          className="icon-button"
          title={isLoading ? "Buscando..." : "Buscar"}
          aria-label={isLoading ? "Buscando..." : "Buscar"}
          disabled={isLoading}
        >
          <SearchIcon size={18} />
        </button>

        <button
          type="button"
          className="icon-button"
          title="Exportar Reporte"
          aria-label="Exportar Reporte"
          onClick={exportExcel}
        >
          <DownloadIcon size={18} />
        </button>
      </form>

      {error && <p className="login-error">{error}</p>}

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Empleado</th>
              <th>Entrada</th>
              <th>Comida</th>
              <th>Salida</th>
              <th>Ubic. Entrada</th>
              <th>Ubic. Salida comida</th>
              <th>Ubic. Regreso comida</th>
              <th>Ubic. Salida</th>
              <th>Estado del día</th>
              <th>Hora extra</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={`${row.fecha}-${row.empleado.id_empleado}`}>
                <td>{row.fecha}</td>

                <td>
                  <strong>{row.empleado.nombre}</strong>
                  <br />
                  <small>ID: {row.empleado.id_empleado}</small>
                </td>

                <td>
                  <span
                    className={
                      row.entrada?.estatus === "retardo"
                        ? "history-badge danger"
                        : row.entrada
                          ? "history-badge success"
                          : "history-badge neutral"
                    }
                  >
                    {formatTime(row.entrada?.hora)}
                  </span>
                </td>

                <td>
                  {row.comida.minutos !== null ? (
                    <span
                      className={
                        row.comida.excedido
                          ? "history-badge warning"
                          : "history-badge success"
                      }
                    >
                      {row.comida.minutos} min
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  <span
                    className={
                      row.salida?.estatus === "fuera_de_rango" ||
                      row.salida?.estatus === "antes_de_tiempo"
                        ? "history-badge danger"
                        : row.salida
                          ? "history-badge success"
                          : "history-badge neutral"
                    }
                  >
                    {formatTime(row.salida?.hora)}
                  </span>
                </td>

                <td className="history-location-cell">
                  {formatUbicacion(
                    row.entrada?.direccion,
                    row.entrada
                      ? `${row.entrada.latitud}, ${row.entrada.longitud}`
                      : null
                  ) || "Sin registro"}
                </td>

                <td className="history-location-cell">
                  {formatUbicacion(
                    row.comida.salidaDireccion,
                    row.comida.salidaGps
                  ) || "-"}
                </td>

                <td className="history-location-cell">
                  {formatUbicacion(
                    row.comida.regresoDireccion,
                    row.comida.regresoGps
                  ) || "-"}
                </td>

                <td className="history-location-cell">
                  {formatUbicacion(
                    row.salida?.direccion,
                    row.salida
                      ? `${row.salida.latitud}, ${row.salida.longitud}`
                      : null
                  ) || "Sin registro"}
                </td>

                <td>
                  <span
                    className={
                      row.estadoDia === "Día completo"
                        ? "history-badge success"
                        : row.estadoDia === "Falta"
                          ? "history-badge danger"
                          : "history-badge warning"
                    }
                  >
                    {row.estadoDia}
                  </span>
                </td>

                <td>
                  {row.horasExtra ? (
                    <span
                      className={
                        row.horasExtra.estado === "aprobada"
                          ? "history-badge success"
                          : row.horasExtra.estado === "pendiente"
                            ? "history-badge warning"
                            : "history-badge neutral"
                      }
                      title={`Solicitada: ${row.horasExtra.minutos_solicitados} min | Autorizada: ${row.horasExtra.minutos_autorizados ?? "—"} min | Estado: ${getEstatusLabel(row.horasExtra.estado)}`}
                    >
                      {row.horasExtra.estado === "aprobada"
                        ? `${Math.round((row.horasExtra.minutos_autorizados ?? 0) / 60)}h aprobada`
                        : row.horasExtra.estado === "pendiente"
                          ? `${Math.round(row.horasExtra.minutos_solicitados / 60)}h pendiente`
                          : `${Math.round(row.horasExtra.minutos_solicitados / 60)}h ${getEstatusLabel(row.horasExtra.estado)}`}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  <button
                    type="button"
                    className="icon-button history-eye-button"
                    title="Ver detalle"
                    aria-label="Ver detalle"
                    onClick={() => setSelectedRow(row)}
                  >
                    <EyeIcon size={16} />
                    <span>Ver detalle</span>
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={12}>No hay registros con esos filtros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRow && (
        <div className="access-modal-overlay">
          <div className="access-modal history-modal">
            <button
              type="button"
              className="access-modal-close"
              onClick={() => setSelectedRow(null)}
            >
              ×
            </button>

            <h3>Detalle del acceso</h3>

            <p>
              <strong>Empleado:</strong> {selectedRow.empleado.nombre}
            </p>

            <p>
              <strong>Fecha:</strong> {selectedRow.fecha}
            </p>

            <div className="access-detail-grid">
              {selectedRow.registros.map((registro) => (
                <div className="access-detail-card" key={registro.id_registro}>
                  <h4>{getTipoRegistroLabel(registro.tipo_registro)}</h4>

                  <p>
                    <strong>Hora:</strong> {formatTime(registro.fecha_y_hora)}
                  </p>

                  <p>
                    <strong>Estatus:</strong>{" "}
                    {getEstatusLabel(registro.estatus_registro)}
                  </p>

                  <p>
                    <strong>Dirección:</strong>{" "}
                    {registro.direccion ?? "Sin dirección"}
                  </p>

                  <p>
                    <strong>GPS:</strong> {registro.latitud},{" "}
                    {registro.longitud}
                  </p>

                  {registro.tieneFoto ? (
                    <img
                      src={`${API_URL}/registro-acceso/${registro.id_registro}/foto`}
                      alt={`Evidencia de ${getTipoRegistroLabel(
                        registro.tipo_registro
                      )}`}
                      className="access-photo"
                    />
                  ) : (
                    <p className="employee-info">
                      Este registro no tiene fotografía.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p className="employee-info">
              La gestión de justificaciones o penalizaciones se realiza fuera de
              este sistema.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};