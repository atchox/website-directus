FROM directus/directus:latest AS directus-base

USER root
RUN corepack enable
USER node

FROM node:22-alpine AS prod-deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /music
RUN corepack enable

COPY ./extensions/music/package.json ./extensions/music/pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
COPY ./extensions/music/src ./src
RUN pnpm build

FROM directus-base

COPY --from=prod-deps /music/dist /directus/extensions/music/dist
COPY --from=prod-deps /music/package.json /directus/extensions/music