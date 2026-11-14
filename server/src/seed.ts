import type { Db } from './db.js'
import type { TaskStatus } from './schemas.js'

interface DemoTask {
  title: string
  assignee: string
  status: TaskStatus
  daysAgo: number // para que las fechas de creación no sean todas iguales
}

// Datos de ejemplo: cuentan, en pequeño, la historia del propio proyecto y cubren los 3 estados.
export const DEMO_TASKS: DemoTask[] = [
  { title: 'Diseñar el modelo de datos', assignee: 'Ana', status: 'done', daysAgo: 6 },
  { title: 'Implementar la API REST', assignee: 'Luis', status: 'done', daysAgo: 5 },
  { title: 'Escribir los tests del backend', assignee: 'Luis', status: 'done', daysAgo: 4 },
  { title: 'Construir la interfaz con React', assignee: 'Ana', status: 'in_progress', daysAgo: 3 },
  { title: 'Preparar el README y las capturas', assignee: 'Marta', status: 'in_progress', daysAgo: 2 },
  { title: 'Configurar el despliegue con Podman', assignee: 'Carlos', status: 'pending', daysAgo: 1 },
  { title: 'Añadir tests de extremo a extremo', assignee: 'Marta', status: 'pending', daysAgo: 0 },
]

/**
 * Carga las tareas de ejemplo SOLO si la tabla está vacía y devuelve cuántas insertó.
 * Es idempotente (reiniciar no duplica) y nunca toca una base que ya tenga datos.
 */
export function seedIfEmpty(db: Db): number {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM tasks').get() as { total: number }
  if (total > 0) return 0

  const insert = db.prepare(
    "INSERT INTO tasks (title, assignee, status, created_at) VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?))",
  )
  // Una transacción: o entran todas o ninguna.
  db.transaction(() => {
    for (const t of DEMO_TASKS) insert.run(t.title, t.assignee, t.status, `-${t.daysAgo} days`)
  })()
  return DEMO_TASKS.length
}
