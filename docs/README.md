# Documentación

Un documento por módulo, escrito mientras se construye. Orden de lectura:

| Documento | Qué cubre | Estado |
|---|---|---|
| [backend/01-base-de-datos-y-validacion.md](backend/01-base-de-datos-y-validacion.md) | SQLite, tipos y esquemas Zod | ✅ hecho |
| [backend/02-rutas-y-errores.md](backend/02-rutas-y-errores.md) | Endpoints REST, códigos HTTP, manejador de errores | ✅ hecho |
| [backend/03-tests.md](backend/03-tests.md) | Tests del backend (10) | ✅ hecho |
| [frontend/01-cliente-api-y-hook.md](frontend/01-cliente-api-y-hook.md) | Tipos, cliente de la API y hook `useTasks` (9 tests) | ✅ hecho |
| [frontend/02-lista-y-filtro.md](frontend/02-lista-y-filtro.md) | Lista, filtro por estado, cambio de estado, carga y error | ✅ hecho |
| [frontend/03-formulario.md](frontend/03-formulario.md) | Formulario validado | ✅ hecho |
| frontend/04-tests-de-componentes.md | Tests del formulario, del botón de estado y de los estados de la lista | ⏳ siguiente |
| [decisiones.md](decisiones.md) | Decisiones técnicas y por qué | 🔄 se va ampliando |
| [uso-de-ia.md](uso-de-ia.md) | Cómo se usó la IA: qué se pidió, aceptó y corrigió | 🔄 se va ampliando |

## Cómo ejecutar

| Qué | Comando |
|---|---|
| API + web | `./scripts/dev.sh` (o `npm run dev`) |
| Solo API (http://localhost:3001/api/health) | `./scripts/api.sh` |
| Solo web (http://localhost:5173) | `./scripts/web.sh` |
| Tests (backend + frontend) | `npm test` |
