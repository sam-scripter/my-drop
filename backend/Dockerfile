# Dockerfile — builds the mydrop API into a Docker container image
# Using node:20-slim (Debian) instead of Alpine because Prisma's query engine
# requires OpenSSL which is not reliably available on Alpine for ARM64

# ── Stage 1: Install dependencies ──────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /app

# Install OpenSSL explicitly — required by Prisma on Debian/slim images
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

# ── Stage 2: Final image ────────────────────────────────────────────────
FROM node:20-slim AS final
WORKDIR /app

# OpenSSL needed at runtime too, not just build time
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]