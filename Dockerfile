# ================================================================
# STAGE 1: Dependencies
# ================================================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ================================================================
# STAGE 2: Build the application
# ================================================================
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json next.config.js ./
COPY pages/ ./pages/
COPY components/ ./components/
COPY lib/ ./lib/
COPY styles/ ./styles/

RUN npm run build

# ================================================================
# STAGE 3: Production runner (minimal image)
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.js ./

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
