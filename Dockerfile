FROM node:22.14.0

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY . .

RUN npm install

# Запускаем dev-режим
CMD ["npm", "run", "dev"]