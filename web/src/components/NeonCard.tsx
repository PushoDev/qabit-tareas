import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'

interface NeonCardProps {
  children: ReactNode
  className?: string
  bodyClassName?: string // clase del interior (aquí va el layout de la tarjeta)
  gradientColors?: string[]
  glowIntensity?: number // 0–1: brillo de reposo; al pasar el ratón sube
}

/**
 * Tarjeta con borde degradado animado y un resplandor que sigue al ratón.
 * Portada de una versión de Next.js (framer-motion + Tailwind) a React + CSS plano:
 * - la posición del ratón se escribe en variables CSS (--x, --y) directamente en el DOM, sin `useState`,
 *   así no se re-renderiza en cada movimiento;
 * - se quitaron las partículas aleatorias (peso y saltos en cada render); el resto del efecto se mantiene.
 */
export default function NeonCard({
  children,
  className = '',
  bodyClassName = '',
  gradientColors = ['#ff0080', '#7928ca', '#ff0080'],
  glowIntensity = 0.4,
}: NeonCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  const style = {
    '--neon-gradient': `linear-gradient(90deg, ${gradientColors.join(', ')})`,
    '--neon-color': gradientColors[0],
    '--neon-glow': glowIntensity,
  } as CSSProperties

  return (
    <div ref={ref} className={`neon ${className}`.trim()} style={style} onMouseMove={handleMouseMove}>
      <div className="neon__glow" aria-hidden="true" />
      <div className={`neon__body ${bodyClassName}`.trim()}>
        <div className="neon__spot" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
