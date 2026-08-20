/* eslint-disable react-hooks/set-state-in-effect -- El hook sincroniza la identidad con una suscripción externa de Firestore. */

import { useCallback, useEffect, useState } from "react";
import type {
  CambiosTicket,
  EstadoTicket,
  Ticket,
  TicketNuevo,
} from "../types/ticket";
import {
  cambiarEstadoTicketEnFirestore,
  crearTicketEnFirestore,
  editarTicketEnFirestore,
  suscribirTickets,
} from "../services/ticketService";

function mensajeDeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error al actualizar los tickets.";
}

export function useTickets(userId: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargandoTickets, setCargandoTickets] = useState(true);
  const [errorTickets, setErrorTickets] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTickets([]);
      setCargandoTickets(false);
      setErrorTickets(null);
      return;
    }

    setCargandoTickets(true);
    setErrorTickets(null);
    setTickets([]);

    const cancelar = suscribirTickets(
      userId,
      (datos) => {
        setTickets(datos);
        setCargandoTickets(false);
      },
      (error) => {
        setErrorTickets(error.message);
        setCargandoTickets(false);
      }
    );

    return cancelar;
  }, [userId]);

  const crearTicket = useCallback(
    async (datos: TicketNuevo): Promise<void> => {
      if (!userId) {
        throw new Error("No hay un usuario autenticado.");
      }

      try {
        await crearTicketEnFirestore(userId, datos);
      } catch (error) {
        const mensaje = mensajeDeError(error);
        setErrorTickets(mensaje);
        throw new Error(mensaje, { cause: error });
      }
    },
    [userId]
  );

  const editarTicket = useCallback(
    async (ticketId: string, cambios: CambiosTicket): Promise<void> => {
      try {
        await editarTicketEnFirestore(ticketId, cambios);
      } catch (error) {
        const mensaje = mensajeDeError(error);
        setErrorTickets(mensaje);
        throw new Error(mensaje, { cause: error });
      }
    },
    []
  );

  const cambiarEstadoTicket = useCallback(
    async (ticketId: string, estado: EstadoTicket): Promise<void> => {
      try {
        await cambiarEstadoTicketEnFirestore(ticketId, estado);
      } catch (error) {
        const mensaje = mensajeDeError(error);
        setErrorTickets(mensaje);
        throw new Error(mensaje, { cause: error });
      }
    },
    []
  );

  return {
    tickets,
    cargandoTickets,
    errorTickets,
    crearTicket,
    editarTicket,
    cambiarEstadoTicket,
  };
}
