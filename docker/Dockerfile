# ---- Build stage ----
FROM node:20-alpine AS builder
ARG APP_NAME
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json nest-cli.json ./
RUN npm install --no-audit --no-fund

COPY apps ./apps
COPY libs ./libs

RUN npm run build ${APP_NAME}

# ---- Runtime stage ----
FROM node:20-alpine AS runner
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
WORKDIR /app

# Runtime tsconfig lets `tsconfig-paths/register` resolve the @app/shared alias
# against the compiled lib under dist/.
ENV TS_NODE_PROJECT=/app/tsconfig.runtime.json

COPY package*.json ./
COPY tsconfig.runtime.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist

# APP_NAME is baked in so the same image definition serves every service.
CMD ["sh", "-c", "node -r tsconfig-paths/register dist/apps/${APP_NAME}/src/main"]
