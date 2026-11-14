import { useState } from 'react'
import GlowLine from './components/GlowLine'
import { StatusFilter } from './components/StatusFilter'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useTasks } from './hooks/useTasks'
import { createdToast, transitionToast } from './taskEvents'
import { ToastProvider } from './toast/ToastProvider'
import { useToast } from './toast/toastContext'
import type { NewTask, TaskStatus } from './types'

function TaskApp() {
  const toast = useToast()
  const [filter, setFilter] = useState<TaskStatus | undefined>(undefined)
  const { tasks, loading, error, reload, create, changeStatus } = useTasks(filter)

  async function handleCreate(task: NewTask) {
    // «Cargando» → «creada»: la misma notificación cambia cuando responde la API.
    const id = toast.show({ type: 'loading', title: 'Creando tarea…', message: task.title })
    try {
      await create(task)
    } catch (e) {
      toast.dismiss(id) // el formulario ya muestra el error; no se duplica
      throw e
    }
    toast.update(id, createdToast(task.title, task.assignee))
    // Una tarea nueva siempre nace «Pendiente»: si el filtro activo la ocultaría, volvemos a «Todas».
    setFilter(undefined)
  }

  async function handleChangeStatus(id: number, status: TaskStatus) {
    const previous = tasks.find((t) => t.id === id)
    await changeStatus(id, status) // si falla, la propia tarea muestra el error; no hay notificación
    toast.show(transitionToast(previous?.title ?? 'La tarea', previous?.status, status))
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Gestor de tareas</h1>
        <p className="app__subtitle">Crea tareas, asígnalas y sigue su estado.</p>
      </header>

      <TaskForm onCreate={handleCreate} />

      <GlowLine orientation="horizontal" color="blue" className="app__divider" />

      <StatusFilter value={filter} onChange={setFilter} />

      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        filtered={filter !== undefined}
        onRetry={reload}
        onChangeStatus={handleChangeStatus}
      />
    </main>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <TaskApp />
    </ToastProvider>
  )
}
