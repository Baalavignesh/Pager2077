# Pager2077 Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++ sqlite-dev

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["npm", "run", "start"]
