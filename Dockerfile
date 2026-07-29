# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm via corepack
RUN corepack enable pnpm

# Copy package files and install all dependencies (including dev)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Run type check (Ensure codebase is healthy)
RUN pnpm run check

# Build frontend and backend
RUN pnpm run build

# Remove all modules and reinstall ONLY production dependencies
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile

# Additionally, install drizzle-kit so we can run migrations on startup
RUN pnpm add drizzle-kit


# ==========================================
# Stage 2: Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules (production only + drizzle-kit)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy built application assets
COPY --from=builder /app/dist ./dist

# Copy Drizzle schema and config for runtime migrations
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Create startup script: Runs migrations, then starts the Node server
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Running Database Migrations..."' >> /app/start.sh && \
    echo 'npx drizzle-kit push' >> /app/start.sh && \
    echo 'echo "Starting Application..."' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose the internal backend port
EXPOSE 3000

# Start command
CMD ["/app/start.sh"]
