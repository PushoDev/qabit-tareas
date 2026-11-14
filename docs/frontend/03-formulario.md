# Frontend 03 — Formulario de creación y validación

> Módulo: `web/src/validation.ts`, `web/src/components/TaskForm.tsx` (y su uso en `App.tsx`)

## Para qué sirve
Crear una tarea (título y responsable) con validación inmediata en el cliente y, si aun así la API rechaza algo, mostrar su mensaje bajo el campo correspondiente.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `validation.ts` | `validateNewTask(valores)` → errores por campo. Función **pura** (sin React), fácil de probar. Límites: título 120, responsable 80 |
| `components/TaskForm.tsx` | Formulario controlado: valida, envía, muestra errores y mensajes |
| `App.tsx` | Pasa `create` del hook al formulario y, tras crear, vuelve el filtro a «Todas» |

## Flujo al pulsar «Crear tarea» (o Enter)
1. **Validación en el cliente** (`trim`, obligatorio, máximo). Si falla: mensajes bajo cada campo, los campos se marcan (`aria-invalid`), el **foco va al primer campo inválido** y **no se envía nada**.
2. Si es válida: `POST /api/tasks` con los textos recortados; el botón pasa a «Creando…» y se desactiva (evita doble envío).
3. **Éxito:** se vacían los campos, aparece «Tarea creada» (`role="status"`) y el foco vuelve al título para escribir la siguiente.
4. **La API rechaza campos concretos (400 con `details`):** cada mensaje va bajo su campo y el foco al primero. Se conserva lo escrito.
5. **Fallo general** (servidor caído, 500…): mensaje de error en el formulario (`role="alert"`) y se conserva lo escrito.

Al **escribir** en un campo desaparece su error, y también el error general y el «Tarea creada».

## Accesibilidad
- Cada campo tiene `<label>` asociado; el error se vincula con `aria-describedby`.
- `noValidate` en el `<form>`: la validación la hace la aplicación, con mensajes en español, no los globos del navegador.
- Mensajes dinámicos anunciados: `role="alert"` (errores) y `role="status"` (éxito).

## Decisiones
- **Se valida en el cliente Y en la API.** El cliente evita viajes inútiles y da respuesta inmediata; la API sigue siendo la autoridad. Si discrepan, gana la API y su mensaje se muestra bajo el campo.
- **Mismos límites en los dos lados** (120 y 80). Duplicados a propósito; con más tiempo se compartirían en un paquete común.
- **Tras crear, el filtro vuelve a «Todas».** Una tarea nueva siempre nace «Pendiente»; si el filtro activo fuera «Hecha» la tarea parecería no haberse creado.
- **Errores por campo vs. error general.** Un 400 con `details` es culpa de un dato (va bajo su campo); un fallo de red no es de ningún campo (va en el formulario).
- **Se conserva lo escrito ante un fallo:** nadie debe volver a teclear por un error de red.

## Cómo se verificó (Chrome real, clics y teclado)
| Prueba | Resultado |
|---|---|
| Enviar vacío | Dos errores, campos marcados, foco en «Título», **ninguna petición** |
| Solo título + Enter | Solo error de responsable, foco en «Responsable»; el título conserva lo escrito |
| Completar + Enter | `POST` 201 y `GET`; título guardado **recortado** (comprobado en la base); campos vacíos; «Tarea creada»; foco en «Título» |
| Crear con filtro «Hecha» activo | La tarea aparece: el filtro vuelve a «Todas» |
| Red caída (simulada solo en la página) | «No se pudo conectar con el servidor»; datos conservados; botón habilitado; el error desaparece al escribir |

Los datos de prueba creados se borraron de la base. **Pendiente:** el caso «la API devuelve 400 con `details`» no se puede provocar desde la pantalla (el cliente lo evita antes); se cubre con un test de componente en el paso 5d.
