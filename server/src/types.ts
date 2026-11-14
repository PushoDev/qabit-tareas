import type { TaskStatus } from './schemas.js'

// Forma de una tarea tal como la devuelve la API.
export interface Task {
  id: number
  title: string
  assignee: string
  status: TaskStatus
  createdAt: string
}
