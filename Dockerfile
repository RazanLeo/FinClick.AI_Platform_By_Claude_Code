# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for canvas and other native modules
RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    pixman-dev \
    giflib-dev \
    libjpeg-turbo-dev \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S finclick -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories with correct permissions
RUN mkdir -p uploads reports charts logs temp && \
    chown -R finclick:nodejs /app

# Set correct permissions
RUN chmod +x scripts/*.js

# Switch to non-root user
USER finclick

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]

# Multi-stage build for smaller production image
FROM node:18-alpine as builder

WORKDIR /app

# Install all dependencies including dev dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Run build processes (if any)
RUN npm run build || echo "No build script found"

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    pixman-dev \
    giflib-dev \
    libjpeg-turbo-dev \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S finclick -u 1001

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=finclick:nodejs /app .

# Create directories
RUN mkdir -p uploads reports charts logs temp && \
    chown -R finclick:nodejs /app

# Switch to non-root user
USER finclick

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]

# Labels for metadata
LABEL maintainer="Razan Ahmed Tawfik <Razan@FinClick.AI>"
LABEL description="FinClick.AI - Revolutionary Financial Analysis Platform"
LABEL version="1.0.0"
LABEL org.opencontainers.image.title="FinClick.AI"
LABEL org.opencontainers.image.description="AI-powered financial analysis platform"
LABEL org.opencontainers.image.source="https://github.com/finclick-ai/platform"
LABEL org.opencontainers.image.licenses="Commercial"