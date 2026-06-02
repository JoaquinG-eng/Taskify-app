// tests/AlertContext.test.tsx

import type { PropsWithChildren } from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { AlertProvider } from "../src/context/AlertContext";
import { useAlert } from "../src/hooks/useAlert";

describe("AlertContext", () => {
  const wrapper = ({ children }: PropsWithChildren<{}>) => (
    <AlertProvider>{children}</AlertProvider>
  );

  test("provee todas las funciones del contexto", () => {
    const { result } = renderHook(() => useAlert(), {
      wrapper,
    });

    expect(result.current).toHaveProperty("alertaExito");
    expect(result.current).toHaveProperty("alertaError");
    expect(result.current).toHaveProperty("alertaInfo");
    expect(result.current).toHaveProperty("alertaConfirmar");
  });

  test("permite crear alertas", () => {
    const { result } = renderHook(() => useAlert(), {
      wrapper,
    });

    act(() => {
      result.current.alertaExito("Éxito");
      result.current.alertaError("Error");
      result.current.alertaInfo("Info");
      result.current.alertaConfirmar("Confirmar");
    });

    expect(result.current.listaDeAlertas.length).toBe(4);
  });

  test("permite cerrar alertas manualmente", () => {
    const { result } = renderHook(() => useAlert(), {
      wrapper,
    });

    act(() => {
      result.current.alertaExito("Prueba");
    });

    const alerta =
      result.current.listaDeAlertas[0];

    act(() => {
      result.current.cerrarAlerta(
        alerta.identificadorUnico
      );
    });

    expect(
      result.current.listaDeAlertas
    ).toHaveLength(0);
  });

  test("permite usar la función genérica", () => {
    const { result } = renderHook(() => useAlert(), {
      wrapper,
    });

    act(() => {
      result.current.alerta(
        "advertencia",
        "Mensaje genérico"
      );
    });

    expect(
      result.current.listaDeAlertas
    ).toHaveLength(1);

    expect(
      result.current.listaDeAlertas[0].tipo
    ).toBe("advertencia");
  });
});