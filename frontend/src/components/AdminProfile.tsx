import "../App.css";

interface AdminProfileProps {
  user?: {
    id: number;
    username: string;
    fullName?: string;
    role: string;
  } | null;
}

export const AdminProfile = ({ user }: AdminProfileProps) => {
  return (
    <div className="admin-placeholder">
      <h2>Administrador: {user?.fullName || user?.username}</h2>

      <div className="admin-profile-card">
        <div className="admin-profile-avatar">👤</div>

        <div className="admin-profile-info">
          <h3>{user?.fullName || user?.username || "Administrador"}</h3>

          <p>
            <strong>ID:</strong> {user?.id}
          </p>

          <p>
            <strong>Usuario:</strong> {user?.username}
          </p>

          <p>
            <strong>Rol:</strong> Administrador
          </p>
        </div>
      </div>
    </div>
  );
};