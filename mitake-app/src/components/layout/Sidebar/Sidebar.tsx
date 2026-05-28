// ============================================================
// ARCHIVO: src/components/layout/Sidebar/Sidebar.tsx
// ============================================================

import "./Sidebar.css";

interface ElementoDeNavegacion {
  id: string;
  etiqueta: string;
  icono: string;
}

interface PropiedadesDeSidebar {
  seccionActiva: string;
  alCambiarSeccion: (seccion: string) => void;
  cantidadEnPapelera: number;
  estaAbierto: boolean;
  alCerrar: () => void;
}

const elementosDeNavegacion: ElementoDeNavegacion[] = [
  { id: "dashboard",  etiqueta: "Dashboard",    icono: "▦" },
  { id: "mis-tareas", etiqueta: "Mis tareas",   icono: "✓" },
  { id: "tickets",    etiqueta: "Tickets",       icono: "◈" },
];

function Sidebar({
  seccionActiva,
  alCambiarSeccion,
  cantidadEnPapelera,
  estaAbierto,
  alCerrar,
}: PropiedadesDeSidebar) {

  function manejarClick(id: string) {
    alCambiarSeccion(id);
    alCerrar(); // en móvil cierra el sidebar al navegar
  }

  return (
    <>
      {/* Overlay oscuro — solo visible en móvil cuando el sidebar está abierto */}
      {estaAbierto && (
        <div
          className="sidebar__overlay"
          onClick={alCerrar}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${estaAbierto ? "sidebar--abierto" : ""}`}>

        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-icono">M</div>
          <span className="sidebar__logo-texto">Mitake</span>
          {/* Botón cerrar — solo visible en móvil */}
          <button
            className="sidebar__boton-cerrar"
            onClick={alCerrar}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="sidebar__nav">
          <p className="sidebar__seccion-label">Menú principal</p>
          {elementosDeNavegacion.map((elemento) => (
            <button
              key={elemento.id}
              className={`sidebar__item ${
                seccionActiva === elemento.id ? "sidebar__item--activo" : ""
              }`}
              onClick={() => manejarClick(elemento.id)}
            >
              <span className="sidebar__item-icono">{elemento.icono}</span>
              <span className="sidebar__item-texto">{elemento.etiqueta}</span>
            </button>
          ))}
        </nav>

        {/* Sistema */}
        <div className="sidebar__sistema">
          <p className="sidebar__seccion-label">Sistema</p>

          <button
            className={`sidebar__item ${
              seccionActiva === "papelera" ? "sidebar__item--activo" : ""
            }`}
            onClick={() => manejarClick("papelera")}
          >
            <span className="sidebar__item-icono">🗑</span>
            <span className="sidebar__item-texto">Papelera</span>
            {cantidadEnPapelera > 0 && (
              <span className="sidebar__badge">{cantidadEnPapelera}</span>
            )}
          </button>

          <button
            className={`sidebar__item ${
              seccionActiva === "about" ? "sidebar__item--activo" : ""
            }`}
            onClick={() => manejarClick("about")}
          >
            <span className="sidebar__item-icono">◎</span>
            <span className="sidebar__item-texto">Sobre Mitake</span>
          </button>
        </div>

        {/* Usuario */}
        <div className="sidebar__pie">
          <div className="sidebar__usuario">
            <div className="sidebar__usuario-avatar">U</div>
            <div className="sidebar__usuario-info">
              <span className="sidebar__usuario-nombre">Usuario</span>
              <span className="sidebar__usuario-rol">Desarrollador</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;