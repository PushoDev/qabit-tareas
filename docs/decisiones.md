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
| 15 | Botón de **«siguiente paso»** (Empezar → Marcar hecha → Reabrir) | Cubre el flujo normal con un clic; el estado sigue siendo válido siempre | desplegable con los 3 estados |
| 16 | **CSS plano** con variables y tema claro/oscuro automático | Una pantalla pequeña no justifica una librería de estilos | Tailwind / componentes de terceros |
| 17 | `loading` **derivado** del resultado etiquetado en el hook | Evita `setState` dentro del efecto (render en cascada) | un `useState` de `loading` |
| 18 | Validar en el **cliente y en la API** (mismos límites) | Respuesta inmediata sin viajes inútiles; la API sigue mandando | solo servidor, o solo cliente |
| 19 | Tras crear, el **filtro vuelve a «Todas»** | Una tarea nueva es «Pendiente»; con otro filtro activo parecería que no se creó | dejar el filtro y no mostrarla |
| 20 | **Error por campo** (400 con `details`) vs **error general** (red, 500) | Cada fallo se muestra donde el usuario puede actuar | un solo mensaje para todo |
| 21 | Tests que **buscan por rol, etiqueta y texto** (Testing Library + user-event) | Prueban lo que ve el usuario y la accesibilidad; no se rompen al cambiar CSS | seleccionar por clases o por la estructura interna |
| 22 | Un test de **integración con API falsa en memoria** | Cruza todas las capas del frontend sin depender del servidor | solo tests aislados por componente |
| 23 | **Portar `GlowLine` de Tailwind a CSS plano** | El proyecto no usa Tailwind; instalarlo entero por una línea añade dependencia y riesgo en una prueba con tiempo limitado | instalar Tailwind |
| 24 | El separador es **decorativo** (`aria-hidden`) y en el flujo por defecto | No debe anunciarse ni ocupar sitio absoluto sin pedirlo | `position: absolute` siempre |
| 25 | **nginx vuelve a resolver `api`** (plantilla con `resolver`) | Podman cambia la IP de un contenedor al reiniciarlo; sin esto, 502 | dejar la resolución fija al arrancar |
| 26 | La API **captura SIGTERM** y cierra ordenadamente | Un reinicio pasó de 10 s a 0,7 s y no se corta la base de datos | dejar que el orquestador la mate |
| 27 | **Healthcheck en `compose.yaml`** y usuario `node` sin privilegios | Podman ignora `HEALTHCHECK` en imágenes OCI; menos privilegios | healthcheck en el Dockerfile / root |
| 28 | **Seed solo si la tabla está vacía**, activo por defecto (`SEED_DEMO=false` lo apaga) | Quien descargue el repo debe ver datos sin hacer nada, sin riesgo para datos reales | cargar siempre / un script manual |
| 29 | El seed vive en `index.ts`, **no en `openDb`** | Abrir la base no debe tener efectos secundarios; los tests parten de una base vacía | seed dentro de `openDb` |
| 30 | Color por estado definido **en un solo archivo** (`statusStyle.ts`) y usado en tarjeta, insignia y filtro | Una única clasificación coherente | colores sueltos por componente |
| 31 | **Quitar las partículas** de `NeonCard` y la posición del ratón en `useState` | Pesaban, saltaban en cada render y re-renderizaban en cada movimiento | portarlas tal cual |
| 32 | **Los fallos no generan notificación** (los muestra el formulario o la tarea) | Evita duplicar el mismo error | un toast por cada error |
| 33 | Notificaciones **con pausa al pasar el ratón** y «cargando» que no se cierra solo | Accesibilidad (WCAG 2.2.1) y feedback real de una petición en curso | cierre automático fijo |
| 34 | **Banner como ilustración etiquetada**, con una copia de fondo oscuro | No es una captura (muestra funciones que la app no tiene); el original transparente se perdía en el tema claro | presentarla como captura |

## Entorno de desarrollo (no afecta al resultado)
- El proyecto vive en un disco ext4 (SSD). En un disco NTFS, `npm install` perdió archivos en silencio.
