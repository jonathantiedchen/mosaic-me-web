# Frontend Dockerfile for Railway Deployment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy frontend source code
COPY frontend/ .

# Accept backend URL as build argument
ARG VITE_API_URL=https://mosaic-me-web-backend-production.up.railway.app/api/v1

# Inject build-time environment variable for Vite
# This creates .env.production which Vite reads during build
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration from builder stage
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
