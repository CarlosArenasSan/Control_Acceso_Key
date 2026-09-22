import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { verifySession } = useAuth();
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    verifySession().then((isValid) => {
      if (mounted) setValid(isValid);
    });

    return () => {
      mounted = false;
    };
  }, [verifySession]);

  if (valid === null) {
    return null;
  }

  return valid ? <Outlet /> : <Navigate to="/login" replace />;
};
