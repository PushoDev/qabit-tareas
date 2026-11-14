# Uso de la IA

Herramienta: **Claude Code** (asistente de IA en la terminal), usada durante toda la prueba. Este registro se escribe sobre la marcha.

## Cómo se trabajó
Paso a paso: la IA propone y escribe un trozo pequeño, explica cada decisión, y el desarrollador lo revisa antes de seguir. Backend primero, frontend después.

## Registro

| Etapa | Qué se pidió | Qué se aceptó | Qué se corrigió o se rechazó |
|---|---|---|---|
| Preparación | Crear el proyecto (monorepo, instalación) y enlazarlo con el entorno local | Estructura `server/` + `web/`, scripts de arranque, proxy de `/api` | La IA instaló primero en un disco NTFS que perdía archivos; se detectó con una verificación y se movió al SSD. Una vez ejecutó `npm install` en la carpeta equivocada (sin daño; se revisó) |
| Git | — | — | Faltaba un `.gitignore` y se confirmó `node_modules`; lo detectó la IA al revisar lo que pegó el desarrollador y se corrigió antes de subir nada |
| Backend 01 | Base de datos, tipos y validación | `db.ts`, `schemas.ts`, `types.ts` con `CHECK` en la base y una sola fuente de estados | Verificado con un script de 9 casos y `tsc` antes de aceptar |
| Navegador | Revisar la API en Chrome | Hallazgos aceptados: el 404 devolvía HTML y la cabecera `x-powered-by` anunciaba Express | — |
| Backend 02 | Rutas, repositorio y manejador de errores | Capas ruta → repositorio, `createApp(db)`, formato de error único | Al probar, la IA vio que el id inválido decía el campo `(body)` y que «Required» salía en inglés: lo corrigió y repitió las pruebas. Un `pkill` mal escrito mató su propia terminal (error del comando, no del código) |
| Backend 03 | Tests del backend | 10 tests (Vitest + Supertest), base en memoria por test | Los 10 pasaron a la primera y la IA desconfió: rompió el código a propósito en 3 sitios (prueba de mutación) para comprobar que los tests fallan cuando deben, y luego restauró desde copia |
| Verificación con la base real | «Prueba la API y mira si llegan datos a la base» (idea del desarrollador) | Comprobación con peticiones reales y lectura directa del archivo SQLite; persistencia con un proceso nuevo | — (el desarrollador pidió esta verificación antes de pasar al frontend) |
| Frontend 01 | Tipos, cliente de la API y hook con estados de carga y error | `tasksApi`, `ApiError`, `useTasks` y 9 tests; protección contra la condición de carrera al cambiar de filtro | **Tropiezos de la IA:** (1) escribió `ApiError` con propiedades en el constructor y el proyecto lo prohibe (`erasableSyntaxOnly`): lo corrigió al ver el error de `tsc`; (2) al instalar Vitest 4, `npm` falló con un error interno; en los intentos de arreglarlo la IA **borró `node_modules` y tumbó los servidores del desarrollador** unos minutos (la base de datos quedó intacta). Se resolvió con `legacy-peer-deps` y se verificó con `npm ci` en copia limpia; (3) faltaba el peer `@testing-library/dom`. Tests verificados con prueba de mutación |
| Frontend 02 | Pantalla con lista, filtro, cambio de estado y estados de carga/error, y probarla en el navegador | 4 componentes y CSS con tema claro/oscuro; probado en Chrome real (filtros, PATCH, error simulado con reintento) | (1) El linter marcó `setState` dentro del efecto del hook: la IA lo reescribió derivando `loading`. (2) La pantalla salió en blanco: Vite había cacheado un módulo vacío porque se leyó mientras la IA reescribía el archivo; la IA lo diagnosticó mirando lo que servía Vite y lo resolvió con `touch`. (3) La IA modificó datos de ejemplo durante la prueba y los restauró |
| Frontend 03 | Formulario de creación validado, con los errores de la API bajo cada campo | `validation.ts` (función pura), `TaskForm` accesible, filtro que vuelve a «Todas» tras crear. Probado en Chrome con clics y teclado | La IA creó 2 tareas de prueba en la base de desarrollo y las borró al terminar (solo esas, por título). El caso «la API devuelve 400 con detalles» no se podía provocar desde la pantalla: se deja para un test de componente |
