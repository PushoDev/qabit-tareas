import { describe, expect, it } from 'vitest'
import { openDb } from '../db.js'

describe('base de datos', () => {
  it('asigna "pending" por defecto y la propia base rechaza un estado inválido (CHECK)', () => {
    const db = openDb(':memory:')

    const fila = db.prepare("INSERT INTO tasks (title, assignee) VALUES ('t', 'a') RETURNING status").get() as { status: string }
    expect(fila.status).toBe('pending')

    expect(() => db.prepare("UPDATE tasks SET status = 'hecho' WHERE id = 1").run()).toThrow(/CHECK constraint/)
  })
})
