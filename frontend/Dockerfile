FROM node:16.13
WORKDIR /react
COPY . .
RUN corepack enable
RUN yarn install
RUN yarn run build