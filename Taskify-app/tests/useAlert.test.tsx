import { renderHook, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import { AlertProvider } from "../src/context/AlertContext";
import { useAlert } from "../src/hooks/useAlert";

describe("useAlert", () => {
  const wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <AlertProvider>
      {children}
    </AlertProvider>
  );

  test("lanza error fuera del provider", () => {
    expect(() =>
      renderHook(() => useAlert())
    ).toThrow(
      "useAlert debe usarse dentro de un AlertProvider"
    );
  });

  test("expone todas las funciones", () => {
    const { result } = renderHook(
      () => useAlert(),
      { wrapper }
    );

    expect(result.current).toHaveProperty(
      "alertaExito"
    );

    expect(result.current).toHaveProperty(
      "alertaError"
    );

    expect(result.current).toHaveProperty(
      "alertaAdvertencia"
    );

    expect(result.current).toHaveProperty(
      "alertaInfo"
    );

    expect(result.current).toHaveProperty(
      "alertaConfirmar"
    );

    expect(result.current).toHaveProperty(
      "alerta"
    );
  });

  test("ejecuta todos los helpers", () => {
    const { result } = renderHook(
      () => useAlert(),
      { wrapper }
    );

    act(() => {
      result.current.alertaExito(
        "Tarea creada"
      );

      result.current.alertaError(
        "Error al guardar"
      );

      result.current.alertaAdvertencia(
        "Advertencia"
      );

      result.current.alertaInfo(
        "Información"
      );

      result.current.alertaConfirmar(
        "Confirmación"
      );

      result.current.alerta(
        "info",
        "Alerta genérica"
      );
    });

    expect(
      result.current.listaDeAlertas.length
    ).toBe(6);
  });

  test("permite cerrar alertas", () => {
    const { result } = renderHook(
      () => useAlert(),
      { wrapper }
    );

    act(() => {
      result.current.alertaExito(
        "Prueba"
      );
    });

    const alerta =
      result.current.listaDeAlertas[0];

    expect(alerta).toBeDefined();

    act(() => {
      result.current.cerrarAlerta(
        alerta.identificadorUnico
      );
    });

    expect(
      result.current.listaDeAlertas
    ).toHaveLength(0);
  });
});