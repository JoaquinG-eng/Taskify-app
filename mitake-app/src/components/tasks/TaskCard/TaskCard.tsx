// ============================================================
// ARCHIVO: src/components/tasks/TaskCard/TaskCard.tsx
// ¿Para qué sirve? Tarjeta individual de tarea.
// CAMBIOS: barra de progreso visual en lugar de texto plano,
// estado con punto de color animado.
// ============================================================

import type { EstadoTarea, Tarea } from "../../../types/task";
import "./TaskCard.css";

// ------------------------------------------------------------
// TIPOS de las props — igual que antes, sin cambios
// ------------------------------------------------------------
type TaskCardProps = {
  datosDeLaTarea: Tarea;
  alCambiarEstado: (id: string, nuevoEstado: EstadoTarea) => void;
  alActualizarProgreso: (id: string, progresoNuevo: number) => void;
  alMoverAPapelera: (id: string) => void;
};

// ------------------------------------------------------------
// FUNCIÓN DE AYUDA: obtenerEtiquetaDeEstado
// Convierte el valor interno al texto que ve el usuario.
// ------------------------------------------------------------
function obtenerEtiquetaDeEstado(estado: EstadoTarea): string {
  if (estado === "en-progreso") return "En progreso";
  if (estado === "pendiente")   return "Pendiente";
  return "Completada";
}

// ------------------------------------------------------------
// COMPONENTE: TaskCard
// ------------------------------------------------------------
function TaskCard({
  datosDeLaTarea,
  alCambiarEstado,
  alActualizarProgreso,
  alMoverAPapelera,
}: TaskCardProps) {
  // El progreso no puede pasar de 100
  const progresoLimitado = Math.min(datosDeLaTarea.progreso, 100);

  // La barra se pone verde cuando llega al 100%
  const barraEstaCompleta = progresoLimitado === 100;

  return (
    <article className="task-card">

      {/* ---- FILA SUPERIOR: título + prioridad ---- */}
      <div className="task-card__top">
        <h3>{datosDeLaTarea.titulo}</h3>
        <span
          className={`task-card__priority task-card__priority--${datosDeLaTarea.prioridad}`}
        >
          {datosDeLaTarea.prioridad}
        </span>
      </div>

      {/* ---- DESCRIPCIÓN ---- */}
      <p className="task-card__description">
        {datosDeLaTarea.descripcion}
      </p>

      {/* ---- BARRA DE PROGRESO VISUAL ---- */}
      <div className="task-card__progress-bar">
        <div className="task-card__progress-label">
          <span className="task-card__progress-texto">Progreso</span>
          <span className="task-card__progress-porcentaje">
            {progresoLimitado}%
          </span>
        </div>
        <div className="task-card__progress-pista">
          <div
            className={`task-card__progress-relleno ${
              barraEstaCompleta ? "task-card__progress-relleno--completo" : ""
            }`}
            style={{ width: `${progresoLimitado}%` }}
          />
        </div>
      </div>

      {/* ---- FILA INFERIOR: estado + botones ---- */}
      <div className="task-card__bottom">
        {/* Estado con punto de color animado */}
        <small
          className={`task-card__status task-card__status--${datosDeLaTarea.estado}`}
        >
          {obtenerEtiquetaDeEstado(datosDeLaTarea.estado)}
        </small>

        {/* Tres botones con colores distintos */}
        <div className="task-card__actions">
          <button
            onClick={() => alCambiarEstado(datosDeLaTarea.id, "completada")}
            title="Marcar como completada"
          >
            Completar
          </button>

          <button
            onClick={() => 
              alActualizarProgreso(datosDeLaTarea.id, datosDeLaTarea.progreso + 10)
            }
            disabled={datosDeLaTarea.estado === "completada"}
          >
            proceso
          </button>

          <button
            onClick={() => alMoverAPapelera(datosDeLaTarea.id)}
            title="Mover a la papelera"
          >
            Mover a la papelera 
          </button>
        </div>
      </div>

    </article>
  );
}

export default TaskCard;