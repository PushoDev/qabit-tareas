import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DemoNotice from './DemoNotice'

describe('DemoNotice', () => {
  it('desactivado (lo normal): no pinta nada', () => {
    const { container } = render(<DemoNotice enabled={false} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('activado (despliegue de demo): avisa de que los datos son de ejemplo y se reinician', () => {
    render(<DemoNotice enabled />)

    const aviso = screen.getByRole('note')
    expect(aviso).toHaveTextContent('Demo en línea')
    expect(aviso).toHaveTextContent('se reinician')
  })
})
