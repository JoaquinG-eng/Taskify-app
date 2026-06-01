// ============================================================
// ARCHIVO: src/pages/dashboard/DashboardPage.tsx
// CAMBIO: integra envío de email con AWS SES vía serverless
// ============================================================

import { useState } from "react";

import { useAuth }           from "../../hooks/useAuth";
import { useTasks }          from "../../hooks/useTasks";
import { useAlert }          from "../../hooks/useAlert";
import { cerrarSesion }      from "../../services/authService";
import { enviarResumenDeTareas } from "../../services/emailService";
import { swalConfirmar, swalExito, swalError } from "../../utils/sweetAlerts";

import type { TareaNueva, EstadoTarea, FiltrosDeBusqueda } from "../../types/task";
import { FILTROS_VACIOS } from "../../types/task";

import Sidebar        from "../../components/layout/Sidebar/Sidebar";
import Topbar         from "../../components/layout/Topbar/Topbar";
import TaskForm       from "../../components/tasks/TaskForm/TaskForm";
import KanbanBoard    from "../../components/kanban/KanbanBoard/KanbanBoard";
import StatCard       from "../../components/ui/StatCard/StatCard";
import ActivityFeed   from "../../components/ui/ActivityFeed/ActivityFeed";
import AlertContainer from "../../components/ui/Alert/Alert";
import PapeleraPage   from "../papelera/PapeleraPage";
import AboutPage      from "../about/AboutPage";

import "./DashboardPage.css";

type SeccionActiva = "dashboard" | "mis-tareas" | "tickets" | "papelera" | "about";

