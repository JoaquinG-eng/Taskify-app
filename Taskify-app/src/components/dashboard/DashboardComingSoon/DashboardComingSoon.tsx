type PropiedadesDeDashboardComingSoon = {
  icono?: string;
  titulo: string;
  descripcion: string;
};

function DashboardComingSoon({
  icono = "◈",
  titulo,
  descripcion,
}: PropiedadesDeDashboardComingSoon) {
  return (
    <div className="dashboard-layout__contenido">
      <div className="dashboard-layout__proximamente">
        <span className="dashboard-layout__proximamente-icono">{icono}</span>
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
      </div>
    </div>
  );
}

export default DashboardComingSoon;