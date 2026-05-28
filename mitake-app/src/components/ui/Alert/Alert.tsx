// ============================================================
// ARCHIVO: src/components/ui/Alert/Alert.tsx
// ¿Para qué sirve? Componente visual del sistema de alertas.
// Muestra las alertas apiladas en la esquina superior derecha.
// Se monta una sola vez en App.tsx y escucha el contexto.
// ============================================================

import { useEffect, useState } from "react";
import { useAlert } from "../../../hooks/useAlert";
import type { DatosDeAlerta, TipoDeAlerta } from "../../../context/AlertContext";
import "./Alert.css";

// ------------------------------------------------------------
// CONFIGURACIÓN VISUAL por tipo de alerta
// Centraliza íconos, colores y etiquetas.
// ------------------------------------------------------------
const configuracionPorTipo: Record<
  TipoDeAlerta,
  { icono: string; claseCSS: string; etiquetaDefecto: string }
> = {
  exito:       { icono: "✓",  claseCSS: "alerta--exito",       etiquetaDefecto: "Éxito"       },
  error:       { icono: "✕",  claseCSS: "alerta--error",       etiquetaDefecto: "Error"       },
  advertencia: { icono: "⚠",  claseCSS: "alerta--advertencia", etiquetaDefecto: "Atención"    },
  info:        { icono: "ℹ",  claseCSS: "alerta--info",        etiquetaDefecto: "Información" },
};

// ------------------------------------------------------------
// SUBCOMPONENTE: AlertaIndividual
// Maneja el estado de animación de una sola alerta.
// ------------------------------------------------------------
function AlertaIndividual({ datosDeAlerta }: { datosDeAlerta: DatosDeAlerta }) {
  const { cerrarAlerta } = useAlert();

  // Estado para la animación de salida
  const [estaDesapareciendo, setEstaDesapareciendo] = useState<boolean>(false);

  const configuracion = configuracionPorTipo[datosDeAlerta.tipo];

  // --------------------------------------------------------
  // EFECTO: prepara la animación de salida justo antes de
  // que el contexto elimine la alerta de la lista.
  // --------------------------------------------------------
  useEffect(() => {
    // Disparamos la animación de salida 400ms antes del cierre real
    const temporizadorAnimacion = setTimeout(() => {
      setEstaDesapareciendo(true);
    }, datosDeAlerta.duracionEnMs - 400);

    return () => clearTimeout(temporizadorAnimacion);
  }, [datosDeAlerta.duracionEnMs]);

  // --------------------------------------------------------
  // FUNCIÓN: manejarCierre
  // Anima la salida y luego llama al cierre del contexto.
  // --------------------------------------------------------
  function manejarCierre(): void {
    setEstaDesapareciendo(true);
    setTimeout(() => {
      cerrarAlerta(datosDeAlerta.identificadorUnico);
    }, 350);
  }

  return (
    <div
      className={`alerta ${configuracion.claseCSS} ${
        estaDesapareciendo ? "alerta--desapareciendo" : "alerta--apareciendo"
      }`}
      role="alert"
    >
      {/* Barra de progreso de tiempo */}
      <div
        className="alerta__barra-tiempo"
        style={{
          animationDuration: `${datosDeAlerta.duracionEnMs}ms`,
        }}
      ></div>

      {/* Ícono del tipo */}
      <div className="alerta__icono">{configuracion.icono}</div>

      {/* Contenido de texto */}
      <div className="alerta__contenido">
        <p className="alerta__titulo">
          {datosDeAlerta.titulo ?? configuracion.etiquetaDefecto}
        </p>
        <p className="alerta__mensaje">{datosDeAlerta.mensaje}</p>
      </div>

      {/* Botón de cerrar */}
      <button
        className="alerta__boton-cerrar"
        onClick={manejarCierre}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}

// ------------------------------------------------------------
// COMPONENTE PRINCIPAL: AlertContainer
// Renderiza todas las alertas activas apiladas.
// Se monta en App.tsx, fuera del layout principal.
// ------------------------------------------------------------
function AlertContainer() {
  const { listaDeAlertas } = useAlert();

  // Si no hay alertas, no renderizamos nada
  if (listaDeAlertas.length === 0) return null;

  return (
    <div className="alert-container" aria-live="polite">
      {listaDeAlertas.map((alertaActual) => (
        <AlertaIndividual
          key={alertaActual.identificadorUnico}
          datosDeAlerta={alertaActual}
        />
      ))}
    </div>
  );
}

export default AlertContainer;