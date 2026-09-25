# Production image for the API gateway and every backend Express service.
# Build from the repository root so npm workspaces (backend/shared-lib)
# resolve, e.g.:
#   docker build -f backend/Dockerfile \
#     --build-arg SERVICE_DIR=backend/services/complaint-service \
#     --build-arg SERVICE_PORT=4002 -t fixmyinfra/complaint-service .
ARG SERVICE_DIR=backend/api-gateway
ARG SERVICE_PORT=4000

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend ./backend
COPY frontend/packages ./frontend/packages
# Workspace manifests only (no sources): npm ci requires every workspace
# directory declared in the root package.json to exist.
COPY frontend/apps/citizen-portal/package.json ./frontend/apps/citizen-portal/
COPY frontend/apps/department-portal/package.json ./frontend/apps/department-portal/
COPY frontend/apps/admin-dashboard/package.json ./frontend/apps/admin-dashboard/
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY --from=deps /app/backend ./backend
COPY --from=deps /app/frontend/packages ./frontend/packages
ARG SERVICE_DIR=backend/api-gateway
ARG SERVICE_PORT=4000
EXPOSE ${SERVICE_PORT}
ENV PORT=${SERVICE_PORT}
WORKDIR /app/${SERVICE_DIR}
CMD ["node", "src/index.js"]
