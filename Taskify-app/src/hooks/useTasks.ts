import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Tarea, TareaNueva, EstadoTarea } from "../types/task";
import type { Actividad, TipoActividad } from "../types/actividad";
import {
  suscribirTareas,
  crearTareaEnFirestore,
  editarTareaEnFirestore,
  cambiarEstadoEnFirestore,
  actualizarProgresoEnFirestore,
  moverAPapelaraEnFirestore,
  restaurarDePapeleraEnFirestore,
  eliminarPermanentementeEnFirestore,
} from "../services/taskService";

const MAX_ACTIVIDADES = 30;

const ordenDePrioridad: Record<string, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

function claveActividades(uid: string): string {
  return `taskify-actividades-${uid}`;
}

function claveOrdenTareas(uid: string): string {
  return `taskify-orden-tareas-${uid}`;
}

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function horaActual(): string {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function valorPrioridad(tarea: Tarea): number {
  return ordenDePrioridad[tarea.prioridad] ?? 99;
}

function obtenerMensajeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error al actualizar las tareas.";
}

function leerActividadesGuardadas(uid: string): Actividad[] {
  try {
    const datos = localStorage.getItem(claveActividades(uid));
    return datos ? (JSON.parse(datos) as Actividad[]) : [];
  } catch {
    return [];
  }
}

function leerOrdenGuardado(uid: string): string[] {
  try {
    const datos = localStorage.getItem(claveOrdenTareas(uid));
    return datos ? (JSON.parse(datos) as string[]) : [];
  } catch {
    return [];
  }
}

function guardarOrden(uid: string, ids: string[]): void {
  try {
    localStorage.setItem(claveOrdenTareas(uid), JSON.stringify(ids));
  } catch (error) {
    console.error("No se pudo guardar el orden de las tareas:", error);
  }
}

function ordenarIdsPorPrioridad(tareas: Tarea[]): string[] {
  return [...tareas]
    .sort((a, b) => valorPrioridad(a) - valorPrioridad(b))
    .map((tarea) => tarea.id);
}

/**
 * Conserva el orden manual existente y agrega las tareas nuevas
 * dentro del bloque correspondiente a su prioridad.
 *
 * Las tareas eliminadas se retiran automáticamente del orden.
 */
function combinarOrdenExistente(
  ordenActual: string[],
  tareasActuales: Tarea[]
): string[] {
  const mapaTareas = new Map(
    tareasActuales.map((tarea) => [tarea.id, tarea])
  );

  const resultado = ordenActual.filter((id) => mapaTareas.has(id));
  const idsIncluidos = new Set(resultado);

  const tareasNuevas = tareasActuales
    .filter((tarea) => !idsIncluidos.has(tarea.id))
    .sort((a, b) => valorPrioridad(a) - valorPrioridad(b));

  for (const tareaNueva of tareasNuevas) {
    const prioridadNueva = valorPrioridad(tareaNueva);

    /*
     * Se inserta antes de la primera tarea de menor prioridad.
     * Si no existe una prioridad menor, se agrega al final.
     */
    const indiceInsercion = resultado.findIndex((id) => {
      const tareaExistente = mapaTareas.get(id);

      return (
        tareaExistente !== undefined &&
        valorPrioridad(tareaExistente) > prioridadNueva
      );
    });

    if (indiceInsercion === -1) {
      resultado.push(tareaNueva.id);
    } else {
      resultado.splice(indiceInsercion, 0, tareaNueva.id);
    }
  }

  return resultado;
}

