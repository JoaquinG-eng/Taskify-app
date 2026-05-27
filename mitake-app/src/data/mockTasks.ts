import type { Tarea } from "../types/task";

export const mockTasks: Tarea[] = [
  {
    id: crypto.randomUUID(),

    titulo: "Diseñar dashboard",

    descripcion:
      "Crear estructura visual principal",

    estado: "por-hacer",

    prioridad: "high",

    fechaCreacion:
      new Date().toISOString(),
  },

  {
    id: crypto.randomUUID(),

    titulo: "Crear Kanban",

    descripcion:
      "Separar tareas por estados",

    estado: "en-progreso",

    prioridad: "medium",

    fechaCreacion:
      new Date().toISOString(),
  },

  {
    id: crypto.randomUUID(),

    titulo: "Agregar estadísticas",

    descripcion:
      "Cards dinámicas del dashboard",

    estado: "hecho",

    prioridad: "low",

    fechaCreacion:
      new Date().toISOString(),
  },
];