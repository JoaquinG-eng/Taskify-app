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

// Inyecta un <style> en el <head> para forzar grabbing globalmente.
// Es la única forma de overridear el cursor del sistema en Chrome
// cuando el ghost nativo del drag está activo.
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

  // ── Handlers para la tarjeta ─────────────────────────────────
  const onDragStart = useCallback(
    (tareaId: string, estadoOrigen: EstadoTarea) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        yaSeMovio.current = false;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("tareaId", tareaId);
        e.dataTransfer.setData("estadoOrigen", estadoOrigen);

        // Ghost nativo de Chrome intacto (efecto transparencia)
        // Solo forzamos el cursor via <style> inyectado
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

  // ── Handlers para la columna ─────────────────────────────────
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

  // ── Helpers de estado para clases CSS ────────────────────────
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
  };
}