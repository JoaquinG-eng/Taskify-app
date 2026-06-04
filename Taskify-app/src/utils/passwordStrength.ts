export type FuerzaPassword = {
  nivel: number;
  etiqueta: string;
  color: string;
};

export function calcularFuerzaPassword(password: string): FuerzaPassword {
  if (password.length === 0) {
    return { nivel: 0, etiqueta: "", color: "transparent" };
  }

  if (password.length < 6) {
    return { nivel: 1, etiqueta: "Débil", color: "#ef4444" };
  }

  if (password.length < 10) {
    return { nivel: 2, etiqueta: "Media", color: "#f59e0b" };
  }

  return { nivel: 3, etiqueta: "Fuerte", color: "#10b981" };
}