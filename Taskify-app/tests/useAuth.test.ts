// ============================================================
// ARCHIVO: tests/useAuth.test.ts (Suscripción al 100% de useAuth)
// ============================================================
import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { useAuth } from "../src/hooks/useAuth";

// Interceptamos Firebase Auth para simular el cambio de estado de sesión
vi.mock("firebase/auth", () => {
  return {
    onAuthStateChanged: vi.fn((authInstance, callback) => {
      // Simulamos que Firebase verifica la sesión y devuelve un usuario conectado ficticio
      callback({ uid: "user-ok-123", email: "auth@taskify.com" });
      // Retornamos una función espía de desuscripción limpia
      return vi.fn();
    })
  };
});

vi.mock("../src/firebase/firebase", () => ({
  auth: {}
}));

describe("Pruebas unitarias en el Hook useAuth", () => {
  test("Debe iniciar en cargando false y resolver el usuario logueado en la app", () => {
    const { result } = renderHook(() => useAuth());

    // Evaluamos que la lógica lea el estado de sesión síncronamente
    expect(result.current.cargando).toBe(false);
    expect(result.current.usuario).toBeDefined();
    expect(result.current.usuario?.email).toBe("auth@taskify.com");
  });
});
