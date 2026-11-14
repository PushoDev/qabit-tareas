# Backend 01 — Base de datos, tipos y validación

> Módulo: `server/src/db.ts`, `server/src/schemas.ts`, `server/src/types.ts`

## Para qué sirve
Es la base sobre la que se montan las rutas: dónde se guardan las tareas, qué forma tienen y qué datos se aceptan.

## Modelo de datos
Tabla `tasks`:

| Columna | Tipo | Regla |
|---|---|---|
| `id` | INTEGER, clave primaria, autoincremental | lo asigna la base |
| `title` | TEXT, obligatorio | 1–120 caracteres, sin espacios sobrantes |
| `assignee` | TEXT, obligatorio | 1–80 caracteres (el «responsable») |
| `status` | TEXT, por defecto `pending` | solo `pending`, `in_progress`, `done` (restricción `CHECK`) |
| `created_at` | TEXT, ISO 8601 UTC | lo asigna la base |

Índice en `status`, porque el filtro principal de la lista es por estado.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `schemas.ts` | Esquemas Zod: `createTaskSchema`, `updateStatusSchema`, `listQuerySchema`, `idParamSchema`. Los tipos TypeScript salen de ellos (`z.infer`) |
| `db.ts` | `openDb(path)`: abre SQLite, activa WAL y crea la tabla si no existe |
| `types.ts` | `Task`: la forma de una tarea tal como la devuelve la API |

## Cómo se usa
```ts
const db = openDb()            // archivo server/data/tasks.db (o env DB_PATH)
const test = openDb(':memory:') // base en memoria, para los tests
```

## Contrato de validación
| Entrada | Válido | Error (mensaje) |
|---|---|---|
| `title` | `"  Comprar pan "` → `"Comprar pan"` | vacío → «El título es obligatorio»; 121 caracteres → «Máximo 120 caracteres» |
| `assignee` | `" Luis "` → `"Luis"` | ausente → «Required»; vacío → «El responsable es obligatorio» |
| `status` | `pending`, `in_progress`, `done` | cualquier otro → error de enumeración |
| `:id` | `"7"` → `7` | `"abc"` o `"0"` → error |

## Decisiones de este módulo
- **Estados en inglés en la API, español en la pantalla.** El contrato de la API no cambia si se cambia el idioma de la interfaz.
- **Doble defensa.** Zod valida en la API y la base tiene un `CHECK` propio. Si alguien escribe en la base saltándose la API, un estado inválido tampoco entra.
- **Una sola fuente de verdad.** `TASK_STATUSES` define los estados y de ahí salen el esquema Zod, el tipo TypeScript y el `CHECK` de la base.
- **`recortar` antes de validar** (`trim`): un título de solo espacios cuenta como vacío.
- **El cliente no elige `id`, estado inicial ni fecha**: `createTaskSchema` solo admite `title` y `assignee`.
- **`:memory:` para tests**: rápidos y sin tocar el disco.

## Cómo se verificó
- `tsc --noEmit` sin errores.
- Script temporal (fuera del repo) que probó 9 casos de validación y que la base: aplica `pending` por defecto y rechaza un estado inválido (`SQLITE_CONSTRAINT_CHECK`).
- Los tests automáticos llegan en `backend/03-tests.md`.
