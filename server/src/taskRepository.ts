import type { Db } from './db.js'
import type { CreateTaskInput, TaskStatus } from './schemas.js'
import type { Task } from './types.js'

interface TaskRow {
  id: number
  title: string
  assignee: string
  status: TaskStatus
  created_at: string
}

const toTask = (r: TaskRow): Task => ({
  id: r.id,
  title: r.title,
  assignee: r.assignee,
  status: r.status,
  createdAt: r.created_at,
})

// Todo el SQL vive aquí. Las rutas no saben que existe SQLite.
// Siempre con parámetros (?), nunca concatenando texto: sin inyección SQL.
export function createTaskRepository(db: Db) {
  const insert = db.prepare<[string, string], TaskRow>('INSERT INTO tasks (title, assignee) VALUES (?, ?) RETURNING *')
  const listAll = db.prepare<[], TaskRow>('SELECT * FROM tasks ORDER BY id DESC')
  const listByStatus = db.prepare<[string], TaskRow>('SELECT * FROM tasks WHERE status = ? ORDER BY id DESC')
  const setStatus = db.prepare<[string, number], TaskRow>('UPDATE tasks SET status = ? WHERE id = ? RETURNING *')

  return {
    create(input: CreateTaskInput): Task {
      return toTask(insert.get(input.title, input.assignee)!)
    },
    list(status?: TaskStatus): Task[] {
      return (status ? listByStatus.all(status) : listAll.all()).map(toTask)
    },
    updateStatus(id: number, status: TaskStatus): Task | undefined {
      const row = setStatus.get(status, id)
      return row && toTask(row)
    },
  }
}
export type TaskRepository = ReturnType<typeof createTaskRepository>
