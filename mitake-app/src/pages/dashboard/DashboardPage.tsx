// ============================================================
// ARCHIVO: src/pages/dashboard/DashboardPage.tsx
// ¿Para qué sirve? Página principal con:
// - Sidebar con navegación entre secciones
// - Topbar con título dinámico y acciones
// - Vista Dashboard con estadísticas y Kanban
// - Vista Mis Tareas (lista filtrada)
// - Vista Papelera
// - Vista About
// - Formulario modal para crear tareas
// ============================================================

import { useState } from "react";

import { useTasks } from "../../hooks/useTasks";

import type { TareaNueva } from "../../types/task";

import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Topbar from "../../components/layout/Topbar/Topbar";
import TaskForm from "../../components/tasks/TaskForm/TaskForm";
import KanbanBoard from "../../components/kanban/KanbanBoard/KanbanBoard";
import StatCard from "../../components/ui/StatCard/StatCard";
import AlertContainer from "../../components/ui/Alert/Alert";
import PapeleraPage from "../papelera/PapeleraPage";
import AboutPage from "../about/AboutPage";

import "./DashboardPage.css";

// ------------------------------------------------------------
// TIPO: sección activa de la app
// ------------------------------------------------------------
type SeccionActiva = "dashboard" | "mis-tareas" | "tickets" | "papelera" | "about";

