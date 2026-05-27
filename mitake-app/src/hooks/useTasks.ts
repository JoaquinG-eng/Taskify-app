import { useEffect, useState } from "react";
import type { Tarea } from "../types";
import { mockTareas } from "../utils/mockTareas";

function useTasks() {
  const [tareas, setTareas] = useState<Tarea[]>([]);

  useEffect(() => {
    setTareas(mockTareas);
  }, []);

  function crearTarea(nuevaTarea: Omit<Tarea, "id" | "fechaCreacion">) {
    const tarea: Tarea = {
      id: crypto.randomUUID(),
      fechaCreacion: new Date().toISOString(),
      ...nuevaTarea,
    };
    setTareas((prev) => [tarea, ...prev]);
  }

  function eliminarTarea(id: string) {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  }

  function cambiarEstado(id: string, estado: Tarea["estado"]) {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado } : t))
    );
  }

  // ── Estadísticas ─────────────────────────────────────────
  const tareasCompletadas = tareas.filter(
    (t) => t.estado === "completada"
  ).length;

  const tareasEnProgreso = tareas.filter(
    (t) => t.estado === "en-progreso"
  ).length;

  const tareasPendientes = tareas.filter(
    (t) => t.estado === "pendiente"
  ).length;

  return {
    tareas,
    crearTarea,
    eliminarTarea,
    cambiarEstado,
    tareasCompletadas,
    tareasEnProgreso,
    tareasPendientes,
  };
}

export default useTasks;