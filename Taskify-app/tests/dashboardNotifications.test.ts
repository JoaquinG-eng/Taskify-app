import { describe, expect, test } from "vitest";

import type { Tarea } from "../src/types/task";
import type { Ticket } from "../src/types/ticket";
import { construirNotificacionesDashboard } from "../src/utils/dashboardNotifications";

const ahora = new Date(2026, 7, 20, 12, 0, 0);

function tarea(id: string, fechaLimite: string): Tarea {
  return {
    id,
    titulo: `Tarea ${id}`,
    descripcion: "",
    estado: "pendiente",
    prioridad: "media",
    progreso: 0,
    estaEnPapelera: false,
    fechaCreacion: "",
    fechaLimite,
  };
}

function ticket(
  id: string,
  prioridad: "alta" | "media" | "baja",
  estado: "abierto" | "en-progreso" | "cerrado"
): Ticket {
  return {
    id,
    userId: "usuario-1",
    titulo: `Ticket ${id}`,
    descripcion: "",
    prioridad,
    estado,
    fechaCreacion: "2026-08-20T12:00:00.000Z",
    fechaActualizacion: "2026-08-20T12:00:00.000Z",
  };
}

describe("dashboardNotifications B7.5A", () => {
  test("combina recordatorios de tareas con tickets críticos activos", () => {
    const resultado = construirNotificacionesDashboard(
      [tarea("hoy", "2026-08-20")],
      [ticket("critico", "alta", "abierto")],
      ahora
    );

    expect(resultado.map((item) => item.recurso)).toEqual([
      "tarea",
      "ticket",
    ]);
    expect(resultado[1].detalle).toContain("Prioridad alta");
  });

  test("ignora tickets cerrados y tickets no prioritarios", () => {
    const resultado = construirNotificacionesDashboard(
      [],
      [
        ticket("cerrado", "alta", "cerrado"),
        ticket("medio", "media", "abierto"),
      ],
      ahora
    );

    expect(resultado).toEqual([]);
  });

  test("un ticket en progreso de prioridad alta sigue siendo notificable", () => {
    const resultado = construirNotificacionesDashboard(
      [],
      [ticket("activo", "alta", "en-progreso")],
      ahora
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toMatchObject({
      recurso: "ticket",
      recursoId: "activo",
      tipo: "ticket",
    });
    expect(resultado[0].detalle).toContain("En progreso");
  });
});
