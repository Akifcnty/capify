# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /app

# Package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"] 