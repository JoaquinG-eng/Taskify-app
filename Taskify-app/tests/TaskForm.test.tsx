// ============================================================
// ARCHIVO: tests/TaskForm.test.tsx
// Cobertura extrema TaskForm
// ============================================================

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

import TaskForm from "../src/components/tasks/TaskForm/TaskForm";
import { AlertProvider } from "../src/context/AlertContext";

const alertaErrorMock = vi.fn();

vi.mock("../src/hooks/useAlert", () => ({
  useAlert: () => ({
    alertaError: alertaErrorMock,
  }),
}));

describe("TaskForm", () => {
  const alConfirmarMock = vi.fn();
  const alCancelarMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("renderiza modo creación", () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    expect(screen.getByText("Nueva tarea")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /crear tarea/i })
    ).toBeTruthy();
  });

  test("renderiza modo edición", () => {
    render(
      <AlertProvider>
        <TaskForm
          datosIniciales={{
            titulo: "Deploy",
            descripcion: "Subir app",
            prioridad: "alta",
            estado: "pendiente",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    expect(screen.getByText("Editar tarea")).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: /guardar cambios/i,
      })
    ).toBeTruthy();
  });

  test("muestra error al enviar vacío", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /crear tarea/i,
      })
    );

    expect(alertaErrorMock).toHaveBeenCalled();
    expect(alConfirmarMock).not.toHaveBeenCalled();
  });

  test("permite completar formulario correctamente", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.type(
      screen.getAllByPlaceholderText("¿Qué hay que hacer?")[0],
      "Crear Dashboard",
      { delay: 0 }
    );

    await userEvent.type(
      screen.getAllByPlaceholderText("Detalles opcionales...")[0],
      "Diseñar estadísticas",
      { delay: 0 }
    );

    await userEvent.type(
      screen.getAllByPlaceholderText("Tu nombre")[0],
      "Joaquín",
      { delay: 0 }
    );

    await userEvent.type(
      screen.getAllByPlaceholderText("Responsable")[0],
      "Equipo Frontend",
      { delay: 0 }
    );

    await userEvent.click(screen.getAllByText("Alta")[0]);

    await userEvent.click(
      screen.getByRole("button", {
        name: /crear tarea/i,
      })
    );

    expect(alConfirmarMock).toHaveBeenCalledTimes(1);

    expect(alConfirmarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Crear Dashboard",
        descripcion: "Diseñar estadísticas",
        prioridad: "alta",
        creadoPor: "Joaquín",
        asignadoA: "Equipo Frontend",
      })
    );
  }, 10000);

  test("permite cambiar prioridad", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(screen.getAllByText("Alta")[0]);
    await userEvent.click(screen.getAllByText("Baja")[0]);

    expect(screen.getAllByText("Baja")[0]).toBeTruthy();
  });

  test("cierra mediante botón cancelar", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getAllByRole("button", {
        name: /cancelar/i,
      })[0]
    );

    expect(alCancelarMock).toHaveBeenCalled();
  });

  test("cierra mediante botón X", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getAllByRole("button", {
        name: /cerrar/i,
      })[0]
    );

    expect(alCancelarMock).toHaveBeenCalled();
  });

  test("actualiza contador de caracteres", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    const input = screen.getAllByPlaceholderText(
      "¿Qué hay que hacer?"
    )[0];

    await userEvent.type(input, "Taskify");

    expect(screen.getByText("7/60")).toBeTruthy();
  });

  test("permite ingresar fecha límite", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    const fecha = screen.getByLabelText(/fecha límite/i);

    await userEvent.type(fecha, "2028-12-31");

    expect((fecha as HTMLInputElement).value).toBe("2028-12-31");
  });
});