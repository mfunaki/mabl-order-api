FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server.js ./
COPY middleware/ ./middleware/
COPY docs/ ./docs/
COPY openapi.yaml ./
COPY openapi_en.yaml ./

EXPOSE 3000

CMD ["node", "server.js"]
