// ============================================================
// ARCHIVO: tests/validaciones.test.ts
// ============================================================
import { describe, test, expect } from "vitest";
import { 
  validarTitulo, 
  validarDescripcion, 
  validarFechaLimite, 
  validarSeleccion,
  hayErroresEnElFormulario 
} from "../src/utils/validaciones";

describe("Pruebas unitarias de cobertura máxima en validaciones.ts", () => {
  test("Debe validar el Título y sus límites (Líneas 19, 23)", () => {
    expect(validarTitulo("   ")).toBe("El título es obligatorio.");
    expect(validarTitulo("Ok")).toBe("El título debe tener al menos 3 caracteres.");
    expect(validarTitulo("a".repeat(65))).toBe("El título no puede superar los 60 caracteres.");
    expect(validarTitulo("Título Válido")).toBe("");
  });

  test("Debe validar la Descripción (Línea 35)", () => {
    expect(validarDescripcion("a".repeat(1005))).toBe("La descripción no puede superar los 1000 caracteres.");
    expect(validarDescripcion("Corta")).toBe("La descripción debe tener al menos 20 caracteres.");
    expect(validarDescripcion("Esta descripción tiene más de veinte caracteres.")).toBe("");
  });

  test("Debe validar la Fecha Límite y sus errores de parseo (Líneas 61, 65)", () => {
    expect(validarFechaLimite("")).toBe("");
    expect(validarFechaLimite("fecha-totalmente-invalida-abc")).toBe("La fecha ingresada no es válida.");
    expect(validarFechaLimite("2020-01-01")).toBe("La fecha límite no puede ser anterior a hoy.");
    expect(validarFechaLimite("2030-12-31")).toBe("");
  });

  test("Debe validar Selecciones Obligatorias y Errores de Formulario (Líneas 80-84)", () => {
    expect(validarSeleccion("", "Prioridad")).toBe('El campo "Prioridad" es obligatorio.');
    expect(validarSeleccion("alta", "Prioridad")).toBe("");
    expect(hayErroresEnElFormulario({ titulo: "Error" })).toBe(true);
    expect(hayErroresEnElFormulario({ titulo: "" })).toBe(false);
  });
});
