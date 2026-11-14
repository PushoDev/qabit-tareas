import { useState } from 'react'
import { ApiError } from '../api/tasksApi'
import { STATUS_LABEL, type Task, type TaskStatus } from '../types'

// El botón lleva la tarea al siguiente paso natural: pendiente → en curso → hecha → (reabrir).
const NEXT: Record<TaskStatus, { to: TaskStatus; label: string }> = {
  pending: { to: 'in_progress', label: 'Empezar' },
  in_progress: { to: 'done', label: 'Marcar hecha' },
  done: { to: 'pending', label: 'Reabrir' },
}

interface Props {
  task: Task
  onChangeStatus: (id: number, status: TaskStatus) => Promise<void>
}

export function TaskItem({ task, onChangeStatus }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const next = NEXT[task.status]

  async function handleClick() {
    setBusy(true)
    setError(null)
    try {
      await onChangeStatus(task.id, next.to)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="task" data-status={task.status}>
      <div className="task__main">
        <span className="task__title">{task.title}</span>
        <span className="task__meta">Responsable: {task.assignee}</span>
        {error && (
          <span className="task__error" role="alert">
            {error}
          </span>
        )}
      </div>
      <span className={`badge badge--${task.status}`}>{STATUS_LABEL[task.status]}</span>
      <button
        type="button"
        className="btn"
        disabled={busy}
        onClick={handleClick}
        aria-label={`${next.label}: ${task.title}`}
      >
        {busy ? 'Guardando…' : next.label}
      </button>
    </li>
  )
}
