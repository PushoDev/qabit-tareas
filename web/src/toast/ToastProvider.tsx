import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastOptions, type ToastPosition, type ToastType } from './toastContext'

interface ToastItemData extends ToastOptions {
  id: number
}

const DEFAULT_DURATION: Record<ToastType, number | null> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 7000, // los errores se quedan más tiempo
  loading: null, // «cargando» espera a que se actualice o se cierre
}
const MAX_VISIBLE = 4

// ---- Una notificación ----

const ICONS: Record<Exclude<ToastType, 'loading'>, string> = {
  success: 'M5 13l4 4L19 7',
  info: 'M12 8h.01M11 12h1v5h1',
  warning: 'M12 9v4m0 4h.01M10.3 4.3L2.6 18a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z',
  error: 'M6 6l12 12M18 6L6 18',
}

function ToastItem({ toast, onClose }: { toast: ToastItemData; onClose: () => void }) {
  const [paused, setPaused] = useState(false)
  const duration = toast.duration === undefined ? DEFAULT_DURATION[toast.type] : toast.duration

  // Se cierra solo tras `duration`, salvo que el usuario tenga el ratón encima o el foco dentro (pausa).
  // Al cambiar de tipo (loading → success) el efecto se reinicia y empieza a contar.
  useEffect(() => {
    if (duration == null || paused) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, paused, toast.type, toast.title, onClose])

  return (
    <div
      className={`toast toast--${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="toast__icon" aria-hidden="true">
        {toast.type === 'loading' ? (
          <span className="spinner" />
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d={ICONS[toast.type]} />
          </svg>
        )}
      </span>
      <div className="toast__text">
        <strong className="toast__title">{toast.title}</strong>
        {toast.message && <p className="toast__message">{toast.message}</p>}
      </div>
      <button type="button" className="toast__close" aria-label="Cerrar notificación" onClick={onClose}>
        ×
      </button>
    </div>
  )
}

// ---- Proveedor + contenedor ----

export function ToastProvider({ children, position = 'bottom-right' }: { children: ReactNode; position?: ToastPosition }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), [])

  const show = useCallback((options: ToastOptions) => {
    const id = nextId.current++
    // Máximo MAX_VISIBLE a la vez: si hay más, se descartan las más antiguas.
    setToasts((all) => [...all, { ...options, id }].slice(-MAX_VISIBLE))
    return id
  }, [])

  const update = useCallback((id: number, patch: Partial<ToastOptions>) => {
    // `duration` se reinicia salvo que el cambio la indique: pasar de «loading» a «success» debe usar la de «success».
    setToasts((all) => all.map((t) => (t.id === id ? { ...t, duration: undefined, ...patch } : t)))
  }, [])

  const api = useMemo(() => ({ show, update, dismiss }), [show, update, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={`toasts toasts--${position}`} role="region" aria-label="Notificaciones">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
