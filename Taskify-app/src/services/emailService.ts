// ============================================================
// ARCHIVO: src/services/emailService.ts
// ============================================================

import { auth } from "../firebase/firebase";

export interface TareaResumenEmail {
  titulo: string;
  estado: string;
  prioridad: string;
  progreso: number;
}

interface RespuestaEmail {
  mensaje?: string;
  error?: string;
  detalles?: string;
}

/**
 * Conserva la firma pública existente para no obligar a modificar
 * DashboardPage. El destinatario se valida en cliente, pero el servidor
 * obtiene el email definitivo de la identidad Firebase autenticada.
 */
export async function enviarResumenDeTareas(
  destinatario: string,
  nombreUsuario: string,
  tareas: TareaResumenEmail[]
): Promise<void> {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No hay una sesión autenticada.");
  }
  if (!usuario.email) {
    throw new Error("La cuenta autenticada no tiene email asociado.");
  }

  if (
    destinatario &&
    destinatario.toLowerCase() !== usuario.email.toLowerCase()
  ) {
    throw new Error("El destinatario no coincide con la cuenta autenticada.");
  }

  const idToken = await usuario.getIdToken();

  const respuesta = await fetch("/api/sendEmail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      nombreUsuario,
      tareas: tareas.map((tarea) => ({
        titulo: tarea.titulo,
        estado: tarea.estado,
        prioridad: tarea.prioridad,
        progreso: tarea.progreso,
      })),
    }),
  });

  let datos: RespuestaEmail = {};
  try {
    datos = (await respuesta.json()) as RespuestaEmail;
  } catch {
    datos = {};
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.detalles ||
        datos.error ||
        `No se pudo enviar el email (${respuesta.status}).`
    );
  }
}
