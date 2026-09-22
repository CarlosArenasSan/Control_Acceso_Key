import { type FormEvent, useEffect, useState } from "react";
import {
  createEmpleado,
  deleteEmpleado,
  getEmpleados,
  updateEmpleado,
  type Empleado,
} from "../api/empleados.api";
import {
  PencilIcon,
  PowerIcon,
  SaveIcon,
  TrashIcon,
  XIcon,
} from "./Icons";
import "../App.css";

export const EmployeeManagementPanel = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(
    null
  );

  const [idEmpleado, setIdEmpleado] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activo, setActivo] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(selectedEmpleado);

  const loadEmpleados = async () => {
    try {
      const data = await getEmpleados();
      setEmpleados(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEmpleados();
  }, []);

  const resetForm = () => {
    setSelectedEmpleado(null);
    setIdEmpleado("");
    setNombre("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setUsername("");
    setPassword("");
    setActivo(true);
  };

  const handleEdit = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setIdEmpleado(String(empleado.id_empleado));
    setNombre(empleado.nombre);
    setApellidoPaterno(empleado.apellido_paterno);
    setApellidoMaterno(empleado.apellido_materno || "");
    setUsername(empleado.username);
    setPassword("");
    setActivo(Boolean(empleado.activo));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!idEmpleado.trim() || Number.isNaN(Number(idEmpleado))) {
      setError("Ingresa un ID de empleado válido.");
      return;
    }

    if (!nombre.trim()) {
      setError("Ingresa el nombre del empleado.");
      return;
    }

    if (!apellidoPaterno.trim()) {
      setError("Ingresa el apellido paterno.");
      return;
    }

    if (!username.trim()) {
      setError("Ingresa el username.");
      return;
    }

    if (!isEditing && !password.trim()) {
      setError("Ingresa una contraseña para el empleado.");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && selectedEmpleado) {
        await updateEmpleado(selectedEmpleado.id_empleado, {
          nombre: nombre.trim(),
          apellido_paterno: apellidoPaterno.trim(),
          apellido_materno: apellidoMaterno.trim(),
          username: username.trim(),
          password: password.trim() || undefined,
          activo,
        });

        setMessage("Empleado actualizado correctamente.");
      } else {
        await createEmpleado({
          id_empleado: Number(idEmpleado),
          nombre: nombre.trim(),
          apellido_paterno: apellidoPaterno.trim(),
          apellido_materno: apellidoMaterno.trim(),
          username: username.trim(),
          password: password.trim(),
          activo,
        });

        setMessage("Empleado agregado correctamente.");
      }

      resetForm();
      await loadEmpleados();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (empleado: Empleado) => {
    const nuevoActivo = !empleado.activo;

    const confirmar = window.confirm(
      nuevoActivo
        ? `¿Deseas activar al empleado ${empleado.nombre} ${empleado.apellido_paterno}?`
        : `¿Deseas desactivar al empleado ${empleado.nombre} ${empleado.apellido_paterno}?`
    );

    if (!confirmar) return;

    setMessage("");
    setError("");

    try {
      await updateEmpleado(empleado.id_empleado, {
        nombre: empleado.nombre,
        apellido_paterno: empleado.apellido_paterno,
        apellido_materno: empleado.apellido_materno || undefined,
        username: empleado.username,
        activo: nuevoActivo,
      });

      setMessage(
        nuevoActivo
          ? "Empleado activado correctamente."
          : "Empleado desactivado correctamente."
      );

      await loadEmpleados();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {    const confirmar = window.confirm(
      "¿Deseas continuar? Si el empleado no tiene historial, se eliminará permanentemente. Si tiene historial, solo se desactivará."
    );

    if (!confirmar) return;

    try {
      const response = await deleteEmpleado(id);

      setMessage(response.message || "Operación realizada correctamente.");

      await loadEmpleados();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="admin-placeholder">
      {error && <p className="login-error">{error}</p>}
      {message && <p className="employee-success">{message}</p>}

      <div className="employee-management-grid">
        <form className="employee-admin-form" onSubmit={handleSubmit}>
          <h3>{isEditing ? "Actualizar empleado" : "Agregar empleado"}</h3>

          <label>
            ID empleado
            <input
              type="number"
              value={idEmpleado}
              disabled={isEditing}
              onChange={(e) => setIdEmpleado(e.target.value)}
            />
          </label>

          <label>
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label>
            Apellido paterno
            <input
              type="text"
              value={apellidoPaterno}
              onChange={(e) => setApellidoPaterno(e.target.value)}
            />
          </label>

          <label>
            Apellido materno
            <input
              type="text"
              value={apellidoMaterno}
              onChange={(e) => setApellidoMaterno(e.target.value)}
            />
          </label>

          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label>
            Contraseña {isEditing && "(opcional)"}
            <input
              type="password"
              placeholder={
                isEditing ? "Dejar vacío para no cambiar" : "Contraseña"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="employee-active-row">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
            />
            Empleado activo
          </label>

          <div className="employee-form-actions">
            <button
              type="submit"
              className="icon-button"
              title={isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Agregar"}
              aria-label={isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Agregar"}
              disabled={isLoading}
            >
              <SaveIcon size={20} />
              <span>
                {isLoading
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar"
                    : "Agregar"}
              </span>
            </button>

            {isEditing && (
              <button
                type="button"
                className="icon-button"
                title="Cancelar"
                aria-label="Cancelar"
                onClick={resetForm}
              >
                <XIcon size={20} />
                <span>Cancelar</span>
              </button>
            )}
          </div>
        </form>

        <div className="employee-table-card">
          <h3>Empleados registrados</h3>

          <div className="employee-table-wrapper">
            <table className="employee-admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre completo</th>
                  <th>Username</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {empleados.map((empleado) => (
                  <tr key={empleado.id_empleado}>
                    <td>{empleado.id_empleado}</td>
                    <td>
                      {empleado.nombre} {empleado.apellido_paterno}{" "}
                      {empleado.apellido_materno || ""}
                    </td>
                    <td>{empleado.username}</td>
                    <td>
                      <span
                        className={
                          empleado.activo
                            ? "employee-status active"
                            : "employee-status inactive"
                        }
                      >
                        {empleado.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="employee-table-actions">
                        <button
                          type="button"
                          className={
                            empleado.activo
                              ? "icon-button employee-toggle-button active"
                              : "icon-button employee-toggle-button"
                          }
                          title={
                            empleado.activo ? "Desactivar" : "Activar"
                          }
                          aria-label={empleado.activo ? "Desactivar" : "Activar"}
                          onClick={() => handleToggleActive(empleado)}
                        >
                          <PowerIcon size={16} />
                          <span>{empleado.activo ? "Desactivar" : "Activar"}</span>
                        </button>

                        <button
                          type="button"
                          className="icon-button"
                          title="Actualizar"
                          aria-label="Actualizar"
                          onClick={() => handleEdit(empleado)}
                        >
                          <PencilIcon size={16} />
                          <span>Actualizar</span>
                        </button>

                        <button
                          type="button"
                          className="icon-button employee-delete-button"
                          title="Eliminar"
                          aria-label="Eliminar"
                          onClick={() => handleDelete(empleado.id_empleado)}
                        >
                          <TrashIcon size={16} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {empleados.length === 0 && (
                  <tr>
                    <td colSpan={5}>No hay empleados registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};