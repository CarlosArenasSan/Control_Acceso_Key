import { getAuthHeaders } from "./authHeaders";

export type UserRole = "admin" | "empleado";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  fullName: string;
}

export interface LoginResponse {
  user: AuthUser;
  expiresAt: number;
}

const API_URL = "/api/auth/login";

export const loginRequest = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "No se pudo iniciar sesión.");
  }

  return response.json();
};

export const meRequest = async (): Promise<AuthUser> => {
  const response = await fetch("/api/auth/me", {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Sesión inválida o expirada.");
  }

  const data = await response.json();
  return data.user;
};

export const logoutRequest = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo cerrar sesión.");
  }
};