// ============================================================
// ARCHIVO: src/pages/dashboard/DashboardPage.tsx
// CAMBIO: integra foto de perfil de Google en Topbar y Sidebar
// ============================================================

import { useState } from "react";
import type { Tarea, TareaNueva } from "../../types/task";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import { useTickets } from "../../hooks/useTickets";
import { useAlert } from "../../hooks/useAlert";
import { useDashboardFilters } from "../../hooks/useDashboardFilters";
import { useDashboardTopbar } from "../../hooks/useDashboardTopbar";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useDashboardSessionActions } from "../../hooks/useDashboardSessionActions";
import { useDashboardTaskActions } from "../../hooks/useDashboardTaskActions";
import { construirNotificacionesDashboard } from "../../utils/dashboardNotifications";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Topbar from "../../components/layout/Topbar/Topbar";
import TaskForm from "../../components/tasks/TaskForm/TaskForm";
import DashboardHome from "../../components/dashboard/DashboardHome";
import DashboardTasks from "../../components/dashboard/DashboardTasks";
import DashboardCalendar from "../../components/dashboard/DashboardCalendar";
import DashboardTickets from "../../components/dashboard/DashboardTickets";
import AlertContainer from "../../components/ui/Alert/Alert";
import PapeleraPage from "../papelera/PapeleraPage";
import AboutPage from "../about/AboutPage";

import "./DashboardPage.css";

