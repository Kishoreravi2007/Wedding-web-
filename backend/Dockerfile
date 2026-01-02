# Backend Node.js Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Install build tools for native modules (canvas, etc.)
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variable
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
