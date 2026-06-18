# ---- Build stage ----
FROM node:20-alpine AS builder
ARG APP_NAME
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json nest-cli.json ./
RUN npm install

COPY apps ./apps
COPY libs ./libs

RUN npm run build ${APP_NAME}

# ---- Runtime stage ----
FROM node:20-alpine AS runner
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# APP_NAME is baked in so the same image definition serves every service.
CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main"]
