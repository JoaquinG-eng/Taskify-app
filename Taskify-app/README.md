# 🚀 Taskify

Taskify es una aplicación web moderna para la gestión de tareas desarrollada con **React, TypeScript y Firebase**, diseñada para ofrecer una experiencia visual intuitiva mediante un tablero Kanban, seguimiento de progreso, historial de actividades y almacenamiento en la nube.

---

## ⚡ IMPORTANTE - Antes de comenzar

Si o si es desde la raiz de Taskify porque si se instalan las dependencias desde otro lugar no funciona nada

```bash
cd ProyectoM4-JoaquinGonzalezFT73/Taskify-app 


link proyecto: https://proyecto-m4-joaquingonzalez-ft-73.vercel.app/
```

**Todos los comandos deben ejecutarse desde esta carpeta.** Si no ejecutas `cd Taskify-app`, los comandos `npm`, `npm run`, etc. fallarán.

---

## 📌 Descripción

La aplicación permite a los usuarios organizar su trabajo mediante tareas clasificadas por estado y prioridad, manteniendo sincronización en tiempo real gracias a Firestore.

### Funcionalidades principales

- ✅ Crear tareas
- ✏️ Editar tareas
- 🗑️ Enviar tareas a papelera
- ♻️ Restaurar tareas eliminadas
- 📊 Visualización Kanban
- 🔄 Cambio de estados
- ⭐ Prioridades Alta / Media / Baja
- 📈 Seguimiento de progreso
- 📝 Historial de actividades
- 📧 Envío de resumen por email
- 🔐 Autenticación con Firebase
- 👤 Login con Google
- ☁️ Firestore en tiempo real
- 📎 Integración preparada para AWS S3

### ⚙️ Organización dinámica de tareas

**Taskify organiza automáticamente tus tareas en tiempo real:**

- **Por estado**: Las tareas se distribuyen automáticamente en 3 columnas Kanban
  - Pendiente (sin comenzar)
  - En Progreso (trabajando)
  - Completada (terminada)

- **Por prioridad**: Dentro de cada estado, se ordenan por importancia
  - 🔴 Alta (críticas, hacer primero)
  - 🟡 Media (importantes)
  - 🟢 Baja (pueden esperar)

- **Por progreso**: El avance porcentual (0-100%) se sincroniza al instante
  - 0% = Pendiente automáticamente
  - 1-99% = En Progreso automáticamente
  - 100% = Completada automáticamente

- **Por fecha**: Tareas con fechas límite próximas se destacan
  - Cálculo automático de días restantes
  - Alertas visuales para vencimientos

- **Papelera inteligente**: Las tareas eliminadas se guardan automáticamente
  - No se pierden datos (soft delete)
  - Recuperables en cualquier momento
  - Se limpian permanentemente cuando lo desees

- **Sincronización en vivo con Firestore**:
  - Los cambios aparecen al instante en todos los dispositivos
  - Si editas desde otro navegador, se actualiza aquí automáticamente
  - Sin necesidad de refrescar la página

### 🔍 Búsqueda y filtrado

El sistema permite encontrar tareas rápidamente:

- Buscar por texto en título o descripción
- Filtrar por estado específico (o todas)
- Filtrar por nivel de prioridad (o todas)
- Filtrar por rango de fechas
- Mostrar solo tareas activas o en papelera
- Limpiar todos los filtros con un clic

---

## 🛠️ Tecnologías

### Frontend

- React
- TypeScript
- Vite
- React Router DOM
- CSS3

### Backend & Cloud

- Firebase Authentication
- Cloud Firestore
- AWS S3
- AWS SES
- Vercel Functions

### Testing

- Vitest
- React Testing Library
- Coverage V8

### Herramientas

- ESLint
- SweetAlert2
- dotenv

---

## 🏗️ Arquitectura

```text
Usuario
   │
   ▼
React + TypeScript
   │
   ├── Hooks personalizados
   ├── Context API
   ├── Componentes reutilizables
   │
   ▼
Firebase Auth
Firestore
   │
   ▼
Sincronización en tiempo real

AWS SES
   │
   ▼
Envío de correos

AWS S3
   │
   ▼
Archivos adjuntos
```

---

## 📋 Estados de las tareas

Las tareas pueden encontrarse en tres estados:

- Pendiente
- En progreso
- Completada

El tablero Kanban organiza automáticamente las tareas según su estado y prioridad.

---

## ⭐ Prioridades

| Prioridad | Color       |
| --------- | ----------- |
| Alta      | 🔴 Rojo     |
| Media     | 🟡 Amarillo |
| Baja      | 🟢 Verde    |

