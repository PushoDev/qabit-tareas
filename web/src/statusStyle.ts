import type { TaskStatus } from './types'

// Colores por estado: los usa la tarjeta (NeonCard) y el punto del filtro. Mismo criterio que las insignias:
// ámbar = pendiente, azul = en curso, verde = hecha. [color principal, tono claro, color principal] para
// que el degradado se repita sin saltos al animarse.
export const STATUS_COLORS: Record<TaskStatus, { colors: string[]; glow: number }> = {
  pending: { colors: ['#f59e0b', '#fcd34d', '#f59e0b'], glow: 0.35 },
  in_progress: { colors: ['#3b82f6', '#93c5fd', '#3b82f6'], glow: 0.5 },
  done: { colors: ['#22c55e', '#86efac', '#22c55e'], glow: 0.22 }, // las hechas brillan menos: ya no reclaman atención
}
