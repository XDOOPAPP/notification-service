# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install system tools
RUN apk add --no-cache dumb-init curl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3006/api/v1/notifications/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
