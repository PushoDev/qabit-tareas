import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NeonCard from './NeonCard'

describe('NeonCard', () => {
  it('pinta su contenido y aplica las clases del contenedor y del interior', () => {
    render(
      <NeonCard className="externa" bodyClassName="interna">
        <p>Contenido</p>
      </NeonCard>,
    )

    const contenido = screen.getByText('Contenido')
    expect(contenido.closest('.neon__body')).toHaveClass('interna')
    expect(contenido.closest('.neon')).toHaveClass('externa')
  })

  it('traduce los colores y la intensidad a variables CSS', () => {
    const { container } = render(
      <NeonCard gradientColors={['#111111', '#222222', '#111111']} glowIntensity={0.7}>
        x
      </NeonCard>,
    )

    const tarjeta = container.querySelector('.neon') as HTMLElement
    expect(tarjeta.style.getPropertyValue('--neon-gradient')).toContain('#222222')
    expect(tarjeta.style.getPropertyValue('--neon-color')).toBe('#111111')
    expect(tarjeta.style.getPropertyValue('--neon-glow')).toBe('0.7')
  })

  it('el resplandor sigue al ratón escribiendo --x y --y (sin guardar estado)', () => {
    const { container } = render(<NeonCard>x</NeonCard>)
    const tarjeta = container.querySelector('.neon') as HTMLElement

    fireEvent.mouseMove(tarjeta, { clientX: 120, clientY: 30 })

    // En jsdom el rectángulo está en (0,0): la posición relativa coincide con la del cursor.
    expect(tarjeta.style.getPropertyValue('--x')).toBe('120px')
    expect(tarjeta.style.getPropertyValue('--y')).toBe('30px')
  })

  it('las capas del efecto son decoración: ocultas a los lectores de pantalla', () => {
    const { container } = render(<NeonCard>x</NeonCard>)

    for (const capa of container.querySelectorAll('.neon__glow, .neon__spot')) {
      expect(capa).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
