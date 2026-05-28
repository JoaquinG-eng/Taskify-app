// ============================================================
// ARCHIVO: src/hooks/useTasks.ts
// ============================================================

import { useState, useEffect } from "react";
import type { Tarea, TareaNueva, EstadoTarea } from "../types/task";
import type { Actividad, TipoActividad } from "../types/actividad";

const CLAVE_TAREAS      = "mitake-tareas";
const CLAVE_ACTIVIDADES = "mitake-actividades";
const MAX_ACTIVIDADES   = 30; // máximo de entradas en el feed

// ---- helpers de storage ----
function cargarTareasDesdeStorage(): Tarea[] {
  try {
    const datos = localStorage.getItem(CLAVE_TAREAS);
    return datos ? (JSON.parse(datos) as Tarea[]) : [];
  } catch { return []; }
}

function cargarActividadesDesdeStorage(): Actividad[] {
  try {
    const datos = localStorage.getItem(CLAVE_ACTIVIDADES);
    return datos ? (JSON.parse(datos) as Actividad[]) : [];
  } catch { return []; }
}

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function horaActual(): string {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// HOOK: useTasks
// ============================================================
export function useTasks() {
  const [listaDeTareas, setListaDeTareas] = useState<Tarea[]>(
    cargarTareasDesdeStorage
  );
  const [actividades, setActividades] = useState<Actividad[]>(
    cargarActividadesDesdeStorage
  );

  // Persistencia automática
  useEffect(() => {
    localStorage.setItem(CLAVE_TAREAS, JSON.stringify(listaDeTareas));
  }, [listaDeTareas]);

  useEffect(() => {
    localStorage.setItem(CLAVE_ACTIVIDADES, JSON.stringify(actividades));
  }, [actividades]);

  // Timer: +10% cada 30s a tareas en progreso
  useEffect(() => {
    const intervalo = setInterval(() => {
      setListaDeTareas((anterior) =>
        anterior.map((tarea) => {
          if (tarea.estado !== "en-progreso" || tarea.progreso >= 100) return tarea;
          const progresoNuevo = Math.min(tarea.progreso + 10, 100);
          const estadoNuevo: EstadoTarea =
            progresoNuevo === 100 ? "completada" : "en-progreso";
          return { ...tarea, progreso: progresoNuevo, estado: estadoNuevo };
        })
      );
    }, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // --------------------------------------------------------
  // FUNCIÓN INTERNA: registrarActividad
  // --------------------------------------------------------
  function registrarActividad(
    tipo: TipoActividad,
    descripcion: string
  ): void {
    const nueva: Actividad = {
      id: generarId(),
      tipo,
      descripcion,
      hora: horaActual(),
    };
    setActividades((anterior) =>
      [nueva, ...anterior].slice(0, MAX_ACTIVIDADES)
    );
  }

  // ---- Derivadas ----
  const tareasActivas    = listaDeTareas.filter((t) => !t.estaEnPapelera);
  const tareasEnPapelera = listaDeTareas.filter((t) => t.estaEnPapelera);

  // --------------------------------------------------------
  // CRUD
  // --------------------------------------------------------
  function crearTarea(datosNuevos: TareaNueva): void {
    const tarea: Tarea = {
      id: `tarea-${generarId()}`,
      titulo: datosNuevos.titulo,
      descripcion: datosNuevos.descripcion,
      estado: datosNuevos.estado,
      prioridad: datosNuevos.prioridad,
      fechaCreacion: new Date().toLocaleDateString("es-AR"),
      fechaLimite: datosNuevos.fechaLimite,
      progreso: datosNuevos.estado === "completada" ? 100 : 0,
      estaEnPapelera: false,
    };
    setListaDeTareas((anterior) => [tarea, ...anterior]);
    registrarActividad("tarea_creada", `Creaste "${tarea.titulo}"`);
  }

  function cambiarEstadoTarea(
    identificador: string,
    nuevoEstado: EstadoTarea
  ): void {
    setListaDeTareas((anterior) =>
      anterior.map((tarea) => {
        if (tarea.id !== identificador) return tarea;
        let progreso = tarea.progreso;
        if (nuevoEstado === "completada")  progreso = 100;
        if (nuevoEstado === "pendiente")   progreso = 0;
        if (nuevoEstado === "en-progreso" && tarea.progreso === 0) progreso = 10;
        return { ...tarea, estado: nuevoEstado, progreso };
      })
    );

    const tarea = listaDeTareas.find((t) => t.id === identificador);
    const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";

    if (nuevoEstado === "completada")  registrarActividad("tarea_completada",  `Completaste ${nombre}`);
    if (nuevoEstado === "en-progreso") registrarActividad("tarea_en_progreso", `${nombre} pasó a en progreso`);
    if (nuevoEstado === "pendiente")   registrarActividad("tarea_pendiente",   `${nombre} volvió a pendiente`);
  }

  function actualizarProgreso(
    identificador: string,
    porcentajeNuevo: number
  ): void {
    setListaDeTareas((anterior) =>
      anterior.map((tarea) => {
        if (tarea.id !== identificador) return tarea;
        const progreso = Math.min(100, Math.max(0, porcentajeNuevo));
        const estado: EstadoTarea =
          progreso === 100 ? "completada" : progreso > 0 ? "en-progreso" : "pendiente";
        return { ...tarea, progreso, estado };
      })
    );

    if (porcentajeNuevo >= 100) {
      const tarea = listaDeTareas.find((t) => t.id === identificador);
      const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";
      registrarActividad("tarea_completada", `${nombre} llegó al 100%`);
    }
  }

  function moverAPapelera(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    setListaDeTareas((anterior) =>
      anterior.map((t) =>
        t.id === identificador
          ? { ...t, estaEnPapelera: true, fechaEliminacion: new Date().toLocaleDateString("es-AR") }
          : t
      )
    );
    const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";
    registrarActividad("tarea_papelera", `${nombre} fue a la papelera`);
  }

  function restaurarDePapelera(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    setListaDeTareas((anterior) =>
      anterior.map((t) =>
        t.id === identificador
          ? { ...t, estaEnPapelera: false, fechaEliminacion: undefined }
          : t
      )
    );
    const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";
    registrarActividad("tarea_restaurada", `Restauraste ${nombre}`);
  }

  function eliminarPermanentemente(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    setListaDeTareas((anterior) => anterior.filter((t) => t.id !== identificador));
    const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";
    registrarActividad("tarea_eliminada", `Eliminaste ${nombre} definitivamente`);
  }

  function vaciarPapelera(): void {
    const cantidad = tareasEnPapelera.length;
    setListaDeTareas((anterior) => anterior.filter((t) => !t.estaEnPapelera));
    registrarActividad(
      "papelera_vaciada",
      `Vaciaste la papelera (${cantidad} tarea${cantidad !== 1 ? "s" : ""})`
    );
  }

  return {
    listaDeTareas,
    tareasActivas,
    tareasEnPapelera,
    actividades,
    crearTarea,
    cambiarEstadoTarea,
    actualizarProgreso,
    moverAPapelera,
    restaurarDePapelera,
    eliminarPermanentemente,
    vaciarPapelera,
  };
}