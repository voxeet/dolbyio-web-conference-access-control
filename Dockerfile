FROM node:16-alpine

LABEL org.opencontainers.image.authors="fabien.lavocat@dolby.com"

WORKDIR /usr/src/www

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

CMD [ "node", "server.js", "--port", "8081" ]
