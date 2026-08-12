# Taskify

Taskify es una aplicación web de gestión de tareas construida con **React 19,
TypeScript, Firebase y Vercel**. El proyecto implementa autenticación,
persistencia en tiempo real, tablero Kanban, seguimiento de progreso, papelera,
actividad local y envío autenticado de resúmenes por email.
## importante:
La contraseña se mantiene fuera de Git y GitHub para no publicar una
credencial reutilizable. Debe solicitarse al propietario del proyecto.

**Aplicación en producción:**
https://takify-app-2026.vercel.app

---

## Estado actual

La aplicación se encuentra funcional y desplegada.

Validaciones confirmadas durante la preparación del proyecto:

```text
ESLint          PASS
Vitest          15/15 archivos PASS
Tests           75/75 PASS
Vite build      PASS
Email productivo POST /api/sendEmail -> HTTP 200
```

El build genera actualmente una advertencia de tamaño de bundle superior a
500 kB. No impide el funcionamiento ni el deployment y queda como mejora de
performance futura.

---

## Cuenta demo

Para revisar la aplicación puede utilizarse la siguiente identidad de prueba:

```text
Email: taskify.demo@gmail.com
Contraseña: credencial de demo no versionada
```




---

# Funcionalidades

## Autenticación

- Registro con email y contraseña.
- Inicio de sesión con email y contraseña.
- Inicio de sesión con Google.
- Recuperación de contraseña por email.
- Cierre de sesión.
- Vinculación de Google con una cuenta existente.
- Configuración de contraseña para usuarios autenticados originalmente con
  Google.
- Conservación del mismo UID de Firebase cuando se vinculan proveedores.

## Gestión de tareas

- Crear tareas.
- Editar tareas.
- Cambiar estado.
- Actualizar progreso.
- Mover tareas entre columnas mediante drag & drop.
- Prioridades Alta, Media y Baja.
- Papelera.
- Restauración desde papelera.
- Eliminación definitiva.
- Vaciado de papelera.
- Persistencia en Cloud Firestore.
- Sincronización en tiempo real.

## Dashboard

- Tablero Kanban.
- Búsqueda.
- Filtros.
- Estadísticas.
- Feed de actividad.
- Navegación lateral.
- Topbar con acciones de sesión.
- Envío de resumen por email.

## Email

- Resumen de tareas activas.
- El destinatario no es confiado al navegador.
- Autenticación del request mediante Firebase ID Token.
- Backend ejecutado como Vercel Function.
- Transporte SMTP mediante Nodemailer y Gmail.
- Renovación automática del Firebase ID Token ante un `401`.
- Reintento único para evitar duplicación de correos.

---

# Arquitectura general

Taskify separa la aplicación en cinco responsabilidades principales:

```text
┌──────────────────────────────────────────────────────────────┐
│                         Navegador                            │
│                                                              │
│  React + TypeScript                                          │
│  ├── pages                                                   │
│  ├── components                                              │
│  ├── hooks                                                   │
│  └── services cliente                                       │
└───────────────┬───────────────────────────┬──────────────────┘
                │                           │
                │ Firebase SDK              │ HTTPS
                │                           │
                ▼                           ▼
┌──────────────────────────┐      ┌────────────────────────────┐
│        Firebase          │      │       Vercel Function      │
│                          │      │                            │
│ Authentication           │      │ /api/sendEmail             │
│ Cloud Firestore          │      │                            │
└──────────────────────────┘      └──────────────┬─────────────┘
                                                │
                                                │ SMTP
                                                ▼
                                      ┌──────────────────────┐
                                      │   Gmail / Nodemailer │
                                      └──────────────────────┘
```

Además, algunos datos no críticos se mantienen únicamente en el navegador:

```text
localStorage
├── orden visual/manual de tareas
└── últimas actividades del usuario
```

Firestore sigue siendo la autoridad de las tareas.

---

# Responsabilidad de cada capa

## `src/main.tsx`

Es el punto de entrada del frontend.

Responsabilidades:

- Monta React en el elemento `#root`.
- Carga `App`.
- Inicia el árbol principal de componentes.

No contiene lógica de negocio.

---

