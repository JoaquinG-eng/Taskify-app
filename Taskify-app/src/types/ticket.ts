// ============================================================
// ARCHIVO: src/types/ticket.ts
// Modelo de dominio del sistema de tickets.
// ============================================================

export type EstadoTicket = "abierto" | "en-progreso" | "cerrado";
export type PrioridadTicket = "alta" | "media" | "baja";

export interface Ticket {
  id: string;
  userId: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface TicketNuevo {
  titulo: string;
  descripcion: string;
  prioridad: PrioridadTicket;
}

export type CambiosTicket = Partial<TicketNuevo>;
