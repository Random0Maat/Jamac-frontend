# Etapa 1: Build — compila el proyecto Vue con Vite
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Producción — sirve los archivos estáticos con Nginx
FROM nginx:1-alpine-slim

# Crear usuario no-root
RUN addgroup -g 1000 appgroup && \
    adduser -D -u 1000 -G appgroup appuser && \
    chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

# Copiar archivos de build
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cambiar al usuario no-root
USER appuser

EXPOSE 80

# Añadir HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget -qO- http://localhost:80/ || exit 1
