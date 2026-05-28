// ============================================================
// ARCHIVO: src/components/tasks/TaskForm/TaskForm.tsx
// ¿Para qué sirve? Formulario de creación de tarea con
// validación completa campo por campo, contadores de caracteres,
// mensajes de error animados y shake al intentar enviar inválido.
// ============================================================

import { useState } from "react";

import type { EstadoTarea, PrioridadTarea, TareaNueva } from "../../../types/task";

import { useFormValidation } from "../../../hooks/useFormValidation";
import { useAlert } from "../../../hooks/useAlert";
import {
  validarTitulo,
  validarDescripcion,
  validarFechaLimite,
} from "../../../utils/validaciones";

import "./TaskForm.css";

// ------------------------------------------------------------
// TIPO: PropiedadesDeTaskForm
// ------------------------------------------------------------
type PropiedadesDeTaskForm = {
  alConfirmar: (datos: TareaNueva) => void;
  alCancelar: () => void;
};

// ------------------------------------------------------------
// CONSTANTE: esquema de validación del formulario
// Mapea cada campo a su función validadora correspondiente.
// ------------------------------------------------------------
const esquemaDeValidacionDelFormulario = {
  titulo:      validarTitulo,
  descripcion: validarDescripcion,
  fechaLimite: validarFechaLimite,
  // Estado y prioridad siempre tienen valor por defecto válido,
  // pero los incluimos para que el hook los registre
  estado:      (_valor: string) => "",
  prioridad:   (_valor: string) => "",
};

