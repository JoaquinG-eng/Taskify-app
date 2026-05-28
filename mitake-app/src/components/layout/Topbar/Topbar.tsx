// ============================================================
// ARCHIVO: src/components/layout/Topbar/Topbar.tsx
// ¿Para qué sirve? Barra superior del dashboard.
// Ahora acepta botones de acción opcionales que se renderizan
// en el lado derecho junto al avatar.
// ============================================================

import "./Topbar.css";

// ------------------------------------------------------------
// INTERFAZ: ConfiguracionDeBoton
// Estructura de un botón de acción en la topbar.
// ------------------------------------------------------------
interface ConfiguracionDeBoton {
  etiqueta: string;
  alHacerClick: () => void;
}

// ------------------------------------------------------------
// INTERFAZ: PropiedadesDeTopbar
// ------------------------------------------------------------
interface PropiedadesDeTopbar {
  tituloSeccion: string;
  subtituloSeccion: string;
  nombreDelUsuario?: string;
  alAbrirSidebar?: () => void;
  botonPrimario?: ConfiguracionDeBoton;    // Botón violeta (ej: "Nueva tarea")
  botonSecundario?: ConfiguracionDeBoton;  // Botón secundario (ej: "Nuevo ticket")
}

// ------------------------------------------------------------
// COMPONENTE: Topbar
// ------------------------------------------------------------
function Topbar({
  tituloSeccion,
  subtituloSeccion,
  nombreDelUsuario = "",
  alAbrirSidebar,
  botonPrimario,
  botonSecundario,
}: PropiedadesDeTopbar) {
  // Primera letra del nombre para el avatar
  const inicialDelUsuario = nombreDelUsuario
    ? nombreDelUsuario.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="topbar">

      {/* Botón hamburguesa — solo en móvil */}
      {alAbrirSidebar && (
        <button
          className="topbar__boton-menu"
          onClick={alAbrirSidebar}
          aria-label="Abrir menú lateral"
        >
          ☰
        </button>
      )}

      {/* Título y subtítulo de la sección */}
      <div className="topbar__titulo">
        <h1 className="topbar__titulo-texto">{tituloSeccion}</h1>
        <p className="topbar__titulo-subtexto">{subtituloSeccion}</p>
      </div>

      {/* Acciones del lado derecho */}
      <div className="topbar__acciones">

        {/* Botón secundario (si existe) */}
        {botonSecundario && (
          <button
            className="topbar__boton-secundario"
            onClick={botonSecundario.alHacerClick}
          >
            {botonSecundario.etiqueta}
          </button>
        )}

        {/* Botón primario (si existe) — ej: "Nueva tarea" */}
        {botonPrimario && (
          <button
            className="topbar__boton-primario"
            onClick={botonPrimario.alHacerClick}
          >
            + {botonPrimario.etiqueta}
          </button>
        )}

        {/* Avatar del usuario */}
        <div
          className="topbar__avatar"
          title={nombreDelUsuario || "Usuario"}
        >
          <span>{inicialDelUsuario}</span>
        </div>

      </div>
    </header>
  );
}

export default Topbar;