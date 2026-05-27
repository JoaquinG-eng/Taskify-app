import TaskCard from "../../tasks/TaskCard/TaskCard";

import type {
  EstadoTarea,
  Tarea,
} from "../../../types/task";

import "./KanbanBoard.css";

type KanbanBoardProps = {
  tareas: Tarea[];

  eliminarTarea: (
    id: string,
  ) => void;

  cambiarEstadoTarea: (
    id: string,
    estado: EstadoTarea,
  ) => void;
};

function KanbanBoard({
  tareas,
  eliminarTarea,
  cambiarEstadoTarea,
}: KanbanBoardProps) {
  // ============================================================
  // Columnas
  // ============================================================

  const columnas: {
    titulo: string;

    estado: EstadoTarea;
  }[] = [
    {
      titulo: "To Do",

      estado: "pendiente",
    },

    {
      titulo: "In Progress",

      estado: "en-progreso",
    },

    {
      titulo: "Done",

      estado: "completada",
    },
  ];

  return (
    <div className="kanban-board">
      {columnas.map((columna) => {
        const tareasFiltradas =
          tareas.filter(
            (tarea) =>
              tarea.estado ===
              columna.estado,
          );

        return (
          <div
            key={columna.estado}
            className="kanban-column"
          >
            {/* ======================================================== */}
            {/* Header */}
            {/* ======================================================== */}

            <div className="kanban-column__header">
              <h3>{columna.titulo}</h3>

              <span>
                {
                  tareasFiltradas.length
                }
              </span>
            </div>

            {/* ======================================================== */}
            {/* Tasks */}
            {/* ======================================================== */}

            <div className="kanban-column__tasks">
              {tareasFiltradas.length ===
              0 ? (
                <div className="kanban-column__empty">
                  Sin tareas
                </div>
              ) : (
                tareasFiltradas.map(
                  (tarea) => (
                    <TaskCard
                      key={tarea.id}
                      tarea={tarea}
                      eliminarTarea={
                        eliminarTarea
                      }
                      cambiarEstadoTarea={
                        cambiarEstadoTarea
                      }
                    />
                  ),
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;