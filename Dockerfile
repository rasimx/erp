FROM  node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS install
COPY pnpm-lock.yaml  /app/
COPY pnpm-workspace.yaml /app/
COPY package.json  /app/
COPY client/package.json  /app/client/package.json
COPY server/package.json  /app/server/package.json
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM install AS build
COPY . /app
RUN pnpm run -r build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=server --prod /prod

FROM base AS app
COPY --from=build /app/client/dist             /app/client/dist
COPY --from=build /app/metricsplace_common     /app/metricsplace_common
COPY --from=build /prod/node_modules           /app/server/node_modules
COPY --from=build /prod/package.json           /app/server/package.json
COPY --from=build /app/server/dist             /app/server/dist
COPY --from=build /app/server/views            /app/server/views

WORKDIR /app
EXPOSE 3000
EXPOSE 3001
CMD [ "node", "server/dist/main.js" ]
