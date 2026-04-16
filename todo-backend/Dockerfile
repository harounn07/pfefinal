# ─────────────────────────────────────────────
# Stage 1 — Builder
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Set production env early
ENV NODE_ENV=production

# Install build tools for bcrypt native module
RUN apk add --no-cache python3 make g++

# Install dependencies (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY src ./src

# ─────────────────────────────────────────────
# Stage 2 — Runtime (Alpine, minimal attack surface)
# ─────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only needed files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src

EXPOSE 3001

CMD ["node", "src/index.js"]