import {
  getAuthHeaders,
  getAuthJsonHeaders,
  handleUnauthorized,
} from "./authHeaders";
import { cachedGet, invalidateCache } from "./cache";

export interface CreateSolicitudHoraExtraData {
  fecha_trabajo: string;
  minutos_solicitados: number;
  motivo: string;
}

export interface SaldoHorasExtra {
  limite_dias: number;
  dias_ocupados: number;
  dias_disponibles: number;
  minutos_aprobados: number;
  minutos_pendientes: number;
}

export type EstadoSolicitud =
  | "pendiente"
  | "aprobada"
  | "rechazada"
  | "cancelada";

export interface SolicitudEmpleado {
  id_empleado: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  username: string;
  activo: boolean;
}

export interface SolicitudAdministrador {
  id_admin: number;
  username: string;
}

export interface SolicitudHoraExtra {
  id_solicitud: number;
  id_empleado: number;
  fecha_trabajo: string;
  minutos_solicitados: number;
  motivo: string;
  estado: EstadoSolicitud;
  minutos_autorizados: number | null;
  comentario_respuesta: string | null;
  id_admin_respuesta: number | null;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  empleado: SolicitudEmpleado;
  administrador: SolicitudAdministrador | null;
}

export interface MiSolicitudHoraExtra {
  id_solicitud: number;
  id_empleado: number;
  fecha_trabajo: string;
  minutos_solicitados: number;
  motivo: string;
  estado: EstadoSolicitud;
  minutos_autorizados: number | null;
  comentario_respuesta: string | null;
  id_admin_respuesta: number | null;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResponderSolicitudData {
  estado: "aprobada" | "rechazada";
  minutos_autorizados?: number;
  comentario_respuesta?: string;
}

const API_URL = "/api/solicitudes-horas-extra";

const SOLICITUDES_TTL = 60_000;

export const createSolicitudHoraExtra = async (
  data: CreateSolicitudHoraExtraData
) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo enviar la solicitud.");
  }

  invalidateCache([API_URL]);

  return response.json();
};

export const getSaldoHorasExtra = async (): Promise<SaldoHorasExtra> => {
  const response = await fetch(`${API_URL}/mi-saldo`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error("No se pudo cargar el saldo de horas extra.");
  }

  return response.json();
};

export const getMisSolicitudesHorasExtra = async (): Promise<
  MiSolicitudHoraExtra[]
> => {
  const response = await fetch(`${API_URL}/mias`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error("No se pudieron cargar tus solicitudes de horas extra.");
  }

  return response.json();
};

export const getSolicitudesHorasExtra = async (): Promise<
  SolicitudHoraExtra[]
> => {
  return cachedGet(API_URL, SOLICITUDES_TTL, async () => {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    handleUnauthorized(response);

    if (!response.ok) {
      throw new Error("No se pudieron obtener las solicitudes de horas extra.");
    }

    return response.json();
  });
};

export const responderSolicitudHoraExtra = async (
  id: number,
  data: ResponderSolicitudData
): Promise<SolicitudHoraExtra> => {
  const response = await fetch(`${API_URL}/${id}/responder`, {
    method: "PATCH",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });

  handleUnauthorized(response);

  invalidateCache([API_URL]);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo responder la solicitud.");
  }

  return response.json();
};