---

## 📂 Estructura del proyecto

```text
src/
├── components/
├── context/
├── firebase/
├── hooks/
├── pages/
├── routes/
├── services/
├── styles/
├── types/
├── utils/
└── ASSETS/
```

---

## 🪝 Hooks personalizados

### useAuth

Gestiona la autenticación mediante Firebase.

### useTasks

Gestiona:

- CRUD de tareas
- Actividades
- Papelera
- Sincronización Firestore

### useAlert

Sistema global de alertas.

### useFormValidation

Validación reutilizable de formularios.

---

## 🔧 Servicios

### authService

Operaciones de autenticación:

- Registro
- Login
- Google Sign In
- Recuperación de contraseña
- Logout

### taskService

CRUD completo sobre Firestore.

### emailService

Envío de resumen de tareas mediante AWS SES.

### awsService

Gestión de archivos mediante AWS S3.

---

## 💾 Base de datos

Firestore almacena las tareas de cada usuario.

### Colección

```text
tasks
```

### Documento

```typescript
{
  id: string
  userId: string
  titulo: string
  descripcion: string
  estado: string
  prioridad: string
  progreso: number
  fechaCreacion: string
  fechaLimite?: string
  estaEnPapelera: boolean
}
```

---

## 🔐 Variables de entorno

### Firebase

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### AWS

```env
VITE_AWS_REGION=
VITE_AWS_ACCESS_KEY_ID=
VITE_AWS_SECRET_ACCESS_KEY=
VITE_AWS_BUCKET_NAME=
```

### Backend (Vercel)

```env
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## 🚀 Instalación

### ⚠️ Paso previo: Navegar a la raíz del proyecto

Antes de hacer cualquier cosa, **debes estar en la carpeta raíz `Taskify-app`**:

```bash
# Desde la terminal, navega hasta la carpeta del proyecto

cd Taskify-app

# Verifica que estés en el lugar correcto
ls
# Deberías ver: src/, tests/, package.json, README.md, etc.
```

Si ejecutas los comandos desde otra carpeta, obtendrás errores como:

```
error: package.json not found
error: vite config not found
```

### 1. Clonar repositorio

```bash
git clone <https://github.com/JoaquinG-eng/ProyectoM4_JoaquingonzalezFT73.git>

# Luego navega a la raíz
cd ProyectoM4_JoaquingonzalezFT73/Taskify-app
```

### 2. Instalar dependencias

```bash
# Asegúrate de estar en Taskify-app/
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz (`Taskify-app/.env.local`):

```bash
# Desde la raíz del proyecto
touch .env.local

# Luego abre el archivo y agrega:
VITE_FIREBASE_API_KEY=tu_clave_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 4. Iniciar la aplicación en desarrollo

```bash
# Asegúrate de estar en Taskify-app/
npm run dev
```

Abrir en el navegador:

```text
http://localhost:5173

O en producción:
https://proyecto-m4-joaquingonzalez-ft-73.vercel.app/
```

---

## 🧪 Scripts disponibles

**Importante**: Ejecuta todos estos comandos desde la raíz del proyecto (`Taskify-app/`)

```bash
# Desarrollo
npm run dev              # Inicia servidor Vite en puerto 5173

# Build
npm run build            # Compila para producción

# Preview
npm run preview          # Previsualiza el build localmente

# Linting
npm run lint             # Verifica errores de código

