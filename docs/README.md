# Documentación

<p align="center">
  <img src="img/gestor-tareas-banner.webp" alt="Ilustración conceptual del proyecto" width="560">
  <br><sub><i>Ilustración conceptual; no es una captura de la aplicación.</i></sub>
</p>

Un documento por módulo, escrito mientras se construye. Orden de lectura:

| Documento | Qué cubre | Estado |
|---|---|---|
| [backend/01-base-de-datos-y-validacion.md](backend/01-base-de-datos-y-validacion.md) | SQLite, tipos y esquemas Zod | ✅ hecho |
| [backend/02-rutas-y-errores.md](backend/02-rutas-y-errores.md) | Endpoints REST, códigos HTTP, manejador de errores | ✅ hecho |
| [backend/04-datos-de-ejemplo.md](backend/04-datos-de-ejemplo.md) | Datos de ejemplo (seed): solo si la base está vacía | ✅ hecho |
| [backend/03-tests.md](backend/03-tests.md) | Tests del backend (10) | ✅ hecho |
| [frontend/01-cliente-api-y-hook.md](frontend/01-cliente-api-y-hook.md) | Tipos, cliente de la API y hook `useTasks` (9 tests) | ✅ hecho |
| [frontend/02-lista-y-filtro.md](frontend/02-lista-y-filtro.md) | Lista, filtro por estado, cambio de estado, carga y error | ✅ hecho |
| [frontend/03-formulario.md](frontend/03-formulario.md) | Formulario validado | ✅ hecho |
| [frontend/04-tests-de-componentes.md](frontend/04-tests-de-componentes.md) | Tests de componentes e integración (21 nuevos; 30 en el frontend) | ✅ hecho |
| [despliegue-con-contenedores.md](despliegue-con-contenedores.md) | Compose, Dockerfiles, nginx, y los fallos que apareció al probarlo | ✅ hecho |
| [frontend/05-separador-glowline.md](frontend/05-separador-glowline.md) | Separador decorativo `GlowLine` (portado de Tailwind a CSS plano) | ✅ hecho |
| [frontend/06-colores-por-estado.md](frontend/06-colores-por-estado.md) | Colores por estado con `NeonCard` (portado de Next.js a CSS plano) | ✅ hecho |
| [frontend/07-notificaciones.md](frontend/07-notificaciones.md) | Notificaciones del ciclo de vida de las tareas | ✅ hecho |
| [decisiones.md](decisiones.md) | Decisiones técnicas y por qué | 🔄 se va ampliando |
| [uso-de-ia.md](uso-de-ia.md) | Cómo se usó la IA: qué se pidió, aceptó y corrigió | 🔄 se va ampliando |

## Cómo ejecutar

| Qué | Comando |
|---|---|
| API + web | `./scripts/dev.sh` (o `npm run dev`) |
| Solo API (http://localhost:3001/api/health) | `./scripts/api.sh` |
| Solo web (http://localhost:5173) | `./scripts/web.sh` |
| Tests (backend + frontend, 71) | `npm test` |
