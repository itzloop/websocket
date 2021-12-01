FROM node:16-alpine3.12 AS ts-compiler
WORKDIR /usr/app
COPY package*.json tsconfig*.json yarn.lock ./src ./
RUN yarn install
RUN yarn build

FROM node:16-alpine3.12 AS ts-remover
WORKDIR /usr/app
COPY --from=ts-compiler /usr/app/package*.json ./
COPY yarn.lock ./
COPY --from=ts-compiler /usr/app/build ./
RUN yarn install --production

FROM node:16-alpine3.12
WORKDIR /usr/app
COPY --from=ts-remover /usr/app ./
COPY ./public ./public
USER 1000
CMD ["app.js"]
