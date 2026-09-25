# Production image for one Vite portal, served by nginx.
# The nginx layer proxies /api to the gateway, so the built bundle needs no
# backend URL baked in. Build from the repository root, e.g.:
#   docker build -f frontend/Dockerfile \
#     --build-arg APP=citizen-portal -t fixmyinfra/citizen-portal .
ARG APP=citizen-portal

FROM node:20-alpine AS builder
WORKDIR /app
ARG APP=citizen-portal
COPY package.json package-lock.json ./
COPY frontend ./frontend
RUN npm ci && npm run build -w frontend/apps/${APP}

FROM nginx:1.27-alpine AS runner
ARG APP=citizen-portal
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/apps/${APP}/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
