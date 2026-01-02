# Backend Node.js Dockerfile
FROM node:20-slim

WORKDIR /app

# Install system dependencies for native modules (canvas)
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (ensure production deps only)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variable
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
