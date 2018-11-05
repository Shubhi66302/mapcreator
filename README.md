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
- Install packages
    - `yarn install`
    - `cd client && yarn install`
- Apply migrations
    - `cd server`
    - `NODE_ENV=production ../node_modules/.bin/sequelize db:migrate`
- Build
    - `npm run build`
- Run
    - `npm start`

Open 192.168.x.x:3001/ for mapcreator

TODO: write dev setup process

# Dev
## Pro tip
- `cd` into client in a new tab and run `npm test`. This will run a watcher that will rerun relevant tests when you make changes to a file. It's helpful to write tests for reducer functions as you can iterate quickly without making up the whole scenario in the browser.
- To iterate fast on a UI component, `cd` into client in a new tab and run `yarn run storybook`. Go to `localhost:9009` to see list of components (see `BarcodeViewPopup` for an example). Stories are defined in `stores/index.js`. Stories reload much faster than hot reload of react. 

# Modifying JSON schemas

- Schema files are present in `client/common/json-schemas` and tests in `client/common/__tests__/json-schemas`
- Change schema .json files and also change `export-map.js` and `import-map.js` so that maps are imported/exported correctly with new fields
- Change map .json files in `client/test-data/test-maps`
- After modifying schema .json files and import-map.js and export-map.js functions, you need to update existing maps in db to reflect the changed schema
- Create a script in `server/map-json-migrations/` which will run over all rows in db and modify the map json (eg. see add-floor-metadata.js)
- To change dev database (use `babel-node` if your script uses es6 syntax, otherwise just use `node`):
    - `babel-node server/map-json-migrations/<yourscript>.js`
- To change prod database:
    - `NODE_ENV=production babel-node server/map-json-migrations/<yourscript>.js`
