 import { useState } from "react";
 import {
   MAX_LONGITUD_COMENTARIO_TAREA,
   type ComentarioTarea,
   type PrioridadTarea,
   type TareaNueva,
 } from "../../../types/task";
 import { useFormValidation } from "../../../hooks/useFormValidation";
 import { useAlert }          from "../../../hooks/useAlert";
 import { validarTitulo, validarDescripcion, validarFechaLimite, validarHorario } from "../../../utils/validaciones";
 import "./TaskForm.css";
 type DatosInicialesTaskForm = TareaNueva & {
   comentarios?: ComentarioTarea[];
 };

 type PropiedadesDeTaskForm = {
   alConfirmar: (datos: TareaNueva) => void;
   alCancelar: () => void;
   datosIniciales?: DatosInicialesTaskForm;
   tareaId?: string;
   fechaInicial?: string;
   horaInicial?: string;
   horaFinInicial?: string;
   alAgregarComentario?: (texto: string) => Promise<ComentarioTarea>;
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

function TaskForm({
  alConfirmar,
  alCancelar,
  datosIniciales,
  tareaId,
  fechaInicial,
  horaInicial,
  horaFinInicial,
  alAgregarComentario,
}: PropiedadesDeTaskForm) {
  const modoEdicion = !!datosIniciales;

  const [titulo,      setTitulo]      = useState(datosIniciales?.titulo      ?? "");
  const [descripcion, setDescripcion] = useState(datosIniciales?.descripcion ?? "");
  const [prioridad,   setPrioridad]   = useState<PrioridadTarea>(datosIniciales?.prioridad ?? "media");
  const [fechaLimite, setFechaLimite] = useState(
    datosIniciales?.fechaLimite ?? fechaInicial ?? ""
  );
  const [horaInicio, setHoraInicio] = useState(
    datosIniciales?.horaInicio ?? horaInicial ?? ""
  );
  const [horaFin, setHoraFin] = useState(
    datosIniciales?.horaFin ?? horaFinInicial ?? ""
  );
  const [errorHorario, setErrorHorario] = useState("");
  const [horarioTocado, setHorarioTocado] = useState(false);
  const [creadoPor,   setCreadoPor]   = useState(datosIniciales?.creadoPor   ?? "");
  const [asignadoA,   setAsignadoA]   = useState(datosIniciales?.asignadoA   ?? "");
  const [sacudiendo,  setSacudiendo]  = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [guardandoComentario, setGuardandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState("");

   const { alertaError } = useAlert();
   const { errores, camposTocados, validarCampo, marcarTocado, validarTodo, limpiarValidacion } =
    useFormValidation(esquemaDeValidacion, { titulo, descripcion, fechaLimite,prioridad });
  
  function validarHorarioActual(
    fecha = fechaLimite,
    inicio = horaInicio,
    fin = horaFin
  ): string {
    const mensaje = validarHorario(fecha, inicio, fin);
    setErrorHorario(mensaje);
    return mensaje;
  }

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();

    const formularioValido = validarTodo();
    const mensajeHorario = validarHorarioActual();
    setHorarioTocado(true);

    if (!formularioValido || mensajeHorario) {
      setSacudiendo(true);
      setTimeout(() => setSacudiendo(false), 500);
      alertaError("Revisá los campos marcados antes de continuar.", "Formulario incompleto");
      return;
    }

    alConfirmar({
      titulo:      titulo.trim(),
      descripcion: descripcion.trim(),
      prioridad,
      fechaLimite: fechaLimite || undefined,
      horaInicio: horaInicio || undefined,
      horaFin: horaFin || undefined,
      creadoPor:   creadoPor.trim() || undefined,
      asignadoA:   asignadoA.trim() || undefined,
      estado: datosIniciales?.estado ?? "pendiente"
    });
    limpiarValidacion();
    setErrorHorario("");
    setHorarioTocado(false);
  }

  function manejarCancelar() {
    limpiarValidacion();
    setErrorHorario("");
    setHorarioTocado(false);
    alCancelar();
  }


  function formatearFechaComentario(fechaIso: string): string {
    const fecha = new Date(fechaIso);

    if (Number.isNaN(fecha.getTime())) {
      return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(fecha);
  }

  async function manejarAgregarComentario() {
    const contenido = nuevoComentario.trim();

    if (!contenido) {
      setErrorComentario("Escribí un comentario antes de agregarlo.");
      return;
    }

    if (contenido.length > MAX_LONGITUD_COMENTARIO_TAREA) {
      setErrorComentario(
        `El comentario no puede superar ${MAX_LONGITUD_COMENTARIO_TAREA} caracteres.`
      );
      return;
    }

    if (!alAgregarComentario) {
      setErrorComentario("No se puede agregar el comentario en este momento.");
      return;
    }

    setGuardandoComentario(true);
    setErrorComentario("");

    try {
      await alAgregarComentario(contenido);
      setNuevoComentario("");
    } catch (error) {
      setErrorComentario(
        error instanceof Error
          ? error.message
          : "No se pudo agregar el comentario."
      );
    } finally {
      setGuardandoComentario(false);
    }
  }

  const comentarios = datosIniciales?.comentarios ?? [];
  const mostrarComentarios =
    modoEdicion && Boolean(tareaId) && Boolean(alAgregarComentario);

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
            onChange={(e) => {
              const nuevaFecha = e.target.value;
              setFechaLimite(nuevaFecha);
              if (camposTocados.fechaLimite) {
                validarCampo("fechaLimite", nuevaFecha);
              }
              if (horarioTocado) {
                validarHorarioActual(nuevaFecha, horaInicio, horaFin);
              }
            }}
            onBlur={() => marcarTocado("fechaLimite")}
          />
          {camposTocados.fechaLimite && errores.fechaLimite && (
            <p className="campo-grupo__mensaje-error" role="alert">⚠ {errores.fechaLimite}</p>
          )}
        </div>

        {/* HORARIO */}
        <div className={`campo-grupo ${
          horarioTocado && errorHorario
            ? "campo-grupo--error"
            : horarioTocado && (horaInicio || horaFin) && !errorHorario
              ? "campo-grupo--valido"
              : ""
        }`}>
          <span className="campo-grupo__etiqueta">
            Horario <span className="campo-grupo__opcional">(opcional)</span>
          </span>

          <div className="task-form__fila task-form__fila--horario">
            <div className="campo-grupo">
              <label className="campo-grupo__etiqueta" htmlFor="campo-hora-inicio">
                Hora de inicio
              </label>
              <input
                id="campo-hora-inicio"
                type="time"
                value={horaInicio}
                onChange={(e) => {
                  const nuevaHora = e.target.value;
                  setHoraInicio(nuevaHora);
                  if (horarioTocado) {
                    validarHorarioActual(fechaLimite, nuevaHora, horaFin);
                  }
                }}
                onBlur={() => {
                  setHorarioTocado(true);
                  validarHorarioActual();
                }}
              />
            </div>

            <div className="campo-grupo">
              <label className="campo-grupo__etiqueta" htmlFor="campo-hora-fin">
                Hora de fin
              </label>
              <input
                id="campo-hora-fin"
                type="time"
                value={horaFin}
                onChange={(e) => {
                  const nuevaHora = e.target.value;
                  setHoraFin(nuevaHora);
                  if (horarioTocado) {
                    validarHorarioActual(fechaLimite, horaInicio, nuevaHora);
                  }
                }}
                onBlur={() => {
                  setHorarioTocado(true);
                  validarHorarioActual();
                }}
              />
            </div>
          </div>

          <small className="task-form__horario-ayuda">
            Completá ambas horas para ubicar la tarea en la grilla Día/Semana.
          </small>

          {horarioTocado && errorHorario && (
            <p className="campo-grupo__mensaje-error" role="alert">
              ⚠ {errorHorario}
            </p>
          )}
        </div>

        {mostrarComentarios && (

          <section

            className="task-form__comentarios"

            aria-labelledby="task-form-comentarios-titulo"

          >

            <div className="task-form__comentarios-cabecera">

              <div>

                <span className="task-form__comentarios-eyebrow">

                  Conversación

                </span>

                <h3 id="task-form-comentarios-titulo">

                  Comentarios

                </h3>

              </div>

              <span

                className="task-form__comentarios-cantidad"

                aria-label={`${comentarios.length} comentario${comentarios.length === 1 ? "" : "s"}`}

              >

                {comentarios.length}

              </span>

            </div>


            {comentarios.length === 0 ? (

              <p className="task-form__comentarios-vacio">

                Todavía no hay comentarios en esta tarea.

              </p>

            ) : (

              <div className="task-form__comentarios-lista">

                {comentarios.map((comentario) => (

                  <article

                    key={comentario.id}

                    className="task-form__comentario"

                  >

                    <div className="task-form__comentario-meta">

                      <strong>{comentario.autorNombre}</strong>

                      <time dateTime={comentario.fechaCreacion}>

                        {formatearFechaComentario(comentario.fechaCreacion)}

                      </time>

                    </div>

                    <p>{comentario.texto}</p>

                  </article>

                ))}

              </div>

            )}


            <div className="task-form__comentario-nuevo">

              <div className="campo-grupo__etiqueta-fila">

                <label

                  className="campo-grupo__etiqueta"

                  htmlFor="campo-nuevo-comentario"

                >

                  Nuevo comentario

                </label>

                <span

                  className={`campo-grupo__contador ${

                    nuevoComentario.length >

                    MAX_LONGITUD_COMENTARIO_TAREA * 0.85

                      ? "campo-grupo__contador--alerta"

                      : ""

                  }`}

                >

                  {nuevoComentario.length}/{MAX_LONGITUD_COMENTARIO_TAREA}

                </span>

              </div>


              <textarea

                id="campo-nuevo-comentario"

                value={nuevoComentario}

                onChange={(e) => {

                  setNuevoComentario(e.target.value);

                  if (errorComentario) setErrorComentario("");

                }}

                placeholder="Escribí una actualización, nota o contexto..."

                maxLength={MAX_LONGITUD_COMENTARIO_TAREA}

                rows={3}

                disabled={guardandoComentario}

              />


              {errorComentario && (

                <p className="campo-grupo__mensaje-error" role="alert">

                  ⚠ {errorComentario}

                </p>

              )}


              <div className="task-form__comentario-acciones">

                <small>

                  Se guarda por separado de los cambios de la tarea.

                </small>

                <button

                  type="button"

                  className="task-form__comentario-boton"

                  onClick={() => void manejarAgregarComentario()}

                  disabled={

                    guardandoComentario || nuevoComentario.trim().length === 0

                  }

                >

                  {guardandoComentario

                    ? "Agregando..."

                    : "Agregar comentario"}

                </button>

              </div>

            </div>

          </section>

        )}


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
