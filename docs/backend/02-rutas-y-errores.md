# Backend 02 — Rutas, repositorio y errores

> Módulo: `server/src/app.ts`, `routes/tasks.ts`, `taskRepository.ts`, `errors.ts`, `index.ts`

## Para qué sirve
Expone la API REST de tareas y decide cómo responde cuando algo sale mal. Sigue a [01 — Base de datos y validación](01-base-de-datos-y-validacion.md).

## Endpoints

| Método y ruta | Cuerpo | Éxito | Errores |
|---|---|---|---|
| `GET /api/health` | — | 200 `{"status":"ok"}` | — |
| `GET /api/tasks` | — | 200 lista, de la más nueva a la más antigua | — |
| `GET /api/tasks?status=pending` | — | 200 lista filtrada | 400 si el estado no existe |
| `POST /api/tasks` | `{ "title", "assignee" }` | **201** la tarea creada (`status: "pending"`) | 400 datos inválidos o JSON roto |
| `PATCH /api/tasks/:id/status` | `{ "status" }` | 200 la tarea actualizada | 400 id o estado inválido · **404** la tarea no existe |
| cualquier otra | — | — | 404 en JSON |

Una tarea se ve así:
```json
{ "id": 1, "title": "Comprar pan", "assignee": "Luis", "status": "in_progress", "createdAt": "2026-11-14T17:02:53.336Z" }
```

## Formato único de error
Todos los errores salen igual, para que el frontend los trate en un solo sitio:
```json
{ "error": "Datos inválidos", "details": [ { "field": "title", "message": "El título es obligatorio" } ] }
```
`details` solo aparece en los 400 de validación y nombra el campo, así el formulario puede marcarlo.

| Código | Cuándo |
|---|---|
| 400 | Validación (Zod) o JSON mal formado |
| 404 | Ruta o tarea inexistente |
| 413 | Cuerpo de más de 10 kB |
| 500 | Error no previsto: el detalle va al log del servidor, **nunca** al cliente |

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `app.ts` | `createApp(db)`: arma Express (JSON, rutas, 404, errores). Recibe la base, así los tests usan `:memory:` |
| `index.ts` | Arranque: abre la base y escucha en `0.0.0.0:3001` |
| `routes/tasks.ts` | Los tres endpoints; validan con Zod y llaman al repositorio |
| `taskRepository.ts` | **Todo el SQL.** Las rutas no saben que existe SQLite |
| `errors.ts` | `HttpError`, `notFound` y el manejador central `errorHandler` |

## Decisiones de este módulo
- **Capas separadas:** ruta (HTTP) → repositorio (SQL). Cambiar de base de datos solo toca `taskRepository.ts`.
- **`createApp(db)` separado de `index.ts`:** se puede probar la app entera sin abrir un puerto ni tocar el disco.
- **Un solo manejador de errores.** Las rutas lanzan `HttpError` y no repiten `try/catch`; un único sitio decide la forma de la respuesta.
- **404 en JSON.** El 404 por defecto de Express devuelve HTML, que rompería al frontend al leer el error.
- **SQL siempre con parámetros (`?`).** Probado: un título `x'); DROP TABLE tasks;--` se guarda como texto y la tabla sigue viva.
- **`x-powered-by` desactivado:** no anunciar la tecnología del servidor.
- **Límite de cuerpo de 10 kB** y **trim** en los textos.
- **Mensajes en español** y el campo correcto en `details` (también para el `:id` de la URL).

## Cómo se verificó
Servidor aparte (puerto 3002, base en memoria) y 16 peticiones reales con `curl`, más 5 de seguimiento tras corregir los mensajes:
crear (201), título vacío, responsable ausente, JSON roto, sin cuerpo, cambiar estado, estado inválido, id inexistente (404), id no numérico, id 0, título numérico, filtro válido e inválido, lista, ruta inexistente, inyección SQL y cabecera `x-powered-by`. Los tests automáticos llegan en `03-tests.md`.

## Detalles que se corrigieron durante la verificación
- El id inválido decía el campo `(body)`; ahora dice `id`.
- Los campos ausentes salían en inglés («Required»); ahora en español.
