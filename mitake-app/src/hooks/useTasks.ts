// ============================================================
// ARCHIVO: src/hooks/useTasks.ts
// ============================================================

import { useState, useEffect } from "react";
import type { Tarea, TareaNueva, EstadoTarea } from "../types/task";
import type { Actividad, TipoActividad } from "../types/actividad";

const CLAVE_TAREAS      = "mitake-tareas";
const CLAVE_ACTIVIDADES = "mitake-actividades";
const MAX_ACTIVIDADES   = 30;

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

export function useTasks() {
  const [listaDeTareas, setListaDeTareas] = useState<Tarea[]>(
    cargarTareasDesdeStorage
  );
  const [actividades, setActividades] = useState<Actividad[]>(
    cargarActividadesDesdeStorage
  );

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
          if (tarea.estado !== "en-progreso" || tarea.progreso >= 100)
            return tarea;
          const progresoNuevo = Math.min(tarea.progreso + 10, 100);
          const estadoNuevo: EstadoTarea =
            progresoNuevo === 100 ? "completada" : "en-progreso";
          return { ...tarea, progreso: progresoNuevo, estado: estadoNuevo };
        })
      );
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // ---- helper interno ----
  function registrarActividad(tipo: TipoActividad, descripcion: string): void {
    const nueva: Actividad = { id: generarId(), tipo, descripcion, hora: horaActual() };
    setActividades((ant) => [nueva, ...ant].slice(0, MAX_ACTIVIDADES));
  }

  const tareasActivas    = listaDeTareas.filter((t) => !t.estaEnPapelera);
  const tareasEnPapelera = listaDeTareas.filter((t) => t.estaEnPapelera);

  // --------------------------------------------------------
  // CREAR
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
    setListaDeTareas((ant) => [tarea, ...ant]);
    registrarActividad("tarea_creada", `Creaste "${tarea.titulo}"`);
  }

  // --------------------------------------------------------
  // EDITAR
  // Actualiza título, descripción, prioridad y fecha límite.
  // El estado y progreso no cambian al editar (son independientes).
  // --------------------------------------------------------
  function editarTarea(identificador: string, datosEditados: TareaNueva): void {
    setListaDeTareas((anterior) =>
      anterior.map((tarea) => {
        if (tarea.id !== identificador) return tarea;
        return {
          ...tarea,
          titulo:      datosEditados.titulo,
          descripcion: datosEditados.descripcion,
          prioridad:   datosEditados.prioridad,
          fechaLimite: datosEditados.fechaLimite,
          // No tocamos estado ni progreso: el usuario los gestiona
          // con los botones de la card, no con el formulario.
        };
      })
    );
    registrarActividad("tarea_editada", `Editaste "${datosEditados.titulo}"`);
  }

  // --------------------------------------------------------
  // CAMBIAR ESTADO
  // --------------------------------------------------------
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
    const tarea  = listaDeTareas.find((t) => t.id === identificador);
    const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";
    if (nuevoEstado === "completada")  registrarActividad("tarea_completada",  `Completaste ${nombre}`);
    if (nuevoEstado === "en-progreso") registrarActividad("tarea_en_progreso", `${nombre} pasó a en progreso`);
    if (nuevoEstado === "pendiente")   registrarActividad("tarea_pendiente",   `${nombre} volvió a pendiente`);
  }

  // --------------------------------------------------------
  // PROGRESO
  // --------------------------------------------------------
  function actualizarProgreso(identificador: string, porcentajeNuevo: number): void {
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
      const tarea  = listaDeTareas.find((t) => t.id === identificador);
      const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";
      registrarActividad("tarea_completada", `${nombre} llegó al 100%`);
    }
  }

  // --------------------------------------------------------
  // PAPELERA
  // --------------------------------------------------------
  function moverAPapelera(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    setListaDeTareas((ant) =>
      ant.map((t) =>
        t.id === identificador
          ? { ...t, estaEnPapelera: true, fechaEliminacion: new Date().toLocaleDateString("es-AR") }
          : t
      )
    );
    registrarActividad("tarea_papelera", `"${tarea?.titulo ?? "Tarea"}" fue a la papelera`);
  }

  function restaurarDePapelera(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    setListaDeTareas((ant) =>
      ant.map((t) =>
        t.id === identificador
          ? { ...t, estaEnPapelera: false, fechaEliminacion: undefined }
          : t
      )
    );
    registrarActividad("tarea_restaurada", `Restauraste "${tarea?.titulo ?? "Tarea"}"`);
  }

  function eliminarPermanentemente(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    setListaDeTareas((ant) => ant.filter((t) => t.id !== identificador));
    registrarActividad("tarea_eliminada", `Eliminaste "${tarea?.titulo ?? "Tarea"}" definitivamente`);
  }

  function vaciarPapelera(): void {
    const cantidad = tareasEnPapelera.length;
    setListaDeTareas((ant) => ant.filter((t) => !t.estaEnPapelera));
    registrarActividad("papelera_vaciada", `Vaciaste la papelera (${cantidad} tarea${cantidad !== 1 ? "s" : ""})`);
  }

  return {
    listaDeTareas,
    tareasActivas,
    tareasEnPapelera,
    actividades,
    crearTarea,
    editarTarea,
    cambiarEstadoTarea,
    actualizarProgreso,
    moverAPapelera,
    restaurarDePapelera,
    eliminarPermanentemente,
    vaciarPapelera,
  };
}