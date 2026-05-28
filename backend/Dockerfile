# Dockerfile — packages the mydrop API into a Docker container image
# GitHub Actions runs this on every push to main

# ── Stage 1: Install dependencies ──────────────────────────────────────
# Separate stage so the final image doesn't include build tools
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files first — if they haven't changed, Docker uses
# the cached layer and skips npm install (faster builds)
COPY package*.json ./
RUN npm ci --omit=dev

# Generate Prisma client in deps stage
COPY prisma ./prisma
RUN npx prisma generate

# ── Stage 2: Final image ────────────────────────────────────────────────
FROM node:20-alpine AS final
WORKDIR /app

# Copy dependencies and generated Prisma client from Stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy all application code
COPY . .

EXPOSE 3000

# Run database migrations then start the server
# "migrate deploy" applies any pending migrations safely in production
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]