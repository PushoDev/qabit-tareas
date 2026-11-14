# Frontend 05 — Separador con resplandor (`GlowLine`)

> Módulo: `web/src/components/GlowLine.tsx`, estilos `.glow*` en `web/src/index.css`, tests en `GlowLine.test.tsx`

## Para qué sirve
Una línea con resplandor que **separa visualmente el formulario del listado**. Es puramente decorativa.

## Origen y adaptación
El componente se aportó escrito con **clases de Tailwind** (`via-purple-400`, `blur-sm`, `bg-gradient-to-b`…). Este proyecto usa CSS plano, así que se **portó a CSS** conservando la API y el aspecto, en vez de instalar Tailwind entero para una sola línea.

| Original (Tailwind) | Esta versión (CSS plano) |
|---|---|
| `orientation`, `color`, `position`, `className` | **Igual** (con `position` opcional) |
| 4 esquemas de color (`purple`, `blue`, `green`, `red`) con `via-<color>-400/500/300` | Mismos 4 esquemas; los tonos 400/500 de Tailwind como variables CSS (`--glow-core`, `--glow-strong`) |
| 3 capas con `blur-sm / md / lg` y opacidad 100 / 80 / 60 | 3 capas con `blur(8px / 12px / 16px)` y opacidad 1 / .8 / .6 |
| Núcleo `via-white` al 60 % | Núcleo (`.glow__hot`) blanco al 60 % **en tema oscuro** |

## Qué se cambió respecto al original
- **`aria-hidden="true"`:** un lector de pantalla no debe anunciar una línea decorativa.
- **Núcleo adaptado al tema claro:** un núcleo blanco sobre fondo claro es invisible, así que en tema claro usa el tono fuerte del color elegido (`--glow-hot`).
- **Posición opcional.** En el original era siempre `position: absolute` (pensado como fondo decorativo). Aquí, sin `position`, es un separador **en el flujo normal** (una línea de 1 px que ocupa su sitio). Con `position`, vuelve al comportamiento original: absoluto, con `top` (horizontal) o `left` (vertical).
- **Valores por defecto** (`horizontal`, `blue`): el azul combina con el color de acento de la app.
- **`pointer-events: none`:** el resplandor no bloquea clics.

## Uso
```tsx
<GlowLine orientation="horizontal" color="blue" className="app__divider" />
```
Está en `App.tsx`, entre `<TaskForm />` y `<StatusFilter />`. El espaciado alrededor (`.app__divider`) deja sitio al desenfoque de 16 px.

## Tests (4)
Decorativa y oculta a lectores de pantalla · valores por defecto (horizontal, azul, en el flujo) · orientación, color, clase extra y `position` → `top` o `left` · dibuja el núcleo, el brillo y las 3 capas.

## Cómo se verificó
- En Chrome real: la línea queda **entre** el formulario y el filtro, con `aria-hidden`, sin scroll horizontal y con 20 px / 28 px de separación.
- Las capturas de `docs/img/` se **rehicieron** después de añadirla.
- Limitación: el tema claro se razonó pero **no se capturó** (el navegador de pruebas usa el tema oscuro).