## `src/App.tsx`

Es la autoridad principal de navegación según el estado de autenticación.

Responsabilidades:

- Consulta el estado de Firebase mediante `useAuth`.
- Decide si debe mostrar login, registro, configuración de contraseña o
  dashboard.
- Evita que el dashboard se renderice sin una sesión autenticada.
- Mantiene el flujo especial de usuarios Google que todavía no tienen
  proveedor password vinculado.
- Envuelve la aplicación con el sistema global de alertas.

### Flujo simplificado

```text
App
 |
 +-- cargando sesión --> espera
 |
 +-- usuario NO autenticado
 |     |
 |     +-- LoginPage
 |     └-- RegisterPage
 |
 +-- usuario autenticado
       |
       +-- Google sin password --> SetPasswordPage
       |
       └-- DashboardPage
```

La autenticación no depende de una ruta visual para proteger la aplicación:
la decisión se realiza directamente desde el estado real de Firebase Auth.

---

# Firebase

## `src/firebase/firebase.ts`

Centraliza la inicialización del SDK de Firebase.

Expone principalmente:

```text
auth -> Firebase Authentication
db   -> Cloud Firestore
```

La configuración web se obtiene desde variables `VITE_FIREBASE_*`.

Estas variables son configuración del cliente Firebase. Las credenciales
privadas de Gmail nunca utilizan `VITE_`.

---

# Autenticación

## `src/hooks/useAuth.ts`

Es el hook que observa la sesión.

Utiliza:

```text
onAuthStateChanged()
```

Responsabilidades:

- Mantener el usuario autenticado actual.
- Informar si Firebase todavía está resolviendo la sesión.
- Desuscribirse correctamente al desmontar el componente.

Devuelve conceptualmente:

```ts
{
  usuario,
  cargando
}
```

---

## `src/services/authService.ts`

Contiene las operaciones de autenticación y evita que las páginas llamen
directamente a Firebase para cada operación.

Responsabilidades:

- `registrarUsuario`
- `iniciarSesionConEmail`
- `iniciarSesionConGoogle`
- `enviarEmailDeRecuperacion`
- `cerrarSesion`
- traducir errores Firebase a mensajes entendibles
- comprobar si el usuario tiene proveedor `password`
- agregar contraseña a una cuenta creada con Google
- vincular Google a una cuenta preexistente con email/password

### Registro

```text
RegisterPage
   |
   ▼
authService.registrarUsuario()
   |
   ├── createUserWithEmailAndPassword()
   └── updateProfile(displayName)
```

### Login Google

```text
LoginPage
   |
   ▼
authService.iniciarSesionConGoogle()
   |
   ▼
GoogleAuthProvider
   |
   ▼
signInWithPopup()
```

El provider utiliza selector de cuenta para evitar reutilizar silenciosamente
una sesión de Google incorrecta.

### Vinculación de proveedores

El objetivo es que una misma persona conserve **un único Firebase UID**.

Caso Google primero:

```text
Google login
   |
   ▼
usuario sin provider password
   |
   ▼
SetPasswordPage
   |
   ▼
EmailAuthProvider.credential()
   |
   ▼
linkWithCredential()
   |
   ▼
MISMO UID
```

Caso email/password primero:

```text
Cuenta password existente
   |
   +-- intenta Google con mismo email
           |
           ▼
auth/account-exists-with-different-credential
           |
           ▼
login de cuenta existente
           |
           ▼
linkWithCredential(Google)
           |
           ▼
MISMO UID
```

Esto es importante porque las tareas están asociadas al UID. Crear una segunda
identidad rompería la continuidad de los datos del usuario.

---

# Páginas de autenticación

## `src/pages/auth/LoginPage.tsx`

Responsabilidades:

- Formulario de login.
- Login email/password.
- Login Google.
- Navegación hacia registro.
- Manejo de errores de autenticación.

## `src/pages/auth/RegisterPage.tsx`

Responsabilidades:

- Capturar nombre, email y contraseña.
- Validar campos.
- Mostrar fuerza de contraseña.
- Confirmar registro.
- Crear usuario Firebase.

La longitud mínima validada actualmente es de 6 caracteres.

