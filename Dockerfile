FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

#DEBUG:mostra arquivos
RUN ls -la

RUN npm run build

#DEBUG:verifica dist
RUN ls -la dist

CMD ["node", "dist/main.js"]