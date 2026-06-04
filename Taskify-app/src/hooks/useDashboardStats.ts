import { useMemo } from "react";
import type { Tarea } from "../types/task";

export function useDashboardStats(tareasActivas: Tarea[]) {
  return useMemo(() => {
    const totalTareas = tareasActivas.length;
    const tareasCompletadas = tareasActivas.filter((t) => t.estado === "completada").length;
    const tareasEnProgreso = tareasActivas.filter((t) => t.estado === "en-progreso").length;
    const tareasPendientes = tareasActivas.filter((t) => t.estado === "pendiente").length;

    return {
      totalTareas,
      tareasCompletadas,
      tareasEnProgreso,
      tareasPendientes,
    };
  }, [tareasActivas]);
}