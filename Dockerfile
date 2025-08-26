# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev for build)
RUN npm ci --include=dev

# Copy source code
COPY src/ ./src/
COPY tests/ ./tests/

# Build the project
RUN npm run build

# Test stage (optional - can be skipped in production)
FROM node:20-alpine AS tester

WORKDIR /app

# Copy from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/jest.config.cjs ./
COPY --from=builder /app/src/ ./src/
COPY --from=builder /app/tests/ ./tests/
COPY --from=builder /app/dist/ ./dist/

# Run tests
RUN npm test

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --omit=dev && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist/

# Copy essential files
COPY LICENSE ./
COPY README.md ./

# Create non-root user for security
RUN addgroup -g 1001 -S mcpuser && \
    adduser -S mcpuser -u 1001 -G mcpuser

# Create logs directory
RUN mkdir -p /app/logs && chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check: MCP CWP Server')" || exit 1

# Environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# No need to expose ports for MCP server (uses stdio)
# EXPOSE 3030

# Start the application
CMD ["node", "dist/index.js"]