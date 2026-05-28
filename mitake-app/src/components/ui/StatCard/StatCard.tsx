// ============================================================
// ARCHIVO: src/components/ui/StatCard/StatCard.tsx
// ============================================================

import "./StatCard.css";

type StatCardProps = {
  tituloEstadistica: string;
  valorPrincipal: string | number;
  descripcionSecundaria: string;
  colorAcento: string;   // color CSS: "#10b981", "var(--color-purple)", etc.
  icono: string;
};

function StatCard({
  tituloEstadistica,
  valorPrincipal,
  descripcionSecundaria,
  colorAcento,
  icono,
}: StatCardProps) {
  return (
    <article
      className="stat-card"
      style={{ "--acento": colorAcento } as React.CSSProperties}
    >
      {/* Borde izquierdo de color */}
      <div className="stat-card__acento" />

      {/* Ícono en círculo coloreado */}
      <div className="stat-card__icono-wrap">
        <span className="stat-card__icono">{icono}</span>
      </div>

      {/* Texto */}
      <div className="stat-card__info">
        <span className="stat-card__titulo">{tituloEstadistica}</span>
        <strong className="stat-card__valor">{valorPrincipal}</strong>
        <span className="stat-card__descripcion">{descripcionSecundaria}</span>
      </div>
    </article>
  );
}

export default StatCard;