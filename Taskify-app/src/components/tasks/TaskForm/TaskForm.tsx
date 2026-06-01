 import { useState } from "react";
 import type { PrioridadTarea, TareaNueva } from "../../../types/task";
 import { useFormValidation } from "../../../hooks/useFormValidation";
 import { useAlert }          from "../../../hooks/useAlert";
 import { validarTitulo, validarDescripcion, validarFechaLimite } from "../../../utils/validaciones";
 import "./TaskForm.css";

 type PropiedadesDeTaskForm = {
   alConfirmar: (datos: TareaNueva) => void;
   alCancelar: () => void;
   datosIniciales?: TareaNueva;
   tareaId?: string;
};

const esquemaDeValidacion = {
  titulo:      validarTitulo,
  descripcion: validarDescripcion,
  fechaLimite: validarFechaLimite,
  prioridad:   () => "",
};


const opcionesPrioridad: { valor: PrioridadTarea; etiqueta: string; color: string }[] = [
  { valor: "alta",  etiqueta: "Alta",  color: "#ef4444" },
  { valor: "media", etiqueta: "Media", color: "#f59e0b" },
  { valor: "baja",  etiqueta: "Baja",  color: "#10b981" },
];

function TaskForm({ alConfirmar, alCancelar, datosIniciales }: PropiedadesDeTaskForm) {
  const modoEdicion = !!datosIniciales;

  const [titulo,      setTitulo]      = useState(datosIniciales?.titulo      ?? "");
  const [descripcion, setDescripcion] = useState(datosIniciales?.descripcion ?? "");
  const [prioridad,   setPrioridad]   = useState<PrioridadTarea>(datosIniciales?.prioridad ?? "media");
  const [fechaLimite, setFechaLimite] = useState(datosIniciales?.fechaLimite ?? "");
  const [creadoPor,   setCreadoPor]   = useState(datosIniciales?.creadoPor   ?? "");
  const [asignadoA,   setAsignadoA]   = useState(datosIniciales?.asignadoA   ?? "");
  const [sacudiendo,  setSacudiendo]  = useState(false);

   const { alertaError } = useAlert();
   const { errores, camposTocados, validarCampo, marcarTocado, validarTodo, limpiarValidacion } =
    useFormValidation(esquemaDeValidacion, { titulo, descripcion, fechaLimite,prioridad });
  
  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (!validarTodo()) {
      setSacudiendo(true);
      setTimeout(() => setSacudiendo(false), 500);
      alertaError("Revisá los campos marcados antes de continuar.", "Formulario incompleto");
      return;
    }
    alConfirmar({
      titulo:      titulo.trim(),
      descripcion: descripcion.trim(),
      prioridad,
      fechaLimite: fechaLimite   || undefined,
      creadoPor:   creadoPor.trim() || undefined,
      asignadoA:   asignadoA.trim() || undefined,
      estado: "pendiente"
    });
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

        {/* ENCABEZADO */}
        <div className="task-form__encabezado">
          <h2>{modoEdicion ? "Editar tarea" : "Nueva tarea"}</h2>
          <button
            type="button"
            className="task-form__boton-cerrar"
            onClick={manejarCancelar}
            aria-label="Cerrar"
          >✕</button>
        </div>

        {/* TÍTULO */}
        <div className={`campo-grupo ${
          camposTocados.titulo && errores.titulo  ? "campo-grupo--error"  :
          camposTocados.titulo && !errores.titulo ? "campo-grupo--valido" : ""
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
            onChange={(e) => { setTitulo(e.target.value); if (camposTocados.titulo) validarCampo("titulo", e.target.value); }}
            onBlur={() => marcarTocado("titulo")}
            maxLength={60}
            autoFocus={!modoEdicion}
            aria-invalid={camposTocados.titulo && !!errores.titulo}
          />
          {camposTocados.titulo && errores.titulo && (
            <p className="campo-grupo__mensaje-error" role="alert">⚠ {errores.titulo}</p>
          )}
        </div>

        {/* DESCRIPCIÓN */}
        <div className={`campo-grupo ${camposTocados.descripcion && errores.descripcion ? "campo-grupo--error" : ""}`}>
          <div className="campo-grupo__etiqueta-fila">
            <label className="campo-grupo__etiqueta" htmlFor="campo-descripcion">Descripción</label>
            <span className={`campo-grupo__contador ${descripcion.length > 170 ? "campo-grupo__contador--alerta" : ""}`}>
              {descripcion.length}/1000
            </span>
          </div>
          <textarea
            id="campo-descripcion"
            placeholder="Detalles opcionales..."
            value={descripcion}
            onChange={(e) => { setDescripcion(e.target.value); if (camposTocados.descripcion) validarCampo("descripcion", e.target.value); }}
            onBlur={() => marcarTocado("descripcion")}
            maxLength={1000}
            rows={3}
          />
          {camposTocados.descripcion && errores.descripcion && (
            <p className="campo-grupo__mensaje-error" role="alert">⚠ {errores.descripcion}</p>
          )}
        </div>

        {/* CREADO POR + ASIGNADO A */}
        <div className="task-form__fila">
          <div className="campo-grupo">
            <label className="campo-grupo__etiqueta" htmlFor="campo-creado-por">
              Creado por <span className="campo-grupo__opcional">(opcional)</span>
            </label>
            <input
              id="campo-creado-por"
              type="text"
              placeholder="Tu nombre"
              value={creadoPor}
              onChange={(e) => setCreadoPor(e.target.value)}
              maxLength={40}
            />
          </div>
          <div className="campo-grupo">
            <label className="campo-grupo__etiqueta" htmlFor="campo-asignado-a">
              Asignado a <span className="campo-grupo__opcional">(opcional)</span>
            </label>
            <input
              id="campo-asignado-a"
              type="text"
              placeholder="Responsable"
              value={asignadoA}
              onChange={(e) => setAsignadoA(e.target.value)}
              maxLength={40}
            />
          </div>
        </div>


        {/* PRIORIDAD — toggle buttons */}
        <div className="campo-grupo">
          <span className="campo-grupo__etiqueta">Prioridad</span>
          <div className="task-form__toggle-group">
            {opcionesPrioridad.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`task-form__toggle ${prioridad === op.valor ? "task-form__toggle--activo" : ""}`}
                style={prioridad === op.valor ? {
                  borderColor: op.color,
                  color: op.color,
                  background: `color-mix(in srgb, ${op.color} 12%, transparent)`,
                } : undefined}
                onClick={() => setPrioridad(op.valor)}
              >
                {op.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {/* FECHA LÍMITE */}
        <div className={`campo-grupo ${
          camposTocados.fechaLimite && errores.fechaLimite              ? "campo-grupo--error"  :
          camposTocados.fechaLimite && fechaLimite && !errores.fechaLimite ? "campo-grupo--valido" : ""
        }`}>
          <label className="campo-grupo__etiqueta" htmlFor="campo-fecha">
            Fecha límite <span className="campo-grupo__opcional">(opcional)</span>
          </label>
          <input
            id="campo-fecha"
            type="date"
            value={fechaLimite}
            onChange={(e) => { setFechaLimite(e.target.value); if (camposTocados.fechaLimite) validarCampo("fechaLimite", e.target.value); }}
            onBlur={() => marcarTocado("fechaLimite")}
          />
          {camposTocados.fechaLimite && errores.fechaLimite && (
            <p className="campo-grupo__mensaje-error" role="alert">⚠ {errores.fechaLimite}</p>
          )}
        </div>

        {/* BOTONES */}
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