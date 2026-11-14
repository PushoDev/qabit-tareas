# Frontend 07 — Notificaciones (toasts) del ciclo de vida de las tareas

> Módulo: `web/src/toast/toastContext.ts`, `toast/ToastProvider.tsx`, `web/src/taskEvents.ts`, uso en `App.tsx`

## Para qué sirve
Avisa de cada momento de la vida de una tarea, desde que se crea hasta que se completa:

| Momento | Tipo | Aviso |
|---|---|---|
| Se crea | éxito (verde) | «Tarea creada — «X» queda pendiente para Ana.» (antes, «Creando tarea…» mientras responde la API) |
| Pendiente → En curso | info (azul) | «Tarea en curso» |
| En curso → Hecha | éxito (verde) | «¡Tarea completada!» |
| Hecha → Pendiente | aviso (ámbar) | «Tarea reabierta» |

## Origen y adaptación
Lo aportado era la **página de demostración** (`ToastView`, con unos 50 botones de prueba); el componente `Notification` real no venía incluido y todo estaba escrito para Next.js + Tailwind + framer-motion. Se reutilizó **la API y las ideas** (tipos `success / info / warning / error / loading`, duración, posición y el paso de «cargando» a «éxito») y se escribió el sistema en React + CSS plano.

## API
```tsx
const toast = useToast()
const id = toast.show({ type: 'loading', title: 'Creando tarea…' })
toast.update(id, { type: 'success', title: 'Tarea creada' })   // la misma notificación cambia
toast.dismiss(id)
```

| Archivo | Responsabilidad |
|---|---|
| `toastContext.ts` | Tipos, contexto y el hook `useToast` (separados del componente para no romper el *fast refresh* de Vite) |
| `ToastProvider.tsx` | Estado, contenedor fijo y cada notificación; 6 posiciones posibles (por defecto abajo a la derecha) |
| `taskEvents.ts` | Qué aviso corresponde a cada transición (funciones puras) |

## Comportamiento
- **Duración por tipo:** éxito/info 4 s, aviso 5 s, error 7 s; «cargando» **no se cierra solo** hasta que se actualiza o se cierra.
- **Pausa al pasar el ratón o con el foco dentro** (WCAG 2.2.1: quien necesita más tiempo para leer lo tiene); al salir, vuelve a contar.
- **Máximo 4 a la vez:** las más antiguas se descartan.
- **Accesibilidad:** región «Notificaciones»; los errores usan `role="alert"` y el resto `role="status"`; botón «Cerrar notificación»; sin animación con `prefers-reduced-motion`.

## Decisiones
- **Los fallos no generan notificación.** Un error al crear lo muestra el formulario y uno al cambiar de estado lo muestra la propia tarea; duplicarlos en un aviso sería ruido. Si crear falla, el aviso de «Creando…» se retira (hay un test).
- **Se quitó el «Tarea creada» que mostraba el formulario:** con la notificación era redundante.
- **Sin animación de salida** (el original usaba `AnimatePresence`): no merece la dependencia.
- **Eventos como funciones puras** (`taskEvents.ts`): los textos se prueban sin pintar nada.

## Tests (22)
`ToastProvider.test.tsx` (7): tipos y roles · cierre automático · «cargando» → «éxito» · pausa con el ratón · botón de cerrar · máximo 4 · error fuera del proveedor. `taskEvents.test.ts` (5). `App.test.tsx` (+2): el ciclo creada → en curso → hecha → reabierta, y que un fallo al crear no deja el aviso colgado. Más los de `NeonCard`/colores.

## Cómo se verificó
- **Prueba de mutación (7 roturas, 7 detectadas):** «loading» que se cierra solo · 6 avisos en vez de 4 · error sin `role="alert"` · el ratón no pausa · reabrir sin su aviso · «Creando…» colgado tras un fallo · dos estados con el mismo color.
- **Chrome real:** creé una tarea y la llevé por todo su ciclo; aparecieron los avisos apilados, cada uno con su color.
