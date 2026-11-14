import { useId, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../api/tasksApi'
import type { NewTask } from '../types'
import { validateNewTask, type FormErrors } from '../validation'

interface Props {
  onCreate: (task: NewTask) => Promise<unknown> // lanza ApiError si la API rechaza o no responde
}

const EMPTY: NewTask = { title: '', assignee: '' }

export function TaskForm({ onCreate }: Props) {
  const uid = useId()
  const titleRef = useRef<HTMLInputElement>(null)
  const assigneeRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<NewTask>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({}) // errores por campo (cliente o API)
  const [formError, setFormError] = useState<string | null>(null) // fallo general (red caída, 500…)
  const [created, setCreated] = useState(false)
  const [sending, setSending] = useState(false)

  const change = (field: keyof NewTask) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined })) // al corregir un campo, su error desaparece
    setFormError(null)
    setCreated(false)
  }

  function focusFirstInvalid(errs: FormErrors) {
    if (errs.title) titleRef.current?.focus()
    else if (errs.assignee) assigneeRef.current?.focus()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setCreated(false)
    setFormError(null)

    const clientErrors = validateNewTask(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) {
      focusFirstInvalid(clientErrors)
      return
    }

    setSending(true)
    try {
      await onCreate({ title: values.title.trim(), assignee: values.assignee.trim() })
      setValues(EMPTY)
      setCreated(true)
      titleRef.current?.focus() // listo para escribir la siguiente
    } catch (err) {
      if (err instanceof ApiError && err.details.length > 0) {
        // La API rechazó campos concretos: cada mensaje va bajo su campo.
        const fromApi: FormErrors = {}
        for (const d of err.details) {
          if (d.field === 'title' || d.field === 'assignee') fromApi[d.field] = d.message
        }
        setErrors(fromApi)
        focusFirstInvalid(fromApi)
      } else {
        setFormError(err instanceof ApiError ? err.message : 'No se pudo crear la tarea')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-label="Nueva tarea">
      <div className="field">
        <label htmlFor={`${uid}-title`}>Título</label>
        <input
          id={`${uid}-title`}
          ref={titleRef}
          value={values.title}
          onChange={change('title')}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? `${uid}-title-err` : undefined}
          autoComplete="off"
        />
        {errors.title && (
          <p id={`${uid}-title-err`} className="field__error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${uid}-assignee`}>Responsable</label>
        <input
          id={`${uid}-assignee`}
          ref={assigneeRef}
          value={values.assignee}
          onChange={change('assignee')}
          aria-invalid={!!errors.assignee}
          aria-describedby={errors.assignee ? `${uid}-assignee-err` : undefined}
          autoComplete="off"
        />
        {errors.assignee && (
          <p id={`${uid}-assignee-err`} className="field__error">
            {errors.assignee}
          </p>
        )}
      </div>

      <button type="submit" className="btn btn--solid" disabled={sending}>
        {sending ? 'Creando…' : 'Crear tarea'}
      </button>

      {formError && (
        <p className="form__msg form__msg--error" role="alert">
          {formError}
        </p>
      )}
      {created && (
        <p className="form__msg" role="status">
          Tarea creada
        </p>
      )}
    </form>
  )
}
