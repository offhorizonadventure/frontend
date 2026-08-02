# syntax=docker/dockerfile:1

# Multi-stage build. Only the last stage ships, so the source, the package
# manager and the full node_modules tree never reach the running container.

# ---------------------------------------------------------------------------
# 1. Dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable

# Copied on their own so this layer is cached until the lockfile changes —
# editing a component doesn't reinstall every package.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# The cache mount keeps pnpm's store between builds. It lives outside the
# image, so repeat builds go from minutes to seconds without adding a layer.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm config set store-dir /pnpm-store \
    && pnpm install --frozen-lockfile --prefer-offline

# ---------------------------------------------------------------------------
# 2. Build
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, not
# read at startup, so they have to be present now. They are public by
# definition — the anon key and the Razorpay key id are visible in the browser
# on any Supabase or Razorpay site.
#
# Secrets (RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
# SUPABASE_SERVICE_ROLE_KEY) are deliberately NOT build args: a build arg is
# recorded in the image history and would be readable by anyone who pulls it.
# Those are passed at runtime instead.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Turbopack's cache also survives between builds via a cache mount.
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm build

# ---------------------------------------------------------------------------
# 3. Runtime
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user: a container escape then lands on an unprivileged
# account rather than root on the host.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# The standalone output already contains the trimmed node_modules and a
# server.js entrypoint. Static assets sit outside it and are copied separately.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Lets Docker restart the container if the app wedges rather than leaving it
# up but not serving.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
