import { useAuth } from "../../hooks/useAuth";

export const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <main style={{ padding: "32px" }}>
      <h1>Bienvenido al sistema</h1>

      <p>
        Usuario: <strong>{user?.username}</strong>
      </p>

      <p>
        Rol: <strong>{user?.role}</strong>
      </p>

      <button onClick={logout}>Cerrar sesión</button>
    </main>
  );
};