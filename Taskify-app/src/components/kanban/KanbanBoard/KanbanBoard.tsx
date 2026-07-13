import { useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import TaskCard from "../../tasks/TaskCard/TaskCard";
import type {
  EstadoTarea,
  Tarea,
  TareaNueva,
} from "../../../types/task";
import { useDragAndDropSensors } from "../../../hooks/useDragAndDrop";
import "./KanbanBoard.css";

type KanbanBoardProps = {
  tareas: Tarea[];
  alCambiarEstado: (
    id: string,
    nuevoEstado: EstadoTarea
  ) => void;
  alActualizarProgreso: (
    id: string,
    nuevoProgreso: number
  ) => void;
  alMoverAPapelera: (id: string) => void;
  alEditarTarea: (
    id: string,
    datosEditados: TareaNueva
  ) => void;
  alReordenarTareas?: (
    tareasReordenadas: Tarea[]
  ) => void;
};

type ColumnaKanban = {
  titulo: string;
  estado: EstadoTarea;
  mensajeVacio: string;
};

type DatosTareaArrastrable = {
  type: "task";
  tarea: Tarea;
};

type DatosColumnaSoltable = {
  type: "column";
  estado: EstadoTarea;
};

type DatosDrag =
  | DatosTareaArrastrable
  | DatosColumnaSoltable;

const COLUMNAS: ColumnaKanban[] = [
  {
    titulo: "Pendientes",
    estado: "pendiente",
    mensajeVacio: "Sin tareas pendientes",
  },
  {
    titulo: "En progreso",
    estado: "en-progreso",
    mensajeVacio: "Nada en progreso",
  },
  {
    titulo: "Completadas",
    estado: "completada",
    mensajeVacio: "Nada completado aún",
  },
];

/*
 * Prioriza el elemento situado directamente debajo del cursor o dedo.
 * Si no hay coincidencia directa, utiliza intersección y finalmente
 * el centro más cercano.
 */
const detectarColision: CollisionDetection = (argumentos) => {
  const colisionesDelPuntero = pointerWithin(argumentos);

  if (colisionesDelPuntero.length > 0) {
    return colisionesDelPuntero;
  }

  const colisionesPorInterseccion = rectIntersection(argumentos);

  if (colisionesPorInterseccion.length > 0) {
    return colisionesPorInterseccion;
  }

  return closestCenter(argumentos);
};

/**
 * Quita la tarea activa del arreglo y la inserta en la columna
 * de destino.
 *
 * - Si se soltó sobre otra tarea, se coloca antes de ella.
 * - Si se soltó sobre el espacio libre de una columna, se coloca
 *   al final de esa columna.
 */
function insertarEnColumna(
  tareas: Tarea[],
  tareaActiva: Tarea,
  nuevoEstado: EstadoTarea,
  tareaDestinoId?: string
): Tarea[] {
  const tareaActualizada: Tarea = {
    ...tareaActiva,
    estado: nuevoEstado,
  };

  const tareasSinActiva = tareas.filter(
    (tarea) => tarea.id !== tareaActiva.id
  );

  if (tareaDestinoId) {
    const indiceDestino = tareasSinActiva.findIndex(
      (tarea) => tarea.id === tareaDestinoId
    );

    if (indiceDestino !== -1) {
      return [
        ...tareasSinActiva.slice(0, indiceDestino),
        tareaActualizada,
        ...tareasSinActiva.slice(indiceDestino),
      ];
    }
  }

  let indiceInsercion = -1;

  for (
    let indice = tareasSinActiva.length - 1;
    indice >= 0;
    indice -= 1
  ) {
    if (tareasSinActiva[indice].estado === nuevoEstado) {
      indiceInsercion = indice + 1;
      break;
    }
  }

  if (indiceInsercion === -1) {
    return [...tareasSinActiva, tareaActualizada];
  }

  return [
    ...tareasSinActiva.slice(0, indiceInsercion),
    tareaActualizada,
    ...tareasSinActiva.slice(indiceInsercion),
  ];
}

function SortableTaskCard({
  tarea,
  alActualizarProgreso,
  alMoverAPapelera,
  alEditarTarea,
}: {
  tarea: Tarea;
  alActualizarProgreso: (
    id: string,
    progreso: number
  ) => void;
  alMoverAPapelera: (id: string) => void;
  alEditarTarea: (
    id: string,
    datos: TareaNueva
  ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tarea.id,
    data: {
      type: "task",
      tarea,
    } satisfies DatosTareaArrastrable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    /*
     * Durante el arrastre no debe existir transición:
     * la posición tiene que acompañar al puntero inmediatamente.
     */
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.2 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        "kanban__card-wrapper",
        isDragging
          ? "kanban__card-wrapper--dragging"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <TaskCard
        datosDeLaTarea={tarea}
        alCambiarEstado={() => {
          /*
           * El cambio de estado desde el tablero se administra
           * exclusivamente mediante drag-and-drop.
           */
        }}
        alActualizarProgreso={alActualizarProgreso}
        alMoverAPapelera={alMoverAPapelera}
        alEditarTarea={alEditarTarea}
      />
    </div>
  );
}

function KanbanColumn({
  columna,
  tareas,
  alActualizarProgreso,
  alMoverAPapelera,
  alEditarTarea,
}: {
  columna: ColumnaKanban;
  tareas: Tarea[];
  alActualizarProgreso: (
    id: string,
    progreso: number
  ) => void;
  alMoverAPapelera: (id: string) => void;
  alEditarTarea: (
    id: string,
    datos: TareaNueva
  ) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `columna-${columna.estado}`,
    data: {
      type: "column",
      estado: columna.estado,
    } satisfies DatosColumnaSoltable,
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "kanban__column",
        isOver ? "kanban__column--over" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3>
        {columna.titulo}
        <span>{tareas.length}</span>
      </h3>

      <div className="kanban__tasks">
        {tareas.length === 0 ? (
          <div className="kanban__columna-vacia">
            {columna.mensajeVacio}
          </div>
        ) : (
          <SortableContext
            items={tareas.map((tarea) => tarea.id)}
            strategy={verticalListSortingStrategy}
          >
            {tareas.map((tarea) => (
              <SortableTaskCard
                key={tarea.id}
                tarea={tarea}
                alActualizarProgreso={
                  alActualizarProgreso
                }
                alMoverAPapelera={alMoverAPapelera}
                alEditarTarea={alEditarTarea}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

function KanbanBoard({
  tareas,
  alCambiarEstado,
  alActualizarProgreso,
  alMoverAPapelera,
  alEditarTarea,
  alReordenarTareas,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(
    null
  );

  const sensors = useDragAndDropSensors();

  const tareaActiva = activeId
    ? tareas.find((tarea) => tarea.id === activeId)
    : undefined;

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(String(event.active.id));
  }

  function handleDragCancel(
    _event: DragCancelEvent
  ): void {
    setActiveId(null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const tareaQueSeMueve = tareas.find(
      (tarea) => tarea.id === activeIdStr
    );

    if (!tareaQueSeMueve) return;

    const datosDestino = over.data.current as
      | DatosDrag
      | undefined;

    if (!datosDestino) return;

    let nuevoEstado = tareaQueSeMueve.estado;
    let tareaDestinoId: string | undefined;

    if (datosDestino.type === "column") {
      nuevoEstado = datosDestino.estado;
    }

    if (datosDestino.type === "task") {
      nuevoEstado = datosDestino.tarea.estado;
      tareaDestinoId = datosDestino.tarea.id;
    }

    /*
     * Reordenamiento dentro de la misma columna al soltar
     * sobre otra tarjeta.
     */
    if (
      nuevoEstado === tareaQueSeMueve.estado &&
      datosDestino.type === "task"
    ) {
      const indiceAnterior = tareas.findIndex(
        (tarea) => tarea.id === activeIdStr
      );

      const indiceNuevo = tareas.findIndex(
        (tarea) => tarea.id === overIdStr
      );

      if (
        indiceAnterior !== -1 &&
        indiceNuevo !== -1 &&
        indiceAnterior !== indiceNuevo
      ) {
        alReordenarTareas?.(
          arrayMove(tareas, indiceAnterior, indiceNuevo)
        );
      }

      return;
    }

    /*
     * Mover al final de la misma columna cuando se suelta
     * sobre el espacio libre de la columna.
     */
    if (
      nuevoEstado === tareaQueSeMueve.estado &&
      datosDestino.type === "column"
    ) {
      const nuevoOrden = insertarEnColumna(
        tareas,
        tareaQueSeMueve,
        nuevoEstado
      );

      alReordenarTareas?.(nuevoOrden);
      return;
    }

    /*
     * Cambio de columna:
     * 1. guarda la posición elegida;
     * 2. actualiza el estado en Firestore.
     */
    if (nuevoEstado !== tareaQueSeMueve.estado) {
      const nuevoOrden = insertarEnColumna(
        tareas,
        tareaQueSeMueve,
        nuevoEstado,
        tareaDestinoId
      );

      alReordenarTareas?.(nuevoOrden);
      alCambiarEstado(activeIdStr, nuevoEstado);
    }
  }

  const overlay =
    typeof document !== "undefined"
      ? createPortal(
          <DragOverlay
            adjustScale={false}
            dropAnimation={null}
            zIndex={99999}
          >
            {tareaActiva ? (
              <div className="kanban__overlay">
                <TaskCard
                  datosDeLaTarea={tareaActiva}
                  alCambiarEstado={() => {
                    /*
                     * El overlay es únicamente visual.
                     */
                  }}
                  alActualizarProgreso={
                    alActualizarProgreso
                  }
                  alMoverAPapelera={alMoverAPapelera}
                  alEditarTarea={alEditarTarea}
                />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )
      : null;

  return (
    <section className="kanban">
      <div className="kanban__encabezado">
        <div>
          <h2 className="kanban__titulo">
            Tablero de tareas
          </h2>

          <p className="kanban__subtitulo">
            Vista organizada por estado — {tareas.length}{" "}
            tarea{tareas.length !== 1 ? "s" : ""} en total
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={detectarColision}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban__grid">
          {COLUMNAS.map((columna) => {
            const tareasDeEstaColumna = tareas.filter(
              (tarea) => tarea.estado === columna.estado
            );

            return (
              <KanbanColumn
                key={columna.estado}
                columna={columna}
                tareas={tareasDeEstaColumna}
                alActualizarProgreso={
                  alActualizarProgreso
                }
                alMoverAPapelera={alMoverAPapelera}
                alEditarTarea={alEditarTarea}
              />
            );
          })}
        </div>

        {overlay}
      </DndContext>
    </section>
  );
}

export default KanbanBoard;