import { useState } from "react";
import {
  iniciarSesion,
  iniciarSesionConGoogle,
  enviarEmailDeRecuperacion,
  obtenerMensajeDeError,
} from "../../services/authService";
import { swalExito, swalError } from "../../utils/sweetAlerts";
import Swal from "sweetalert2";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import AuthPasswordInput from "../../components/auth/AuthPasswordInput";
import GoogleButton from "../../components/GoogleButton";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import "./AuthPage.css";

type PropiedadesDeLoginPage = {
  alIniciarSesion: () => void;
  alIrARegistro: () => void;
};

function LoginPage({ alIniciarSesion, alIrARegistro }: PropiedadesDeLoginPage) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
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

  async function manejarRecuperacionContrasena() {
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
        autocorrect: "off",
      },
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage("El correo es obligatorio");
        }

        return value;
      },
    });

    if (!correoIngresado) return;

    try {
      await enviarEmailDeRecuperacion(correoIngresado);
      await swalExito(
        "¡Correo enviado!",
        `Revisá la bandeja de entrada de ${correoIngresado} y la carpeta de spam.`
      );
    } catch (error: unknown) {
      const codigo = (error as { code?: string }).code ?? "";
      await swalError("Error de envío", obtenerMensajeDeError(codigo));
    }
  }

  return (
    <AuthLayout
      modo="login"
      tituloPanel={
        <>
          Organizá tu trabajo de la manera mas optima,
          <br />
          enfocate en lo que importa.
        </>
      }
      descripcionPanel="Gestión de tareas con Kanban, seguimiento de progreso y notificaciones en tiempo real."
    >
      <form className="auth-form" onSubmit={manejarEnvio} noValidate>
        <div className="auth-form__encabezado">
          <h2 className="auth-form__titulo">Bienvenido</h2>
        </div>

        <AuthInput
          id="login-email"
          name="email"
          autoComplete="username"
          etiqueta="Email"
          icono="@"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={setEmail}
          autoFocus
        />

        <AuthPasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          etiqueta="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          verPassword={verPassword}
          onTogglePassword={() => setVerPassword((v) => !v)}
          accionDerecha={
            <button
              type="button"
              className="auth-campo__link"
              onClick={manejarRecuperacionContrasena}
            >
              ¿Olvidaste tu contraseña?
            </button>
          }
        />

        <AuthSubmitButton
          texto="Ingresar"
          cargando={cargando}
          disabled={cargando || cargandoGoogle}
        />

        <div className="auth-form__separador">
          <span>o continuá con</span>
        </div>

        <GoogleButton
          cargando={cargandoGoogle}
          disabled={cargando || cargandoGoogle}
          onClick={manejarGoogle}
        />

        <p className="auth-form__footer">
          ¿No tenés cuenta?{" "}
          <button type="button" className="auth-form__link" onClick={alIrARegistro}>
            Registrate gratis
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;