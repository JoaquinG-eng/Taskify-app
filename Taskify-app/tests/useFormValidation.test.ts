// ============================================================
// ARCHIVO: tests/useFormValidation.test.ts (Hook Completo al 100%)
// ============================================================
import { renderHook, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { useFormValidation } from "../src/hooks/useFormValidation";

describe("Pruebas unitarias completas en el Hook useFormValidation", () => {
  
  // Definimos campos fijos para simular el comportamiento tipado estricto
  type CamposFalsos = "titulo" | "descripcion";

  const esquemaMock: Record<CamposFalsos, (valor: string) => string> = {
    titulo: (v: string) => (!v.trim() ? "El título es obligatorio." : ""),
    descripcion: (v: string) => (v.length < 5 ? "Muy corta." : ""),
  };

  const valoresInicialesMock: Record<CamposFalsos, string> = {
    titulo: "",
    descripcion: "Hola",
  };

  test("Debe inicializar los estados de error en vacío y tocados en false", () => {
    const { result } = renderHook(() =>
      useFormValidation<CamposFalsos>(esquemaMock, valoresInicialesMock)
    );

    expect(result.current.errores.titulo).toBe("");
    expect(result.current.errores.descripcion).toBe("");
    expect(result.current.camposTocados.titulo).toBe(false);
  });

  test("Debe marcar un campo como tocado y validarlo inmediatamente en el onBlur", () => {
    const { result } = renderHook(() =>
      useFormValidation<CamposFalsos>(esquemaMock, valoresInicialesMock)
    );

    act(() => {
      result.current.marcarTocado("titulo");
    });

    // Al estar el valor inicial vacío, debe inyectar el error y marcar touched como true
    expect(result.current.camposTocados.titulo).toBe(true);
    expect(result.current.errores.titulo).toBe("El título es obligatorio.");
  });

  test("Debe validar todos los campos al mismo tiempo con validarTodo()", () => {
    const { result } = renderHook(() =>
      useFormValidation<CamposFalsos>(esquemaMock, valoresInicialesMock)
    );

    let esValido = true;
    act(() => {
      esValido = result.current.validarTodo();
    });

    // Como hay errores (título vacío y descripción corta), debe retornar false
    expect(esValido).toBe(false);
    expect(result.current.camposTocados.titulo).toBe(true);
    expect(result.current.camposTocados.descripcion).toBe(true);
    expect(result.current.errores.descripcion).toBe("Muy corta.");
  });

  test("Debe resetear por completo los diccionarios de estados con limpiarValidacion()", () => {
    const { result } = renderHook(() =>
      useFormValidation<CamposFalsos>(esquemaMock, valoresInicialesMock)
    );

    // 1. Forzamos errores globales
    act(() => {
      result.current.validarTodo();
    });

    // 2. Ejecutamos la función de limpieza (líneas 100-112 que faltaban en la tabla)
    act(() => {
      result.current.limpiarValidacion();
    });

    // 3. Evaluamos el borrado absoluto de la memoria del hook
    expect(result.current.errores.titulo).toBe("");
    expect(result.current.errores.descripcion).toBe("");
    expect(result.current.camposTocados.titulo).toBe(false);
    expect(result.current.camposTocados.descripcion).toBe(false);
  });
});
