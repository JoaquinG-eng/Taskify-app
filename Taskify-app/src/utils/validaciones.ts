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


  export function validarDescripcion(valor: string): string {
  const valorLimpio = valor.trim();

  if (!valorLimpio) {
    return "La descripción es obligatoria.";
  }

  if (valorLimpio.length < 20) {
    return "La descripción debe tener al menos 20 caracteres.";
  }

  if (valorLimpio.length > 1000) {
    return "La descripción no puede superar los 1000 caracteres.";
  }

  return "";
}

  export function validarFechaLimite(valor: string): string {
    if (!valor) return "";

    const fechaIngresada = new Date(valor + "T00:00:00");
    const fechaDeHoy     = new Date();

     fechaDeHoy.setHours(0, 0, 0, 0);

    if (isNaN(fechaIngresada.getTime())) {
      return "La fecha ingresada no es válida.";
    }

    if (fechaIngresada < fechaDeHoy) {
      return "La fecha límite no puede ser anterior a hoy.";
    }

    return "";
  }


export function validarHorario(
  fechaLimite: string,
  horaInicio: string,
  horaFin: string
): string {
  if (!horaInicio && !horaFin) return "";

  if (!fechaLimite) {
    return "Para definir un horario, primero seleccioná una fecha límite.";
  }

  if (!horaInicio || !horaFin) {
    return "Completá la hora de inicio y la hora de fin.";
  }

  const patronHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!patronHora.test(horaInicio) || !patronHora.test(horaFin)) {
    return "Ingresá un horario válido.";
  }

  if (horaFin <= horaInicio) {
    return "La hora de fin debe ser posterior a la hora de inicio.";
  }

  return "";
}

export function validarSeleccion(
    valor: string,
    nombreDelCampo: string
  ): string {
    if (!valor) {
      return `El campo "${nombreDelCampo}" es obligatorio.`;
    }

    return "";
  }


  export function hayErroresEnElFormulario(
    errores: Record<string, string>
  ): boolean {
    return Object.values(errores).some(
      (mensajeDeError) => mensajeDeError !== ""
    );
  }
