# Use a minimal Node.js runtime as the base image
FROM node:20-alpine AS builder

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json ./
COPY yarn.lock ./

# Install the application dependencies
RUN yarn install

# Copy the necessary application files and directories
COPY ./src ./src
COPY tsconfig.json ./

# Build the application
RUN yarn build

# ---- Run Stage ----
FROM node:20-alpine

WORKDIR /app

# Create a non-root user and switch to it
RUN adduser -D appuser
USER appuser

# Copy the necessary files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Run the application
CMD [ "yarn", "start" ]
