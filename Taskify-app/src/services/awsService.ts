// ============================================================
// ARCHIVO: src/services/awsService.ts
// ============================================================
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Inicializamos el cliente de S3 con las variables de Vite
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

/**
 * Sube un archivo adjunto (imagen, pdf, etc.) a tu Bucket de AWS S3
 * @param archivo Objeto File nativo obtenido desde un input HTML
 * @param rutaCarpeta Carpeta destino dentro del bucket (ej: "tareas" o "avatares")
 * @returns El identificador único (Key) del archivo en el servidor
 */
export async function subirArchivoAS3(archivo: File, rutaCarpeta: string = "adjuntos"): Promise<string> {
  const extension = archivo.name.split(".").pop();
  const nombreUnico = `${rutaCarpeta}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;

  const comando = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: nombreUnico,
    Body: archivo,
    ContentType: archivo.type,
  });

  await s3Client.send(comando);
  return nombreUnico; // Retornamos la Key para guardarla en la tarea de Firebase
}

/**
 * Genera una URL temporal segura (firmada) para visualizar el archivo de forma privada
 * @param llaveDelArchivo El identificador único (Key) devuelto por la función de subida
 * @param expiracionEnSegundos Tiempo de vida de la URL (Por defecto 1 hora)
 */
export async function obtenerUrlSeguraS3(llaveDelArchivo: string, expiracionEnSegundos = 3600): Promise<string> {
  const comando = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: llaveDelArchivo,
  });

  // Genera un enlace seguro de Amazon que expira automáticamente para proteger los datos
  return await getSignedUrl(s3Client, comando, { expiresIn: expiracionEnSegundos });
}
