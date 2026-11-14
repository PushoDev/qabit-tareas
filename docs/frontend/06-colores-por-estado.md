# Frontend 06 — Colores por estado (`NeonCard`)

> Módulo: `web/src/components/NeonCard.tsx`, `web/src/statusStyle.ts`, estilos `.neon*` en `index.css`; usado en `TaskItem` y en `StatusFilter`

## Para qué sirve
Clasifica las tareas **por color según su estado**, de un vistazo, con un borde degradado animado y un resplandor que sigue al ratón.

| Estado | Color | Brillo |
|---|---|---|
| Pendiente | ámbar | medio |
| En curso | azul | alto (es lo que está pasando ahora) |
| Hecha | verde | bajo (ya no reclama atención) |

El mismo color aparece en la tarjeta, en la insignia y en el **punto del filtro**, para que se lea como una sola clasificación. Los colores y el brillo están en un único sitio: `statusStyle.ts`.

## Origen y adaptación
El componente se aportó escrito para **Next.js** (`"use client"`, `next-themes`, `styled-jsx`) con **Tailwind y framer-motion**. Se portó a React + CSS plano y se corrigieron varios problemas del original:

| Original | Esta versión | Por qué |
|---|---|---|
| Devolvía `null` hasta montarse | Se pinta siempre | Parpadeo y mal para el servidor/tests |
| Posición del ratón en `useState` | Variables CSS `--x`/`--y` escritas directamente en el DOM | Sin re-render en cada movimiento del ratón |
| 10 partículas con posiciones aleatorias **recalculadas en cada render** | **Se quitaron** | Saltaban en cada movimiento y con una lista larga serían muy pesadas |
| `rgba(${color}15, …)` con un color hex | Variables CSS y `radial-gradient` | Esa cadena no es un color válido |
| `hover:scale-[1.02]` | Elevación de 1 px | Escalar desplaza el resto de la lista |
| Animación siempre activa | Se desactiva con `prefers-reduced-motion` | Accesibilidad |

## Decisiones
- **Interfaz `NeonCard` conservada** (`gradientColors`, `glowIntensity`, `className`) más `bodyClassName` para el diseño interior.
- Las capas del efecto son **decoración** (`aria-hidden`).
- **Color como refuerzo, no como único canal:** cada tarjeta lleva además la insignia con el texto del estado, así que no depende solo del color (daltonismo).

## Tests (8)
`NeonCard.test.tsx` (4): contenido y clases · colores e intensidad a variables CSS · el ratón escribe `--x` y `--y` · capas ocultas a lectores de pantalla. `TaskItem.test.tsx` (+4): cada estado usa **su** color · los tres colores son distintos.

## Cómo se verificó
En Chrome: tarjetas verdes, ámbar y azules; puntos de color en el filtro; resplandor siguiendo al cursor; sin errores en consola. **Prueba de mutación:** hacer que dos estados compartan color la detecta un test.
