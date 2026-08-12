// ============================================================
// ARCHIVO: api/sendEmail.ts
// Gmail SMTP + Nodemailer
// ============================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as nodemailer from "nodemailer";

interface TareaResumen {
  titulo: string;
  estado: string;
  prioridad: string;
  progreso: number;
}

interface PayloadEmail {
  nombreUsuario: string;
  tareas: TareaResumen[];
}

interface FirebaseLookupResponse {
  users?: Array<{
    localId?: string;
    email?: string;
    displayName?: string;
  }>;
  error?: { message?: string };
}

const MAX_TAREAS = 500;
const MAX_TITULO = 160;
const MAX_NOMBRE = 120;

function escaparHtml(valor: unknown): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarTexto(valor: unknown, maximo: number): string {
  return String(valor ?? "").trim().slice(0, maximo);
}

function normalizarProgreso(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 0;
  return Math.max(0, Math.min(100, Math.round(numero)));
}

function normalizarTareas(tareas: unknown): TareaResumen[] {
  if (!Array.isArray(tareas)) {
    throw new Error("El campo tareas debe ser un arreglo.");
  }
  if (tareas.length > MAX_TAREAS) {
    throw new Error(`El resumen admite como máximo ${MAX_TAREAS} tareas.`);
  }

  return tareas.map((tarea) => {
    const item = (tarea ?? {}) as Partial<TareaResumen>;
    return {
      titulo: normalizarTexto(item.titulo, MAX_TITULO) || "Sin título",
      estado: normalizarTexto(item.estado, 40),
      prioridad: normalizarTexto(item.prioridad, 40),
      progreso: normalizarProgreso(item.progreso),
    };
  });
}

function obtenerBearerToken(req: VercelRequest): string {
  const authorization = req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    throw new Error("Falta el token de autenticación.");
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new Error("Token de autenticación inválido.");
  return token;
}

async function obtenerUsuarioFirebase(idToken: string): Promise<{
  uid: string;
  email: string;
  displayName?: string;
}> {
  const apiKey =
    process.env.FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY ?? "";

  if (!apiKey) {
    throw new Error(
      "FIREBASE_API_KEY/VITE_FIREBASE_API_KEY no está configurada en el servidor."
    );
  }

  const respuesta = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const datos = (await respuesta.json()) as FirebaseLookupResponse;
  const usuario = datos.users?.[0];

  if (!respuesta.ok || !usuario?.localId || !usuario.email) {
    throw new Error(datos.error?.message || "La sesión Firebase no es válida.");
  }

  return {
    uid: usuario.localId,
    email: usuario.email,
    displayName: usuario.displayName,
  };
}

function crearTransporter() {
  const usuario = (process.env.GMAIL_USER ?? "").trim();
  const password = (process.env.GMAIL_APP_PASSWORD ?? "")
    .replace(/\s+/g, "")
    .trim();

  if (!usuario || !password) {
    throw new Error("GMAIL_USER o GMAIL_APP_PASSWORD no están configuradas.");
  }

  return {
    usuario,
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: { user: usuario, pass: password },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }),
  };
}