export function useTasks(userId: string) {
  const [listaDeTareas, setListaDeTareas] = useState<Tarea[]>([]);
  const [ordenIds, setOrdenIds] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorTareas, setErrorTareas] = useState<string | null>(null);

  const [actividades, setActividades] = useState<Actividad[]>([]);

  /*
   * Evita sobrescribir las actividades de otro usuario durante
   * el render en el que cambia userId.
   */
  const omitirGuardadoActividades = useRef(false);

  useEffect(() => {
    omitirGuardadoActividades.current = true;

    if (!userId) {
      setActividades([]);
      return;
    }

    setActividades(leerActividadesGuardadas(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    if (omitirGuardadoActividades.current) {
      omitirGuardadoActividades.current = false;
      return;
    }

    try {
      localStorage.setItem(
        claveActividades(userId),
        JSON.stringify(actividades)
      );
    } catch (error) {
      console.error("No se pudieron guardar las actividades:", error);
    }
  }, [actividades, userId]);

  /*
   * Suscripción en tiempo real a Firestore.
   *
   * Primera carga:
   * - usa el orden guardado, si existe;
   * - de lo contrario, ordena por prioridad.
   *
   * Siguientes cambios:
   * - conserva el orden manual;
   * - elimina IDs que ya no existen;
   * - inserta tareas nuevas según su prioridad.
   */
  useEffect(() => {
    if (!userId) {
      setListaDeTareas([]);
      setOrdenIds([]);
      setCargando(false);
      setErrorTareas(null);
      return;
    }

    setCargando(true);
    setErrorTareas(null);
    setListaDeTareas([]);

    const ordenGuardado = leerOrdenGuardado(userId);
    setOrdenIds(ordenGuardado);

    let esPrimeraEmision = true;

    const cancelar = suscribirTareas(
      userId,
      (tareas) => {
        setListaDeTareas(tareas);

        setOrdenIds((ordenAnterior) => {
          let nuevoOrden: string[];

          if (esPrimeraEmision) {
            nuevoOrden =
              ordenGuardado.length > 0
                ? combinarOrdenExistente(ordenGuardado, tareas)
                : ordenarIdsPorPrioridad(tareas);

            esPrimeraEmision = false;
          } else {
            nuevoOrden = combinarOrdenExistente(
              ordenAnterior,
              tareas
            );
          }

          guardarOrden(userId, nuevoOrden);
          return nuevoOrden;
        });

        setCargando(false);
        setErrorTareas(null);
      },
      (error) => {
        setErrorTareas(error.message);
        setCargando(false);
      }
    );

    return () => cancelar();
  }, [userId]);

  /*
   * Une los datos actuales de Firestore con el orden de IDs.
   * Si por una actualización transitoria falta algún ID, se agrega
   * al final ordenado por prioridad.
   */
  const tareasOrdenadas = useMemo(() => {
    const mapaTareas = new Map(
      listaDeTareas.map((tarea) => [tarea.id, tarea])
    );

    const ordenadas = ordenIds
      .map((id) => mapaTareas.get(id))
      .filter((tarea): tarea is Tarea => tarea !== undefined);

    const idsOrdenados = new Set(
      ordenadas.map((tarea) => tarea.id)
    );

    const faltantes = listaDeTareas
      .filter((tarea) => !idsOrdenados.has(tarea.id))
      .sort((a, b) => valorPrioridad(a) - valorPrioridad(b));

    return [...ordenadas, ...faltantes];
  }, [listaDeTareas, ordenIds]);

  const tareasActivas = useMemo(
    () => tareasOrdenadas.filter((tarea) => !tarea.estaEnPapelera),
    [tareasOrdenadas]
  );

  const tareasEnPapelera = useMemo(
    () => tareasOrdenadas.filter((tarea) => tarea.estaEnPapelera),
    [tareasOrdenadas]
  );

  const registrarActividad = useCallback(
    (tipo: TipoActividad, descripcion: string) => {
      const nuevaActividad: Actividad = {
        id: generarId(),
        tipo,
        descripcion,
        hora: horaActual(),
      };

      setActividades((anteriores) =>
        [nuevaActividad, ...anteriores].slice(0, MAX_ACTIVIDADES)
      );
    },
    []
  );

  const manejarError = useCallback((error: unknown) => {
    const mensaje = obtenerMensajeError(error);
    console.error(error);
    setErrorTareas(mensaje);
  }, []);

  function crearTarea(datosNuevos: TareaNueva): void {
    if (!userId) {
      setErrorTareas("No hay un usuario autenticado.");
      return;
    }

    registrarActividad(
      "tarea_creada",
      `Creaste "${datosNuevos.titulo}"`
    );

    void crearTareaEnFirestore(userId, datosNuevos).catch(
      manejarError
    );
  }

  function editarTarea(
    identificador: string,
    datosEditados: TareaNueva
  ): void {
    registrarActividad(
      "tarea_editada",
      `Editaste "${datosEditados.titulo}"`
    );

    void editarTareaEnFirestore(
      identificador,
      datosEditados
    ).catch(manejarError);
  }

  function cambiarEstadoTarea(
    identificador: string,
    nuevoEstado: EstadoTarea
  ): void {
    const tarea = listaDeTareas.find(
      (elemento) => elemento.id === identificador
    );

    let progreso = tarea?.progreso ?? 0;

    if (nuevoEstado === "completada") progreso = 100;
    if (nuevoEstado === "pendiente") progreso = 0;
    if (nuevoEstado === "en-progreso" && progreso === 0) {
      progreso = 10;
    }

    const nombre = tarea ? `"${tarea.titulo}"` : "una tarea";

    if (nuevoEstado === "completada") {
      registrarActividad(
        "tarea_completada",
        `Completaste ${nombre}`
      );
    }

    if (nuevoEstado === "en-progreso") {
      registrarActividad(
        "tarea_en_progreso",
        `${nombre} pasó a en progreso`
      );
    }

    if (nuevoEstado === "pendiente") {
      registrarActividad(
        "tarea_pendiente",
        `${nombre} volvió a pendiente`
      );
    }

    /*
     * Actualización optimista para que el movimiento de columna
     * se vea de inmediato, sin esperar la respuesta de Firestore.
     */
    setListaDeTareas((anteriores) =>
      anteriores.map((elemento) =>
        elemento.id === identificador
          ? {
              ...elemento,
              estado: nuevoEstado,
              progreso,
            }
          : elemento
      )
    );

    void cambiarEstadoEnFirestore(
      identificador,
      nuevoEstado,
      progreso
    ).catch(manejarError);
  }

  function actualizarProgreso(
    identificador: string,
    porcentajeNuevo: number
  ): void {
    const progreso = Math.min(
      100,
      Math.max(0, porcentajeNuevo)
    );

    const estado: EstadoTarea =
      progreso === 100
        ? "completada"
        : progreso > 0
          ? "en-progreso"
          : "pendiente";

    const tarea = listaDeTareas.find(
      (elemento) => elemento.id === identificador
    );

    if (progreso >= 100 && tarea?.progreso !== 100) {
      registrarActividad(
        "tarea_completada",
        `"${tarea?.titulo ?? "Tarea"}" llegó al 100%`
      );
    }

    setListaDeTareas((anteriores) =>
      anteriores.map((elemento) =>
        elemento.id === identificador
          ? {
              ...elemento,
              progreso,
              estado,
            }
          : elemento
      )
    );

    void actualizarProgresoEnFirestore(
      identificador,
      progreso,
      estado
    ).catch(manejarError);
  }

  function moverAPapelera(identificador: string): void {
    const tarea = listaDeTareas.find(
      (elemento) => elemento.id === identificador
    );

    registrarActividad(
      "tarea_papelera",
      `"${tarea?.titulo ?? "Tarea"}" fue a la papelera`
    );

    void moverAPapelaraEnFirestore(identificador).catch(
      manejarError
    );
  }

  function restaurarDePapelera(identificador: string): void {
    const tarea = listaDeTareas.find(
      (elemento) => elemento.id === identificador
    );

    registrarActividad(
      "tarea_restaurada",
      `Restauraste "${tarea?.titulo ?? "Tarea"}"`
    );

    void restaurarDePapeleraEnFirestore(
      identificador
    ).catch(manejarError);
  }

  function eliminarPermanentemente(
    identificador: string
  ): void {
    const tarea = listaDeTareas.find(
      (elemento) => elemento.id === identificador
    );

    registrarActividad(
      "tarea_eliminada",
      `Eliminaste "${tarea?.titulo ?? "Tarea"}" definitivamente`
    );

    void eliminarPermanentementeEnFirestore(
      identificador
    ).catch(manejarError);
  }

  function vaciarPapelera(): void {
    const cantidad = tareasEnPapelera.length;

    if (cantidad === 0) return;

    registrarActividad(
      "papelera_vaciada",
      `Vaciaste la papelera (${cantidad} tarea${
        cantidad !== 1 ? "s" : ""
      })`
    );

    void Promise.all(
      tareasEnPapelera.map((tarea) =>
        eliminarPermanentementeEnFirestore(tarea.id)
      )
    ).catch(manejarError);
  }

  const reordenarTareas = useCallback(
    (nuevoOrden: Tarea[]) => {
      const nuevosIds = nuevoOrden.map((tarea) => tarea.id);

      setOrdenIds(nuevosIds);

      if (userId) {
        guardarOrden(userId, nuevosIds);
      }
    },
    [userId]
  );

  return {
    listaDeTareas: tareasOrdenadas,
    tareasActivas,
    tareasEnPapelera,
    cargando,
    errorTareas,
    actividades,
    crearTarea,
    editarTarea,
    cambiarEstadoTarea,
    actualizarProgreso,
    moverAPapelera,
    restaurarDePapelera,
    eliminarPermanentemente,
    vaciarPapelera,
    reordenarTareas,
  };
}