# ─────────────────────────────────────────────────────────────
# Stage 1 — Builder (Debian, safer than Alpine)
# ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /ap

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy full project (important!)
COPY . .

# Build if needed (uncomment if using TS or build step)
# RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

# ─────────────────────────────────────────────────────────────
# Stage 2 — Runtime (Distroless = minimal + secure)
# ─────────────────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

# Use non-root user (good security practice)
USER nonroot

# Copy only required files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src

# If you have build output instead:
# COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Start app
CMD ["src/index.js"]