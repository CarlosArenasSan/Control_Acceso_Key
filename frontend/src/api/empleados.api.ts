import {
  getAuthHeaders,
  getAuthJsonHeaders,
  handleUnauthorized,
} from "./authHeaders";
import { cachedGet, invalidateCache } from "./cache";

export interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  username: string;
  activo: boolean;
  created_at: string;
}

export interface CreateEmpleadoData {
  id_empleado: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  username: string;
  password: string;
  activo: boolean;
}

export interface UpdateEmpleadoData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  username: string;
  password?: string;
  activo: boolean;
}

const API_URL = "/api/empleados";

const EMPLEADOS_TTL = 60_000;

export const getEmpleados = async (): Promise<Empleado[]> => {
  return cachedGet(API_URL, EMPLEADOS_TTL, async () => {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    handleUnauthorized(response);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los empleados.");
    }

    return response.json();
  });
};

export const createEmpleado = async (
  data: CreateEmpleadoData
): Promise<Empleado> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });

  handleUnauthorized(response);

  const result = await response.json();

  invalidateCache([API_URL]);

  if (!response.ok) {
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(" ")
        : result.message || "No se pudo crear el empleado."
    );
  }

  return result;
};

export const updateEmpleado = async (
  id: number,
  data: UpdateEmpleadoData
): Promise<Empleado> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });

  handleUnauthorized(response);

  const result = await response.json();

  invalidateCache([API_URL]);

  if (!response.ok) {
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(" ")
        : result.message || "No se pudo actualizar el empleado."
    );
  }

  return result;
};

export const deleteEmpleado = async (
  id: number
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  handleUnauthorized(response);

  const result = await response.json();

  invalidateCache([API_URL]);

  if (!response.ok) {
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(" ")
        : result.message || "No se pudo eliminar/desactivar el empleado."
    );
  }

  return result;
};