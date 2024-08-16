# Use the official Node.js image
FROM node:lts-alpine3.20

# Set WORKDIR
WORKDIR /app

# Install server side dependencies
COPY ./server/package.json /app
RUN npm i --omit=dev

# Copy server side code to WORKDIR
COPY ./server/dist /app/dist
COPY ./server/public /app/public

# Expose app port
EXPOSE 8888

# Define database file path
VOLUME ["/app/data"]

# Auto exec Node.js APP
CMD ["node", "dist/index.js"]