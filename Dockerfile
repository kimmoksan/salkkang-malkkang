# 살깡말깡 단일 서비스 이미지: 웹을 빌드해 FastAPI가 같은 주소에서 함께 제공한다.
FROM node:22-slim AS web
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:0.13.6 /uv /usr/local/bin/uv
WORKDIR /app/backend
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --locked --no-dev --no-install-project
COPY backend/app ./app
COPY docs/catalog /app/docs/catalog
COPY --from=web /app/frontend/dist /app/frontend/dist
# 키는 이미지에 넣지 않는다. Render 환경변수로만 받는다.
ENV SERVE_FRONTEND=1 HOST=0.0.0.0 PYTHONUNBUFFERED=1
CMD ["uv", "run", "--no-sync", "python", "-m", "app.serve"]
