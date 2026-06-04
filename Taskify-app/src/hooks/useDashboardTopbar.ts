type SeccionActiva = "dashboard" | "mis-tareas" | "tickets" | "papelera" | "about";

type ParametrosUseDashboardTopbar = {
  seccionActiva: SeccionActiva;
  nombreUsuario: string;
  cargando: boolean;
  tareasPendientes: number;
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
  tareasPendientes,
  tareasFiltradasCantidad,
  tareasEnPapeleraCantidad,
  hayFiltrosActivos,
}: ParametrosUseDashboardTopbar) {
  const configTopbar: Record<SeccionActiva, { titulo: string; subtitulo: string }> = {
    dashboard: {
      titulo: `${obtenerSaludo()}, ${nombreUsuario} 👋`,
      subtitulo: cargando
        ? "Cargando..."
        : `Qué bueno tenerte nuevamente por acá. Hoy tenés ${tareasPendientes} tarea${tareasPendientes !== 1 ? "s" : ""} pendiente${tareasPendientes !== 1 ? "s" : ""} para continuar avanzando.`,
    },

    "mis-tareas": {
      titulo: "Mis tareas",
      subtitulo: hayFiltrosActivos
        ? `${tareasFiltradasCantidad} resultado${tareasFiltradasCantidad !== 1 ? "s" : ""}`
        : `${tareasPendientes} pendiente${tareasPendientes !== 1 ? "s" : ""}`,
    },

    tickets: {
      titulo: "Tickets",
      subtitulo: "Próximamente",
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
    mostrarBotonNueva: seccionActiva === "dashboard" || seccionActiva === "mis-tareas",
    mostrarBotonEmail: seccionActiva === "dashboard" || seccionActiva === "mis-tareas",
  };
}