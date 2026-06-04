import StatCard from "../../ui/StatCard/StatCard";

type PropiedadesDeDashboardStats = {
  totalTareas: number;
  tareasPendientes: number;
  tareasEnProgreso: number;
  tareasCompletadas: number;
};

function DashboardStats({
  totalTareas,
  tareasPendientes,
  tareasEnProgreso,
  tareasCompletadas,
}: PropiedadesDeDashboardStats) {
  return (
    <div className="dashboard-layout__estadisticas">
      <StatCard
        tituloEstadistica="Total"
        valorPrincipal={totalTareas}
        descripcionSecundaria="Tareas creadas"
        colorAcento="#8b5cf6"
        icono="📋"
      />

      <StatCard
        tituloEstadistica="Pendientes"
        valorPrincipal={tareasPendientes}
        descripcionSecundaria="Por comenzar"
        colorAcento="#3b82f6"
        icono="⏳"
      />

      <StatCard
        tituloEstadistica="En progreso"
        valorPrincipal={tareasEnProgreso}
        descripcionSecundaria="Trabajando"
        colorAcento="#f59e0b"
        icono="🔄"
      />

      <StatCard
        tituloEstadistica="Completadas"
        valorPrincipal={tareasCompletadas}
        descripcionSecundaria="Finalizadas"
        colorAcento="#10b981"
        icono="✅"
      />
    </div>
  );
}

export default DashboardStats;