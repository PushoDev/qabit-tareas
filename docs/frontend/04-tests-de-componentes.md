# Frontend 04 — Tests de componentes e integración

> Archivos: `web/src/validation.test.ts`, `components/TaskForm.test.tsx`, `TaskItem.test.tsx`, `TaskList.test.tsx`, `App.test.tsx` · Herramientas: **Vitest 4** + **Testing Library** + **user-event** + **jsdom**

## Cómo ejecutarlos
```bash
npm test                # raíz: backend + frontend
npm test -w web         # solo el frontend (30 tests)
```

## Qué se prueba (21 tests nuevos; con los 9 de [01](01-cliente-api-y-hook.md), 30 en el frontend)

| Archivo | Tests | Qué demuestran |
|---|---|---|
| `validation.test.ts` | 3 | datos válidos; solo-espacios = vacío; **límites exactos** (el máximo vale, uno más no; los espacios sobrantes no cuentan) |
| `TaskForm.test.tsx` | 6 | vacío → errores, foco en el primero y **ninguna llamada**; válido → textos recortados, campos vacíos y «Tarea creada»; **400 con `details` → cada mensaje bajo su campo** y se conserva lo escrito; fallo general → alerta; el error desaparece al escribir; «Creando…» y sin doble envío |
| `TaskItem.test.tsx` | 6 | título, responsable y estado en español; los 3 botones (`Empezar`, `Marcar hecha`, `Reabrir`) piden el estado correcto; «Guardando…» y desactivado; si falla, el error aparece **en esa tarea** |
| `TaskList.test.tsx` | 4 | «Cargando tareas…»; error con «Reintentar»; vacío con y sin filtro; al recargar la lista **no desaparece** (`aria-busy`) |
| `App.test.tsx` | 2 | **integración:** cada filtro pide `?status=` y muestra solo lo suyo; crear con un filtro que la ocultaría → aparece y el filtro vuelve a «Todas» |

## Decisiones
- **Se busca por lo que ve el usuario** (rol, etiqueta, texto), no por clases CSS ni estructura interna: los tests no se rompen al cambiar los estilos y comprueban también la accesibilidad (`getByRole`, `getByLabelText`).
- **`user-event` en vez de `fireEvent`:** simula clics y teclas como las haría una persona (foco, escritura carácter a carácter).
- **Test de integración con una API falsa en memoria** (`App.test.tsx`): la app completa (componentes + hook + cliente) corre de verdad; solo se sustituye la red. Es el único test que cruza todas las capas del frontend.
- **Los fallos se simulan con `ApiError` reales**, el mismo tipo que lanza el cliente, para no probar un mundo inventado.
- **Un test del 400 con `details`:** cubre lo que no se puede provocar desde la pantalla (el cliente valida antes).

## Cómo se verificó que los tests sirven (prueba de mutación)
Se rompió el código a propósito en 6 sitios; **cada rotura la detectó exactamente un test**, el esperado:

| Rotura | Test que falló |
|---|---|
| El formulario deja de recortar los textos | «válido: envía los textos recortados…» |
| El formulario ignora los `details` de la API | «si la API devuelve 400 con detalles…» |
| «Hecha» → el botón va a «En curso» en vez de reabrir | «estado done: el botón «Reabrir»…» |
| La lista no muestra el error | «error: muestra el mensaje y «Reintentar»…» |
| Tras crear, el filtro no vuelve a «Todas» | «crear una tarea con un filtro que la ocultaría…» |
| Límite del título no inclusivo (`>` → `>=`) | «respeta los límites exactos…» |

Después se restauró el código (archivos idénticos) y volvieron los 30 en verde.

## Estado de calidad al cerrar el código
| Comprobación | Resultado |
|---|---|
| Tests | **40** (10 backend + 30 frontend) en verde |
| `tsc` (backend y frontend) | sin errores |
| `oxlint` (frontend) | sin avisos |
| `npm run build` (backend y frontend) | compilan |

## Qué se haría con más tiempo
- Tests de extremo a extremo (Playwright) contra la app real.
- Compartir los límites de validación entre cliente y servidor.
- Actualización optimista al cambiar de estado (hoy se recarga la lista).
