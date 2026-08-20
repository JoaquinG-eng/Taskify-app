import type { Tarea } from "../types/task";

export type TipoNotificacionTarea = "vencida" | "hoy" | "proxima";

export type NotificacionTarea = {
  id: string;
  tareaId: string;
  titulo: string;
  tipo: TipoNotificacionTarea;
  detalle: string;
  fechaLimite: string;
  horaInicio?: string;
};

const MILISEGUNDOS_DIA = 24 * 60 * 60 * 1000;

function inicioDelDia(fecha: Date): Date {
  const resultado = new Date(fecha);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

function fechaLocalDesdeValor(valor?: string | null): Date | null {
  if (!valor) return null;

  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!coincidencia) return null;

  const [, anio, mes, dia] = coincidencia;
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));

  if (
    fecha.getFullYear() !== Number(anio) ||
    fecha.getMonth() !== Number(mes) - 1 ||
    fecha.getDate() !== Number(dia)
  ) {
    return null;
  }

  return inicioDelDia(fecha);
}

function formatearFecha(valor: string): string {
  const [anio, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${anio}`;
}

function etiquetaTipo(tipo: TipoNotificacionTarea): string {
  if (tipo === "vencida") return "Vencida";
  if (tipo === "hoy") return "Vence hoy";
  return "Próxima";
}

function rangoTipo(
  fecha: Date,
  hoy: Date,
  limiteProximas: Date
): TipoNotificacionTarea | null {
  if (fecha < hoy) return "vencida";
  if (fecha.getTime() === hoy.getTime()) return "hoy";
  if (fecha <= limiteProximas) return "proxima";
  return null;
}

export function construirNotificacionesTareas(
  tareas: Tarea[],
  ahora = new Date(),
  diasProximos = 7
): NotificacionTarea[] {
  const hoy = inicioDelDia(ahora);
  const limiteProximas = new Date(
    hoy.getTime() + diasProximos * MILISEGUNDOS_DIA
  );

  const notificaciones = tareas
    .filter((tarea) => tarea.estado !== "completada")
    .map((tarea): NotificacionTarea | null => {
      const fecha = fechaLocalDesdeValor(tarea.fechaLimite);
      if (!fecha || !tarea.fechaLimite) return null;

      const tipo = rangoTipo(fecha, hoy, limiteProximas);
      if (!tipo) return null;

      const hora = tarea.horaInicio?.trim() || undefined;
      const detalle = [
        etiquetaTipo(tipo),
        formatearFecha(tarea.fechaLimite),
        hora,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        id: `${tipo}:${tarea.id}`,
        tareaId: tarea.id,
        titulo: tarea.titulo,
        tipo,
        detalle,
        fechaLimite: tarea.fechaLimite,
        horaInicio: hora,
      } satisfies NotificacionTarea;
    })
    .filter(
      (notificacion): notificacion is NotificacionTarea =>
        notificacion !== null
    );

  const ordenTipo: Record<TipoNotificacionTarea, number> = {
    vencida: 0,
    hoy: 1,
    proxima: 2,
  };

  return notificaciones.sort((a, b) => {
    const diferenciaTipo = ordenTipo[a.tipo] - ordenTipo[b.tipo];
    if (diferenciaTipo !== 0) return diferenciaTipo;

    const diferenciaFecha = a.fechaLimite.localeCompare(b.fechaLimite);
    if (diferenciaFecha !== 0) return diferenciaFecha;

    return (a.horaInicio ?? "99:99").localeCompare(
      b.horaInicio ?? "99:99"
    );
  });
}
