FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy all project files
COPY . .

# Use build argument with a default value
ARG REACT_APP_API_URL=https://api.gcc.conship.ai/api
ARG NODE_ENV=production

# Set as environment variable for the build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV

# Ensure bootstrap.js exists
RUN if [ ! -f src/bootstrap.js ]; then echo "import('./index');" > src/bootstrap.js; fi

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
