# Backend 03 — Tests

> Archivos: `server/src/tests/tasks.api.test.ts`, `server/src/tests/db.test.ts` · Herramientas: **Vitest** + **Supertest**

## Cómo ejecutarlos
```bash
npm test                      # desde la raíz
npm test -w server            # solo el backend
npx vitest                    # (dentro de server/) modo observador
```

## Qué se prueba (10 tests)

| Grupo | Test | Qué demuestra |
|---|---|---|
| `POST /api/tasks` | crea una tarea | 201, estado inicial `pending`, texto sin espacios sobrantes |
| | rechaza datos inválidos | 400 y el campo que falló (`title`, `assignee`) |
| | JSON mal formado | 400 **en JSON**, no en HTML |
| | inyección SQL | el texto malicioso se guarda como texto y la tabla sigue viva |
| `GET /api/tasks` | orden | de la más nueva a la más antigua |
| | filtro por estado | solo devuelve las del estado pedido; un estado inexistente da 400 |
| `PATCH …/status` | cambio de estado | 200 y la tarea actualizada |
| | errores | 404 si no existe; 400 si el id o el estado son inválidos (y el campo se llama `id`) |
| Generales | ruta inexistente | 404 en JSON y sin cabecera `x-powered-by` |
| Base de datos | `db.test.ts` | `pending` por defecto y el `CHECK` rechaza un estado inválido |

El enunciado pide al menos 2 de backend; son 10 porque cada uno protege una decisión del [módulo 02](02-rutas-y-errores.md).

## Decisiones
- **Se prueba la app completa por HTTP** (Supertest), no las funciones sueltas: así se comprueban a la vez rutas, validación, repositorio, base y manejador de errores.
- **Una base nueva en memoria por test** (`beforeEach` + `openDb(':memory:')`): ningún test depende de otro, no se toca el disco y todo corre en ~1 segundo.
- **Los tests de `src/tests/` no entran en el `build`** (`tsconfig.build.json` los excluye), pero sí los revisa `tsc --noEmit`.

## Cómo se verificó que los tests sirven
Un test que nunca falla no prueba nada, así que se hizo una **prueba de mutación manual**: se rompió el código a propósito en tres sitios y cada rotura fue detectada por el test esperado.

| Rotura | Test que falló |
|---|---|
| `POST` devolvía 200 en vez de 201 | «crea una tarea» |
| Se volvió a anunciar `x-powered-by` | «ruta inexistente… sin cabecera» |
| El filtro por estado se ignoraba | «filtra por estado» |

Después se restauró el código (archivos idénticos al original) y volvieron los 10 en verde.
