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

async function enviarPeticionResumen(
  idToken: string,
  nombreUsuario: string,
  tareas: TareaResumenEmail[]
): Promise<Response> {
  return fetch("/api/sendEmail", {
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
}

async function leerRespuesta(respuesta: Response): Promise<RespuestaEmail> {
  try {
    return (await respuesta.json()) as RespuestaEmail;
  } catch {
    return {};
  }
}

export async function enviarResumenDeTareas(
  destinatario: string,
  nombreUsuario: string,
  tareas: TareaResumenEmail[]
): Promise<void> {
  const usuario = auth.currentUser;

  if (!usuario) throw new Error("No hay una sesión autenticada.");
  if (!usuario.email) throw new Error("La cuenta autenticada no tiene email asociado.");

  if (destinatario && destinatario.toLowerCase() !== usuario.email.toLowerCase()) {
    throw new Error("El destinatario no coincide con la cuenta autenticada.");
  }

  let idToken = await usuario.getIdToken();
  let respuesta = await enviarPeticionResumen(idToken, nombreUsuario, tareas);

  if (respuesta.status === 401) {
    idToken = await usuario.getIdToken(true);
    respuesta = await enviarPeticionResumen(idToken, nombreUsuario, tareas);
  }

  const datos = await leerRespuesta(respuesta);

  if (!respuesta.ok) {
    throw new Error(
      datos.detalles || datos.error || `No se pudo enviar el email (${respuesta.status}).`
    );
  }
}