# Testing
npm run test             # Ejecuta tests en modo watch
npm run test:coverage    # Ejecuta tests + reporte de cobertura
```

---

## 📈 Funcionalidades implementadas

- Sistema Kanban
- Gestión de tareas
- Papelera de reciclaje
- Historial de actividades en tiempo real
- Seguimiento de progreso con porcentaje
- Prioridades y estados configurables
- Autenticación con Firebase
- Sincronización bidireccional con Firestore
- Notificaciones vía SweetAlert2
- Integración con AWS SES para emails

---

## 📖 Guía de uso

### Comprender el tablero Kanban

El tablero muestra 3 columnas que se actualizan automáticamente:

| Pendiente               | En Progreso             | Completada          |
| ----------------------- | ----------------------- | ------------------- |
| Tareas sin iniciar      | Trabajando en ellas     | Terminadas          |
| 0% progreso             | 1-99% progreso          | 100% progreso       |
| Ordenadas por prioridad | Ordenadas por prioridad | Ordenadas por fecha |

**Las tareas se mueven automáticamente** entre columnas según el progreso que indiques.

### Crear una tarea

1. Haz clic en el botón **"Nueva tarea"** o usa el atajo
2. Completa el formulario con:
   - **Título** (requerido) - máx 100 caracteres
   - **Descripción** (requerido) - máx 500 caracteres
   - **Prioridad** (Alta / Media / Baja) - por defecto "Media"
   - **Fecha límite** (opcional) - para tareas con deadline
3. Haz clic en **"Crear"**
4. La tarea aparece automáticamente en la columna **Pendiente**

**Nota**: El sistema asigna automáticamente:

- Estado: Pendiente
- Progreso: 0%
- Fecha de creación (hoy)
- Propietario: tu usuario

### Actualizar progreso (lo más importante)

La **barra de progreso es dinámica**:

1. Selecciona una tarea
2. Mueve la barra de progreso (0-100%)
3. El sistema **automáticamente**:
   - Recalcula el estado de la tarea
   - La mueve a otra columna
   - Registra la actividad
   - Sincroniza con Firestore

**Ejemplos de cambios automáticos:**

```
Si pones 0% → La tarea va a "Pendiente"
Si pones 50% → La tarea va a "En Progreso"
Si pones 99% → La tarea sigue en "En Progreso"
Si pones 100% → La tarea va a "Completada" ✅
```

### Gestionar tareas - Operaciones comunes

| Acción                | Cómo hacerlo                        | Efecto                                     |
| --------------------- | ----------------------------------- | ------------------------------------------ |
| Editar                | Haz clic en ✏️                      | Abre modal, puedes cambiar todos los datos |
| Cambiar estado        | Mueve el slider progreso            | Se actualiza automáticamente               |
| Eliminar (seguro)     | Haz clic en 🗑️                      | Va a Papelera, recuperable                 |
| Restaurar             | Ve a Papelera → Restaurar           | Vuelve a tareas activas                    |
| Eliminar para siempre | Papelera → Eliminar definitivamente | No se puede recuperar                      |
| Vaciar papelera       | Papelera → Vaciar todo              | Elimina todas las tareas archivadas        |

### Búsqueda y filtrado inteligente

El sistema busca en **tiempo real** mientras escribes:

1. **Búsqueda por texto**: Escribe en la barra, busca en títulos y descripciones
2. **Filtrar por estado**: Solo Pendiente, o solo En Progreso, etc.
3. **Filtrar por prioridad**: Solo tareas Altas, o todas
4. **Filtrar por fecha**: Tareas entre dos fechas
5. **Ver papelera**: Mostrar/ocultar tareas eliminadas

**Ejemplo**: Si buscas "firebase" + filtras por "Alta", verás solo tareas altas que mencionen firebase.

### Feed de actividades en vivo

El panel **Actividad** registra automáticamente:

- ✅ Cuando creas una tarea
- ✏️ Cuando editas datos
- 📈 Cuando cambias el progreso
- 🔄 Cuando cambias el estado
- 🗑️ Cuando mueves a papelera
- ♻️ Cuando restauras
- 🧹 Cuando vacías la papelera

**Cada actividad muestra**:

- Ícono del tipo de acción
- Descripción clara en español
- Hora exacta (HH:MM)

Las actividades se guardan en `localStorage` de tu navegador, así que si cierras la app, los últimos 30 eventos se recuperan.

### Estadísticas en tiempo real

El dashboard muestra automáticamente:

- Total de tareas activas
- Tareas completadas hoy
- Promedio de progreso
- Próximas a vencer

---

## 🧪 Testing

### Ejecución de tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test

# Ejecutar tests con cobertura
npm run test:coverage

```

### Cobertura actual

- **Statements**: 92.28%
- **Branches**: 80.4%
- **Functions**: 91.91%
- **Lines**: 93.88%

### Archivos testeados

- ✅ `src/services/taskService.ts` (100% - 9 tests)
- ✅ `src/hooks/useTasks.ts` (91.66% - 8 tests)
- ✅ `src/context/AlertContext.tsx` (69.23% - 4 tests)
- ✅ `src/pages/login and register/LoginPage.tsx` (80.43% - 5 tests)
- ✅ `src/components/tasks/TaskForm.tsx` (90.47% - 9 tests)
- ✅ `src/components/tasks/TaskCard.tsx` (88% - 10 tests)
- ✅ Todos los hooks y servicios auxiliares

### Ejecutar test específico

```bash
npm run test -- --run tests/TaskForm.test.tsx
npx vitest run tests/taskService.test.ts
```

---

## 🚀 Deployment

### En Vercel (Recomendado)

1. Conecta el repositorio a Vercel
2. Configura variables de entorno en Vercel:
   - Todas las `VITE_*` para Firebase y AWS
   - Las `AWS_*` para las serverless functions
