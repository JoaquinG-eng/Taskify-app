import "./AboutPage.css";
import logoTaskify from "../../ASSETS/taskify_logo.jpg";

interface TecnologiaItem {
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

interface FuncionalidadItem {
  titulo: string;
  descripcion: string;
  icono: string;
}

const stackTecnologico: TecnologiaItem[] = [
  {
    nombre: "React 19",
    descripcion: "UI declarativa y reactiva para la app",
    icono: "⚛️",
    color: "#61dafb",
  },
  {
    nombre: "TypeScript",
    descripcion: "Tipado estricto para mayor robustez",
    icono: "📘",
    color: "#3178c6",
  },
  {
    nombre: "Firebase",
    descripcion: "Auth, Firestore y sincronización en tiempo real",
    icono: "🔥",
    color: "#ffa000",
  },
  {
    nombre: "Vite",
    descripcion: "Herramienta de desarrollo rápida y moderna",
    icono: "⚡",
    color: "#646cff",
  },
  {
    nombre: "AWS SES",
    descripcion: "Envío de correos electrónicos en producción",
    icono: "📧",
    color: "#ff9900",
  },
  {
    nombre: "Vitest",
    descripcion: "Testing rápido con cobertura y jest-dom",
    icono: "✓",
    color: "#6e9f18",
  },
];

const funcionalidades: FuncionalidadItem[] = [
  {
    titulo: "Tablero Kanban",
    descripcion: "Organiza tareas por columnas con estados claros.",
    icono: "📋",
  },
  {
    titulo: "Gestión de tareas",
    descripcion: "Crear, editar, mover y completar tareas fácilmente.",
    icono: "📝",
  },
  {
    titulo: "Papelera ✔",
    descripcion: "Recupera tareas eliminadas sin perder información.",
    icono: "🗑️",
  },
  {
    titulo: "Seguimiento de progreso",
    descripcion: "Visualiza el avance de cada tarea con barras y estado.",
    icono: "📈",
  },
  {
    titulo: "Autenticación",
    descripcion: "Acceso seguro con Firebase Auth y Google Sign-In.",
    icono: "🔐",
  },
  {
    titulo: "Feed de actividad",
    descripcion: "Registra todas las acciones de usuario en tiempo real.",
    icono: "🧾",
  },
];

function AboutPage() {
  return (
    <div className="about">
      <div className="about__hero">
       <div className="about__hero-logo">
  <img
    src={logoTaskify}
    alt="Taskify Logo"
    className="about__hero-logo-img"
  />
</div>

        <div className="about__hero-texto">
          <h1 className="about__hero-titulo">Taskify</h1>

          <p className="about__hero-version">
            Versión 1.0 — React • TypeScript • Firebase • AWS
          </p>

          <p className="about__hero-descripcion">
            Aplicación moderna de gestión de tareas basada en un tablero
            Kanban. Diseñada para ofrecer una experiencia intuitiva,
            sincronización en tiempo real y una arquitectura escalable
            utilizando tecnologías modernas del ecosistema web.
          </p>
        </div>
      </div>

      <div className="about__grid">
        <section className="about__seccion">
          <h2 className="about__seccion-titulo">⚙ Stack tecnológico</h2>

          <div className="about__stack-lista">
            {stackTecnologico.map((tecnologiaActual) => (
              <div
                key={tecnologiaActual.nombre}
                className="about__stack-item"
              >
                <div
                  className="about__stack-icono"
                  style={{ color: tecnologiaActual.color }}
                >
                  {tecnologiaActual.icono}
                </div>

                <div className="about__stack-info">
                  <span className="about__stack-nombre">
                    {tecnologiaActual.nombre}
                  </span>

                  <span className="about__stack-descripcion">
                    {tecnologiaActual.descripcion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="about__seccion">
          <h2 className="about__seccion-titulo">🧠 Metodología</h2>

          <div className="about__metodologia">

            <div className="about__metodologia-item">
              <h3 className="about__metodologia-titulo">
                Frontend First
              </h3>

              <p className="about__metodologia-texto">
                El proyecto comenzó siguiendo una estrategia Frontend First
                para validar la experiencia de usuario, la navegación y los
                flujos de trabajo. Actualmente integra Firebase
                Authentication, Firestore en tiempo real, AWS SES para envío
                de correos electrónicos y una arquitectura preparada para AWS
                S3.
              </p>
            </div>

            <div className="about__metodologia-item">
              <h3 className="about__metodologia-titulo">
                Arquitectura modular
              </h3>

              <p className="about__metodologia-texto">
                La aplicación está organizada mediante componentes
                reutilizables, hooks personalizados, servicios independientes
                y tipado estricto con TypeScript. Esta estructura facilita la
                escalabilidad, el mantenimiento y la incorporación de nuevas
                funcionalidades.
              </p>
            </div>

          </div>
        </section>

      </div>

      <section className="about__seccion">
        <h2 className="about__seccion-titulo">🚀 Funcionalidades</h2>

        <div className="about__funcionalidades-grid">
          {funcionalidades.map((funcionalidadActual) => (
            <div
              key={funcionalidadActual.titulo}
              className="about__funcionalidad-card"
            >
              <div className="about__funcionalidad-icono">
                {funcionalidadActual.icono}
              </div>

              <div className="about__funcionalidad-info">
                <h3 className="about__funcionalidad-titulo">
                  {funcionalidadActual.titulo}
                </h3>

                <p className="about__funcionalidad-descripcion">
                  {funcionalidadActual.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about__seccion about__seccion--proximas">
        <h2 className="about__seccion-titulo">
          🔮 Próximas funcionalidades
        </h2>

        <div className="about__proximas-lista">
          {[
            "Drag & Drop para mover tareas entre columnas",
            "Sistema de comentarios dentro de las tareas",
            "Etiquetas y categorías personalizadas",
            "Tableros colaborativos entre usuarios",
            "Asignación de tareas a múltiples miembros",
            "Carga y visualización de archivos adjuntos con AWS S3",
            "Notificaciones y recordatorios automáticos",
            "Exportación de tareas a PDF y Excel",
            "Integración con Google Calendar",
            "Dashboard avanzado con métricas y gráficos",
            "Modo offline con sincronización posterior",
            "Sistema completo de tickets y soporte",
          ].map((proximaFuncionalidad) => (
            <div
              key={proximaFuncionalidad}
              className="about__proxima-item"
            >
              <span className="about__proxima-icono">◷</span>

              <span className="about__proxima-texto">
                {proximaFuncionalidad}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default AboutPage;