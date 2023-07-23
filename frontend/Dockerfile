# Use the official Node.js image as the base image
FROM node:18.17.0

# Set the working directory
WORKDIR /app

# Install Node.js dependencies
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install

# Copy the Next.js app source code
COPY .. /app/

# Expose the Next.js app port
EXPOSE 3000

CMD ["yarn", "dev"]