3. Vercel construye automáticamente con `npm run build`
4. Los endpoints `/api/*` apuntan a `api/sendEmail.ts`

### Variables de entorno en Vercel

```env
VITE_FIREBASE_API_KEY=tu_clave
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_clave
AWS_SECRET_ACCESS_KEY=tu_secreto
```

### En desarrollo local

```bash
# Crear .env.local
cp .env.example .env.local

# Completar con tus credenciales
# Luego:
npm run dev
```

---

## 📂 Estructura detallada

```
src/
├── components/
│   ├── kanban/
│   │   └── KanbanBoard/      # Tablero principal Kanban
│   ├── layout/
│   │   ├── Sidebar/          # Navegación lateral
│   │   └── Topbar/           # Barra superior
│   ├── tasks/
│   │   ├── TaskCard/         # Tarjeta de tarea individual
│   │   └── TaskForm/         # Formulario crear/editar
│   └── ui/
│       ├── ActivityFeed/     # Feed de actividades
│       ├── Alert/            # Alertas visuales
│       ├── Modal/            # Diálogos modales
│       └── StatCard/         # Tarjetas de estadísticas
├── context/
│   └── AlertContext.tsx      # Estado global de alertas
├── hooks/
│   ├── useAuth.ts            # Autenticación
│   ├── useAlert.ts           # Alertas
│   ├── useTasks.ts           # CRUD y estado de tareas
│   ├── useFormValidation.ts  # Validación de formularios
│   └── useTickets.ts         # Gestión de tickets (futuro)
├── pages/
│   ├── about/                # Página acerca de
│   ├── dashboard/            # Página principal
│   ├── login and register/   # Autenticación
│   └── papelera/             # Gestor de papelera
├── routes/
│   └── ProtectedRoute.tsx    # Rutas privadas
├── services/
│   ├── authService.ts        # Firebase Auth
│   ├── taskService.ts        # Firestore operations
│   ├── emailService.ts       # AWS SES
│   └── awsService.ts         # AWS S3
├── styles/
│   ├── animations.css        # Transiciones
│   ├── globals.css           # Estilos globales
│   ├── variables.css         # Paleta de colores
│   └── sweetalert-taskify.css # Estilos SweetAlert
├── types/
│   ├── actividad.ts          # Tipo actividad
│   ├── task.ts               # Tipo tarea
│   └── index.ts              # Exportaciones
├── utils/
│   ├── formatDate.ts         # Formato de fechas
│   ├── prioridad.ts          # Helpers prioridad
│   ├── sweetAlerts.ts        # Wrapper SweetAlert2
│   └── validaciones.ts       # Validaciones comunes
├── firebase/
│   └── firebase.ts           # Config Firebase
├── ASSETS/
│   └── taskify_logo.jpg      # Logo principal
└── main.tsx                  # Punto de entrada
```

---

## 🔑 Variables clave en tipos

### Tipo: Tarea

```typescript
interface Tarea {
  id: string; // ID único Firestore
  userId: string; // Propietario
  titulo: string; // Nombre tarea
  descripcion: string; // Detalles
  estado: "pendiente" | "en-progreso" | "completada";
  prioridad: "alta" | "media" | "baja";
  fechaCreacion: string; // ISO 8601
  fechaLimite?: string; // Opcional
  progreso: number; // 0-100
  estaEnPapelera: boolean; // Soft delete flag
  fechaEliminacion?: string; // Cuándo se movió
  asignadoA?: string; // Email asignado
  creadoPor?: string; // Usuario creador
}
```

### Tipo: Actividad

```typescript
interface Actividad {
  id: string; // ID único
  tipo: TipoActividad; // Categoría evento
  descripcion: string; // Qué pasó
  hora: string; // HH:MM formato local
}

type TipoActividad =
  | "tarea_creada"
  | "tarea_editada"
  | "tarea_completada"
  | "tarea_en_progreso"
  | "tarea_papelera"
  | "tarea_restaurada"
  | "tarea_eliminada"
  | "papelera_vaciada";
```

---

## 🐛 Troubleshooting

### "Error: Firebase no inicializado"

**Solución**: Verifica que `.env.local` tiene todas las variables `VITE_FIREBASE_*`

```bash
# Revisa que existan:
echo $VITE_FIREBASE_PROJECT_ID
```

### "Las tareas no se sincronizan"

1. Abre DevTools → Pestaña Network
2. Verifica que hay requests a `firestore.googleapis.com`
3. En Firestore Console, confirma que la colección `tasks` existe
4. Revisa permisos de lectura/escritura en Firestore Rules

