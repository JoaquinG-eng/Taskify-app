interface StatCardProps {
  titulo: string;
  valor: string;
  descripcion: string;
  variante?: "primary" | "warning" | "default";
}

function StatCard({
  titulo,
  valor,
  descripcion,
  variante = "default",
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variante}`}>
      <p className="stat-card__titulo">{titulo}</p>
      <p className="stat-card__valor">{valor}</p>
      <p className="stat-card__descripcion">{descripcion}</p>
    </div>
  );
}

export default StatCard;