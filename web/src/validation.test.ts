import { describe, expect, it } from 'vitest'
import { ASSIGNEE_MAX, TITLE_MAX, validateNewTask } from './validation'

describe('validateNewTask', () => {
  it('acepta datos correctos', () => {
    expect(validateNewTask({ title: 'Comprar pan', assignee: 'Luis' })).toEqual({})
  })

  it('trata el texto de solo espacios como vacío', () => {
    expect(validateNewTask({ title: '   ', assignee: '\t ' })).toEqual({
      title: 'El título es obligatorio',
      assignee: 'El responsable es obligatorio',
    })
  })

  it('respeta los límites exactos: el máximo vale, uno más no (los espacios sobrantes no cuentan)', () => {
    expect(validateNewTask({ title: 'a'.repeat(TITLE_MAX), assignee: 'b'.repeat(ASSIGNEE_MAX) })).toEqual({})
    expect(validateNewTask({ title: ` ${'a'.repeat(TITLE_MAX)} `, assignee: 'x' })).toEqual({})

    const errores = validateNewTask({ title: 'a'.repeat(TITLE_MAX + 1), assignee: 'b'.repeat(ASSIGNEE_MAX + 1) })
    expect(errores.title).toBe(`Máximo ${TITLE_MAX} caracteres`)
    expect(errores.assignee).toBe(`Máximo ${ASSIGNEE_MAX} caracteres`)
  })
})
