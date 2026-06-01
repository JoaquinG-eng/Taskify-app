 import { useState } from "react";
 import type { EstadoTarea, Tarea, TareaNueva } from "../../../types/task";
 import TaskForm from "../TaskForm/TaskForm";
 import "./TaskCard.css";

type TaskCardProps = {
  datosDeLaTarea: Tarea;
  alCambiarEstado: (id: string, nuevoEstado: EstadoTarea) => void;
  alActualizarProgreso: (id: string, progresoNuevo: number) => void;
  alMoverAPapelera: (id: string) => void;
  alEditarTarea: (id: string, datosEditados: TareaNueva) => void;
};

function obtenerEtiquetaDeEstado(estado: EstadoTarea): string {
  const etiquetas: Record<EstadoTarea, string> = {
    pendiente:   "Pendiente",
    "en-progreso": "En progreso",
    completada:  "Completada",
  };
  return etiquetas[estado] ?? estado;
}

function TaskCard({
  datosDeLaTarea,
  alCambiarEstado,
  alActualizarProgreso,
  alMoverAPapelera,
  alEditarTarea,
}: TaskCardProps) {
  const [estaEditando, setEstaEditando] = useState(false);

  function manejarGuardarEdicion(datosEditados: TareaNueva) {
    alEditarTarea(datosDeLaTarea.id, datosEditados);
    setEstaEditando(false);
  }

  const progresoLimitado  = Math.min(datosDeLaTarea.progreso, 100);
  const barraEstaCompleta = progresoLimitado === 100;
  const estaCompletada    = datosDeLaTarea.estado === "completada";

  return (
    <>
      <article className="task-card">

        {/* Título + prioridad */}
        <div className="task-card__top">
          <h3>{datosDeLaTarea.titulo}</h3>
          <span className={`task-card__priority task-card__priority--${datosDeLaTarea.prioridad}`}>
            {datosDeLaTarea.prioridad}
          </span>
        </div>

        {/* Descripción */}
        <p className="task-card__description">{datosDeLaTarea.descripcion}</p>

        {/* Personas — solo se muestra si hay datos */}
        {(datosDeLaTarea.creadoPor || datosDeLaTarea.asignadoA) && (
          <div className="task-card__personas">
            {datosDeLaTarea.creadoPor && (
              <span className="task-card__persona task-card__persona--creador" title="Creado por">
                <span className="task-card__persona-icono">✦</span>
                {datosDeLaTarea.creadoPor}
              </span>
            )}
            {datosDeLaTarea.asignadoA && (
              <span className="task-card__persona task-card__persona--asignado" title="Asignado a">
                <span className="task-card__persona-icono">→</span>
                {datosDeLaTarea.asignadoA}
              </span>
            )}
          </div>
        )}

        {/* Fecha límite */}
        {datosDeLaTarea.fechaLimite && (
          <div className="task-card__date" title="Fecha límite">
            🗓 {datosDeLaTarea.fechaLimite.split("-").reverse().join("/")}
          </div>
        )}

        {/* Barra de progreso */}
        <div className="task-card__progress-bar">
          <div className="task-card__progress-label">
            <span className="task-card__progress-texto">Progreso</span>
            <span className="task-card__progress-porcentaje">{progresoLimitado}%</span>
          </div>
          <div className="task-card__progress-pista">
            <div
              className={`task-card__progress-relleno ${barraEstaCompleta ? "task-card__progress-relleno--completo" : ""}`}
              style={{ width: `${progresoLimitado}%` }}
            />
          </div>
        </div>

        {/* Estado + acciones */}
        <div className="task-card__bottom">
          <small className={`task-card__status task-card__status--${datosDeLaTarea.estado}`}>
            {obtenerEtiquetaDeEstado(datosDeLaTarea.estado)}
          </small>

          <div className="task-card__actions">
            <button
              className="task-card__btn task-card__btn--completar"
              onClick={() => alCambiarEstado(datosDeLaTarea.id, "completada")}
              disabled={estaCompletada}
              title="Marcar como completada"
            >✓</button>

            <button
              className="task-card__btn task-card__btn--progreso"
              onClick={() => alActualizarProgreso(datosDeLaTarea.id, datosDeLaTarea.progreso + 10)}
              disabled={estaCompletada}
              title="+10% de progreso"
            >Avance</button>

            <button
              className="task-card__btn task-card__btn--editar"
              onClick={() => setEstaEditando(true)}
              title="Editar tarea"
            >Editar</button>

            <button
              className="task-card__btn task-card__btn--eliminar"
              onClick={() => alMoverAPapelera(datosDeLaTarea.id)}
              title="Mover a la papelera"
            >✕</button>
          </div>
        </div>

      </article>

      {estaEditando && (
        <TaskForm
          datosIniciales={datosDeLaTarea}
          tareaId={datosDeLaTarea.id}
          alConfirmar={manejarGuardarEdicion}
          alCancelar={() => setEstaEditando(false)}
        />
      )}
    </>
  );
}

export default TaskCard;