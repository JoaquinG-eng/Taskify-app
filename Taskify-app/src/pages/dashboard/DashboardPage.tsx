// ============================================================
// ARCHIVO: src/pages/dashboard/DashboardPage.tsx
// CAMBIO: integra foto de perfil de Google en Topbar y Sidebar
// ============================================================

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import { useAlert } from "../../hooks/useAlert";
import { useDashboardFilters } from "../../hooks/useDashboardFilters";
import { useDashboardTopbar } from "../../hooks/useDashboardTopbar";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useDashboardSessionActions } from "../../hooks/useDashboardSessionActions";
import { useDashboardTaskActions } from "../../hooks/useDashboardTaskActions";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Topbar from "../../components/layout/Topbar/Topbar";
import TaskForm from "../../components/tasks/TaskForm/TaskForm";
import DashboardHome from "../../components/dashboard/DashboardHome";
import DashboardTasks from "../../components/dashboard/DashboardTasks";
import DashboardComingSoon from "../../components/dashboard/DashboardComingSoon";
import AlertContainer from "../../components/ui/Alert/Alert";
import PapeleraPage from "../papelera/PapeleraPage";
import AboutPage from "../about/AboutPage";

import "./DashboardPage.css";

type SeccionActiva = "dashboard" | "mis-tareas" | "tickets" | "papelera" | "about";

export default function DashboardPage() {
  const { usuario } = useAuth();

  const userId = usuario?.uid ?? "";
  const nombreUsuario = usuario?.displayName ?? usuario?.email ?? "Usuario";
  const emailUsuario = usuario?.email ?? "";
  const fotoUsuario = usuario?.photoURL ?? null;

  const { alertaExito, alertaInfo, alertaAdvertencia, alertaError } = useAlert();

  const {
    tareasActivas,
    tareasEnPapelera,
    cargando,
    actividades,
    crearTarea,
    editarTarea,
    cambiarEstadoTarea,
    actualizarProgreso,
    moverAPapelera,
    restaurarDePapelera,
    eliminarPermanentemente,
    vaciarPapelera,
  } = useTasks(userId);

  const {
    filtros,
    tareasFiltradas,
    hayFiltrosActivos,
    actualizarFiltro,
    limpiarFiltros,
  } = useDashboardFilters(tareasActivas);

  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>("dashboard");
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  const {
    totalTareas,
    tareasCompletadas,
    tareasEnProgreso,
    tareasPendientes,
  } = useDashboardStats(tareasActivas);

  const {
    tituloSeccion,
    subtituloSeccion,
    mostrarBotonNueva,
    mostrarBotonEmail,
  } = useDashboardTopbar({
    seccionActiva,
    nombreUsuario,
    cargando,
    tareasPendientes,
    tareasFiltradasCantidad: tareasFiltradas.length,
    tareasEnPapeleraCantidad: tareasEnPapelera.length,
    hayFiltrosActivos,
  });

  const {
    manejarLogout,
    manejarEnviarEmail,
  } = useDashboardSessionActions({
    emailUsuario,
    nombreUsuario,
    tareasActivas,
    tareasEnPapelera,
    setEnviandoEmail,
  });
 const {
  manejarCreacion,
  manejarEdicion,
  manejarCambioEstado,
  manejarMoverPapelera,
  manejarRestaurar,
  manejarEliminarPermanente,
  manejarVaciar,
} = useDashboardTaskActions({
  tareasActivas,
  crearTarea,
  editarTarea,
  cambiarEstadoTarea,
  moverAPapelera,
  restaurarDePapelera,
  eliminarPermanentemente,
  vaciarPapelera,
  setMostrarFormulario,
  alertaExito,
  alertaInfo,
  alertaAdvertencia,
  alertaError,
});
  return (
    <div className="dashboard-layout">
      <Sidebar
        seccionActiva={seccionActiva}
        alCambiarSeccion={(s) => setSeccionActiva(s as SeccionActiva)}
        cantidadEnPapelera={tareasEnPapelera.length}
        estaAbierto={sidebarAbierto}
        alCerrar={() => setSidebarAbierto(false)}
        nombreUsuario={nombreUsuario}
        fotoUsuario={fotoUsuario}
        alLogout={manejarLogout}
      />

      <main className="dashboard-layout__main">
        <Topbar
          tituloSeccion={tituloSeccion}
          subtituloSeccion={subtituloSeccion}
          alAbrirSidebar={() => setSidebarAbierto(true)}
          nombreDelUsuario={nombreUsuario}
          fotoDelUsuario={fotoUsuario}
          botonPrimario={
            mostrarBotonNueva
              ? {
                  etiqueta: "Nueva tarea",
                  alHacerClick: () => setMostrarFormulario(true),
                }
              : undefined
          }
          alEnviarEmail={mostrarBotonEmail ? manejarEnviarEmail : undefined}
          enviandoEmail={enviandoEmail}
        />

        {seccionActiva === "dashboard" && (
          <DashboardHome
            totalTareas={totalTareas}
            tareasPendientes={tareasPendientes}
            tareasEnProgreso={tareasEnProgreso}
            tareasCompletadas={tareasCompletadas}
            tareas={tareasActivas}
            actividades={actividades}
            alCambiarEstado={manejarCambioEstado}
            alActualizarProgreso={actualizarProgreso}
            alMoverAPapelera={manejarMoverPapelera}
            alEditarTarea={manejarEdicion}
          />
        )}

        {seccionActiva === "mis-tareas" && (
          <DashboardTasks
            tareas={tareasFiltradas}
            filtros={filtros}
            hayFiltrosActivos={hayFiltrosActivos}
            actualizarFiltro={actualizarFiltro}
            limpiarFiltros={limpiarFiltros}
            alCambiarEstado={manejarCambioEstado}
            alActualizarProgreso={actualizarProgreso}
            alMoverAPapelera={manejarMoverPapelera}
            alEditarTarea={manejarEdicion}
          />
        )}

        {seccionActiva === "tickets" && (
          <DashboardComingSoon
            titulo="Tickets — Próximamente"
            descripcion="El sistema de tickets está en desarrollo."
          />
        )}

        {seccionActiva === "papelera" && (
          <div className="dashboard-layout__contenido">
            <PapeleraPage
              tareasEnPapelera={tareasEnPapelera}
              alRestaurar={manejarRestaurar}
              alEliminarPermanentemente={manejarEliminarPermanente}
              alVaciarPapelera={manejarVaciar}
            />
          </div>
        )}

        {seccionActiva === "about" && (
          <div className="dashboard-layout__contenido">
            <AboutPage />
          </div>
        )}
      </main>

      {mostrarFormulario && (
        <TaskForm
          alConfirmar={manejarCreacion}
          alCancelar={() => setMostrarFormulario(false)}
        />
      )}

      <AlertContainer />
    </div>
  );
}