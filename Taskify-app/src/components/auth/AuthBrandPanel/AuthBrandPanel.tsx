import logoTaskify from "../../../ASSETS/taskify_logo.jpg";

import type { ReactNode } from "react";

type PropiedadesDeAuthBrandPanel = {
  titulo: ReactNode;
  descripcion: string;
  modo: "login" | "registro";
};

function AuthBrandPanel({
  titulo,
  descripcion,
  modo,
}: PropiedadesDeAuthBrandPanel) {
  return (
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
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
      </div>

      {modo === "login" ? (
        <div className="auth-layout__panel-dots">
          <div className="auth-layout__dot auth-layout__dot--purple" />
          <div className="auth-layout__dot auth-layout__dot--blue" />
          <div className="auth-layout__dot auth-layout__dot--green" />
        </div>
      ) : (
        <div className="auth-layout__panel-features">
          {[
            "CRUD completo de tareas",
            "Tablero Kanban visual",
            "Progreso en tiempo real",
            "Notificaciones por email",
          ].map((feature) => (
            <div key={feature} className="auth-layout__feature">
              <span className="auth-layout__feature-check">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuthBrandPanel;