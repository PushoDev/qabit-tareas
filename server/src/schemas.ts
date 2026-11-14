import { z } from 'zod'

// Estados en inglés en la API (contrato estable); la UI los muestra en español.
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const
export const taskStatusSchema = z.enum(TASK_STATUSES)
export type TaskStatus = z.infer<typeof taskStatusSchema>

// POST /api/tasks — el cliente nunca elige id, estado inicial ni fecha.
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(120, 'Máximo 120 caracteres'),
  assignee: z.string().trim().min(1, 'El responsable es obligatorio').max(80, 'Máximo 80 caracteres'),
})
export type CreateTaskInput = z.infer<typeof createTaskSchema>

// PATCH /api/tasks/:id/status
export const updateStatusSchema = z.object({ status: taskStatusSchema })

// GET /api/tasks?status=...  (opcional)
export const listQuerySchema = z.object({ status: taskStatusSchema.optional() })

// :id en la URL: entero positivo
export const idParamSchema = z.coerce.number().int().positive()