type SeccionActiva =
  | "dashboard"
  | "mis-tareas"
  | "calendario"
  | "tickets"
  | "papelera"
  | "about";

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
    agregarComentario,
    moverAPapelera,
    restaurarDePapelera,
    eliminarPermanentemente,
    vaciarPapelera,
  } = useTasks(userId);

  const {
    tickets,
    cargandoTickets,
    errorTickets,
    crearTicket,
    editarTicket,
    cambiarEstadoTicket,
  } = useTickets(userId);

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
  const [fechaInicialNuevaTarea, setFechaInicialNuevaTarea] = useState<string>();
  const [horaInicialNuevaTarea, setHoraInicialNuevaTarea] = useState<string>();
  const [horaFinInicialNuevaTarea, setHoraFinInicialNuevaTarea] = useState<string>();
  const [tareaEnEdicion, setTareaEnEdicion] = useState<Tarea | null>(null);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [textoBusquedaTickets, setTextoBusquedaTickets] = useState("");

  const ticketsActivos = tickets.filter(
    (ticket) => ticket.estado !== "cerrado"
  ).length;

  const ticketsAltaPrioridadActivos = tickets.filter(
    (ticket) =>
      ticket.estado !== "cerrado" && ticket.prioridad === "alta"
  ).length;

  const notificacionesDashboard = construirNotificacionesDashboard(
    tareasActivas,
    tickets
  );

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
    cargandoTickets,
    tareasPendientes,
    ticketsActivos,
    ticketsTotal: tickets.length,
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

  function abrirNuevaTarea(
    fechaInicial?: string,
    horaInicial?: string,
    horaFinInicial?: string
  ) {
    setTareaEnEdicion(null);
    setFechaInicialNuevaTarea(fechaInicial);
    setHoraInicialNuevaTarea(horaInicial);
    setHoraFinInicialNuevaTarea(horaFinInicial);
    setMostrarFormulario(true);
  }

  function abrirEdicionUnica(tarea: Tarea) {
    setMostrarFormulario(false);
    setFechaInicialNuevaTarea(undefined);
    setHoraInicialNuevaTarea(undefined);
    setHoraFinInicialNuevaTarea(undefined);
    setTareaEnEdicion(tarea);
  }

  function cancelarNuevaTarea() {
    setMostrarFormulario(false);
    setFechaInicialNuevaTarea(undefined);
    setHoraInicialNuevaTarea(undefined);
    setHoraFinInicialNuevaTarea(undefined);
  }

  async function confirmarNuevaTarea(datos: TareaNueva) {
    await manejarCreacion(datos);
    setFechaInicialNuevaTarea(undefined);
    setHoraInicialNuevaTarea(undefined);
    setHoraFinInicialNuevaTarea(undefined);
  }

  async function confirmarEdicionCalendario(datos: TareaNueva) {
    if (!tareaEnEdicion) return;

    await manejarEdicion(tareaEnEdicion.id, datos);
    setTareaEnEdicion(null);
  }

  /*
   * La tarea guardada en estado abre el editor.
   * Mientras el modal sigue abierto, usamos la versión viva de useTasks
   * para que los comentarios optimistas/sincronizados se reflejen sin
   * abrir otro modal ni crear otra suscripción.
   */
  const tareaEnEdicionActual = tareaEnEdicion
    ? tareasActivas.find((tarea) => tarea.id === tareaEnEdicion.id) ??
      tareaEnEdicion
    : null;

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
          valorBusqueda={
            seccionActiva === "tickets"
              ? textoBusquedaTickets
              : filtros.textoDeBusqueda
          }
          etiquetaBusqueda={
            seccionActiva === "tickets" ? "Buscar tickets" : "Buscar tareas"
          }
          placeholderBusqueda={
            seccionActiva === "tickets"
              ? "Buscar tickets..."
              : "Buscar tareas..."
          }
          alCambiarBusqueda={(valor) => {
            if (seccionActiva === "tickets") {
              setTextoBusquedaTickets(valor);
              return;
            }

            actualizarFiltro("textoDeBusqueda", valor);

            if (valor.trim()) {
              setSeccionActiva("mis-tareas");
            }
          }}
          notificaciones={notificacionesDashboard}
          alSeleccionarNotificacion={(notificacion) => {
            if (notificacion.recurso === "ticket") {
              const ticket = tickets.find(
                (elemento) => elemento.id === notificacion.recursoId
              );

              setTextoBusquedaTickets(ticket?.titulo ?? "");
              setSeccionActiva("tickets");
              return;
            }

            const tarea = tareasActivas.find(
              (elemento) => elemento.id === notificacion.recursoId
            );

            if (tarea) {
              abrirEdicionUnica(tarea);
            }
          }}
          botonPrimario={
            mostrarBotonNueva
              ? {
                  etiqueta: "Nueva tarea",
                  alHacerClick: () => abrirNuevaTarea(),
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
            totalTickets={tickets.length}
            ticketsActivos={ticketsActivos}
            ticketsAltaPrioridadActivos={ticketsAltaPrioridadActivos}
            cargandoTickets={cargandoTickets}
            errorTickets={errorTickets}
            alAbrirTickets={() => {
              setTextoBusquedaTickets("");
              setSeccionActiva("tickets");
            }}
            tareas={tareasActivas}
            actividades={actividades}
            alCambiarEstado={manejarCambioEstado}
            alActualizarProgreso={actualizarProgreso}
            alMoverAPapelera={manejarMoverPapelera}
            alEditarTarea={abrirEdicionUnica}
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
            alEditarTarea={abrirEdicionUnica}
          />
        )}

        {seccionActiva === "calendario" && (
          <DashboardCalendar
            tareas={tareasActivas}
            alCrearEnFecha={abrirNuevaTarea}
            alEditarTarea={abrirEdicionUnica}
          />
        )}

        {seccionActiva === "tickets" && (
          <DashboardTickets
            tickets={tickets}
            cargandoTickets={cargandoTickets}
            errorTickets={errorTickets}
            crearTicket={crearTicket}
            editarTicket={editarTicket}
            cambiarEstadoTicket={cambiarEstadoTicket}
            textoBusqueda={textoBusquedaTickets}
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

      {tareaEnEdicionActual ? (
        <TaskForm
          datosIniciales={tareaEnEdicionActual}
          tareaId={tareaEnEdicionActual.id}
          alConfirmar={confirmarEdicionCalendario}
          alCancelar={() => setTareaEnEdicion(null)}
          alAgregarComentario={(texto) =>
            agregarComentario(
              tareaEnEdicionActual.id,
              texto,
              nombreUsuario
            )
          }
        />
      ) : mostrarFormulario ? (
        <TaskForm
          fechaInicial={fechaInicialNuevaTarea}
          horaInicial={horaInicialNuevaTarea}
          horaFinInicial={horaFinInicialNuevaTarea}
          alConfirmar={confirmarNuevaTarea}
          alCancelar={cancelarNuevaTarea}
        />
      ) : null}

      <AlertContainer />
    </div>
  );
}
