import {
  getAuthHeaders,
  getAuthJsonHeaders,
  handleUnauthorized,
} from "./authHeaders";
import { cachedGet, invalidateCache } from "./cache";

export interface PuntoAutorizado {
  id_punto: number;
  nombre: string;
  latitud: number;
  longitud: number;
  radio_metros: number;
  direccion_fija: string;
  activo: boolean;
  created_at: string;
}

interface CreatePuntoData {
  nombre: string;
  latitud: number;
  longitud: number;
  radio_metros: number;
  direccion_fija: string;
}

interface ResolveLocationResponse {
  found: boolean;
  direccion: string | null;
  punto: {
    id_punto: number;
    nombre: string;
    direccion_fija: string;
    radio_metros: number;
  } | null;
}

const API_URL = "/api/puntos-autorizados";

const PUNTOS_TTL = 60_000;

export const getPuntosAutorizados = async (): Promise<PuntoAutorizado[]> => {
  return cachedGet(API_URL, PUNTOS_TTL, async () => {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    handleUnauthorized(response);

    if (!response.ok) {
      throw new Error("No se pudieron obtener los puntos autorizados.");
    }

    return response.json();
  });
};

export const createPuntoAutorizado = async (
  data: CreatePuntoData
): Promise<PuntoAutorizado> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify({
      ...data,
      activo: true,
    }),
  });

  handleUnauthorized(response);

  invalidateCache([API_URL]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo crear el punto autorizado.");
  }

  return response.json();
};

export const updatePuntoStatus = async (
  id: number,
  activo: boolean
): Promise<PuntoAutorizado> => {
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
    throw new Error(error.message || "No se pudo actualizar el punto.");
  }

  return response.json();
};

export const deletePuntoAutorizado = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthJsonHeaders(),
    credentials: "include",
  });

  handleUnauthorized(response);

  invalidateCache([API_URL]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo eliminar el punto.");
  }
};

export const resolveAuthorizedPoint = async (
  latitud: number,
  longitud: number
): Promise<ResolveLocationResponse> => {
  const response = await fetch(`${API_URL}/resolve-location`, {
    method: "POST",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify({ latitud, longitud }),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error("No se pudo validar la ubicación.");
  }

  return response.json();
};