## `src/pages/auth/SetPasswordPage.tsx`

Se utiliza para una cuenta autenticada mediante Google que todavía no posee
proveedor password.

No crea un usuario nuevo: vincula una credencial adicional al usuario actual.

---

# Componentes de autenticación

## `src/components/auth/`

Contiene componentes reutilizables del flujo de acceso, evitando duplicar
markup entre login, registro y configuración de contraseña.

Entre sus responsabilidades están:

- layout visual de autenticación;
- inputs;
- input de contraseña;
- botón de submit;
- indicador de fuerza de contraseña;
- elementos compartidos del formulario.

## `src/components/GoogleButton/`

Componente específico para la acción visual de Google Sign-In.

---

# Tareas y Firestore

## `src/services/taskService.ts`

Es la capa de acceso a datos de tareas.

La colección utilizada es:

```text
tasks
```

Cada tarea pertenece a un usuario mediante:

```text
userId = Firebase UID
```

Responsabilidades:

- suscripción en tiempo real;
- creación;
- edición;
- cambio de estado;
- actualización de progreso;
- mover a papelera;
- restaurar;
- eliminar definitivamente.

### Lectura en tiempo real

Conceptualmente:

```text
Firebase UID
   |
   ▼
query(tasks)
   |
   └── where("userId", "==", uid)
          |
          ▼
      onSnapshot()
          |
          ▼
     interfaz React
```

No existe polling periódico: Firestore notifica los cambios.

### Creación de una tarea

```text
Dashboard / TaskForm
      |
      ▼
useTasks
      |
      ▼
taskService.crearTareaEnFirestore()
      |
      ▼
addDoc(tasks)
      |
      ▼
Firestore
```

La tarea almacena el UID del usuario propietario.

---

# Modelo de tarea

El tipo central se encuentra en:

```text
src/types/task.ts
```

Conceptualmente una tarea maneja:

```ts
{
  id: string
  userId?: string
  titulo: string
  descripcion: string
  estado: "pendiente" | "en-progreso" | "completada"
  prioridad: "alta" | "media" | "baja"
  progreso: number
  fechaLimite?: string
  fechaCreacion?: string
  creadoPor?: string
  asignadoA?: string
  estaEnPapelera: boolean
}
```

Algunos campos pueden generarse o normalizarse en la capa de servicio.

---

# `src/hooks/useTasks.ts`

Es el principal coordinador del dominio de tareas.

No reemplaza `taskService`: los dos cumplen roles distintos.

```text
useTasks
  |
  +-- estado React
  +-- orden visual
  +-- actividad
  +-- actualización optimista
  +-- lógica de progreso/estado
  |
  └── taskService
        |
        └── Firestore
```

Responsabilidades principales:

- mantener la lista de tareas en React;
- iniciar y cerrar la suscripción Firestore;
- separar tareas activas y tareas de papelera;
- mantener el orden de IDs;
- combinar tareas nuevas con el orden existente;
- ordenar inicialmente por prioridad;
- manejar creación/edición/cambio de estado;
- actualizar progreso;
- actualización optimista de UI;
- restauración y eliminación;
- vaciado de papelera;
- registrar actividad;
- manejar errores.

---

# Orden local de tareas

Firestore contiene los datos de las tareas, pero el orden manual del tablero se
conserva localmente.

Clave utilizada conceptualmente:

```text
taskify-orden-tareas-<uid>
```

El orden se persiste en:

```text
localStorage
```

Cuando Firestore entrega una nueva lista:

1. Se eliminan IDs que ya no existen.
2. Se conservan los IDs conocidos en su orden actual.
3. Las tareas nuevas se insertan según prioridad.
4. Se guarda nuevamente el orden local.

Esto separa:

```text
Firestore    -> datos persistentes de negocio
localStorage -> preferencia visual/local de orden
```

---

# Historial de actividad

`useTasks` registra las últimas acciones del usuario.

Se conserva un máximo aproximado de 30 actividades por usuario.

Clave:

```text
taskify-actividades-<uid>
```

Se almacena en:

```text
localStorage
```

Ejemplos:

