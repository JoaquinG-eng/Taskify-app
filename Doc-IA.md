# Documentación IA

Estoy desarrollando un gestor de tareas inteligente en React + TypeScript.
Quiero trabajarlo por partes, primero dejando bien armada la estructura, después corrigiendo errores TypeScript y recién luego avanzando con diseño, alertas y deploy.

## 1. Estructura del proyecto

La prioridad inicial es ordenar carpetas, imports y exports para no generar rutas rotas ni componentes duplicados.

![Imagen 1 — Propuesta de estructura del proyecto](Taskify-app/src/cap/Estructura.png)

La estructura recomendada separa claramente:

* `components/ui`: componentes reutilizables como `StatCard`, `Button`, `Modal`.
* `components/tasks`: componentes propios de tareas.
* `components/kanban`: tablero Kanban.
* `pages/dashboard`: pantalla principal.
* `hooks`: lógica reutilizable.
* `types`: tipos centralizados.
* `utils`: datos mock o helpers.

## 2. Problema principal detectado

El error más importante está en los estados de las tareas.
El proyecto está mezclando valores como:

```txt
todo
in-progress
done
en_progreso
pendiente
en-progreso
completada
```

Esto rompe TypeScript porque `EstadoTarea` no tiene una única convención.

La convención correcta debería ser:

```ts
export type EstadoTarea = "pendiente" | "en-progreso" | "completada";
```

![Imagen 2 — Errores TypeScript por estados incompatibles](Taskify-app/src/cap/Erroresdeincompatibilidad.png)

Reemplazos necesarios:

```txt
todo         → pendiente
in-progress → en-progreso
done        → completada
en_progreso → en-progreso
por-hacer   → pendiente
```

## 3. Componentes con errores

También aparecen problemas en componentes e imports.

Los más importantes son:

* `StatCard` no tiene `export default` o está mal importado.
* `TaskCard` no existe en la ruta indicada.
* `DashboardPage` usa `cambiarEstadoTarea`, pero la función real parece llamarse `cambiarEstado`.
* Hay props con nombres distintos entre `DashboardPage`, `TaskCard`, `TaskForm`, `StatCard` y `KanbanBoard`.

![Imagen 3 — Errores de StatCard, TaskCard y DashboardPage](Taskify-app/src/cap/Erroresdecomponentes.png)

La solución es normalizar nombres y dejar componentes simples, por ejemplo:

```ts
TaskCard → recibe tarea
TaskForm → usa onGuardarTarea
StatCard → recibe etiqueta y valor
KanbanBoard → trabaja con EstadoTarea unificado
```

## 4. Orden de trabajo

Quiero avanzar en este orden:

1. Ordenar estructura.
2. Unificar tipos.
3. Corregir imports y exports.
4. Corregir componentes base.
5. Validar con `npm run build`.
6. Recién después mejorar UI.
7. Más adelante agregar SweetAlert2.
8. Finalmente preparar deploy.

![Imagen 4 — Idea de alertas visuales con SweetAlert2](Taskify-app/src/cap/InstSweetalert2.png)

## 5. Diseño esperado

La idea visual es combinar dos enfoques:

* estructura práctica tipo dashboard/kanban,
* estética moderna premium con fondo oscuro, azul/violeta, glow suave y buen contraste.

Primero debe funcionar bien.
Después se aplica el diseño.

## 6. Criterio de aceptación

La primera etapa termina cuando el proyecto compile sin errores:

```bash
npm run build
```

o:

```bash
npm run typecheck
```

No debe quedar ningún estado viejo como:

```txt
todo
in-progress
done
en_progreso
```

Tampoco deben quedar imports rotos ni tipos duplicados incompatibles.
