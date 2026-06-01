# Mitake - Task Management App 🚀

¡Hola! Este es mi proyecto **Mitake**, una aplicación moderna e interactiva para la gestión de tareas. La construí desde cero enfocándome no solo en que sea funcional, sino en que tenga un diseño visual increíble: un estilo oscuro (dark mode) muy elegante, efectos de glassmorphism, transparencias y micro-animaciones en cada rincón.

## ✨ Características principales

### 📊 Dashboard estadístico
La pantalla principal te recibe con tarjetas de estadísticas que te muestran de un vistazo cómo vienes con tu productividad: Total de tareas creadas, Pendientes, En progreso y Completadas.

### 📋 Tablero Kanban dinámico
Tus tareas se organizan automáticamente en un tablero Kanban con tres columnas:
- **Pendientes:** Lo que falta por hacer.
- **En progreso:** En lo que estás trabajando actualmente.
- **Completadas:** ¡Misión cumplida!

Dentro de cada columna, las tareas se auto-ordenan según su nivel de prioridad (**Alta**, **Media** y **Baja**) para que siempre sepas qué atacar primero.

### ⏱️ Barra de Progreso y Simulación Automática
Cada tarjeta de tarea ("TaskCard") incluye una barra de progreso visual. Lo más interesante es que cuando una tarea pasa al estado "En progreso", entra en juego un timer automático: el progreso va aumentando un 10% por su cuenta cada pocos segundos. ¡Al llegar al 100%, la tarea se marca a sí misma como Completada y cambia de columna mágicamente!

### 📝 Creación y Edición Detallada
Creé un componente de formulario súper flexible que funciona tanto para crear tareas nuevas como para editarlas:
- Puedes asignar título, descripción, prioridad, estado y una fecha límite (con un input de calendario estilizado).
- Incluye validaciones visuales en tiempo real. Si intentas enviar el formulario con errores, los inputs cambian de color, te avisan qué falta y ¡el formulario hace una animación de "temblor" (shake) para avisarte!

### 🗑️ Papelera de Reciclaje Segura
Para evitar desastres, si eliminas una tarea no desaparece para siempre, sino que se mueve a una "Papelera". Desde ahí tienes el control total:
- Puedes restaurar la tarea (vuelve a donde estaba).
- Eliminarla de forma permanente (una por una).
- Hacer limpieza total con el botón de "Vaciar papelera".

### 📜 Activity Feed (Historial de Actividades)
Tengo un feed lateral que registra cada paso que das. Si creas una tarea, si la editas, si llega al 100% o si la mandas a la papelera, todo queda documentado con la hora exacta en un historial visual.

### 💾 Persistencia Local (LocalStorage)
Toda tu información (tareas y actividades) se guarda automáticamente en el `localStorage` del navegador a través de hooks personalizados (`useTasks`). Puedes recargar la página o cerrar el navegador sin miedo a perder tu información.

## 🛠️ Tecnologías y Arquitectura

- **React:** Toda la UI está construida en componentes funcionales reutilizables, gestionando estado complejo con Hooks.
- **TypeScript:** Tipado estricto (types e interfaces) para asegurar que el código sea predecible y escalable.
- **Vite:** Herramienta de compilación para tener un entorno de desarrollo rapidísimo.
- **Vanilla CSS (CSS3 puro):** En lugar de atarme a frameworks como Tailwind o Bootstrap, todo el diseño y las animaciones complejas las hice escribiendo CSS desde cero. Usé variables CSS (`--var`), Flexbox, CSS Grid, selectores avanzados y animaciones `@keyframes`.

## 🚀 Cómo correr el proyecto localmente

Para probar Mitake en tu computadora:

1. Asegúrate de tener Node.js instalado.
2. Abre una terminal.
3. Entra a la carpeta del proyecto ejecutando:
   ```bash
   cd mitake-app
   ```
4. Instala las dependencias:
   ```bash
   npm install
   ```
5. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
6. Abre la URL que te arroje la terminal (generalmente `http://localhost:5173`) en tu navegador.

---
*Escrito y desarrollado por mí, para el Proyecto M4.*
