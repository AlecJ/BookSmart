FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS build
COPY tsconfig.json ./
COPY schema.sql ./
COPY src ./src
RUN npm run build

# Used by docker-compose: keeps dev dependencies (tsx) for `npm run dev`.
FROM dependencies AS development
COPY tsconfig.json schema.sql ./
COPY src ./src
COPY seeds ./seeds
EXPOSE 8000
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node schema.sql ./
COPY --chown=node:node seeds ./seeds
USER node
EXPOSE 8000
CMD ["node", "dist/server.js"]
