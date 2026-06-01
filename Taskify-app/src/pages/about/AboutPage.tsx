 import "./AboutPage.css";

// ------------------------------------------------------------
// DATOS DEL STACK TECNOLÓGICO
// ------------------------------------------------------------
const stackTecnologico = [
  { nombre: "React",        descripcion: "Librería UI",          icono: "⚛",  color: "#61dafb" },
  { nombre: "TypeScript",   descripcion: "Tipado estático",       icono: "TS", color: "#3178c6" },
  { nombre: "Vite",         descripcion: "Build tool",            icono: "⚡", color: "#646cff" },
  { nombre: "Firebase",     descripcion: "Auth + Database",       icono: "🔥", color: "#ffca28" },
  { nombre: "Vercel",       descripcion: "Deploy",                icono: "▲",  color: "#ffffff" },
  { nombre: "localStorage", descripcion: "Persistencia local",    icono: "💾", color: "#5dcaa5" },
];

// ------------------------------------------------------------
// DATOS DE FUNCIONALIDADES
// ------------------------------------------------------------
const funcionalidades = [
  { icono: "✓",  titulo: "Gestión de tareas",     descripcion: "Crear, editar, completar y organizar tareas con prioridades." },
  { icono: "◈",  titulo: "Tablero Kanban",         descripcion: "Vista en columnas: Por hacer, En progreso y Completadas." },
  { icono: "↑",  titulo: "Progreso visual",         descripcion: "Barra de porcentaje de avance editable en cada tarea." },
  { icono: "🗑",  titulo: "Papelera de reciclaje",  descripcion: "Las tareas eliminadas se pueden restaurar o borrar definitivamente." },
  { icono: "📊",  titulo: "Estadísticas",           descripcion: "Dashboard con métricas calculadas en tiempo real." },
  { icono: "💾",  titulo: "Persistencia local",      descripcion: "Los datos se guardan en el navegador con localStorage." },
];

// ------------------------------------------------------------
// COMPONENTE: AboutPage
// ------------------------------------------------------------
function AboutPage() {
  return (
    <div className="about">

      {/* Hero */}
      <div className="about__hero">
        <div className="about__hero-logo">T</div>
        <div className="about__hero-texto">
          <h1 className="about__hero-titulo">Taskify</h1>
          <p className="about__hero-version">Versión 1.0 — Frontend First</p>
          <p className="about__hero-descripcion">
            Gestor de tareas y tiquetera Kanban moderno. Construido con React y
            TypeScript como proyecto académico de la materia de desarrollo
            Full Stack. Diseñado para ser escalable, mantenible y con una
            experiencia de usuario profesional.
          </p>
        </div>
      </div>

      {/* Grid de dos columnas */}
      <div className="about__grid">

        {/* Stack tecnológico */}
        <section className="about__seccion">
          <h2 className="about__seccion-titulo">⚙ Stack tecnológico</h2>
          <div className="about__stack-lista">
            {stackTecnologico.map((tecnologiaActual) => (
              <div key={tecnologiaActual.nombre} className="about__stack-item">
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

        {/* Metodología */}
        <section className="about__seccion">
          <h2 className="about__seccion-titulo">🧠 Metodología</h2>
          <div className="about__metodologia">
            <div className="about__metodologia-item">
              <h3 className="about__metodologia-titulo">Frontend First</h3>
              <p className="about__metodologia-texto">
                El proyecto se desarrolla primero en frontend con estado local y
                localStorage. Una vez estabilizada la UX, se conecta Firebase
                para autenticación y base de datos en la nube.
              </p>
            </div>
            <div className="about__metodologia-item">
              <h3 className="about__metodologia-titulo">Arquitectura modular</h3>
              <p className="about__metodologia-texto">
                Componentes reutilizables con responsabilidades claras, hooks
                personalizados para la lógica de negocio, y tipos TypeScript
                para garantizar la consistencia de los datos.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Funcionalidades */}
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

      {/* Próximamente */}
      <section className="about__seccion about__seccion--proximas">
        <h2 className="about__seccion-titulo">🔮 Próximas funcionalidades</h2>
        <div className="about__proximas-lista">
          {[
            "Firebase Authentication y sesiones",
            "Firestore para persistencia en la nube",
            "Drag & Drop en el tablero Kanban",
            "Filtros y búsqueda de tareas",
            "Sistema de tickets avanzado",
            "Colaboración en equipo",
            "Notificaciones por email con AWS SES",
            "Modo oscuro / claro",
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