import express from 'express'
import type { Db } from './db.js'
import { errorHandler, notFound } from './errors.js'
import { createTasksRouter } from './routes/tasks.js'
import { createTaskRepository } from './taskRepository.js'

// createApp recibe la base: en producción un archivo, en los tests ':memory:'.
export function createApp(db: Db) {
  const app = express()
  app.disable('x-powered-by') // no anunciar la tecnología
  app.use(express.json({ limit: '10kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })
  app.use('/api/tasks', createTasksRouter(createTaskRepository(db)))

  app.use(notFound)
  app.use(errorHandler)
  return app
}
