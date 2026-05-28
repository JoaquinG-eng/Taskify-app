// ============================================================
// ARCHIVO: src/types/actividad.ts
// ¿Para qué sirve? Define el tipo de cada entrada del feed
// de actividad reciente que se muestra en el dashboard.
// ============================================================

export type TipoActividad =
  | "tarea_creada"
  | "tarea_completada"
  | "tarea_en_progreso"
  | "tarea_pendiente"
  | "tarea_papelera"
  | "tarea_restaurada"
  | "tarea_eliminada"
  | "papelera_vaciada";

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  descripcion: string;   // Ej: "Creaste 'Diseñar dashboard'"
  hora: string;          // Ej: "14:32"
}

// ---- Configuración visual por tipo ----
export const CONFIG_ACTIVIDAD: Record<
  TipoActividad,
  { icono: string; color: string; etiqueta: string }
> = {
  tarea_creada:      { icono: "✦", color: "#8b5cf6", etiqueta: "Creada"     },
  tarea_completada:  { icono: "✓", color: "#10b981", etiqueta: "Completada" },
  tarea_en_progreso: { icono: "●", color: "#f59e0b", etiqueta: "En progreso"},
  tarea_pendiente:   { icono: "○", color: "#3b82f6", etiqueta: "Pendiente"  },
  tarea_papelera:    { icono: "↓", color: "#ef4444", etiqueta: "Eliminada"  },
  tarea_restaurada:  { icono: "↩", color: "#06b6d4", etiqueta: "Restaurada" },
  tarea_eliminada:   { icono: "✕", color: "#ef4444", etiqueta: "Borrada"    },
  papelera_vaciada:  { icono: "🗑", color: "#ef4444", etiqueta: "Papelera vaciada" },
};