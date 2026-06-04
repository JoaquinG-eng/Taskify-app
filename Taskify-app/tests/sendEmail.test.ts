import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

type TestRequestBody = {
  destinatario?: string;
  nombreUsuario?: string;
  tareas?: Array<{ titulo: string; estado: string; prioridad: string; progreso: number }>;
};

type TestHandlerRequest = {
  method: string;
  body?: TestRequestBody;
};

type TestHandlerResponse = {
  status: ReturnType<typeof vi.fn>;
};

type MockedFunction = ReturnType<typeof vi.fn>;

vi.mock("@aws-sdk/client-ses", () => {
  return {
    SESClient: vi.fn().mockImplementation(function () {
      return { send: vi.fn().mockResolvedValue({}) };
    }),
    SendEmailCommand: vi.fn().mockImplementation(function (config) {
      return { config };
    }),
  };
});

let handler: (req: TestHandlerRequest, res: TestHandlerResponse) => Promise<void>;
let SendEmailCommand: MockedFunction;
let SESClient: MockedFunction;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

describe("api/sendEmail.ts", () => {
  beforeEach(async () => {
  vi.resetModules();

  vi.stubEnv("AWS_REGION", "us-east-1");
  vi.stubEnv("AWS_ACCESS_KEY_ID", "test-access-key");
  vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test-secret-key");
  vi.stubEnv("AWS_SES_FROM_EMAIL", "noreply@taskify.test");

  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const module = await import("../api/sendEmail");

  handler = module.default as unknown as typeof handler;

  const aws = await import("@aws-sdk/client-ses");
  SendEmailCommand = aws.SendEmailCommand as unknown as MockedFunction;
  SESClient = aws.SESClient as unknown as MockedFunction;
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

  test("debe devolver 405 si el método no es POST", async () => {
    const json = vi.fn();
    const res = { status: vi.fn().mockReturnValue({ json }) };

    await handler({ method: "GET" }, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ error: "Método no permitido" });
  });

  test("debe devolver 400 si el payload es inválido", async () => {
    const json = vi.fn();
    const res = { status: vi.fn().mockReturnValue({ json }) };

    await handler({ method: "POST", body: { destinatario: "" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Estructura de datos incompleta o inválida" });
  });

  test("debe enviar el email usando AWS SES y devolver 200", async () => {
    const json = vi.fn();
    const res = { status: vi.fn().mockReturnValue({ json }) };

    await handler(
      {
        method: "POST",
        body: {
          destinatario: "test@taskify.com",
          nombreUsuario: "Usuario Test",
          tareas: [
            { titulo: "Tarea 1", estado: "pendiente", prioridad: "alta", progreso: 0 },
          ],
        },
      },
      res
    );

    expect(SESClient).toHaveBeenCalled();
    expect(SendEmailCommand).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ mensaje: "Email enviado con éxito" });
  });

  test("debe devolver 500 si AWS SES falla", async () => {
    const json = vi.fn();
    const res = { status: vi.fn().mockReturnValue({ json }) };
    const sendMock = vi.fn().mockRejectedValue(new Error("SES unavailable"));
    SESClient.mockImplementation(function () {
      return { send: sendMock };
    });

    await handler(
      {
        method: "POST",
        body: {
          destinatario: "test@taskify.com",
          nombreUsuario: "Usuario Test",
          tareas: [
            { titulo: "Tarea 1", estado: "pendiente", prioridad: "alta", progreso: 0 },
          ],
        },
      },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Error interno al procesar", detalles: "SES unavailable" });
  });
});
