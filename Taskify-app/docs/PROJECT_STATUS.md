# Taskify — Estado técnico del proyecto

**Fecha de corte:** 20 de agosto de 2026  
**Estado funcional documentado:** B1–B8 `CLOSED_PASS`  
**Próximo bloque funcional previsto:** B9 — Etiquetas y categorías personalizadas

> Este documento describe el estado real alcanzado en la rama/local de trabajo al cierre de B8.
> No implica que los cambios hayan sido committeados, pusheados o desplegados.

---

## 1. Estado general

Taskify es una aplicación de gestión de tareas construida con React 19, TypeScript, Firebase/Firestore y Vite.

Al cierre de B8 se encuentran implementados y validados los siguientes bloques:

- navegación principal y dashboard;
- gestión CRUD de tareas;
- tablero Kanban con Drag & Drop;
- papelera y restauración;
- seguimiento de progreso y estados;
- calendario interactivo;
- programación de tareas con fecha y horario;
- búsqueda superior integrada;
- responsive desktop/mobile;
- notificaciones derivadas;
- sistema de tickets;
- resumen visual de tickets en dashboard;
- comentarios dentro de tareas;
- reconciliación de la pantalla About/roadmap.

---

## 2. Funcionalidades actuales

### 2.1 Tareas

Las tareas soportan actualmente:

- título;
- descripción;
- prioridad: alta, media o baja;
- estado: pendiente, en progreso o completada;
- fecha límite opcional;
- hora de inicio y hora de fin opcionales;
- progreso;
- creador/responsable cuando corresponda;
- papelera;
- comentarios.

Las tareas se persisten en Firestore y se sincronizan mediante suscripción en tiempo real.

### 2.2 Editor único de tareas

`TaskForm` es la autoridad única para creación y edición de tareas.

Reglas vigentes:

- no existen múltiples modales de edición en paralelo;
- Dashboard, Mis tareas y Calendario abren el mismo editor;
- el estado actual de la tarea se preserva al editar;
- los comentarios viven dentro del editor, pero se guardan de forma independiente a `Guardar cambios`.

### 2.3 Calendario

El calendario incluye:

- vista Día;
- vista Semana;
- vista Mes;
- mini calendario;
- navegación entre períodos;
- tareas programadas por fecha/hora;
- tareas sin horario diferenciadas;
- creación desde una fecha;
- creación desde slots horarios;
- edición desde calendario;
- tratamiento de solapamientos;
- diseño responsive.

No se utiliza una dependencia externa de calendario.

### 2.4 Búsqueda

La búsqueda superior es contextual:

- en secciones de tareas filtra tareas;
- en Tickets filtra tickets;
- la búsqueda de tareas usa la misma autoridad de filtros del dashboard;
- la búsqueda de tickets mantiene estado independiente.

### 2.5 Notificaciones

Las notificaciones del dashboard se derivan del estado actual y no constituyen una segunda fuente de verdad persistente.

Incluyen:

- tareas vencidas;
- tareas para hoy;
- tareas próximas;
- tickets activos de prioridad alta.

Regla de tickets adoptada para evitar ruido:

> Sólo los tickets de prioridad alta que todavía no están cerrados se incorporan al centro de notificaciones.

### 2.6 Tickets

Existe un sistema funcional de tickets con:

- colección Firestore `tickets`;
- creación;
- edición;
- prioridad;
- estado;
- filtrado/búsqueda;
- sincronización;
- resumen visual en Dashboard;
- integración con notificaciones.

Estados:

- `abierto`;
- `en-progreso`;
- `cerrado`.

Prioridades:

- `alta`;
- `media`;
- `baja`.

El alcance actual no incluye:

- eliminación de tickets;
- comentarios dentro de tickets;
- adjuntos;
- SLA;
- asignación multiusuario.

Por este motivo la documentación utiliza **“Sistema de tickets y soporte”** y evita afirmar que sea un sistema de soporte “completo”.

---

## 3. Comentarios en tareas — B8

### 3.1 Modelo

Los comentarios están embebidos dentro del documento de la tarea:

```text
tasks/{taskId}.comentarios[]
```

Modelo vigente:

```ts
interface ComentarioTarea {
  id: string;
  texto: string;
  autorId: string;
  autorNombre: string;
  fechaCreacion: string;
}
```

Límite actual:

```text
1000 caracteres por comentario
```

### 3.2 Persistencia

La incorporación de comentarios utiliza `arrayUnion` de Firestore.

Motivos de esta decisión:

- evita crear una colección adicional;
- reutiliza la autoridad de seguridad del documento `tasks/{taskId}`;
- agrega comentarios de forma atómica;
- reduce el riesgo de reemplazar comentarios concurrentes.

### 3.3 Actualización optimista

`useTasks.agregarComentario()`:

1. valida autenticación;
2. normaliza el texto;
3. valida contenido no vacío;
4. valida el máximo de caracteres;
5. valida que la tarea exista;
6. genera ID y fecha;
7. agrega el comentario optimísticamente;
8. persiste mediante Firestore;
9. si falla, elimina únicamente el comentario fallido.

El rollback es granular: no restaura el objeto completo de la tarea ni pisa cambios independientes.

### 3.4 UI

Los comentarios:

- aparecen únicamente al editar una tarea existente;
- muestran autor, fecha y texto;
- muestran cantidad total;
- poseen textarea independiente;
- poseen estado de envío;
- muestran error inline;
- se actualizan sin cerrar el editor;
- no disparan `Guardar cambios`;
- no aparecen durante la creación inicial de una tarea.

No se implementó todavía:

