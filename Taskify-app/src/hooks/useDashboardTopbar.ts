type SeccionActiva =
  | "dashboard"
  | "mis-tareas"
  | "calendario"
  | "tickets"
  | "papelera"
  | "about";

type ParametrosUseDashboardTopbar = {
  seccionActiva: SeccionActiva;
  nombreUsuario: string;
  cargando: boolean;
  cargandoTickets: boolean;
  tareasPendientes: number;
  ticketsActivos: number;
  ticketsTotal: number;
  tareasFiltradasCantidad: number;
  tareasEnPapeleraCantidad: number;
  hayFiltrosActivos: boolean;
};

function obtenerSaludo(): string {
  const hora = new Date().getHours();

  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function useDashboardTopbar({
  seccionActiva,
  nombreUsuario,
  cargando,
  cargandoTickets,
  tareasPendientes,
  ticketsActivos,
  ticketsTotal,
  tareasFiltradasCantidad,
  tareasEnPapeleraCantidad,
  hayFiltrosActivos,
}: ParametrosUseDashboardTopbar) {
  const configTopbar: Record<SeccionActiva, { titulo: string; subtitulo: string }> = {
    dashboard: {
      titulo: `${obtenerSaludo()}, ${nombreUsuario} 👋`,
      subtitulo: cargando || cargandoTickets
        ? "Cargando..."
        : `Qué bueno tenerte nuevamente por acá. Hoy tenés ${tareasPendientes} tarea${tareasPendientes !== 1 ? "s" : ""} pendiente${tareasPendientes !== 1 ? "s" : ""} y ${ticketsActivos} ticket${ticketsActivos !== 1 ? "s" : ""} activo${ticketsActivos !== 1 ? "s" : ""}.`,
    },

    "mis-tareas": {
      titulo: "Mis tareas",
      subtitulo: hayFiltrosActivos
        ? `${tareasFiltradasCantidad} resultado${tareasFiltradasCantidad !== 1 ? "s" : ""}`
        : `${tareasPendientes} pendiente${tareasPendientes !== 1 ? "s" : ""}`,
    },

    calendario: {
      titulo: "Calendario",
      subtitulo: "Organizá tus tareas por fecha",
    },

    tickets: {
      titulo: "Tickets",
      subtitulo: cargandoTickets
        ? "Cargando tickets..."
        : `${ticketsActivos} activo${ticketsActivos !== 1 ? "s" : ""} · ${ticketsTotal} total`,
    },

    papelera: {
      titulo: "Papelera",
      subtitulo: `${tareasEnPapeleraCantidad} elemento${tareasEnPapeleraCantidad !== 1 ? "s" : ""}`,
    },

    about: {
      titulo: "Sobre Taskify",
      subtitulo: "Información del proyecto",
    },
  };

  return {
    tituloSeccion: configTopbar[seccionActiva].titulo,
    subtituloSeccion: configTopbar[seccionActiva].subtitulo,
    mostrarBotonNueva:
      seccionActiva === "dashboard" ||
      seccionActiva === "mis-tareas" ||
      seccionActiva === "calendario",
    mostrarBotonEmail: seccionActiva === "dashboard" || seccionActiva === "mis-tareas",
  };
}
