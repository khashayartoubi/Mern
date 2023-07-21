
FROM node:16.13.0-alpine3.14
WORKDIR /
# RUN mkdir
COPY package.json .
RUN npm i -y,npm install
COPY . .
# ENV API_URL = http://example.com
EXPOSE 3500
CMD node app.js


# FROM node:alpine3.16
# COPY . /app
# WORKDIR /app
# CMD node ./app