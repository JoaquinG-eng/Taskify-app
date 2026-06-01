// ============================================================
// ARCHIVO: src/routes/ProtectedRoute.tsx
// Componente que envuelve rutas privadas.
// Si el usuario no está autenticado → redirige al login.
// Mientras Firebase verifica la sesión → muestra un loader.
// ============================================================

import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface PropiedadesDeProtectedRoute {
  children: ReactNode;
  alNoAutenticado: () => void; // callback para ir al login
}

function ProtectedRoute({
  children,
  alNoAutenticado,
}: PropiedadesDeProtectedRoute) {
  const { usuario, cargando } = useAuth();

  // Mientras Firebase verifica si hay sesión activa
  // mostramos un loader para evitar el parpadeo de redirección
  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060812",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(139, 92, 246, 0.2)",
            borderTopColor: "#8b5cf6",
            borderRadius: "50%",
            animation: "girar 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes girar { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
          Verificando sesión...
        </span>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigimos al login
  if (!usuario) {
    alNoAutenticado();
    return null;
  }

  // Usuario autenticado — renderizamos el contenido protegido
  return <>{children}</>;
}

export default ProtectedRoute;