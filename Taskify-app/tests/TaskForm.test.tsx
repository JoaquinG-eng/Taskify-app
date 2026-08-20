// ============================================================
// ARCHIVO: tests/TaskForm.test.tsx
// Cobertura extrema TaskForm
// ============================================================

import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

  test("acepta una fecha inicial sin entrar en modo edición", () => {
    render(
      <AlertProvider>
        <TaskForm
          fechaInicial="2028-12-31"
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    expect(screen.getByText("Nueva tarea")).toBeTruthy();
    expect(
      (screen.getByLabelText(/fecha límite/i) as HTMLInputElement).value
    ).toBe("2028-12-31");
  });


  test("acepta fecha y horario inicial sin entrar en modo edición", () => {
    render(
      <AlertProvider>
        <TaskForm
          fechaInicial="2028-12-31"
          horaInicial="14:00"
          horaFinInicial="15:00"
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    expect(screen.getByText("Nueva tarea")).toBeTruthy();
    expect(
      (screen.getByLabelText(/fecha límite/i) as HTMLInputElement).value
    ).toBe("2028-12-31");
    expect(
      (screen.getByLabelText(/hora de inicio/i) as HTMLInputElement).value
    ).toBe("14:00");
    expect(
      (screen.getByLabelText(/hora de fin/i) as HTMLInputElement).value
    ).toBe("15:00");
  });

  test("preserva el estado existente cuando se edita una tarea", async () => {
    render(
      <AlertProvider>
        <TaskForm
          datosIniciales={{
            titulo: "Revisar calendario",
            descripcion: "Descripción suficientemente larga para validar.",
            prioridad: "media",
            estado: "completada",
            fechaLimite: "2028-12-31",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(alConfirmarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: "completada",
      })
    );
  });


  test("incluye hora de inicio y fin al guardar una tarea programada", async () => {
    render(
      <AlertProvider>
        <TaskForm
          datosIniciales={{
            titulo: "Reunión de planificación",
            descripcion: "Revisar el alcance completo de la próxima iteración.",
            prioridad: "alta",
            estado: "en-progreso",
            fechaLimite: "2028-12-31",
            horaInicio: "09:30",
            horaFin: "11:00",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    expect(
      (screen.getByLabelText(/hora de inicio/i) as HTMLInputElement).value
    ).toBe("09:30");
    expect(
      (screen.getByLabelText(/hora de fin/i) as HTMLInputElement).value
    ).toBe("11:00");

    await userEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(alConfirmarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fechaLimite: "2028-12-31",
        horaInicio: "09:30",
        horaFin: "11:00",
        estado: "en-progreso",
      })
    );
  });

  test("rechaza un horario incompleto", async () => {
    render(
      <AlertProvider>
        <TaskForm
          datosIniciales={{
            titulo: "Bloque horario incompleto",
            descripcion: "Descripción suficientemente larga para validar el formulario.",
            prioridad: "media",
            estado: "pendiente",
            fechaLimite: "2028-12-31",
            horaInicio: "10:00",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(alConfirmarMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(/completá la hora de inicio y la hora de fin/i)
    ).toBeTruthy();
  });

  test("requiere fecha cuando se define un horario", async () => {
    render(
      <AlertProvider>
        <TaskForm
          datosIniciales={{
            titulo: "Horario sin fecha",
            descripcion: "Descripción suficientemente larga para validar el formulario.",
            prioridad: "media",
            estado: "pendiente",
            horaInicio: "08:00",
            horaFin: "09:00",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    await userEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(alConfirmarMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(/primero seleccioná una fecha límite/i)
    ).toBeTruthy();
  });

  test("rechaza una hora de fin anterior o igual al inicio", async () => {
    render(
      <AlertProvider>
        <TaskForm
          datosIniciales={{
            titulo: "Validar rango horario",
            descripcion: "Descripción suficientemente larga para validar el formulario.",
            prioridad: "media",
            estado: "pendiente",
            fechaLimite: "2028-12-31",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    fireEvent.change(screen.getByLabelText(/hora de inicio/i), {
      target: { value: "15:00" },
    });
    fireEvent.change(screen.getByLabelText(/hora de fin/i), {
      target: { value: "14:00" },
    });

    await userEvent.click(
      screen.getByRole("button", { name: /guardar cambios/i })
    );

    expect(alConfirmarMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(/la hora de fin debe ser posterior/i)
    ).toBeTruthy();
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

  test("B8.3 no muestra comentarios al crear una tarea", () => {
    render(
      <AlertProvider>
        <TaskForm
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
        />
      </AlertProvider>
    );

    expect(
      screen.queryByRole("heading", { name: /comentarios/i })
    ).toBeNull();
  });

  test("B8.3 muestra comentarios existentes con autor", () => {
    const alAgregarComentario = vi.fn().mockResolvedValue({
      id: "nuevo",
      texto: "nuevo",
      autorId: "usuario-1",
      autorNombre: "Joaquín",
      fechaCreacion: "2026-08-20T14:30:00.000Z",
    });

    render(
      <AlertProvider>
        <TaskForm
          tareaId="task-comentada"
          datosIniciales={{
            titulo: "Tarea comentada",
            descripcion: "Descripción suficientemente larga para validar.",
            prioridad: "media",
            estado: "pendiente",
            comentarios: [
              {
                id: "comentario-1",
                texto: "Revisar este punto antes del cierre.",
                autorId: "usuario-1",
                autorNombre: "Joaquín",
                fechaCreacion: "2026-08-20T14:00:00.000Z",
              },
            ],
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
          alAgregarComentario={alAgregarComentario}
        />
      </AlertProvider>
    );

    expect(
      screen.getByRole("heading", { name: /comentarios/i })
    ).toBeTruthy();
    expect(screen.getByText("Revisar este punto antes del cierre.")).toBeTruthy();
    expect(screen.getByText("Joaquín")).toBeTruthy();
    expect(screen.getByLabelText("1 comentario")).toBeTruthy();
  });

  test("B8.3 agrega comentario sin disparar Guardar cambios", async () => {
    const comentarioCreado = {
      id: "comentario-nuevo",
      texto: "Nueva actualización",
      autorId: "usuario-1",
      autorNombre: "Joaquín",
      fechaCreacion: "2026-08-20T14:30:00.000Z",
    };
    const alAgregarComentario = vi.fn().mockResolvedValue(comentarioCreado);

    render(
      <AlertProvider>
        <TaskForm
          tareaId="task-comentada"
          datosIniciales={{
            titulo: "Tarea comentada",
            descripcion: "Descripción suficientemente larga para validar.",
            prioridad: "media",
            estado: "pendiente",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
          alAgregarComentario={alAgregarComentario}
        />
      </AlertProvider>
    );

    const campo = screen.getByLabelText(/nuevo comentario/i);
    await userEvent.type(campo, "  Nueva actualización  ");
    await userEvent.click(
      screen.getByRole("button", { name: /agregar comentario/i })
    );

    expect(alAgregarComentario).toHaveBeenCalledWith("Nueva actualización");
    expect(alConfirmarMock).not.toHaveBeenCalled();
    expect((campo as HTMLTextAreaElement).value).toBe("");
  });

  test("B8.3 conserva el texto y muestra error si falla el comentario", async () => {
    const alAgregarComentario = vi
      .fn()
      .mockRejectedValue(new Error("falló comentario"));

    render(
      <AlertProvider>
        <TaskForm
          tareaId="task-comentada"
          datosIniciales={{
            titulo: "Tarea comentada",
            descripcion: "Descripción suficientemente larga para validar.",
            prioridad: "media",
            estado: "pendiente",
          }}
          alConfirmar={alConfirmarMock}
          alCancelar={alCancelarMock}
          alAgregarComentario={alAgregarComentario}
        />
      </AlertProvider>
    );

    const campo = screen.getByLabelText(/nuevo comentario/i);
    await userEvent.type(campo, "No perder este texto");
    await userEvent.click(
      screen.getByRole("button", { name: /agregar comentario/i })
    );

    expect(await screen.findByText(/falló comentario/i)).toBeTruthy();
    expect((campo as HTMLTextAreaElement).value).toBe("No perder este texto");
    expect(alConfirmarMock).not.toHaveBeenCalled();
  });

});