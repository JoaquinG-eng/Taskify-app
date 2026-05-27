export type EstadoTarea =
  | "pendiente"
  | "en-progreso"
  | "completada";

export type PrioridadTarea =
  | "baja"
  | "media"
  | "alta";

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  fechaCreacion: string;
}