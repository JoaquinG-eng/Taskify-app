// ============================================================
// ARCHIVO: src/pages/dashboard/DashboardPage.tsx
// ============================================================

import { useState } from "react";

import { useTasks } from "../../hooks/useTasks";

import type { TareaNueva } from "../../types/task";

import Sidebar       from "../../components/layout/Sidebar/Sidebar";
import Topbar        from "../../components/layout/Topbar/Topbar";
import TaskForm      from "../../components/tasks/TaskForm/TaskForm";
import KanbanBoard   from "../../components/kanban/KanbanBoard/KanbanBoard";
import StatCard      from "../../components/ui/StatCard/StatCard";
import ActivityFeed  from "../../components/ui/ActivityFeed/ActivityFeed";
import AlertContainer from "../../components/ui/Alert/Alert";
import PapeleraPage  from "../papelera/PapeleraPage";
import AboutPage     from "../about/AboutPage";

import "./DashboardPage.css";

type SeccionActiva =
  | "dashboard"
  | "mis-tareas"
  | "tickets"
  | "papelera"
  | "about";

export default function DashboardPage() {
  const {
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
  } = useTasks();

  const [seccionActiva, setSeccionActiva] =
    useState<SeccionActiva>("dashboard");
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  function manejarCreacionDeTarea(datos: TareaNueva): void {
    crearTarea(datos);
    setMostrarFormulario(false);
  }

  // ---- Estadísticas ----
  const totalTareas       = tareasActivas.length;
  const tareasCompletadas = tareasActivas.filter((t) => t.estado === "completada").length;
  const tareasEnProgreso  = tareasActivas.filter((t) => t.estado === "en-progreso").length;
  const tareasPendientes  = tareasActivas.filter((t) => t.estado === "pendiente").length;

  const configuracionTopbar: Record<
    SeccionActiva,
    { titulo: string; subtitulo: string }
  > = {
    dashboard:    { titulo: "Dashboard",      subtitulo: `${totalTareas} tarea${totalTareas !== 1 ? "s" : ""} en total`          },
    "mis-tareas": { titulo: "Mis tareas",     subtitulo: `${tareasPendientes} pendiente${tareasPendientes !== 1 ? "s" : ""}` },
    tickets:      { titulo: "Tickets",        subtitulo: "Próximamente"                                                          },
    papelera:     { titulo: "Papelera",       subtitulo: `${tareasEnPapelera.length} elemento${tareasEnPapelera.length !== 1 ? "s" : ""}` },
    about:        { titulo: "Sobre Mitake",   subtitulo: "Información del proyecto"                                               },
  };

  const topbarActual = configuracionTopbar[seccionActiva];
  const mostrarBotonNueva =
    seccionActiva === "dashboard" || seccionActiva === "mis-tareas";

  return (
    <div className="dashboard-layout">

      <Sidebar
        seccionActiva={seccionActiva}
        alCambiarSeccion={(s) => setSeccionActiva(s as SeccionActiva)}
        cantidadEnPapelera={tareasEnPapelera.length}
        estaAbierto={sidebarAbierto}
        alCerrar={() => setSidebarAbierto(false)}
      />

      <main className="dashboard-layout__main">

        <Topbar
          tituloSeccion={topbarActual.titulo}
          subtituloSeccion={topbarActual.subtitulo}
          alAbrirSidebar={() => setSidebarAbierto(true)}
          botonPrimario={
            mostrarBotonNueva
              ? { etiqueta: "Nueva tarea", alHacerClick: () => setMostrarFormulario(true) }
              : undefined
          }
        />

        {/* ---- DASHBOARD ---- */}
        {seccionActiva === "dashboard" && (
          <div className="dashboard-layout__contenido">

            {/* Stat Cards */}
            <div className="dashboard-layout__estadisticas">
              <StatCard
                tituloEstadistica="Total"
                valorPrincipal={totalTareas}
                descripcionSecundaria="Tareas creadas"
                colorAcento="#8b5cf6"
                icono="📋"
              />
              <StatCard
                tituloEstadistica="Pendientes"
                valorPrincipal={tareasPendientes}
                descripcionSecundaria="Por comenzar"
                colorAcento="#3b82f6"
                icono="⏳"
              />
              <StatCard
                tituloEstadistica="En progreso"
                valorPrincipal={tareasEnProgreso}
                descripcionSecundaria="Trabajando"
                colorAcento="#f59e0b"
                icono="🔄"
              />
              <StatCard
                tituloEstadistica="Completadas"
                valorPrincipal={tareasCompletadas}
                descripcionSecundaria="Finalizadas"
                colorAcento="#10b981"
                icono="✅"
              />
            </div>

            {/* Kanban + Feed lado a lado en desktop, apilados en mobile */}
            <div className="dashboard-layout__doble-columna">
              <div className="dashboard-layout__kanban-wrap">
                <KanbanBoard
                  tareas={tareasActivas}
                  alCambiarEstado={cambiarEstadoTarea}
                  alActualizarProgreso={actualizarProgreso}
                  alMoverAPapelera={moverAPapelera}
                  alEditarTarea={editarTarea}
                />
              </div>

              <div className="dashboard-layout__feed-wrap">
                <ActivityFeed actividades={actividades} />
              </div>
            </div>

          </div>
        )}

        {/* ---- MIS TAREAS ---- */}
        {seccionActiva === "mis-tareas" && (
          <div className="dashboard-layout__contenido">
            <KanbanBoard
              tareas={tareasActivas}
              alCambiarEstado={cambiarEstadoTarea}
              alActualizarProgreso={actualizarProgreso}
              alMoverAPapelera={moverAPapelera}
              alEditarTarea={editarTarea}
            />
          </div>
        )}

        {/* ---- TICKETS ---- */}
        {seccionActiva === "tickets" && (
          <div className="dashboard-layout__contenido">
            <div className="dashboard-layout__proximamente">
              <span className="dashboard-layout__proximamente-icono">◈</span>
              <h2>Tickets — Próximamente</h2>
              <p>El sistema de tickets está en desarrollo.</p>
            </div>
          </div>
        )}

        {/* ---- PAPELERA ---- */}
        {seccionActiva === "papelera" && (
          <div className="dashboard-layout__contenido">
            <PapeleraPage
              tareasEnPapelera={tareasEnPapelera}
              alRestaurar={restaurarDePapelera}
              alEliminarPermanentemente={eliminarPermanentemente}
              alVaciarPapelera={vaciarPapelera}
            />
          </div>
        )}

        {/* ---- ABOUT ---- */}
        {seccionActiva === "about" && (
          <div className="dashboard-layout__contenido">
            <AboutPage />
          </div>
        )}

      </main>

      {mostrarFormulario && (
        <TaskForm
          alConfirmar={manejarCreacionDeTarea}
          alCancelar={() => setMostrarFormulario(false)}
        />
      )}

      <AlertContainer />

    </div>
  );
}