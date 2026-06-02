// ============================================================
// ARCHIVO: src/components/layout/Topbar/Topbar.tsx
// ============================================================

import "./Topbar.css";

interface ConfiguracionDeBoton {
  etiqueta: string;
  alHacerClick: () => void;
}

interface PropiedadesDeTopbar {
  tituloSeccion: string;
  subtituloSeccion: string;
  nombreDelUsuario?: string;
  alAbrirSidebar?: () => void;
  botonPrimario?: ConfiguracionDeBoton;
  botonSecundario?: ConfiguracionDeBoton;
  alEnviarEmail?: () => void;        
  enviandoEmail?: boolean;           
}

function Topbar({
  tituloSeccion,
  subtituloSeccion,
  nombreDelUsuario = "",
  alAbrirSidebar,
  botonPrimario,
  botonSecundario,
  alEnviarEmail,
  enviandoEmail = false,
}: PropiedadesDeTopbar) {
  const inicialDelUsuario = nombreDelUsuario
    ? nombreDelUsuario.charAt(0).toUpperCase()
    : "U";

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

      <div className="topbar__acciones">
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

        <div className="topbar__avatar" title={nombreDelUsuario || "Usuario"}>
          <span>{inicialDelUsuario}</span>
        </div>

      </div>
    </header>
  );
}

export default Topbar;