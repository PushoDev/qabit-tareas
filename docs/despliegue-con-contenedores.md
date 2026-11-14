# Despliegue con contenedores (Podman / Docker)

> Archivos: `compose.yaml`, `server/Dockerfile`, `web/Dockerfile`, `web/nginx.conf.template`, `.dockerignore`

## Cómo se usa
```bash
podman compose up --build      # o:  docker compose up --build
# http://localhost:8090
podman compose down            # parar (añade -v para borrar también la base de datos)
```
Funciona con **Podman** (probado con 4.9.3 + podman-compose 1.0.6) y con Docker: las imágenes llevan el nombre completo (`docker.io/library/…`), que es lo que exige Podman.

## Qué levanta
| Servicio | Imagen | Qué hace |
|---|---|---|
| `api` | Node 22 (multi-etapa: compila y deja solo lo necesario), usuario `node` sin privilegios | Express en el 3001 (solo accesible desde la red del compose) |
| `web` | nginx 1.27 con el React ya compilado | Sirve la web y **reenvía `/api` a `api:3001`** (mismo origen, sin CORS). Es lo único que se publica: puerto **8090** |
| volumen `tasks-data` | — | La base de datos SQLite (`/data/tasks.db`): sobrevive a reinicios y a `down` (sin `-v`) |

## Decisiones
- **Multi-etapa y solo dependencias de producción** en la imagen de la API: más pequeña y sin herramientas de desarrollo.
- **Usuario `node`, no root**, y el volumen se prepara con su dueño correcto.
- **Healthcheck en `compose.yaml`**, no en el Dockerfile: Podman construye en formato OCI, que **ignora** la instrucción `HEALTHCHECK` de la imagen.
- **Puerto 8090**: el 8080 y el 8081 los usan otras herramientas de desarrollo habituales (en esta máquina, pgAdmin de Lerd). Se cambia en una línea de `compose.yaml`.

## Problemas que aparecieron al probarlo (y cómo se resolvieron)
| Síntoma | Causa | Solución |
|---|---|---|
| La web no arrancaba: *«address already in use»* en el 8081 | Otro servicio local ya usaba ese puerto | Puerto 8090 |
| Tras reiniciar la API, la web daba **502** | Podman le asigna otra IP al contenedor y nginx se quedaba con la antigua, resuelta al arrancar | `resolver` + `proxy_pass` con variable: nginx resuelve `api` de nuevo cada 2 s. La plantilla recibe el DNS del contenedor con `NGINX_ENTRYPOINT_LOCAL_RESOLVERS`, así sirve igual con Podman y con Docker |
| `healthcheck` vacío | Ver arriba (formato OCI) | Movido a `compose.yaml` |
| Un reinicio de la API tardaba 10 s | Node como proceso principal ignora `SIGTERM` si no lo captura; el orquestador espera 10 s y lo mata | La API captura `SIGTERM`/`SIGINT`, cierra el servidor y la base de datos y sale al instante (~0,7 s en recuperarse) |

## Cómo se verificó (Podman real)
Web y assets (200) · API a través de nginx · `POST` 201 / 400 · 404 en JSON · ruta de la SPA devuelve `index.html` · sin `x-powered-by` · **3 reinicios seguidos de la API** (nginx la sigue y los datos se conservan) · reinicio de la web.

## Limitación conocida
Con podman-compose 1.0.6, tras **cambiar** la configuración hay que hacer `podman compose down` antes de `up --build` (si no, se queja de que el nombre del contenedor ya existe).
