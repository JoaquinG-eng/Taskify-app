import "./DashboardTicketSummary.css";

type PropiedadesDeDashboardTicketSummary = {
  totalTickets: number;
  ticketsActivos: number;
  ticketsAltaPrioridadActivos: number;
  cargandoTickets: boolean;
  errorTickets: string | null;
  alAbrirTickets: () => void;
};

function valorVisible(
  valor: number,
  cargando: boolean,
  conError: boolean
): number | string {
  return cargando || conError ? "—" : valor;
}

export default function DashboardTicketSummary({
  totalTickets,
  ticketsActivos,
  ticketsAltaPrioridadActivos,
  cargandoTickets,
  errorTickets,
  alAbrirTickets,
}: PropiedadesDeDashboardTicketSummary) {
  const conError = Boolean(errorTickets);

  let descripcion = "No tenés tickets activos.";

  if (cargandoTickets) {
    descripcion = "Sincronizando el estado de soporte...";
  } else if (conError) {
    descripcion = "No se pudo actualizar el resumen de tickets.";
  } else if (ticketsActivos > 0) {
    descripcion =
      ticketsAltaPrioridadActivos > 0
        ? `${ticketsActivos} activo${ticketsActivos !== 1 ? "s" : ""}, ${ticketsAltaPrioridadActivos} de prioridad alta.`
        : `${ticketsActivos} ticket${ticketsActivos !== 1 ? "s" : ""} activo${ticketsActivos !== 1 ? "s" : ""}.`;
  }

  return (
    <section
      className="dashboard-ticket-summary"
      aria-label="Resumen de tickets de soporte"
    >
      <div className="dashboard-ticket-summary__principal">
        <div className="dashboard-ticket-summary__icono" aria-hidden="true">
          ◈
        </div>

        <div className="dashboard-ticket-summary__texto">
          <span className="dashboard-ticket-summary__eyebrow">
            Centro de soporte
          </span>
          <h2>Tickets</h2>
          <p className={conError ? "dashboard-ticket-summary__descripcion dashboard-ticket-summary__descripcion--error" : "dashboard-ticket-summary__descripcion"}>
            {descripcion}
          </p>
        </div>
      </div>

      <div
        className="dashboard-ticket-summary__metricas"
        aria-label="Métricas de tickets"
      >
        <div className="dashboard-ticket-summary__metrica">
          <strong>
            {valorVisible(ticketsActivos, cargandoTickets, conError)}
          </strong>
          <span>Activos</span>
        </div>

        <div className="dashboard-ticket-summary__metrica">
          <strong>
            {valorVisible(
              ticketsAltaPrioridadActivos,
              cargandoTickets,
              conError
            )}
          </strong>
          <span>Prioridad alta</span>
        </div>

        <div className="dashboard-ticket-summary__metrica">
          <strong>
            {valorVisible(totalTickets, cargandoTickets, conError)}
          </strong>
          <span>Total</span>
        </div>
      </div>

      <button
        type="button"
        className="dashboard-ticket-summary__accion"
        onClick={alAbrirTickets}
      >
        Ver tickets
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
