import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const sendMail = vi.fn();
const createTransport = vi.fn(() => ({ sendMail }));

vi.mock("nodemailer", () => ({ createTransport }));

function crearResponse() {
  const json = vi.fn();
  return { json, status: vi.fn().mockReturnValue({ json }), setHeader: vi.fn() };
}

describe("api/sendEmail.ts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("FIREBASE_API_KEY", "firebase-api-key");
    vi.stubEnv("GMAIL_USER", "taskify.sender@gmail.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "abcdefghijklmnop");
    sendMail.mockReset();
    sendMail.mockResolvedValue({ messageId: "test-id" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ users: [{ localId: "uid-123", email: "usuario@taskify.com", displayName: "Usuario Test" }] }),
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test("exige Firebase Bearer token", async () => {
    const { default: handler } = await import("../api/sendEmail");
    const res = crearResponse();
    await handler({ method: "POST", headers: {}, body: { tareas: [] } } as never, res as never);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("envía solamente al email de la identidad Firebase", async () => {
    const { default: handler } = await import("../api/sendEmail");
    const res = crearResponse();
    await handler({
      method: "POST",
      headers: { authorization: "Bearer firebase-id-token" },
      body: { nombreUsuario: "Usuario Test", tareas: [] },
    } as never, res as never);

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "usuario@taskify.com",
      from: '"Taskify" <taskify.sender@gmail.com>',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("devuelve 500 cuando SMTP falla", async () => {
    sendMail.mockRejectedValueOnce(new Error("SMTP unavailable"));
    const { default: handler } = await import("../api/sendEmail");
    const res = crearResponse();
    await handler({
      method: "POST",
      headers: { authorization: "Bearer firebase-id-token" },
      body: { nombreUsuario: "Usuario Test", tareas: [] },
    } as never, res as never);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
