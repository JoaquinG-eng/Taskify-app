// ============================================================
// ARCHIVO: src/hooks/useTasks.ts
// ============================================================

import { useState, useEffect } from "react";
import type { Tarea, TareaNueva, EstadoTarea } from "../types/task";

const CLAVE_LOCAL_STORAGE = "mitake-tareas";

function cargarTareasDesdeStorage(): Tarea[] {
  try {
    const datosGuardados = localStorage.getItem(CLAVE_LOCAL_STORAGE);
    if (!datosGuardados) return [];
    return JSON.parse(datosGuardados) as Tarea[];
  } catch (_error) {
    return [];
  }
}

function guardarTareasEnStorage(listaDeTareas: Tarea[]): void {
  localStorage.setItem(CLAVE_LOCAL_STORAGE, JSON.stringify(listaDeTareas));
}

function generarIdUnico(): string {
  return `tarea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useTasks() {
  const [listaDeTareas, setListaDeTareas] = useState<Tarea[]>(
    cargarTareasDesdeStorage
  );

  // Guarda en localStorage cada vez que cambia la lista
  useEffect(() => {
    guardarTareasEnStorage(listaDeTareas);
  }, [listaDeTareas]);

  // --------------------------------------------------------
  // TIMER: sube 10% cada 30 segundos a tareas en progreso.
  // Si llega a 100% las marca como completadas automáticamente.
  // Se limpia solo cuando el componente se desmonta.
  // --------------------------------------------------------
  useEffect(() => {
    const intervalo = setInterval(() => {
      setListaDeTareas((anterior) =>
        anterior.map((tarea) => {
          // Solo avanza si está en progreso y no llegó al tope
          if (tarea.estado !== "en-progreso" || tarea.progreso >= 100) {
            return tarea;
          }

          const progresoNuevo = Math.min(tarea.progreso + 20, 100);
          const estadoNuevo: EstadoTarea =
            progresoNuevo === 100 ? "completada" : "en-progreso";

          return { ...tarea, progreso: progresoNuevo, estado: estadoNuevo };
        })
      );
    }, 3000); // 3 segundos

    return () => clearInterval(intervalo);
  }, []);

  const tareasActivas = listaDeTareas.filter((tarea) => !tarea.estaEnPapelera);
  const tareasEnPapelera = listaDeTareas.filter((tarea) => tarea.estaEnPapelera);

  function crearTarea(datosNuevos: TareaNueva): void {
    const tareaCompleta: Tarea = {
      id: generarIdUnico(),
      titulo: datosNuevos.titulo,
      descripcion: datosNuevos.descripcion,
      estado: datosNuevos.estado,
      prioridad: datosNuevos.prioridad,
      fechaCreacion: new Date().toLocaleDateString("es-AR"),
      fechaLimite: datosNuevos.fechaLimite,
      progreso: datosNuevos.estado === "completada" ? 100 : 0,
      estaEnPapelera: false,
    };

    setListaDeTareas((anterior) => [tareaCompleta, ...anterior]);
  }

  function cambiarEstadoTarea(
    identificador: string,
    nuevoEstado: EstadoTarea
  ): void {
    setListaDeTareas((anterior) =>
      anterior.map((tarea) => {
        if (tarea.id !== identificador) return tarea;

        let progresoNuevo = tarea.progreso;
        if (nuevoEstado === "completada") progresoNuevo = 100;
        if (nuevoEstado === "pendiente")  progresoNuevo = 0;
        if (nuevoEstado === "en-progreso" && tarea.progreso === 0) {
          progresoNuevo = 10;
        }

        return { ...tarea, estado: nuevoEstado, progreso: progresoNuevo };
      })
    );
  }

  function actualizarProgreso(
    identificador: string,
    porcentajeNuevo: number
  ): void {
    setListaDeTareas((anterior) =>
      anterior.map((tarea) => {
        if (tarea.id !== identificador) return tarea;

        const progresoFinal = Math.min(100, Math.max(0, porcentajeNuevo));
        const estadoFinal: EstadoTarea =
          progresoFinal === 100
            ? "completada"
            : progresoFinal > 0
            ? "en-progreso"
            : "pendiente";

        return { ...tarea, progreso: progresoFinal, estado: estadoFinal };
      })
    );
  }

  function moverAPapelera(identificador: string): void {
    setListaDeTareas((anterior) =>
      anterior.map((tarea) =>
        tarea.id === identificador
          ? { ...tarea, estaEnPapelera: true, fechaEliminacion: new Date().toLocaleDateString("es-AR") }
          : tarea
      )
    );
  }

  function restaurarDePapelera(identificador: string): void {
    setListaDeTareas((anterior) =>
      anterior.map((tarea) =>
        tarea.id === identificador
          ? { ...tarea, estaEnPapelera: false, fechaEliminacion: undefined }
          : tarea
      )
    );
  }

  function eliminarPermanentemente(identificador: string): void {
    setListaDeTareas((anterior) =>
      anterior.filter((tarea) => tarea.id !== identificador)
    );
  }

  function vaciarPapelera(): void {
    setListaDeTareas((anterior) =>
      anterior.filter((tarea) => !tarea.estaEnPapelera)
    );
  }

  return {
    listaDeTareas,
    tareasActivas,
    tareasEnPapelera,
    crearTarea,
    cambiarEstadoTarea,
    actualizarProgreso,
    moverAPapelera,
    restaurarDePapelera,
    eliminarPermanentemente,
    vaciarPapelera,
  };
}