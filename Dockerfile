
ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

RUN apk add --update alpine-sdk && apk add linux-headers
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

COPY package*.json ./
COPY yarn.lock ./

RUN yarn i

COPY . .

RUN yarn run build

ENV NODE_ENV production
CMD [ "node", "dist/index.js" ]
USER node