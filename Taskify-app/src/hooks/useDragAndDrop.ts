import { useState, useCallback, useRef } from "react";
import type { EstadoTarea } from "../types/task";

export interface DragState {
  tareaArrastradaId: string | null;
  columnaOrigen: EstadoTarea | null;
  columnaDestino: EstadoTarea | null;
}

interface UseDragAndDropProps {
  alCambiarEstado: (id: string, nuevoEstado: EstadoTarea) => void;
}

let styleTagCursor: HTMLStyleElement | null = null;

function activarCursorGrabbing() {
  if (styleTagCursor) return;
  styleTagCursor = document.createElement("style");
  styleTagCursor.innerHTML = "*, *::before, *::after { cursor: grabbing !important; }";
  document.head.appendChild(styleTagCursor);
}

function desactivarCursorGrabbing() {
  if (!styleTagCursor) return;
  styleTagCursor.remove();
  styleTagCursor = null;
}

export function useDragAndDrop({ alCambiarEstado }: UseDragAndDropProps) {
  const [dragState, setDragState] = useState<DragState>({
    tareaArrastradaId: null,
    columnaOrigen: null,
    columnaDestino: null,
  });

  const yaSeMovio = useRef(false);
  
  // Referencias para touch
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  // ── Handlers para la tarjeta (Mouse) ─────────────────────────────────
  const onDragStart = useCallback(
    (tareaId: string, estadoOrigen: EstadoTarea) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        yaSeMovio.current = false;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("tareaId", tareaId);
        e.dataTransfer.setData("estadoOrigen", estadoOrigen);
        
        const target = e.target as HTMLElement;
        if(target) {
            e.dataTransfer.setDragImage(target, 20, 20);
        }

        activarCursorGrabbing();

        setTimeout(() => {
          setDragState({
            tareaArrastradaId: tareaId,
            columnaOrigen: estadoOrigen,
            columnaDestino: estadoOrigen,
          });
        }, 0);
      },
    []
  );

  const onDragEnd = useCallback(() => {
    desactivarCursorGrabbing();
    setDragState({
      tareaArrastradaId: null,
      columnaOrigen: null,
      columnaDestino: null,
    });
    yaSeMovio.current = false;
  }, []);

  // ── Handlers Touch (Para Móviles - CORREGIDO) ────────────────────────
  const onTouchStart = useCallback(
    (tareaId: string, estadoOrigen: EstadoTarea) => (e: React.TouchEvent<HTMLDivElement>) => {
      // Resetear estados
      isScrolling.current = false;
      touchStartX.current = e.touches[0].clientX;
      touchCurrentX.current = touchStartX.current;
      touchStartTime.current = Date.now();
      
      setDragState({
        tareaArrastradaId: tareaId,
        columnaOrigen: estadoOrigen,
        columnaDestino: estadoOrigen,
      });
    },
    []
  );

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragState.tareaArrastradaId) return;

    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartX.current;
    const diffY = Math.abs(e.touches[0].clientY - (e.target as HTMLElement).getBoundingClientRect().top); // Simplificado

    // Si el movimiento vertical es mayor que el horizontal, asumimos scroll y no swipe
    // Nota: Esta es una detección básica, lo importante es el CSS touch-action
    touchCurrentX.current = currentX;
  }, [dragState.tareaArrastradaId]);

  const onTouchEnd = useCallback(
    (estadoActual: EstadoTarea) => () => {
      if (!dragState.tareaArrastradaId) return;

      const diff = touchCurrentX.current - touchStartX.current;
      const timeDiff = Date.now() - touchStartTime.current;
      
      // UMBRALES AJUSTADOS PARA MAYOR SENSIBILIDAD
      const threshold = 30; // Pixeles mínimos (reducido de 50 a 30)
      const timeThreshold = 600; // ms máximos (aumentado de 300 a 600)

      let nuevoEstado: EstadoTarea | null = null;

      // Solo actuar si el deslizamiento fue suficientemente largo y rápido
      if (Math.abs(diff) > threshold && timeDiff < timeThreshold) {
        if (diff > 0) {
          // Swipe a la DERECHA (Ir a columna anterior / Izquierda visual)
          if (estadoActual === 'en-progreso') nuevoEstado = 'pendiente';
          else if (estadoActual === 'completada') nuevoEstado = 'en-progreso';
        } else {
          // Swipe a la IZQUIERDA (Ir a columna siguiente / Derecha visual)
          if (estadoActual === 'pendiente') nuevoEstado = 'en-progreso';
          else if (estadoActual === 'en-progreso') nuevoEstado = 'completada';
        }
      }

      if (nuevoEstado && nuevoEstado !== estadoActual) {
        alCambiarEstado(dragState.tareaArrastradaId!, nuevoEstado);
      }

      // Limpiar estado siempre al soltar
      setDragState({
        tareaArrastradaId: null,
        columnaOrigen: null,
        columnaDestino: null,
      });
    },
    [alCambiarEstado, dragState.tareaArrastradaId]
  );

  // ── Handlers para la columna (Mouse) ─────────────────────────────────
  const onDragOver = useCallback(
    (estadoColumna: EstadoTarea) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragState((prev) =>
          prev.columnaDestino === estadoColumna
            ? prev
            : { ...prev, columnaDestino: estadoColumna }
        );
      },
    []
  );

  const onDragLeave = useCallback(
    (estadoColumna: EstadoTarea) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        const relatedTarget = e.relatedTarget as Node | null;
        if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;
        setDragState((prev) =>
          prev.columnaDestino === estadoColumna
            ? { ...prev, columnaDestino: prev.columnaOrigen }
            : prev
        );
      },
    []
  );

  const onDrop = useCallback(
    (estadoColumna: EstadoTarea) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (yaSeMovio.current) return;

        const tareaId      = e.dataTransfer.getData("tareaId");
        const estadoOrigen = e.dataTransfer.getData("estadoOrigen") as EstadoTarea;

        if (tareaId && estadoOrigen !== estadoColumna) {
          yaSeMovio.current = true;
          alCambiarEstado(tareaId, estadoColumna);
        }

        desactivarCursorGrabbing();
        setDragState({
          tareaArrastradaId: null,
          columnaOrigen: null,
          columnaDestino: null,
        });
      },
    [alCambiarEstado]
  );

  const estaArrastrando = dragState.tareaArrastradaId !== null;

  const columnaEsDestino = useCallback(
    (estado: EstadoTarea) =>
      estaArrastrando &&
      dragState.columnaDestino === estado &&
      dragState.columnaOrigen !== estado,
    [estaArrastrando, dragState.columnaDestino, dragState.columnaOrigen]
  );

  const tareaEstaArrastrandose = useCallback(
    (tareaId: string) => dragState.tareaArrastradaId === tareaId,
    [dragState.tareaArrastradaId]
  );

  return {
    dragState,
    estaArrastrando,
    columnaEsDestino,
    tareaEstaArrastrandose,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}