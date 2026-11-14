import { createApp } from './app.js'
import { openDb } from './db.js'
import { seedIfEmpty } from './seed.js'

const PORT = Number(process.env.PORT ?? 3001)

const db = openDb()

// Primera ejecución: si la base está vacía, se cargan tareas de ejemplo para que la app no arranque en blanco.
// No toca una base con datos. Para desactivarlo: SEED_DEMO=false
if (process.env.SEED_DEMO !== 'false') {
  const inserted = seedIfEmpty(db)
  if (inserted > 0) console.log(`Base vacía: cargadas ${inserted} tareas de ejemplo (SEED_DEMO=false lo desactiva)`)
}

const server = createApp(db).listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`)
})

// Cierre ordenado: Node como proceso principal de un contenedor ignora SIGTERM si no lo captura,
// y el orquestador tendría que esperar 10 s y matarlo. Así se cierra al instante, sin cortar peticiones.
function shutdown(signal: string) {
  console.log(`${signal} recibida: cerrando…`)
  server.close(() => {
    db.close()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 5000).unref() // por si alguna conexión no termina
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
