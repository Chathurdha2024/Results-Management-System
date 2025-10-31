# Use Node.js LTS version (20)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first (for efficient caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose Vite’s default dev port
EXPOSE 5173

# Run the Vite development server and allow external access
CMD ["npm", "run", "dev", "--", "--host"]
