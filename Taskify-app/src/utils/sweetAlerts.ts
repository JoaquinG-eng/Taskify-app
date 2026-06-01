// ============================================================
// ARCHIVO: src/utils/sweetAlerts.ts
// ============================================================

import Swal from "sweetalert2";

const SwalMitake = Swal.mixin({
  background: "#13111f",
  color: "#f0f0f8",
  confirmButtonColor: "#7c5af6",
  cancelButtonColor: "rgba(255,255,255,0.08)",
  customClass: {
    popup: "swal-Taskifi__popup",
    title: "swal-Taskifi__titulo",
    htmlContainer: "swal-Taskifi__contenido",
    confirmButton: "swal-Taskifi__btn-confirmar",
    cancelButton: "swal-Taskifi__btn-cancelar",
    icon: "swal-Taskifi__icono",
  },
  buttonsStyling: false,
  showClass: {
    popup: "swal-Taskifi--entrando",
  },
  hideClass: {
    popup: "swal-Taskifi--saliendo",
  },
});

// ============================================================
// ALERTAS GENÉRICAS
// ============================================================

export function swalExito(
  titulo: string,
  texto?: string
) {
  return SwalMitake.fire({
    icon: "success",
    title: titulo,
    text: texto,
    timer: 2200,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

export function swalError(
  titulo: string,
  texto?: string
) {
  return SwalMitake.fire({
    icon: "error",
    title: titulo,
    text: texto,
    confirmButtonText: "Entendido",
  });
}

export function swalInfo(
  titulo: string,
  texto?: string
) {
  return SwalMitake.fire({
    icon: "info",
    title: titulo,
    text: texto,
    confirmButtonText: "OK",
  });
}

export async function swalConfirmar(
  titulo: string,
  texto: string,
  textoBoton = "Confirmar"
): Promise<boolean> {
  const result = await SwalMitake.fire({
    icon: "warning",
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: textoBoton,
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

// ============================================================
// PAPELERA
// ============================================================

export async function confirmarEliminarPermanentemente(): Promise<boolean> {
  const result = await SwalMitake.fire({
    icon: "warning",
    title: "¿Eliminar definitivamente?",
    text: "Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

export async function confirmarVaciarPapelera(): Promise<boolean> {
  const result = await SwalMitake.fire({
    icon: "warning",
    title: "¿Vaciar papelera?",
    text: "Todas las tareas serán eliminadas permanentemente.",
    showCancelButton: true,
    confirmButtonText: "Vaciar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

// ============================================================
// AUTH
// ============================================================

export function alertaLoginExitoso(
  nombreOEmail: string
) {
  return SwalMitake.fire({
    icon: "success",
    title: "¡Bienvenido/a!",
    text: `Ingresaste como ${nombreOEmail}`,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

export function alertaErrorDeAutenticacion(
  mensaje: string
) {
  return SwalMitake.fire({
    icon: "error",
    title: "Error de autenticación",
    text: mensaje,
    confirmButtonText: "Entendido",
  });
}

export async function alertaRecuperacionForm(): Promise<string | null> {
  const result = await SwalMitake.fire({
    icon: "question",
    title: "Recuperar contraseña",
    text: "Ingresá tu email y te enviaremos un link para restablecer tu contraseña.",
    input: "email",
    inputPlaceholder: "tu@email.com",
    showCancelButton: true,
    confirmButtonText: "Enviar link",
    cancelButtonText: "Cancelar",
    inputValidator: (value) => {
      if (!value) {
        return "El email es obligatorio.";
      }

      if (!/\S+@\S+\.\S+/.test(value)) {
        return "Ingresá un email válido.";
      }

      return undefined;
    },
  });

  return result.isConfirmed
    ? (result.value as string)
    : null;
}

export function alertaRecuperacionEnviada(
  email: string
) {
  return SwalMitake.fire({
    icon: "success",
    title: "Email enviado",
    text: `Revisá tu bandeja de entrada en ${email}. Si no lo ves, mirá spam.`,
    confirmButtonText: "OK",
  });
}

export async function alertaConfirmarRegistro(
  email: string
): Promise<boolean> {
  const result = await SwalMitake.fire({
    icon: "warning",
    title: "¿Crear tu cuenta?",
    text: `Se creará una cuenta para ${email}`,
    showCancelButton: true,
    confirmButtonText: "Sí, crear cuenta",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

export function alertaRegistroExitoso(
  nombre: string
) {
  return SwalMitake.fire({
    icon: "success",
    title: "¡Cuenta creada!",
    text: `Bienvenido/a, ${nombre}. Ya podés usar Mitake.`,
    timer: 2200,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

// ============================================================
// TOAST
// ============================================================

export const SwalToast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#13111f",
  color: "#f0f0f8",
  customClass: {
    popup: "swal-mitake__toast",
  },
});