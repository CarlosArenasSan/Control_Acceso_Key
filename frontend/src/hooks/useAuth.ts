import { useCallback, useState } from "react";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  type AuthUser,
  type LoginRequest,
} from "../api/auth.api";

const USER_KEY = "auth_user";
const SESSION_EXPIRES_KEY = "session_expires_at";

let sessionValidated = false;

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const logout = useCallback(async () => {
    sessionValidated = false;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
    setUser(null);

    try {
      await logoutRequest();
    } catch {
      // Si el servidor no responde, la cookie expira por sí sola.
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await loginRequest(credentials);

    sessionValidated = true;
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(SESSION_EXPIRES_KEY, String(response.expiresAt));

    setUser(response.user);
    return response.user;
  };

  const verifySession = useCallback(async (): Promise<boolean> => {
    const storedUser = localStorage.getItem(USER_KEY);
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);

    if (!storedUser || !expiresAt || Date.now() > Number(expiresAt)) {
      await logout();
      return false;
    }

    if (sessionValidated) {
      return true;
    }

    try {
      await meRequest();
      sessionValidated = true;
      return true;
    } catch {
      await logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    login,
    logout,
    verifySession,
  };
};
