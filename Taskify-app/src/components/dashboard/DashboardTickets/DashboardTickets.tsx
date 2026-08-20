import { useState, type FormEvent } from "react";
import type {
  CambiosTicket,
  EstadoTicket,
  PrioridadTicket,
  Ticket,
  TicketNuevo,
} from "../../../types/ticket";

import "./DashboardTickets.css";

interface PropiedadesDeDashboardTickets {
  tickets: Ticket[];
  cargandoTickets: boolean;
  errorTickets: string | null;
  crearTicket: (datos: TicketNuevo) => Promise<void>;
  editarTicket: (ticketId: string, cambios: CambiosTicket) => Promise<void>;
  cambiarEstadoTicket: (
    ticketId: string,
    estado: EstadoTicket
  ) => Promise<void>;
  textoBusqueda?: string;
}

type FiltroEstado = EstadoTicket | "todos";

const prioridadOrden: Record<PrioridadTicket, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

const estadoOrden: Record<EstadoTicket, number> = {
  abierto: 0,
  "en-progreso": 1,
  cerrado: 2,
};

function etiquetaPrioridad(prioridad: PrioridadTicket): string {
  return prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
}

function fechaLegible(valor: string): string {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function mensajeDeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operación.";
}

function normalizarBusqueda(valor: string): string {
  return valor.trim().toLocaleLowerCase("es-AR");
}

