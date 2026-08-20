// ============================================================
// ARCHIVO: src/services/ticketService.ts
// Persistencia de tickets en Firestore.
// Cada ticket pertenece al usuario autenticado.
// ============================================================

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type {
  CambiosTicket,
  EstadoTicket,
  Ticket,
  TicketNuevo,
} from "../types/ticket";

const COLECCION = "tickets";

function normalizarFecha(valor: unknown): string {
  if (typeof valor === "string") return valor;

  if (
    valor &&
    typeof valor === "object" &&
    "toDate" in valor &&
    typeof (valor as { toDate?: unknown }).toDate === "function"
  ) {
    const fecha = (valor as { toDate: () => Date }).toDate();
    return fecha.toISOString();
  }

  return "";
}

export function suscribirTickets(
  userId: string,
  onDatos: (tickets: Ticket[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const consulta = query(
    collection(db, COLECCION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    consulta,
    (snapshot) => {
      const tickets = snapshot.docs.map((documento) => {
        const datos = documento.data();

        return {
          id: documento.id,
          userId: String(datos.userId ?? userId),
          titulo: String(datos.titulo ?? ""),
          descripcion: String(datos.descripcion ?? ""),
          estado: (datos.estado ?? "abierto") as EstadoTicket,
          prioridad: (datos.prioridad ?? "media") as Ticket["prioridad"],
          fechaCreacion: normalizarFecha(datos.fechaCreacion),
          fechaActualizacion: normalizarFecha(datos.fechaActualizacion),
        };
      });

      onDatos(tickets);
    },
    (error) => onError(new Error(error.message))
  );
}

export async function crearTicketEnFirestore(
  userId: string,
  datos: TicketNuevo
): Promise<void> {
  const marcaTemporal = serverTimestamp();

  await addDoc(collection(db, COLECCION), {
    userId,
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    prioridad: datos.prioridad,
    estado: "abierto" satisfies EstadoTicket,
    fechaCreacion: marcaTemporal,
    fechaActualizacion: marcaTemporal,
  });
}

export async function editarTicketEnFirestore(
  ticketId: string,
  cambios: CambiosTicket
): Promise<void> {
  const referencia = doc(db, COLECCION, ticketId);

  const cambiosSinUndefined = Object.fromEntries(
    Object.entries(cambios).filter(([, valor]) => valor !== undefined)
  );

  await updateDoc(referencia, {
    ...cambiosSinUndefined,
    fechaActualizacion: serverTimestamp(),
  });
}

export async function cambiarEstadoTicketEnFirestore(
  ticketId: string,
  estado: EstadoTicket
): Promise<void> {
  const referencia = doc(db, COLECCION, ticketId);

  await updateDoc(referencia, {
    estado,
    fechaActualizacion: serverTimestamp(),
  });
}
