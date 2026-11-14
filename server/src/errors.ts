import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'

// Error "esperado" con su código HTTP. Todo lo demás es un 500.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: { field: string; message: string }[],
  ) {
    super(message)
  }
}

export function zodToHttpError(err: ZodError, fallbackField = '(body)'): HttpError {
  const details = err.issues.map((i) => ({ field: i.path.join('.') || fallbackField, message: i.message }))
  return new HttpError(400, 'Datos inválidos', details)
}

// Cualquier ruta que no exista -> 404 en JSON (no la página HTML por defecto de Express)
export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.path}`))
}

// Manejador central: un solo sitio decide la forma de todos los errores.
// Formato: { error: string, details?: [{ field, message }] }
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) })
    return
  }
  // JSON mal formado en el cuerpo (lo lanza express.json)
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON mal formado' })
    return
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Cuerpo demasiado grande' })
    return
  }
  console.error(err) // el detalle va al log, nunca al cliente
  res.status(500).json({ error: 'Error interno del servidor' })
}
