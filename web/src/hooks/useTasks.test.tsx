import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '../types'
import { useTasks } from './useTasks'

const tarea = (id: number, status: Task['status'] = 'pending'): Task => ({
  id,
  title: `Tarea ${id}`,
  assignee: 'Luis',
  status,
  createdAt: '2026-11-14T00:00:00Z',
})
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

afterEach(() => vi.unstubAllGlobals())

describe('useTasks', () => {
  it('empieza cargando y luego expone las tareas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([tarea(1), tarea(2)])))

    const { result } = renderHook(() => useTasks())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tasks.map((t) => t.id)).toEqual([1, 2])
    expect(result.current.error).toBeNull()
  })

  it('si la API falla, expone el mensaje de error y deja de cargar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const { result } = renderHook(() => useTasks())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('No se pudo conectar con el servidor')
    expect(result.current.tasks).toEqual([])
  })

  it('al cambiar de filtro rápido, una respuesta lenta ANTIGUA no pisa a la nueva', async () => {
    // Petición 1 (sin filtro): la dejamos pendiente. Petición 2 (filtro "done"): responde enseguida.
    let resolverLenta!: (r: Response) => void
    const lenta = new Promise<Response>((res) => (resolverLenta = res))
    const fetchMock = vi.fn().mockReturnValueOnce(lenta).mockResolvedValueOnce(json([tarea(9, 'done')]))
    vi.stubGlobal('fetch', fetchMock)

    const { result, rerender } = renderHook(({ f }) => useTasks(f), {
      initialProps: { f: undefined as Task['status'] | undefined },
    })
    rerender({ f: 'done' })
    await waitFor(() => expect(result.current.tasks.map((t) => t.id)).toEqual([9]))

    // Ahora llega tarde la respuesta de la petición 1: no debe sobrescribir la lista.
    await act(async () => resolverLenta(json([tarea(1), tarea(2)])))

    expect(result.current.tasks.map((t) => t.id)).toEqual([9])
  })

  it('changeStatus llama al PATCH y vuelve a pedir la lista', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json([tarea(1)])) // carga inicial
      .mockResolvedValueOnce(json(tarea(1, 'done'))) // PATCH
      .mockResolvedValueOnce(json([tarea(1, 'done')])) // recarga
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => result.current.changeStatus(1, 'done'))

    await waitFor(() => expect(result.current.tasks[0].status).toBe('done'))
    expect(fetchMock.mock.calls[1][0]).toBe('/api/tasks/1/status')
    expect(fetchMock.mock.calls[1][1].method).toBe('PATCH')
  })
})