// ------------------------------------------------------------
// COMPONENTE: DashboardPage
// ------------------------------------------------------------
export default function DashboardPage() {
  // --------------------------------------------------------
  // HOOK: useTasks — lógica de tareas con localStorage
  // --------------------------------------------------------
  const {
    tareasActivas,
    tareasEnPapelera,
    crearTarea,
    cambiarEstadoTarea,
    actualizarProgreso,
    moverAPapelera,
    restaurarDePapelera,
    eliminarPermanentemente,
    vaciarPapelera,
  } = useTasks();

  // --------------------------------------------------------
  // ESTADO: navegación y UI
  // --------------------------------------------------------
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionActiva>("dashboard");
  const [sidebarAbierto, setSidebarAbierto] =
    useState<boolean>(false);
  const [mostrarFormulario, setMostrarFormulario] =
    useState<boolean>(false);

  // --------------------------------------------------------
  // FUNCIÓN: manejarCreacionDeTarea
  // Crea la tarea y cierra el formulario.
  // --------------------------------------------------------
  function manejarCreacionDeTarea(datos: TareaNueva): void {
    crearTarea(datos);
    setMostrarFormulario(false);
  }

  // --------------------------------------------------------
  // ESTADÍSTICAS calculadas en tiempo real
  // --------------------------------------------------------
  const totalTareas = tareasActivas.length;
  const tareasCompletadas = tareasActivas.filter(
    (tarea) => tarea.estado === "completada"
  ).length;
  const tareasEnProgreso = tareasActivas.filter(
    (tarea) => tarea.estado === "en-progreso"
  ).length;
  const tareasPendientes = tareasActivas.filter(
    (tarea) => tarea.estado === "pendiente"
  ).length;

  // --------------------------------------------------------
  // CONFIGURACIÓN dinámica de la Topbar según la sección
  // --------------------------------------------------------
  const configuracionTopbar: Record<
    SeccionActiva,
    { titulo: string; subtitulo: string }
  > = {
    dashboard: {
      titulo: "Dashboard",
      subtitulo: `${totalTareas} tarea${totalTareas !== 1 ? "s" : ""} en total`,
    },
    "mis-tareas": {
      titulo: "Mis tareas",
      subtitulo: `${tareasPendientes} pendiente${tareasPendientes !== 1 ? "s" : ""}`,
    },
    tickets: {
      titulo: "Tickets",
      subtitulo: "Próximamente",
    },
    papelera: {
      titulo: "Papelera",
      subtitulo: `${tareasEnPapelera.length} elemento${tareasEnPapelera.length !== 1 ? "s" : ""}`,
    },
    about: {
      titulo: "Sobre Mitake",
      subtitulo: "Información del proyecto",
    },
  };

  const topbarActual = configuracionTopbar[seccionActiva];

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div className="dashboard-layout">

      {/* ============================================
          SIDEBAR — navegación lateral
          ============================================ */}
      <Sidebar
        seccionActiva={seccionActiva}
        alCambiarSeccion={(seccion) =>
          setSeccionActiva(seccion as SeccionActiva)
        }
        cantidadEnPapelera={tareasEnPapelera.length}
        estaAbierto={sidebarAbierto}
        alCerrar={() => setSidebarAbierto(false)}
      />

      {/* ============================================
          CONTENIDO PRINCIPAL
          ============================================ */}
      <main className="dashboard-layout__main">

        {/* Topbar con título dinámico */}
        <Topbar
          tituloSeccion={topbarActual.titulo}
          subtituloSeccion={topbarActual.subtitulo}
          alAbrirSidebar={() => setSidebarAbierto(true)}
          botonPrimario={
            seccionActiva === "dashboard" || seccionActiva === "mis-tareas"
              ? {
                  etiqueta: "Nueva tarea",
                  alHacerClick: () => setMostrarFormulario(true),
                }
              : undefined
          }
        />

        {/* ---- SECCIÓN: Dashboard ---- */}
        {seccionActiva === "dashboard" && (
          <div className="dashboard-layout__contenido">

            {/* Estadísticas */}
            <div className="dashboard-layout__estadisticas">
              <StatCard
                tituloEstadistica="Total"
                valorPrincipal={totalTareas}
                descripcionSecundaria="Tareas creadas"
                colorDeFondo="linear-gradient(135deg, #6366f1, #8b5cf6)"
                icono="📋"
              />
              <StatCard
                tituloEstadistica="Pendientes"
                valorPrincipal={tareasPendientes}
                descripcionSecundaria="Por comenzar"
                colorDeFondo="linear-gradient(135deg, #f59e0b, #f97316)"
                icono="⏳"
              />
              <StatCard
                tituloEstadistica="En progreso"
                valorPrincipal={tareasEnProgreso}
                descripcionSecundaria="Trabajando"
                colorDeFondo="linear-gradient(135deg, #3b82f6, #06b6d4)"
                icono="🔄"
              />
              <StatCard
                tituloEstadistica="Completadas"
                valorPrincipal={tareasCompletadas}
                descripcionSecundaria="Finalizadas"
                colorDeFondo="linear-gradient(135deg, #10b981, #34d399)"
                icono="✅"
              />
            </div>

            {/* Tablero Kanban */}
            <KanbanBoard
              tareas={tareasActivas}
              alCambiarEstado={cambiarEstadoTarea}
              alActualizarProgreso={actualizarProgreso}
              alMoverAPapelera={moverAPapelera}
            />
          </div>
        )}

        {/* ---- SECCIÓN: Mis tareas (reutilizamos Kanban) ---- */}
        {seccionActiva === "mis-tareas" && (
          <div className="dashboard-layout__contenido">
            <KanbanBoard
              tareas={tareasActivas}
              alCambiarEstado={cambiarEstadoTarea}
              alActualizarProgreso={actualizarProgreso}
              alMoverAPapelera={moverAPapelera}
            />
          </div>
        )}

        {/* ---- SECCIÓN: Tickets (próximamente) ---- */}
        {seccionActiva === "tickets" && (
          <div className="dashboard-layout__contenido">
            <div className="dashboard-layout__proximamente">
              <span className="dashboard-layout__proximamente-icono">◈</span>
              <h2>Tickets — Próximamente</h2>
              <p>
                El sistema de tickets está en desarrollo. Pronto podrás
                gestionar tickets con prioridades y asignaciones.
              </p>
            </div>
          </div>
        )}

        {/* ---- SECCIÓN: Papelera ---- */}
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

        {/* ---- SECCIÓN: About ---- */}
        {seccionActiva === "about" && (
          <div className="dashboard-layout__contenido">
            <AboutPage />
          </div>
        )}

      </main>

      {/* ============================================
          MODAL: Formulario de nueva tarea
          ============================================ */}
      {mostrarFormulario && (
        <TaskForm
          alConfirmar={manejarCreacionDeTarea}
          alCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {/* ============================================
          ALERTAS GLOBALES
          ============================================ */}
      <AlertContainer />

    </div>
  );
}