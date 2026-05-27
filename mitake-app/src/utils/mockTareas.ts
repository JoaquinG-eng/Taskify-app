import type { Tarea } from "../types";

export const mockTareas: Tarea[] = [
  {
    id: "1",
    titulo: "Diseñar dashboard",
    descripcion: "Crear layout principal del sistema",
    estado: "en-progreso",
    prioridad: "alta",
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: "2",
    titulo: "Configurar estructura",
    descripcion: "Organizar carpetas del proyecto",
    estado: "completada",
    prioridad: "media",
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: "3",
    titulo: "Crear formulario de tareas",
    descripcion: "UI para agregar tareas",
    estado: "pendiente",
    prioridad: "baja",
    fechaCreacion: new Date().toISOString(),
  },
];