import { describe, expect, it } from 'vitest'
import { createdToast, transitionToast } from './taskEvents'

describe('notificaciones del ciclo de vida de una tarea', () => {
  it('creada: éxito, con el título y el responsable', () => {
    expect(createdToast('Comprar pan', 'Luis')).toEqual({
      type: 'success',
      title: 'Tarea creada',
      message: '«Comprar pan» queda pendiente para Luis.',
    })
  })

  it.each([
    ['pending', 'in_progress', 'info', 'Tarea en curso'],
    ['in_progress', 'done', 'success', '¡Tarea completada!'],
    ['done', 'pending', 'warning', 'Tarea reabierta'],
    ['in_progress', 'pending', 'info', 'Tarea pendiente'],
  ] as const)('%s → %s: %s (%s)', (desde, hasta, tipo, titulo) => {
    const n = transitionToast('X', desde, hasta)

    expect(n.type).toBe(tipo)
    expect(n.title).toBe(titulo)
    expect(n.message).toContain('«X»')
  })
})
