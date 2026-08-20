// ============================================================
// ARCHIVO: tests/TaskCard.test.tsx
// Cobertura extrema para TaskCard
// ============================================================

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import TaskCard from "../src/components/tasks/TaskCard/TaskCard";
import { AlertProvider } from "../src/context/AlertContext";

import type { Tarea } from "../src/types/task";

describe("Suite extrema en <TaskCard />", () => {
  const tareaMock: Tarea = {
    id: "task-abc-123",
    titulo: "Asegurar cobertura",
    descripcion: "Escribir pruebas automatizadas con Vitest en Taskify",
    prioridad: "alta",
    estado: "en-progreso",
    progreso: 30,
    fechaLimite: "2026-06-30",
    fechaCreacion: "2026-06-01",
    estaEnPapelera: false,
  };

  test("1. Renderiza información básica", () => {
    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={tareaMock}
          alCambiarEstado={vi.fn()}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    expect(screen.getByText("Asegurar cobertura")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Escribir pruebas automatizadas con Vitest en Taskify"
      )
    ).toBeInTheDocument();

    expect(screen.getByText("alta")).toBeInTheDocument();
  });

  test("2. Muestra progreso automático cuando está en progreso", () => {
    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={tareaMock}
          alCambiarEstado={vi.fn()}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    expect(
      screen.getByText("Progreso automático...")
    ).toBeInTheDocument();
  });

  test("3. Botón completar dispara callback", async () => {
    const cambiarEstado = vi.fn();

    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={tareaMock}
          alCambiarEstado={cambiarEstado}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", { name: "✓" })
    );

    expect(cambiarEstado).toHaveBeenCalledWith(
      "task-abc-123",
      "completada"
    );
  });

  test("4. Timer automático incrementa progreso", () => {
    vi.useFakeTimers();
    const actualizar = vi.fn();

    try {
      render(
        <AlertProvider>
          <TaskCard
            datosDeLaTarea={tareaMock}
            alCambiarEstado={vi.fn()}
            alActualizarProgreso={actualizar}
            alMoverAPapelera={vi.fn()}
            alEditarTarea={vi.fn()}
          />
        </AlertProvider>
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(actualizar).toHaveBeenCalledWith(
        "task-abc-123",
        40
      );
    } finally {
      vi.useRealTimers();
    }
  });

  test("5. Botón eliminar dispara callback", async () => {
    const eliminar = vi.fn();

    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={tareaMock}
          alCambiarEstado={vi.fn()}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={eliminar}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", { name: "✕" })
    );

    expect(eliminar).toHaveBeenCalledWith(
      "task-abc-123"
    );
  });

  test("6. Estado completada deshabilita completar y conserva 100%", () => {
    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={{
            ...tareaMock,
            estado: "completada",
            progreso: 100,
          }}
          alCambiarEstado={vi.fn()}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    expect(
      screen.getByRole("button", { name: "✓" })
    ).toBeDisabled();

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  test("7. Editar delega la tarea al contenedor", async () => {
    const editar = vi.fn();

    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={tareaMock}
          alCambiarEstado={vi.fn()}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={editar}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /editar/i,
      })
    );

    expect(editar).toHaveBeenCalledTimes(1);
    expect(editar).toHaveBeenCalledWith(tareaMock);
  });

  test("8. TaskCard no renderiza un modal de edición propio", async () => {
    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={tareaMock}
          alCambiarEstado={vi.fn()}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /editar/i,
      })
    );

    expect(
      screen.queryByRole("heading", {
        name: /editar tarea/i,
      })
    ).not.toBeInTheDocument();
  });

  test("9. Timer automático completa la tarea al llegar a 100%", () => {
    vi.useFakeTimers();

    const actualizar = vi.fn();
    const cambiarEstado = vi.fn();

    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={{
            ...tareaMock,
            progreso: 90,
            estado: "en-progreso",
          }}
          alCambiarEstado={cambiarEstado}
          alActualizarProgreso={actualizar}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    vi.advanceTimersByTime(2000);

    expect(actualizar).toHaveBeenCalledWith(
      "task-abc-123",
      100
    );

    expect(cambiarEstado).toHaveBeenCalledWith(
      "task-abc-123",
      "completada"
    );

    vi.useRealTimers();
  });

  test("10. Renderiza creadoPor y asignadoA", () => {
    render(
      <AlertProvider>
        <TaskCard
          datosDeLaTarea={{
            ...tareaMock,
            creadoPor: "Joaquín",
            asignadoA: "María",
          }}
          alCambiarEstado={vi.fn()}
          alActualizarProgreso={vi.fn()}
          alMoverAPapelera={vi.fn()}
          alEditarTarea={vi.fn()}
        />
      </AlertProvider>
    );

    expect(
      screen.getByText("Joaquín")
    ).toBeInTheDocument();

    expect(
      screen.getByText("María")
    ).toBeInTheDocument();
  });
});