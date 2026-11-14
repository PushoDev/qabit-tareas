import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../app.js'
import { openDb } from '../db.js'
import { createTaskRepository } from '../taskRepository.js'
import { DEMO_TASKS, seedIfEmpty } from '../seed.js'
import { TASK_STATUSES } from '../schemas.js'

describe('datos de ejemplo (seed)', () => {
  it('con la base vacía carga todas las tareas y cubre los 3 estados', () => {
    const db = openDb(':memory:')

    expect(seedIfEmpty(db)).toBe(DEMO_TASKS.length)

    const estados = new Set(createTaskRepository(db).list().map((t) => t.status))
    expect([...estados].sort()).toEqual([...TASK_STATUSES].sort())
  })

  it('es idempotente: reiniciar no duplica las tareas', () => {
    const db = openDb(':memory:')
    seedIfEmpty(db)

    expect(seedIfEmpty(db)).toBe(0)
    expect(createTaskRepository(db).list()).toHaveLength(DEMO_TASKS.length)
  })

  it('NUNCA toca una base que ya tiene datos del usuario', () => {
    const db = openDb(':memory:')
    const repo = createTaskRepository(db)
    repo.create({ title: 'Mi tarea real', assignee: 'Yo' })

    expect(seedIfEmpty(db)).toBe(0)
    expect(repo.list().map((t) => t.title)).toEqual(['Mi tarea real'])
  })

  it('las fechas de creación son distintas y las tareas se sirven por la API como cualquier otra', async () => {
    const db = openDb(':memory:')
    seedIfEmpty(db)

    const res = await request(createApp(db)).get('/api/tasks')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(DEMO_TASKS.length)
    expect(new Set(res.body.map((t: { createdAt: string }) => t.createdAt.slice(0, 10))).size).toBeGreaterThan(1)
  })

  it('abrir la base (openDb) no carga nada por sí solo: los tests y el resto del código parten de una base vacía', () => {
    expect(createTaskRepository(openDb(':memory:')).list()).toEqual([])
  })
})
