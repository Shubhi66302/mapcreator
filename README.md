TODO: write complete readme.

- Sometimes psql might not work on mac after restart. Running this seems to work:
    - rm /usr/local/var/postgresql@9.4/postmaster.pid
    - brew services restart postgresql@9.4


# Installation (Dev)

- Install `nodejs` and `npm` if not already installed:
    - Install `nvm`: https://github.com/creationix/nvm#usage
    - `nvm install node`
- Install `yarn` globally: `npm install yarn --global`
- Create .env files
    - `cp .env.sample.dev .env`
    - `cp client/.env.sample client/.env`
- Make sure `postgres@9.4` is installed and has user `gor` with no password (otherwise customize `.env` file with correct postgres dev and test user/password). Also create databases `mapcreator_react_dev` and `mapcreator_react_test`, and grant all privileges to `gor` to these dbs
    - `createuser -P gor`
    - `createdb mapcreator_react_dev`
    - `createdb mapcreator_react_test`
    - `psql mapcreator_react_dev`
    - `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gor;`
    - `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public to gor;`
    - `psql mapcreator_react_test`
    - `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gor;`
    - `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public to gor;`
NOTE: If you encounter 'sequence relations does not exist' error on creating new map, then use following commands which seem
    to fix the problem:
    - GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gor;

- Install packages
    - `yarn install`
    - `cd client && yarn install`
- Apply migrations
    - `cd server`
    - `NODE_ENV=development ../node_modules/.bin/sequelize db:migrate`
    - `NODE_ENV=test ../node_modules/.bin/sequelize db:migrate`
- Run server
    - `npm run start-dev`
- Run client dev server
    - `cd client`
    - `npm start`

Open 192.168.x.x:3000/ for mapcreator dev server. Hot reloading is enabled so editing any js file in `client/` will reload page in browser 

## Creating pull request for a feature
- For each feature, create a new branch that looks like `feature/some-feature`. Once you are confident with the code do `git push origin feature/some-feature`. This will push the branch to remote where you can create a pull request for it.
- Bitbucket pipelines runs unit tests and linting on each commit, so run tests and linting locally to find any problems. Run `npm run test` for running unit tests, and `npm run lint` for `eslint` which will also try autofix any linting errors. Fix any remaining errors before pushing.


## Pro tip
- `cd` into client in a new tab and run `npm test`. This will run a watcher that will rerun relevant tests when you make changes to a file. It's helpful to write tests for reducer functions as you can iterate quickly without making up the whole scenario in the browser.
- To iterate fast on a UI component, `cd` into client in a new tab and run `yarn run storybook`. Go to `localhost:9009` to see list of components (see `BarcodeViewPopup` for an example). Stories are defined in `stores/index.js`. Stories reload much faster than hot reload of react. 

# Deployment
- Deployment is done through Dockerfile. There are two deployments on VM:
    - staging server on `172.104.160.85:3002`
    - production server on `172.104.160.85:9982`
- Both have separate `docker-compose.yml` in `mapcreator` and `mapcreator-staging` folder at home dir
- To make staging image, run `make staging`. This will build image with `staging` tag and push to repo.
- To make production image, run `make all`. This will build image with `latest` tag and push to repo.
    - Building an image will be slow for the first time or when either `package.json` changes.
- To just make a image with just current commit id as tag, run `make build push`.
- For deploying build to staging, run `make deploy-staging`. Then check staging server if build is running and test it out.
- For deploying to production, run `make deploy`. Then check production server to see if build is runnig.
- Deployment can also be done through bitbucket pipelines. Go to Pipelines in bitbucket repo and click on the pipeline run you want to deploy
    - TODO: how to do this

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
