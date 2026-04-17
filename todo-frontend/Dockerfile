<<<<<<< HEAD
# ─────────────────────────────────────────────
# Stage 1 — Dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine3.21 AS deps

WORKDIR /app

# Install dependencies (need devDeps for vite build)
COPY package*.json ./
RUN npm ci --include=dev

# ─────────────────────────────────────────────
# Stage 2 — Build
# ─────────────────────────────────────────────
FROM node:22-alpine3.21 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 — Runtime (Nginx)
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN apk update && apk upgrade

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
=======
FROM node:22-alpine3.21 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

FROM node:22-alpine3.21 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Fix all permission issues for non-root nginx
RUN mkdir -p /var/cache/nginx /var/run/nginx /run && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx /run && \
    chmod -R 755 /var/cache/nginx /var/run/nginx /run && \
    touch /run/nginx.pid && \
    chown nginx:nginx /run/nginx.pid && \
    sed -i 's/user  nginx;//g' /etc/nginx/nginx.conf && \
    sed -i 's|pid.*nginx.pid;|pid /run/nginx.pid;|g' /etc/nginx/nginx.conf

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> 2c238ff (Test 502)
