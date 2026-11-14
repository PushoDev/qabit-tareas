import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { Task } from './types'

// Mini API falsa en memoria: la app completa (App + hook + cliente + componentes) corre de verdad;
// solo se sustituye la red.
function apiFalsa(inicial: Task[]) {
  const tareas = [...inicial]
  const llamadas: string[] = []
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } })

  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    llamadas.push(`${init?.method ?? 'GET'} ${url}`)
    const u = new URL(url, 'http://x')
    if (init?.method === 'POST') {
      const b = JSON.parse(init.body as string)
      const t: Task = { id: tareas.length + 1, ...b, status: 'pending', createdAt: 'x' }
      tareas.unshift(t)
      return json(t, 201)
    }
    const estado = u.searchParams.get('status')
    return json(estado ? tareas.filter((t) => t.status === estado) : tareas)
  })
  return { fetchMock, llamadas }
}

const t = (id: number, title: string, status: Task['status']): Task => ({ id, title, assignee: 'Luis', status, createdAt: 'x' })

afterEach(() => vi.unstubAllGlobals())

describe('App (integración)', () => {
  it('carga la lista y cada filtro pide al servidor solo ese estado', async () => {
    const { fetchMock, llamadas } = apiFalsa([t(1, 'Pendiente A', 'pending'), t(2, 'Hecha B', 'done')])
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    const user = userEvent.setup()

    expect(await screen.findByText('Pendiente A')).toBeInTheDocument()
    expect(screen.getByText('Hecha B')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hecha' }))

    await waitFor(() => expect(screen.queryByText('Pendiente A')).not.toBeInTheDocument())
    expect(screen.getByText('Hecha B')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hecha' })).toHaveAttribute('aria-pressed', 'true')
    expect(llamadas).toContain('GET /api/tasks?status=done')
  })

  it('crear una tarea con un filtro que la ocultaría: aparece y el filtro vuelve a «Todas»', async () => {
    const { fetchMock } = apiFalsa([t(1, 'Hecha B', 'done')])
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    const user = userEvent.setup()
    await screen.findByText('Hecha B')
    await user.click(screen.getByRole('button', { name: 'Hecha' }))

    await user.type(screen.getByLabelText('Título'), 'Nueva tarea')
    await user.type(screen.getByLabelText('Responsable'), 'Ana')
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }))

    expect(await screen.findByText('Nueva tarea')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true')
  })
})
