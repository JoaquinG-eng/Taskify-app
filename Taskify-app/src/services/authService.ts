// ============================================================
// ARCHIVO: src/services/authService.ts
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

// ============================================================
// TRADUCCIÓN DE ERRORES
// ============================================================
export function obtenerMensajeDeError(code: string): string {
  const errores: Record<string, string> = {
    "auth/email-already-in-use":  "Ya existe una cuenta con ese email.",
    "auth/invalid-email":          "El email ingresado no es válido.",
    "auth/weak-password":          "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found":         "No encontramos una cuenta con ese email.",
    "auth/wrong-password":         "La contraseña es incorrecta.",
    "auth/invalid-credential":     "Credenciales incorrectas. Verificá email y contraseña.",
    "auth/too-many-requests":      "Demasiados intentos fallidos. Intentá más tarde.",
    "auth/network-request-failed": "Sin conexión a internet. Verificá tu red.",
    "auth/popup-closed-by-user":   "Cerraste la ventana de Google antes de completar.",
    "auth/user-disabled":          "Esta cuenta fue deshabilitada.",
  };
  return errores[code] ?? "Ocurrió un error inesperado. Intentá de nuevo.";
}

// ============================================================
// REGISTRO
// ============================================================
export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string
): Promise<User> {
  const credencial = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credencial.user, { displayName: nombre });
  return credencial.user;
}

// ============================================================
// LOGIN CON EMAIL
// ============================================================
export async function iniciarSesionConEmail(
  email: string,
  password: string
): Promise<User> {
  const credencial = await signInWithEmailAndPassword(auth, email, password);
  return credencial.user;
}

export const iniciarSesion = iniciarSesionConEmail;

// ============================================================
// LOGIN CON GOOGLE
// Forzamos el selector de cuentas con prompt: "select_account"
// Así siempre muestra todas las cuentas disponibles,
// en lugar de entrar directo con la última usada.
// ============================================================
export async function iniciarSesionConGoogle(): Promise<User> {
  const proveedor = new GoogleAuthProvider();

  // Este parámetro es la clave — fuerza mostrar el selector
  proveedor.setCustomParameters({
    prompt: "select_account",
  });

  const credencial = await signInWithPopup(auth, proveedor);
  return credencial.user;
}

// ============================================================
// RECUPERAR CONTRASEÑA
// ============================================================
export async function enviarEmailDeRecuperacion(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ============================================================
// LOGOUT
// ============================================================
export async function cerrarSesion(): Promise<void> {
  await signOut(auth);
}