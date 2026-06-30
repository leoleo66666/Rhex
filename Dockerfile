# ---- Stage 1: Dependencies ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm fetch --prod
RUN pnpm install --offline --prod --frozen-lockfile

# ---- Stage 2: Builder ----
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm fetch
RUN pnpm install --offline --frozen-lockfile

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js (standalone output)
ENV NODE_ENV=production
RUN pnpm run build

# ---- Stage 3: Runner ----
FROM node:22-alpine AS runner
RUN apk add --no-cache \
    cairo \
    pango \
    pixman \
    libjpeg-turbo \
    giflib \
    librsvg \
    curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy uploads (user-uploaded files)
COPY --from=builder /app/uploads ./uploads

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy scripts (needed for setup/worker)
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy tsx for worker
COPY --from=builder /app/node_modules/.pnpm/tsx@* /tmp/tsx/
RUN cp -r /tmp/tsx/*/node_modules/tsx ./node_modules/.pnpm/tsx 2>/dev/null; \
    mkdir -p ./node_modules/.pnpm/get-tsconfig@* 2>/dev/null; \
    mkdir -p ./node_modules/.pnpm/@esbuild+* 2>/dev/null; \
    true
# tsx is a devDependency but needed for worker; install it
RUN npm install -g tsx

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["web"]
