import { createContext, useContext } from 'react'

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading'
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToastOptions {
  type: ToastType
  title: string
  message?: string
  /** Milisegundos hasta cerrarse solo. `null` = no se cierra (por defecto, solo «loading»). */
  duration?: number | null
}

export interface ToastApi {
  /** Muestra una notificación y devuelve su id (para actualizarla o cerrarla). */
  show: (options: ToastOptions) => number
  /** Cambia una notificación ya mostrada: p. ej. de «loading» a «success». */
  update: (id: number, patch: Partial<ToastOptions>) => void
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return api
}
