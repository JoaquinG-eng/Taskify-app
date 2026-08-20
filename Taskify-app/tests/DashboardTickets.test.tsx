import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import DashboardTickets from "../src/components/dashboard/DashboardTickets/DashboardTickets";
import type { Ticket } from "../src/types/ticket";

const crearTicket = vi.fn().mockResolvedValue(undefined);
const editarTicket = vi.fn().mockResolvedValue(undefined);
const cambiarEstadoTicket = vi.fn().mockResolvedValue(undefined);

const ticketBase: Ticket = {
  id: "ticket-1",
  userId: "usuario-1",
  titulo: "Error crítico",
  descripcion: "La aplicación no sincroniza.",
  estado: "abierto",
  prioridad: "alta",
  fechaCreacion: "2026-08-20T12:00:00.000Z",
  fechaActualizacion: "2026-08-20T12:00:00.000Z",
};

function renderTickets(
  tickets: Ticket[] = [],
  textoBusqueda = ""
) {
  return render(
    <DashboardTickets
      tickets={tickets}
      cargandoTickets={false}
      errorTickets={null}
      crearTicket={crearTicket}
      editarTicket={editarTicket}
      cambiarEstadoTicket={cambiarEstadoTicket}
      textoBusqueda={textoBusqueda}
    />
  );
}

describe("DashboardTickets B7.5A", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("muestra el estado vacío y permite abrir el formulario", async () => {
    const user = userEvent.setup();

    renderTickets();

    expect(screen.getByText("Todavía no hay tickets")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "+ Nuevo ticket" })
    );

    expect(
      screen.getByRole("dialog", { name: "Crear ticket" })
    ).toBeInTheDocument();
  });

  test("crea un ticket con título, descripción y prioridad", async () => {
    const user = userEvent.setup();

    renderTickets();

    await user.click(
      screen.getByRole("button", { name: "+ Nuevo ticket" })
    );

    await user.type(screen.getByLabelText("Título"), "Problema de acceso");
    await user.type(
      screen.getByLabelText("Descripción"),
      "No puedo ingresar al tablero."
    );
    await user.selectOptions(screen.getByLabelText("Prioridad"), "alta");

    await user.click(
      screen.getByRole("button", { name: "Crear ticket" })
    );

    await waitFor(() => {
      expect(crearTicket).toHaveBeenCalledWith({
        titulo: "Problema de acceso",
        descripcion: "No puedo ingresar al tablero.",
        prioridad: "alta",
      });
    });
  });

  test("edita un ticket existente", async () => {
    const user = userEvent.setup();

    renderTickets([ticketBase]);

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const titulo = screen.getByLabelText("Título");
    await user.clear(titulo);
    await user.type(titulo, "Error crítico corregido");

    await user.click(
      screen.getByRole("button", { name: "Guardar cambios" })
    );

    await waitFor(() => {
      expect(editarTicket).toHaveBeenCalledWith("ticket-1", {
        titulo: "Error crítico corregido",
        descripcion: "La aplicación no sincroniza.",
        prioridad: "alta",
      });
    });
  });

  test("permite cambiar el estado del ticket", async () => {
    renderTickets([ticketBase]);

    fireEvent.change(screen.getByLabelText("Estado de Error crítico"), {
      target: { value: "cerrado" },
    });

    await waitFor(() => {
      expect(cambiarEstadoTicket).toHaveBeenCalledWith(
        "ticket-1",
        "cerrado"
      );
    });
  });

  test("filtra la lista por estado", async () => {
    const user = userEvent.setup();

    renderTickets([
      ticketBase,
      {
        ...ticketBase,
        id: "ticket-2",
        titulo: "Ticket resuelto",
        estado: "cerrado",
        prioridad: "baja",
      },
    ]);

    expect(screen.getByText("Error crítico")).toBeInTheDocument();
    expect(screen.getByText("Ticket resuelto")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrados" }));

    expect(screen.queryByText("Error crítico")).not.toBeInTheDocument();
    expect(screen.getByText("Ticket resuelto")).toBeInTheDocument();
  });

  test("aplica la búsqueda superior sobre título y descripción", () => {
    renderTickets(
      [
        ticketBase,
        {
          ...ticketBase,
          id: "ticket-2",
          titulo: "Problema visual",
          descripcion: "El modal se superpone.",
          prioridad: "media",
        },
      ],
      "sincroniza"
    );

    expect(screen.getByText("Error crítico")).toBeInTheDocument();
    expect(screen.queryByText("Problema visual")).not.toBeInTheDocument();
  });
});
