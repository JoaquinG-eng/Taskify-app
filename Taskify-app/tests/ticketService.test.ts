import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn().mockResolvedValue(undefined),
  collection: vi.fn((_db: unknown, nombre: string) => ({ nombre })),
  doc: vi.fn((_db: unknown, coleccion: string, id: string) => ({
    coleccion,
    id,
  })),
  onSnapshot: vi.fn(),
  query: vi.fn((...args: unknown[]) => ({ args })),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  where: vi.fn((campo: string, operador: string, valor: string) => ({
    campo,
    operador,
    valor,
  })),
}));

vi.mock("../src/firebase/firebase", () => ({
  db: {},
}));

import {
  cambiarEstadoTicketEnFirestore,
  crearTicketEnFirestore,
  editarTicketEnFirestore,
  suscribirTickets,
} from "../src/services/ticketService";
import {
  addDoc,
  collection,
  onSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";

describe("ticketService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("suscribe únicamente a los tickets del usuario", () => {
    const cancelar = vi.fn();

    vi.mocked(onSnapshot).mockImplementationOnce(
      ((_consulta: unknown, onDatos: (snapshot: unknown) => void) => {
        onDatos({
          docs: [
            {
              id: "ticket-1",
              data: () => ({
                userId: "usuario-1",
                titulo: "Error al iniciar",
                descripcion: "No puedo ingresar",
                estado: "abierto",
                prioridad: "alta",
                fechaCreacion: {
                  toDate: () => new Date("2026-08-20T12:00:00.000Z"),
                },
                fechaActualizacion: {
                  toDate: () => new Date("2026-08-20T12:30:00.000Z"),
                },
              }),
            },
          ],
        });

        return cancelar;
      }) as typeof onSnapshot
    );

    const onDatos = vi.fn();

    const resultado = suscribirTickets(
      "usuario-1",
      onDatos,
      vi.fn()
    );

    expect(collection).toHaveBeenCalledWith({}, "tickets");
    expect(where).toHaveBeenCalledWith("userId", "==", "usuario-1");
    expect(onDatos).toHaveBeenCalledWith([
      {
        id: "ticket-1",
        userId: "usuario-1",
        titulo: "Error al iniciar",
        descripcion: "No puedo ingresar",
        estado: "abierto",
        prioridad: "alta",
        fechaCreacion: "2026-08-20T12:00:00.000Z",
        fechaActualizacion: "2026-08-20T12:30:00.000Z",
      },
    ]);
    expect(resultado).toBe(cancelar);
  });

  test("crea un ticket abierto y asociado al usuario", async () => {
    await crearTicketEnFirestore("usuario-2", {
      titulo: "Problema de sincronización",
      descripcion: "La tarea no aparece",
      prioridad: "media",
    });

    expect(addDoc).toHaveBeenCalledWith(
      { nombre: "tickets" },
      {
        userId: "usuario-2",
        titulo: "Problema de sincronización",
        descripcion: "La tarea no aparece",
        prioridad: "media",
        estado: "abierto",
        fechaCreacion: "SERVER_TIMESTAMP",
        fechaActualizacion: "SERVER_TIMESTAMP",
      }
    );
  });

  test("edita únicamente los campos enviados y actualiza la marca temporal", async () => {
    await editarTicketEnFirestore("ticket-2", {
      titulo: "Título corregido",
      prioridad: "baja",
    });

    expect(updateDoc).toHaveBeenCalledWith(
      { coleccion: "tickets", id: "ticket-2" },
      {
        titulo: "Título corregido",
        prioridad: "baja",
        fechaActualizacion: "SERVER_TIMESTAMP",
      }
    );
  });

  test("cambia el estado del ticket", async () => {
    await cambiarEstadoTicketEnFirestore("ticket-3", "cerrado");

    expect(updateDoc).toHaveBeenCalledWith(
      { coleccion: "tickets", id: "ticket-3" },
      {
        estado: "cerrado",
        fechaActualizacion: "SERVER_TIMESTAMP",
      }
    );
  });
});
