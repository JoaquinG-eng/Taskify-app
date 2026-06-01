// ============================================================
// ARCHIVO: tests/StatCard.test.tsx (Mapeo Final Sincronizado)
// ============================================================
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import StatCard from "../src/components/ui/StatCard/StatCard";

describe("Pruebas unitarias en <StatCard /> con Props Oficiales", () => {
  test("Debe mostrar el título, el valor numérico y el icono de la métrica en la interfaz", () => {
    // SINCRONIZADO: Pasamos los nombres exactos exigidos por tu tipo StatCardProps
    render(
      <StatCard 
        tituloEstadistica="Tareas Completadas" 
        valorPrincipal={42} 
        descripcionSecundaria="Total acumulado en la app" 
        colorAcento="var(--color-purple)"
        icono="🏆"
      />
    );

    // Validamos que los datos se impriman correctamente en el DOM virtual
    expect(screen.getByText("Tareas Completadas")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("🏆")).toBeInTheDocument();
    expect(screen.getByText("Total acumulado en la app")).toBeInTheDocument();
  });

  test("Debe inyectar el estilo dinámico inline para el color de acento", () => {
    render(
      <StatCard 
        tituloEstadistica="Tareas Pendientes" 
        valorPrincipal={5} 
        descripcionSecundaria="Por hacer en el tablero" 
        colorAcento="#f59e0b"
        icono="⏳"
      />
    );

    // Localizamos el componente a través de su título principal
    const tituloElemento = screen.getByText("Tareas Pendientes");
    
    // Subimos hasta encontrar el contenedor raíz <article className="stat-card">
    const tarjeta = tituloElemento.closest(".stat-card");
    
    expect(tarjeta).toBeInTheDocument();
    
    // Validamos que la propiedad CSS personalizada `--acento` se inyecte en el style inline
    if (tarjeta) {
      expect(tarjeta).toHaveStyle({ "--acento": "#f59e0b" });
    }
  });
});
