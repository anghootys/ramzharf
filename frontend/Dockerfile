FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 4200

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist/* .

CMD ["node", "server/server.mjs"]
