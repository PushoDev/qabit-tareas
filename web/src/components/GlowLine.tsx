import type { CSSProperties } from 'react'

export type Orientation = 'vertical' | 'horizontal'
export type ColorScheme = 'purple' | 'blue' | 'green' | 'red'

interface GlowLineProps {
  orientation?: Orientation
  color?: ColorScheme
  /**
   * Posición (left si es vertical, top si es horizontal). Con `position` la línea se coloca en
   * absoluto dentro de su contenedor; sin ella, se comporta como un separador normal en el flujo.
   */
  position?: string
  className?: string
}

// Tres capas desenfocadas por detrás de la línea: cuanto más ancha, más difusa y más tenue.
// Los colores, tamaños y desenfoques están en index.css (.glow__layer--1/2/3).
const LAYERS = [1, 2, 3] as const

/**
 * Línea decorativa con resplandor. Portada desde una versión con clases de Tailwind a CSS plano
 * (el proyecto no usa Tailwind), conservando la misma API y el mismo aspecto.
 * Es solo decoración: se oculta a los lectores de pantalla.
 */
export default function GlowLine({ orientation = 'horizontal', color = 'blue', position, className = '' }: GlowLineProps) {
  const style: CSSProperties | undefined =
    position === undefined ? undefined : orientation === 'vertical' ? { left: position } : { top: position }

  const classes = [
    'glow',
    `glow--${orientation}`,
    `glow--${color}`,
    position !== undefined && 'glow--absolute',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} style={style} aria-hidden="true" data-testid="glow-line">
      <div className="glow__core" />
      <div className="glow__hot" />
      {LAYERS.map((n) => (
        <div key={n} className={`glow__layer glow__layer--${n}`} />
      ))}
    </div>
  )
}