export default function DashboardTickets({
  tickets,
  cargandoTickets,
  errorTickets,
  crearTicket,
  editarTicket,
  cambiarEstadoTicket,
  textoBusqueda = "",
}: PropiedadesDeDashboardTickets) {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [ticketEnEdicion, setTicketEnEdicion] = useState<Ticket | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<PrioridadTicket>("media");
  const [guardando, setGuardando] = useState(false);
  const [ticketActualizando, setTicketActualizando] = useState<string | null>(
    null
  );
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const ticketsOrdenados = [...tickets].sort((a, b) => {
    const porEstado = estadoOrden[a.estado] - estadoOrden[b.estado];
    if (porEstado !== 0) return porEstado;

    const porPrioridad =
      prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
    if (porPrioridad !== 0) return porPrioridad;

    return b.fechaCreacion.localeCompare(a.fechaCreacion);
  });

  const textoNormalizado = normalizarBusqueda(textoBusqueda);
  const hayBusqueda = textoNormalizado !== "";

  const ticketsCoincidentes = hayBusqueda
    ? ticketsOrdenados.filter((ticket) => {
        const valores = [
          ticket.titulo,
          ticket.descripcion,
          ticket.estado,
          ticket.prioridad,
        ];

        return valores.some((valor) =>
          normalizarBusqueda(valor).includes(textoNormalizado)
        );
      })
    : ticketsOrdenados;

  const ticketsVisibles =
    filtroEstado === "todos"
      ? ticketsCoincidentes
      : ticketsCoincidentes.filter(
          (ticket) => ticket.estado === filtroEstado
        );

  const cantidadAbiertos = tickets.filter(
    (ticket) => ticket.estado === "abierto"
  ).length;
  const cantidadEnProgreso = tickets.filter(
    (ticket) => ticket.estado === "en-progreso"
  ).length;
  const cantidadCerrados = tickets.filter(
    (ticket) => ticket.estado === "cerrado"
  ).length;

  function limpiarFormulario() {
    setTicketEnEdicion(null);
    setTitulo("");
    setDescripcion("");
    setPrioridad("media");
    setErrorAccion(null);
  }

  function abrirNuevoTicket() {
    limpiarFormulario();
    setFormularioAbierto(true);
  }

  function abrirEdicion(ticket: Ticket) {
    setTicketEnEdicion(ticket);
    setTitulo(ticket.titulo);
    setDescripcion(ticket.descripcion);
    setPrioridad(ticket.prioridad);
    setErrorAccion(null);
    setFormularioAbierto(true);
  }

  function cerrarFormulario() {
    if (guardando) return;
    setFormularioAbierto(false);
    limpiarFormulario();
  }

  async function guardarTicket(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const tituloLimpio = titulo.trim();
    const descripcionLimpia = descripcion.trim();

    if (!tituloLimpio || !descripcionLimpia) {
      setErrorAccion("Completá el título y la descripción.");
      return;
    }

    const datos: TicketNuevo = {
      titulo: tituloLimpio,
      descripcion: descripcionLimpia,
      prioridad,
    };

    setGuardando(true);
    setErrorAccion(null);

    try {
      if (ticketEnEdicion) {
        await editarTicket(ticketEnEdicion.id, datos);
      } else {
        await crearTicket(datos);
      }

      setFormularioAbierto(false);
      limpiarFormulario();
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  }

  async function actualizarEstado(
    ticketId: string,
    estado: EstadoTicket
  ): Promise<void> {
    setTicketActualizando(ticketId);
    setErrorAccion(null);

    try {
      await cambiarEstadoTicket(ticketId, estado);
    } catch (error) {
      setErrorAccion(mensajeDeError(error));
    } finally {
      setTicketActualizando(null);
    }
  }

  return (
    <section className="dashboard-layout__contenido dashboard-tickets">
      <header className="dashboard-tickets__cabecera">
        <div>
          <span className="dashboard-tickets__eyebrow">Centro de soporte</span>
          <h2>Tickets</h2>
          <p>
            Registrá incidencias y seguí su estado sin salir de Taskify.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-tickets__boton-principal"
          onClick={abrirNuevoTicket}
        >
          + Nuevo ticket
        </button>
      </header>

      <div className="dashboard-tickets__resumen" aria-label="Resumen de tickets">
        <article>
          <span>Total</span>
          <strong>{tickets.length}</strong>
        </article>
        <article>
          <span>Abiertos</span>
          <strong>{cantidadAbiertos}</strong>
        </article>
        <article>
          <span>En progreso</span>
          <strong>{cantidadEnProgreso}</strong>
        </article>
        <article>
          <span>Cerrados</span>
          <strong>{cantidadCerrados}</strong>
        </article>
      </div>

      <div className="dashboard-tickets__filtros" aria-label="Filtrar tickets">
        {(
          [
            ["todos", "Todos"],
            ["abierto", "Abiertos"],
            ["en-progreso", "En progreso"],
            ["cerrado", "Cerrados"],
          ] as Array<[FiltroEstado, string]>
        ).map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            className={
              filtroEstado === valor
                ? "dashboard-tickets__filtro dashboard-tickets__filtro--activo"
                : "dashboard-tickets__filtro"
            }
            aria-pressed={filtroEstado === valor}
            onClick={() => setFiltroEstado(valor)}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {(errorTickets || errorAccion) && (
        <div className="dashboard-tickets__error" role="alert">
          {errorAccion ?? errorTickets}
        </div>
      )}

      {cargandoTickets ? (
        <div className="dashboard-tickets__estado-vacio" aria-live="polite">
          <strong>Cargando tickets...</strong>
          <span>Sincronizando con Firestore.</span>
        </div>
      ) : ticketsVisibles.length === 0 ? (
        <div className="dashboard-tickets__estado-vacio">
          <strong>
            {tickets.length === 0
              ? "Todavía no hay tickets"
              : hayBusqueda
                ? "No hay tickets que coincidan con la búsqueda"
                : "No hay tickets en este estado"}
          </strong>
          <span>
            {tickets.length === 0
              ? "Creá el primero para comenzar a registrar incidencias."
              : hayBusqueda
                ? "Probá con otro título, descripción, estado o prioridad."
                : "Probá otro filtro para ver el resto de las solicitudes."}
          </span>
        </div>
      ) : (
        <div className="dashboard-tickets__lista">
          {ticketsVisibles.map((ticket) => (
            <article
              key={ticket.id}
              className={`dashboard-tickets__ticket dashboard-tickets__ticket--${ticket.prioridad}`}
            >
              <div className="dashboard-tickets__ticket-contenido">
                <div className="dashboard-tickets__ticket-meta">
                  <span
                    className={`dashboard-tickets__prioridad dashboard-tickets__prioridad--${ticket.prioridad}`}
                  >
                    {etiquetaPrioridad(ticket.prioridad)}
                  </span>
                  <span>{fechaLegible(ticket.fechaCreacion)}</span>
                </div>

                <h3>{ticket.titulo}</h3>
                <p>{ticket.descripcion}</p>
              </div>

              <div className="dashboard-tickets__ticket-acciones">
                <label>
                  <span>Estado</span>
                  <select
                    aria-label={`Estado de ${ticket.titulo}`}
                    value={ticket.estado}
                    disabled={ticketActualizando === ticket.id}
                    onChange={(evento) =>
                      void actualizarEstado(
                        ticket.id,
                        evento.target.value as EstadoTicket
                      )
                    }
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en-progreso">En progreso</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="dashboard-tickets__boton-secundario"
                  onClick={() => abrirEdicion(ticket)}
                >
                  Editar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {formularioAbierto && (
        <div
          className="dashboard-tickets__overlay"
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              cerrarFormulario();
            }
          }}
        >
          <section
            className="dashboard-tickets__dialogo"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-form-title"
          >
            <header className="dashboard-tickets__dialogo-cabecera">
              <div>
                <span className="dashboard-tickets__eyebrow">
                  {ticketEnEdicion ? "Editar solicitud" : "Nueva solicitud"}
                </span>
                <h2 id="ticket-form-title">
                  {ticketEnEdicion ? "Editar ticket" : "Crear ticket"}
                </h2>
              </div>

              <button
                type="button"
                className="dashboard-tickets__cerrar"
                onClick={cerrarFormulario}
                aria-label="Cerrar formulario de ticket"
              >
                ×
              </button>
            </header>

            <form
              className="dashboard-tickets__formulario"
              onSubmit={guardarTicket}
            >
              <label>
                <span>Título</span>
                <input
                  value={titulo}
                  onChange={(evento) => setTitulo(evento.target.value)}
                  maxLength={120}
                  autoFocus
                  required
                  placeholder="Ej. No puedo actualizar una tarea"
                />
              </label>

              <label>
                <span>Descripción</span>
                <textarea
                  value={descripcion}
                  onChange={(evento) => setDescripcion(evento.target.value)}
                  maxLength={1000}
                  rows={6}
                  required
                  placeholder="Contá qué ocurrió y qué necesitás resolver."
                />
              </label>

              <label>
                <span>Prioridad</span>
                <select
                  value={prioridad}
                  onChange={(evento) =>
                    setPrioridad(evento.target.value as PrioridadTicket)
                  }
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </label>

              {errorAccion && (
                <div className="dashboard-tickets__error" role="alert">
                  {errorAccion}
                </div>
              )}

              <footer className="dashboard-tickets__formulario-acciones">
                <button
                  type="button"
                  className="dashboard-tickets__boton-secundario"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="dashboard-tickets__boton-principal"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : ticketEnEdicion
                      ? "Guardar cambios"
                      : "Crear ticket"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
