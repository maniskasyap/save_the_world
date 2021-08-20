FROM node:14-alpine

WORKDIR /usr/src/app/threats

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8082

CMD ["npm", "start"]