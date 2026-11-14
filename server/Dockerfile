# API (Express + SQLite). Contexto de construcción: la RAÍZ del repo.
# Imágenes con nombre completo (docker.io/...): así funciona igual con Podman y con Docker.

FROM docker.io/library/node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci -w server --include-workspace-root
COPY server/tsconfig.json server/tsconfig.build.json server/
COPY server/src server/src
RUN npm run build -w server

FROM docker.io/library/node:22-bookworm-slim
ENV NODE_ENV=production PORT=3001 DB_PATH=/data/tasks.db
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci -w server --omit=dev --include-workspace-root && npm cache clean --force
COPY --from=build /app/server/dist server/dist
# La base de datos vive en un volumen (/data), con el dueño correcto para el usuario «node».
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3001
CMD ["node", "server/dist/index.js"]
