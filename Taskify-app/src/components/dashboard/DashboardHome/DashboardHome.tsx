import type { ComponentProps } from "react";

import KanbanBoard from "../../kanban/KanbanBoard/KanbanBoard";
import ActivityFeed from "../../ui/ActivityFeed/ActivityFeed";
import { DashboardStats } from "../DashboardStats";
import DashboardTicketSummary from "../DashboardTicketSummary";

type PropiedadesDeKanban = ComponentProps<typeof KanbanBoard>;
type PropiedadesDeActivityFeed = ComponentProps<typeof ActivityFeed>;

type PropiedadesDeDashboardHome = {
  totalTareas: number;
  tareasPendientes: number;
  tareasEnProgreso: number;
  tareasCompletadas: number;
  totalTickets: number;
  ticketsActivos: number;
  ticketsAltaPrioridadActivos: number;
  cargandoTickets: boolean;
  errorTickets: string | null;
  alAbrirTickets: () => void;
  tareas: PropiedadesDeKanban["tareas"];
  actividades: PropiedadesDeActivityFeed["actividades"];
  alCambiarEstado: PropiedadesDeKanban["alCambiarEstado"];
  alActualizarProgreso: PropiedadesDeKanban["alActualizarProgreso"];
  alMoverAPapelera: PropiedadesDeKanban["alMoverAPapelera"];
  alEditarTarea: PropiedadesDeKanban["alEditarTarea"];
};

function DashboardHome({
  totalTareas,
  tareasPendientes,
  tareasEnProgreso,
  tareasCompletadas,
  totalTickets,
  ticketsActivos,
  ticketsAltaPrioridadActivos,
  cargandoTickets,
  errorTickets,
  alAbrirTickets,
  tareas,
  actividades,
  alCambiarEstado,
  alActualizarProgreso,
  alMoverAPapelera,
  alEditarTarea,
}: PropiedadesDeDashboardHome) {
  return (
    <div className="dashboard-layout__contenido">
      <DashboardStats
        totalTareas={totalTareas}
        tareasPendientes={tareasPendientes}
        tareasEnProgreso={tareasEnProgreso}
        tareasCompletadas={tareasCompletadas}
      />

      <DashboardTicketSummary
        totalTickets={totalTickets}
        ticketsActivos={ticketsActivos}
        ticketsAltaPrioridadActivos={ticketsAltaPrioridadActivos}
        cargandoTickets={cargandoTickets}
        errorTickets={errorTickets}
        alAbrirTickets={alAbrirTickets}
      />

      <div className="dashboard-layout__doble-columna">
        <div className="dashboard-layout__kanban-wrap">
          <KanbanBoard
            tareas={tareas}
            alCambiarEstado={alCambiarEstado}
            alActualizarProgreso={alActualizarProgreso}
            alMoverAPapelera={alMoverAPapelera}
            alEditarTarea={alEditarTarea}
          />
        </div>

        <div className="dashboard-layout__feed-wrap">
          <ActivityFeed actividades={actividades} />
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;