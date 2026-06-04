import type { FiltrosDeBusqueda } from "../../../types/task";

type PropiedadesDeDashboardFilters = {
  filtros: FiltrosDeBusqueda;
  hayFiltrosActivos: boolean;
  cantidadResultados: number;
  actualizarFiltro: <K extends keyof FiltrosDeBusqueda>(
    campo: K,
    valor: FiltrosDeBusqueda[K]
  ) => void;
  limpiarFiltros: () => void;
};

function DashboardFilters({
  filtros,
  hayFiltrosActivos,
  cantidadResultados,
  actualizarFiltro,
  limpiarFiltros,
}: PropiedadesDeDashboardFilters) {
  return (
    <>
      <div className="filtros-barra">
        <div className="filtros-barra__campo filtros-barra__campo--busqueda">
          <span className="filtros-barra__campo-icono">⌕</span>

          <input
            type="text"
            placeholder="Buscar por título, descripción o persona..."
            value={filtros.textoDeBusqueda}
            onChange={(e) => actualizarFiltro("textoDeBusqueda", e.target.value)}
            className="filtros-barra__input"
          />

          {filtros.textoDeBusqueda && (
            <button
              className="filtros-barra__limpiar-input"
              onClick={() => actualizarFiltro("textoDeBusqueda", "")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filtros-barra__campo">
          <span className="filtros-barra__campo-icono">→</span>

          <input
            type="text"
            placeholder="Asignado a..."
            value={filtros.asignadoA}
            onChange={(e) => actualizarFiltro("asignadoA", e.target.value)}
            className="filtros-barra__input"
          />
        </div>

        <div className="filtros-barra__botones">
          {(["todas", "pendiente", "en-progreso", "completada"] as const).map((op) => (
            <button
              key={op}
              className={filtros.estadoFiltrado === op ? "activo" : ""}
              onClick={() => actualizarFiltro("estadoFiltrado", op)}
            >
              {op === "todas"
                ? "Todas"
                : op === "pendiente"
                  ? "Pendientes"
                  : op === "en-progreso"
                    ? "En progreso"
                    : "Completadas"}
            </button>
          ))}
        </div>

        {hayFiltrosActivos && (
          <button className="filtros-barra__limpiar-todo" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {hayFiltrosActivos && (
        <p className="filtros-barra__resultado">
          {cantidadResultados === 0
            ? "Ninguna tarea coincide."
            : `${cantidadResultados} tarea${cantidadResultados !== 1 ? "s" : ""} encontrada${cantidadResultados !== 1 ? "s" : ""}`}
        </p>
      )}
    </>
  );
}

export default DashboardFilters;