- tarea creada;
- tarea editada;
- tarea completada;
- tarea en progreso;
- tarea movida a papelera;
- tarea restaurada;
- eliminación definitiva;
- vaciado de papelera.

El historial de actividad actual no es una auditoría centralizada en Firestore:
es información de experiencia de usuario almacenada localmente.

---

# Dashboard

## `src/pages/dashboard/DashboardPage.tsx`

Es el orquestador principal de la interfaz autenticada.

Su función no es implementar cada detalle de negocio, sino conectar:

- sesión;
- tareas;
- filtros;
- estadísticas;
- navegación;
- topbar;
- Kanban;
- papelera;
- actividad;
- email.

La lógica se distribuye en hooks especializados para evitar convertir
`DashboardPage` en un componente monolítico.

---

# Hooks del Dashboard

El proyecto posee hooks con responsabilidades acotadas. fileciteturn25file0L2-L2

## `useDashboardFilters.ts`

Gestiona el estado de los filtros del dashboard.

Responsabilidades típicas:

- texto de búsqueda;
- estado;
- prioridad;
- fechas;
- obtención de la lista filtrada;
- limpieza de filtros.

## `useDashboardStats.ts`

Calcula información derivada para tarjetas y estadísticas.

No persiste datos: deriva valores a partir de las tareas actuales.

## `useDashboardTaskActions.ts`

Agrupa acciones de interfaz relacionadas con las tareas, confirmaciones y
operaciones que terminan delegando en `useTasks`.

## `useDashboardSessionActions.ts`

Gestiona acciones ligadas a la sesión y al usuario.

Entre ellas se encuentra el envío del resumen por email.

El resumen utiliza **tareas activas**, no tareas que ya están en papelera.

## `useDashboardTopbar.ts`

Centraliza estado y acciones utilizadas por la barra superior.

## `useDragAndDrop.ts`

Configura los sensores de `dnd-kit` utilizados por el tablero Kanban.

## `useFormValidation.ts`

Concentra validaciones reutilizables de formularios.

## `useAlert.ts`

Expone una API cómoda para utilizar el sistema global de alertas.

---

# Kanban

## `src/components/kanban/`

Contiene la representación visual del tablero.

La implementación utiliza `dnd-kit`.

Responsabilidades:

- representar columnas;
- representar tareas movibles;
- detectar inicio/cancelación/fin de drag;
- determinar columna o posición destino;
- actualizar el estado correspondiente;
- reordenar elementos.

---

## `KanbanBoard`

Coordina el drag & drop del tablero.

Flujo:

```text
usuario arrastra tarjeta
       |
       ▼
DndContext
       |
       ▼
handleDragEnd
       |
       +-- misma columna --> reordenar
       |
       └-- otra columna --> cambiar estado
                              |
                              ▼
                           useTasks
                              |
                              ▼
                           Firestore
```

---

# TaskCard

## `src/components/tasks/TaskCard/TaskCard.tsx`

Representa una tarea individual.

Responsabilidades:

- título;
- descripción;
- prioridad;
- fecha límite;
- personas asociadas si existen;
- progreso;
- estado;
- editar;
- completar;
- mover a papelera.

### Progreso automático

Cuando una tarea se encuentra en:

```text
estado = en-progreso
```

y su progreso es menor al 100 %, el componente incrementa el progreso
automáticamente cada intervalo configurado.

Al llegar a 100 %:

```text
progreso = 100
estado   = completada
```

Este comportamiento está cubierto por tests automatizados.

---

# Formularios de tarea

## `src/components/tasks/`

Incluye los componentes de creación y edición de tareas.

`TaskForm` se encarga de:

- capturar datos;
- validar;
- modo creación;
- modo edición;
- devolver una estructura `TareaNueva` a la capa superior.

La persistencia no se realiza directamente desde el formulario.

---

# Papelera

## `src/pages/papelera/`

La papelera utiliza las mismas tareas de Firestore diferenciadas por el campo:

```text
estaEnPapelera
```

Mover una tarea a papelera es un soft delete.

Flujos:

```text
activa
  |
  +-- mover a papelera
  ▼
estaEnPapelera = true
```

```text
papelera
  |
  +-- restaurar
  ▼
estaEnPapelera = false
```

