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

## Entorno de desarrollo (no afecta al resultado)
- El proyecto vive en un disco ext4 (SSD). En un disco NTFS, `npm install` perdió archivos en silencio.
