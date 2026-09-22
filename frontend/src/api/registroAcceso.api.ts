import {
  getAuthHeaders,
  getAuthJsonHeaders,
  handleUnauthorized,
} from "./authHeaders";
import { cachedGet, invalidateCache } from "./cache";

type TipoRegistro = "entrada" | "salida" | "salida_comida" | "regreso_comida";

interface CreateRegistroData {
  tipoRegistro: TipoRegistro;
  latitud: number;
  longitud: number;
  photo: Blob | null;
}

interface CreateRegistroResponse {
  message: string;
  direccion: string | null;
  registro: {
    id_registro: number;
    tipo_registro: TipoRegistro;
    latitud: number;
    longitud: number;
    direccion: string | null;
    fecha_y_hora: string;
    num_empleado: number;
  };
}

const API_URL = "/api/registro-acceso";

export const createRegistroAcceso = async (
  data: CreateRegistroData
): Promise<CreateRegistroResponse> => {
  const formData = new FormData();
  formData.append("tipo_registro", data.tipoRegistro);
  formData.append("latitud", String(data.latitud));
  formData.append("longitud", String(data.longitud));

  if (data.photo) {
    formData.append("fotografia", data.photo, "evidencia.jpg");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData,
  });

  handleUnauthorized(response);

  invalidateCache([
    "/api/admin-dashboard",
    "/api/registro-historial",
    "/api/registro-acceso/manual/hoy",
  ]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo guardar el registro.");
  }

  return response.json();
};

export const createRegistroManual = async (data: {
  id_empleado: number;
  tipo_registro: string;
  fecha: string;
  hora: string;
  tipo_direccion: "manual" | "punto";
  id_punto?: number;
  direccion_manual?: string;
  observacion?: string;
}) => {
  const response = await fetch(`${API_URL}/manual`, {
    method: "POST",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });

  handleUnauthorized(response);

  invalidateCache([
    "/api/registro-acceso/manual/hoy",
    "/api/admin-dashboard",
    "/api/registro-historial",
  ]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo guardar el registro manual.");
  }

  return response.json();
};

export interface RegistroManualHoy {
  id_registro: number;
  tipo_registro: TipoRegistro;
  fecha_y_hora: string;
  direccion: string | null;
  empleado: {
    id_empleado: number;
    nombre: string;
    apellido_paterno: string;
  };
}

const MANUALES_HOY_TTL = 15_000;

export const getRegistrosManualesHoy = async (): Promise<RegistroManualHoy[]> => {
  return cachedGet(`${API_URL}/manual/hoy`, MANUALES_HOY_TTL, async () => {
    const response = await fetch(`${API_URL}/manual/hoy`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    handleUnauthorized(response);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los registros manuales de hoy.");
    }

    return response.json();
  });
};