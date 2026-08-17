FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s CMD node dist/health.js || exit 1

CMD ["node", "dist/main.js"]
