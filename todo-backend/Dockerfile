# ─────────────────────────────────────────────
# Stage 1 — Builder
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Set production env early
ENV NODE_ENV=production

# Install dependencies (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY src ./src

# If you have build step (TS for example)
# RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — Runtime (Distroless)
# ─────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /app

ENV NODE_ENV=production

# Run as non-root (security best practice)
USER nonroot

# Copy only needed files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src

EXPOSE 3001

# Explicit node execution (clearer for Sonar)
CMD ["node", "src/index.js"]