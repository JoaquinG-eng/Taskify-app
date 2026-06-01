// ============================================================
// ¿Para qué sirve? Define todos los tipos de datos del proyecto.
// Agregamos: asignadoA, creadoPor y FiltrosDeBusqueda.
// ============================================================

export type EstadoTarea    = "pendiente" | "en-progreso" | "completada";
export type PrioridadTarea = "alta" | "media" | "baja";

// ------------------------------------------------------------
// INTERFAZ: Tarea
// ------------------------------------------------------------
export interface Tarea {
    id: string;
    titulo: string;
    descripcion: string;
    estado: EstadoTarea;
    prioridad: PrioridadTarea;
    fechaCreacion: string;
    fechaLimite?: string;
    progreso: number;
    estaEnPapelera: boolean;
    fechaEliminacion?: string;
    asignadoA?: string;   // Quién ejecuta la tarea
    creadoPor?: string;   // Quién la registró
}

// ------------------------------------------------------------
// INTERFAZ: TareaNueva
// Datos que pide el formulario. El resto los genera el sistema.
// ------------------------------------------------------------
export interface TareaNueva {
    titulo: string;
    descripcion: string;
    estado: EstadoTarea;
    prioridad: PrioridadTarea;
    fechaLimite?: string;
    asignadoA?: string;
  creadoPor?: string;
}

// ------------------------------------------------------------
// INTERFAZ: FiltrosDeBusqueda
// Estado completo del panel de búsqueda avanzada.
// "todas" significa sin filtro activo para ese campo.
// ------------------------------------------------------------
export interface FiltrosDeBusqueda {
  textoDeBusqueda: string;
  estadoFiltrado:     EstadoTarea | "todas";
  prioridadFiltrada:  PrioridadTarea | "todas";
  fechaDesde: string;
  fechaHasta: string;
  asignadoA: string;
}

// ------------------------------------------------------------
// CONSTANTE: filtros vacíos por defecto
// Útil para inicializar y para el botón "Limpiar filtros".
// ------------------------------------------------------------
export const FILTROS_VACIOS: FiltrosDeBusqueda = {
  textoDeBusqueda:  "",
  estadoFiltrado:   "todas",
  prioridadFiltrada: "todas",
  fechaDesde:       "",
  fechaHasta:       "",
  asignadoA:        "",
};