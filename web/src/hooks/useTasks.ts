import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, tasksApi } from '../api/tasksApi'
import type { NewTask, Task, TaskStatus } from '../types'

export interface UseTasks {
  tasks: Task[]
  loading: boolean // cargando la lista
  error: string | null // fallo al cargar la lista
  reload: () => void
  create: (task: NewTask) => Promise<Task> // lanza ApiError (el formulario muestra details)
  changeStatus: (id: number, status: TaskStatus) => Promise<void>
}

export function useTasks(filter?: TaskStatus): UseTasks {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  // Solo vale la respuesta de la ÚLTIMA petición: si el usuario cambia de filtro rápido,
  // una respuesta lenta antigua no debe pisar a la nueva.
  const latest = useRef(0)

  useEffect(() => {
    const id = ++latest.current
    setLoading(true)
    setError(null)
    tasksApi
      .list(filter)
      .then((data) => id === latest.current && setTasks(data))
      .catch((e: unknown) => id === latest.current && setError(e instanceof ApiError ? e.message : 'Error inesperado'))
      .finally(() => id === latest.current && setLoading(false))
  }, [filter, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  const create = useCallback(
    async (task: NewTask) => {
      const created = await tasksApi.create(task)
      reload() // volver a pedir la lista respeta el filtro activo y el orden del servidor
      return created
    },
    [reload],
  )

  const changeStatus = useCallback(
    async (id: number, status: TaskStatus) => {
      await tasksApi.updateStatus(id, status)
      reload()
    },
    [reload],
  )

  return { tasks, loading, error, reload, create, changeStatus }
}
