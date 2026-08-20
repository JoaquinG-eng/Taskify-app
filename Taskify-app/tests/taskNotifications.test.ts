import { describe, expect, test } from "vitest";

import type { Tarea } from "../src/types/task";
import { construirNotificacionesTareas } from "../src/utils/taskNotifications";

function tarea(
  id: string,
  fechaLimite: string | undefined,
  estado: "pendiente" | "en-progreso" | "completada" = "pendiente",
  horaInicio?: string
): Tarea {
  return {
    id,
    titulo: `Tarea ${id}`,
    descripcion: "",
    prioridad: "media",
    estado,
    progreso: estado === "completada" ? 100 : 0,
    fechaLimite,
    horaInicio,
  } as Tarea;
}

describe("taskNotifications", () => {
  const ahora = new Date(2026, 7, 20, 12, 0, 0);

  test("deriva vencidas, de hoy y próximas", () => {
    const resultado = construirNotificacionesTareas(
      [
        tarea("vencida", "2026-08-19"),
        tarea("hoy", "2026-08-20", "en-progreso", "15:00"),
        tarea("proxima", "2026-08-23"),
      ],
      ahora
    );

    expect(resultado.map((item) => item.tipo)).toEqual([
      "vencida",
      "hoy",
      "proxima",
    ]);
    expect(resultado[1].detalle).toContain("15:00");
  });

  test("ignora completadas, sin fecha y fuera de 7 días", () => {
    const resultado = construirNotificacionesTareas(
      [
        tarea("completa", "2026-08-20", "completada"),
        tarea("sin-fecha", undefined),
        tarea("lejana", "2026-08-28"),
      ],
      ahora
    );

    expect(resultado).toEqual([]);
  });

  test("incluye el séptimo día", () => {
    const resultado = construirNotificacionesTareas(
      [tarea("limite", "2026-08-27")],
      ahora
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].tipo).toBe("proxima");
  });

  test("ordena por urgencia, fecha y horario", () => {
    const resultado = construirNotificacionesTareas(
      [
        tarea("hoy-tarde", "2026-08-20", "pendiente", "18:00"),
        tarea("ayer", "2026-08-19"),
        tarea("hoy-temprano", "2026-08-20", "pendiente", "09:00"),
      ],
      ahora
    );

    expect(resultado.map((item) => item.tareaId)).toEqual([
      "ayer",
      "hoy-temprano",
      "hoy-tarde",
    ]);
  });
});
