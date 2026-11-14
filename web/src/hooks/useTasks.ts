import { useCallback, useEffect, useState } from 'react'
import { ApiError, tasksApi } from '../api/tasksApi'
import type { NewTask, Task, TaskStatus } from '../types'

export interface UseTasks {
  tasks: Task[]
  loading: boolean // hay una petición de la lista en curso
  error: string | null // fallo al cargar la lista
  reload: () => void
  create: (task: NewTask) => Promise<Task> // lanza ApiError (el formulario muestra details)
  changeStatus: (id: number, status: TaskStatus) => Promise<void>
}

// Resultado de la última petición TERMINADA, etiquetado con la petición a la que respondía.
interface Result {
  key: string
  tasks: Task[]
  error: string | null
}

export function useTasks(filter?: TaskStatus): UseTasks {
  const [tick, setTick] = useState(0) // sube para forzar una recarga
  const [result, setResult] = useState<Result>({ key: '', tasks: [], error: null })

  // Identifica la petición actual. Si el resultado guardado es de otra clave, aún estamos cargando.
  const key = `${filter ?? 'all'}#${tick}`

  useEffect(() => {
    // `cancelled` descarta la respuesta de una petición antigua: si el usuario cambia de filtro
    // rápido, una respuesta lenta anterior no debe pisar a la nueva.
    let cancelled = false
    tasksApi
      .list(filter)
      .then((tasks) => !cancelled && setResult({ key, tasks, error: null }))
      .catch(
        (e: unknown) =>
          !cancelled &&
          setResult((prev) => ({ key, tasks: prev.tasks, error: e instanceof ApiError ? e.message : 'Error inesperado' })),
      )
    return () => {
      cancelled = true
    }
  }, [filter, key])

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

  const loading = result.key !== key
  return { tasks: result.tasks, loading, error: loading ? null : result.error, reload, create, changeStatus }
}
