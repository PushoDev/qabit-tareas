# Demo en línea en Vercel (una sola URL)

> Archivos: `vercel.json`, `api/index.mjs`, `web/src/components/DemoNotice.tsx`
> **Estado:** preparado, pendiente de desplegar. Es **opcional**: la prueba se evalúa con `podman compose up --build`.
> **Recomendado:** hacerlo en una **rama aparte** (por ejemplo `demo-vercel`) para no tocar lo entregado en `main`.

## Qué es
La misma aplicación en **una sola URL**: Vercel sirve la web estática y ejecuta la API (la misma app Express del proyecto) como una función. No hay un segundo servicio ni CORS.

```
Navegador ──▶ Vercel ┬─ /            → web estática (web/dist)
                     └─ /api/*       → función api/index.mjs (Express + SQLite en /tmp)
```

## Limitación que hay que conocer
En Vercel solo se puede escribir en `/tmp`, y es **efímero**: la base SQLite se vuelve a crear con los **datos de ejemplo** cuando la instancia se recicla (tras un rato de inactividad o al escalar). Con poco tráfico suele haber una sola instancia, así que en una sesión corta las tareas creadas se conservan, pero **no hay garantía**. Por eso la web muestra un aviso («Demo en línea… los datos se reinician»). Si hiciera falta persistencia, la vía es una base alojada (Turso, que es SQLite, o Postgres): el repositorio ya aísla todo el SQL en `taskRepository.ts`.

## Cómo está montado
| Pieza | Qué hace |
|---|---|
| `api/index.mjs` | Importa el servidor **ya compilado** (`server/dist`, para no depender de cómo Vercel resuelva el TypeScript), abre la base en `/tmp/tasks.db`, carga los datos de ejemplo y exporta la app Express como función |
| `vercel.json` | Compila servidor y web, publica `web/dist`, reenvía `/api/*` a la función e incluye el binario nativo de `better-sqlite3` en el paquete de la función |
| `VITE_DEMO_NOTICE=true` | Variable de compilación (en `vercel.json`) que activa el aviso de demo. Sin ella, **no se muestra** y la app es igual que siempre |
| `engines.node = 22.x` (`package.json`) | Fija la versión de Node: el binario de `better-sqlite3` se descarga para una versión concreta |

## Pasos (cuentas del dueño)
1. **Rama aparte** (los commits los haces tú):
   ```bash
   git switch -c demo-vercel
   git add -A && git commit -m "Demo en línea en Vercel"
   git push -u origin demo-vercel
   ```
2. En https://vercel.com → **Add New → Project** → importar `PushoDev/qabit-tareas`. Ajustes:

   | Ajuste | Valor |
   |---|---|
   | Root Directory | *(vacío, la raíz del repo)* |
   | Framework Preset | **Other** |
   | Build / Output / Install | los de `vercel.json` (no tocar) |
   | Variables de entorno | ninguna |
3. En **Settings → Git → Production Branch** poner `demo-vercel` y volver a desplegar. (Así `main` queda exactamente como se entregó.)
4. **Comprobar:** abrir la URL → debe verse la lista con 7 tareas y el aviso azul de demo; crear una tarea y cambiarle el estado; `https://<proyecto>.vercel.app/api/health` → `{"status":"ok"}`.

## Qué se verificó en local y qué no
- ✅ El `buildCommand` de `vercel.json`, tal cual, compila servidor y web; el aviso queda activado en el *bundle*.
- ✅ La función `api/index.mjs` ejecutada con un servidor HTTP: health, 7 tareas de ejemplo, crear (201), cambiar estado (200), 400, 404 en JSON, base creada en `/tmp`.
- ✅ 73 tests en verde (15 backend + 58 frontend, con los 2 del aviso).
- ⚠️ **No verificable en local:** que Vercel empaquete el binario nativo de `better-sqlite3`. Se mitiga con `includeFiles` y fijando Node 22, pero **hasta el primer despliegue no se sabe**. Si `/api/health` falla allí, el síntoma sería un error de «módulo nativo» en los logs de la función.

## Decisiones
- **Una sola URL con SQLite temporal** en vez de repartir web y API: más simple de mantener y de explicar, a cambio de datos no persistentes (avisado en pantalla).
- **Función `.mjs` que importa `server/dist`**: evita las incógnitas de compilar TypeScript con extensiones `.js` dentro de Vercel.
- **Aviso activado solo por variable de compilación:** el despliegue de demo lo muestra y `main`, el compose y el modo local no.
