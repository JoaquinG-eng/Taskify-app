// ============================================================
// ARCHIVO: src/components/ui/ActivityFeed/ActivityFeed.tsx
// ¿Para qué sirve? Muestra el historial de acciones recientes
// del usuario en el dashboard.
// ============================================================

import type { Actividad } from "../../../types/actividad";
import { CONFIG_ACTIVIDAD } from "../../../types/actividad";
import "./ActivityFeed.css";

interface ActivityFeedProps {
  actividades: Actividad[];
}

function ActivityFeed({ actividades }: ActivityFeedProps) {
  const hay = actividades.length > 0;

  return (
    <section className="activity-feed">

      <div className="activity-feed__encabezado">
        <h2 className="activity-feed__titulo">Actividad reciente</h2>
        {hay && (
          <span className="activity-feed__contador">
            {actividades.length}
          </span>
        )}
      </div>

      {!hay && (
        <div className="activity-feed__vacio">
          <span className="activity-feed__vacio-icono">◎</span>
          <p>Sin actividad todavía.</p>
          <p>Cada acción que hagas aparecerá acá.</p>
        </div>
      )}

      {hay && (
        <ul className="activity-feed__lista">
          {actividades.map((actividad, indice) => {
            const config = CONFIG_ACTIVIDAD[actividad.tipo];
            const esLaUltima = indice === actividades.length - 1;

            return (
              <li
                key={actividad.id}
                className={`activity-feed__item ${
                  indice === 0 ? "activity-feed__item--nueva" : ""
                }`}
              >
                {/* Línea de tiempo vertical */}
                <div className="activity-feed__linea-wrap">
                  <div
                    className="activity-feed__punto"
                    style={{ background: config.color }}
                  />
                  {!esLaUltima && (
                    <div className="activity-feed__linea" />
                  )}
                </div>

                {/* Contenido */}
                <div className="activity-feed__contenido">
                  <div className="activity-feed__fila">
                    <span
                      className="activity-feed__badge"
                      style={{
                        background: `color-mix(in srgb, ${config.color} 15%, transparent)`,
                        color: config.color,
                        borderColor: `color-mix(in srgb, ${config.color} 25%, transparent)`,
                      }}
                    >
                      {config.icono} {config.etiqueta}
                    </span>
                    <span className="activity-feed__hora">
                      {actividad.hora}
                    </span>
                  </div>
                  <p className="activity-feed__descripcion">
                    {actividad.descripcion}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

    </section>
  );
}

export default ActivityFeed;