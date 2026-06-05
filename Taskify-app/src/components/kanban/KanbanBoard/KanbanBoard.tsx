// ============================================================
// ARCHIVO: src/components/kanban/KanbanBoard/KanbanBoard.tsx
// Tablero Kanban con drag & drop nativo via useDragAndDrop.
// Solo se modifican el componente y el CSS — los tipos y hooks
// de tareas quedan intactos.
// ============================================================

import { useDragAndDrop } from "../../../hooks/useDragAndDrop";
import TaskCard from "../../tasks/TaskCard/TaskCard";
import type { EstadoTarea, Tarea, TareaNueva } from "../../../types/task";
import "./KanbanBoard.css";

type KanbanBoardProps = {
  tareas: Tarea[];
  alCambiarEstado: (id: string, nuevoEstado: EstadoTarea) => void;
  alActualizarProgreso: (id: string, nuevoProgreso: number) => void;
  alMoverAPapelera: (id: string) => void;
  alEditarTarea: (id: string, datosEditados: TareaNueva) => void;
};

const configuracionDeColumnas: {
  titulo: string;
  estado: EstadoTarea;
  mensajeVacio: string;
}[] = [
  { titulo: "Pendientes",  estado: "pendiente",   mensajeVacio: "Sin tareas pendientes" },
  { titulo: "En progreso", estado: "en-progreso",  mensajeVacio: "Nada en progreso"     },
  { titulo: "Completadas", estado: "completada",   mensajeVacio: "Nada completado aún"  },
];

const ordenDePrioridad: Record<string, number> = { alta: 0, media: 1, baja: 2 };

function KanbanBoard({
  tareas,
  alCambiarEstado,
  alActualizarProgreso,
  alMoverAPapelera,
  alEditarTarea,
}: KanbanBoardProps) {
  const {
    estaArrastrando,
    columnaEsDestino,
    tareaEstaArrastrandose,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
  } = useDragAndDrop({ alCambiarEstado });

  return (
    <section className="kanban">
      <div className="kanban__encabezado">
        <div>
          <h2 className="kanban__titulo">Tablero de tareas</h2>
          <p className="kanban__subtitulo">
            Vista organizada por estado —{" "}
            {tareas.length} tarea{tareas.length !== 1 ? "s" : ""} en total
          </p>
        </div>
      </div>

      <div className={`kanban__grid${estaArrastrando ? " kanban__grid--arrastrando" : ""}`}>
        {configuracionDeColumnas.map((columna) => {
          const tareasDeEstaColumna = tareas
            .filter((t) => t.estado === columna.estado)
            .sort((a, b) => ordenDePrioridad[a.prioridad] - ordenDePrioridad[b.prioridad]);

          const esDestino = columnaEsDestino(columna.estado);

          return (
            <div
              key={columna.estado}
              className={[
                "kanban__column",
                esDestino ? "kanban__column--drop-target" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onDragOver={onDragOver(columna.estado)}
              onDragLeave={onDragLeave(columna.estado)}
              onDrop={onDrop(columna.estado)}
            >
              <h3>
                {columna.titulo}
                <span>{tareasDeEstaColumna.length}</span>
              </h3>

              {/* Indicador visual de zona de drop */}
              {esDestino && (
                <div className="kanban__drop-indicator">
                  Soltar aquí
                </div>
              )}

              <div className="kanban__tasks">
                {tareasDeEstaColumna.length === 0 && !esDestino ? (
                  <div className="kanban__columna-vacia">{columna.mensajeVacio}</div>
                ) : (
                  tareasDeEstaColumna.map((tarea) => (
                    // Envolvemos TaskCard en un div con los handlers de drag
                    <div
                      key={tarea.id}
                      className={[
                        "kanban__card-wrapper",
                        tareaEstaArrastrandose(tarea.id)
                          ? "kanban__card-wrapper--ghost"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      draggable
                      onDragStart={onDragStart(tarea.id, tarea.estado)}
                      onDragEnd={onDragEnd}
                    >
                      <TaskCard
                        datosDeLaTarea={tarea}
                        alCambiarEstado={alCambiarEstado}
                        alActualizarProgreso={alActualizarProgreso}
                        alMoverAPapelera={alMoverAPapelera}
                        alEditarTarea={alEditarTarea}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default KanbanBoard;