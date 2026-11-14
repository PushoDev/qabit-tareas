# Frontend 01 — Tipos, cliente de la API y hook `useTasks`

> Módulo: `web/src/types.ts`, `web/src/api/tasksApi.ts`, `web/src/hooks/useTasks.ts`

## Para qué sirve
Es la capa de datos de la web: habla con la API, traduce sus errores y le da a los componentes un estado listo para pintar (cargando, error, lista). Los componentes (lista, filtro, formulario) vienen después y no tocan `fetch`.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `types.ts` | `Task`, `NewTask`, `TaskStatus` (el contrato con la API) y `STATUS_LABEL`: los estados en español para la pantalla |
| `api/tasksApi.ts` | `tasksApi.list / create / updateStatus` y la clase `ApiError`. Es el único sitio que llama a `fetch` |
| `hooks/useTasks.ts` | `useTasks(filtro?)` → `{ tasks, loading, error, reload, create, changeStatus }` |

## `ApiError`: un solo tipo de fallo
Todo lo que sale mal llega a la interfaz como `ApiError`:

| Situación | `status` | `message` | `details` |
|---|---|---|---|
| La API rechaza los datos | 400 | «Datos inválidos» | `[{ field, message }]` (el formulario marca cada campo) |
| La tarea no existe | 404 | el mensaje de la API | — |
| Servidor caído / sin red | **0** | «No se pudo conectar con el servidor» | — |
| Respuesta que no es JSON (p. ej. un 502 en HTML) | el del HTTP | «Error 502» | — |

## `useTasks`
- Carga al montar y cada vez que cambia el filtro; `loading` y `error` salen listos para mostrar.
- `create` y `changeStatus` **vuelven a pedir la lista** tras el cambio: así se respeta el filtro activo y el orden del servidor, sin duplicar esa lógica en el cliente.
- `create` **lanza** el `ApiError` para que el formulario lea `details`; el error de carga de la lista, en cambio, va a `error`.

## Decisiones de este módulo
- **Condición de carrera resuelta.** Si el usuario cambia de filtro rápido, la respuesta lenta de la petición antigua llegaría después y pisaría a la nueva. La función de limpieza del `useEffect` marca la petición anterior como cancelada (`cancelled`) y su respuesta se descarta.
- **`loading` se deriva, no se guarda.** El hook guarda el último resultado etiquetado con la petición a la que respondía (`key`); si no coincide con la petición actual, es que aún se está cargando. Así no hace falta llamar a `setState` al inicio del efecto (el linter lo marcaba como render en cascada). Mientras carga se conserva la lista anterior, para que la pantalla no parpadee.
- **`fetch` aislado en un archivo:** los componentes no conocen URLs ni cabeceras; cambiar la API toca un solo sitio.
- **Rutas relativas (`/api/...`):** en desarrollo el proxy de Vite las reenvía a Express, así el navegador solo habla con un origen y no hace falta CORS.
- **Recargar en vez de parchear el estado local:** más simple y siempre coherente con el servidor, a costa de una petición extra (aceptable aquí; con más tiempo se haría actualización optimista).
- **Estados en inglés en el contrato, español en pantalla** (`STATUS_LABEL`).

## Tests (9, `npm test -w web`)

| Archivo | Qué prueba |
|---|---|
| `tasksApi.test.ts` (5) | URL con y sin `?status=`; POST con su JSON; 400 → `ApiError` con `details`; servidor caído → estado 0; respuesta de error que no es JSON |
| `useTasks.test.tsx` (4) | carga inicial con `loading`; error de red; **respuesta antigua no pisa a la nueva**; `changeStatus` hace PATCH y recarga |

**Prueba de mutación** (se rompió el código a propósito): quitar la protección de carrera hizo fallar el test de la carrera; dejar de capturar el fallo de red hizo fallar 2 tests. Código restaurado y verificado idéntico. (Después se reescribió el hook para derivar `loading`; los mismos 9 tests siguen en verde.)

## Incidencia de instalación (npm)
Al añadir Vitest 4 (necesario para Vite 8), `npm` 10.9.9 falló con `Cannot read properties of null (reading 'edgesOut')` (un fallo conocido al resolver peers). Solución: `legacy-peer-deps=true` en `.npmrc`, y declarar a mano el peer `@testing-library/dom`. `npm ci` en una copia limpia funciona.
