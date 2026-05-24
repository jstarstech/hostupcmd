FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache iputils

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY README.md LICENSE config.json.example ./

USER node

CMD ["node", "src/app.js"]
