// ============================================================
// ARCHIVO: src/hooks/useDragAndDrop.ts
// ============================================================

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
  
  // Referencias para Touch
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isScrolling = useRef<boolean>(false); // Para detectar si el usuario quiso hacer scroll

  // ── Handlers Mouse (Desktop) ───────────────────────────────
  const onDragStart = useCallback(
    (tareaId: string, estadoOrigen: EstadoTarea) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        yaSeMovio.current = false;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("tareaId", tareaId);
        e.dataTransfer.setData("estadoOrigen", estadoOrigen);
        
        const target = e.target as HTMLElement;
        if(target) e.dataTransfer.setDragImage(target, 20, 20);

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

  // ── Handlers Touch (Móvil) ─────────────────────────────────
  const onTouchStart = useCallback(
    (tareaId: string, estadoOrigen: EstadoTarea) => (e: React.TouchEvent<HTMLDivElement>) => {
      // Resetear estados
      isScrolling.current = false;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchCurrentX.current = touchStartX.current;
      
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
    const currentY = e.touches[0].clientY;
    
    const diffX = currentX - touchStartX.current;
    const diffY = Math.abs(currentY - touchStartY.current);

    // Si el movimiento vertical es mayor que el horizontal, asumimos que es SCROLL
    // y dejamos que el navegador lo maneje (no hacemos nada especial aquí)
    if (diffY > 10 && diffY > Math.abs(diffX)) {
      isScrolling.current = true;
      // Opcional: cancelar el arrastre si definitivamente es scroll
      // setDragState(prev => ({ ...prev, tareaArrastradaId: null }));
      return;
    }

    // Si es movimiento horizontal, prevenimos el scroll lateral del navegador
    // para que la tarjeta se sienta "pegada" al dedo
    if (Math.abs(diffX) > 5) {
       // Nota: preventDefault() en touchmove a veces bloquea scroll padre,
       // pero como tenemos touch-action: none en CSS, debería estar bien.
       // e.preventDefault(); // Descomentar si el scroll lateral molesta
       touchCurrentX.current = currentX;
    }
  }, [dragState.tareaArrastradaId]);

  const onTouchEnd = useCallback(
    (estadoActual: EstadoTarea) => () => {
      if (isScrolling.current || !dragState.tareaArrastradaId) {
        setDragState({
            tareaArrastradaId: null,
            columnaOrigen: null,
            columnaDestino: null,
        });
        return;
      }

      const diff = touchCurrentX.current - touchStartX.current;
      const threshold = 40; // Umbral más bajo para facilitar el movimiento
      let nuevoEstado: EstadoTarea | null = null;

      // Lógica de movimiento izquierda/derecha
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe DERECHA (Anterior columna)
          if (estadoActual === 'en-progreso') nuevoEstado = 'pendiente';
          else if (estadoActual === 'completada') nuevoEstado = 'en-progreso';
        } else {
          // Swipe IZQUIERDA (Siguiente columna)
          if (estadoActual === 'pendiente') nuevoEstado = 'en-progreso';
          else if (estadoActual === 'en-progreso') nuevoEstado = 'completada';
        }
      }

      if (nuevoEstado && nuevoEstado !== estadoActual) {
        alCambiarEstado(dragState.tareaArrastradaId!, nuevoEstado);
      }

      // Limpiar
      setDragState({
        tareaArrastradaId: null,
        columnaOrigen: null,
        columnaDestino: null,
      });
    },
    [alCambiarEstado, dragState.tareaArrastradaId]
  );

  // ── Handlers Columna (Mouse) ───────────────────────────────
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