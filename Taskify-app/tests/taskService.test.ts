import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("firebase/firestore", () => {
  const collection = vi.fn((db, coleccion) => ({ db, coleccion }));
  const query = vi.fn((...args) => ({ args }));
  const where = vi.fn((field, operator, value) => ({ field, operator, value }));
  const doc = vi.fn((db, coleccion, id) => ({ db, coleccion, id }));
  const onSnapshot = vi.fn();
  const addDoc = vi.fn();
  const updateDoc = vi.fn();
  const deleteDoc = vi.fn();
  const serverTimestamp = vi.fn(() => "TIMESTAMP");

  return {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
  };
});

vi.mock("../src/firebase/firebase", () => ({
  db: {},
}));

import {
  suscribirTareas,
  crearTareaEnFirestore,
  editarTareaEnFirestore,
  cambiarEstadoEnFirestore,
  actualizarProgresoEnFirestore,
  moverAPapelaraEnFirestore,
  restaurarDePapeleraEnFirestore,
  eliminarPermanentementeEnFirestore,
} from "../src/services/taskService";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

describe("taskService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("suscribirTareas transforma snapshot en tareas", () => {
    const mockOnSnapshot = vi.mocked(onSnapshot);
    const datos = [{
      id: "task-1",
      data: () => ({
        titulo: "Tarea 1",
        estado: "pendiente",
        prioridad: "alta",
        progreso: 0,
        estaEnPapelera: false,
      }),
    }];

    mockOnSnapshot.mockImplementation(
      (_consulta: unknown, onNext: any) => {
        onNext({ docs: datos });
        return vi.fn();
      }
    );

    const onDatos = vi.fn();
    const onError = vi.fn();

    const unsubscribe = suscribirTareas("usuario-1", onDatos, onError);

    expect(collection).toHaveBeenCalledWith({}, "tasks");
    expect(query).toHaveBeenCalled();
    expect(where).toHaveBeenCalledWith("userId", "==", "usuario-1");
    expect(onSnapshot).toHaveBeenCalled();
    expect(onDatos).toHaveBeenCalledWith([
      {
        id: "task-1",
        titulo: "Tarea 1",
        estado: "pendiente",
        prioridad: "alta",
        progreso: 0,
        estaEnPapelera: false,
      },
    ]);
    expect(onError).not.toHaveBeenCalled();
    expect(typeof unsubscribe).toBe("function");
  });

  test("suscribirTareas maneja errores de snapshot", () => {
  const mockOnSnapshot = vi.mocked(onSnapshot);

  mockOnSnapshot.mockImplementation((consulta, onNext, onError) => {
    onError?.({
      code: "test-error",
      message: "falló snapshot",
      name: "FirestoreError",
    } as any);

    return vi.fn();
  });

    const onDatos = vi.fn();
    const onError = vi.fn();

    suscribirTareas("usuario-2", onDatos, onError);

    expect(onDatos).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(new Error("falló snapshot"));
  });

  test("crearTareaEnFirestore agrega documento con valores esperados", async () => {
    await crearTareaEnFirestore("usuario-3", {
      titulo: "Nueva tarea",
      descripcion: "Descripción",
      estado: "pendiente",
      prioridad: "baja",
      fechaLimite: undefined,
      creadoPor: undefined,
      asignadoA: undefined,
    });

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(
      { db: {}, coleccion: "tasks" },
      expect.objectContaining({
        userId: "usuario-3",
        titulo: "Nueva tarea",
        descripcion: "Descripción",
        estado: "pendiente",
        prioridad: "baja",
        progreso: 0,
        estaEnPapelera: false,
        fechaCreacion: "TIMESTAMP",
      })
    );
    expect(serverTimestamp).toHaveBeenCalled();
  });

  test("editarTareaEnFirestore actualiza el documento correcto", async () => {
    await editarTareaEnFirestore("tarea-1", { titulo: "Editada" });

    expect(doc).toHaveBeenCalledWith({}, "tasks", "tarea-1");
    expect(updateDoc).toHaveBeenCalledWith(
      { db: {}, coleccion: "tasks", id: "tarea-1" },
      { titulo: "Editada" }
    );
  });

  test("cambiarEstadoEnFirestore actualiza estado y progreso", async () => {
    await cambiarEstadoEnFirestore("tarea-2", "completada", 100);

    expect(updateDoc).toHaveBeenCalledWith(
      { db: {}, coleccion: "tasks", id: "tarea-2" },
      { estado: "completada", progreso: 100 }
    );
  });

  test("actualizarProgresoEnFirestore actualiza progreso y estado", async () => {
    await actualizarProgresoEnFirestore("tarea-3", 50, "en-progreso");

    expect(updateDoc).toHaveBeenCalledWith(
      { db: {}, coleccion: "tasks", id: "tarea-3" },
      { progreso: 50, estado: "en-progreso" }
    );
  });

  test("moverAPapelaraEnFirestore marca la tarea como papelera", async () => {
    await moverAPapelaraEnFirestore("tarea-4");

    expect(updateDoc).toHaveBeenCalledWith(
      { db: {}, coleccion: "tasks", id: "tarea-4" },
      expect.objectContaining({
        estaEnPapelera: true,
        fechaEliminacion: expect.any(String),
      })
    );
  });

  test("restaurarDePapeleraEnFirestore restablece la tarea", async () => {
    await restaurarDePapeleraEnFirestore("tarea-5");

    expect(updateDoc).toHaveBeenCalledWith(
      { db: {}, coleccion: "tasks", id: "tarea-5" },
      { estaEnPapelera: false, fechaEliminacion: null }
    );
  });

  test("eliminarPermanentementeEnFirestore elimina el documento", async () => {
    await eliminarPermanentementeEnFirestore("tarea-6");

    expect(deleteDoc).toHaveBeenCalledWith(
      { db: {}, coleccion: "tasks", id: "tarea-6" }
    );
  });
});
