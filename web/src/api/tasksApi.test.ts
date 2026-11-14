import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, tasksApi } from './tasksApi'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

afterEach(() => vi.unstubAllGlobals())

describe('tasksApi', () => {
  it('list pide /api/tasks y añade ?status= solo cuando hay filtro', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([]))
    vi.stubGlobal('fetch', fetchMock)

    await tasksApi.list()
    await tasksApi.list('done')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/tasks')
    expect(fetchMock.mock.calls[1][0]).toBe('/api/tasks?status=done')
  })

  it('create envía POST con el JSON y devuelve la tarea creada', async () => {
    const creada = { id: 1, title: 'A', assignee: 'Luis', status: 'pending', createdAt: 'x' }
    const fetchMock = vi.fn().mockResolvedValue(json(creada, 201))
    vi.stubGlobal('fetch', fetchMock)

    const res = await tasksApi.create({ title: 'A', assignee: 'Luis' })

    expect(res).toEqual(creada)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tasks')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ title: 'A', assignee: 'Luis' })
  })

  it('un 400 de la API se convierte en ApiError con el estado y el detalle por campo', async () => {
    const details = [{ field: 'title', message: 'El título es obligatorio' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'Datos inválidos', details }, 400)))

    const fallo = await tasksApi.create({ title: '', assignee: 'x' }).catch((e) => e)

    expect(fallo).toBeInstanceOf(ApiError)
    expect(fallo).toMatchObject({ status: 400, message: 'Datos inválidos', details })
  })

  it('servidor caído (fetch falla) -> ApiError con estado 0 y mensaje claro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const fallo = await tasksApi.list().catch((e) => e)

    expect(fallo).toBeInstanceOf(ApiError)
    expect(fallo).toMatchObject({ status: 0, message: 'No se pudo conectar con el servidor' })
  })

  it('una respuesta de error que NO es JSON (p. ej. un 502 en HTML) no rompe: da un ApiError genérico', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>502 Bad Gateway</html>', { status: 502 })))

    const fallo = await tasksApi.list().catch((e) => e)

    expect(fallo).toMatchObject({ status: 502, message: 'Error 502' })
  })
})
