
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app
COPY package*.json ./

RUN apk add --update alpine-sdk && apk add linux-headers
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python


# Install app dependencies
COPY client/package*.json client/
RUN npm run install-client 

COPY server/package*.json server/
RUN npm run install-server


###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM base As development

COPY . .


###################
# BUILD FOR PRODUCTION
###################

FROM base As build

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN npm run deploy

USER node


###################
# PRODUCTION
###################

FROM build As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=base /usr/src/app/node_modules ./node_modules

COPY . .

CMD yarn deploy
