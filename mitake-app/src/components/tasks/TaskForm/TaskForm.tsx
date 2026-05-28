// ============================================================
// ARCHIVO: src/components/tasks/TaskForm/TaskForm.tsx
//
// CAMBIO: acepta `datosIniciales` y `tareaId` para modo edición.
// Si se pasan → el formulario muestra "Editar tarea" y
//   pre-rellena los campos con los datos existentes.
// Si no se pasan → funciona igual que antes (crear).
// ============================================================

import { useState } from "react";

import type { EstadoTarea, PrioridadTarea, TareaNueva } from "../../../types/task";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { useAlert }          from "../../../hooks/useAlert";
import {
  validarTitulo,
  validarDescripcion,
  validarFechaLimite,
} from "../../../utils/validaciones";

import "./TaskForm.css";

// ---- Props ----
type PropiedadesDeTaskForm = {
  alConfirmar: (datos: TareaNueva) => void;
  alCancelar: () => void;
  // Opcionales: si se pasan, el form entra en modo edición
  datosIniciales?: TareaNueva;
  tareaId?: string;          // solo para que el padre sepa qué tarea editar
};

const esquemaDeValidacion = {
  titulo:      validarTitulo,
  descripcion: validarDescripcion,
  fechaLimite: validarFechaLimite,
  estado:      (_: string) => "",
  prioridad:   (_: string) => "",
};

function TaskForm({
  alConfirmar,
  alCancelar,
  datosIniciales,
}: PropiedadesDeTaskForm) {
  // En modo edición usamos los datos iniciales; en modo crear, valores por defecto
  const modoEdicion = !!datosIniciales;

  const [titulo, setTitulo]           = useState(datosIniciales?.titulo      ?? "");
  const [descripcion, setDescripcion] = useState(datosIniciales?.descripcion ?? "");
  const [estado, setEstado]           = useState<EstadoTarea>(datosIniciales?.estado ?? "pendiente");
  const [prioridad, setPrioridad]     = useState<PrioridadTarea>(datosIniciales?.prioridad ?? "media");
  const [fechaLimite, setFechaLimite] = useState(datosIniciales?.fechaLimite ?? "");
  const [sacudiendo, setSacudiendo]   = useState(false);

  const { alertaError } = useAlert();

  const { errores, camposTocados, validarCampo, marcarTocado, validarTodo, limpiarValidacion } =
    useFormValidation(esquemaDeValidacion, { titulo, descripcion, fechaLimite, estado, prioridad });

  function manejarCambioTitulo(e: React.ChangeEvent<HTMLInputElement>) {
    setTitulo(e.target.value);
    if (camposTocados.titulo) validarCampo("titulo", e.target.value);
  }

  function manejarCambioDescripcion(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescripcion(e.target.value);
    if (camposTocados.descripcion) validarCampo("descripcion", e.target.value);
  }

  function manejarCambioFecha(e: React.ChangeEvent<HTMLInputElement>) {
    setFechaLimite(e.target.value);
    if (camposTocados.fechaLimite) validarCampo("fechaLimite", e.target.value);
  }

  function sacudir() {
    setSacudiendo(true);
    setTimeout(() => setSacudiendo(false), 500);
  }

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (!validarTodo()) {
      sacudir();
      alertaError("Revisá los campos marcados antes de continuar.", "Formulario incompleto");
      return;
    }
    alConfirmar({ titulo: titulo.trim(), descripcion: descripcion.trim(), estado, prioridad, fechaLimite: fechaLimite || undefined });
    limpiarValidacion();
  }

  function manejarCancelar() {
    limpiarValidacion();
    alCancelar();
  }

  return (
    <div className="modal-overlay" onClick={manejarCancelar}>
      <form
        className={`task-form ${sacudiendo ? "task-form--sacudiendo" : ""}`}
        onSubmit={manejarEnvio}
        onClick={(e) => e.stopPropagation()}
        noValidate
      >
        {/* ---- ENCABEZADO ---- */}
        <div className="task-form__encabezado">
          <h2>{modoEdicion ? "Editar tarea" : "Nueva tarea"}</h2>
          <button type="button" className="task-form__boton-cerrar" onClick={manejarCancelar} aria-label="Cerrar">✕</button>
        </div>

        {/* ---- TÍTULO ---- */}
        <div className={`campo-grupo ${
          camposTocados.titulo && errores.titulo   ? "campo-grupo--error"  :
          camposTocados.titulo && !errores.titulo  ? "campo-grupo--valido" : ""
        }`}>
          <div className="campo-grupo__etiqueta-fila">
            <label className="campo-grupo__etiqueta" htmlFor="campo-titulo">
              Título <span className="campo-grupo__requerido">*</span>
            </label>
            <span className={`campo-grupo__contador ${titulo.length > 50 ? "campo-grupo__contador--alerta" : ""}`}>
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
            autoFocus={!modoEdicion}
            aria-invalid={camposTocados.titulo && !!errores.titulo}
          />
          {camposTocados.titulo && errores.titulo && (
            <p className="campo-grupo__mensaje-error" role="alert">⚠ {errores.titulo}</p>
          )}
        </div>

        {/* ---- DESCRIPCIÓN ---- */}
        <div className={`campo-grupo ${camposTocados.descripcion && errores.descripcion ? "campo-grupo--error" : ""}`}>
          <div className="campo-grupo__etiqueta-fila">
            <label className="campo-grupo__etiqueta" htmlFor="campo-descripcion">Descripción</label>
            <span className={`campo-grupo__contador ${descripcion.length > 170 ? "campo-grupo__contador--alerta" : ""}`}>
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
          />
          {camposTocados.descripcion && errores.descripcion && (
            <p className="campo-grupo__mensaje-error" role="alert">⚠ {errores.descripcion}</p>
          )}
        </div>

        {/* ---- ESTADO + PRIORIDAD ---- */}
        <div className="task-form__fila">
          <div className="campo-grupo">
            <label className="campo-grupo__etiqueta" htmlFor="campo-estado">Estado</label>
            <select id="campo-estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoTarea)}>
              <option value="pendiente">Pendiente</option>
              <option value="en-progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>
          <div className="campo-grupo">
            <label className="campo-grupo__etiqueta" htmlFor="campo-prioridad">Prioridad</label>
            <select id="campo-prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        {/* ---- FECHA LÍMITE ---- */}
        <div className={`campo-grupo ${
          camposTocados.fechaLimite && errores.fechaLimite   ? "campo-grupo--error"  :
          camposTocados.fechaLimite && fechaLimite && !errores.fechaLimite ? "campo-grupo--valido" : ""
        }`}>
          <label className="campo-grupo__etiqueta" htmlFor="campo-fecha">
            Fecha límite <span className="campo-grupo__opcional">(opcional)</span>
          </label>
          <input
            id="campo-fecha"
            type="date"
            value={fechaLimite}
            onChange={manejarCambioFecha}
            onBlur={() => marcarTocado("fechaLimite")}
          />
          {camposTocados.fechaLimite && errores.fechaLimite && (
            <p className="campo-grupo__mensaje-error" role="alert">⚠ {errores.fechaLimite}</p>
          )}
        </div>

        {/* ---- BOTONES ---- */}
        <div className="task-form__actions">
          <button type="submit">
            {modoEdicion ? "Guardar cambios" : "Crear tarea"}
          </button>
          <button type="button" onClick={manejarCancelar}>Cancelar</button>
        </div>

      </form>
    </div>
  );
}

export default TaskForm;