# ─────────────────────────────────────────────────────────────
# Stage 1 — Install dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile

# ─────────────────────────────────────────────────────────────
# Stage 2 — Build the React app
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Output: /app/dist — pure static HTML + CSS + JS

# ─────────────────────────────────────────────────────────────
# Stage 3 — Runtime (Nginx serves static files)
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Our custom config
COPY nginx-frontend.conf /etc/nginx/conf.d/app.conf

# Copy built React app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]