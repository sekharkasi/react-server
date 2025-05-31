FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev


# Copy built files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/src ./src

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "build/index.js"]
