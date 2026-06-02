import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Tarea } from "../src/types/task";
import { enviarResumenDeTareas } from "../src/services/emailService";

describe("emailService.ts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("debe enviar el payload correcto a /api/sendEmail filtrando la papelera", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true, mensaje: "Email enviado" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const tareas: Tarea[] = [
      { id: "1", titulo: "Tarea activa", descripcion: "Descripción", estado: "pendiente", prioridad: "alta", progreso: 0, estaEnPapelera: false, fechaCreacion: "2026-06-02", fechaLimite: undefined },
      { id: "2", titulo: "Tarea papelera", descripcion: "Descripción", estado: "pendiente", prioridad: "baja", progreso: 0, estaEnPapelera: true, fechaCreacion: "2026-06-02", fechaLimite: undefined },
    ];

    const resultado = await enviarResumenDeTareas("test@taskify.com", "Usuario Test", tareas);

    expect(resultado).toEqual({ ok: true, mensaje: "Email enviado" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinatario: "test@taskify.com",
        nombreUsuario: "Usuario Test",
        tareas: [
          { titulo: "Tarea activa", estado: "pendiente", prioridad: "alta", progreso: 0 },
        ],
      }),
    });
  });

  test("debe lanzar error cuando la API responde con estado no OK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "Fallo en el envío" }),
    }));

    const tareas: Tarea[] = [
      { id: "1", titulo: "Tarea", descripcion: "Descripción", estado: "pendiente", prioridad: "media", progreso: 0, estaEnPapelera: false, fechaCreacion: "2026-06-02", fechaLimite: undefined },
    ];

    await expect(
      enviarResumenDeTareas("test@taskify.com", "Usuario Test", tareas)
    ).rejects.toThrow("Fallo en el envío");
  });
});
