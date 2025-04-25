FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared ./shared/

# Install dependencies
RUN npm --prefix client install
RUN npm --prefix server install

# Copy all files
COPY . .

# Build client and server
RUN npm --prefix client run build --config ../vite.config.deploy.ts
RUN npm --prefix server run build

# Start production stage
FROM node:20-alpine as production

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/

# Install production dependencies only
RUN cd server && npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/dist/server.prod.js"]