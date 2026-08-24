// ============================================================
// ARCHIVO: tests/authService.test.ts (Constructor Fix)
// ============================================================
import { beforeEach, describe, test, expect, vi } from "vitest";
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { 
  registrarUsuario, 
  iniciarSesionConEmail, 
  enviarEmailDeRecuperacion, 
  iniciarSesionConGoogle,
  cerrarSesion,
  obtenerMensajeDeError 
} from "../src/services/authService";

// MOCKEAMOS EL SDK DE FIREBASE CON UNA CLASE REAL PARA EL PROVIDER
vi.mock("firebase/auth", () => {
  return {
    getAuth: vi.fn(),
    createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
      user: {
        uid: "user-123", email: "test@taskify.com", displayName: "",
        emailVerified: false, providerData: [{ providerId: "password" }]
      }
    }),
    signInWithEmailAndPassword: vi.fn().mockResolvedValue({
      user: {
        uid: "user-123", email: "test@taskify.com", displayName: "Joaquín",
        emailVerified: true, providerData: [{ providerId: "password" }]
      }
    }),
    updateProfile: vi.fn().mockResolvedValue(true),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
    sendEmailVerification: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(true),
    // CORRECCIÓN CRÍTICA: Definimos el mock usando la sintaxis de clase constructible estándar
    GoogleAuthProvider: class {
      setCustomParameters = vi.fn();
    },
    signInWithPopup: vi.fn().mockResolvedValue({
      user: { uid: "google-123", email: "google@taskify.com" }
    })
  };
});

vi.mock("../src/firebase/firebase", () => ({
  auth: {}
}));

describe("Pruebas de Integración y Lógica Completa en authService.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Debe registrar y enviar verificación sin bloquear el acceso", async () => {
    const usuario = await registrarUsuario("Joaquín", "test@taskify.com", "123456");
    expect(usuario).toBeDefined();
    expect(usuario.email).toBe("test@taskify.com");
    expect(sendEmailVerification).toHaveBeenCalledWith(usuario);
    expect(signOut).not.toHaveBeenCalled();
  });

  test("Debe iniciar sesión de forma exitosa usando Email y Contraseña", async () => {
    const usuario = await iniciarSesionConEmail("test@taskify.com", "123456");
    expect(usuario.displayName).toBe("Joaquín");
  });

  test("Debe permitir el login aunque el correo todavía no esté verificado", async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
      user: {
        uid: "unverified-123",
        email: "sinverificar@taskify.com",
        displayName: "Sin verificar",
        emailVerified: false,
        providerData: [{ providerId: "password" }]
      }
    } as never);

    await expect(
      iniciarSesionConEmail("sinverificar@taskify.com", "123456")
    ).resolves.toMatchObject({ uid: "unverified-123", email: "sinverificar@taskify.com" });

    expect(signOut).not.toHaveBeenCalled();
  });

  test("Debe procesar el login de Google forzando el selector de cuentas", async () => {
    const usuario = await iniciarSesionConGoogle();
    expect(usuario.uid).toBe("google-123");
  });

  test("Debe procesar el envío de correo para restablecer contraseñas sin errores", async () => {
    await expect(enviarEmailDeRecuperacion("test@taskify.com")).resolves.not.toThrow();
  });

  test("Debe cerrar la sesión del usuario de Firebase de forma limpia", async () => {
    await expect(cerrarSesion()).resolves.not.toThrow();
  });

  describe("Pruebas en el Traductor de Errores (Líneas 21-33)", () => {
    test("Debe traducir correctamente los códigos nativos de Firebase", () => {
      expect(obtenerMensajeDeError("auth/invalid-email")).toBe("El email ingresado no es válido.");
      expect(obtenerMensajeDeError("auth/weak-password")).toBe("La contraseña debe tener al menos 6 caracteres.");
    });
  });
});
