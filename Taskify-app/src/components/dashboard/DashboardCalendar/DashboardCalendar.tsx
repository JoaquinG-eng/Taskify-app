import { useEffect, useMemo, useRef, useState } from "react";
import type { Tarea } from "../../../types/task";

import "./DashboardCalendar.css";

type VistaCalendario = "dia" | "semana" | "mes";

type PropiedadesDeDashboardCalendar = {
  tareas: Tarea[];
  alCrearEnFecha: (
    fecha: string,
    horaInicio?: string,
    horaFin?: string
  ) => void;
  alEditarTarea: (tarea: Tarea) => void;
};

type FiltrosEstado = {
  pendiente: boolean;
  "en-progreso": boolean;
  completada: boolean;
};

type RangoHorario = {
  inicioMinutos: number;
  finMinutos: number;
};

type TareaColocada = RangoHorario & {
  tarea: Tarea;
  columna: number;
  columnas: number;
};

const DIAS_SEMANA_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_SEMANA_MINI = ["D", "L", "M", "X", "J", "V", "S"];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ALTO_HORA = 64;
const HORAS_DIA = Array.from({ length: 24 }, (_, hora) => hora);

function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return inicioDelDia(copia);
}

function sumarMeses(fecha: Date, meses: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth() + meses, 1);
}

function claveFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function fechaLocalDesdeValor(valor?: string): Date | null {
  if (!valor) return null;

  const coincidencia = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidencia) return null;

  const [, anioTexto, mesTexto, diaTexto] = coincidencia;
  const anio = Number(anioTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);

  const fecha = new Date(anio, mes - 1, dia);

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  return fecha;
}

function inicioSemana(fecha: Date): Date {
  const base = inicioDelDia(fecha);
  const dia = base.getDay();
  const desplazamiento = dia === 0 ? -6 : 1 - dia;
  return sumarDias(base, desplazamiento);
}

function construirDiasMes(fecha: Date): Date[] {
  const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const inicio = sumarDias(primerDia, -primerDia.getDay());

  return Array.from({ length: 42 }, (_, indice) => sumarDias(inicio, indice));
}

function construirDiasSemana(fecha: Date): Date[] {
  const inicio = inicioSemana(fecha);
  return Array.from({ length: 7 }, (_, indice) => sumarDias(inicio, indice));
}

