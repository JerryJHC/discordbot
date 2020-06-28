FROM node:lts

WORKDIR /usr/src/app

RUN apt-get update || : && apt-get install python -y
RUN apt-get install ffmpeg -y

COPY package*.json ./

RUN npm ci

COPY . .

RUN cp /user/src/app/config.prod.json /usr/src/app/config.json
RUN rm /user/src/app/config.prod.json

CMD [ "node", "index.js" ]