# Pager2077 Backend Dockerfile
FROM oven/bun:latest

WORKDIR /app

# Install dependencies for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y python3 make g++ wget && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (allow lockfile updates for version compatibility)
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["bun", "run", "start"]
