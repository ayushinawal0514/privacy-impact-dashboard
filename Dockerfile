# Use Node 22
FROM node:22-alpine

# Create working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Build Next.js project
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]