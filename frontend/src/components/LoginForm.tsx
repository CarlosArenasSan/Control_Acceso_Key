import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { LogInIcon, EyeIcon, EyeOffIcon } from "./Icons";
import "../App.css";
import logo from "../assets/logo.png";

const REMEMBER_KEY = "remember_login";

interface RememberLogin {
  username: string;
}

const getRememberedLogin = (): RememberLogin | null => {
  try {
    const rememberedData = localStorage.getItem(REMEMBER_KEY);

    if (!rememberedData) {
      return null;
    }

    return JSON.parse(rememberedData) as RememberLogin;
  } catch {
    localStorage.removeItem(REMEMBER_KEY);
    return null;
  }
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState(
    () => getRememberedLogin()?.username ?? ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    () => getRememberedLogin() !== null
  );
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username.trim() && !password.trim()) {
      setError("Recuerda ingresar tu username y contraseña.");
      return;
    }

    if (!username.trim()) {
      setError("Recuerda ingresar tu username.");
      return;
    }

    if (!password.trim()) {
      setError("Recuerda ingresar tu contraseña.");
      return;
    }

    try {
      const user = await login({
        username,
        password,
      });

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      navigate(user.role === "empleado" ? "/user" : "/manager");
    } catch {
      setError("No se pudo iniciar sesión. Verifica tus datos.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <img src={logo} alt="Logo de la empresa" className="login-logo" />

        <h1 className="login-title">Control de Acceso</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Username
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="Ingresa tu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Contraseña
            </label>
            <div className="password-wrapper">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Recordar mi usuario
          </label>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-button"
            type="submit"
            title="Iniciar sesión"
            aria-label="Iniciar sesión"
          >
            <LogInIcon size={22} />
            <span>Iniciar sesión</span>
          </button>
        </form>

        <p className="login-help">
          ¿Tienes problemas para ingresar?{" "}
          <span>
            Contacta al administrador vía:{" "}
            <a
              href="https://outlook.office.com/mail/0/deeplink/compose?to=valeria.chavez@e-ducatek.com&subject=Problema%20de%20acceso&body=Hola%2C%20tengo%20problemas%20para%20ingresar%20al%20sistema.%0A%0AMi%20nombre%20es%3A%20%0AEl%20problema%20que%20presento%20es%3A%20"
              target="_blank"
              rel="noopener noreferrer"
            >
              Outlook
            </a>
            {" o "}
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=valeria.chavez@e-ducatek.com&su=Problema%20de%20acceso&body=Hola%2C%20tengo%20problemas%20para%20ingresar%20al%20sistema.%0A%0AMi%20nombre%20es%3A%20%0AEl%20problema%20que%20presento%20es%3A%20"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gmail
            </a>
          </span>
        </p>


        <div className="login-legal-footer">
          <p>
            Plataforma operada por{" "}
            <strong>Corporativo Construcción y Mantenimiento S.A. de C.V.</strong>{" "}
            Todos los derechos reservados.
          </p>
          <div className="legal-links">
            <Link to="/legal/aviso-privacidad" state={{ from: "/login" }}>
              Aviso de Privacidad
            </Link>
            <span> | </span>
            <Link to="/legal/terminos-condiciones" state={{ from: "/login" }}>
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};