function generarHtmlEmail(
  nombreUsuario: string,
  tareas: TareaResumen[]
): string {
  const completadas = tareas.filter((t) => t.estado === "completada").length;
  const enProgreso = tareas.filter((t) => t.estado === "en-progreso").length;
  const pendientes = tareas.filter((t) => t.estado === "pendiente").length;
  const promedioProgreso =
    tareas.length > 0
      ? Math.round(
          tareas.reduce((suma, tarea) => suma + tarea.progreso, 0) /
            tareas.length
        )
      : 0;

  const coloresPrioridad: Record<string, string> = {
    alta: "#ef4444",
    media: "#f59e0b",
    baja: "#10b981",
  };
  const coloresEstado: Record<string, string> = {
    completada: "#10b981",
    "en-progreso": "#f59e0b",
    pendiente: "#3b82f6",
  };

  const filasTabla = tareas
    .map((tarea) => {
      const titulo = escaparHtml(tarea.titulo);
      const prioridad = escaparHtml(tarea.prioridad);
      const estadoTexto =
        tarea.estado === "en-progreso"
          ? "En progreso"
          : tarea.estado === "completada"
          ? "Completada"
          : "Pendiente";
      const colorEstado = coloresEstado[tarea.estado] ?? "#666666";
      const colorPrioridad = coloresPrioridad[tarea.prioridad] ?? "#666666";

      return `
        <tr style="border-bottom:1px solid #2a2a3a;">
          <td style="padding:12px 16px;color:#e0e0f0;font-size:14px;">${titulo}</td>
          <td style="padding:12px 16px;text-align:center;">
            <span style="color:${colorEstado};font-size:13px;font-weight:600;">${escaparHtml(
        estadoTexto
      )}</span>
          </td>
          <td style="padding:12px 16px;text-align:center;">
            <span style="color:${colorPrioridad};font-size:13px;font-weight:600;text-transform:uppercase;">${prioridad}</span>
          </td>
          <td style="padding:12px 16px;text-align:center;color:#a4afc0;font-size:13px;">${tarea.progreso}%</td>
        </tr>`;
    })
    .join("");

  const estadisticas = [
    { label: "Total", value: tareas.length, color: "#8b5cf6" },
    { label: "Completadas", value: completadas, color: "#10b981" },
    { label: "En progreso", value: enProgreso, color: "#f59e0b" },
    { label: "Pendientes", value: pendientes, color: "#3b82f6" },
  ]
    .map(
      (stat) => `
        <div style="background:#13111f;border:1px solid #2a2a3a;border-top:3px solid ${stat.color};border-radius:12px;padding:16px;text-align:center;display:inline-block;width:20%;margin:1%;box-sizing:border-box;">
          <div style="font-size:24px;font-weight:800;color:#fff;">${stat.value}</div>
          <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;">${stat.label}</div>
        </div>`
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;background-color:#0a0a12;background-image:url('https://takify-app-2026.vercel.app/email/taskify-background.jpg');background-position:center top;background-size:cover;background-repeat:no-repeat;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">Resumen de tareas</h1>
      <p style="color:#888;font-size:14px;margin:0;">
        Hola <strong style="color:#c4b5fd;">${escaparHtml(
          nombreUsuario
        )}</strong>, acá está tu resumen actualizado.
      </p>
    </div>

    <div style="margin-bottom:28px;text-align:center;">${estadisticas}</div>

    <div style="background:#13111f;border:1px solid #2a2a3a;border-radius:12px;padding:20px;margin-bottom:28px;">
      <span style="color:#888;font-size:13px;">Progreso global: <strong style="color:#c4b5fd;">${promedioProgreso}%</strong></span>
    </div>

    ${
      tareas.length > 0
        ? `<div style="background:#13111f;border:1px solid #2a2a3a;border-radius:12px;overflow:hidden;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#1a1a2e;">
              <th style="padding:12px 16px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;">Tarea</th>
              <th style="padding:12px 16px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;">Estado</th>
              <th style="padding:12px 16px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;">Prioridad</th>
              <th style="padding:12px 16px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;">Progreso</th>
            </tr>
          </thead>
          <tbody>${filasTabla}</tbody>
        </table>
      </div>`
        : `<div style="background:#13111f;border:1px solid #2a2a3a;border-radius:12px;padding:40px;text-align:center;margin-bottom:28px;">
        <p style="color:#888;font-size:14px;margin:0;">No tenés tareas activas por el momento.</p>
      </div>`
    }

    <div style="text-align:center;color:#666;font-size:12px;border-top:1px solid #2a2a3a;padding-top:20px;">
      <p style="margin:0 0 4px;">Este email fue enviado desde <strong style="color:#7c5af6;">Taskify</strong></p>
      <p style="margin:0;">Taskify 2026 Organiza tu dia</p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const idToken = obtenerBearerToken(req);
    const usuarioFirebase = await obtenerUsuarioFirebase(idToken);
    const body = (req.body ?? {}) as Partial<PayloadEmail>;
    const tareas = normalizarTareas(body.tareas);
    const nombreSolicitado = normalizarTexto(body.nombreUsuario, MAX_NOMBRE);
    const nombreUsuario =
      nombreSolicitado ||
      usuarioFirebase.displayName ||
      usuarioFirebase.email.split("@")[0] ||
      "Usuario";

    const { usuario: gmailUser, transporter } = crearTransporter();

    await transporter.sendMail({
      from: `"Taskify" <${gmailUser}>`,
      to: usuarioFirebase.email,
      subject: `Taskify — Resumen de tareas de ${nombreUsuario}`,
      html: generarHtmlEmail(nombreUsuario, tareas),
      text:
        `Hola ${nombreUsuario}. ` +
        `Tenés ${tareas.length} tareas activas. ` +
        "Ingresá a Taskify para ver el detalle actualizado.",
    });

    return res.status(200).json({ mensaje: "Email enviado con éxito" });
  } catch (error: unknown) {
    console.error("TASKIFY EMAIL ERROR:", error);
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido";
    const esAuth =
      mensaje.toLowerCase().includes("token") ||
      mensaje.toLowerCase().includes("firebase") ||
      mensaje.toLowerCase().includes("sesión") ||
      mensaje.includes("INVALID_ID_TOKEN") ||
      mensaje.includes("TOKEN_EXPIRED");

    return res.status(esAuth ? 401 : 500).json({
      error: esAuth ? "No autorizado" : "No se pudo enviar el email",
      detalles: mensaje,
    });
  }
}
