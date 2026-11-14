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
