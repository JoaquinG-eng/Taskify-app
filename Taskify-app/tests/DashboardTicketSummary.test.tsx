import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import DashboardTicketSummary from "../src/components/dashboard/DashboardTicketSummary";

function renderResumen(
  overrides: Partial<React.ComponentProps<typeof DashboardTicketSummary>> = {}
) {
  const props: React.ComponentProps<typeof DashboardTicketSummary> = {
    totalTickets: 7,
    ticketsActivos: 3,
    ticketsAltaPrioridadActivos: 1,
    cargandoTickets: false,
    errorTickets: null,
    alAbrirTickets: vi.fn(),
    ...overrides,
  };

  render(<DashboardTicketSummary {...props} />);

  return props;
}

describe("DashboardTicketSummary B7.5B", () => {
  test("muestra activos, prioridad alta y total sin alterar las métricas de tareas", () => {
    renderResumen();

    expect(
      screen.getByRole("region", { name: /resumen de tickets de soporte/i })
    ).toBeInTheDocument();
    expect(screen.getByText("3 activos, 1 de prioridad alta.")).toBeInTheDocument();
    expect(screen.getByText("Activos")).toBeInTheDocument();
    expect(screen.getByText("Prioridad alta")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  test("prioriza el aviso de tickets de prioridad alta activos", () => {
    renderResumen({
      ticketsActivos: 2,
      ticketsAltaPrioridadActivos: 2,
    });

    expect(
      screen.getByText("2 activos, 2 de prioridad alta.")
    ).toBeInTheDocument();
  });

  test("permite abrir la sección Tickets", () => {
    const alAbrirTickets = vi.fn();
    renderResumen({ alAbrirTickets });

    fireEvent.click(screen.getByRole("button", { name: /ver tickets/i }));

    expect(alAbrirTickets).toHaveBeenCalledTimes(1);
  });

  test("durante carga o error evita presentar ceros como datos confirmados", () => {
    const { rerender } = render(
      <DashboardTicketSummary
        totalTickets={0}
        ticketsActivos={0}
        ticketsAltaPrioridadActivos={0}
        cargandoTickets
        errorTickets={null}
        alAbrirTickets={vi.fn()}
      />
    );

    expect(screen.getByText("Sincronizando el estado de soporte...")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);

    rerender(
      <DashboardTicketSummary
        totalTickets={0}
        ticketsActivos={0}
        ticketsAltaPrioridadActivos={0}
        cargandoTickets={false}
        errorTickets="Sin permisos"
        alAbrirTickets={vi.fn()}
      />
    );

    expect(
      screen.getByText("No se pudo actualizar el resumen de tickets.")
    ).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);
  });
});
