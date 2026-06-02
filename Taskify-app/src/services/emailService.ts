import type { Tarea } from "../types/task";

interface ResultadoEnvio {
  ok: boolean;
  mensaje?: string;
  error?: string;
}

export async function enviarResumenDeTareas(
  destinatario: string,
  nombreUsuario: string,
  tareas: Tarea[]
): Promise<ResultadoEnvio> {
  const tareasActivas = tareas.filter((t) => !t.estaEnPapelera);

  const payload = {
    destinatario,
    nombreUsuario,
    tareas: tareasActivas.map((t) => ({
      titulo:    t.titulo,
      estado:    t.estado,
      prioridad: t.prioridad,
      progreso:  t.progreso,
    })),
  };

  const respuesta = await fetch("/api/sendEmail", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error ?? "Error al enviar el email");
  }

  return datos as ResultadoEnvio;
}