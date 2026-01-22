FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Copy server source
COPY server/*.ts ./
COPY server/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port (Railway sets PORT automatically)
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
