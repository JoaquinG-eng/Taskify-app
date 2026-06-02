import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

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
  return nombreUnico;
}

export async function obtenerUrlSeguraS3(llaveDelArchivo: string, expiracionEnSegundos = 3600): Promise<string> {
  const comando = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: llaveDelArchivo,
  });

  return await getSignedUrl(s3Client, comando, { expiresIn: expiracionEnSegundos });
}