```text
papelera
  |
  +-- eliminar definitivamente
  ▼
deleteDoc()
```

---

# Alertas

## `src/context/AlertContext.tsx`

Contiene el Provider que mantiene el estado global de alertas.

## `src/context/alertContextDefinition.ts`

Define los tipos y el contexto separado del Provider.

Esta separación mejora la compatibilidad con Fast Refresh.

## `src/hooks/useAlert.ts`

Es la API utilizada por los componentes.

Expone operaciones como:

```text
alertaExito
alertaError
alertaAdvertencia
alertaInfo
alertaConfirmar
```

## `src/components/ui/Alert/`

Renderiza visualmente las alertas.

---

# Layout

## `src/components/layout/`

Contiene la estructura visual persistente del área autenticada.

Ejemplos de responsabilidad:

- Sidebar.
- Topbar.
- Navegación.
- Contenedores generales.

El layout no debe contener operaciones directas contra Firestore.

---

# Página "Acerca de"

## `src/pages/about/AboutPage.tsx`

Presenta información del proyecto:

- stack;
- arquitectura;
- funcionalidades;
- contexto técnico.

Debe mantenerse alineada con la arquitectura productiva real:

```text
Firebase + Vercel Functions + Nodemailer/Gmail
```

No debe conservar referencias al flujo AWS SES/S3 retirado.

---

# Envío de email

El sistema de email tiene dos partes independientes:

```text
Frontend
src/services/emailService.ts
```

y:

```text
Backend
api/sendEmail.ts
```

---

## Frontend: `src/services/emailService.ts`

Responsabilidades:

1. Obtener `auth.currentUser`.
2. Confirmar que existe usuario autenticado.
3. Verificar que el email solicitado coincide con la cuenta autenticada.
4. Obtener Firebase ID Token.
5. Enviar `POST /api/sendEmail`.
6. Incluir:

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

7. Si recibe `401`, forzar:

```ts
usuario.getIdToken(true)
```

8. Reintentar una sola vez.

No se reintentan automáticamente errores SMTP/500 porque podría producir
correos duplicados.

---

# Backend: `api/sendEmail.ts`

Es una Vercel Function server-side.

Responsabilidades:

- aceptar únicamente `POST`;
- leer `Authorization: Bearer ...`;
- validar el Firebase ID Token;
- obtener la identidad Firebase real;
- normalizar y limitar el payload de tareas;
- escapar contenido HTML;
- cargar credenciales Gmail desde variables server-side;
- crear el transporter Nodemailer;
- enviar el resumen;
- devolver el código HTTP correspondiente.

---

# Validación de identidad del email

El backend no utiliza un destinatario arbitrario proveniente del navegador.

El flujo es:

```text
Browser
  |
  | Firebase ID Token
  ▼
/api/sendEmail
  |
  ▼
validación Firebase
  |
  ▼
usuario Firebase
  |
  ├── localId / UID
  ├── email
  └── displayName
  |
  ▼
destinatario = usuarioFirebase.email
```

Esta decisión evita un endpoint abierto capaz de enviar correos a direcciones
arbitrarias.

---

# Payload del resumen

El cliente envía únicamente los datos necesarios:

```json
{
  "nombreUsuario": "Nombre",
  "tareas": [
    {
      "titulo": "Ejemplo",
      "estado": "pendiente",
      "prioridad": "alta",
      "progreso": 0
    }
  ]
}
```

El email destinatario no necesita formar parte del payload confiable del
backend.

La Function limita y normaliza los datos antes de construir el HTML.

---

# Gmail SMTP

El transporter utiliza:

```text
Nodemailer
service: gmail
```

Credenciales necesarias:

```env
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

`GMAIL_APP_PASSWORD` debe ser una **App Password de Google**, no la contraseña
normal de la cuenta.

Estas variables se configuran en Vercel y nunca deben estar en código,
`.env.example` con valores reales ni archivos versionados.

---

# Variables de entorno

Archivo de referencia:

```text
Taskify-app/.env.example
```

## Frontend / Firebase

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Backend

```env
FIREBASE_API_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

