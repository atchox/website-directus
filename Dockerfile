FROM directus/directus:latest AS directus-base

USER root
RUN corepack enable
USER node

FROM node:22-alpine AS prod-deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM prod-deps AS prod-deps-music

WORKDIR /music
COPY ./extensions/music/package.json ./extensions/music/pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
COPY ./extensions/music/src ./src
RUN pnpm build

FROM prod-deps AS prod-deps-reach

WORKDIR /reach
COPY ./extensions/reach/package.json ./extensions/reach/pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
COPY ./extensions/reach/src ./src
RUN pnpm build

FROM directus-base

COPY --from=prod-deps-music /music/dist /directus/extensions/music/dist
COPY --from=prod-deps-music /music/package.json /directus/extensions/music
COPY --from=prod-deps-reach /reach/dist /directus/extensions/reach/dist
COPY --from=prod-deps-reach /reach/package.json /directus/extensions/reach