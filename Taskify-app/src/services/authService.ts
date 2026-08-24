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
  sendEmailVerification,
  EmailAuthProvider,
  linkWithCredential,
  type AuthError,
  type User,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

export function obtenerMensajeDeError(code: string): string {
  const errores: Record<string, string> = {
    "auth/email-already-in-use":
      "Ya existe una cuenta con ese email. Si la creaste con Google, ingresá con Google.",
    "auth/invalid-email": "El email ingresado no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found": "No encontramos una cuenta con ese email.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/invalid-credential": "Credenciales incorrectas. Verificá email y contraseña.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intentá más tarde.",
    "auth/network-request-failed": "Sin conexión a internet. Verificá tu red.",
    "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de completar.",
    "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permití popups para este sitio.",
    "auth/cancelled-popup-request": "Se canceló el inicio porque ya había otra ventana de Google abierta.",
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase Authentication.",
    "auth/operation-not-allowed": "Este método de inicio de sesión no está habilitado en Firebase.",
    "auth/user-disabled": "Esta cuenta fue deshabilitada.",
    "auth/email-not-verified":
      "Verificá tu correo electrónico antes de ingresar, aunque podés seguir usando la app mientras lo validás.",
    "auth/provider-already-linked": "Este método de acceso ya está vinculado a la cuenta.",
    "auth/credential-already-in-use": "Estas credenciales ya están vinculadas a otra cuenta.",
    "auth/requires-recent-login": "Por seguridad, cerrá sesión y volvé a ingresar antes de configurar la contraseña.",
    "auth/account-exists-with-different-credential":
      "Ya existe una cuenta con este email usando otro método de acceso.",
  };

  return errores[code] ?? "Ocurrió un error inesperado. Intentá de nuevo.";
}

export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string
): Promise<User> {
  const credencial = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credencial.user, { displayName: nombre });
  await sendEmailVerification(credencial.user);
  return credencial.user;
}

export async function iniciarSesionConEmail(
  email: string,
  password: string
): Promise<User> {
  const credencial = await signInWithEmailAndPassword(auth, email, password);
  return credencial.user;
}

export const iniciarSesion = iniciarSesionConEmail;

export async function iniciarSesionConGoogle(): Promise<User> {
  const proveedor = new GoogleAuthProvider();
  proveedor.setCustomParameters({ prompt: "select_account" });

  const credencial = await signInWithPopup(auth, proveedor);
  return credencial.user;
}

export function usuarioTienePassword(usuario: User): boolean {
  return usuario.providerData.some(
    (proveedor) => proveedor.providerId === "password"
  );
}

/**
 * Agrega email/password a una cuenta que ya inició sesión con Google.
 * Firebase conserva el mismo usuario y el mismo UID.
 */
export async function configurarPasswordParaUsuarioGoogle(
  password: string
): Promise<User> {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No hay una sesión autenticada.");
  }
  if (!usuario.email) {
    throw new Error("La cuenta autenticada no tiene email asociado.");
  }
  if (usuarioTienePassword(usuario)) {
    return usuario;
  }

  const credencialPassword = EmailAuthProvider.credential(
    usuario.email,
    password
  );
  const resultado = await linkWithCredential(usuario, credencialPassword);
  return resultado.user;
}

/**
 * Caso inverso: ya existía email/password y el usuario intenta Google con
 * el mismo correo. Autenticamos la cuenta existente y vinculamos Google,
 * preservando el mismo UID en lugar de crear una identidad duplicada.
 */
export async function vincularGoogleConCuentaPasswordExistente(
  errorGoogle: unknown,
  password: string
): Promise<User> {
  const errorAuth = errorGoogle as AuthError;
  const customData = errorAuth.customData as { email?: unknown } | undefined;
  const email = customData?.email;
  const credencialGoogle = GoogleAuthProvider.credentialFromError(errorAuth);

  if (typeof email !== "string" || !email || !credencialGoogle) {
    throw errorGoogle;
  }

  const loginPassword = await signInWithEmailAndPassword(auth, email, password);
  const yaTieneGoogle = loginPassword.user.providerData.some(
    (proveedor) => proveedor.providerId === "google.com"
  );

  if (!yaTieneGoogle) {
    await linkWithCredential(loginPassword.user, credencialGoogle);
  }

  return auth.currentUser ?? loginPassword.user;
}

export async function enviarEmailDeRecuperacion(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function cerrarSesion(): Promise<void> {
  await signOut(auth);
}
