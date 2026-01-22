FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy server source
COPY server/*.ts ./
COPY server/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Railway uses PORT env var
ENV PORT=3001

# Start server
CMD ["node", "dist/index.js"]
