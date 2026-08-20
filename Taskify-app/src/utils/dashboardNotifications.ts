import type { Tarea } from "../types/task";
import type { Ticket } from "../types/ticket";
import {
  construirNotificacionesTareas,
  type TipoNotificacionTarea,
} from "./taskNotifications";

export type RecursoNotificacionDashboard = "tarea" | "ticket";
export type TipoNotificacionDashboard = TipoNotificacionTarea | "ticket";

export type NotificacionDashboard = {
  id: string;
  recurso: RecursoNotificacionDashboard;
  recursoId: string;
  titulo: string;
  tipo: TipoNotificacionDashboard;
  detalle: string;
};

function etiquetaEstadoTicket(ticket: Ticket): string {
  return ticket.estado === "en-progreso" ? "En progreso" : "Abierto";
}

export function construirNotificacionesDashboard(
  tareas: Tarea[],
  tickets: Ticket[],
  ahora = new Date()
): NotificacionDashboard[] {
  const deTareas = construirNotificacionesTareas(tareas, ahora).map(
    (notificacion): NotificacionDashboard => ({
      id: `tarea:${notificacion.id}`,
      recurso: "tarea",
      recursoId: notificacion.tareaId,
      titulo: notificacion.titulo,
      tipo: notificacion.tipo,
      detalle: notificacion.detalle,
    })
  );

  /*
   * Regla B7.5A:
   * sólo los tickets de prioridad alta que todavía no estén cerrados
   * entran al centro de notificaciones. Evita convertir la campana en
   * un duplicado de la lista completa de tickets.
   */
  const deTickets = tickets
    .filter(
      (ticket) =>
        ticket.prioridad === "alta" && ticket.estado !== "cerrado"
    )
    .map(
      (ticket): NotificacionDashboard => ({
        id: `ticket:${ticket.id}`,
        recurso: "ticket",
        recursoId: ticket.id,
        titulo: ticket.titulo,
        tipo: "ticket",
        detalle: `Ticket · ${etiquetaEstadoTicket(ticket)} · Prioridad alta`,
      })
    );

  const orden: Record<TipoNotificacionDashboard, number> = {
    vencida: 0,
    hoy: 1,
    ticket: 2,
    proxima: 3,
  };

  return [...deTareas, ...deTickets].sort((a, b) => {
    const diferenciaTipo = orden[a.tipo] - orden[b.tipo];
    if (diferenciaTipo !== 0) return diferenciaTipo;

    return a.titulo.localeCompare(b.titulo, "es-AR");
  });
}
