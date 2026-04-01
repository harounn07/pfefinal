# ─────────────────────────────────────────────────────────────
# Stage 1 — Builder
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first — leverages layer cache
# If package.json didn't change, npm ci won't re-run
COPY package*.json ./

# Install ALL dependencies
RUN npm ci --frozen-lockfile

# Copy source code
COPY src/ ./src/

# Remove devDependencies — production only
RUN npm prune --production

# ─────────────────────────────────────────────────────────────
# Stage 2 — Runtime (Distroless)
# ─────────────────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12 AS runtime

# Run as non-root user
USER nonroot

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src          ./src
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

# No shell in distroless — must use JSON array form
CMD ["src/index.js"]
