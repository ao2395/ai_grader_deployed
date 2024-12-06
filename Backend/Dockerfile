# Use an official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only package files to leverage Docker caching
COPY package*.json ./

# Install dependencies (use `ci` for stricter installs)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on (documenting it for clarity)
EXPOSE 8080

# Set the command to start the application
CMD ["npm", "start"]
