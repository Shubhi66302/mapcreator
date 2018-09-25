TODO: write complete readme.

- Sometimes psql might not work on mac after restart. Running this seems to work:
    - rm /usr/local/var/postgresql@9.4/postmaster.pid
    - brew services restart postgresql@9.4


# Installation (Prod)

- Install `nodejs` and `npm` if not already installed:
    - Install `nvm`: https://github.com/creationix/nvm#usage
    - `nvm install node`
- Install `yarn` globally: `npm install yarn --global`
- Create .env files
    - `cp .env.sample.prod .env`
    - `cp client/.env.sample client/.env`
- Make sure `postgres@9.4` is installed and has user `mapcreator_user` with password `apj0702`. Also db `mapcreator_react` and `mapcreator_user` should have full read/write access to this db.
    - TODO: instructions on how to this.
- Apply migrations
    - `cd server`
    - `NODE_ENV=production ../node_modules/.bin/sequelize db:migrate`
- Install packages
    - `yarn install`
- Build
    - `npm run build`
- Run
    - `npm start`

Open 192.168.x.x:3001/ for mapcreator

TODO: write dev setup process

