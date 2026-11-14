import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GlowLine from './GlowLine'

describe('GlowLine', () => {
  it('es solo decoración: queda oculta a los lectores de pantalla', () => {
    render(<GlowLine />)

    expect(screen.getByTestId('glow-line')).toHaveAttribute('aria-hidden', 'true')
  })

  it('por defecto es un separador horizontal azul dentro del flujo (sin posición absoluta)', () => {
    render(<GlowLine />)

    const linea = screen.getByTestId('glow-line')
    expect(linea).toHaveClass('glow', 'glow--horizontal', 'glow--blue')
    expect(linea).not.toHaveClass('glow--absolute')
  })

  it('aplica orientación, color y clase extra; con `position` se coloca en absoluto (top si es horizontal, left si es vertical)', () => {
    const { rerender } = render(<GlowLine orientation="horizontal" color="red" position="40%" className="extra" />)
    let linea = screen.getByTestId('glow-line')
    expect(linea).toHaveClass('glow--red', 'glow--absolute', 'extra')
    expect(linea).toHaveStyle({ top: '40%' })

    rerender(<GlowLine orientation="vertical" color="green" position="25%" />)
    linea = screen.getByTestId('glow-line')
    expect(linea).toHaveClass('glow--vertical', 'glow--green')
    expect(linea).toHaveStyle({ left: '25%' })
  })

  it('dibuja el núcleo, el brillo y las 3 capas de resplandor', () => {
    const { container } = render(<GlowLine />)

    expect(container.querySelectorAll('.glow__core, .glow__hot, .glow__layer')).toHaveLength(5)
  })
})
