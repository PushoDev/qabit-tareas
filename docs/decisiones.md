# Decisiones técnicas

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| 1 | **Express** + TypeScript | El enunciado lo permite; menos ceremonia que NestJS para un límite de 3 h | NestJS |
| 2 | **SQLite** (`better-sqlite3`) | Sin servidor aparte; un solo archivo; tests en memoria | PostgreSQL |
| 3 | **Zod** para validar | Un esquema da validación en tiempo de ejecución y tipo TypeScript | validación a mano |
| 4 | **Monorepo con npm workspaces** (`server/`, `web/`) | Un `npm install` y un solo comando de arranque | dos repos |
| 5 | **Vite + React + TypeScript** | Estándar actual, arranque rápido | CRA (obsoleto) |
| 6 | Todas las rutas bajo **`/api`** | La web llama a `/api/...` y el proxy de Vite lo reenvía a Express: un solo origen, sin CORS | puerto distinto con CORS |
| 7 | Estados en inglés en la API | Contrato estable independiente del idioma de la UI | estados en español en el contrato |
| 8 | **Repositorio** que concentra todo el SQL; las rutas no lo conocen | Separar HTTP de persistencia; probar y cambiar cada capa por separado | SQL dentro de las rutas |
| 9 | **Un manejador central de errores** con formato `{ error, details? }` | El frontend trata todos los errores igual; sin `try/catch` repetidos | responder el error en cada ruta |
| 10 | **`createApp(db)`** separado del arranque | Tests con SQLite en memoria y sin abrir puertos | crear la app y escuchar en el mismo archivo |
| 11 | Tests de la **app completa por HTTP** (Supertest) con SQLite en memoria por test | Prueban todas las capas a la vez; rápidos y aislados | tests unitarios de cada función con mocks |
| 12 | **Vitest 4** en backend y frontend, `legacy-peer-deps` en `.npmrc` | Vite 8 solo lo soporta Vitest ≥ 4; npm 10.9 falla al resolver sus peers opcionales | Vitest 2 en el back (versiones distintas en cada paquete) |
| 13 | **Capa de datos separada** (`tasksApi` + `useTasks`) de los componentes | Los componentes no conocen `fetch`; la API y el estado se prueban sin pintar nada | `fetch` dentro de los componentes |
| 14 | Tras crear o cambiar, **recargar la lista** | Respeta filtro y orden del servidor; sin lógica duplicada | actualización optimista del estado local (con más tiempo) |

## Entorno de desarrollo (no afecta al resultado)
- El proyecto vive en un disco ext4 (SSD). En un disco NTFS, `npm install` perdió archivos en silencio.
