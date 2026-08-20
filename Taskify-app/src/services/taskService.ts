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
  arrayUnion,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type {
  Tarea,
  TareaNueva,
  EstadoTarea,
  ComentarioTarea,
} from "../types/task";

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
    horaInicio:    datosNuevos.horaInicio    ?? null,
    horaFin:       datosNuevos.horaFin       ?? null,
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

  /*
   * Firestore no admite undefined en updateDoc.
   *
   * TaskForm representa los opcionales vacíos como undefined.
   * Al editar, los opcionales editables se convierten a null para que
   * puedan limpiarse correctamente en Firestore.
   */
  const datosParaActualizar = {
    ...datosEditados,
    fechaLimite:
      "fechaLimite" in datosEditados
        ? datosEditados.fechaLimite ?? null
        : undefined,
    horaInicio:
      "horaInicio" in datosEditados
        ? datosEditados.horaInicio ?? null
        : undefined,
    horaFin:
      "horaFin" in datosEditados
        ? datosEditados.horaFin ?? null
        : undefined,
    creadoPor:
      "creadoPor" in datosEditados
        ? datosEditados.creadoPor ?? null
        : undefined,
    asignadoA:
      "asignadoA" in datosEditados
        ? datosEditados.asignadoA ?? null
        : undefined,
  };

  /*
   * Eliminamos cualquier undefined restante antes de updateDoc.
   * Esto preserva el comportamiento de las actualizaciones parciales.
   */
  const datosSinUndefined = Object.fromEntries(
    Object.entries(datosParaActualizar).filter(
      ([, valor]) => valor !== undefined
    )
  );

  await updateDoc(referencia, datosSinUndefined);
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
// AGREGAR COMENTARIO
// Se usa arrayUnion para que agregar un comentario sea una operación
// atómica sobre el documento de la tarea y no reemplace comentarios
// escritos por otra actualización.
// ============================================================
export async function agregarComentarioEnFirestore(
  tareaId: string,
  comentario: ComentarioTarea
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);

  await updateDoc(referencia, {
    comentarios: arrayUnion(comentario),
  });
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

export async function restaurarDePapeleraEnFirestore(
  tareaId: string
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await updateDoc(referencia, {
    estaEnPapelera:   false,
    fechaEliminacion: null,
  });
}

export async function eliminarPermanentementeEnFirestore(
  tareaId: string
): Promise<void> {
  const referencia = doc(db, COLECCION, tareaId);
  await deleteDoc(referencia);
}
