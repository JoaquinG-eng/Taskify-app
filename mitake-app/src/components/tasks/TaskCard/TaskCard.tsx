import type {
  EstadoTarea,
  Tarea,
} from "../../../types/task";

import "./TaskCard.css";

type TaskCardProps = {
  tarea: Tarea;

  eliminarTarea: (
    id: string,
  ) => void;

  cambiarEstadoTarea: (
    id: string,
    estado: EstadoTarea,
  ) => void;
};

function TaskCard({
  tarea,
  eliminarTarea,
  cambiarEstadoTarea,
}: TaskCardProps) {
  return (
    <article className="task-card">
      {/* ======================================================== */}
      {/* Header */}
      {/* ======================================================== */}

      <div className="task-card__header">
        <h3>{tarea.titulo}</h3>

        <span
          className={`task-card__priority task-card__priority--${tarea.prioridad}`}
        >
          {tarea.prioridad}
        </span>
      </div>

      {/* ======================================================== */}
      {/* Description */}
      {/* ======================================================== */}

      <p className="task-card__description">
        {tarea.descripcion}
      </p>

      {/* ======================================================== */}
      {/* Footer */}
      {/* ======================================================== */}

      <div className="task-card__footer">
        <span
          className={`task-card__status task-card__status--${tarea.estado}`}
        >
          {tarea.estado}
        </span>

        <small>
          {new Date(
            tarea.fechaCreacion,
          ).toLocaleDateString()}
        </small>
      </div>

      {/* ======================================================== */}
      {/* Actions */}
      {/* ======================================================== */}

      <div className="task-card__actions">
        <button>
          Editar
        </button>

        <button
          onClick={() =>
            eliminarTarea(tarea.id)
          }
        >
          Eliminar
        </button>
      </div>

      {/* ======================================================== */}
      {/* Move */}
      {/* ======================================================== */}

      <div className="task-card__move">
        <select
          value={tarea.estado}
          onChange={(e) =>
            cambiarEstadoTarea(
              tarea.id,
              e.target
                .value as EstadoTarea,
            )
          }
        >
          <option value="todo">
            TODO
          </option>

          <option value="in-progress">
            IN PROGRESS
          </option>

          <option value="done">
            DONE
          </option>
        </select>
      </div>
    </article>
  );
}

export default TaskCard;