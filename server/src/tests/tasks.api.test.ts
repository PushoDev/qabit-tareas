import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app.js'
import { openDb } from '../db.js'

// Cada test recibe una app NUEVA con una base en memoria: sin estado compartido y sin tocar el disco.
let app: ReturnType<typeof createApp>
beforeEach(() => {
  app = createApp(openDb(':memory:'))
})

const crear = (title = 'Comprar pan', assignee = 'Luis') => request(app).post('/api/tasks').send({ title, assignee })

describe('POST /api/tasks', () => {
  it('crea una tarea: 201, estado inicial "pending" y texto sin espacios sobrantes', async () => {
    const res = await crear('  Comprar pan ', ' Luis ')

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 1, title: 'Comprar pan', assignee: 'Luis', status: 'pending' })
    expect(typeof res.body.createdAt).toBe('string')
  })

  it('rechaza datos inválidos con 400 y dice qué campo falló', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Datos inválidos')
    const campos = res.body.details.map((d: { field: string }) => d.field)
    expect(campos).toEqual(expect.arrayContaining(['title', 'assignee']))
  })

  it('responde 400 en JSON (no HTML) cuando el cuerpo no es JSON válido', async () => {
    const res = await request(app).post('/api/tasks').set('Content-Type', 'application/json').send('{"title":')

    expect(res.status).toBe(400)
    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body).toEqual({ error: 'JSON mal formado' })
  })

  it('guarda un intento de inyección SQL como texto y la tabla sigue viva', async () => {
    const malicioso = "x'); DROP TABLE tasks;--"
    await crear(malicioso)

    const lista = await request(app).get('/api/tasks')
    expect(lista.status).toBe(200)
    expect(lista.body[0].title).toBe(malicioso)
  })
})

describe('GET /api/tasks', () => {
  it('lista de la más nueva a la más antigua', async () => {
    await crear('Primera')
    await crear('Segunda')

    const res = await request(app).get('/api/tasks')

    expect(res.status).toBe(200)
    expect(res.body.map((t: { title: string }) => t.title)).toEqual(['Segunda', 'Primera'])
  })

  it('filtra por estado y rechaza un estado que no existe', async () => {
    const { body: tarea } = await crear('A')
    await crear('B')
    await request(app).patch(`/api/tasks/${tarea.id}/status`).send({ status: 'done' })

    const hechas = await request(app).get('/api/tasks?status=done')
    expect(hechas.status).toBe(200)
    expect(hechas.body).toHaveLength(1)
    expect(hechas.body[0]).toMatchObject({ title: 'A', status: 'done' })

    const invalido = await request(app).get('/api/tasks?status=zzz')
    expect(invalido.status).toBe(400)
  })
})

describe('PATCH /api/tasks/:id/status', () => {
  it('cambia el estado y devuelve la tarea actualizada', async () => {
    const { body: tarea } = await crear()

    const res = await request(app).patch(`/api/tasks/${tarea.id}/status`).send({ status: 'in_progress' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: tarea.id, status: 'in_progress' })
  })

  it('404 si la tarea no existe; 400 si el id o el estado son inválidos', async () => {
    const noExiste = await request(app).patch('/api/tasks/999/status').send({ status: 'done' })
    expect(noExiste.status).toBe(404)
    expect(noExiste.body.error).toMatch(/999/)

    const idMalo = await request(app).patch('/api/tasks/abc/status').send({ status: 'done' })
    expect(idMalo.status).toBe(400)
    expect(idMalo.body.details[0].field).toBe('id')

    const { body: tarea } = await crear()
    const estadoMalo = await request(app).patch(`/api/tasks/${tarea.id}/status`).send({ status: 'hecho' })
    expect(estadoMalo.status).toBe(400)
  })
})

describe('Errores y cabeceras generales', () => {
  it('una ruta inexistente da 404 en JSON y no anuncia la tecnología del servidor', async () => {
    const res = await request(app).get('/api/nada')

    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/Ruta no encontrada/)
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})
