# ─────────────────────────────────────────────────────────────
# Stage 1 — Install dependencies
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS deps

WORKDIR /app

# Install security updates first
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --frozen-lockfile

# ─────────────────────────────────────────────────────────────
# Stage 2 — Build the React app
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS builder

WORKDIR /app

# Upgrade OS packages
RUN apk update && apk upgrade --no-cache

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 3 — Runtime (Nginx serves static files)
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine3.21 AS runtime

# 🔥 Upgrade ALL system packages (fix vulnerabilities)
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    openssl \
    libxml2 \
    libpng

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx-frontend.conf /etc/nginx/conf.d/app.conf

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]