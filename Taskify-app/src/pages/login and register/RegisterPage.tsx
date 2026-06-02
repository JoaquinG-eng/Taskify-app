// ============================================================
// ARCHIVO: src/pages/auth/RegisterPage.tsx
// ============================================================

import { useState } from "react";
import { registrarUsuario } from "../../services/authService";
import {
  alertaRegistroExitoso,
  alertaErrorDeAutenticacion,
  alertaConfirmarRegistro,
} from "../../utils/sweetAlerts";
import "./AuthPage.css";
  
import logoTaskify from "../../ASSETS/taskify_logo.jpg";


type PropiedadesDeRegisterPage = {
  alRegistrarse: () => void;
  alIrALogin: () => void;
};

function RegisterPage({ alRegistrarse, alIrALogin }: PropiedadesDeRegisterPage) {
  const [nombre,    setNombre]    = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPass,   setVerPass]   = useState(false);
  const [cargando,  setCargando]  = useState(false);
 
  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();

    if (!nombre.trim()) { await alertaErrorDeAutenticacion("El nombre es obligatorio."); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { await alertaErrorDeAutenticacion("Ingresá un email válido."); return; }
    if (password.length < 6) { await alertaErrorDeAutenticacion("La contraseña debe tener minimo 6 caracteres."); return; }
    if (password !== confirmar) { await alertaErrorDeAutenticacion("Las contraseñas no coinciden."); return; }

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

  function fuerzaPassword(): { nivel: number; etiqueta: string; color: string } {
    if (password.length === 0) return { nivel: 0, etiqueta: "",       color: "transparent" };
    if (password.length < 6)   return { nivel: 1, etiqueta: "Débil",  color: "#ef4444" };
    if (password.length < 10)  return { nivel: 2, etiqueta: "Media",  color: "#f59e0b" };
    return                            { nivel: 3, etiqueta: "Fuerte", color: "#10b981" };
  }

  const fuerza = fuerzaPassword();

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
          <h1>Empezá a organizar<br />tu trabajo hoy.</h1>
          <p>Creá tu cuenta gratis y accedé a todas las funcionalidades de Taskify.</p>
        </div>
        <div className="auth-layout__panel-features">
          {["CRUD completo de tareas", "Tablero Kanban visual", "Progreso en tiempo real", "Notificaciones por email"].map((f) => (
            <div key={f} className="auth-layout__feature">
              <span className="auth-layout__feature-check">✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-layout__form-wrap">
          <form className="auth-form" onSubmit={manejarEnvio} noValidate>
          <div className="auth-form__encabezado">
            <div>
              <h2 className="auth-form__titulo">Crear cuenta</h2>
              <p className="auth-form__subtitulo">Completá tus datos para registrarte</p>
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

          <div className="auth-campo">
            <label className="auth-campo__etiqueta" htmlFor="reg-nombre">Nombre completo</label>
            <div className="auth-campo__input-wrap">
              <span className="auth-campo__icono">✦</span>
              <input id="reg-nombre" type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
            </div>
          </div>

          <div className="auth-campo">
            <label className="auth-campo__etiqueta" htmlFor="reg-email">Email</label>
            <div className="auth-campo__input-wrap">
              <span className="auth-campo__icono">@</span>
              <input id="reg-email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="auth-campo">
            <label className="auth-campo__etiqueta" htmlFor="reg-password">Contraseña</label>
            <div className="auth-campo__input-wrap">
              <span className="auth-campo__icono">🔒</span>
              <input id="reg-password" type={verPass ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="auth-campo__toggle-pass" onClick={() => setVerPass((v) => !v)} tabIndex={-1}>
                {verPass ? "👁" : "👁"}
              </button>
            </div>
            {password.length > 0 && (
              <div className="auth-campo__fuerza">
                <div className="auth-campo__fuerza-barras">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="auth-campo__fuerza-barra" style={{ background: n <= fuerza.nivel ? fuerza.color : "#FFFFFF20" }} />
                  ))}
                </div>
                <span style={{ color: fuerza.color, fontSize: "11px", fontWeight: 600 }}>{fuerza.etiqueta}</span>
              </div>
            )}
          </div>

          <div className="auth-campo">
            <label className="auth-campo__etiqueta" htmlFor="reg-confirmar">Confirmar contraseña</label>
            <div className="auth-campo__input-wrap">
              <span className="auth-campo__icono">🔒</span>
              <input id="reg-confirmar" type={verPass ? "text" : "password"} placeholder="Repetí la contraseña" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
              {confirmar.length > 0 && (
                <span className="auth-campo__check" style={{ color: confirmar === password ? "#10b981" : "#ef4444" }}>
                  {confirmar === password ? "✓" : "✕"}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className={`auth-form__btn-primario ${cargando ? "auth-form__btn-primario--cargando" : ""}`} disabled={cargando}>
            {cargando ? <span className="auth-form__spinner" /> : "Crear cuenta"}
          </button>

          <p className="auth-form__footer">
            ¿Ya tenés cuenta?{" "}
            <button type="button" className="auth-form__link" onClick={alIrALogin}>Iniciá sesión</button>
          </p>

        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
