import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface PropiedadesDeProtectedRoute {
  children: ReactNode;
  alNoAutenticado: () => void;
}

function ProtectedRoute({
  children,
  alNoAutenticado,
}: PropiedadesDeProtectedRoute) {
  const { usuario, cargando } = useAuth();

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

    if (!usuario) {
    alNoAutenticado();
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;