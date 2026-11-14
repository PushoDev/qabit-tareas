import { useState } from 'react'
import { StatusFilter } from './components/StatusFilter'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useTasks } from './hooks/useTasks'
import type { NewTask, TaskStatus } from './types'

export default function App() {
  const [filter, setFilter] = useState<TaskStatus | undefined>(undefined)
  const { tasks, loading, error, reload, create, changeStatus } = useTasks(filter)

  async function handleCreate(task: NewTask) {
    await create(task)
    // Una tarea nueva siempre nace «Pendiente»: si el filtro activo la ocultaría, volvemos a «Todas».
    setFilter(undefined)
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Gestor de tareas</h1>
        <p className="app__subtitle">Crea tareas, asígnalas y sigue su estado.</p>
      </header>

      <TaskForm onCreate={handleCreate} />

      <StatusFilter value={filter} onChange={setFilter} />

      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        filtered={filter !== undefined}
        onRetry={reload}
        onChangeStatus={changeStatus}
      />
    </main>
  )
}
