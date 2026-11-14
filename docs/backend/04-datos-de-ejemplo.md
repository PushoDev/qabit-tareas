# Backend 04 — Datos de ejemplo (seed)

> Módulo: `server/src/seed.ts`, su uso en `server/src/index.ts`, tests en `server/src/tests/seed.test.ts`

## Para qué sirve
La base de datos (`server/data/tasks.db`) está **ignorada por git**, así que quien descargue el repo arrancaría con la lista vacía. El seed carga 7 tareas de ejemplo la primera vez para que la aplicación se vea viva desde el primer minuto.

## Cómo funciona
`seedIfEmpty(db)` cuenta las filas de `tasks`; si hay **cero**, inserta las tareas de ejemplo en **una transacción** (o entran todas o ninguna) y devuelve cuántas cargó. Si ya hay datos, no hace nada y devuelve 0. Se llama desde `index.ts` al arrancar.

| Situación | Resultado |
|---|---|
| Base nueva o vacía | Carga 7 tareas (2 pendientes, 2 en curso, 3 hechas) |
| Reiniciar con datos | No hace nada (**no duplica**) |
| Base con datos del usuario | **No la toca nunca** |
| `SEED_DEMO=false` | No se ejecuta; la base queda vacía |
| Tests (`openDb(':memory:')`) | No se ejecuta: el seed vive en `index.ts`, no en `openDb`, para que los tests partan siempre de una base vacía |

Las tareas cuentan, en pequeño, la historia del propio proyecto (modelo de datos, API, tests, interfaz, README, Podman, tests de extremo a extremo), con **fechas de creación escalonadas** (de hace 6 días a hoy) para que no salgan todas iguales.

## Decisiones
- **Se carga solo si la tabla está vacía**, no «si no existe el archivo»: es una comprobación sobre los datos, no sobre el disco, y funciona igual con el volumen de un contenedor.
- **Activo por defecto** (con `SEED_DEMO=false` para apagarlo): el objetivo es que quien descargue el repo vea datos sin hacer nada.
- **Una transacción:** nunca queda cargado a medias.
- **Fuera de `openDb`:** abrir la base no debe tener efectos secundarios.

## Cómo se verificó
- 5 tests: carga completa y cubre los 3 estados · idempotente · **no toca datos del usuario** · fechas distintas y servidas por la API · `openDb` no carga nada.
- A mano, **desde cero**: base nueva → 7 tareas; segunda ejecución → 7 (sin duplicar); `SEED_DEMO=false` → lista vacía; la base de desarrollo con datos → intacta.
- Con **contenedores desde cero** (`down -v` + `up`): 7 tareas, y tras reiniciar la API siguen siendo 7.
