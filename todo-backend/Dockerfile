# ─────────────────────────────────────────────
# Stage 1 — Builder
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Set production env early
ENV NODE_ENV=production

# Install build tools for bcrypt native module
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY src ./src

# ─────────────────────────────────────────────
# Stage 2 — Runtime (slim Node, not distroless)
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

# Copy only needed files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src

EXPOSE 3001

CMD ["node", "src/index.js"]