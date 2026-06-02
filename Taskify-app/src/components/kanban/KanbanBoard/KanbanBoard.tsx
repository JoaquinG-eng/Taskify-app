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
  return (
    <section className="kanban">

      <div className="kanban__encabezado">
        <div>
          <h2 className="kanban__titulo">Tablero de tareas</h2>
          <p className="kanban__subtitulo">
            Vista organizada por estado — {tareas.length} tarea{tareas.length !== 1 ? "s" : ""} en total
          </p>
        </div>
      </div>
        
        
        
      <div className="kanban__grid"> 
        {configuracionDeColumnas.map((columna) => {
            const tareasDeEstaColumna = tareas
            .filter((tarea) => tarea.estado === columna.estado)
            .sort((a, b) => ordenDePrioridad[a.prioridad] - ordenDePrioridad[b.prioridad]);

          return (
            <div key={columna.estado} className="kanban__column">

              <h3>
                {columna.titulo}
                <span>{tareasDeEstaColumna.length}</span>
              </h3>

              <div className="kanban__tasks">
                {tareasDeEstaColumna.length === 0 ? (
                  <div className="kanban__columna-vacia">{columna.mensajeVacio}</div>
                ) : (
                  tareasDeEstaColumna.map((tarea) => (
                    <TaskCard
                      key={tarea.id}
                      datosDeLaTarea={tarea}
                      alCambiarEstado={alCambiarEstado}
                      alActualizarProgreso={alActualizarProgreso}
                      alMoverAPapelera={alMoverAPapelera}
                      alEditarTarea={alEditarTarea}
                    />
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