### "Email no se envía"

Pasos:

1. Verifica credenciales AWS en `.env.local` / Vercel
2. Confirma que el email está verificado en AWS SES (modo sandbox)
3. Revisa los logs de `/api/sendEmail.ts` en servidor Vercel
4. Asegúrate que `VITE_BACKEND_URL` apunta correctamente

### "Tests fallan con 'toBeInTheDocument'"

**Solución**: Ya está arreglado en `src/setupTests.ts`, pero si reaparece:

```bash
npm install @testing-library/jest-dom --save-dev
npm run test -- --run
```

---

## 📊 Performance

### Optimizaciones implementadas

- ✅ Lazy loading de páginas con React Router
- ✅ Memoización de componentes con `memo()`
- ✅ Hooks optimizados con dependencias correctas
- ✅ CSS modular para evitar conflictos
- ✅ Compresión automática en Vercel

### Métricas recomendadas

```bash
npm run build
# Ver tamaño del bundle generado
```

---

## 🤝 Contribuir

### Pasos para contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Haz commits: `git commit -am 'Agregué...'`
4. Push a rama: `git push origin feature/mi-feature`
5. Abre un Pull Request

### Estándares de código

- Usar TypeScript estricto
- Componentes funcionales con hooks
- Nombres descriptivos en español (convención del proyecto)
- Cobertura de tests >90%
- Linting con ESLint: `npm run lint`

---

## 🔮 Próximas funcionalidades

- Drag & Drop entre columnas
- Sistema de comentarios en tareas
- Etiquetas y categorías personalizadas
- Tableros colaborativos
- Notificaciones push
- Exportación a PDF/Excel
- Integración Google Calendar
- Dashboard con gráficos
- Modo offline
- Sistema de tickets

**Última actualización**

## Cambios recientes implementados

En esta última iteración del proyecto Taskify, se realizaron mejoras en la experiencia de usuario, interfaz y validaciones del sistema:

### 1.Personalización del Dashboard (Saludo dinámico)
Se implementó un sistema de saludo dinámico según la hora del día:
Buenos días ☀️
Buenas tardes 🌤️
Buenas noches 🌙

Sistema de saludo según la hora

El sistema detecta la hora del usuario y muestra un saludo diferente automáticamente:
 
```typescript
 function obtenerSaludo(): string {
  const hora = new Date().getHours();

  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}
```

El título principal ahora incluye el nombre del usuario y un saludo dinámico:

```typescript
titulo: `${obtenerSaludo()}, ${nombreUsuario} 👋`
```
### Ejemplo final en pantalla

**Buenos días, Juan 👋**

**Qué bueno tenerte nuevamente por aquí.**
**Tienes 3 tareas pendientes para continuar avanzando.**


### 2. Mejoras en la interfaz del Sidebar
Se integró correctamente el botón de cierre de sesión.
Se añadió iconografía más clara y moderna para acciones del sistema.
Se mejoró la organización visual del perfil de usuario.

### 3. Corrección de errores y estabilidad del proyecto
Se resolvieron errores de TypeScript en:
Tests de servicios (sendEmail, taskService)
Validaciones de formulario
Tipado de requests mock en testing
Se corrigieron incompatibilidades con vi.mock en Vitest.

### 4. Tests y cobertura
Se corrigieron fallos en tests de:
Envío de emails con AWS SES
Validaciones de título y descripción
Contextos de alertas
Se mejoró la estabilidad general del test suite.

### 5. Git y control de versiones
Se solucionaron problemas con .gitignore:
node_modules
coverage
.env
Se corrigió el seguimiento de archivos innecesarios en Git.

### 6. UX general
Se refinó el lenguaje de la aplicación para hacerlo  como más Cercano

Ejemplo:

“Qué bueno tenerte nuevamente por aquí” en lugar de mensajes fríos tipo dashboard genérico.

### Resultado final

Taskify ahora cuenta con:

Interfaz más amigable 
Mensajes personalizados por usuario 
Mejor experiencia de navegación 
Tests más estables 
Código más limpio y mantenible 

---

## Mejoras futuras

- Drag & Drop real en Kanban
- Compartir tareas entre usuarios
- Tableros colaborativos
- Comentarios en tareas
- Categorías y etiquetas
- Notificaciones
- Exportación PDF y Excel
- Integración con Google Calendar
- Modo Offline
- Dashboard avanzado

---

## 👨‍💻 Autor

Joaquin gonzalez FT73

Proyecto desarrollado como aplicación de gestión de tareas moderna utilizando React, TypeScript, Firebase y AWS.
