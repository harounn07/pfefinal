# ─────────────────────────────────────────────
# Stage 1 — Dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine3.21 AS deps

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies (no upgrade for reproducibiliity)
COPY package*.json ./
RUN npm ci --include=dev

# ─────────────────────────────────────────────
# Stage 2 — Build
# ─────────────────────────────────────────────
FROM node:22-alpine3.21 AS builder

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 — Runtime (Nginx)
# ─────────────────────────────────────────────
FROM nginx:stable

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Use non-root nginx user
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]