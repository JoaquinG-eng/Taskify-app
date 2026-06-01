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

  const {
    listaDeAlertas,
    mostrarAlerta,
    cerrarAlerta,
  } = contexto;

  // --------------------------------------------------------
  // ATAJOS POR TIPO
  // --------------------------------------------------------

  const alertaExito = (
    mensaje: string,
    titulo?: string
  ): void => {
    mostrarAlerta(
      "exito",
      mensaje,
      titulo
    );
  };

  const alertaError = (
    mensaje: string,
    titulo?: string
  ): void => {
    mostrarAlerta(
      "error",
      mensaje,
      titulo,
      5000
    );
  };

  const alertaAdvertencia = (
    mensaje: string,
    titulo?: string
  ): void => {
    mostrarAlerta(
      "advertencia",
      mensaje,
      titulo
    );
  };

  const alertaInfo = (
    mensaje: string,
    titulo?: string
  ): void => {
    mostrarAlerta(
      "info",
      mensaje,
      titulo,
      3000
    );
  };

  // Alias para compatibilidad con tests
  const alertaConfirmar = (
    mensaje: string,
    titulo?: string
  ): void => {
    mostrarAlerta(
      "advertencia",
      mensaje,
      titulo
    );
  };

  // --------------------------------------------------------
  // FUNCIÓN GENÉRICA
  // --------------------------------------------------------

  const alerta = (
    tipo: TipoDeAlerta,
    mensaje: string,
    titulo?: string,
    duracionEnMs?: number
  ): void => {
    mostrarAlerta(
      tipo,
      mensaje,
      titulo,
      duracionEnMs
    );
  };

  return {
    listaDeAlertas,
    cerrarAlerta,

    alerta,

    alertaExito,
    alertaError,
    alertaAdvertencia,
    alertaInfo,
    alertaConfirmar,
  };
}