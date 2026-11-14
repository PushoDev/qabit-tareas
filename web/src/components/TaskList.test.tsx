import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../types'
import { TaskList } from './TaskList'

const tareas: Task[] = [
  { id: 1, title: 'Primera', assignee: 'Luis', status: 'pending', createdAt: 'x' },
  { id: 2, title: 'Segunda', assignee: 'Ana', status: 'done', createdAt: 'x' },
]

const base = { tasks: [], loading: false, error: null, filtered: false, onRetry: vi.fn(), onChangeStatus: vi.fn() }

describe('TaskList', () => {
  it('primera carga: muestra «Cargando tareas…»', () => {
    render(<TaskList {...base} loading />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando tareas…')
  })

  it('error: muestra el mensaje y «Reintentar» llama a onRetry', async () => {
    const onRetry = vi.fn()
    render(<TaskList {...base} error="No se pudo conectar con el servidor" onRetry={onRetry} />)
    const user = userEvent.setup()

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('sin tareas: el texto cambia según haya o no un filtro activo', () => {
    const { rerender } = render(<TaskList {...base} />)
    expect(screen.getByText('Aún no hay tareas. Crea la primera.')).toBeInTheDocument()

    rerender(<TaskList {...base} filtered />)
    expect(screen.getByText('No hay tareas con este estado.')).toBeInTheDocument()
  })

  it('con tareas: las pinta todas; y al recargar la lista sigue visible pero marcada como ocupada', () => {
    const { rerender } = render(<TaskList {...base} tasks={tareas} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'false')

    rerender(<TaskList {...base} tasks={tareas} loading />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2) // no desaparece (sin parpadeo)
    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
  })
})
