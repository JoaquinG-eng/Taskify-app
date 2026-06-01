// ============================================================
// ¿Para qué sirve? Define el contexto global de alertas.
// Cualquier componente de la app puede disparar una alerta
// sin necesidad de pasar props hacia arriba o abajo.
// ============================================================

import { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

// ------------------------------------------------------------
// TIPOS
// ------------------------------------------------------------
export type TipoDeAlerta =
  | "exito"
  | "error"
  | "advertencia"
  | "info";

// ------------------------------------------------------------
// INTERFAZ: DatosDeAlerta
// ------------------------------------------------------------
export interface DatosDeAlerta {
  identificadorUnico: string;
  tipo: TipoDeAlerta;
  titulo?: string;
  mensaje: string;
  duracionEnMs: number;
}

// ------------------------------------------------------------
// INTERFAZ: ValorDelContexto
// ------------------------------------------------------------
interface ValorDelContexto {
  listaDeAlertas: DatosDeAlerta[];

  mostrarAlerta: (
    tipo: TipoDeAlerta,
    mensaje: string,
    titulo?: string,
    duracionEnMs?: number
  ) => void;

  cerrarAlerta: (
    identificadorUnico: string
  ) => void;

  alertaExito: (
    mensaje: string,
    titulo?: string
  ) => void;

  alertaError: (
    mensaje: string,
    titulo?: string
  ) => void;

  alertaAdvertencia: (
    mensaje: string,
    titulo?: string
  ) => void;

  alertaInfo: (
    mensaje: string,
    titulo?: string
  ) => void;

  alertaConfirmar: (
    mensaje: string,
    titulo?: string
  ) => void;
}

// ------------------------------------------------------------
// CONTEXTO
// ------------------------------------------------------------
export const AlertContext =
  createContext<ValorDelContexto | undefined>(
    undefined
  );

// ------------------------------------------------------------
// PROVIDER
// ------------------------------------------------------------
export function AlertProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [listaDeAlertas, setListaDeAlertas] =
    useState<DatosDeAlerta[]>([]);

  // ----------------------------------------------------------
  // Mostrar alerta
  // ----------------------------------------------------------
  const mostrarAlerta = useCallback(
    (
      tipo: TipoDeAlerta,
      mensaje: string,
      titulo?: string,
      duracionEnMs: number = 4000
    ) => {
      const identificadorUnico =
        `alerta-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const alertaNueva: DatosDeAlerta = {
        identificadorUnico,
        tipo,
        titulo,
        mensaje,
        duracionEnMs,
      };

      setListaDeAlertas((anterior) => [
        ...anterior,
        alertaNueva,
      ]);

      setTimeout(() => {
        setListaDeAlertas((anterior) =>
          anterior.filter(
            (alerta) =>
              alerta.identificadorUnico !==
              identificadorUnico
          )
        );
      }, duracionEnMs);
    },
    []
  );

  // ----------------------------------------------------------
  // Cerrar alerta
  // ----------------------------------------------------------
  const cerrarAlerta = useCallback(
    (identificadorUnico: string) => {
      setListaDeAlertas((anterior) =>
        anterior.filter(
          (alerta) =>
            alerta.identificadorUnico !==
            identificadorUnico
        )
      );
    },
    []
  );

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  const alertaExito = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarAlerta(
        "exito",
        mensaje,
        titulo
      );
    },
    [mostrarAlerta]
  );

  const alertaError = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarAlerta(
        "error",
        mensaje,
        titulo,
        5000
      );
    },
    [mostrarAlerta]
  );

  const alertaAdvertencia = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarAlerta(
        "advertencia",
        mensaje,
        titulo
      );
    },
    [mostrarAlerta]
  );

  const alertaInfo = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarAlerta(
        "info",
        mensaje,
        titulo,
        3000
      );
    },
    [mostrarAlerta]
  );

  const alertaConfirmar = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarAlerta(
        "advertencia",
        mensaje,
        titulo
      );
    },
    [mostrarAlerta]
  );

  return (
    <AlertContext.Provider
      value={{
        listaDeAlertas,
        mostrarAlerta,
        cerrarAlerta,
        alertaExito,
        alertaError,
        alertaAdvertencia,
        alertaInfo,
        alertaConfirmar,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}