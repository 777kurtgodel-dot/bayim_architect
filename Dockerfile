# Образ сайта «Байым»: Next.js (standalone) + Payload CMS. Собирается без доступа к базе данных.

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Зависимости
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# 2. Сборка
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Рабочий образ
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Картинки для кнопки «Загрузить демо-контент» в админке
COPY --from=builder /app/src/seed/images ./src/seed/images

# Загруженные файлы: медиатека и вложения заявок (подключаются как тома)
RUN mkdir -p media private/lead-files .next/cache \
  && chown -R nextjs:nodejs media private .next/cache

USER nextjs
EXPOSE 3000
VOLUME ["/app/media", "/app/private"]

# При старте Payload сам применяет новые миграции базы данных (src/migrations)
CMD ["node", "server.js"]
