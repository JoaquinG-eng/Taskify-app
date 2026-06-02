// ============================================================
// ARCHIVO: api/sendEmail.ts (Ubicación: Raíz del Proyecto)
// ============================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// ---- Cliente SES con credenciales del servidor ----
function crearClienteSES() {
  return new SESClient({
    region: process.env.AWS_REGION ?? "us-east-2",
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID     ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
}

// ---- Tipos del payload que manda el frontend ----
interface TareaResumen {
  titulo:    string;
  estado:    string;
  prioridad: string;
  progreso:  number;
}

interface PayloadEmail {
  destinatario: string;   // email del usuario autenticado
  nombreUsuario: string;
  tareas: TareaResumen[];
}

// ---- Función que genera el HTML del email ----
function generarHtmlEmail(
  nombreUsuario: string,
  tareas: TareaResumen[]
): string {
  const completadas  = tareas.filter((t) => t.estado === "completada").length;
  const enProgreso   = tareas.filter((t) => t.estado === "en-progreso").length;
  const pendientes   = tareas.filter((t) => t.estado === "pendiente").length;
  const promedioProgreso = tareas.length > 0
    ? Math.round(tareas.reduce((s, t) => s + t.progreso, 0) / tareas.length)
    : 0;

  const coloresPrioridad: Record<string, string> = {
    alta:  "#ef4444",
    media: "#f59e0b",
    baja:  "#10b981",
  };

  const coloresEstado: Record<string, string> = {
    "completada":  "#10b981",
    "en-progreso": "#f59e0b",
    "pendiente":   "#3b82f6",
  };

  // SOLUCIÓN DE INYECCIÓN: Mapeamos las filas de la tabla de forma aislada
  const filasTabla = tareas.map((tarea) => `
    <tr style="border-bottom: 1px solid #2a2a3a;">
      <td style="padding: 12px 16px; color: #e0e0f0; font-size: 14px;">${tarea.titulo}</td>
      <td style="padding: 12px 16px; text-align: center;">
        <span style="
          background: ${coloresEstado[tarea.estado] ?? "#666"}22;
          color: ${coloresEstado[tarea.estado] ?? "#666"};
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid ${coloresEstado[tarea.estado] ?? "#666"}44;
        ">${tarea.estado === "en-progreso" ? "En progreso" : tarea.estado === "completada" ? "Completada" : "Pendiente"}</span>
      </td>
      <td style="padding: 12px 16px; text-align: center;">
        <span style="color: ${coloresPrioridad[tarea.prioridad] ?? "#666"}; font-size: 13px; font-weight: 600; text-transform: uppercase;">
          ${tarea.prioridad}
        </span>
      </td>
      <td style="padding: 12px 16px; text-align: center;">
        <span style="color: #888; font-size: 11px; display: block;">${tarea.progreso}%</span>
      </td>
    </tr>
  `).join("");

  // SOLUCIÓN DE INYECCIÓN: Mapeamos los bloques estáticos fijos
  const bloquesEstadisticas = [
    { label: "Total",       value: tareas.length, color: "#8b5cf6" },
    { label: "Completadas", value: completadas,   color: "#10b981" },
    { label: "En progreso", value: enProgreso,    color: "#f59e0b" },
    { label: "Pendientes",  value: pendientes,    color: "#3b82f6" },
  ].map((stat) => `
    <div style="
      background: #13111f;
      border: 1px solid #2a2a3a;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      border-top: 3px solid ${stat.color};
      display: inline-block;
      width: 20%;
      margin: 1%;
    ">
      <div style="font-size: 24px; font-weight: 800; color: #ffffff;">${stat.value}</div>
      <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">${stat.label}</div>
    </div>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #0a0a12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
        Resumen de tareas
      </h1>
      <p style="color: #888; font-size: 14px; margin: 0;">
        Hola <strong style="color: #c4b5fd;">${nombreUsuario}</strong>, acá está tu resumen actualizado.
      </p>
    </div>

    <!-- Stats -->
    <div style="margin-bottom: 28px; text-align: center;">
      ${bloquesEstadisticas}
    </div>

    <!-- Progreso global -->
    <div style="background: #13111f; border: 1px solid #2a2a3a; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #888; font-size: 13px;">Progreso global: <strong style="color: #c4b5fd;">${promedioProgreso}%</strong></span>
      </div>
    </div>

    <!-- Tabla de tareas -->
    ${tareas.length > 0 ? `
    <div style="background: #13111f; border: 1px solid #2a2a3a; border-radius: 12px; overflow: hidden; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #1a1a2e;">
            <th style="padding: 12px 16px; text-align: left; color: #666; font-size: 11px; text-transform: uppercase;">Tarea</th>
            <th style="padding: 12px 16px; text-align: center; color: #666; font-size: 11px; text-transform: uppercase;">Estado</th>
            <th style="padding: 12px 16px; text-align: center; color: #666; font-size: 11px; text-transform: uppercase;">Prioridad</th>
            <th style="padding: 12px 16px; text-align: center; color: #666; font-size: 11px; text-transform: uppercase;">Progreso</th>
          </tr>
        </thead>
        <tbody>${filasTabla}</tbody>
      </table>
    </div>
    ` : `
    <div style="background: #13111f; border: 1px solid #2a2a3a; border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 28px;">
      <p style="color: #666; font-size: 14px; margin: 0;">No tenés tareas activas por el momento.</p>
    </div>
    `}

    <!-- Footer -->
    <div style="text-align: center; color: #444; font-size: 12px; border-top: 1px solid #2a2a3a; padding-top: 20px;">
      <p style="margin: 0 0 4px;">Este email fue enviado desde <strong style="color: #7c5af6;">Taskify</strong></p>
      <p style="margin: 0;">Gestor de tareas — Proyecto Integrador 4</p>
    </div>

  </div>
</body>
</html>
  `;
}

// ============================================================
// HANDLER PRINCIPAL ASÍNCRONO
// ============================================================
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { destinatario, nombreUsuario, tareas } = req.body as PayloadEmail;

    if (!destinatario || !nombreUsuario || !Array.isArray(tareas)) {
      return res.status(400).json({ error: "Estructura de datos incompleta o inválida" });
    }

    const htmlContenido = generarHtmlEmail(nombreUsuario, tareas);

    const comandoEmail = new SendEmailCommand({
      Destination: {
        ToAddresses: [destinatario],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlContenido,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Taskify — Resumen de Tareas de ${nombreUsuario}`,
        },
      },

      Source: "joamengancho@gmail.com", 
    });

    const clienteSES = crearClienteSES();
    await clienteSES.send(comandoEmail);

    // RETORNO DE SEGURIDAD: Envía explícitamente el JSON para cerrar el búfer de red
    return res.status(200).json({ mensaje: "Email enviado con éxito" });

  } catch (error: unknown) {
    console.error("Error crítico:", error);
    return res.status(500).json({ 
      error: "Error interno al procesar", 
      detalles: (error as Error).message 
    });
  }
}