// ------------------------------------------------------------
// COMPONENTE: TaskForm
// ------------------------------------------------------------
function TaskForm({ alConfirmar, alCancelar }: PropiedadesDeTaskForm) {
  // Estados de los campos del formulario
  const [titulo, setTitulo]           = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [estado, setEstado]           = useState<EstadoTarea>("pendiente");
  const [prioridad, setPrioridad]     = useState<PrioridadTarea>("media");
  const [fechaLimite, setFechaLimite] = useState<string>("");

  // Estado para la animación de shake al enviar con errores
  const [formularioSacudiendose, setFormularioSacudiendose] =
    useState<boolean>(false);

  const { alertaError } = useAlert();

  // --------------------------------------------------------
  // HOOK DE VALIDACIÓN
  // Le pasamos el esquema y los valores actuales.
  // Los valores deben ser strings para el hook genérico.
  // --------------------------------------------------------
  const {
    errores,
    camposTocados,
    validarCampo,
    marcarTocado,
    validarTodo,
    limpiarValidacion,
  } = useFormValidation(esquemaDeValidacionDelFormulario, {
    titulo,
    descripcion,
    fechaLimite,
    estado,
    prioridad,
  });

  // --------------------------------------------------------
  // FUNCIÓN: manejarCambioTitulo
  // Valida en tiempo real solo si el campo ya fue tocado.
  // --------------------------------------------------------
  function manejarCambioTitulo(
    evento: React.ChangeEvent<HTMLInputElement>
  ): void {
    const valorNuevo = evento.target.value;
    setTitulo(valorNuevo);

    // Solo validamos en tiempo real si ya tocó el campo antes
    if (camposTocados.titulo) {
      validarCampo("titulo", valorNuevo);
    }
  }

  // --------------------------------------------------------
  // FUNCIÓN: manejarCambioDescripcion
  // --------------------------------------------------------
  function manejarCambioDescripcion(
    evento: React.ChangeEvent<HTMLTextAreaElement>
  ): void {
    const valorNuevo = evento.target.value;
    setDescripcion(valorNuevo);

    if (camposTocados.descripcion) {
      validarCampo("descripcion", valorNuevo);
    }
  }

  // --------------------------------------------------------
  // FUNCIÓN: manejarCambioFechaLimite
  // --------------------------------------------------------
  function manejarCambioFechaLimite(
    evento: React.ChangeEvent<HTMLInputElement>
  ): void {
    const valorNuevo = evento.target.value;
    setFechaLimite(valorNuevo);

    if (camposTocados.fechaLimite) {
      validarCampo("fechaLimite", valorNuevo);
    }
  }

  // --------------------------------------------------------
  // FUNCIÓN: sacudirFormulario
  // Activa la animación de shake y la apaga después.
  // --------------------------------------------------------
  function sacudirFormulario(): void {
    setFormularioSacudiendose(true);
    setTimeout(() => setFormularioSacudiendose(false), 500);
  }

  // --------------------------------------------------------
  // FUNCIÓN: manejarEnvio
  // Valida todo, muestra errores o crea la tarea.
  // --------------------------------------------------------
  function manejarEnvio(evento: React.FormEvent): void {
    evento.preventDefault();

    // Validamos todos los campos de una sola vez
    const formularioEsValido = validarTodo();

    if (!formularioEsValido) {
      sacudirFormulario();
      alertaError(
        "Revisá los campos marcados antes de continuar.",
        "Formulario incompleto"
      );
      return;
    }

    // Si todo es válido, creamos la tarea
    alConfirmar({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      estado,
      prioridad,
      fechaLimite: fechaLimite || undefined,
    });

    // Limpiamos el formulario después de crear
    setTitulo("");
    setDescripcion("");
    setEstado("pendiente");
    setPrioridad("media");
    setFechaLimite("");
    limpiarValidacion();
  }

  // --------------------------------------------------------
  // FUNCIÓN: manejarCancelacion
  // Limpia errores y llama al callback de cancelar.
  // --------------------------------------------------------
  function manejarCancelacion(): void {
    limpiarValidacion();
    alCancelar();
  }

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div className="modal-overlay" onClick={manejarCancelacion}>

      <form
        className={`task-form ${formularioSacudiendose ? "task-form--sacudiendo" : ""}`}
        onSubmit={manejarEnvio}
        onClick={(evento) => evento.stopPropagation()}
        noValidate
      >
        {/* Encabezado */}
        <div className="task-form__encabezado">
          <h2>Nueva tarea</h2>
          <button
            type="button"
            className="task-form__boton-cerrar"
            onClick={manejarCancelacion}
            aria-label="Cerrar formulario"
          >
            ✕
          </button>
        </div>

        {/* ---- CAMPO: Título ---- */}
        <div className={`campo-grupo ${
          camposTocados.titulo && errores.titulo
            ? "campo-grupo--error"
            : camposTocados.titulo && !errores.titulo
            ? "campo-grupo--valido"
            : ""
        }`}>
          <div className="campo-grupo__etiqueta-fila">
            <label className="campo-grupo__etiqueta" htmlFor="campo-titulo">
              Título <span className="campo-grupo__requerido">*</span>
            </label>
            <span className={`campo-grupo__contador ${
              titulo.length > 50 ? "campo-grupo__contador--alerta" : ""
            }`}>
              {titulo.length}/60
            </span>
          </div>

          <input
            id="campo-titulo"
            type="text"
            placeholder="¿Qué hay que hacer?"
            value={titulo}
            onChange={manejarCambioTitulo}
            onBlur={() => marcarTocado("titulo")}
            maxLength={60}
            autoFocus
            aria-describedby={errores.titulo ? "error-titulo" : undefined}
            aria-invalid={camposTocados.titulo && !!errores.titulo}
          />

          {/* Mensaje de error con animación */}
          {camposTocados.titulo && errores.titulo && (
            <p
              id="error-titulo"
              className="campo-grupo__mensaje-error"
              role="alert"
            >
              ⚠ {errores.titulo}
            </p>
          )}
        </div>

        {/* ---- CAMPO: Descripción ---- */}
        <div className={`campo-grupo ${
          camposTocados.descripcion && errores.descripcion
            ? "campo-grupo--error"
            : ""
        }`}>
          <div className="campo-grupo__etiqueta-fila">
            <label className="campo-grupo__etiqueta" htmlFor="campo-descripcion">
              Descripción
            </label>
            <span className={`campo-grupo__contador ${
              descripcion.length > 170 ? "campo-grupo__contador--alerta" : ""
            }`}>
              {descripcion.length}/200
            </span>
          </div>

          <textarea
            id="campo-descripcion"
            placeholder="Detalles opcionales..."
            value={descripcion}
            onChange={manejarCambioDescripcion}
            onBlur={() => marcarTocado("descripcion")}
            maxLength={200}
            rows={3}
            aria-describedby={errores.descripcion ? "error-descripcion" : undefined}
            aria-invalid={camposTocados.descripcion && !!errores.descripcion}
          />

          {camposTocados.descripcion && errores.descripcion && (
            <p
              id="error-descripcion"
              className="campo-grupo__mensaje-error"
              role="alert"
            >
              ⚠ {errores.descripcion}
            </p>
          )}
        </div>

        {/* ---- FILA: Estado + Prioridad ---- */}
        <div className="task-form__fila">

          <div className="campo-grupo">
            <label className="campo-grupo__etiqueta" htmlFor="campo-estado">
              Estado
            </label>
            <select
              id="campo-estado"
              value={estado}
              onChange={(evento) =>
                setEstado(evento.target.value as EstadoTarea)
              }
            >
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div className="campo-grupo">
            <label className="campo-grupo__etiqueta" htmlFor="campo-prioridad">
              Prioridad
            </label>
            <select
              id="campo-prioridad"
              value={prioridad}
              onChange={(evento) =>
                setPrioridad(evento.target.value as PrioridadTarea)
              }
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

        </div>

        {/* ---- CAMPO: Fecha límite ---- */}
        <div className={`campo-grupo ${
          camposTocados.fechaLimite && errores.fechaLimite
            ? "campo-grupo--error"
            : camposTocados.fechaLimite && fechaLimite && !errores.fechaLimite
            ? "campo-grupo--valido"
            : ""
        }`}>
          <label className="campo-grupo__etiqueta" htmlFor="campo-fecha">
            Fecha límite
            <span className="campo-grupo__opcional"> (opcional)</span>
          </label>

          <input
            id="campo-fecha"
            type="date"
            value={fechaLimite}
            onChange={manejarCambioFechaLimite}
            onBlur={() => marcarTocado("fechaLimite")}
            aria-describedby={errores.fechaLimite ? "error-fecha" : undefined}
            aria-invalid={camposTocados.fechaLimite && !!errores.fechaLimite}
          />

          {camposTocados.fechaLimite && errores.fechaLimite && (
            <p
              id="error-fecha"
              className="campo-grupo__mensaje-error"
              role="alert"
            >
              ⚠ {errores.fechaLimite}
            </p>
          )}
        </div>

        {/* ---- Botones de acción ---- */}
        <div className="task-form__actions">
          <button type="submit">
            Crear tarea
          </button>
          <button type="button" onClick={manejarCancelacion}>
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
}


export default TaskForm;