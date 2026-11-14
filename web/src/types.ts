// Contrato con la API (ver docs/backend/02-rutas-y-errores.md)
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Task {
  id: number
  title: string
  assignee: string
  status: TaskStatus
  createdAt: string
}

export interface NewTask {
  title: string
  assignee: string
}

// Etiquetas en español para la pantalla (la API usa los valores en inglés).
export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecha',
}
