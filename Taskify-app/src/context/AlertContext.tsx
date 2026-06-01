// ============================================================
// ¿Para qué sirve? Define el contexto global de alertas.
// Cualquier componente de la app puede disparar una alerta
// sin necesidad de pasar props hacia arriba o abajo.
// ============================================================

import { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

// ------------------------------------------------------------
// TIPOS: definimos los posibles tipos de alerta
// ------------------------------------------------------------
export type TipoDeAlerta = "exito" | "error" | "advertencia" | "info";

// ------------------------------------------------------------
// INTERFAZ: DatosDeAlerta
// La estructura de cada alerta individual.
// ------------------------------------------------------------
export interface DatosDeAlerta {
  identificadorUnico: string;  // ID para poder cerrar la alerta correcta
  tipo: TipoDeAlerta;
  titulo?: string;             // Título opcional en negrita
  mensaje: string;
  duracionEnMs: number;        // Cuántos ms antes de cerrarse sola
}

// ------------------------------------------------------------
// INTERFAZ: ValorDelContexto
// Lo que el contexto expone a todos los componentes.
// ------------------------------------------------------------
interface ValorDelContexto {
  listaDeAlertas: DatosDeAlerta[];
  mostrarAlerta: (
    tipo: TipoDeAlerta,
    mensaje: string,
    titulo?: string,
    duracionEnMs?: number
  ) => void;
  cerrarAlerta: (identificadorUnico: string) => void;
}

// ------------------------------------------------------------
// CREACIÓN DEL CONTEXTO
// El valor por defecto es undefined — forzamos a usar
// el provider para obtener el valor real.
// ------------------------------------------------------------
export const AlertContext = createContext<ValorDelContexto | undefined>(
  undefined
);

// ------------------------------------------------------------
// COMPONENTE: AlertProvider
// Envuelve la app y provee el estado y las funciones de alerta.
// Se agrega en main.tsx una sola vez.
// ------------------------------------------------------------
export function AlertProvider({ children }: { children: ReactNode }) {
  // Lista de alertas activas en pantalla
  const [listaDeAlertas, setListaDeAlertas] = useState<DatosDeAlerta[]>([]);

  // --------------------------------------------------------
  // FUNCIÓN: mostrarAlerta
  // Agrega una alerta nueva a la lista.
  // Se cierra automáticamente después de la duración indicada.
  // useCallback evita que se recree en cada render.
  // --------------------------------------------------------
  const mostrarAlerta = useCallback(
    (
      tipo: TipoDeAlerta,
      mensaje: string,
      titulo?: string,
      duracionEnMs: number = 4000
    ): void => {
      // Generamos un ID único para esta alerta
      const identificadorUnico = `alerta-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;

      const alertaNueva: DatosDeAlerta = {
        identificadorUnico,
        tipo,
        titulo,
        mensaje,
        duracionEnMs,
      };

      // Agregamos la alerta a la lista
      setListaDeAlertas((anterior) => [...anterior, alertaNueva]);

      // Programamos el cierre automático
      setTimeout(() => {
        setListaDeAlertas((anterior) =>
          anterior.filter(
            (alerta) => alerta.identificadorUnico !== identificadorUnico
          )
        );
      }, duracionEnMs);
    },
    []
  );

  // --------------------------------------------------------
  // FUNCIÓN: cerrarAlerta
  // Cierra una alerta específica al hacer click en la X.
  // --------------------------------------------------------
  const cerrarAlerta = useCallback((identificadorUnico: string): void => {
    setListaDeAlertas((anterior) =>
      anterior.filter(
        (alerta) => alerta.identificadorUnico !== identificadorUnico
      )
    );
  }, []);

  return (
    <AlertContext.Provider
      value={{ listaDeAlertas, mostrarAlerta, cerrarAlerta }}
    >
      {children}
    </AlertContext.Provider>
  );
}