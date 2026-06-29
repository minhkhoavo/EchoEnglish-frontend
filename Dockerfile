# Stage 1: Build environment
FROM node:22-alpine AS builder
WORKDIR /app

# Leverage caching by copying package manifests first
COPY package.json package-lock.json ./

# Install dependencies deterministically
RUN npm ci --ignore-scripts

# Copy source code and build the application
COPY . .
RUN npm run build

# Stage 2: Production environment
FROM nginx:1.27-alpine

# Set up a secure, non-root user for Nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx

USER nginx

# Copy static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]