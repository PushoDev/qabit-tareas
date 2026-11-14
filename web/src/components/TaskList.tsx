import type { Task, TaskStatus } from '../types'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  loading: boolean
  error: string | null
  filtered: boolean // ¿hay un filtro activo? (cambia el texto del estado vacío)
  onRetry: () => void
  onChangeStatus: (id: number, status: TaskStatus) => Promise<void>
}

export function TaskList({ tasks, loading, error, filtered, onRetry, onChangeStatus }: Props) {
  // Primera carga (aún no hay nada que mostrar): indicador de carga.
  if (loading && tasks.length === 0 && !error) {
    return (
      <p className="state" role="status">
        <span className="spinner" aria-hidden="true" /> Cargando tareas…
      </p>
    )
  }

  if (error) {
    return (
      <div className="state state--error" role="alert">
        <p>{error}</p>
        <button type="button" className="btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return <p className="state">{filtered ? 'No hay tareas con este estado.' : 'Aún no hay tareas. Crea la primera.'}</p>
  }

  // aria-busy: al recargar (cambio de filtro, tras un cambio de estado) la lista sigue visible, atenuada.
  return (
    <ul className="tasks" aria-busy={loading}>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onChangeStatus={onChangeStatus} />
      ))}
    </ul>
  )
}
