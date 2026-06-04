import { useMemo, useState } from "react";
import type { FiltrosDeBusqueda, Tarea } from "../types/task";
import { FILTROS_VACIOS } from "../types/task";

export function useDashboardFilters(tareasActivas: Tarea[]) {
  const [filtros, setFiltros] = useState<FiltrosDeBusqueda>(FILTROS_VACIOS);

  function actualizarFiltro<K extends keyof FiltrosDeBusqueda>(
    campo: K,
    valor: FiltrosDeBusqueda[K]
  ) {
    setFiltros((ant) => ({ ...ant, [campo]: valor }));
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
  }

  const hayFiltrosActivos =
    filtros.textoDeBusqueda !== "" ||
    filtros.estadoFiltrado !== "todas" ||
    filtros.asignadoA !== "";

  const tareasFiltradas = useMemo(() => {
    return tareasActivas.filter((tarea) => {
      const texto = filtros.textoDeBusqueda.toLowerCase();

      const coincideTexto =
        texto === "" ||
        tarea.titulo.toLowerCase().includes(texto) ||
        (tarea.descripcion ?? "").toLowerCase().includes(texto) ||
        (tarea.creadoPor ?? "").toLowerCase().includes(texto) ||
        (tarea.asignadoA ?? "").toLowerCase().includes(texto);

      const coincideEstado =
        filtros.estadoFiltrado === "todas" ||
        tarea.estado === filtros.estadoFiltrado;

      const coincideAsignado =
        filtros.asignadoA === "" ||
        (tarea.asignadoA ?? "").toLowerCase().includes(filtros.asignadoA.toLowerCase());

      return coincideTexto && coincideEstado && coincideAsignado;
    });
  }, [tareasActivas, filtros]);

  return {
    filtros,
    tareasFiltradas,
    hayFiltrosActivos,
    actualizarFiltro,
    limpiarFiltros,
  };
}