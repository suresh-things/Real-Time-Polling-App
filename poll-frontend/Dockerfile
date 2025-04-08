# Stage 1: Build the React application
FROM node:18-alpine AS builder
# ... (rest of builder stage remains the same) ...
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:stable-alpine

# --- Add OS Package Update ---
# Update package lists, upgrade installed packages, and clean up cache
RUN apk update && \
    apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*
# --- End OS Package Update ---

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default Nginx server configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the built static files from the 'builder' stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]