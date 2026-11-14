import type { NewTask } from './types'

// Mismos límites que la API (server/src/schemas.ts): se validan aquí para avisar sin esperar al servidor,
// pero la API sigue siendo la que manda (nunca se confía solo en el cliente).
export const TITLE_MAX = 120
export const ASSIGNEE_MAX = 80

export type FormErrors = Partial<Record<keyof NewTask, string>>

export function validateNewTask(values: NewTask): FormErrors {
  const errors: FormErrors = {}
  const title = values.title.trim()
  const assignee = values.assignee.trim()

  if (!title) errors.title = 'El título es obligatorio'
  else if (title.length > TITLE_MAX) errors.title = `Máximo ${TITLE_MAX} caracteres`

  if (!assignee) errors.assignee = 'El responsable es obligatorio'
  else if (assignee.length > ASSIGNEE_MAX) errors.assignee = `Máximo ${ASSIGNEE_MAX} caracteres`

  return errors
}