function tituloPeriodo(fecha: Date, vista: VistaCalendario): string {
  if (vista === "dia") {
    return `${DIAS_SEMANA_CORTOS[fecha.getDay()]}, ${fecha.getDate()} de ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  if (vista === "semana") {
    const dias = construirDiasSemana(fecha);
    const primero = dias[0];
    const ultimo = dias[6];

    if (primero.getMonth() === ultimo.getMonth()) {
      return `${primero.getDate()}–${ultimo.getDate()} de ${MESES[ultimo.getMonth()]} ${ultimo.getFullYear()}`;
    }

    return `${primero.getDate()} ${MESES[primero.getMonth()]} – ${ultimo.getDate()} ${MESES[ultimo.getMonth()]} ${ultimo.getFullYear()}`;
  }

  return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

function prioridadClase(prioridad: Tarea["prioridad"]): string {
  return `dashboard-calendar__tarea--${prioridad}`;
}

function textoEstado(estado: Tarea["estado"]): string {
  if (estado === "en-progreso") return "En progreso";
  if (estado === "completada") return "Completada";
  return "Pendiente";
}

function etiquetaHora(hora: number): string {
  return `${String(hora).padStart(2, "0")}:00`;
}

function rangoInicialDesdeClick(
  evento: React.MouseEvent<HTMLDivElement>
): { horaInicio: string; horaFin: string } {
  const rect = evento.currentTarget.getBoundingClientRect();
  const posicionY = Math.max(
    0,
    Math.min(evento.clientY - rect.top, ALTO_HORA * 24 - 1)
  );
  const hora = Math.min(23, Math.floor(posicionY / ALTO_HORA));

  return {
    horaInicio: etiquetaHora(hora),
    horaFin: hora === 23 ? "23:59" : etiquetaHora(hora + 1),
  };
}

function horaAMinutos(valor?: string): number | null {
  if (!valor) return null;

  const coincidencia = valor.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!coincidencia) return null;

  return Number(coincidencia[1]) * 60 + Number(coincidencia[2]);
}

function rangoHorarioDeTarea(tarea: Tarea): RangoHorario | null {
  const inicioMinutos = horaAMinutos(tarea.horaInicio);
  const finMinutos = horaAMinutos(tarea.horaFin);

  if (
    inicioMinutos === null ||
    finMinutos === null ||
    finMinutos <= inicioMinutos
  ) {
    return null;
  }

  return { inicioMinutos, finMinutos };
}

function distribuirTareasHorarias(tareas: Tarea[]): TareaColocada[] {
  const ordenadas = tareas
    .map((tarea) => {
      const rango = rangoHorarioDeTarea(tarea);
      return rango ? { tarea, ...rango } : null;
    })
    .filter(
      (
        item
      ): item is {
        tarea: Tarea;
        inicioMinutos: number;
        finMinutos: number;
      } => item !== null
    )
    .sort(
      (a, b) =>
        a.inicioMinutos - b.inicioMinutos ||
        a.finMinutos - b.finMinutos
    );

  const resultado: TareaColocada[] = [];
  let grupo: typeof ordenadas = [];
  let finMaximoGrupo = -1;

  function cerrarGrupo() {
    if (grupo.length === 0) return;

    const finesColumnas: number[] = [];
    const provisionales = grupo.map((item) => {
      let columna = finesColumnas.findIndex(
        (finAnterior) => finAnterior <= item.inicioMinutos
      );

      if (columna === -1) {
        columna = finesColumnas.length;
        finesColumnas.push(item.finMinutos);
      } else {
        finesColumnas[columna] = item.finMinutos;
      }

      return { ...item, columna };
    });

    const columnas = Math.max(1, finesColumnas.length);

    provisionales.forEach((item) => {
      resultado.push({ ...item, columnas });
    });

    grupo = [];
    finMaximoGrupo = -1;
  }

  ordenadas.forEach((item) => {
    if (grupo.length > 0 && item.inicioMinutos >= finMaximoGrupo) {
      cerrarGrupo();
    }

    grupo.push(item);
    finMaximoGrupo = Math.max(finMaximoGrupo, item.finMinutos);
  });

  cerrarGrupo();

  return resultado;
}

function DashboardCalendar({
  tareas,
  alCrearEnFecha,
  alEditarTarea,
}: PropiedadesDeDashboardCalendar) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() =>
    inicioDelDia(new Date())
  );
  const [vista, setVista] = useState<VistaCalendario>("semana");
  const [filtrosEstado, setFiltrosEstado] = useState<FiltrosEstado>({
    pendiente: true,
    "en-progreso": true,
    completada: true,
  });
  const contenidoPrincipalRef = useRef<HTMLDivElement>(null);

  const hoy = useMemo(() => inicioDelDia(new Date()), []);

  const tareasConFecha = useMemo(
    () =>
      tareas
        .map((tarea) => ({
          tarea,
          fecha: fechaLocalDesdeValor(tarea.fechaLimite),
        }))
        .filter(
          (
            item
          ): item is {
            tarea: Tarea;
            fecha: Date;
          } => item.fecha !== null
        )
        .filter(({ tarea }) => filtrosEstado[tarea.estado]),
    [tareas, filtrosEstado]
  );

  const tareasPorFecha = useMemo(() => {
    const mapa = new Map<string, Tarea[]>();

    tareasConFecha.forEach(({ tarea, fecha }) => {
      const clave = claveFecha(fecha);
      const existentes = mapa.get(clave) ?? [];
      existentes.push(tarea);
      mapa.set(clave, existentes);
    });

    mapa.forEach((lista) => {
      lista.sort((a, b) => {
        const rangoA = rangoHorarioDeTarea(a);
        const rangoB = rangoHorarioDeTarea(b);

        if (rangoA && rangoB && rangoA.inicioMinutos !== rangoB.inicioMinutos) {
          return rangoA.inicioMinutos - rangoB.inicioMinutos;
        }

        if (rangoA && !rangoB) return -1;
        if (!rangoA && rangoB) return 1;

        const ordenPrioridad = { alta: 0, media: 1, baja: 2 };
        return ordenPrioridad[a.prioridad] - ordenPrioridad[b.prioridad];
      });
    });

    return mapa;
  }, [tareasConFecha]);

  const proximaTarea = useMemo(() => {
    return (
      [...tareasConFecha]
        .filter(
          ({ fecha, tarea }) =>
            fecha >= hoy && tarea.estado !== "completada"
        )
        .sort((a, b) => {
          const diferenciaFecha = a.fecha.getTime() - b.fecha.getTime();
          if (diferenciaFecha !== 0) return diferenciaFecha;

          const rangoA = rangoHorarioDeTarea(a.tarea);
          const rangoB = rangoHorarioDeTarea(b.tarea);

          if (rangoA && rangoB) {
            return rangoA.inicioMinutos - rangoB.inicioMinutos;
          }

          if (rangoA) return -1;
          if (rangoB) return 1;
          return 0;
        })[0] ?? null
    );
  }, [tareasConFecha, hoy]);

  const cantidadSinFecha = useMemo(
    () => tareas.filter((tarea) => !fechaLocalDesdeValor(tarea.fechaLimite)).length,
    [tareas]
  );

  const cantidadConFechaSinHorario = useMemo(
    () =>
      tareasConFecha.filter(
        ({ tarea }) => rangoHorarioDeTarea(tarea) === null
      ).length,
    [tareasConFecha]
  );

  const diasMiniMes = useMemo(
    () => construirDiasMes(fechaSeleccionada),
    [fechaSeleccionada]
  );

  useEffect(() => {
    if (vista === "mes") return;

    const contenedor = contenidoPrincipalRef.current;
    if (!contenedor) return;

    const ahora = new Date();
    const claveHoy = claveFecha(ahora);
    const diasVisibles =
      vista === "semana"
        ? construirDiasSemana(fechaSeleccionada)
        : [fechaSeleccionada];
    const incluyeHoy = diasVisibles.some(
      (dia) => claveFecha(dia) === claveHoy
    );
    const minutosObjetivo = incluyeHoy
      ? ahora.getHours() * 60 + ahora.getMinutes()
      : 8 * 60;

    const selectorGrilla =
      vista === "semana"
        ? ".dashboard-calendar__semana-cuerpo"
        : ".dashboard-calendar__dia-grilla";
    const grilla = contenedor.querySelector<HTMLElement>(selectorGrilla);

    if (grilla) {
      const rectContenedor = contenedor.getBoundingClientRect();
      const rectGrilla = grilla.getBoundingClientRect();
      const posicionGrilla =
        contenedor.scrollTop + rectGrilla.top - rectContenedor.top;
      const margenSuperior = ALTO_HORA * 1.5;

      contenedor.scrollTop = Math.max(
        0,
        posicionGrilla +
          (minutosObjetivo / 60) * ALTO_HORA -
          margenSuperior
      );
    }

    if (vista === "semana") {
      const claveObjetivo = incluyeHoy
        ? claveHoy
        : claveFecha(fechaSeleccionada);
      const cabecera = contenedor.querySelector<HTMLElement>(
        `[data-calendar-day="${claveObjetivo}"]`
      );

      if (cabecera) {
        const rectContenedor = contenedor.getBoundingClientRect();
        const rectCabecera = cabecera.getBoundingClientRect();
        const posicionCabecera =
          contenedor.scrollLeft + rectCabecera.left - rectContenedor.left;

        contenedor.scrollLeft = Math.max(
          0,
          posicionCabecera - 64
        );
      }
    }
  }, [fechaSeleccionada, vista]);

  function alternarEstado(estado: keyof FiltrosEstado) {
    setFiltrosEstado((actual) => ({
      ...actual,
      [estado]: !actual[estado],
    }));
  }

  function navegar(direccion: -1 | 1) {
    if (vista === "dia") {
      setFechaSeleccionada((actual) => sumarDias(actual, direccion));
      return;
    }

    if (vista === "semana") {
      setFechaSeleccionada((actual) => sumarDias(actual, direccion * 7));
      return;
    }

    setFechaSeleccionada((actual) => sumarMeses(actual, direccion));
  }

  function solicitarCreacionEnFecha(fecha: Date) {
    const fechaNormalizada = inicioDelDia(fecha);
    setFechaSeleccionada(fechaNormalizada);

    // Taskify actualmente no permite crear nuevas tareas con fecha límite pasada.
    if (fechaNormalizada < hoy) return;

    alCrearEnFecha(claveFecha(fechaNormalizada));
  }

  function solicitarCreacionEnHorario(
    fecha: Date,
    evento: React.MouseEvent<HTMLDivElement>
  ) {
    const fechaNormalizada = inicioDelDia(fecha);
    setFechaSeleccionada(fechaNormalizada);

    if (fechaNormalizada < hoy) return;

    const { horaInicio, horaFin } = rangoInicialDesdeClick(evento);

    alCrearEnFecha(
      claveFecha(fechaNormalizada),
      horaInicio,
      horaFin
    );
  }

  function renderTarea(tarea: Tarea, compacta = false) {
    const rango = rangoHorarioDeTarea(tarea);

    return (
      <article
        key={tarea.id}
        className={`dashboard-calendar__tarea ${prioridadClase(tarea.prioridad)} ${
          compacta ? "dashboard-calendar__tarea--compacta" : ""
        }`}
        title={`${tarea.titulo} · ${textoEstado(tarea.estado)} · Prioridad ${tarea.prioridad} · Clic para editar`}
        role="button"
        tabIndex={0}
        onClick={(evento) => {
          evento.stopPropagation();
          alEditarTarea(tarea);
        }}
        onKeyDown={(evento) => {
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            evento.stopPropagation();
            alEditarTarea(tarea);
          }
        }}
      >
        <strong>{tarea.titulo}</strong>
        {!compacta && (
          <>
            {rango && (
              <span>
                {tarea.horaInicio}–{tarea.horaFin}
              </span>
            )}
            <span>{textoEstado(tarea.estado)}</span>
            <small>Prioridad {tarea.prioridad}</small>
          </>
        )}
      </article>
    );
  }

  function renderTareaHoraria(colocacion: TareaColocada) {
    const { tarea, inicioMinutos, finMinutos, columna, columnas } = colocacion;
    const alto = Math.max(
      ((finMinutos - inicioMinutos) / 60) * ALTO_HORA,
      34
    );
    const izquierda = (columna / columnas) * 100;
    const ancho = 100 / columnas;

    return (
      <article
        key={tarea.id}
        className={`dashboard-calendar__evento-horario ${prioridadClase(
          tarea.prioridad
        )}`}
        style={{
          top: `${(inicioMinutos / 60) * ALTO_HORA}px`,
          height: `${alto}px`,
          left: `calc(${izquierda}% + 4px)`,
          width: `calc(${ancho}% - 8px)`,
        }}
        title={`${tarea.titulo} · ${tarea.horaInicio}–${tarea.horaFin} · ${textoEstado(
          tarea.estado
        )} · Clic para editar`}
        role="button"
        tabIndex={0}
        onClick={(evento) => {
          evento.stopPropagation();
          alEditarTarea(tarea);
        }}
        onKeyDown={(evento) => {
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            evento.stopPropagation();
            alEditarTarea(tarea);
          }
        }}
      >
        <span className="dashboard-calendar__evento-hora">
          {tarea.horaInicio}–{tarea.horaFin}
        </span>
        <strong>{tarea.titulo}</strong>
        <small>{textoEstado(tarea.estado)}</small>
      </article>
    );
  }

  function renderEjeHoras() {
    return (
      <div className="dashboard-calendar__eje-horas" aria-hidden="true">
        {HORAS_DIA.map((hora) => (
          <span key={hora}>{etiquetaHora(hora)}</span>
        ))}
      </div>
    );
  }

  function renderFondoHoras() {
    return (
      <div className="dashboard-calendar__fondo-horas" aria-hidden="true">
        {HORAS_DIA.map((hora) => (
          <div key={hora} />
        ))}
      </div>
    );
  }

  function separarTareasDelDia(tareasDelDia: Tarea[]) {
    return {
      conHorario: tareasDelDia.filter(
        (tarea) => rangoHorarioDeTarea(tarea) !== null
      ),
      sinHorario: tareasDelDia.filter(
        (tarea) => rangoHorarioDeTarea(tarea) === null
      ),
    };
  }

  function renderVistaDia() {
    const clave = claveFecha(fechaSeleccionada);
    const tareasDelDia = tareasPorFecha.get(clave) ?? [];
    const { conHorario, sinHorario } = separarTareasDelDia(tareasDelDia);
    const colocadas = distribuirTareasHorarias(conHorario);

    return (
      <div className="dashboard-calendar__dia-horario">
        <div className="dashboard-calendar__dia-resumen">
          <div className="dashboard-calendar__dia-cabecera">
            <span>{DIAS_SEMANA_CORTOS[fechaSeleccionada.getDay()]}</span>
            <strong>{fechaSeleccionada.getDate()}</strong>
          </div>

          <section className="dashboard-calendar__sin-horario-dia">
            <div className="dashboard-calendar__sin-horario-titulo">
              <strong>Sin horario</strong>
              <span>{sinHorario.length}</span>
            </div>

            {sinHorario.length > 0 ? (
              <div className="dashboard-calendar__sin-horario-lista">
                {sinHorario.map((tarea) => renderTarea(tarea, true))}
              </div>
            ) : (
              <small>No hay tareas sin horario para este día.</small>
            )}
          </section>
        </div>

        <div className="dashboard-calendar__dia-grilla">
          {renderEjeHoras()}

          <div
            className="dashboard-calendar__columna-horaria"
            data-calendar-date={clave}
            onClick={(evento) =>
              solicitarCreacionEnHorario(fechaSeleccionada, evento)
            }
          >
            {renderFondoHoras()}
            {colocadas.map((colocacion) => renderTareaHoraria(colocacion))}
          </div>
        </div>
      </div>
    );
  }

  function renderVistaSemana() {
    const dias = construirDiasSemana(fechaSeleccionada);

    return (
      <div className="dashboard-calendar__semana-horaria">
        <div className="dashboard-calendar__semana-cabecera">
          <span className="dashboard-calendar__semana-esquina">Hora</span>

          {dias.map((dia) => {
            const clave = claveFecha(dia);
            const esHoy = clave === claveFecha(hoy);

            return (
              <header
                key={clave}
                data-calendar-day={clave}
                className={
                  esHoy
                    ? "dashboard-calendar__semana-dia-cabecera dashboard-calendar__semana-dia-cabecera--hoy"
                    : "dashboard-calendar__semana-dia-cabecera"
                }
              >
                <span>{DIAS_SEMANA_CORTOS[dia.getDay()]}</span>
                <strong>{dia.getDate()}</strong>
              </header>
            );
          })}
        </div>

        <div className="dashboard-calendar__semana-sin-horario">
          <div className="dashboard-calendar__sin-horario-etiqueta">
            Sin horario
          </div>

          {dias.map((dia) => {
            const clave = claveFecha(dia);
            const tareasDelDia = tareasPorFecha.get(clave) ?? [];
            const { sinHorario } = separarTareasDelDia(tareasDelDia);

            return (
              <div
                key={clave}
                className="dashboard-calendar__sin-horario-celda"
              >
                {sinHorario.length > 0 ? (
                  sinHorario.map((tarea) => renderTarea(tarea, true))
                ) : (
                  <span>—</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="dashboard-calendar__semana-cuerpo">
          {renderEjeHoras()}

          {dias.map((dia) => {
            const clave = claveFecha(dia);
            const tareasDelDia = tareasPorFecha.get(clave) ?? [];
            const { conHorario } = separarTareasDelDia(tareasDelDia);
            const colocadas = distribuirTareasHorarias(conHorario);
            const esHoy = clave === claveFecha(hoy);

            return (
              <div
                key={clave}
                className={`dashboard-calendar__columna-horaria ${
                  esHoy ? "dashboard-calendar__columna-horaria--hoy" : ""
                }`}
                data-calendar-date={clave}
                onClick={(evento) =>
                  solicitarCreacionEnHorario(dia, evento)
                }
              >
                {renderFondoHoras()}
                {colocadas.map((colocacion) =>
                  renderTareaHoraria(colocacion)
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderVistaMes() {
    const dias = construirDiasMes(fechaSeleccionada);
    const mesVisible = fechaSeleccionada.getMonth();

    return (
      <div className="dashboard-calendar__mes">
        {DIAS_SEMANA_CORTOS.map((dia) => (
          <span key={dia} className="dashboard-calendar__mes-dia-semana">
            {dia}
          </span>
        ))}

        {dias.map((dia) => {
          const clave = claveFecha(dia);
          const tareasDelDia = tareasPorFecha.get(clave) ?? [];
          const fueraDeMes = dia.getMonth() !== mesVisible;
          const esHoy = clave === claveFecha(hoy);
          const seleccionada = clave === claveFecha(fechaSeleccionada);

          return (
            <div
              key={clave}
              role="button"
              tabIndex={0}
              aria-label={`Crear tarea para ${clave}`}
              className={[
                "dashboard-calendar__mes-celda",
                fueraDeMes ? "dashboard-calendar__mes-celda--fuera" : "",
                esHoy ? "dashboard-calendar__mes-celda--hoy" : "",
                seleccionada ? "dashboard-calendar__mes-celda--seleccionada" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => solicitarCreacionEnFecha(dia)}
              onKeyDown={(evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                  evento.preventDefault();
                  solicitarCreacionEnFecha(dia);
                }
              }}
            >
              <span className="dashboard-calendar__mes-numero">{dia.getDate()}</span>
              <div className="dashboard-calendar__mes-tareas">
                {tareasDelDia.slice(0, 3).map((tarea) => renderTarea(tarea, true))}
                {tareasDelDia.length > 3 && (
                  <small>+{tareasDelDia.length - 3} más</small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="dashboard-layout__contenido dashboard-calendar">
      <div className="dashboard-calendar__layout">
        <aside className="dashboard-calendar__lateral">
          <section className="dashboard-calendar__panel dashboard-calendar__mini">
            <div className="dashboard-calendar__mini-cabecera">
              <strong>
                {MESES[fechaSeleccionada.getMonth()]} {fechaSeleccionada.getFullYear()}
              </strong>
              <button type="button" onClick={() => setFechaSeleccionada(hoy)}>
                Hoy
              </button>
            </div>

            <div className="dashboard-calendar__mini-grid dashboard-calendar__mini-grid--cabecera">
              {DIAS_SEMANA_MINI.map((dia, indice) => (
                <span key={`${dia}-${indice}`}>{dia}</span>
              ))}
            </div>

            <div className="dashboard-calendar__mini-grid">
              {diasMiniMes.map((dia) => {
                const clave = claveFecha(dia);
                const esSeleccionado = clave === claveFecha(fechaSeleccionada);
                const esHoy = clave === claveFecha(hoy);
                const fueraDeMes =
                  dia.getMonth() !== fechaSeleccionada.getMonth();
                const tieneTareas = (tareasPorFecha.get(clave)?.length ?? 0) > 0;

                return (
                  <button
                    type="button"
                    key={clave}
                    className={[
                      esSeleccionado ? "seleccionado" : "",
                      esHoy ? "hoy" : "",
                      fueraDeMes ? "fuera" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setFechaSeleccionada(dia)}
                  >
                    {dia.getDate()}
                    {tieneTareas && <i aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="dashboard-calendar__panel dashboard-calendar__recordatorio">
            <span className="dashboard-calendar__eyebrow">Próxima tarea</span>
            {proximaTarea ? (
              <>
                <strong>{proximaTarea.tarea.titulo}</strong>
                <span>
                  {DIAS_SEMANA_CORTOS[proximaTarea.fecha.getDay()]},{" "}
                  {proximaTarea.fecha.getDate()} de{" "}
                  {MESES[proximaTarea.fecha.getMonth()]}
                  {rangoHorarioDeTarea(proximaTarea.tarea) && (
                    <> · {proximaTarea.tarea.horaInicio}</>
                  )}
                </span>
                <small>
                  {textoEstado(proximaTarea.tarea.estado)} · Prioridad{" "}
                  {proximaTarea.tarea.prioridad}
                </small>
                <button
                  type="button"
                  className="dashboard-calendar__recordatorio-abrir"
                  onClick={() => alEditarTarea(proximaTarea.tarea)}
                >
                  Abrir tarea
                </button>
              </>
            ) : (
              <p>No hay tareas próximas con fecha límite.</p>
            )}
          </section>

          <section className="dashboard-calendar__panel dashboard-calendar__filtros">
            <div className="dashboard-calendar__panel-titulo">
              <strong>Filtros</strong>
              <span>{tareasConFecha.length} con fecha</span>
            </div>

            <label>
              <input
                type="checkbox"
                checked={filtrosEstado.pendiente}
                onChange={() => alternarEstado("pendiente")}
              />
              Pendientes
            </label>

            <label>
              <input
                type="checkbox"
                checked={filtrosEstado["en-progreso"]}
                onChange={() => alternarEstado("en-progreso")}
              />
              En progreso
            </label>

            <label>
              <input
                type="checkbox"
                checked={filtrosEstado.completada}
                onChange={() => alternarEstado("completada")}
              />
              Completadas
            </label>

            <div className="dashboard-calendar__sin-fecha">
              <span>Sin fecha límite</span>
              <strong>{cantidadSinFecha}</strong>
            </div>

            <div className="dashboard-calendar__sin-fecha">
              <span>Con fecha, sin horario</span>
              <strong>{cantidadConFechaSinHorario}</strong>
            </div>
          </section>
        </aside>

        <section className="dashboard-calendar__principal">
          <div className="dashboard-calendar__toolbar">
            <div className="dashboard-calendar__navegacion">
              <button
                type="button"
                aria-label="Período anterior"
                onClick={() => navegar(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Período siguiente"
                onClick={() => navegar(1)}
              >
                ›
              </button>
              <h2>{tituloPeriodo(fechaSeleccionada, vista)}</h2>
            </div>

            <div className="dashboard-calendar__vistas" aria-label="Vista de calendario">
              {(["dia", "semana", "mes"] as VistaCalendario[]).map((opcion) => (
                <button
                  type="button"
                  key={opcion}
                  className={vista === opcion ? "activo" : ""}
                  onClick={() => setVista(opcion)}
                >
                  {opcion === "dia"
                    ? "Día"
                    : opcion === "semana"
                      ? "Semana"
                      : "Mes"}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={contenidoPrincipalRef}
            className="dashboard-calendar__contenido-principal"
          >
            {vista === "dia" && renderVistaDia()}
            {vista === "semana" && renderVistaSemana()}
            {vista === "mes" && renderVistaMes()}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardCalendar;
