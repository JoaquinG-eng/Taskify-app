import { cerrarSesion } from "../services/authService";
import { enviarResumenDeTareas } from "../services/emailService";
import { swalConfirmar, swalExito, swalError } from "../utils/sweetAlerts";
import type { Tarea } from "../types/task";

type ParametrosUseDashboardSessionActions = {
  emailUsuario: string;
  nombreUsuario: string;
  tareasActivas: Tarea[];
  tareasEnPapelera: Tarea[];
  setEnviandoEmail: (valor: boolean) => void;
};

export function useDashboardSessionActions({
  emailUsuario,
  nombreUsuario,
  tareasActivas,
  tareasEnPapelera,
  setEnviandoEmail,
}: ParametrosUseDashboardSessionActions) {
  async function manejarLogout() {
    const ok = await swalConfirmar(
      "¿Cerrar sesión?",
      "Vas a salir de tu cuenta de Taskify",
      "Sí, salir"
    );

    if (!ok) return;

    await cerrarSesion();
  }

  async function manejarEnviarEmail() {
    if (!emailUsuario) {
      await swalError("Sin email", "No se encontró un email asociado a tu cuenta.");
      return;
    }

    const ok = await swalConfirmar(
      "¿Enviar resumen?",
      `Se enviará un resumen de tus ${tareasActivas.length} tarea${tareasActivas.length !== 1 ? "s" : ""} a ${emailUsuario}`,
      "Sí, enviar"
    );

    if (!ok) return;

    setEnviandoEmail(true);

    try {
      await enviarResumenDeTareas(
        emailUsuario,
        nombreUsuario,
        [...tareasActivas, ...tareasEnPapelera]
      );

      await swalExito("¡Email enviado!", `Revisá tu bandeja en ${emailUsuario}`);
    } catch (error: unknown) {
      await swalError("Error al enviar", (error as Error).message);
    } finally {
      setEnviandoEmail(false);
    }
  }

  return {
    manejarLogout,
    manejarEnviarEmail,
  };
}