# Use the Bun image
FROM oven/bun:canary-slim

# Set WORKDIR
WORKDIR /app

# Install server side dependencies
COPY ./server/package.json /app
RUN bun install --production

# Copy server side code to WORKDIR
COPY ./server/dist /app/dist
COPY ./server/public /app/public

# Expose app port
EXPOSE 8888

# Define database file path
VOLUME ["/app/data"]

# Auto exec Bun APP
CMD ["bun", "dist/index.js"]