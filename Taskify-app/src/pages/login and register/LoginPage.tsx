// ============================================================
// ARCHIVO: src/pages/auth/LoginPage.tsx
// ============================================================

import { useState } from "react";
import { 
  iniciarSesion, 
  iniciarSesionConGoogle, 
  enviarEmailDeRecuperacion, 
  obtenerMensajeDeError       
} from "../../services/authService";
import { swalExito, swalError } from "../../utils/sweetAlerts";
import Swal from "sweetalert2";
import "./AuthPage.css";

// IMPORTACIÓN DEL LOGO OFICIAL DESDE LA RUTA COINCIDENTE
import logoTaskify from "../../ASSETS/taskify_logo.jpg";

type PropiedadesDeLoginPage = {
  alIniciarSesion: () => void;
  alIrARegistro: () => void;
};

function LoginPage({ alIniciarSesion, alIrARegistro }: PropiedadesDeLoginPage) {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando,    setCargando]    = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

   async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      await swalError("Campo requerido", "El email es obligatorio.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) { 
      await swalError("Email inválido", "Ingresá un email con formato válido.");
      return;
    }
    if (!password.trim()) {
      await swalError("Campo requerido", "La contraseña es obligatoria.");
      return;
    }

    setCargando(true);
    try {
      await iniciarSesion(email, password);
      await swalExito("¡Bienvenido de vuelta!", `Ingresaste como ${email}`);
      alIniciarSesion();
    } catch (error: unknown) {
      const codigo = (error as { code?: string }).code ?? "";
      await swalError("Error al ingresar", obtenerMensajeDeError(codigo));
    } finally {
      setCargando(false);
    }
  }

  async function manejarGoogle() {
    setCargandoGoogle(true);
    try {
      await iniciarSesionConGoogle();
      await swalExito("¡Bienvenido!", "Ingresaste con tu cuenta de Google.");
      alIniciarSesion();
    } catch (error: unknown) {
      const codigo = (error as { code?: string }).code ?? "";
      await swalError("Error con Google", obtenerMensajeDeError(codigo));
    } finally {
      setCargandoGoogle(false);
    }
  }

  // =========================================================
  // LOGICA PARA RECUPERAR CONTRASEÑA
  // =========================================================
  async function manejarRecuperacionContrasena() {
    // Abrimos un modal interactivo para solicitar el correo
    const { value: correoIngresado } = await Swal.fire({
      title: "Recuperar contraseña",
      text: "Ingresá tu correo electrónico y te enviaremos un enlace de restablecimiento.",
      input: "email",
      inputPlaceholder: "tu@email.com",
      inputValue: email,
      showCancelButton: true,
      confirmButtonText: "Enviar enlace",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#7c5af6",
      background: "#0d0f1a",
      color: "#ffffff",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off"
      },
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage("El correo es obligatorio");
        }
        return value;
      }
    });

    if (correoIngresado) {
      try {
        // Ejecutamos tu servicio nativo de Firebase
        await enviarEmailDeRecuperacion(correoIngresado);
        await swalExito(
          "¡Correo enviado!", 
          `Revisá la bandeja de entrada de ${correoIngresado} (y la carpeta de spam).`
        );
      } catch (error: unknown) {
        const codigo = (error as { code?: string }).code ?? "";
        await swalError("Error de envío", obtenerMensajeDeError(codigo));
      }
    }
  }

  return (
    <div className="auth-layout">

      <div className="auth-layout__panel">
        <div className="auth-layout__panel-logo">
          <div className="auth-layout__logo-icono">
            <img 
              src={logoTaskify} 
              alt="Taskify Logo" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
          <span className="auth-layout__logo-texto">Taskify</span>
        </div>
        <div className="auth-layout__panel-tagline">
          <h1>Organizá tu trabajo de la manera mas optima,<br />enfocate en lo que importa.</h1>
          <p>Gestión de tareas con Kanban, seguimiento de progreso y notificaciones en tiempo real.</p>
        </div>
        <div className="auth-layout__panel-dots">
          <div className="auth-layout__dot auth-layout__dot--purple" />
          <div className="auth-layout__dot auth-layout__dot--blue" />
          <div className="auth-layout__dot auth-layout__dot--green" />
        </div>
      </div>

      <div className="auth-layout__form-wrap">
        <form className="auth-form" onSubmit={manejarEnvio} noValidate>

          <div className="auth-form__encabezado">
            <h2 className="auth-form__titulo">Bienvenido</h2>
          </div>

          <div className="auth-campo">
            <label className="auth-campo__etiqueta" htmlFor="login-email">Email</label>
            <div className="auth-campo__input-wrap">
              <span className="auth-campo__icono">@</span>
              <input
                id="login-email"
                name="email"
                autoComplete="username"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="auth-campo">
            <div className="auth-campo__label-fila">
              <label className="auth-campo__etiqueta" htmlFor="login-password">Contraseña</label>
              {/* MODIFICADO: Conectamos la acción onClick a la función de recuperación */}
              <button 
                type="button" 
                className="auth-campo__link"
                onClick={manejarRecuperacionContrasena}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="auth-campo__input-wrap">
              <span className="auth-campo__icono">🔒</span>
              <input
                id="login-password"
                name="password"
                autoComplete="current-password"
                type={verPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-campo__toggle-pass"
                onClick={() => setVerPassword((v) => !v)}
                tabIndex={-1}
              >
                {verPassword ? "👁" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`auth-form__btn-primario ${cargando ? "auth-form__btn-primario--cargando" : ""}`}
            disabled={cargando || cargandoGoogle}
          >
            {cargando ? <span className="auth-form__spinner" /> : "Ingresar"}
          </button>

          <div className="auth-form__separador"><span>o continuá con</span></div>

          <button
            type="button"
            className="auth-form__btn-google"
            onClick={manejarGoogle}
            disabled={cargando || cargandoGoogle}
          >
            {cargandoGoogle ? (
              <span className="auth-form__spinner" style={{ width: 16, height: 16 }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            Continuar con Google
          </button>

          <p className="auth-form__footer">
            ¿No tenés cuenta?{" "}
            <button type="button" className="auth-form__link" onClick={alIrARegistro}>
              Registrate gratis
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;
