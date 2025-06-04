# -------- Development/Build Stage --------
    FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

 # Install ALL dependencies (including dev)
    # Dev deps (like typescript) are needed for build
    RUN npm ci
    
    # Copy source code
    COPY . .

    
    # Build TypeScript code
    RUN npx tsc
    
    # -------- Production Stage --------
    FROM node:20-alpine
    
    WORKDIR /app
    
    # Copy package files
    COPY package*.json ./
    
    # Install only production dependencies
    ENV NODE_ENV=production
    RUN npm ci --omit=dev
    
    # Copy built app from builder
    COPY --from=builder /app/build ./build
    
    # Expose port
    EXPOSE 5000
    
    # Start the application
    CMD ["node", "build/index.js"]
