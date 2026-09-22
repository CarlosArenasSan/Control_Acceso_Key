import {
  getAuthHeaders,
  getAuthJsonHeaders,
  handleUnauthorized,
} from "./authHeaders";
import { cachedGet, invalidateCache } from "./cache";

export type TipoJornada =
  | "jornada_completa"
  | "media_jornada"
  | "no_laborable";

export interface FechaEspecial {
  id_fecha_especial: number;
  fecha: string;
  nombre: string;
  tipo_jornada: TipoJornada;
  hora_inicio_entrada: string | null;
  hora_fin_entrada: string | null;
  hora_inicio_salida: string | null;
  hora_fin_salida: string | null;
  requiere_comida: boolean;
  observaciones: string | null;
  activo: boolean;
  id_admin: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFechaEspecialData {
  fecha: string;
  nombre: string;
  tipo_jornada: TipoJornada;
  observaciones?: string;
}

const API_URL = "/api/fechas-especiales";

const FECHAS_TTL = 60_000;

export const getFechasEspeciales = async (): Promise<FechaEspecial[]> => {
  return cachedGet(API_URL, FECHAS_TTL, async () => {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    handleUnauthorized(response);

    if (!response.ok) {
      throw new Error("No se pudieron obtener las fechas especiales.");
    }

    return response.json();
  });
};

export const createFechaEspecial = async (
  data: CreateFechaEspecialData
): Promise<FechaEspecial> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });

  handleUnauthorized(response);

  invalidateCache([API_URL]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo guardar la fecha especial.");
  }

  return response.json();
};

export const updateFechaEspecial = async (
  id: number,
  data: Partial<CreateFechaEspecialData>
): Promise<FechaEspecial> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });

  handleUnauthorized(response);

  invalidateCache([API_URL]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo actualizar la fecha especial.");
  }

  return response.json();
};

export const updateFechaEspecialStatus = async (
  id: number,
  activo: boolean
): Promise<FechaEspecial> => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify({ activo }),
  });

  handleUnauthorized(response);

  invalidateCache([API_URL]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo actualizar el estado.");
  }

  return response.json();
};