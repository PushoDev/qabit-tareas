import { useState } from 'react'
import { StatusFilter } from './components/StatusFilter'
import { TaskList } from './components/TaskList'
import { useTasks } from './hooks/useTasks'
import type { TaskStatus } from './types'

export default function App() {
  const [filter, setFilter] = useState<TaskStatus | undefined>(undefined)
  const { tasks, loading, error, reload, changeStatus } = useTasks(filter)

  return (
    <main className="app">
      <header className="app__header">
        <h1>Gestor de tareas</h1>
        <p className="app__subtitle">Crea tareas, asígnalas y sigue su estado.</p>
      </header>

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
