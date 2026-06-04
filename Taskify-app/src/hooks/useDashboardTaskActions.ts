import type { Dispatch, SetStateAction } from "react";
import type { EstadoTarea, Tarea, TareaNueva } from "../types/task";

type ResultadoAccion = void | Promise<void>;

type ParametrosUseDashboardTaskActions = {
  tareasActivas: Tarea[];
  crearTarea: (datos: TareaNueva) => ResultadoAccion;
  editarTarea: (id: string, datos: TareaNueva) => ResultadoAccion;
  cambiarEstadoTarea: (id: string, nuevoEstado: EstadoTarea) => ResultadoAccion;
  moverAPapelera: (id: string) => ResultadoAccion;
  restaurarDePapelera: (id: string) => ResultadoAccion;
  eliminarPermanentemente: (id: string) => ResultadoAccion;
  vaciarPapelera: () => ResultadoAccion;
  setMostrarFormulario: Dispatch<SetStateAction<boolean>>;
  alertaExito: (mensaje: string, titulo?: string) => void;
  alertaInfo: (mensaje: string, titulo?: string) => void;
  alertaAdvertencia: (mensaje: string, titulo?: string) => void;
  alertaError: (mensaje: string, titulo?: string) => void;
};

export function useDashboardTaskActions({
  tareasActivas,
  crearTarea,
  editarTarea,
  cambiarEstadoTarea,
  moverAPapelera,
  restaurarDePapelera,
  eliminarPermanentemente,
  vaciarPapelera,
  setMostrarFormulario,
  alertaExito,
  alertaInfo,
  alertaAdvertencia,
  alertaError,
}: ParametrosUseDashboardTaskActions) {
  async function manejarCreacion(datos: TareaNueva) {
    await crearTarea(datos);
    alertaExito(`"${datos.titulo}" fue agregada.`, "Tarea creada");
    setMostrarFormulario(false);
  }

  async function manejarEdicion(id: string, datos: TareaNueva) {
    await editarTarea(id, datos);
    alertaExito("Los cambios fueron guardados.", "Tarea editada");
  }

  async function manejarCambioEstado(id: string, nuevoEstado: EstadoTarea) {
    await cambiarEstadoTarea(id, nuevoEstado);

    if (nuevoEstado === "completada") {
      alertaExito("¡Tarea completada!", "Completada");
    } else {
      alertaInfo("Estado actualizado.", "Actualizado");
    }
  }

  async function manejarMoverPapelera(id: string) {
    const tarea = tareasActivas.find((t) => t.id === id);
    await moverAPapelera(id);
    alertaAdvertencia(`"${tarea?.titulo ?? "Tarea"}" movida a la papelera.`, "Eliminada");
  }

  async function manejarRestaurar(id: string) {
    await restaurarDePapelera(id);
    alertaExito("Tarea restaurada.", "Restaurada");
  }

  async function manejarEliminarPermanente(id: string) {
    await eliminarPermanentemente(id);
    alertaError("Tarea eliminada definitivamente.", "Eliminada");
  }

  async function manejarVaciar() {
    await vaciarPapelera();
    alertaError("Papelera vaciada.", "Vaciada");
  }

  return {
    manejarCreacion,
    manejarEdicion,
    manejarCambioEstado,
    manejarMoverPapelera,
    manejarRestaurar,
    manejarEliminarPermanente,
    manejarVaciar,
  };
}