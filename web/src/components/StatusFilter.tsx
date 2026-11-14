import { STATUS_LABEL, TASK_STATUSES, type TaskStatus } from '../types'

interface Props {
  value: TaskStatus | undefined // undefined = todas
  onChange: (status: TaskStatus | undefined) => void
}

const OPTIONS: { value: TaskStatus | undefined; label: string }[] = [
  { value: undefined, label: 'Todas' },
  ...TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
]

export function StatusFilter({ value, onChange }: Props) {
  return (
    <div className="filter" role="group" aria-label="Filtrar por estado">
      {OPTIONS.map((o) => (
        <button
          key={o.label}
          type="button"
          className="filter__btn"
          data-status={o.value}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
