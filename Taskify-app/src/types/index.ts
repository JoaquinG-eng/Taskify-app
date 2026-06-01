export type EstadoTarea =
  | "pendiente"
  | "en-progreso"
  | "completada";

export type PrioridadTarea =
  | "alta"
  | "media"
  | "baja";

export interface Tarea {
  id: string;

  titulo: string;

  descripcion: string;

  estado: EstadoTarea;

  prioridad: PrioridadTarea;

  fechaCreacion: string;
}