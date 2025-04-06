# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Use ci for reproducible builds if using package-lock.json
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application for production
# Ensure API URL is configured here if using build-time env vars
# ARG REACT_APP_API_URL=/api
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default Nginx server configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the built static files from the 'builder' stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
# 'daemon off;' keeps Nginx running in the foreground, essential for Docker
CMD ["nginx", "-g", "daemon off;"]