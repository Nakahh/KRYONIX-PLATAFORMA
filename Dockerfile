# Simple single-stage Dockerfile - no build step
FROM node:18-bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tini \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r kryonix && useradd -r -g kryonix kryonix

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --production && npm cache clean --force

# Copy application files directly
COPY server.js ./
COPY public/ ./dist/

# Set ownership
RUN chown -R kryonix:kryonix /app

# Switch to non-root user
USER kryonix

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use tini as init and start server
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
