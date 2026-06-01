import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import LoginPage from "../src/pages/login and register/LoginPage";
import * as authService from "../src/services/authService";
import * as sweetAlerts from "../src/utils/sweetAlerts";

vi.mock("sweetalert2", () => {
const mockSwal = {
fire: vi.fn().mockResolvedValue({
isConfirmed: true,
value: "[recuperar@taskify.com](mailto:recuperar@taskify.com)",
}),
mixin: vi.fn().mockReturnThis(),
showValidationMessage: vi.fn(),
};

return {
default: mockSwal,
...mockSwal,
};
});

vi.mock("../src/services/authService", () => ({
iniciarSesion: vi.fn(),
iniciarSesionConGoogle: vi.fn(),
enviarEmailDeRecuperacion: vi.fn(),
obtenerMensajeDeError: vi.fn(
() => "Error simulado"
),
}));

vi.mock("../src/utils/sweetAlerts", () => ({
swalError: vi.fn().mockResolvedValue(true),
swalExito: vi.fn().mockResolvedValue(true),
}));

describe("Suite avanzada de cobertura de LoginPage", () => {
const alIniciarSesionMock = vi.fn();
const alIrARegistroMock = vi.fn();

beforeEach(() => {
vi.clearAllMocks();
});

test("1. Errores de validación inicial", async () => {
render( <LoginPage
     alIniciarSesion={alIniciarSesionMock}
     alIrARegistro={alIrARegistroMock}
   />
);

await userEvent.click(
  screen.getByRole("button", {
    name: /ingresar/i,
  })
);

expect(
  sweetAlerts.swalError
).toHaveBeenCalled();


});

test("2. Flujo exitoso de login", async () => {
vi.mocked(
authService.iniciarSesion
).mockResolvedValue({ uid: "ok" } as any);


render(
  <LoginPage
    alIniciarSesion={alIniciarSesionMock}
    alIrARegistro={alIrARegistroMock}
  />
);

await userEvent.type(
  screen.getByPlaceholderText(
    "tu@email.com"
  ),
  "user@taskify.com"
);

await userEvent.type(
  screen.getByPlaceholderText(
    "••••••••"
  ),
  "password123"
);

await userEvent.click(
  screen.getByRole("button", {
    name: /ingresar/i,
  })
);

await waitFor(() => {
  expect(
    authService.iniciarSesion
  ).toHaveBeenCalled();
});

expect(
  sweetAlerts.swalExito
).toHaveBeenCalled();


});

test("3. Recuperación de contraseña exitosa", async () => {
vi.mocked(
authService.enviarEmailDeRecuperacion
).mockResolvedValue(undefined);


render(
  <LoginPage
    alIniciarSesion={alIniciarSesionMock}
    alIrARegistro={alIrARegistroMock}
  />
);

await userEvent.click(
  screen.getByRole("button", {
    name: /olvidaste tu contraseña/i,
  })
);

await waitFor(() => {
  expect(
    authService.enviarEmailDeRecuperacion
  ).toHaveBeenCalled();
});

expect(
  sweetAlerts.swalExito
).toHaveBeenCalled();


});

test("4. Fuerza todos los bloques catch", async () => {
vi.mocked(
authService.iniciarSesion
).mockRejectedValue({
code: "auth/wrong-password",
});


vi.mocked(
  authService.iniciarSesionConGoogle
).mockRejectedValue({
  code: "auth/popup-closed-by-user",
});

vi.mocked(
  authService.enviarEmailDeRecuperacion
).mockRejectedValue({
  code: "auth/user-not-found",
});

render(
  <LoginPage
    alIniciarSesion={alIniciarSesionMock}
    alIrARegistro={alIrARegistroMock}
  />
);

await userEvent.type(
  screen.getByPlaceholderText(
    "tu@email.com"
  ),
  "error@taskify.com"
);

await userEvent.type(
  screen.getByPlaceholderText(
    "••••••••"
  ),
  "wrongpass"
);

await userEvent.click(
  screen.getByRole("button", {
    name: /ingresar/i,
  })
);

await userEvent.click(
  screen.getByRole("button", {
    name: /continuar con google/i,
  })
);

await userEvent.click(
  screen.getByRole("button", {
    name: /olvidaste tu contraseña/i,
  })
);

await waitFor(() => {
  expect(
    authService.obtenerMensajeDeError
  ).toHaveBeenCalled();
});

expect(
  sweetAlerts.swalError
).toHaveBeenCalled();


});

test("5. Permite mostrar y ocultar contraseña", async () => {
render( <LoginPage
     alIniciarSesion={alIniciarSesionMock}
     alIrARegistro={alIrARegistroMock}
   />
);


const inputPassword =
  screen.getByPlaceholderText(
    "••••••••"
  );

expect(inputPassword).toHaveAttribute(
  "type",
  "password"
);

const botones =
  screen.getAllByRole("button");

await userEvent.click(botones[1]);

expect(inputPassword).toHaveAttribute(
  "type",
  "text"
);

});
});
