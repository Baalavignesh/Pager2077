# Pager2077 Backend Dockerfile
FROM oven/bun:1.1-alpine

WORKDIR /app

# Install dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++ sqlite-dev

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["bun", "run", "start"]
