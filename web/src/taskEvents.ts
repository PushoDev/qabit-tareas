import type { ToastOptions } from './toast/toastContext'
import type { TaskStatus } from './types'

// Qué notificación corresponde a cada momento de la vida de una tarea: creada → en curso → hecha (→ reabierta).

export function createdToast(title: string, assignee: string): ToastOptions {
  return { type: 'success', title: 'Tarea creada', message: `«${title}» queda pendiente para ${assignee}.` }
}

export function transitionToast(title: string, from: TaskStatus | undefined, to: TaskStatus): ToastOptions {
  if (to === 'in_progress') return { type: 'info', title: 'Tarea en curso', message: `«${title}» ha comenzado.` }
  if (to === 'done') return { type: 'success', title: '¡Tarea completada!', message: `«${title}» está hecha.` }
  // to === 'pending': solo se llega desde «hecha» (reabrir) o desde «en curso»
  return from === 'done'
    ? { type: 'warning', title: 'Tarea reabierta', message: `«${title}» vuelve a pendiente.` }
    : { type: 'info', title: 'Tarea pendiente', message: `«${title}» vuelve a pendiente.` }
}
