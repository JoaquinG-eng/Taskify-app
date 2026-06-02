import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("../src/services/taskService", async () => {
  const actual = await vi.importActual<typeof import("../src/services/taskService")>("../src/services/taskService");
  return {
    ...actual,
    suscribirTareas: vi.fn(),
    crearTareaEnFirestore: vi.fn().mockResolvedValue(undefined),
    editarTareaEnFirestore: vi.fn().mockResolvedValue(undefined),
    cambiarEstadoEnFirestore: vi.fn().mockResolvedValue(undefined),
    actualizarProgresoEnFirestore: vi.fn().mockResolvedValue(undefined),
    moverAPapelaraEnFirestore: vi.fn().mockResolvedValue(undefined),
    restaurarDePapeleraEnFirestore: vi.fn().mockResolvedValue(undefined),
    eliminarPermanentementeEnFirestore: vi.fn().mockResolvedValue(undefined),
  };
});

import * as taskService from "../src/services/taskService";
import { useTasks } from "../src/hooks/useTasks";

describe("useTasks hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("debe cargar actividades desde localStorage y suscribirse a Firestore", async () => {
    const usuarioId = "test-user-1";
    const storageKey = `taskify-actividades-${usuarioId}`;
    const actividadPrevia = [{ id: "a1", tipo: "tarea_creada", descripcion: "Actividad previa", hora: "12:00" }];
    localStorage.setItem(storageKey, JSON.stringify(actividadPrevia));

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos) => {
      expect(userId).toBe(usuarioId);
      onDatos([{ id: "task-1", titulo: "Tarea 1", descripcion: "Actividad inicial", estado: "pendiente", prioridad: "alta", fechaCreacion: "2026-06-02", progreso: 0, estaEnPapelera: false }]);
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.listaDeTareas.length).toBe(1);
      expect(result.current.actividades).toEqual(actividadPrevia);
    });
  });

  test("debe crear tarea y registrar actividad en el hook", async () => {
    const usuarioId = "test-user-2";

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos) => {
      onDatos([]);
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    await act(async () => {
      await result.current.crearTarea({ titulo: "Nueva tarea", descripcion: "Test", estado: "pendiente", prioridad: "media", fechaLimite: undefined, creadoPor: undefined, asignadoA: undefined });
    });

    expect(vi.mocked(taskService.crearTareaEnFirestore)).toHaveBeenCalledTimes(1);
    expect(result.current.actividades[0].descripcion).toContain("Nueva tarea");
  });

  test("debe actualizar progreso y registrar completado cuando llega al 100%", async () => {
    const usuarioId = "test-user-3";

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos) => {
      onDatos([{ id: "task-2", titulo: "Tarea completar", descripcion: "Actividad de progreso", estado: "en-progreso", prioridad: "media", fechaCreacion: "2026-06-02", progreso: 90, estaEnPapelera: false }]);
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.listaDeTareas[0].progreso).toBe(90);
    });

    await act(async () => {
      await result.current.actualizarProgreso("task-2", 100);
    });

    expect(vi.mocked(taskService.actualizarProgresoEnFirestore)).toHaveBeenCalledWith("task-2", 100, "completada");
    expect(result.current.actividades[0].descripcion).toContain("llegó al 100%");
  });

  test("debe manejar error de suscripción", async () => {
    const usuarioId = "test-user-error";

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos, onError) => {
      onError(new Error("falló suscripción"));
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.errorTareas).toBe("falló suscripción");
    });
  });

  test("debe editar una tarea y registrar la actividad", async () => {
    const usuarioId = "test-user-4";

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos) => {
      onDatos([{ id: "task-3", titulo: "Tarea 3", descripcion: "Actividad para editar", estado: "pendiente", prioridad: "media", fechaCreacion: "2026-06-02", progreso: 0, estaEnPapelera: false }]);
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    act(() => {
      result.current.editarTarea("task-3", { titulo: "Tarea 3 editada", descripcion: "Desc", estado: "pendiente", prioridad: "media", fechaLimite: undefined, creadoPor: undefined, asignadoA: undefined });
    });

    expect(vi.mocked(taskService.editarTareaEnFirestore)).toHaveBeenCalledWith("task-3", expect.objectContaining({ titulo: "Tarea 3 editada" }));
    expect(result.current.actividades[0].descripcion).toContain("Editaste \"Tarea 3 editada\"");
  });

  test("debe cambiar el estado de una tarea y registrar la actividad correcta", async () => {
    const usuarioId = "test-user-5";

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos) => {
      onDatos([{ id: "task-4", titulo: "Tarea 4", descripcion: "Actividad de estado", estado: "pendiente", prioridad: "media", fechaCreacion: "2026-06-02", progreso: 0, estaEnPapelera: false }]);
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    act(() => {
      result.current.cambiarEstadoTarea("task-4", "en-progreso");
    });

    expect(vi.mocked(taskService.cambiarEstadoEnFirestore)).toHaveBeenCalledWith("task-4", "en-progreso", 10);
    expect(result.current.actividades[0].descripcion).toContain("\"Tarea 4\" pasó a en progreso");

    act(() => {
      result.current.cambiarEstadoTarea("task-4", "completada");
    });

    expect(vi.mocked(taskService.cambiarEstadoEnFirestore)).toHaveBeenCalledWith("task-4", "completada", 100);
    expect(result.current.actividades[0].descripcion).toContain("Completaste \"Tarea 4\"");
  });

  test("debe mover a papelera, restaurar y eliminar permanentemente", async () => {
    const usuarioId = "test-user-6";

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos) => {
      onDatos([{ id: "task-5", titulo: "Tarea 5", descripcion: "Actividad de papelera", estado: "pendiente", prioridad: "media", fechaCreacion: "2026-06-02", progreso: 0, estaEnPapelera: false }]);
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    act(() => {
      result.current.moverAPapelera("task-5");
    });
    expect(vi.mocked(taskService.moverAPapelaraEnFirestore)).toHaveBeenCalledWith("task-5");
    expect(result.current.actividades[0].descripcion).toContain("fue a la papelera");

    act(() => {
      result.current.restaurarDePapelera("task-5");
    });
    expect(vi.mocked(taskService.restaurarDePapeleraEnFirestore)).toHaveBeenCalledWith("task-5");
    expect(result.current.actividades[0].descripcion).toContain("Restauraste \"Tarea 5\"");

    act(() => {
      result.current.eliminarPermanentemente("task-5");
    });
    expect(vi.mocked(taskService.eliminarPermanentementeEnFirestore)).toHaveBeenCalledWith("task-5");
    expect(result.current.actividades[0].descripcion).toContain("Eliminaste \"Tarea 5\" definitivamente");
  });

  test("debe vaciar la papelera y registrar la actividad", async () => {
    const usuarioId = "test-user-7";

    vi.mocked(taskService.suscribirTareas).mockImplementation((userId, onDatos) => {
      onDatos([
        { id: "task-6", titulo: "Tarea 6", descripcion: "Actividad en papelera 1", estado: "pendiente", prioridad: "baja", fechaCreacion: "2026-06-02", progreso: 0, estaEnPapelera: true },
        { id: "task-7", titulo: "Tarea 7", descripcion: "Actividad en papelera 2", estado: "pendiente", prioridad: "alta", fechaCreacion: "2026-06-02", progreso: 0, estaEnPapelera: true },
      ]);
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks(usuarioId));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.tareasEnPapelera.length).toBe(2);
    });

    act(() => {
      result.current.vaciarPapelera();
    });

    expect(vi.mocked(taskService.eliminarPermanentementeEnFirestore)).toHaveBeenCalledTimes(2);
    expect(result.current.actividades[0].descripcion).toContain("Vaciaste la papelera (2 tareas)");
  });
});
