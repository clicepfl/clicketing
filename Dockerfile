FROM node:18-alpine3.18

RUN apk update
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

ENV DIRECTUS_URL=https://clic.epfl.ch/directus
ENV NEXT_PUBLIC_DIRECTUS_URL=https://clic.epfl.ch/directus

# switch to unprivileged user from node base image
RUN chown -R node .
USER node

CMD [ "npm", "start" ]
