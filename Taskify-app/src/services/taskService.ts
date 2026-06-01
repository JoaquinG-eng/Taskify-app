// ============================================================
// ARCHIVO: src/services/taskService.ts
// CRUD completo de tareas en Firestore.
// Cada tarea pertenece a un usuario (userId).
// onSnapshot mantiene la UI sincronizada en tiempo real.
// ============================================================

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Tarea, TareaNueva, EstadoTarea } from "../types/task";

// Nombre de la colección en Firestore
const COLECCION = "tasks";

// ============================================================
// SUSCRIPCIÓN EN TIEMPO REAL
// Llama a onDatos cada vez que Firestore actualiza las tareas
// del usuario. Devuelve una función para cancelar la suscripción.
// ============================================================
export function suscribirTareas(
  userId: string,
  onDatos: (tareas: Tarea[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const consulta = query(
    collection(db, COLECCION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    consulta,
    (snapshot) => {
      const tareas = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      })) as Tarea[];
      onDatos(tareas);
    },
    (error) => onError(new Error(error.message))
  );
}

// ============================================================
// CREAR TAREA
// ============================================================
export async function crearTareaEnFirestore(
  userId: string,
  datosNuevos: TareaNueva
): Promise<void> {
  await addDoc(collection(db, COLECCION), {
    userId,
    titulo:        datosNuevos.titulo,
    descripcion:   datosNuevos.descripcion,
    estado:        datosNuevos.estado,
    prioridad:     datosNuevos.prioridad,
    fechaLimite:   datosNuevos.fechaLimite   ?? null,
    creadoPor:     datosNuevos.creadoPor     ?? null,
    asignadoA:     datosNuevos.asignadoA     ?? null,
    progreso:      datosNuevos.estado === "completada" ? 100 : 0,
    estaEnPapelera: false,
    fechaCreacion: serverTimestamp(),
  });
}

// ============================================================
// EDITAR TAREA
// ============================================================
export async function editarTareaEnFirestore(
  tareaId: string,
  datosEditados: Partial<TareaNueva>
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await updateDoc(referencia, { ...datosEditados });
}

// ============================================================
// CAMBIAR ESTADO
// ============================================================
export async function cambiarEstadoEnFirestore(
  tareaId: string,
  nuevoEstado: EstadoTarea,
  progresoNuevo: number
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await updateDoc(referencia, {
    estado:   nuevoEstado,
    progreso: progresoNuevo,
  });
}

// ============================================================
// ACTUALIZAR PROGRESO
// ============================================================
export async function actualizarProgresoEnFirestore(
  tareaId: string,
  progreso: number,
  estado: EstadoTarea
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await updateDoc(referencia, { progreso, estado });
}

// ============================================================
// MOVER A PAPELERA (soft delete)
// ============================================================
export async function moverAPapelaraEnFirestore(
  tareaId: string
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await updateDoc(referencia, {
    estaEnPapelera:   true,
    fechaEliminacion: new Date().toLocaleDateString("es-AR"),
  });
}

// ============================================================
// RESTAURAR DE PAPELERA
// ============================================================
export async function restaurarDePapeleraEnFirestore(
  tareaId: string
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await updateDoc(referencia, {
    estaEnPapelera:   false,
    fechaEliminacion: null,
  });
}

// ============================================================
// ELIMINAR PERMANENTEMENTE (hard delete)
// ============================================================
export async function eliminarPermanentementeEnFirestore(
  tareaId: string
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await deleteDoc(referencia);
}