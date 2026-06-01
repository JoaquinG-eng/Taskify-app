// ============================================================
// ¿Para qué sirve? Hook personalizado para usar el sistema
// de alertas desde cualquier componente. También expone
// atajos para cada tipo de alerta (exito, error, etc.)
// para no tener que escribir el tipo cada vez.
// ============================================================

import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import type { TipoDeAlerta } from "../context/AlertContext";

// ------------------------------------------------------------
// HOOK: useAlert
// Se usa así en cualquier componente:
//   const { alertaExito, alertaError } = useAlert();
//   alertaExito("Tarea creada correctamente");
// ------------------------------------------------------------
export function useAlert() {
  const contexto = useContext(AlertContext);

  // Si se usa fuera del provider, lanzamos un error claro
  if (!contexto) {
    throw new Error(
      "useAlert debe usarse dentro de un AlertProvider. " +
        "Verificá que AlertProvider envuelve la app en main.tsx."
    );
  }

  const { listaDeAlertas, mostrarAlerta, cerrarAlerta } = contexto;

  // --------------------------------------------------------
  // ATAJOS por tipo — evitan repetir el tipo en cada llamada
  // --------------------------------------------------------

  // Alerta de éxito (verde) — para acciones completadas
  function alertaExito(mensaje: string, titulo?: string): void {
    mostrarAlerta("exito", mensaje, titulo);
  }

  // Alerta de error (rojo) — para fallos o acciones destructivas
  function alertaError(mensaje: string, titulo?: string): void {
    mostrarAlerta("error", mensaje, titulo, 5000); // Más tiempo para errores
  }

  // Alerta de advertencia (naranja) — para acciones reversibles
  function alertaAdvertencia(mensaje: string, titulo?: string): void {
    mostrarAlerta("advertencia", mensaje, titulo);
  }

  // Alerta informativa (azul) — para cambios de estado neutros
  function alertaInfo(mensaje: string, titulo?: string): void {
    mostrarAlerta("info", mensaje, titulo, 3000); // Menos tiempo para info
  }

  // Función genérica por si se necesita control total
  function alerta(
    tipo: TipoDeAlerta,
    mensaje: string,
    titulo?: string,
    duracionEnMs?: number
  ): void {
    mostrarAlerta(tipo, mensaje, titulo, duracionEnMs);
  }

  return {
    listaDeAlertas,
    cerrarAlerta,
    alerta,
    alertaExito,
    alertaError,
    alertaAdvertencia,
    alertaInfo,
  };
}