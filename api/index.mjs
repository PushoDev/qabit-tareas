// Función serverless de Vercel: la MISMA app Express del proyecto, empaquetada como una función.
// Importa el servidor ya compilado (server/dist) para no depender de cómo Vercel resuelva el TypeScript.
//
// Limitación conocida: /tmp es lo único escribible en Vercel y es EFÍMERO. La base (SQLite) vive allí y se
// vuelve a crear con los datos de ejemplo cuando la instancia se recicla. Es una demo; la forma de evaluar el
// proyecto con datos persistentes sigue siendo `podman compose up --build` (ver README).
import { createApp } from '../server/dist/app.js'
import { openDb } from '../server/dist/db.js'
import { seedIfEmpty } from '../server/dist/seed.js'

const db = openDb('/tmp/tasks.db') // se ejecuta una vez por arranque en frío; las llamadas siguientes reutilizan la base
seedIfEmpty(db)

export default createApp(db)
