FROM node:20-alpine

# Install CA certificates to enable SSL/TLS connections (needed for MongoDB Atlas)
RUN apk add --no-cache ca-certificates

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production and development dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose server port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]