export default function DashboardPage() {
  const { usuario }       = useAuth();
  const userId            = usuario?.uid ?? "";
  const nombreUsuario     = usuario?.displayName ?? usuario?.email ?? "Usuario";
  const emailUsuario      = usuario?.email ?? "";

  const { alertaExito, alertaInfo, alertaAdvertencia, alertaError } = useAlert();
  const {
    tareasActivas, tareasEnPapelera, cargando, actividades,
    crearTarea, editarTarea, cambiarEstadoTarea, actualizarProgreso,
    moverAPapelera, restaurarDePapelera, eliminarPermanentemente, vaciarPapelera,
  } = useTasks(userId);

  const [seccionActiva,     setSeccionActiva]     = useState<SeccionActiva>("dashboard");
  const [sidebarAbierto,    setSidebarAbierto]    = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtros,           setFiltros]           = useState<FiltrosDeBusqueda>(FILTROS_VACIOS);
  const [enviandoEmail,     setEnviandoEmail]     = useState(false);

  // ---- Logout ----
  async function manejarLogout() {
    const ok = await swalConfirmar("¿Cerrar sesión?", "Vas a salir de tu cuenta de Mitake.", "Sí, salir");
    if (!ok) return;
    await cerrarSesion();
  }

  // ---- Enviar resumen por email ----
  async function manejarEnviarEmail() {
    if (!emailUsuario) {
      await swalError("Sin email", "No se encontró un email asociado a tu cuenta.");
      return;
    }

    const ok = await swalConfirmar(
      "¿Enviar resumen?",
      `Se enviará un resumen de tus ${tareasActivas.length} tarea${tareasActivas.length !== 1 ? "s" : ""} a ${emailUsuario}`,
      "Sí, enviar"
    );
    if (!ok) return;

    setEnviandoEmail(true);
    try {
      await enviarResumenDeTareas(emailUsuario, nombreUsuario, [...tareasActivas, ...tareasEnPapelera]);
      await swalExito("¡Email enviado!", `Revisá tu bandeja en ${emailUsuario}`);
    } catch (error: unknown) {
      await swalError("Error al enviar", (error as Error).message);
    } finally {
      setEnviandoEmail(false);
    }
  }

  // ---- Filtros ----
  function actualizarFiltro<K extends keyof FiltrosDeBusqueda>(campo: K, valor: FiltrosDeBusqueda[K]) {
    setFiltros((ant) => ({ ...ant, [campo]: valor }));
  }
  function limpiarFiltros() { setFiltros(FILTROS_VACIOS); }

  const hayFiltrosActivos =
    filtros.textoDeBusqueda !== "" ||
    filtros.estadoFiltrado  !== "todas" ||
    filtros.asignadoA       !== "";

  const tareasFiltradas = tareasActivas.filter((tarea) => {
    const texto = filtros.textoDeBusqueda.toLowerCase();
    const coincideTexto =
      texto === "" ||
      tarea.titulo.toLowerCase().includes(texto) ||
      (tarea.descripcion ?? "").toLowerCase().includes(texto) ||
      (tarea.creadoPor   ?? "").toLowerCase().includes(texto) ||
      (tarea.asignadoA   ?? "").toLowerCase().includes(texto);
    const coincideEstado   = filtros.estadoFiltrado === "todas" || tarea.estado === filtros.estadoFiltrado;
    const coincideAsignado = filtros.asignadoA === "" || (tarea.asignadoA ?? "").toLowerCase().includes(filtros.asignadoA.toLowerCase());
    return coincideTexto && coincideEstado && coincideAsignado;
  });

  // ---- Handlers CRUD ----
  async function manejarCreacion(datos: TareaNueva) {
    await crearTarea(datos);
    alertaExito(`"${datos.titulo}" fue agregada.`, "Tarea creada");
    setMostrarFormulario(false);
  }

  async function manejarEdicion(id: string, datos: TareaNueva) {
    await editarTarea(id, datos);
    alertaExito("Los cambios fueron guardados.", "Tarea editada");
  }

  async function manejarCambioEstado(id: string, nuevoEstado: EstadoTarea) {
    await cambiarEstadoTarea(id, nuevoEstado);
    if (nuevoEstado === "completada") alertaExito("¡Tarea completada!", "Completada");
    else alertaInfo("Estado actualizado.", "Actualizado");
  }

  async function manejarMoverPapelera(id: string) {
    const tarea = tareasActivas.find((t) => t.id === id);
    await moverAPapelera(id);
    alertaAdvertencia(`"${tarea?.titulo ?? "Tarea"}" movida a la papelera.`, "Eliminada");
  }

  async function manejarRestaurar(id: string) {
    await restaurarDePapelera(id);
    alertaExito("Tarea restaurada.", "Restaurada");
  }

  async function manejarEliminarPermanente(id: string) {
    await eliminarPermanentemente(id);
    alertaError("Tarea eliminada definitivamente.", "Eliminada");
  }

  async function manejarVaciar() {
    await vaciarPapelera();
    alertaError("Papelera vaciada.", "Vaciada");
  }

  // ---- Estadísticas ----
  const totalTareas       = tareasActivas.length;
  const tareasCompletadas = tareasActivas.filter((t) => t.estado === "completada").length;
  const tareasEnProgreso  = tareasActivas.filter((t) => t.estado === "en-progreso").length;
  const tareasPendientes  = tareasActivas.filter((t) => t.estado === "pendiente").length;

  const configTopbar: Record<SeccionActiva, { titulo: string; subtitulo: string }> = {
    dashboard:    { titulo: "Dashboard",    subtitulo: cargando ? "Cargando..." : `${totalTareas} tarea${totalTareas !== 1 ? "s" : ""} en total` },
    "mis-tareas": { titulo: "Mis tareas",   subtitulo: hayFiltrosActivos ? `${tareasFiltradas.length} resultado${tareasFiltradas.length !== 1 ? "s" : ""}` : `${tareasPendientes} pendiente${tareasPendientes !== 1 ? "s" : ""}` },
    tickets:      { titulo: "Tickets",      subtitulo: "Próximamente" },
    papelera:     { titulo: "Papelera",     subtitulo: `${tareasEnPapelera.length} elemento${tareasEnPapelera.length !== 1 ? "s" : ""}` },
    about:        { titulo: "Sobre Mitake", subtitulo: "Información del proyecto" },
  };

  const mostrarBotonNueva = seccionActiva === "dashboard" || seccionActiva === "mis-tareas";
  const mostrarBotonEmail = seccionActiva === "dashboard" || seccionActiva === "mis-tareas";

  return (
    <div className="dashboard-layout">

      <Sidebar
        seccionActiva={seccionActiva}
        alCambiarSeccion={(s) => setSeccionActiva(s as SeccionActiva)}
        cantidadEnPapelera={tareasEnPapelera.length}
        estaAbierto={sidebarAbierto}
        alCerrar={() => setSidebarAbierto(false)}
        nombreUsuario={nombreUsuario}
        alLogout={manejarLogout}
      />

      <main className="dashboard-layout__main">
        <Topbar
          tituloSeccion={configTopbar[seccionActiva].titulo}
          subtituloSeccion={configTopbar[seccionActiva].subtitulo}
          alAbrirSidebar={() => setSidebarAbierto(true)}
          nombreDelUsuario={nombreUsuario}
          botonPrimario={mostrarBotonNueva ? { etiqueta: "Nueva tarea", alHacerClick: () => setMostrarFormulario(true) } : undefined}
          alEnviarEmail={mostrarBotonEmail ? manejarEnviarEmail : undefined}
          enviandoEmail={enviandoEmail}
        />

        {/* DASHBOARD */}
        {seccionActiva === "dashboard" && (
          <div className="dashboard-layout__contenido">
            <div className="dashboard-layout__estadisticas">
              <StatCard tituloEstadistica="Total"       valorPrincipal={totalTareas}       descripcionSecundaria="Tareas creadas"  colorAcento="#8b5cf6" icono="📋" />
              <StatCard tituloEstadistica="Pendientes"  valorPrincipal={tareasPendientes}  descripcionSecundaria="Por comenzar"    colorAcento="#3b82f6" icono="⏳" />
              <StatCard tituloEstadistica="En progreso" valorPrincipal={tareasEnProgreso}  descripcionSecundaria="Trabajando"      colorAcento="#f59e0b" icono="🔄" />
              <StatCard tituloEstadistica="Completadas" valorPrincipal={tareasCompletadas} descripcionSecundaria="Finalizadas"     colorAcento="#10b981" icono="✅" />
            </div>
            <div className="dashboard-layout__doble-columna">
              <div className="dashboard-layout__kanban-wrap">
                <KanbanBoard tareas={tareasActivas} alCambiarEstado={manejarCambioEstado} alActualizarProgreso={actualizarProgreso} alMoverAPapelera={manejarMoverPapelera} alEditarTarea={manejarEdicion} />
              </div>
              <div className="dashboard-layout__feed-wrap">
                <ActivityFeed actividades={actividades} />
              </div>
            </div>
          </div>
        )}

        {/* MIS TAREAS */}
        {seccionActiva === "mis-tareas" && (
          <div className="dashboard-layout__contenido">
            <div className="filtros-barra">
              <div className="filtros-barra__campo filtros-barra__campo--busqueda">
                <span className="filtros-barra__campo-icono">⌕</span>
                <input type="text" placeholder="Buscar por título, descripción o persona..." value={filtros.textoDeBusqueda} onChange={(e) => actualizarFiltro("textoDeBusqueda", e.target.value)} className="filtros-barra__input" />
                {filtros.textoDeBusqueda && <button className="filtros-barra__limpiar-input" onClick={() => actualizarFiltro("textoDeBusqueda", "")}>✕</button>}
              </div>
              <div className="filtros-barra__campo">
                <span className="filtros-barra__campo-icono">→</span>
                <input type="text" placeholder="Asignado a..." value={filtros.asignadoA} onChange={(e) => actualizarFiltro("asignadoA", e.target.value)} className="filtros-barra__input" />
              </div>
              <div className="filtros-barra__botones">
                {(["todas", "pendiente", "en-progreso", "completada"] as const).map((op) => (
                  <button key={op} className={filtros.estadoFiltrado === op ? "activo" : ""} onClick={() => actualizarFiltro("estadoFiltrado", op)}>
                    {op === "todas" ? "Todas" : op === "pendiente" ? "Pendientes" : op === "en-progreso" ? "En progreso" : "Completadas"}
                  </button>
                ))}
              </div>
              {hayFiltrosActivos && <button className="filtros-barra__limpiar-todo" onClick={limpiarFiltros}>Limpiar filtros</button>}
            </div>
            {hayFiltrosActivos && (
              <p className="filtros-barra__resultado">
                {tareasFiltradas.length === 0 ? "Ninguna tarea coincide." : `${tareasFiltradas.length} tarea${tareasFiltradas.length !== 1 ? "s" : ""} encontrada${tareasFiltradas.length !== 1 ? "s" : ""}`}
              </p>
            )}
            <KanbanBoard tareas={tareasFiltradas} alCambiarEstado={manejarCambioEstado} alActualizarProgreso={actualizarProgreso} alMoverAPapelera={manejarMoverPapelera} alEditarTarea={manejarEdicion} />
          </div>
        )}

        {seccionActiva === "tickets" && (
          <div className="dashboard-layout__contenido">
            <div className="dashboard-layout__proximamente">
              <span className="dashboard-layout__proximamente-icono">◈</span>
              <h2>Tickets — Próximamente</h2>
              <p>El sistema de tickets está en desarrollo.</p>
            </div>
          </div>
        )}

        {seccionActiva === "papelera" && (
          <div className="dashboard-layout__contenido">
            <PapeleraPage tareasEnPapelera={tareasEnPapelera} alRestaurar={manejarRestaurar} alEliminarPermanentemente={manejarEliminarPermanente} alVaciarPapelera={manejarVaciar} />
          </div>
        )}

        {seccionActiva === "about" && (
          <div className="dashboard-layout__contenido">
            <AboutPage />
          </div>
        )}
      </main>

      {mostrarFormulario && (
        <TaskForm alConfirmar={manejarCreacion} alCancelar={() => setMostrarFormulario(false)} />
      )}

      <AlertContainer />
    </div>
  );
}