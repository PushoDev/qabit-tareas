import { createApp } from './app.js'
import { openDb } from './db.js'

const PORT = Number(process.env.PORT ?? 3001)

createApp(openDb()).listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`)
})
