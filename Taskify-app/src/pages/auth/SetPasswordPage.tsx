import { useState } from "react";
import type { User } from "firebase/auth";
import {
  cerrarSesion,
  configurarPasswordParaUsuarioGoogle,
  obtenerMensajeDeError,
} from "../../services/authService";
import {
  swalError,
  swalExito,
} from "../../utils/sweetAlerts";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthPasswordInput from "../../components/auth/AuthPasswordInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import "./AuthPage.css";
import "./SetPasswordPage.css";

type PropiedadesSetPasswordPage = {
  usuario: User;
  alConfigurarPassword: () => void;
};

export default function SetPasswordPage({
  usuario,
  alConfigurarPassword,
}: PropiedadesSetPasswordPage) {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmacion, setVerConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      await swalError(
        "Contraseña demasiado corta",
        "Usá al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmacion) {
      await swalError(
        "Las contraseñas no coinciden",
        "Revisá ambos campos e intentá nuevamente."
      );
      return;
    }

    setCargando(true);

    try {
      await configurarPasswordParaUsuarioGoogle(password);

      await swalExito(
        "Acceso configurado",
        "Ya podés ingresar a esta misma cuenta con Google o con email y contraseña."
      );

      alConfigurarPassword();
    } catch (error: unknown) {
      console.error("ERROR CONFIGURANDO PASSWORD:", error);

      const codigo =
        (error as { code?: string }).code ?? "";

      const mensaje =
        (error as { message?: string }).message ?? "";

      await swalError(
        "No se pudo configurar la contraseña",
        codigo
          ? obtenerMensajeDeError(codigo)
          : mensaje || "Intentá nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthLayout
      modo="login"
      tituloPanel={
        <>
          Una cuenta,
          <br />
          dos formas de entrar.
        </>
      }
      descripcionPanel="Accedé con Google o con tu email y contraseña, manteniendo siempre la misma cuenta, tus tareas y tu historial."
    >
      <form
        className="auth-form set-password"
        onSubmit={manejarSubmit}
        noValidate
      >
        <header className="set-password__header">
          <div className="set-password__eyebrow">
            <span className="set-password__eyebrow-icon" aria-hidden="true">
              ✓
            </span>
            Acceso seguro
          </div>

          <h2 className="auth-form__titulo set-password__titulo">
            Completá tu acceso
          </h2>

          <p className="set-password__intro">
            Creá una contraseña de Taskify para poder entrar también con tu
            email, sin perder tus tareas ni crear otra cuenta.
          </p>
        </header>

        <section
          className="set-password__google-card"
          aria-label="Cuenta de Google conectada"
        >
          <div className="set-password__google-logo" aria-hidden="true">
            <svg className="set-password__google-svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.65 32.657 29.224 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.203 0-9.617-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
          </div>

          <div className="set-password__google-content">
            <div className="set-password__google-status">
              <span
                className="set-password__google-status-dot"
                aria-hidden="true"
              >
                ✓
              </span>
              Google conectado
            </div>

            <strong className="set-password__email">
              {usuario.email ?? "Cuenta de Google"}
            </strong>

            <p>
              Tu cuenta ya está vinculada con Google. Esta contraseña agrega una
              forma adicional de acceso a la misma cuenta Taskify.
            </p>
          </div>
        </section>

        <section
          className="set-password__benefits"
          aria-label="Beneficios de la vinculación"
        >
          <div className="set-password__benefit">
            <span className="set-password__benefit-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="8" r="3" />
                <path d="M3.5 18c.7-3.2 2.7-5 5.5-5s4.8 1.8 5.5 5" />
                <path d="M16 10.5c2.4.3 4 1.8 4.5 4.5" />
                <path d="M16.5 5.5a2.5 2.5 0 0 1 0 5" />
              </svg>
            </span>
            <div>
              <strong>Misma cuenta</strong>
              <small>Un único perfil y todos tus datos.</small>
            </div>
          </div>

          <div className="set-password__benefit">
            <span className="set-password__benefit-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3.5 7.5h6l1.8 2H20.5v9H3.5z" />
                <path d="M3.5 7.5v-2h5l1.5 2" />
              </svg>
            </span>
            <div>
              <strong>Mismas tareas</strong>
              <small>Todo tu trabajo permanece intacto.</small>
            </div>
          </div>

          <div className="set-password__benefit">
            <span className="set-password__benefit-icon set-password__benefit-icon--google" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M20.5 12.2c0-.7-.1-1.3-.2-1.9H12v3.5h4.8a4.2 4.2 0 0 1-1.8 2.8v2.4h3c1.7-1.6 2.5-4 2.5-6.8z" />
                <path d="M12 21c2.4 0 4.5-.8 6-2.1l-3-2.4c-.8.6-1.9.9-3 .9-2.3 0-4.3-1.6-5-3.7H4v2.4A9 9 0 0 0 12 21z" />
                <path d="M7 13.7a5.4 5.4 0 0 1 0-3.4V7.9H4a9 9 0 0 0 0 8.2z" />
                <path d="M12 6.6c1.3 0 2.5.5 3.4 1.3L18 5.3A8.7 8.7 0 0 0 12 3a9 9 0 0 0-8 4.9l3 2.4c.7-2.1 2.7-3.7 5-3.7z" />
              </svg>
            </span>
            <div>
              <strong>Google seguirá funcionando</strong>
              <small>Podés seguir entrando como siempre.</small>
            </div>
          </div>
        </section>

        <div className="set-password__fields">
          <AuthPasswordInput
            id="set-password"
            name="password"
            autoComplete="new-password"
            etiqueta="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={setPassword}
            verPassword={verPassword}
            onTogglePassword={() =>
              setVerPassword((actual) => !actual)
            }
          />

          <AuthPasswordInput
            id="set-password-confirm"
            name="password-confirm"
            autoComplete="new-password"
            etiqueta="Confirmar contraseña"
            placeholder="Repetí la contraseña"
            value={confirmacion}
            onChange={setConfirmacion}
            verPassword={verConfirmacion}
            onTogglePassword={() =>
              setVerConfirmacion((actual) => !actual)
            }
          />
        </div>

        <AuthSubmitButton
          texto="Guardar contraseña y continuar"
          cargando={cargando}
          disabled={cargando}
        />

        <aside className="set-password__notice">
          <span className="set-password__notice-icon" aria-hidden="true">
            i
          </span>
          <p>
            Esta contraseña es solo para Taskify.
            <strong> No modifica tu contraseña de Google.</strong>
          </p>
        </aside>

        <div className="set-password__footer">
          <span className="set-password__footer-line" aria-hidden="true" />

          <button
            type="button"
            className="set-password__salir"
            onClick={() => void cerrarSesion()}
            disabled={cargando}
          >
            <span aria-hidden="true">↪</span>
            Cerrar sesión
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
