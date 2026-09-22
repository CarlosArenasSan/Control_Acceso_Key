import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { createRegistroAcceso } from "../api/registroAcceso.api";
import { resolveAuthorizedPoint } from "../api/puntosAutorizados.api";
import {
  createSolicitudHoraExtra,
  getMisSolicitudesHorasExtra,
  getSaldoHorasExtra,
  type MiSolicitudHoraExtra,
  type SaldoHorasExtra,
} from "../api/solicitudHoraExtra.api";
import { useAuth } from "../hooks/useAuth";
import {
  ApertureIcon,
  CameraIcon,
  CheckIcon,
  ClockPlusIcon,
  LogOutIcon,
  RefreshIcon,
  XIcon,
} from "./Icons";
import "../App.css";

type CheckType = "entrada" | "salida" | "salida_comida" | "regreso_comida";

export const EmployeeCheckForm = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [tipoRegistro, setTipoRegistro] = useState<CheckType>("entrada");
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [direccion, setDireccion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showHoraExtraModal, setShowHoraExtraModal] = useState(false);
  const [fechaTrabajo, setFechaTrabajo] = useState("");
  const [mesVisible, setMesVisible] = useState(() => {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  });
  const [minutosSolicitados, setMinutosSolicitados] = useState(60);
  const [motivo, setMotivo] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [saldoHoras, setSaldoHoras] = useState<SaldoHorasExtra | null>(null);
  const [misSolicitudes, setMisSolicitudes] = useState<
    MiSolicitudHoraExtra[]
  >([]);
  const [solicitudesLoading, setSolicitudesLoading] = useState(false);

  const hoyKey = (() => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const hoy = new Date(hoyKey + "T00:00:00");

  const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const NOMBRES_ESTADO: Record<string, string> = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    cancelada: "Cancelada",
  };

  const NOMBRES_MINUTOS: Record<number, string> = {
    60: "1 hora",
    120: "2 horas",
    180: "3 horas",
  };

  const formatoFechaHora = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatoFechaKey = (fecha: Date) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const requiresPhoto =
    tipoRegistro === "entrada" || tipoRegistro === "salida";

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const handleLogout = () => {
    stopCamera();
    logout();
    navigate("/login");
  };

  const startCamera = async () => {
    setError("");
    setMessage("");
    setDireccion("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Tu navegador no permite usar la cámara.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }, 0);
    } catch {
      setError(
        "No se pudo acceder a la cámara. Revisa los permisos del navegador."
      );
    }
  };

  const takePhoto = () => {
    setError("");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("No se pudo capturar la fotografía.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError("La cámara aún no está lista. Intenta de nuevo.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("No se pudo procesar la fotografía.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("No se pudo generar la fotografía.");
          return;
        }

        if (photoPreview) {
          URL.revokeObjectURL(photoPreview);
        }

        setPhoto(blob);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const handleTipoRegistroChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as CheckType;

    setTipoRegistro(value);
    setError("");
    setMessage("");
    setDireccion("");
    setPhoto(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview("");
    stopCamera();
  };

  const getInitialGPSPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 15000,
      });
    });
  };

  const getBestGPSPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      let bestPosition: GeolocationPosition | null = null;

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (
            !bestPosition ||
            position.coords.accuracy < bestPosition.coords.accuracy
          ) {
            bestPosition = position;
          }

          if (position.coords.accuracy <= 50) {
            navigator.geolocation.clearWatch(watchId);
            resolve(position);
          }
        },
        (error) => {
          navigator.geolocation.clearWatch(watchId);

          if (bestPosition) {
            resolve(bestPosition);
            return;
          }

          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);

        if (bestPosition) {
          resolve(bestPosition);
          return;
        }

        reject(new Error("No se pudo obtener la ubicación."));
      }, 4500);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setDireccion("");

    if (!navigator.geolocation) {
      setError("Tu navegador no permite obtener la ubicación.");
      return;
    }

    if (requiresPhoto && !photo) {
      setError("Debes tomar una fotografía para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const initialPosition = await getInitialGPSPosition();

      const {
        latitude: initialLatitude,
        longitude: initialLongitude,
        accuracy: initialAccuracy,
      } = initialPosition.coords;

      console.log("GPS inicial:", {
        initialLatitude,
        initialLongitude,
        initialAccuracy,
      });

      const initialPointResult = await resolveAuthorizedPoint(
        initialLatitude,
        initialLongitude
      );

      console.log("Punto autorizado inicial:", initialPointResult);

      let finalLatitude = initialLatitude;
      let finalLongitude = initialLongitude;

      if (!initialPointResult.found) {
        try {
          const bestPosition = await getBestGPSPosition();

          const {
            latitude: bestLatitude,
            longitude: bestLongitude,
            accuracy: bestAccuracy,
          } = bestPosition.coords;

          console.log("GPS mejorado:", {
            bestLatitude,
            bestLongitude,
            bestAccuracy,
          });

          finalLatitude = bestLatitude;
          finalLongitude = bestLongitude;
        } catch {
          console.log("No se pudo obtener GPS mejorado. Se usará GPS inicial.");

          finalLatitude = initialLatitude;
          finalLongitude = initialLongitude;
        }
      }

      const response = await createRegistroAcceso({
        tipoRegistro,
        latitud: finalLatitude,
        longitud: finalLongitude,
        photo: requiresPhoto ? photo : null,
      });

      setMessage(response.message || "Registro de acceso guardado correctamente.");

      setDireccion(
        response.direccion || "No se pudo obtener una dirección aproximada."
      );

      setPhoto(null);

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      setPhotoPreview("");
      stopCamera();
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Activa los permisos de ubicación para registrar tu acceso.");
          return;
        }

        if (err.code === err.TIMEOUT) {
          setError("No se pudo obtener la ubicación a tiempo. Intenta de nuevo.");
          return;
        }
      }

      if (err instanceof Error) {
        setError(err.message);
        return;
      }

      setError("Ocurrió un error al guardar el registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

const openHoraExtraModal = async () => {
    setShowHoraExtraModal(true);
    setModalMessage("");
    setModalError("");
    setFechaTrabajo("");
    setMesVisible(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

    setSolicitudesLoading(true);

    try {
      const [saldo, solicitudes] = await Promise.all([
        getSaldoHorasExtra(),
        getMisSolicitudesHorasExtra(),
      ]);
      setSaldoHoras(saldo);
      setMisSolicitudes(solicitudes);
    } catch (err) {
      setSaldoHoras(null);
      setMisSolicitudes([]);

      if (err instanceof Error) {
        setModalError(err.message);
      }
    } finally {
      setSolicitudesLoading(false);
    }
  };

  const closeHoraExtraModal = () => {
    setShowHoraExtraModal(false);
    setModalMessage("");
    setModalError("");
  };

  const handleHoraExtraSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setModalMessage("");
    setModalError("");

    if (!fechaTrabajo) {
      setModalError("Selecciona la fecha de trabajo.");
      return;
    }

    if (!motivo.trim()) {
      setModalError("Escribe el motivo de la solicitud.");
      return;
    }

    setModalSubmitting(true);

    try {
      await createSolicitudHoraExtra({
        fecha_trabajo: fechaTrabajo,
        minutos_solicitados: minutosSolicitados,
        motivo: motivo.trim(),
      });

      const solicitudes = await getMisSolicitudesHorasExtra();
      setMisSolicitudes(solicitudes);

      setMessage("Solicitud de horas extra enviada correctamente.");
      closeHoraExtraModal();
    } catch (err) {
      if (err instanceof Error) {
        setModalError(err.message);
        return;
      }

      setModalError("Ocurrió un error al enviar la solicitud.");
    } finally {
      setModalSubmitting(false);
    }
  };


  const diasDelMesVisible = (() => {
    const totalDias = new Date(
      mesVisible.getFullYear(),
      mesVisible.getMonth() + 1,
      0
    ).getDate();
    const offsetInicio = (mesVisible.getDay() + 6) % 7;

    const celdas: (Date | null)[] = Array.from(
      { length: offsetInicio },
      () => null
    );

    for (let dia = 1; dia <= totalDias; dia++) {
      celdas.push(
        new Date(mesVisible.getFullYear(), mesVisible.getMonth(), dia)
      );
    }

    return celdas;
  })();

  const esDiaDeshabilitado = (fecha: Date) => {
    const diaSemana = fecha.getDay();
    return fecha < hoy || diaSemana === 0 || diaSemana === 6;
  };

  const esMesActual = (fecha: Date) =>
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth();

  const cambiarMes = (delta: number) => {
    setMesVisible(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const nombreMesVisible = mesVisible.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    return () => {
      stopCamera();

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <div className="employee-layout">
      <header className="employee-header">
        <p>
          Bienvenido, <strong>{user?.fullName || user?.username}</strong>
        </p>

        <button
          type="button"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          onClick={handleLogout}
        >
          <LogOutIcon size={18} />
          <span>Cerrar sesión</span>
        </button>
      </header>

      <section className="employee-card">
        <h1>Registro de Acceso</h1>

        <form onSubmit={handleSubmit} className="employee-form">
          <label>
            Tipo de registro
            <select value={tipoRegistro} onChange={handleTipoRegistroChange}>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="salida_comida">Salida a comida</option>
              <option value="regreso_comida">Regreso de comida</option>
            </select>
          </label>

          {requiresPhoto && (
            <div className="camera-box">
              <p className="camera-title">Evidencia fotográfica</p>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={
                  cameraActive ? "camera-video" : "camera-video camera-hidden"
                }
              />

              {!cameraActive && !photoPreview && (
                <button
                  type="button"
                  title="Activar cámara"
                  aria-label="Activar cámara"
                  onClick={startCamera}
                >
                  <CameraIcon size={20} />
                  <span>Activar cámara</span>
                </button>
              )}

              {cameraActive && (
                <button
                  type="button"
                  title="Tomar foto"
                  aria-label="Tomar foto"
                  onClick={takePhoto}
                >
                  <ApertureIcon size={20} />
                  <span>Tomar foto</span>
                </button>
              )}

              {photoPreview && (
                <>
                  <img
                    src={photoPreview}
                    alt="Fotografía capturada"
                    className="photo-preview"
                  />

                  <button
                    type="button"
                    title="Tomar otra foto"
                    aria-label="Tomar otra foto"
                    onClick={() => {
                      setPhoto(null);

                      if (photoPreview) {
                        URL.revokeObjectURL(photoPreview);
                      }

                      setPhotoPreview("");
                      startCamera();
                    }}
                  >
                    <RefreshIcon size={20} />
                    <span>Tomar otra foto</span>
                  </button>
                </>
              )}

              <canvas ref={canvasRef} className="hidden-canvas" />
            </div>
          )}

          {!requiresPhoto && (
            <p className="employee-info">
              Este tipo de registro no requiere evidencia fotográfica.
            </p>
          )}

          {error && <p className="login-error">{error}</p>}

          {message && <p className="employee-success">{message}</p>}

          {direccion && (
            <p className="employee-address">
              <strong>Dirección obtenida:</strong>
              <br />
              {direccion}
            </p>
          )}

          
          <button
            type="submit"
            title="Registrar acceso"
            aria-label="Registrar acceso"
            disabled={isSubmitting}
          >
            <CheckIcon size={22} />
            <span>{isSubmitting ? "Registrando..." : "Registrar acceso"}</span>
          </button>
        </form>

        <button
          type="button"
          className="hora-extra-open-button"
          title="Solicitar horas extra"
          aria-label="Solicitar horas extra"
          onClick={openHoraExtraModal}
        >
          <ClockPlusIcon size={20} />
          <span>Solicitar horas extra</span>
        </button>
      </section>

      {showHoraExtraModal && (
        <div
          className="access-modal-overlay hora-extra-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeHoraExtraModal();
            }
          }}
        >
          <div className="access-modal hora-extra-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              className="access-modal-close"
              title="Cerrar"
              aria-label="Cerrar"
              onClick={closeHoraExtraModal}
            >
              <XIcon size={20} />
            </button>

            <h3>Solicitar horas extra</h3>

            {saldoHoras && (
              <p className="hora-extra-saldo">
                Días disponibles esta semana:{" "}
                <strong>{saldoHoras.dias_disponibles}</strong> de{" "}
                {saldoHoras.limite_dias}
              </p>
            )}

            <form
              onSubmit={handleHoraExtraSubmit}
              className="hora-extra-form"
            >
              <div className="hora-extra-fecha">
              <span className="hora-extra-fecha-titulo">Fecha de trabajo</span>

              <div className="hora-extra-calendario">
                <div className="hora-extra-calendario-nav">
                  <button
                    type="button"
                    aria-label="Mes anterior"
                    disabled={esMesActual(mesVisible)}
                    onClick={() => cambiarMes(-1)}
                  >
                    ‹
                  </button>

                  <strong>{nombreMesVisible}</strong>

                  <button
                    type="button"
                    aria-label="Mes siguiente"
                    onClick={() => cambiarMes(1)}
                  >
                    ›
                  </button>
                </div>

                <div className="calendario-dias-semana">
                  {DIAS_SEMANA.map((dia) => (
                    <span key={dia}>{dia}</span>
                  ))}
                </div>

                <div className="calendario-dias">
                  {diasDelMesVisible.map((fecha, index) => {
                    if (!fecha) {
                      return (
                        <span className="calendario-dia-vacio" key={index} />
                      );
                    }

                    const fechaKey = formatoFechaKey(fecha);
                    const deshabilitado = esDiaDeshabilitado(fecha);

                    return (
                      <button
                        type="button"
                        key={fechaKey}
                        className={[
                          "calendario-dia",
                          fechaTrabajo === fechaKey
                            ? "hora-extra-dia-seleccionado"
                            : "",
                          deshabilitado
                            ? "hora-extra-dia-deshabilitado"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={deshabilitado}
                        onClick={() => setFechaTrabajo(fechaKey)}
                      >
                        <span>{fecha.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {fechaTrabajo && (
                <span className="hora-extra-fecha-seleccionada">
                  Día seleccionado:{" "}
                  <strong>
                    {new Date(
                      fechaTrabajo + "T00:00:00"
                    ).toLocaleDateString("es-MX", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>
                </span>
              )}
            </div>

              <label>
                Horas a solicitar
                <select
                  value={minutosSolicitados}
                  onChange={(event) =>
                    setMinutosSolicitados(Number(event.target.value))
                  }
                >
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                  <option value={180}>3 horas</option>
                </select>
              </label>

              <label className="hora-extra-motivo">
                Motivo
                <textarea
                  value={motivo}
                  maxLength={500}
                  placeholder="Describe el motivo de tu solicitud..."
                  onChange={(event) => setMotivo(event.target.value)}
                />
              </label>

              {modalError && <p className="hora-extra-error">{modalError}</p>}

              {modalMessage && (
                <p className="hora-extra-success">{modalMessage}</p>
              )}

              <div className="hora-extra-acciones">
                <button
                  type="button"
                  className="hora-extra-boton-secundario"
                  onClick={closeHoraExtraModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="hora-extra-boton-principal"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>

            <div className="hora-extra-mis-solicitudes">
              <h4>Mis solicitudes</h4>

              {solicitudesLoading ? (
                <p className="employee-info">Cargando solicitudes...</p>
              ) : misSolicitudes.length === 0 ? (
                <p className="employee-info">
                  Aún no tienes solicitudes de horas extra.
                </p>
              ) : (
                <ul className="hora-extra-solicitud-list">
                  {misSolicitudes.map((solicitud) => (
                    <li
                      className="hora-extra-solicitud-item"
                      key={solicitud.id_solicitud}
                    >
                      <div className="hora-extra-solicitud-head">
                        <strong>
                          {new Date(
                            solicitud.fecha_trabajo + "T00:00:00"
                          ).toLocaleDateString("es-MX", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </strong>

                        <span
                          className={`solicitud-estado solicitud-estado-${solicitud.estado}`}
                        >
                          {NOMBRES_ESTADO[solicitud.estado]}
                        </span>
                      </div>

                      <p>
                        {NOMBRES_MINUTOS[solicitud.minutos_solicitados] ??
                          `${solicitud.minutos_solicitados} minutos`}{" "}
                        {solicitud.estado === "aprobada" &&
                        solicitud.minutos_autorizados
                          ? `(autorizada: ${
                              NOMBRES_MINUTOS[
                                solicitud.minutos_autorizados
                              ] ?? `${solicitud.minutos_autorizados} minutos`
                            })`
                          : ""}
                        <span className="hora-extra-solicitud-fecha">
                          Solicitada el {formatoFechaHora(solicitud.fecha_solicitud)}
                        </span>
                      </p>

                      {solicitud.comentario_respuesta && (
                        <p className="hora-extra-solicitud-comentario">
                          <strong>Comentario del administrador:</strong>{" "}
                          {solicitud.comentario_respuesta}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};