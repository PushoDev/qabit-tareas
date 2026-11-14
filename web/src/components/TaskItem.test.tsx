import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/tasksApi'
import type { Task } from '../types'
import { TaskItem } from './TaskItem'

const tarea = (status: Task['status']): Task => ({
  id: 7,
  title: 'Preparar la demo',
  assignee: 'Luis',
  status,
  createdAt: '2026-11-14T00:00:00Z',
})

const renderItem = (status: Task['status'], onChangeStatus = vi.fn().mockResolvedValue(undefined)) => {
  render(
    <ul>
      <TaskItem task={tarea(status)} onChangeStatus={onChangeStatus} />
    </ul>,
  )
  return onChangeStatus
}

describe('TaskItem', () => {
  it('muestra título, responsable y el estado en español', () => {
    renderItem('in_progress')

    expect(screen.getByText('Preparar la demo')).toBeInTheDocument()
    expect(screen.getByText('Responsable: Luis')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
  })

  it.each([
    ['pending', 'Empezar', 'in_progress'],
    ['in_progress', 'Marcar hecha', 'done'],
    ['done', 'Reabrir', 'pending'],
  ] as const)('estado %s: el botón «%s» pide pasar a %s', async (actual, etiqueta, siguiente) => {
    const onChangeStatus = renderItem(actual)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: `${etiqueta}: Preparar la demo` }))

    expect(onChangeStatus).toHaveBeenCalledExactlyOnceWith(7, siguiente)
  })

  it('mientras guarda, el botón queda desactivado y dice «Guardando…»', async () => {
    let terminar!: () => void
    renderItem('pending', vi.fn(() => new Promise<void>((res) => (terminar = res))))
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /Empezar/ }))

    expect(screen.getByRole('button', { name: /Empezar/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Empezar/ })).toHaveTextContent('Guardando…')

    terminar()
    expect(await screen.findByRole('button', { name: /Empezar/ })).toBeEnabled()
  })

  it('si el cambio falla, el error aparece en ESA tarea y el botón vuelve a estar disponible', async () => {
    renderItem('pending', vi.fn().mockRejectedValue(new ApiError(404, 'La tarea 7 no existe')))
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /Empezar/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La tarea 7 no existe')
    expect(screen.getByRole('button', { name: /Empezar/ })).toBeEnabled()
  })
})
