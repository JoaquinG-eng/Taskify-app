import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Topbar from "../src/components/layout/Topbar/Topbar";

describe("Topbar búsqueda superior", () => {
  test("renderiza la búsqueda controlada y propaga cambios", () => {
    const alCambiarBusqueda = vi.fn();

    render(
      <Topbar
        tituloSeccion="Dashboard"
        subtituloSeccion="Resumen"
        valorBusqueda="reunión"
        alCambiarBusqueda={alCambiarBusqueda}
      />
    );

    const input = screen.getByRole("searchbox", {
      name: /buscar tareas/i,
    }) as HTMLInputElement;

    expect(input.value).toBe("reunión");

    fireEvent.change(input, {
      target: { value: "deploy" },
    });

    expect(alCambiarBusqueda).toHaveBeenCalledWith("deploy");
  });

  test("permite personalizar la búsqueda para Tickets", () => {
    render(
      <Topbar
        tituloSeccion="Tickets"
        subtituloSeccion="Soporte"
        alCambiarBusqueda={vi.fn()}
        etiquetaBusqueda="Buscar tickets"
        placeholderBusqueda="Buscar tickets..."
      />
    );

    expect(
      screen.getByRole("searchbox", { name: /buscar tickets/i })
    ).toHaveAttribute("placeholder", "Buscar tickets...");
  });

  test("permite limpiar la búsqueda desde el Topbar", () => {
    const alCambiarBusqueda = vi.fn();

    render(
      <Topbar
        tituloSeccion="Mis tareas"
        subtituloSeccion="Resultados"
        valorBusqueda="pendiente"
        alCambiarBusqueda={alCambiarBusqueda}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /limpiar búsqueda/i })
    );

    expect(alCambiarBusqueda).toHaveBeenCalledWith("");
  });

  test("no renderiza buscador si no recibe autoridad de búsqueda", () => {
    render(
      <Topbar
        tituloSeccion="Acerca de"
        subtituloSeccion="Taskify"
      />
    );

    expect(
      screen.queryByRole("searchbox", { name: /buscar tareas/i })
    ).toBeNull();
  });

  test("muestra badge y abre el centro de notificaciones", () => {
    render(
      <Topbar
        tituloSeccion="Dashboard"
        subtituloSeccion="Resumen"
        notificaciones={[
          {
            id: "tarea:hoy:t1",
            recurso: "tarea",
            recursoId: "t1",
            titulo: "Reunión",
            tipo: "hoy",
            detalle: "Vence hoy · 20/08/2026 · 15:00",
          },
        ]}
      />
    );

    expect(screen.getByLabelText(/1 notificaciones/i)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /^notificaciones$/i })
    );

    expect(
      screen.getByRole("region", {
        name: /centro de notificaciones/i,
      })
    ).toBeTruthy();
    expect(screen.getByText("Reunión")).toBeTruthy();
  });

  test("seleccionar una notificación delega la notificación completa", () => {
    const alSeleccionarNotificacion = vi.fn();
    const notificacion = {
      id: "ticket:ticket-2",
      recurso: "ticket" as const,
      recursoId: "ticket-2",
      titulo: "Incidencia crítica",
      tipo: "ticket" as const,
      detalle: "Ticket · Abierto · Prioridad alta",
    };

    render(
      <Topbar
        tituloSeccion="Dashboard"
        subtituloSeccion="Resumen"
        alSeleccionarNotificacion={alSeleccionarNotificacion}
        notificaciones={[notificacion]}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /^notificaciones$/i })
    );
    fireEvent.click(screen.getByText("Incidencia crítica"));

    expect(alSeleccionarNotificacion).toHaveBeenCalledWith(notificacion);
  });

  test("el centro vacío muestra Todo al día", () => {
    render(
      <Topbar
        tituloSeccion="Dashboard"
        subtituloSeccion="Resumen"
        notificaciones={[]}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /^notificaciones$/i })
    );

    expect(screen.getByText("Todo al día")).toBeTruthy();
  });
});