`FIREBASE_API_KEY` puede utilizarse como alias server-side para la validación
del token. La implementación también puede reutilizar la API key web de
Firebase cuando corresponde.

---

# Qué debe estar en Git y qué no

## Versionado

```text
src/
api/
tests/
package.json
package-lock.json
vite.config.ts
vercel.json
.env.example
README.md
.github/workflows/
```

## Nunca versionar

```text
.env
.env.local
.env.production
GMAIL_APP_PASSWORD real
credenciales personales
.vercel/
node_modules/
dist/
coverage/
backups locales
```

---

# Vercel

## `vercel.json`

Configura el comportamiento de la SPA en Vercel.

La aplicación utiliza un fallback hacia `index.html` para las rutas del
frontend.

Los archivos y las Functions reales de `/api/*` son resueltos antes del
fallback de la SPA.

---

# Flujo de deployment

```text
main
 |
 ▼
GitHub
 |
 ▼
Vercel
 |
 +-- instala dependencias
 +-- ejecuta build
 +-- publica frontend
 +-- construye api/sendEmail.ts como Function
 |
 ▼
Production
```

Variables como `GMAIL_USER` y `GMAIL_APP_PASSWORD` pertenecen a la
configuración del proyecto en Vercel.

Cuando una variable de entorno cambia, se debe realizar un nuevo deployment
para que la Function utilice el nuevo valor.

---

# Estructura del proyecto

La estructura objetivo, después de retirar artefactos legacy, es:

```text
Taskify-app/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── README.md
├── .gitignore
│
└── Taskify-app/
    ├── api/
    │   └── sendEmail.ts
    │
    ├── public/
    │
    ├── src/
    │   ├── ASSETS/
    │   │
    │   ├── components/
    │   │   ├── GoogleButton/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   ├── kanban/
    │   │   ├── layout/
    │   │   ├── tasks/
    │   │   └── ui/
    │   │
    │   ├── context/
    │   │   ├── AlertContext.tsx
    │   │   └── alertContextDefinition.ts
    │   │
    │   ├── firebase/
    │   │   └── firebase.ts
    │   │
    │   ├── hooks/
    │   │   ├── useAlert.ts
    │   │   ├── useAuth.ts
    │   │   ├── useDashboardFilters.ts
    │   │   ├── useDashboardSessionActions.ts
    │   │   ├── useDashboardStats.ts
    │   │   ├── useDashboardTaskActions.ts
    │   │   ├── useDashboardTopbar.ts
    │   │   ├── useDragAndDrop.ts
    │   │   ├── useFormValidation.ts
    │   │   └── useTasks.ts
    │   │
    │   ├── pages/
    │   │   ├── about/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   └── papelera/
    │   │
    │   ├── services/
    │   │   ├── authService.ts
    │   │   ├── emailService.ts
    │   │   └── taskService.ts
    │   │
    │   ├── styles/
    │   ├── types/
    │   ├── utils/
    │   ├── App.tsx
    │   ├── index.css
    │   ├── main.tsx
    │   └── setupTests.ts
    │
    ├── tests/
    │
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vercel.json
    └── vite.config.ts
```

La copia interna duplicada de README, servicios AWS legacy, capturas de debug,
backups de Vercel y stubs vacíos no forman parte de la estructura objetivo.

---

# Mapa rápido de responsabilidades

