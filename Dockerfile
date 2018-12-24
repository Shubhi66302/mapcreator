FROM node:9.11.1-alpine
RUN apk update && apk add bash
# client
WORKDIR /app/client
COPY client/package.json client/yarn.lock ./
RUN yarn install
COPY client/ .
ENV NODE_PATH ./src/
ENV NODE_ENV production
RUN npm run build


# server
FROM node:9.11.1-alpine
RUN apk update && apk add bash
WORKDIR /app
ENV PORT 3001
ENV DATABASE_URL postgres://gor:apj0702@db:5432/mapcreator
COPY package.json yarn.lock .babelrc ./
# need node env development for install since for some reason babel is in dev dependencies...
ENV NODE_ENV development
RUN yarn install
ENV NODE_ENV production

# babel stuff
COPY --from=0 /app/client/build/ dist/client/build/
COPY --from=0 /app/client/src/common/ client/src/common/
COPY server/ ./server/
RUN npm run build
COPY entrypoint.sh wait-for-it.sh ./ 
RUN chmod +x entrypoint.sh
RUN chmod +x wait-for-it.sh
ENTRYPOINT ["./entrypoint.sh"]