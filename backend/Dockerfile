# Backend Node.js Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
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