| Área | Autoridad / archivo principal | Responsabilidad |
|---|---|---|
| Inicio app | `main.tsx` | Montaje de React |
| Sesión/UI auth | `App.tsx` | Decide qué pantalla renderizar |
| Estado Firebase Auth | `useAuth.ts` | Observa usuario y carga |
| Operaciones auth | `authService.ts` | Registro, login, Google, recovery, linking |
| Firebase | `firebase.ts` | Inicializa `auth` y `db` |
| Datos de tareas | `taskService.ts` | CRUD y `onSnapshot` |
| Dominio de tareas | `useTasks.ts` | Estado, orden, progreso, actividad, acciones |
| Dashboard | `DashboardPage.tsx` | Orquesta UI autenticada |
| Filtros | `useDashboardFilters.ts` | Filtrado de tareas |
| Estadísticas | `useDashboardStats.ts` | Valores derivados |
| Acciones tarea | `useDashboardTaskActions.ts` | Acciones/confirmaciones UI |
| Acciones sesión | `useDashboardSessionActions.ts` | Logout y email |
| Topbar | `useDashboardTopbar.ts` | Estado/interacciones de barra superior |
| Kanban | `components/kanban` | Drag & drop |
| Tarjetas | `TaskCard` | UI y progreso de tarea |
| Formularios | `components/tasks` | Crear/editar |
| Papelera | `pages/papelera` | Soft delete/restauración/eliminación |
| Alertas | `AlertContext` + `useAlert` | Mensajería global |
| Cliente email | `emailService.ts` | Token + request + retry 401 |
| Backend email | `api/sendEmail.ts` | Auth, sanitización, SMTP |
| Deployment | `vercel.json` | SPA + Functions |
| Tests | `tests/` | Regresión automatizada |

---

# Flujos end-to-end

## Login y carga de tareas

```text
Usuario
  |
  ▼
LoginPage
  |
  ▼
authService
  |
  ▼
Firebase Authentication
  |
  ▼
onAuthStateChanged
  |
  ▼
useAuth
  |
  ▼
App
  |
  ▼
DashboardPage
  |
  ▼
useTasks(uid)
  |
  ▼
taskService.suscribirTareas(uid)
  |
  ▼
Cloud Firestore
```

---

## Crear tarea

```text
TaskForm
  |
  ▼
Dashboard action
  |
  ▼
useTasks.crearTarea()
  |
  ▼
taskService.crearTareaEnFirestore()
  |
  ▼
Firestore
  |
  ▼
onSnapshot
  |
  ▼
useTasks
  |
  ▼
Kanban actualizado
```

---

## Mover tarea

```text
Drag & Drop
  |
  ▼
KanbanBoard
  |
  ▼
cambiarEstadoTarea / reordenarTareas
  |
  ├── React: actualización inmediata
  ├── localStorage: orden
  └── Firestore: estado/progreso
```

---

## Papelera

```text
TaskCard
  |
  ▼
moverAPapelera
  |
  ▼
Firestore: estaEnPapelera = true
  |
  ▼
tareasActivas / tareasEnPapelera
```

---

## Enviar resumen

```text
Topbar
  |
  ▼
useDashboardSessionActions
  |
  ▼
emailService
  |
  ├── auth.currentUser
  ├── getIdToken()
  └── POST /api/sendEmail
          |
          ▼
     Vercel Function
          |
          ├── valida Bearer token
          ├── resuelve usuario Firebase
          ├── usa email autenticado
          ├── normaliza tareas
          └── Nodemailer
                 |
                 ▼
                Gmail
```

---

# Testing

El proyecto utiliza:

- Vitest.
- React Testing Library.
- jsdom.
- `@testing-library/jest-dom`.

El setup central se encuentra en:

```text
src/setupTests.ts
```

Cobertura funcional actual de las suites:

- autenticación;
- `useAuth`;
- `authService`;
- tareas;
- `taskService`;
- `useTasks`;
- TaskForm;
- TaskCard;
- alertas;
- ActivityFeed;
- estadísticas;
- validaciones;
- frontend de email;
- backend `/api/sendEmail`.

Estado validado:

```text
15 archivos de test PASS
75 tests PASS
```

Los mensajes de error SMTP/token que aparecen dentro de algunos tests son
escenarios negativos simulados y forman parte de las verificaciones esperadas.

---

# Scripts

Desde `Taskify-app/Taskify-app`:

```bash
npm run dev
```

Servidor de desarrollo.

```bash
npm run build
```

Build productivo Vite.

```bash
npm run lint
```

Análisis ESLint.

```bash
npm run test -- --run
```

Suite completa una sola vez.

La estructura profesional agrega además:

```bash
npm run typecheck
npm run test:run
npm run check
```

`npm run check` debe ejecutar la cadena completa de calidad antes de publicar:

```text
typecheck -> lint -> tests -> build
```

---

# Instalación

## Requisitos

- Node.js 22.
- npm.
- Proyecto Firebase.
- Cuenta Vercel.
- Gmail con App Password si se necesita email.

