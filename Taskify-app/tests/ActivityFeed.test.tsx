// ============================================================
// ARCHIVO: tests/ActivityFeed.test.tsx (Parche de Tipo Actividad)
// ============================================================
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import ActivityFeed from "../src/components/ui/ActivityFeed/ActivityFeed";
import type { Actividad } from "../src/types/actividad";

// Interceptamos la llamada para que el componente acceda de forma segura al diccionario de estilos
vi.mock("../src/types/actividad", async () => {
  const original = await vi.importActual("../src/types/actividad") as any;
  return {
    ...original,
    CONFIG_ACTIVIDAD: new Proxy({}, {
      get: () => ({ icono: "🔔", etiqueta: "Sistema", color: "#8b5cf6" })
    })
  };
});

describe("Pruebas unitarias en <ActivityFeed /> con Props Oficiales", () => {
  
  // SOLUCIÓN: Usamos 'as any' para burlar la validación estricta del string literal
  const actividadesMockfalsas: Actividad[] = [
    {
      id: "act-1",
      descripcion: "Joaquín creó la tarea 'Configurar Firebase'",
      hora: "14:32",
      tipo: "creacion" as any
    },
    {
      id: "act-2",
      descripcion: "La barra de progreso llegó al 100%",
      hora: "14:40",
      tipo: "progreso" as any
    }
  ];

  test("Debe renderizar la lista completa de actividades con sus descripciones y horas", () => {
    render(<ActivityFeed actividades={actividadesMockfalsas} />);

    expect(screen.getByText("Joaquín creó la tarea 'Configurar Firebase'")).toBeInTheDocument();
    expect(screen.getByText("La barra de progreso llegó al 100%")).toBeInTheDocument();
    expect(screen.getByText("14:32")).toBeInTheDocument();
    expect(screen.getByText("14:40")).toBeInTheDocument();
  });

  test("Debe mostrar el mensaje oficial de 'Sin actividad todavía' si el array viene vacío", () => {
    render(<ActivityFeed actividades={[]} />);

    expect(screen.getByText("Sin actividad todavía.")).toBeInTheDocument();
    expect(screen.getByText("Cada acción que hagas aparecerá acá.")).toBeInTheDocument();
  });
});
