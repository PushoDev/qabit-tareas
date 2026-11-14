import type { NewTask, Task, TaskStatus } from '../types'

const BASE = '/api'

export interface FieldError {
  field: string
  message: string
}

// Todo fallo de la API (o de red) llega a la interfaz como un ApiError con la misma forma.
export class ApiError extends Error {
  readonly status: number // 0 = no hubo respuesta (servidor caído, sin red)
  readonly details: FieldError[]

  constructor(status: number, message: string, details: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  // La API siempre responde JSON, pero un proxy caído podría devolver HTML: no romper por eso.
  const body: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    const err = body as { error?: string; details?: FieldError[] } | null
    throw new ApiError(res.status, err?.error ?? `Error ${res.status}`, err?.details ?? [])
  }
  return body as T
}

export const tasksApi = {
  list: (status?: TaskStatus) => request<Task[]>(status ? `/tasks?status=${status}` : '/tasks'),

  create: (task: NewTask) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(task) }),

  updateStatus: (id: number, status: TaskStatus) =>
    request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