## Clonar

```bash
git clone https://github.com/JoaquinG-eng/Taskify-app.git
cd Taskify-app/Taskify-app
```

## Instalar

```bash
npm ci
```

## Variables locales

```bash
cp .env.example .env.local
```

Completar Firebase.

## Desarrollo

```bash
npm run dev
```

---

# Seguridad

## Identidad

Firebase Authentication es la autoridad de identidad.

## Datos

Las tareas se vinculan al UID Firebase mediante `userId`.

## Email

El servidor determina el destinatario desde la identidad autenticada.

## Secretos

Las credenciales Gmail permanecen en Vercel y no en el cliente.

## App Password

Nunca debe exponerse:

```text
GMAIL_APP_PASSWORD
```

## Cuenta demo

La contraseña de la cuenta demo no se publica en Git.

## Configuración Firebase

Las variables web `VITE_FIREBASE_*` son configuración utilizada por el SDK del
navegador. No deben confundirse con secretos server-side.

---

# CI

La estructura objetivo incorpora:

```text
.github/workflows/ci.yml
```

El pipeline debe ejecutar sobre Node.js 22:

```text
npm ci
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Esto evita que cambios que rompan TypeScript, lint, tests o build lleguen a
`main` sin detección.

---

# Persistencia: qué se guarda dónde

| Información | Ubicación | Autoridad |
|---|---|---|
| Usuario / identidad | Firebase Authentication | Firebase |
| Tareas | Cloud Firestore | Firestore |
| Propietario de tarea | `userId` / Firebase UID | Firestore + Auth |
| Orden visual | localStorage | Navegador |
| Feed reciente | localStorage | Navegador |
| Credenciales Gmail | Vercel Environment Variables | Vercel |
| Código frontend | GitHub | Git |
| Function email | GitHub + Vercel | Git/Vercel |
| Tests | GitHub | Git |

---

# Decisiones de diseño importantes

## Firestore es la autoridad de tareas

El orden local y el feed no reemplazan Firestore.

## La UI no es la frontera de seguridad

Filtrar por `userId` en el cliente es necesario para funcionalidad, pero la
protección real de datos debe acompañarse con reglas Firestore adecuadas en el
proyecto Firebase.

## El email no acepta destinatario libre

Reduce el riesgo de utilizar Taskify como relay de correo.

## Los proveedores de login conservan UID

Evita separar las tareas de un usuario al incorporar Google o contraseña.

## Reintento de correo limitado

Sólo se reintenta automáticamente cuando el token de Firebase expira y la API
devuelve `401`. Un error SMTP no se reintenta automáticamente para evitar
duplicados.

---

# Mejoras futuras no bloqueantes

- Code splitting para reducir el bundle principal.
- Optimización de imágenes pesadas del frontend.
- Revisión de dependencias con `npm audit` sin aplicar upgrades forzados.
- Despliegue/versionado explícito de reglas Firestore.
- Mayor cobertura E2E de navegador.
- Observabilidad específica de errores de frontend.
- Rate limiting adicional para `/api/sendEmail` si aumenta el volumen.

---

# Criterio de calidad antes de un release

Un cambio destinado a producción debe cerrar con:

```text
git diff --check          PASS
npm run typecheck        PASS
npm run lint             PASS
npm run test:run         PASS
npm run build            PASS
```

Para cambios del flujo de correo se agrega una prueba real en Vercel:

```text
POST /api/sendEmail -> HTTP 200
```

---

# Resumen

Taskify utiliza una separación clara de responsabilidades:

```text
Pages       -> composición de pantallas
Components  -> interfaz reutilizable
Hooks       -> estado y coordinación de UI
Services    -> Firebase y llamadas externas
Firebase    -> autenticación + datos
Vercel      -> hosting + backend serverless
Nodemailer  -> transporte de email
Tests       -> regresión automatizada
```

El objetivo de esta arquitectura es mantener el frontend desacoplado de la
persistencia, conservar la identidad del usuario entre proveedores de login y
mantener las operaciones sensibles —como las credenciales SMTP y la resolución
del destinatario— fuera del navegador.



## Autor

Joaquin Gonzalez
