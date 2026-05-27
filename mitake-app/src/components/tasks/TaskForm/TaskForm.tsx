import { useState } from "react";

import type {
  EstadoTarea,
  PrioridadTarea,
} from "../../../types/task";

type TaskFormProps = {
  crearTarea: (tarea: {
    titulo: string;

    descripcion: string;

    estado: EstadoTarea;

    prioridad: PrioridadTarea;
  }) => void;
};

function TaskForm({
  crearTarea,
}: TaskFormProps) {
  // ============================================================
  // Estados
  // ============================================================

  const [titulo, setTitulo] =
    useState("");

  const [
    descripcion,
    setDescripcion,
  ] = useState("");

  const [estado, setEstado] =
    useState<EstadoTarea>("por-hacer");

  const [prioridad, setPrioridad] =
    useState<PrioridadTarea>(
      "medium",
    );

  // ============================================================
  // Submit
  // ============================================================

  function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!titulo.trim()) return;

    crearTarea({
      titulo,

      descripcion,

      estado,

      prioridad,
    });

    // ============================================================
    // Limpiar formulario
    // ============================================================

    setTitulo("");

    setDescripcion("");

    setEstado("por-hacer");

    setPrioridad("medium");
  }

  return (
    <form
      className="task-form"
      onSubmit={handleSubmit}
    >
      <h2>Nueva tarea</h2>

      {/* ======================================================== */}
      {/* Título */}
      {/* ======================================================== */}

      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) =>
          setTitulo(e.target.value)
        }
      />

      {/* ======================================================== */}
      {/* Descripción */}
      {/* ======================================================== */}

      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) =>
          setDescripcion(
            e.target.value,
          )
        }
      />

      {/* ======================================================== */}
      {/* Estado */}
      {/* ======================================================== */}

      <select
        value={estado}
        onChange={(e) =>
          setEstado(
            e.target
              .value as EstadoTarea,
          )
        }
      >
        <option value="todo">
          Por hacer
        </option>

        <option value="in-progress">
          En proceso
        </option>

        <option value="done">
          Hecho
        </option>
      </select>

      {/* ======================================================== */}
      {/* Prioridad */}
      {/* ======================================================== */}

      <select
        value={prioridad}
        onChange={(e) =>
          setPrioridad(
            e.target
              .value as PrioridadTarea,
          )
        }
      >
        <option value="low">
          LOW
        </option>

        <option value="medium">
          MEDIUM
        </option>

        <option value="high">
          HIGH
        </option>
      </select>

      {/* ======================================================== */}
      {/* Botón */}
      {/* ======================================================== */}

      <button type="submit">
        Crear tarea
      </button>
    </form>
  );
}

export default TaskForm;