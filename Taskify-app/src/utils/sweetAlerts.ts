// ============================================================
// ARCHIVO: src/utils/sweetAlerts.ts
// ============================================================

import Swal from "sweetalert2";

const SwalTaskify = Swal.mixin({
  background: "#13111f",
  color:      "#f0f0f8",
  confirmButtonColor: "#7c5af6",
  cancelButtonColor:  "#374151",
  customClass: {
    popup:         "swal-Taskify__popup",
    title:         "swal-Taskify__titulo",
    htmlContainer: "swal-Taskify__contenido",
    icon:          "swal-Taskify__icono",
    actions:       "swal-Taskify__acciones",
  },
  showClass:  { popup: "swal-Taskify--entrando" },
  hideClass:  { popup: "swal-Taskify--saliendo" },
});

export function swalExito(titulo: string, texto?: string) {
  return SwalTaskify.fire({
    icon: "success", title: titulo, text: texto,
    timer: 2200, timerProgressBar: true, showConfirmButton: false,
  });
}

export function swalError(titulo: string, texto?: string) {
  return SwalTaskify.fire({
    icon: "error", title: titulo, text: texto,
    confirmButtonText: "Entendido",
  });
}

export async function swalConfirmar(
  titulo: string, texto: string, textoBoton = "Confirmar"
): Promise<boolean> {
  const result = await SwalTaskify.fire({
    icon: "warning", title: titulo, text: texto,
    showCancelButton: true,
    confirmButtonText: textoBoton,
    cancelButtonText:  "Cancelar",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function swalInfo(titulo: string, texto?: string) {
  return SwalTaskify.fire({
    icon: "info", title: titulo, text: texto,
    confirmButtonText: "OK",
  });
}

export function alertaLoginExitoso(nombreOEmail: string) {
  return SwalTaskify.fire({
    icon: "success", title: "¡Bienvenido/a!",
    text: `Ingresaste como ${nombreOEmail}`,
    timer: 2000, timerProgressBar: true, showConfirmButton: false,
  });
}

export function alertaErrorDeAutenticacion(mensaje: string) {
  return SwalTaskify.fire({
    icon: "error", title: "Error de autenticación",
    text: mensaje, confirmButtonText: "Entendido",
  });
}

export async function alertaRecuperacionForm(): Promise<string | null> {
  const result = await SwalTaskify.fire({
    icon: "question", title: "Recuperar contraseña",
    text: "Ingresá tu email y te enviaremos un link para restablecer tu contraseña.",
    input: "email", inputPlaceholder: "tu@email.com",
    showCancelButton: true,
    confirmButtonText: "Enviar link",
    cancelButtonText:  "Cancelar",
    inputValidator: (value) => {
      if (!value) return "El email es obligatorio.";
      if (!/\S+@\S+\.\S+/.test(value)) return "Ingresá un email válido.";
    },
  });
  return result.isConfirmed ? (result.value as string) : null;
}

export function alertaRecuperacionEnviada(email: string) {
  return SwalTaskify.fire({
    icon: "success", title: "Email enviado",
    text: `Revisá tu bandeja de entrada en ${email}.`,
    confirmButtonText: "OK",
  });
}

export function alertaRegistroExitoso(nombre: string) {
  return SwalTaskify.fire({
    icon: "success", title: "¡Cuenta creada!",
    text: `Bienvenido/a, ${nombre}. Ya podés usar Taskify.`,
    timer: 2200, timerProgressBar: true, showConfirmButton: false,
  });
}

export async function alertaConfirmarRegistro(email: string): Promise<boolean> {
  const result = await SwalTaskify.fire({
    icon: "warning", title: "¿Crear tu cuenta?",
    text: `Se creará una cuenta para ${email}`,
    showCancelButton: true,
    confirmButtonText: "Sí, crear cuenta",
    cancelButtonText:  "Cancelar",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function confirmarEliminarPermanentemente(tituloTarea: string): Promise<boolean> {
  const result = await SwalTaskify.fire({
    icon: "warning", title: "¿Eliminar definitivamente?",
    text: `"${tituloTarea}" se borrará para siempre.`,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText:  "Cancelar",
    confirmButtonColor: "#ef4444",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function confirmarVaciarPapelera(cantidad: number): Promise<boolean> {
  const result = await SwalTaskify.fire({
    icon: "warning", title: "¿Vaciar la papelera?",
    text: `Se eliminarán ${cantidad} tarea${cantidad !== 1 ? "s" : ""} permanentemente.`,
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText:  "Cancelar",
    confirmButtonColor: "#ef4444",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

// ============================================================
// TOAST
// ============================================================
export const SwalToast = Swal.mixin({
  toast: true, position: "top-end",
  showConfirmButton: false, timer: 3000, timerProgressBar: true,
  background: "#13111f", color: "#f0f0f8",
});