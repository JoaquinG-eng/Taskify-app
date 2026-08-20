import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import DashboardCalendar from "../src/components/dashboard/DashboardCalendar/DashboardCalendar";
import type { Tarea } from "../src/types/task";

function claveLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function tareaBase(cambios: Partial<Tarea>): Tarea {
  return {
    id: "tarea-base",
    titulo: "Tarea base",
    descripcion: "Descripción suficientemente larga para la tarea de prueba.",
    estado: "pendiente",
    prioridad: "media",
    fechaCreacion: "2026-08-19",
    progreso: 0,
    estaEnPapelera: false,
    ...cambios,
  };
}

describe("DashboardCalendar B5.3A", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("separa tareas con horario y sin horario en la vista Semana", () => {
    const hoy = claveLocal(new Date());

    const { container } = render(
      <DashboardCalendar
        tareas={[
          tareaBase({
            id: "programada",
            titulo: "Reunión horaria",
            fechaLimite: hoy,
            horaInicio: "09:15",
            horaFin: "10:45",
            prioridad: "alta",
          }),
          tareaBase({
            id: "sin-hora",
            titulo: "Tarea sin horario",
            fechaLimite: hoy,
          }),
        ]}
        alCrearEnFecha={vi.fn()}
        alEditarTarea={vi.fn()}
      />
    );

    const eventoHorario = container.querySelector(
      '.dashboard-calendar__evento-horario[title^="Reunión horaria ·"]'
    );
    const tareaSinHorario = container.querySelector(
      '.dashboard-calendar__sin-horario-celda .dashboard-calendar__tarea[title^="Tarea sin horario ·"]'
    );

    expect(eventoHorario).toBeTruthy();
    expect(eventoHorario?.textContent).toContain("09:15–10:45");
    expect(tareaSinHorario).toBeTruthy();
    expect(screen.getAllByText(/sin horario/i).length).toBeGreaterThan(0);
  });

  test("la tarea horaria conserva la interacción de edición", () => {
    const hoy = claveLocal(new Date());
    const alEditarTarea = vi.fn();

    const { container } = render(
      <DashboardCalendar
        tareas={[
          tareaBase({
            id: "programada",
            titulo: "Editar desde grilla",
            fechaLimite: hoy,
            horaInicio: "13:00",
            horaFin: "14:00",
          }),
        ]}
        alCrearEnFecha={vi.fn()}
        alEditarTarea={alEditarTarea}
      />
    );

    const evento = container.querySelector(
      '.dashboard-calendar__evento-horario[title^="Editar desde grilla ·"]'
    );

    expect(evento).toBeTruthy();
    fireEvent.click(evento as Element);

    expect(alEditarTarea).toHaveBeenCalledTimes(1);
    expect(alEditarTarea).toHaveBeenCalledWith(
      expect.objectContaining({ id: "programada" })
    );
  });

  test("cambiar a Día mantiene la tarea posicionada por horario", () => {
    const hoy = claveLocal(new Date());

    const { container } = render(
      <DashboardCalendar
        tareas={[
          tareaBase({
            id: "dia",
            titulo: "Bloque del día",
            fechaLimite: hoy,
            horaInicio: "08:30",
            horaFin: "09:30",
          }),
        ]}
        alCrearEnFecha={vi.fn()}
        alEditarTarea={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Día" }));

    const eventoDia = container.querySelector(
      '.dashboard-calendar__dia-grilla .dashboard-calendar__evento-horario[title^="Bloque del día ·"]'
    );

    expect(eventoDia).toBeTruthy();
    expect(eventoDia?.textContent).toContain("08:30–09:30");
  });

  test("la vista Mes sigue siendo compacta y conserva la tarea", () => {
    const hoy = claveLocal(new Date());

    const { container } = render(
      <DashboardCalendar
        tareas={[
          tareaBase({
            id: "mes",
            titulo: "Visible en mes",
            fechaLimite: hoy,
            horaInicio: "16:00",
            horaFin: "17:00",
          }),
        ]}
        alCrearEnFecha={vi.fn()}
        alEditarTarea={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Mes" }));

    const tareaMes = container.querySelector(
      '.dashboard-calendar__mes-tareas .dashboard-calendar__tarea[title^="Visible en mes ·"]'
    );

    expect(tareaMes).toBeTruthy();
  });

  test("click en una franja de Semana precarga fecha y una hora", () => {
    const hoy = claveLocal(new Date());
    const alCrearEnFecha = vi.fn();

    const { container } = render(
      <DashboardCalendar
        tareas={[]}
        alCrearEnFecha={alCrearEnFecha}
        alEditarTarea={vi.fn()}
      />
    );

    const columnaHoy = container.querySelector(
      `[data-calendar-date="${hoy}"]`
    ) as HTMLDivElement | null;

    expect(columnaHoy).toBeTruthy();

    vi.spyOn(
      columnaHoy as HTMLDivElement,
      "getBoundingClientRect"
    ).mockReturnValue({
      x: 0,
      y: 100,
      width: 140,
      height: 1536,
      top: 100,
      right: 140,
      bottom: 1636,
      left: 0,
      toJSON: () => ({}),
    });

    fireEvent.click(columnaHoy as HTMLDivElement, {
      clientY: 100 + 14 * 64 + 20,
    });

    expect(alCrearEnFecha).toHaveBeenCalledWith(
      hoy,
      "14:00",
      "15:00"
    );
  });

  test("la franja 23:00 usa 23:59 como fin válido", () => {
    const hoy = claveLocal(new Date());
    const alCrearEnFecha = vi.fn();

    const { container } = render(
      <DashboardCalendar
        tareas={[]}
        alCrearEnFecha={alCrearEnFecha}
        alEditarTarea={vi.fn()}
      />
    );

    const columnaHoy = container.querySelector(
      `[data-calendar-date="${hoy}"]`
    ) as HTMLDivElement | null;

    expect(columnaHoy).toBeTruthy();

    vi.spyOn(
      columnaHoy as HTMLDivElement,
      "getBoundingClientRect"
    ).mockReturnValue({
      x: 0,
      y: 0,
      width: 140,
      height: 1536,
      top: 0,
      right: 140,
      bottom: 1536,
      left: 0,
      toJSON: () => ({}),
    });

    fireEvent.click(columnaHoy as HTMLDivElement, {
      clientY: 23 * 64 + 10,
    });

    expect(alCrearEnFecha).toHaveBeenCalledWith(
      hoy,
      "23:00",
      "23:59"
    );
  });

  test("Mes conserva la creación sólo por fecha", () => {
    const hoy = claveLocal(new Date());
    const alCrearEnFecha = vi.fn();

    render(
      <DashboardCalendar
        tareas={[]}
        alCrearEnFecha={alCrearEnFecha}
        alEditarTarea={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Mes" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: `Crear tarea para ${hoy}`,
      })
    );

    expect(alCrearEnFecha).toHaveBeenCalledWith(hoy);
  });
  test("posiciona automáticamente la grilla horaria cerca de la hora actual", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 19, 19, 30));

    const { container } = render(
      <DashboardCalendar
        tareas={[]}
        alCrearEnFecha={vi.fn()}
        alEditarTarea={vi.fn()}
      />
    );

    const superficie = container.querySelector(
      ".dashboard-calendar__contenido-principal"
    ) as HTMLDivElement | null;

    expect(superficie).toBeTruthy();
    expect((superficie as HTMLDivElement).scrollTop).toBeGreaterThan(
      16 * 64
    );
  });

});
