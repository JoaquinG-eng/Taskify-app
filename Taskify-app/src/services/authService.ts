// ============================================================
// ARCHIVO: src/services/authService.ts
// Todas las operaciones de autenticación en un solo lugar.
// Los componentes llaman a estas funciones — nunca llaman
// a Firebase directamente.
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

// ---- Errores de Firebase → mensajes legibles en español ----
function traducirError(code: string): string {
  const errores: Record<string, string> = {
    "auth/email-already-in-use":   "Ya existe una cuenta con ese email.",
    "auth/invalid-email":           "El email ingresado no es válido.",
    "auth/weak-password":           "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found":          "No encontramos una cuenta con ese email.",
    "auth/wrong-password":          "La contraseña es incorrecta.",
    "auth/invalid-credential":      "Credenciales incorrectas. Verificá email y contraseña.",
    "auth/too-many-requests":       "Demasiados intentos fallidos. Intentá más tarde.",
    "auth/network-request-failed":  "Sin conexión a internet. Verificá tu red.",
    "auth/popup-closed-by-user":    "Cerraste la ventana de Google antes de completar.",
  };
  return errores[code] ?? "Ocurrió un error inesperado. Intentá de nuevo.";
}

// ============================================================
// REGISTRO con email y password
// ============================================================
export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string
): Promise<void> {
  try {
    const credencial = await createUserWithEmailAndPassword(auth, email, password);
    // Guardamos el nombre en el perfil del usuario
    await updateProfile(credencial.user, { displayName: nombre });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code ?? "";
    throw new Error(traducirError(code));
  }
}

// ============================================================
// LOGIN con email y password
// ============================================================
export async function iniciarSesion(
  email: string,
  password: string
): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: unknown) {
    const code = (error as { code?: string }).code ?? "";
    throw new Error(traducirError(code));
  }
}

// ============================================================
// LOGIN con Google
// ============================================================
export async function iniciarSesionConGoogle(): Promise<void> {
  try {
    const proveedor = new GoogleAuthProvider();
    await signInWithPopup(auth, proveedor);
  } catch (error: unknown) {
    const code = (error as { code?: string }).code ?? "";
    throw new Error(traducirError(code));
  }
}

// ============================================================
// LOGOUT
// ============================================================
export async function cerrarSesion(): Promise<void> {
  await signOut(auth);
}