- editar comentarios;
- eliminar comentarios;
- menciones;
- adjuntos;
- comentarios previos a la existencia de una tarea.

---

## 4. Autoridades de arquitectura

Para evitar regresiones y duplicación de estado, mantener estas reglas:

### Tareas

- `useTasks` es la autoridad de datos/acciones de tareas.
- `TaskForm` es el editor/modal único de tareas.
- comentarios no forman parte de `TareaNueva`.
- agregar comentario es una acción separada del guardado de la tarea.

### Tickets

- `DashboardPage` mantiene una única instancia de `useTickets(userId)`.
- `DashboardTickets` recibe los datos/acciones de forma controlada.
- el modal de tickets pertenece a `DashboardTickets`.
- no crear una segunda suscripción para tickets sin una razón explícita.

### Dashboard

- filtros de tareas conservan una sola autoridad;
- búsqueda superior reutiliza esa autoridad;
- notificaciones son derivadas;
- las cuatro tarjetas históricas de estadísticas de tareas permanecen separadas del resumen de tickets;
- el resumen de tickets es un bloque independiente.

---

## 5. Firebase / Firestore

Colecciones utilizadas:

```text
tasks
tickets
```

Los comentarios no utilizan una colección separada.

### Seguridad de tickets

Las reglas de Firestore utilizadas para tickets verifican ownership mediante `userId`.

La configuración de reglas fue aplicada en Firebase Console durante la implementación.

### Gap de reproducibilidad conocido

Al cierre de B8 el repositorio local no posee:

```text
firebase.json
firestore.rules
firestore.indexes.json
.firebaserc
```

Por lo tanto, las reglas actuales de Firestore no están todavía versionadas dentro del repositorio.

No resolver este punto de forma implícita en un bloque funcional no relacionado. Debe abordarse como una tarea explícita de infraestructura/documentación cuando corresponda.

---

## 6. Validación del cierre B8

### B8.2 — Modelo y persistencia

Certificado:

- typecheck;
- lint;
- 22/22 tests focalizados;
- 26/26 regresión TaskForm + TaskCard;
- 15/15 regresión Calendario + Notificaciones;
- build de producción.

### B8.3 — UI de comentarios

Certificado:

- typecheck;
- lint;
- 20/20 tests de TaskForm;
- 22/22 regresión B8.2;
- 18/18 regresión TaskCard + Calendario;
- 20/20 regresión Tickets + Topbar + Notificaciones;
- build de producción;
- validación manual aceptada.

### B8.4 — About / roadmap

Certificado:

- reconciliación semántica;
- autoridades B8 protegidas;
- typecheck;
- lint;
- 42/42 regresión B8;
- 21/21 regresión Tickets/Notificaciones/Calendario;
- build de producción.

---

## 7. Warnings / deuda técnica conocida

### Bundle de producción

Vite informa actualmente que existen chunks mayores a 500 kB luego de minificación.

Es un warning, no un fallo de build.

No se realizó code splitting dentro de B8 porque no formaba parte del alcance.

### EOL

Git Bash puede informar:

```text
LF will be replaced by CRLF the next time Git touches it
```

Es un warning relacionado con finales de línea del entorno Windows y no invalidó las certificaciones.

### Suite global histórica

Existía deuda previa en pruebas de `authService.test.ts` relacionada con verificación de email.

No fue modificada ni usada para justificar cambios de B8.

Antes de una futura release/deploy conviene ejecutar y reconciliar la suite completa de forma explícita, sin mezclar esa deuda con bloques funcionales no relacionados.

---

## 8. Roadmap real al cierre de B8

### Completado

- Drag & Drop;
- calendario;
- programación horaria;
- búsqueda;
- responsive;
- notificaciones;
- tickets;
- comentarios en tareas.

### Pendiente

1. **B9 — Etiquetas y categorías personalizadas**
2. Tableros colaborativos entre usuarios
3. Asignación de tareas a múltiples miembros
4. Exportación de tareas a PDF y Excel
5. Integración con Google Calendar
6. Dashboard avanzado con métricas y gráficos
7. Modo offline con sincronización posterior

El orden posterior a B9 debe volver a validarse contra el estado real del proyecto antes de implementar.

---

## 9. Estado Git / entrega

Al cierre documentado:

- no se realizó commit;
- no se realizó push;
- no se realizó deploy;
- la rama local contiene múltiples cambios acumulados;
- la fuente local es la autoridad hasta que se realice una consolidación explícita.

Antes de commit/push/deploy:

1. revisar `git status`;
2. revisar cambios sin pager;
3. ejecutar validaciones acordadas;
4. verificar secretos/configuración;
5. definir el alcance exacto de la consolidación;
6. recién entonces autorizar commit.

---

## 10. Punto de reanudación

Cuando se retome el desarrollo:

```text
B9 — Etiquetas y categorías personalizadas
```

Antes de implementar B9:

1. ejecutar discovery READ_ONLY;
2. relevar modelo `Tarea`;
3. relevar filtros y búsqueda;
4. relevar TaskForm;
5. determinar si etiquetas/categorías son globales por usuario o embebidas por tarea;
6. diseñar compatibilidad con tareas existentes;
7. definir persistencia y reglas antes de modificar código.

No asumir la arquitectura de B9 sin discovery.

---

## 11. Principio operativo

El estado documentado debe seguir al estado real del producto.

Cuando una funcionalidad cambie:

- actualizar esta documentación;
- actualizar About/roadmap cuando corresponda;
- eliminar afirmaciones obsoletas;
- no marcar como implementada una capacidad que todavía esté parcial;
- mantener separadas las decisiones de arquitectura de las simples descripciones de UI.
