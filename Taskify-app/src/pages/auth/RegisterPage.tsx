import { useState } from "react";
import { registrarUsuario } from "../../services/authService";
import {
  alertaRegistroExitoso,
  alertaErrorDeAutenticacion,
  alertaConfirmarRegistro,
} from "../../utils/sweetAlerts";
import { calcularFuerzaPassword } from "../../utils/passwordStrength";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import AuthPasswordInput from "../../components/auth/AuthPasswordInput";
import AuthSubmitButton from "../../components/auth/AuthSubmitButton";
import PasswordStrength from "../../components/auth/PasswordStrength";
import "./AuthPage.css";

type PropiedadesDeRegisterPage = {
  alRegistrarse: () => void;
  alIrALogin: () => void;
};

function RegisterPage({ alRegistrarse, alIrALogin }: PropiedadesDeRegisterPage) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();

    if (!nombre.trim()) {
      await alertaErrorDeAutenticacion("El nombre es obligatorio.");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      await alertaErrorDeAutenticacion("Ingresá un email válido.");
      return;
    }

    if (password.length < 6) {
      await alertaErrorDeAutenticacion("La contraseña debe tener minimo 6 caracteres.");
      return;
    }

    if (password !== confirmar) {
      await alertaErrorDeAutenticacion("Las contraseñas no coinciden.");
      return;
    }

    const confirmo = await alertaConfirmarRegistro(email);
    if (!confirmo) return;

    setCargando(true);

    try {
      await registrarUsuario(nombre, email, password);
      await alertaRegistroExitoso(nombre);
      alRegistrarse();
    } catch (error: unknown) {
      await alertaErrorDeAutenticacion((error as Error).message);
    } finally {
      setCargando(false);
    }
  }

 const fuerza = calcularFuerzaPassword(password);
  return (
    <AuthLayout
      modo="registro"
      tituloPanel={
        <>
          Empezá a organizar
          <br />
          tu trabajo hoy.
        </>
      }
      descripcionPanel="Creá tu cuenta gratis y accedé a todas las funcionalidades de Taskify."
    >
      <form className="auth-form" onSubmit={manejarEnvio} noValidate>
        <div className="auth-form__encabezado">
          <div>
            <h2 className="auth-form__titulo">Crear cuenta</h2>
            <p className="auth-form__subtitulo">
              Completá tus datos para registrarte
            </p>
          </div>

          <button
            type="button"
            className="auth-form__boton-volver"
            onClick={alIrALogin}
            title="Volver al login"
            aria-label="Volver al login"
          >
            ✕
          </button>
        </div>

        <AuthInput
          id="reg-nombre"
          etiqueta="Nombre completo"
          icono="✦"
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={setNombre}
          autoFocus
        />

        <AuthInput
          id="reg-email"
          etiqueta="Email"
          icono="@"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={setEmail}
        />

        <AuthPasswordInput
          id="reg-password"
          etiqueta="Contraseña"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={setPassword}
          verPassword={verPass}
          onTogglePassword={() => setVerPass((v) => !v)}
          contenidoInferior={
            <PasswordStrength
              nivel={fuerza.nivel}
              etiqueta={fuerza.etiqueta}
              color={fuerza.color}
            />
          }
        />

        <AuthPasswordInput
          id="reg-confirmar"
          etiqueta="Confirmar contraseña"
          placeholder="Repetí la contraseña"
          value={confirmar}
          onChange={setConfirmar}
          verPassword={verPass}
          onTogglePassword={() => setVerPass((v) => !v)}
          elementoDerechaInput={
            confirmar.length > 0 ? (
              <span
                className="auth-campo__check"
                style={{ color: confirmar === password ? "#10b981" : "#ef4444" }}
              >
                {confirmar === password ? "✓" : "✕"}
              </span>
            ) : null
          }
        />

        <AuthSubmitButton
          texto="Crear cuenta"
          cargando={cargando}
          disabled={cargando}
        />

        <p className="auth-form__footer">
          ¿Ya tenés cuenta?{" "}
          <button type="button" className="auth-form__link" onClick={alIrALogin}>
            Iniciá sesión
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;