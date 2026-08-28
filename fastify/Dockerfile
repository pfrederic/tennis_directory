# --- build stage: type-check as a build gate (tsc's output isn't shipped —
# `@/*` path aliases in tsconfig.json aren't rewritten by tsc, so the compiled
# JS can't resolve them under plain `node`; the app runs via `tsx` at runtime
# instead, same as in dev, which does resolve them) ---
FROM node:22-alpine AS build
WORKDIR /app

# build-base/python3 cover native addon compilation some deps may trigger on alpine
RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# --- runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV ENV=production

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY tsconfig.json ./
COPY .config ./.config
COPY src ./src

EXPOSE 3000

CMD ["yarn", "start:prod"]
