// ============================================================
// ¿Para qué sirve? Hook genérico de validación de formularios.
// Maneja el estado de errores y de "tocado" (touched) por campo.
// Un campo "tocado" es uno que el usuario ya visitó (blur).
// Se puede reutilizar en cualquier formulario de la app.
// ============================================================

import { useState, useCallback } from "react";
import { hayErroresEnElFormulario } from "../utils/validaciones";

// ------------------------------------------------------------
// TIPO: EsquemaDeValidacion
// Mapea cada campo del formulario a su función validadora.
// La función recibe el valor y devuelve el error o "".
// ------------------------------------------------------------
type EsquemaDeValidacion<TipoDeCampos extends string> = {
  [Campo in TipoDeCampos]: (valor: string) => string;
};

// ------------------------------------------------------------
// HOOK: useFormValidation
// Se usa así:
//   const { errores, camposTocados, validarCampo, validarTodo, marcarTocado }
//     = useFormValidation(esquema, valores);
// ------------------------------------------------------------
export function useFormValidation<TipoDeCampos extends string>(
  esquemaDeValidacion: EsquemaDeValidacion<TipoDeCampos>,
  valoresActuales: Record<TipoDeCampos, string>
) {
  // Estado de errores: un objeto con el mismo shape que los valores
  const [errores, setErrores] = useState<Record<TipoDeCampos, string>>(
    () => {
      // Inicializamos todos los errores como vacíos
      const erroresIniciales = {} as Record<TipoDeCampos, string>;
      for (const campo in esquemaDeValidacion) {
        erroresIniciales[campo] = "";
      }
      return erroresIniciales;
    }
  );

  // Estado de "tocado": indica si el usuario ya interactuó con el campo
  // Solo mostramos errores en campos tocados para no abrumar desde el inicio
  const [camposTocados, setCamposTocados] = useState<
    Record<TipoDeCampos, boolean>
  >(() => {
    const tocadosIniciales = {} as Record<TipoDeCampos, boolean>;
    for (const campo in esquemaDeValidacion) {
      tocadosIniciales[campo] = false;
    }
    return tocadosIniciales;
  });

  // --------------------------------------------------------
  // FUNCIÓN: validarCampo
  // Valida un campo específico y actualiza su error.
  // Se llama en el onChange para validación en tiempo real
  // (solo si el campo ya fue tocado).
  // --------------------------------------------------------
  const validarCampo = useCallback(
    (nombreDelCampo: TipoDeCampos, valor: string): string => {
      const funcionValidadora = esquemaDeValidacion[nombreDelCampo];
      const mensajeDeError = funcionValidadora(valor);

      setErrores((anterior) => ({
        ...anterior,
        [nombreDelCampo]: mensajeDeError,
      }));

      return mensajeDeError;
    },
    [esquemaDeValidacion]
  );

  // --------------------------------------------------------
  // FUNCIÓN: marcarTocado
  // Marca un campo como tocado y lo valida inmediatamente.
  // Se llama en el onBlur (cuando el usuario sale del campo).
  // --------------------------------------------------------
  const marcarTocado = useCallback(
    (nombreDelCampo: TipoDeCampos): void => {
      setCamposTocados((anterior) => ({
        ...anterior,
        [nombreDelCampo]: true,
      }));

      // Validamos al momento de salir del campo
      validarCampo(nombreDelCampo, valoresActuales[nombreDelCampo]);
    },
    [validarCampo, valoresActuales]
  );

  // --------------------------------------------------------
  // FUNCIÓN: validarTodo
  // Valida todos los campos a la vez y marca todos como tocados.
  // Se llama al intentar enviar el formulario.
  // Devuelve true si el formulario es válido.
  // --------------------------------------------------------
  const validarTodo = useCallback((): boolean => {
    const erroresNuevos = {} as Record<TipoDeCampos, string>;
    const todosLosCampos = {} as Record<TipoDeCampos, boolean>;

    for (const campo in esquemaDeValidacion) {
      const funcionValidadora = esquemaDeValidacion[campo];
      erroresNuevos[campo] = funcionValidadora(valoresActuales[campo]);
      todosLosCampos[campo] = true;
    }

    setErrores(erroresNuevos);
    setCamposTocados(todosLosCampos);

    return !hayErroresEnElFormulario(erroresNuevos);
  }, [esquemaDeValidacion, valoresActuales]);

  // --------------------------------------------------------
  // FUNCIÓN: limpiarValidacion
  // Resetea todos los errores y tocados.
  // Se llama al cancelar o después de un submit exitoso.
  // --------------------------------------------------------
  const limpiarValidacion = useCallback((): void => {
    const erroresLimpios = {} as Record<TipoDeCampos, string>;
    const tocadosLimpios = {} as Record<TipoDeCampos, boolean>;

    for (const campo in esquemaDeValidacion) {
      erroresLimpios[campo] = "";
      tocadosLimpios[campo] = false;
    }

    setErrores(erroresLimpios);
    setCamposTocados(tocadosLimpios);
  }, [esquemaDeValidacion]);

  return {
    errores,
    camposTocados,
    validarCampo,
    marcarTocado,
    validarTodo,
    limpiarValidacion,
  };
}