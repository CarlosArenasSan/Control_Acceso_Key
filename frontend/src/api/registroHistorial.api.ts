import { getAuthHeaders, handleUnauthorized } from "./authHeaders";
import { cachedGet } from "./cache";

export interface HistoryRow {
  fecha: string;
  empleado: {
    id_empleado: number;
    nombre: string;
  };
  entrada: {
    hora: string;
    estatus: string | null;
    direccion: string | null;
    latitud: number;
    longitud: number;
    tieneFoto: boolean;
  } | null;
  comida: {
    salida: string | null;
    regreso: string | null;
    minutos: number | null;
    excedido: boolean;
    salidaDireccion: string | null;
    salidaGps: string | null;
    regresoDireccion: string | null;
    regresoGps: string | null;
  };
  salida: {
    hora: string;
    estatus: string | null;
    direccion: string | null;
    latitud: number;
    longitud: number;
    tieneFoto: boolean;
  } | null;
  direccionRegistro: string | null;
  gpsRegistro: string | null;
  estadoDia: string;
  incidencias: {
    retardo: boolean;
    excesoComida: boolean;
    salidaFueraRango: boolean;
    ausencia: boolean;
  };
  horasExtra: {
    minutos_solicitados: number;
    minutos_autorizados: number | null;
    estado: string;
  } | null;
  registros: {
    id_registro: number;
    tipo_registro: string;
    estatus_registro: string | null;
    fecha_y_hora: string;
    direccion: string | null;
    latitud: number;
    longitud: number;
    tieneFoto: boolean;
  }[];
}

const API_URL = "/api/registro-historial";

const HISTORIAL_TTL = 30_000;

export const getRegistroHistorial = async (filters: {
  desde: string;
  hasta: string;
  empleado: string;
  incidencia: string;
  estadoEmpleado: string;
}): Promise<HistoryRow[]> => {
  const params = new URLSearchParams();

  if (filters.desde) params.append("desde", filters.desde);
  if (filters.hasta) params.append("hasta", filters.hasta);
  if (filters.empleado) params.append("empleado", filters.empleado);
  if (filters.incidencia) params.append("incidencia", filters.incidencia);
  if (filters.estadoEmpleado) params.append("estadoEmpleado", filters.estadoEmpleado);

  const url = `${API_URL}?${params.toString()}`;

  return cachedGet(url, HISTORIAL_TTL, async () => {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    handleUnauthorized(response);

    if (!response.ok) {
      throw new Error("No se pudo cargar el historial.");
    }

    return response.json();
  });
};