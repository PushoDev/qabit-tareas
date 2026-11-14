import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from './ToastProvider'
import { useToast, type ToastApi } from './toastContext'

// Captura la API del hook para poder llamarla desde los tests.
let api!: ToastApi
function Grab() {
  const toast = useToast()
  useEffect(() => {
    api = toast
  })
  return null
}
const montar = () =>
  render(
    <ToastProvider>
      <Grab />
    </ToastProvider>,
  )

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('ToastProvider', () => {
  it('muestra título y mensaje; los errores se anuncian como «alert» y el resto como «status»', () => {
    montar()

    act(() => {
      api.show({ type: 'success', title: 'Hecho', message: 'Todo bien' })
      api.show({ type: 'error', title: 'Fallo' })
    })

    expect(screen.getByText('Todo bien')).toBeInTheDocument()
    expect(screen.getByText('Hecho').closest('[role]')).toHaveAttribute('role', 'status')
    expect(screen.getByText('Fallo').closest('[role]')).toHaveAttribute('role', 'alert')
  })

  it('se cierra solo tras su duración (4 s las de éxito), y no antes', () => {
    montar()
    act(() => void api.show({ type: 'success', title: 'Hecho' }))

    act(() => void vi.advanceTimersByTime(3900))
    expect(screen.getByText('Hecho')).toBeInTheDocument()

    act(() => void vi.advanceTimersByTime(200))
    expect(screen.queryByText('Hecho')).not.toBeInTheDocument()
  })

  it('«loading» no se cierra solo; al actualizarla a «success» cambia y empieza a contar', () => {
    montar()
    let id = 0
    act(() => void (id = api.show({ type: 'loading', title: 'Creando…' })))

    act(() => void vi.advanceTimersByTime(60_000))
    expect(screen.getByText('Creando…')).toBeInTheDocument() // un minuto después sigue ahí

    act(() => api.update(id, { type: 'success', title: 'Creada' }))
    expect(screen.queryByText('Creando…')).not.toBeInTheDocument()
    expect(screen.getByText('Creada').closest('[role]')).toHaveClass('toast--success')

    act(() => void vi.advanceTimersByTime(4100))
    expect(screen.queryByText('Creada')).not.toBeInTheDocument()
  })

  it('pasar el ratón por encima pausa el cierre automático; al salir, vuelve a contar', () => {
    montar()
    act(() => void api.show({ type: 'info', title: 'Aviso' }))
    const aviso = screen.getByText('Aviso').closest('[role]') as HTMLElement

    fireEvent.mouseEnter(aviso)
    act(() => void vi.advanceTimersByTime(20_000))
    expect(screen.getByText('Aviso')).toBeInTheDocument() // pausada

    fireEvent.mouseLeave(aviso)
    act(() => void vi.advanceTimersByTime(4100))
    expect(screen.queryByText('Aviso')).not.toBeInTheDocument()
  })

  it('el botón «Cerrar notificación» la cierra al instante', () => {
    montar()
    act(() => void api.show({ type: 'warning', title: 'Cuidado' }))

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }))

    expect(screen.queryByText('Cuidado')).not.toBeInTheDocument()
  })

  it('muestra como máximo 4 a la vez: se descartan las más antiguas', () => {
    montar()

    act(() => {
      for (let i = 1; i <= 6; i++) api.show({ type: 'info', title: `Aviso ${i}`, duration: null })
    })

    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Aviso 2')).not.toBeInTheDocument()
    expect(screen.getAllByText(/^Aviso \d$/)).toHaveLength(4)
    expect(screen.getByText('Aviso 6')).toBeInTheDocument()
  })

  it('useToast fuera de <ToastProvider> falla con un mensaje claro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Grab />)).toThrow('useToast debe usarse dentro de <ToastProvider>')
  })
})
