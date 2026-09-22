import { type FormEvent, useEffect, useState } from "react";
import {
  createPuntoAutorizado,
  getPuntosAutorizados,
  updatePuntoStatus,
  deletePuntoAutorizado,
  type PuntoAutorizado,
} from "../api/puntosAutorizados.api";
import { CheckIcon, PowerIcon, SaveIcon, TrashIcon } from "./Icons";
import "../App.css";

export const AuthorizedPointsPanel = () => {
  const [puntos, setPuntos] = useState<PuntoAutorizado[]>([]);
  const [nombre, setNombre] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [radioMetros, setRadioMetros] = useState("250");
  const [direccionFija, setDireccionFija] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadPuntos = async () => {
    try {
      setError("");
      const data = await getPuntosAutorizados();
      setPuntos(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPuntos();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!nombre.trim()) {
      setError("Ingresa el nombre del punto.");
      return;
    }

    if (!latitud.trim() || Number.isNaN(Number(latitud))) {
      setError("Ingresa una latitud válida.");
      return;
    }

    if (!longitud.trim() || Number.isNaN(Number(longitud))) {
      setError("Ingresa una longitud válida.");
      return;
    }

    if (!radioMetros.trim() || Number(radioMetros) <= 0) {
      setError("Ingresa un radio permitido válido.");
      return;
    }

    if (!direccionFija.trim()) {
      setError("Ingresa la dirección fija.");
      return;
    }

    setIsLoading(true);

    try {
      await createPuntoAutorizado({
        nombre: nombre.trim(),
        latitud: Number(latitud),
        longitud: Number(longitud),
        radio_metros: Number(radioMetros),
        direccion_fija: direccionFija.trim(),
      });

      setMessage("Punto autorizado guardado correctamente.");

      setNombre("");
      setLatitud("");
      setLongitud("");
      setRadioMetros("250");
      setDireccionFija("");

      await loadPuntos();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatus = async (id: number, activo: boolean) => {
    setMessage("");
    setError("");

    try {
      await updatePuntoStatus(id, activo);
      setMessage(
        activo
          ? "Punto activado correctamente."
          : "Punto desactivado correctamente."
      );

      await loadPuntos();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar este punto autorizado?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await deletePuntoAutorizado(id);

      setMessage("Punto autorizado eliminado correctamente.");

      await loadPuntos();
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

      <div className="admin-points-grid">
        <form className="admin-point-card" onSubmit={handleSubmit}>
          <h3>Nuevo punto</h3>

          <label>
            Nombre del punto
            <input
              type="text"
              placeholder="Ej. Punto Centro"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label>
            Latitud
            <input
              type="text"
              placeholder="Ej. 21.145523"
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
            />
          </label>

          <label>
            Longitud
            <input
              type="text"
              placeholder="Ej. -101.665347"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
            />
          </label>

          <label>
            Radio permitido
            <input
              type="number"
              placeholder="Ej. 250"
              value={radioMetros}
              onChange={(e) => setRadioMetros(e.target.value)}
            />
          </label>

          <label>
            Dirección fija
            <textarea
              placeholder="Dirección que se mostrará si el empleado cae dentro del rango"
              value={direccionFija}
              onChange={(e) => setDireccionFija(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="icon-button"
            title={isLoading ? "Guardando..." : "Guardar punto"}
            aria-label={isLoading ? "Guardando..." : "Guardar punto"}
            disabled={isLoading}
          >
            <SaveIcon size={20} />
            <span>{isLoading ? "Guardando..." : "Guardar"}</span>
          </button>
        </form>

        <div className="admin-point-card">
          <h3>Puntos registrados</h3>

          {puntos.length === 0 && (
            <p>No hay puntos autorizados registrados.</p>
          )}

          <div className="registered-points-list">
            {puntos.map((punto) => (
              <div className="registered-point-item" key={punto.id_punto}>
                <div>
                  <h4>{punto.nombre}</h4>
                  <p>{punto.direccion_fija}</p>
                  <span>Radio: {punto.radio_metros} m</span>
                  <br />
                  <span>
                    Estado:{" "}
                    <strong>{punto.activo ? "Activo" : "Inactivo"}</strong>
                  </span>
                </div>

                <div className="point-actions">
                  <button
                    type="button"
                    className="icon-button point-active-button"
                    title="Activar"
                    aria-label="Activar"
                    disabled={punto.activo}
                    onClick={() => handleChangeStatus(punto.id_punto, true)}
                  >
                    <CheckIcon size={15} />
                    <span>Activar</span>
                  </button>

                  <button
                    type="button"
                    className="icon-button point-inactive-button"
                    title="Desactivar"
                    aria-label="Desactivar"
                    disabled={!punto.activo}
                    onClick={() => handleChangeStatus(punto.id_punto, false)}
                  >
                    <PowerIcon size={15} />
                    <span>Desactivar</span>
                  </button>

                  <button
                    type="button"
                    className="icon-button point-delete-button"
                    title="Eliminar"
                    aria-label="Eliminar"
                    onClick={() => handleDelete(punto.id_punto)}
                  >
                    <TrashIcon size={15} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};