import { createContext } from "react";

export type TipoDeAlerta =
  | "exito"
  | "error"
  | "advertencia"
  | "info";

export interface DatosDeAlerta {
  identificadorUnico: string;
  tipo: TipoDeAlerta;
  titulo?: string;
  mensaje: string;
  duracionEnMs: number;
}

export interface ValorDelContexto {
  listaDeAlertas: DatosDeAlerta[];
  mostrarAlerta: (
    tipo: TipoDeAlerta,
    mensaje: string,
    titulo?: string,
    duracionEnMs?: number
  ) => void;
  cerrarAlerta: (identificadorUnico: string) => void;
  alertaExito: (mensaje: string, titulo?: string) => void;
  alertaError: (mensaje: string, titulo?: string) => void;
  alertaAdvertencia: (mensaje: string, titulo?: string) => void;
  alertaInfo: (mensaje: string, titulo?: string) => void;
  alertaConfirmar: (mensaje: string, titulo?: string) => void;
}

export const AlertContext =
  createContext<ValorDelContexto | undefined>(undefined);
