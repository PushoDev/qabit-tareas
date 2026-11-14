# Frontend 02 — Lista, filtro y cambio de estado

> Módulo: `web/src/App.tsx`, `components/StatusFilter.tsx`, `TaskList.tsx`, `TaskItem.tsx`, `index.css`

## Para qué sirve
La pantalla principal: muestra las tareas, permite filtrarlas por estado y avanzar su estado con un botón, con los estados de carga y de error siempre visibles. Usa el hook de [01](01-cliente-api-y-hook.md). El formulario de creación llega en `03-formulario.md`.

## Componentes

| Componente | Responsabilidad |
|---|---|
| `App` | Guarda el filtro, llama a `useTasks(filtro)` y compone la pantalla |
| `StatusFilter` | Botones «Todas · Pendiente · En curso · Hecha» (`aria-pressed` indica el activo) |
| `TaskList` | Decide qué pintar: **cargando**, **error** (con «Reintentar»), **vacío** o la lista |
| `TaskItem` | Una tarea: título, responsable, insignia de estado y el botón de cambio de estado |

## Estados de la lista (`TaskList`)

| Situación | Qué se ve | Accesibilidad |
|---|---|---|
| Primera carga | Spinner + «Cargando tareas…» | `role="status"` |
| La API falla | Mensaje + botón **Reintentar** | `role="alert"` |
| Sin tareas | «Aún no hay tareas. Crea la primera.» (o «No hay tareas con este estado.» si hay filtro) | — |
| Recargando con datos | La lista sigue visible, atenuada | `aria-busy="true"` |

## Botón de cambio de estado
Lleva la tarea al siguiente paso natural:

| Estado actual | Botón | Pasa a |
|---|---|---|
| Pendiente | **Empezar** | En curso |
| En curso | **Marcar hecha** | Hecha |
| Hecha | **Reabrir** | Pendiente |

Mientras guarda, el botón se desactiva y dice «Guardando…» (evita el doble clic). Si el cambio falla, el error aparece **en esa tarea**, sin tirar la lista entera. Cada botón tiene un `aria-label` con el título («Empezar: Preparar la demo»), para lectores de pantalla y para localizarlo en los tests.

## Decisiones
- **Componentes de presentación sin `fetch`:** reciben datos y funciones por props; todo el acceso a la API está en el hook.
- **Un botón de «siguiente paso» en vez de un desplegable:** cubre el flujo normal con un clic. Con más tiempo se añadiría poder saltar a cualquier estado.
- **El error de un cambio de estado es local a la tarea;** el error de carga ocupa la lista (con reintento). Son dos fallos distintos con tratamientos distintos.
- **CSS plano con variables** y tema claro/oscuro automático (`prefers-color-scheme`); sin librería de estilos para una pantalla tan pequeña. Respeta `prefers-reduced-motion` y tiene foco visible.
- **Textos en español**, valores del contrato en inglés (`STATUS_LABEL`).

## Cómo se verificó (en Chrome real, `https://qabit-tareas.test`)
- Carga inicial: las 3 tareas, sin errores en consola.
- Filtros: cada uno pide `?status=…` y muestra solo las de ese estado; el activo queda marcado.
- Cambio de estado: «Empezar» envía `PATCH /api/tasks/3/status` (200) y la lista se recarga con «En curso».
- Error: se simuló la caída de red solo en la página → aparece «No se pudo conectar con el servidor» con «Reintentar»; al restaurar la red y reintentar, desaparece.
- Los datos de ejemplo se restauraron tras la prueba.
- Tests de componentes: pendientes (paso 5d).

## Incidencia durante el desarrollo
La primera vez la pantalla salió en blanco: *«The requested module … does not provide an export named 'useTasks'»*. Vite servía el módulo **vacío**: lo había leído justo cuando se reescribía el archivo (truncado) y quedó en caché. No era un fallo del código; un `touch` del archivo lo resolvió. Si vuelve a pasar: guardar de nuevo el archivo o reiniciar `./scripts/dev.sh`.
