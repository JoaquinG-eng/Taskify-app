import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Topbar from "../../components/layout/Topbar/Topbar";
import StatCard from "../../components/ui/StatCard/StatCard";
import TaskForm from "../../components/tasks/TaskForm/TaskForm";
import TaskCard from "../../components/tasks/TaskCard/TaskCard";
import KanbanBoard from "../../components/kanban/KanbanBoard/KanbanBoard";
import useTasks from "../../hooks/useTasks";
import "./DashboardPage.css";

function DashboardPage() {
  const {
    tareas,
    crearTarea,
    eliminarTarea,
    cambiarEstado,          // ← nombre correcto del hook
  } = useTasks();

  const tareasCompletadas = tareas.filter(
    (tarea) => tarea.estado === "completada"
  ).length;

  const tareasEnProgreso = tareas.filter(
    (tarea) => tarea.estado === "en-progreso"
  ).length;

  const tareasPendientes = tareas.filter(
    (tarea) => tarea.estado === "pendiente"
  ).length;

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard__content">
        <Topbar />

        <section className="dashboard__body">

          {/* Stats */}
          <section className="dashboard__stats">
            <StatCard
              titulo="Tareas completadas"
              valor={String(tareasCompletadas)}
              descripcion="Tareas finalizadas"
              variante="primary"
            />
            <StatCard
              titulo="En progreso"
              valor={String(tareasEnProgreso)}
              descripcion="Tareas activas"
              variante="warning"
            />
            <StatCard
              titulo="Pendientes"
              valor={String(tareasPendientes)}
              descripcion="Tareas por realizar"
            />
          </section>

          {/* Formulario */}
          <section className="dashboard__section">
            <div className="dashboard__section-header">
              <h2>Crear tarea</h2>
            </div>
            <TaskForm crearTarea={crearTarea} />
          </section>

          {/* Tareas recientes */}
          <section className="dashboard__section">
            <div className="dashboard__section-header">
              <h2>Tareas recientes</h2>
              <button>Ver todas</button>
            </div>

            <div className="dashboard__tasks">
              {tareas.length === 0 ? (
                <div className="dashboard__placeholder">
                  No hay tareas todavía
                </div>
              ) : (
                tareas.map((tarea) => (
                  <TaskCard
                    key={tarea.id}
                    tarea={tarea}
                    eliminarTarea={eliminarTarea}
                    cambiarEstadoTarea={cambiarEstado}  // ← mapeado al nombre correcto
                  />
                ))
              )}
            </div>
          </section>

          {/* Kanban */}
          <section className="dashboard__section">
            <div className="dashboard__section-header">
              <h2>Kanban de tickets</h2>
              <button>Abrir tablero</button>
            </div>
            <KanbanBoard
              tareas={tareas}
              eliminarTarea={eliminarTarea}
              cambiarEstadoTarea={cambiarEstado}  // ← mapeado al nombre correcto
            />
          </section>

        </section>
      </main>
    </div>
  );
}

export default DashboardPage;