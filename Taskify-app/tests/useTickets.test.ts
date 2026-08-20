import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../src/services/ticketService", () => ({
  suscribirTickets: vi.fn(),
  crearTicketEnFirestore: vi.fn().mockResolvedValue(undefined),
  editarTicketEnFirestore: vi.fn().mockResolvedValue(undefined),
  cambiarEstadoTicketEnFirestore: vi.fn().mockResolvedValue(undefined),
}));

import { useTickets } from "../src/hooks/useTickets";
import * as ticketService from "../src/services/ticketService";

describe("useTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("sin usuario no crea una suscripción", async () => {
    const { result } = renderHook(() => useTickets(""));

    await waitFor(() => {
      expect(result.current.cargandoTickets).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);
    expect(ticketService.suscribirTickets).not.toHaveBeenCalled();
  });

  test("recibe tickets desde la suscripción de Firestore", async () => {
    vi.mocked(ticketService.suscribirTickets).mockImplementation(
      (_userId, onDatos) => {
        onDatos([
          {
            id: "ticket-1",
            userId: "usuario-1",
            titulo: "Incidencia",
            descripcion: "Detalle",
            estado: "abierto",
            prioridad: "alta",
            fechaCreacion: "2026-08-20T12:00:00.000Z",
            fechaActualizacion: "2026-08-20T12:00:00.000Z",
          },
        ]);

        return vi.fn();
      }
    );

    const { result } = renderHook(() => useTickets("usuario-1"));

    await waitFor(() => {
      expect(result.current.cargandoTickets).toBe(false);
    });

    expect(result.current.tickets).toHaveLength(1);
    expect(result.current.tickets[0].titulo).toBe("Incidencia");
  });

  test("delega creación, edición y cambio de estado al servicio", async () => {
    vi.mocked(ticketService.suscribirTickets).mockImplementation(
      () => vi.fn()
    );

    const { result } = renderHook(() => useTickets("usuario-2"));

    await act(async () => {
      await result.current.crearTicket({
        titulo: "Nuevo ticket",
        descripcion: "Descripción",
        prioridad: "media",
      });

      await result.current.editarTicket("ticket-2", {
        titulo: "Ticket editado",
      });

      await result.current.cambiarEstadoTicket("ticket-2", "cerrado");
    });

    expect(ticketService.crearTicketEnFirestore).toHaveBeenCalledWith(
      "usuario-2",
      {
        titulo: "Nuevo ticket",
        descripcion: "Descripción",
        prioridad: "media",
      }
    );

    expect(ticketService.editarTicketEnFirestore).toHaveBeenCalledWith(
      "ticket-2",
      { titulo: "Ticket editado" }
    );

    expect(
      ticketService.cambiarEstadoTicketEnFirestore
    ).toHaveBeenCalledWith("ticket-2", "cerrado");
  });
});
