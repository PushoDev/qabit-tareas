import { Router } from 'express'
import { ZodError, type ZodTypeAny, type z } from 'zod'
import { HttpError, zodToHttpError } from '../errors.js'
import { createTaskSchema, idParamSchema, listQuerySchema, updateStatusSchema } from '../schemas.js'
import type { TaskRepository } from '../taskRepository.js'

// Valida con Zod; si falla, lanza un 400 con el detalle por campo.
// `field` nombra el valor cuando el esquema es un escalar (p. ej. el :id de la URL).
function parse<S extends ZodTypeAny>(schema: S, data: unknown, field?: string): z.infer<S> {
  try {
    return schema.parse(data)
  } catch (e) {
    if (e instanceof ZodError) throw zodToHttpError(e, field)
    throw e
  }
}

export function createTasksRouter(repo: TaskRepository) {
  const router = Router()

  // GET /api/tasks?status=pending  -> 200 [Task]
  router.get('/', (req, res) => {
    const { status } = parse(listQuerySchema, req.query)
    res.json(repo.list(status))
  })

  // POST /api/tasks  { title, assignee } -> 201 Task
  router.post('/', (req, res) => {
    const input = parse(createTaskSchema, req.body)
    res.status(201).json(repo.create(input))
  })

  // PATCH /api/tasks/:id/status  { status } -> 200 Task | 404
  router.patch('/:id/status', (req, res) => {
    const id = parse(idParamSchema, req.params.id, 'id')
    const { status } = parse(updateStatusSchema, req.body)
    const task = repo.updateStatus(id, status)
    if (!task) throw new HttpError(404, `La tarea ${id} no existe`)
    res.json(task)
  })

  return router
}
