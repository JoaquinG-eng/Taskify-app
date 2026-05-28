// ============================================================
// ARCHIVO: src/utils/validaciones.ts
// ¿Para qué sirve? Funciones puras de validación reutilizables
// en cualquier formulario de la app. Cada función recibe un
// valor y devuelve el mensaje de error, o string vacío si es válido.
// ============================================================

// ------------------------------------------------------------
// FUNCIÓN: validarTitulo
// Obligatorio, entre 3 y 60 caracteres.
// ------------------------------------------------------------
export function validarTitulo(valor: string): string {
  const valorLimpio = valor.trim();

  if (!valorLimpio) {
    return "El título es obligatorio.";
  }

  if (valorLimpio.length < 3) {
    return "El título debe tener al menos 3 caracteres.";
  }

  if (valorLimpio.length > 60) {
    return "El título no puede superar los 60 caracteres.";
  }

  return "";
}

// ------------------------------------------------------------
// FUNCIÓN: validarDescripcion
// Opcional, pero si se completa no puede superar 200 caracteres.
// ------------------------------------------------------------
export function validarDescripcion(valor: string): string {
  if (valor.length > 200) {
    return "La descripción no puede superar los 200 caracteres.";
  }

  return "";
}

// ------------------------------------------------------------
// FUNCIÓN: validarFechaLimite
// Opcional, pero si se completa debe ser hoy o posterior.
// ------------------------------------------------------------
export function validarFechaLimite(valor: string): string {
  if (!valor) return "";

  const fechaIngresada = new Date(valor + "T00:00:00");
  const fechaDeHoy     = new Date();

  // Limpiamos la hora para comparar solo la fecha
  fechaDeHoy.setHours(0, 0, 0, 0);

  if (isNaN(fechaIngresada.getTime())) {
    return "La fecha ingresada no es válida.";
  }

  if (fechaIngresada < fechaDeHoy) {
    return "La fecha límite no puede ser anterior a hoy.";
  }

  return "";
}

// ------------------------------------------------------------
// FUNCIÓN: validarSeleccion
// Valida que un campo select tenga un valor seleccionado.
// Útil para estado y prioridad.
// ------------------------------------------------------------
export function validarSeleccion(
  valor: string,
  nombreDelCampo: string
): string {
  if (!valor) {
    return `El campo "${nombreDelCampo}" es obligatorio.`;
  }

  return "";
}

// ------------------------------------------------------------
// FUNCIÓN: hayErroresEnElFormulario
// Recibe un objeto de errores y devuelve true si alguno tiene
// contenido. Sirve para bloquear el submit.
// ------------------------------------------------------------
export function hayErroresEnElFormulario(
  errores: Record<string, string>
): boolean {
  return Object.values(errores).some(
    (mensajeDeError) => mensajeDeError !== ""
  );
}