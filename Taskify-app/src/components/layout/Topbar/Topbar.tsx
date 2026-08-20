// ============================================================
// ARCHIVO: src/components/layout/Topbar/Topbar.tsx
// ============================================================

import { useEffect, useRef, useState } from "react";
import type { NotificacionDashboard } from "../../../utils/dashboardNotifications";
import "./Topbar.css";

interface ConfiguracionDeBoton {
  etiqueta: string;
  alHacerClick: () => void;
}

interface PropiedadesDeTopbar {
  tituloSeccion: string;
  subtituloSeccion: string;
  nombreDelUsuario?: string;
  fotoDelUsuario?: string | null;
  alAbrirSidebar?: () => void;
  botonPrimario?: ConfiguracionDeBoton;
  botonSecundario?: ConfiguracionDeBoton;
  alEnviarEmail?: () => void;
  enviandoEmail?: boolean;
  valorBusqueda?: string;
  alCambiarBusqueda?: (valor: string) => void;
  etiquetaBusqueda?: string;
  placeholderBusqueda?: string;
  notificaciones?: NotificacionDashboard[];
  alSeleccionarNotificacion?: (notificacion: NotificacionDashboard) => void;
}

function Topbar({
  tituloSeccion,
  subtituloSeccion,
  nombreDelUsuario = "",
  fotoDelUsuario = null,
  alAbrirSidebar,
  botonPrimario,
  botonSecundario,
  alEnviarEmail,
  enviandoEmail = false,
  valorBusqueda = "",
  alCambiarBusqueda,
  etiquetaBusqueda = "Buscar tareas",
  placeholderBusqueda = "Buscar tareas...",
  notificaciones,
  alSeleccionarNotificacion,
}: PropiedadesDeTopbar) {
  const inicialDelUsuario = nombreDelUsuario
    ? nombreDelUsuario.charAt(0).toUpperCase()
    : "U";

  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const notificacionesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!notificacionesAbiertas) return;

    function cerrarFuera(evento: MouseEvent) {
      if (
        notificacionesRef.current &&
        !notificacionesRef.current.contains(evento.target as Node)
      ) {
        setNotificacionesAbiertas(false);
      }
    }

    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setNotificacionesAbiertas(false);
      }
    }

    document.addEventListener("mousedown", cerrarFuera);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [notificacionesAbiertas]);

  const cantidadNotificaciones = notificaciones?.length ?? 0;

  return (
    <header className="topbar">

      {alAbrirSidebar && (
        <button
          className="topbar__boton-menu"
          onClick={alAbrirSidebar}
          aria-label="Abrir menú lateral"
        >
          ☰
        </button>
      )}

      <div className="topbar__titulo">
        <h1 className="topbar__titulo-texto">{tituloSeccion}</h1>
        <p className="topbar__titulo-subtexto">{subtituloSeccion}</p>
      </div>

      {alCambiarBusqueda && (
        <div className="topbar__busqueda">
          <svg
            className="topbar__busqueda-icono"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="search"
            aria-label={etiquetaBusqueda}
            placeholder={placeholderBusqueda}
            value={valorBusqueda}
            onChange={(evento) => alCambiarBusqueda(evento.target.value)}
          />

          {valorBusqueda && (
            <button
              type="button"
              className="topbar__busqueda-limpiar"
              aria-label="Limpiar búsqueda"
              onClick={() => alCambiarBusqueda("")}
            >
              ×
            </button>
          )}
        </div>
      )}

      <div className="topbar__acciones">
        {notificaciones && (
          <div className="topbar__notificaciones" ref={notificacionesRef}>
            <button
              type="button"
              className="topbar__notificaciones-boton"
              aria-label="Notificaciones"
              aria-expanded={notificacionesAbiertas}
              aria-controls="topbar-centro-notificaciones"
              onClick={() =>
                setNotificacionesAbiertas((actual) => !actual)
              }
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="topbar__notificaciones-icono"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>

              {cantidadNotificaciones > 0 && (
                <span
                  className="topbar__notificaciones-badge"
                  aria-label={`${cantidadNotificaciones} notificaciones`}
                >
                  {cantidadNotificaciones > 9 ? "9+" : cantidadNotificaciones}
                </span>
              )}
            </button>

            {notificacionesAbiertas && (
              <section
                id="topbar-centro-notificaciones"
                className="topbar__notificaciones-panel"
                aria-label="Centro de notificaciones"
              >
                <header className="topbar__notificaciones-cabecera">
                  <div>
                    <strong>Notificaciones</strong>
                    <span>Recordatorios de tareas y tickets</span>
                  </div>
                  <small>{cantidadNotificaciones}</small>
                </header>

                {cantidadNotificaciones === 0 ? (
                  <div className="topbar__notificaciones-vacio">
                    <strong>Todo al día</strong>
                    <span>
                      No hay tareas vencidas o próximas ni tickets prioritarios activos.
                    </span>
                  </div>
                ) : (
                  <div className="topbar__notificaciones-lista">
                    {notificaciones.map((notificacion) => (
                      <button
                        type="button"
                        key={notificacion.id}
                        className={`topbar__notificacion topbar__notificacion--${notificacion.tipo}`}
                        onClick={() => {
                          alSeleccionarNotificacion?.(notificacion);
                          setNotificacionesAbiertas(false);
                        }}
                      >
                        <span
                          className="topbar__notificacion-indicador"
                          aria-hidden="true"
                        />
                        <span className="topbar__notificacion-contenido">
                          <strong>{notificacion.titulo}</strong>
                          <small>{notificacion.detalle}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {alEnviarEmail && (
          <button
            className={`topbar__boton-email ${enviandoEmail ? "topbar__boton-email--cargando" : ""}`}
            onClick={alEnviarEmail}
            disabled={enviandoEmail}
            title="Enviar resumen por email"
          >
            {enviandoEmail ? (
              <span className="topbar__email-spinner" />
            ) : (
              <>
                <span className="topbar__email-icono">✉</span>
                <span className="topbar__email-texto">Enviar por mail</span>
              </>
            )}
          </button>
        )}

        {botonSecundario && (
          <button
            className="topbar__boton-secundario"
            onClick={botonSecundario.alHacerClick}
          >
            {botonSecundario.etiqueta}
          </button>
        )}

        {botonPrimario && (
          <button
            className="topbar__boton-primario"
            onClick={botonPrimario.alHacerClick}
          >
            + {botonPrimario.etiqueta}
          </button>
        )}

        <div 
          className="topbar__avatar" 
          title={nombreDelUsuario || "Usuario"}
          style={{ overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {fotoDelUsuario ? (
            <img 
              src={fotoDelUsuario} 
              alt={nombreDelUsuario || "Avatar"} 
              referrerPolicy="no-referrer" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>{inicialDelUsuario}</span>
          )}
        </div>

      </div>
    </header>
  );
}

export default Topbar;
