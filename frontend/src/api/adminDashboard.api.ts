import { getAuthHeaders, handleUnauthorized } from "./authHeaders";
import { cachedGet } from "./cache";

export interface StartPanelData {
  kpis: {
    presentes: number;
    retardos: number;
    enComida: number;
    excedidosComida: number;
    ausencias: number;
    horasExtraAprobadas: number;
  };
  puntualidadSemanal: {
    dia: string;
    aTiempo: number;
    retardos: number;
  }[];
  incidencias: {
    id_registro: number;
    empleado: string;
    tipo: string;
    detalle: string;
    fecha_y_hora: string;
    horasExtra: {
      minutos_solicitados: number;
      minutos_autorizados: number | null;
      estado: string;
    } | null;
  }[];
}

const API_URL = "/api/admin-dashboard";

const START_PANEL_TTL = 15_000;

export const getStartPanelData = async (): Promise<StartPanelData> => {
  return cachedGet(`${API_URL}/start-panel`, START_PANEL_TTL, async () => {
    const response = await fetch(`${API_URL}/start-panel`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    handleUnauthorized(response);

    if (!response.ok) {
      throw new Error("No se pudo cargar la vista general.");
    }

    return response.json();
  });
};