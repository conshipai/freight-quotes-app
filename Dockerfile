FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Accept build arguments from Coolify
ARG REACT_APP_API_URL
ARG NODE_ENV=production

# Export them as environment variables for the webpack build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV

# Build the app - webpack will inject the env vars
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
