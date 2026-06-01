// ============================================================
// ARCHIVO: src/hooks/useTasks.ts
// ============================================================

import { useState, useEffect, useCallback } from "react";
import type { Tarea, TareaNueva, EstadoTarea } from "../types/task";
import type { Actividad, TipoActividad }       from "../types/actividad";
import {
  suscribirTareas,
  crearTareaEnFirestore,
  editarTareaEnFirestore,
  cambiarEstadoEnFirestore,
  actualizarProgresoEnFirestore,
  moverAPapelaraEnFirestore,
  restaurarDePapeleraEnFirestore,
  eliminarPermanentementeEnFirestore,
} from "../services/taskService";

// ── Clave dinámica por usuario ──────────────────────────────
function claveActividades(uid: string): string {
  return `taskify-actividades-${uid}`;
}

const MAX_ACTIVIDADES = 30;

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function horaActual(): string {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function useTasks(userId: string) {
  const [listaDeTareas, setListaDeTareas] = useState<Tarea[]>([]);
  const [cargando,      setCargando]      = useState(true);
  const [errorTareas,   setErrorTareas]   = useState<string | null>(null);

  // ── Actividades inicializadas con la clave del usuario ──
  const [actividades, setActividades] = useState<Actividad[]>(() => {
    if (!userId) return [];
    try {
      const datos = localStorage.getItem(claveActividades(userId));
      return datos ? (JSON.parse(datos) as Actividad[]) : [];
    } catch { return []; }
  });

  // ── Persistir actividades con clave del usuario ──
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(claveActividades(userId), JSON.stringify(actividades));
  }, [actividades, userId]);

  // ── Suscripción Firestore ──
  useEffect(() => {
    if (!userId) { setCargando(false); return; }
    setCargando(true);
    const cancelar = suscribirTareas(
      userId,
      (tareas) => { setListaDeTareas(tareas); setCargando(false); setErrorTareas(null); },
      (error)  => { setErrorTareas(error.message); setCargando(false); }
    );
    return () => cancelar();
  }, [userId]);

  const registrarActividad = useCallback((tipo: TipoActividad, descripcion: string) => {
    const nueva: Actividad = { id: generarId(), tipo, descripcion, hora: horaActual() };
    setActividades((ant) => [nueva, ...ant].slice(0, MAX_ACTIVIDADES));
  }, []);

  const tareasActivas    = listaDeTareas.filter((t) => !t.estaEnPapelera);
  const tareasEnPapelera = listaDeTareas.filter((t) =>  t.estaEnPapelera);

  function crearTarea(datosNuevos: TareaNueva): void {
    registrarActividad("tarea_creada", `Creaste "${datosNuevos.titulo}"`);
    crearTareaEnFirestore(userId, datosNuevos).catch(console.error);
  }

  function editarTarea(identificador: string, datosEditados: TareaNueva): void {
    registrarActividad("tarea_editada", `Editaste "${datosEditados.titulo}"`);
    editarTareaEnFirestore(identificador, datosEditados).catch(console.error);
  }

  function cambiarEstadoTarea(identificador: string, nuevoEstado: EstadoTarea): void {
    const tarea  = listaDeTareas.find((t) => t.id === identificador);
    let progreso = tarea?.progreso ?? 0;
    if (nuevoEstado === "completada")  progreso = 100;
    if (nuevoEstado === "pendiente")   progreso = 0;
    if (nuevoEstado === "en-progreso" && progreso === 0) progreso = 10;

    const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";
    if (nuevoEstado === "completada")  registrarActividad("tarea_completada",  `Completaste ${nombre}`);
    if (nuevoEstado === "en-progreso") registrarActividad("tarea_en_progreso", `${nombre} pasó a en progreso`);
    if (nuevoEstado === "pendiente")   registrarActividad("tarea_pendiente",   `${nombre} volvió a pendiente`);

    cambiarEstadoEnFirestore(identificador, nuevoEstado, progreso).catch(console.error);
  }

  function actualizarProgreso(identificador: string, porcentajeNuevo: number): void {
    const progreso = Math.min(100, Math.max(0, porcentajeNuevo));
    const estado: EstadoTarea =
      progreso === 100 ? "completada" : progreso > 0 ? "en-progreso" : "pendiente";

    if (progreso >= 100) {
      const tarea = listaDeTareas.find((t) => t.id === identificador);
      registrarActividad("tarea_completada", `"${tarea?.titulo ?? "Tarea"}" llegó al 100%`);
    }

    actualizarProgresoEnFirestore(identificador, progreso, estado).catch(console.error);
  }

  function moverAPapelera(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    registrarActividad("tarea_papelera", `"${tarea?.titulo ?? "Tarea"}" fue a la papelera`);
    moverAPapelaraEnFirestore(identificador).catch(console.error);
  }

  function restaurarDePapelera(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    registrarActividad("tarea_restaurada", `Restauraste "${tarea?.titulo ?? "Tarea"}"`);
    restaurarDePapeleraEnFirestore(identificador).catch(console.error);
  }

  function eliminarPermanentemente(identificador: string): void {
    const tarea = listaDeTareas.find((t) => t.id === identificador);
    registrarActividad("tarea_eliminada", `Eliminaste "${tarea?.titulo ?? "Tarea"}" definitivamente`);
    eliminarPermanentementeEnFirestore(identificador).catch(console.error);
  }

  function vaciarPapelera(): void {
    const cantidad = tareasEnPapelera.length;
    registrarActividad("papelera_vaciada", `Vaciaste la papelera (${cantidad} tarea${cantidad !== 1 ? "s" : ""})`);
    Promise.all(
      tareasEnPapelera.map((t) => eliminarPermanentementeEnFirestore(t.id))
    ).catch(console.error);
  }

  return {
    listaDeTareas, tareasActivas, tareasEnPapelera,
    cargando, errorTareas, actividades,
    crearTarea, editarTarea, cambiarEstadoTarea,
    actualizarProgreso, moverAPapelera,
    restaurarDePapelera, eliminarPermanentemente, vaciarPapelera,
  };
}