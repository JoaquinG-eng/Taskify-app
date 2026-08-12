import { beforeEach, describe, expect, test, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  currentUser: {
    email: "test@taskify.com",
    getIdToken: vi.fn(),
  },
}));

vi.mock("../src/firebase/firebase", () => ({
  auth: authMock,
}));

import { enviarResumenDeTareas } from "../src/services/emailService";

describe("emailService.ts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authMock.currentUser.getIdToken.mockReset();
    authMock.currentUser.getIdToken.mockResolvedValue("firebase-token");
  });

  test("envía el resumen autenticado con Firebase ID token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        mensaje: "Email enviado con éxito",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await enviarResumenDeTareas(
      "test@taskify.com",
      "Usuario Test",
      [
        {
          titulo: "Tarea activa",
          estado: "pendiente",
          prioridad: "alta",
          progreso: 0,
        },
      ]
    );

    expect(authMock.currentUser.getIdToken).toHaveBeenCalledWith();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/sendEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer firebase-token",
      },
      body: JSON.stringify({
        nombreUsuario: "Usuario Test",
        tareas: [
          {
            titulo: "Tarea activa",
            estado: "pendiente",
            prioridad: "alta",
            progreso: 0,
          },
        ],
      }),
    });
  });

  test("renueva el token y reintenta una sola vez ante 401", async () => {
    authMock.currentUser.getIdToken
      .mockResolvedValueOnce("token-viejo")
      .mockResolvedValueOnce("token-nuevo");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({
          error: "No autorizado",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          mensaje: "Email enviado con éxito",
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    await enviarResumenDeTareas(
      "test@taskify.com",
      "Usuario Test",
      []
    );

    expect(authMock.currentUser.getIdToken).toHaveBeenNthCalledWith(1);
    expect(authMock.currentUser.getIdToken).toHaveBeenNthCalledWith(
      2,
      true
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("no permite enviar a una identidad distinta de la autenticada", async () => {
    await expect(
      enviarResumenDeTareas(
        "otro@taskify.com",
        "Usuario Test",
        []
      )
    ).rejects.toThrow(
      "El destinatario no coincide con la cuenta autenticada."
    );
  });

  test("propaga el error de la API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          error: "No se pudo enviar el email",
          detalles: "SMTP no disponible",
        }),
      })
    );

    await expect(
      enviarResumenDeTareas(
        "test@taskify.com",
        "Usuario Test",
        []
      )
    ).rejects.toThrow("SMTP no disponible");
  });
});
