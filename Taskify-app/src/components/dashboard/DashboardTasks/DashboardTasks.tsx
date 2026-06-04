import type { ComponentProps } from "react";

import KanbanBoard from "../../kanban/KanbanBoard/KanbanBoard";
import DashboardFilters from "../DashboardFilters";

type PropiedadesDeKanban = ComponentProps<typeof KanbanBoard>;
type PropiedadesDeDashboardFilters = ComponentProps<typeof DashboardFilters>;

type PropiedadesDeDashboardTasks = {
  tareas: PropiedadesDeKanban["tareas"];
  filtros: PropiedadesDeDashboardFilters["filtros"];
  hayFiltrosActivos: boolean;
  actualizarFiltro: PropiedadesDeDashboardFilters["actualizarFiltro"];
  limpiarFiltros: PropiedadesDeDashboardFilters["limpiarFiltros"];
  alCambiarEstado: PropiedadesDeKanban["alCambiarEstado"];
  alActualizarProgreso: PropiedadesDeKanban["alActualizarProgreso"];
  alMoverAPapelera: PropiedadesDeKanban["alMoverAPapelera"];
  alEditarTarea: PropiedadesDeKanban["alEditarTarea"];
};

function DashboardTasks({
  tareas,
  filtros,
  hayFiltrosActivos,
  actualizarFiltro,
  limpiarFiltros,
  alCambiarEstado,
  alActualizarProgreso,
  alMoverAPapelera,
  alEditarTarea,
}: PropiedadesDeDashboardTasks) {
  return (
    <div className="dashboard-layout__contenido">
      <DashboardFilters
        filtros={filtros}
        hayFiltrosActivos={hayFiltrosActivos}
        cantidadResultados={tareas.length}
        actualizarFiltro={actualizarFiltro}
        limpiarFiltros={limpiarFiltros}
      />

      <KanbanBoard
        tareas={tareas}
        alCambiarEstado={alCambiarEstado}
        alActualizarProgreso={alActualizarProgreso}
        alMoverAPapelera={alMoverAPapelera}
        alEditarTarea={alEditarTarea}
      />
    </div>
  );
}

export default DashboardTasks;