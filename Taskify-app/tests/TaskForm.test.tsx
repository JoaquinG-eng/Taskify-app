// ============================================================
// ARCHIVO: tests/TaskForm.test.tsx
// Cobertura extrema TaskForm
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";

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

  test("renderiza modo creación", () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    expect(screen.getByText("Nueva tarea")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /crear tarea/i })
    ).toBeInTheDocument();
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

    expect(screen.getByText("Editar tarea")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /guardar cambios/i,
      })
    ).toBeInTheDocument();
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
      screen.getByPlaceholderText("¿Qué hay que hacer?"),
      "Crear Dashboard"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Detalles opcionales..."),
      "Diseñar estadísticas"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Tu nombre"),
      "Joaquín"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Responsable"),
      "Equipo Frontend"
    );

    await userEvent.click(screen.getByText("Alta"));

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
  });

  test("permite cambiar prioridad", async () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(screen.getByText("Alta"));
    await userEvent.click(screen.getByText("Baja"));

    expect(screen.getByText("Baja")).toBeInTheDocument();
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
      screen.getByRole("button", {
        name: /cancelar/i,
      })
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
      screen.getByRole("button", {
        name: /cerrar/i,
      })
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

    const input = screen.getByPlaceholderText(
      "¿Qué hay que hacer?"
    );

    await userEvent.type(input, "Taskify");

    expect(screen.getByText("7/60")).toBeInTheDocument();
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

    expect(fecha).toHaveValue("2028-12-31");
  });
});