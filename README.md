- Sometimes psql might not work on mac after restart. Running this seems to work:
    - rm /usr/local/var/postgresql@9.4/postmaster.pid
    - brew services restart postgresql@9.4


# Installation (Dev)

- Install `nodejs` and `npm` if not already installed:
    - Install `nvm`: https://github.com/creationix/nvm#usage
    - `nvm install node`
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
    - `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gor;`

- Install packages
    - `npm install`
    - `cd client && npm install`
- Apply migrations
    - cd to root of repository
    - `NODE_ENV=development npm run migrate`
    - `NODE_ENV=test npm run migrate`
- Run server
    - `npm run start-dev`
- Run client dev server
    - `cd client`
    - `npm start`

Open localhost:3000/ for mapcreator dev server. Hot reloading is enabled so editing any js file in `client/` will reload page in browser 

## Testing
- On MacOs, install watchman `brew install watchman`. TODO: linux machine?
- `cd` into client in a new tab and run `npm test`. This will run a watcher that will rerun relevant tests when you make changes to a file. It's helpful to write tests for reducer functions as you can iterate quickly without making up the whole scenario in the browser.
- To iterate fast on a UI component, `cd` into client in a new tab and run `npm run storybook`. Go to `localhost:9009` to see list of components (see `BarcodeViewPopup` for an example). Stories are defined in `stores/index.js`. Stories reload much faster than hot reload of react.
- Tests/linting is automatically done on Phabricator

# Deployment:

- Deployment is done through Dockerfile. There are three deployments on VM:
    - production server on `mapcreator.labs.greyorange.com`
    - staging server on `mapcreator.labs.greyorange.com:3002`
    - testing server(s) on `mapcreator.labs.greyorange.com:5000`

## Recommended workflow
- When a diff is raised, a testing instance will be created automatically (see testing server below). This can be used for manual testing/code review.
- Deployment to staging can be done through phabricator. Go to `https://phab.greyorange.com/harbormaster/plan/10/` and click on "Run Plan Manually". Enter your diff id and run. You can save this URL as a favorite in phabricator so its easy to access. Check staging server to confirm its done
- By default, you don't need to deploy to production manually. Once diff is landed (i.e. pushed to `master`), bitbucket will automatically run tests and then deploy to `mapcreator.labs.greyorange.com`

## Production and Staging Server: Manual Workflow (Not Recommended)

- Both production and staging have separate `docker-compose.yml` in `mapcreator` and `mapcreator-staging` folder at home dir on mapcreator VM.
- To make staging image, run `make staging`. This will build image with `staging` tag and push to repo.
- To make production image, run `make all`. This will build image with `latest` tag and push to repo.
    - Building an image will be slow for the first time or when either `package.json` changes.
- To just make a image with just current commit id as tag, run `make build push`.
- For deploying build to staging, run `make deploy-staging`. Then check staging server if build is running and test it out.
    - It can also be done through bitbucket pipelines . Go to Pipelines in bitbucket repo and click on the pipeline run you want to deploy. This requires you to first push your feature branch to bitbucket.
- To deploy to production, run `make deploy`. Then check production server to see if build is running.

## Testing Server(s)
- A testing nginx server is running on `mapcreator.labs.greyorange.com:5000`. Whenever a diff is created, a `mapcreator-testing` job runs on jenkins that creates a build for the diff and deploys it on the testing server. Eg. if your diff name is `D9999`, then after build completes, jenkins will post a comment on your diff saying `Testing instance is available at http://mapcreator.labs.greyorange.com:5000/D9999`. Go to that URL to access your testing instance. This is useful for code reviews.
- TODO: document how this setup works (nginx, testing docker network, scripts, jobs)
- Right now testing instances need to be manually cleaned up once the code gets landed (otherwise disk gets full after a while). TODO: automate this properly!
    - `ssh root@mapcreator.labs.greyorange.com`
    - `cd testing-instance-provisioner`
    - `REVISION=D9999 make -f Makefile.testing cleanup-testing`

# Modifying JSON schemas

- Schema files are present in `client/common/json-schemas` and tests in `client/common/__tests__/json-schemas`
- Change schema .json files and also change `export-map.js` and `import-map.js` so that maps are imported/exported correctly with new fields
- Change map .json files in `client/test-data/test-maps`
- You need to update existing maps in the db to reflect the changed schemas
    - cd to root of repository
    - Create a migration file: `npm run generate-migration -- --name <name-of-migration>`. eg. `npm run generate-migration -- --name add-type-to-pps` will generate a file `2019xxxx-add-type-to-pps.js` in `server/migrations` folder.
    - Modify the `up()` and `down()` functions respectively to modify database maps (see `20190520142453-special-barcode-zone.js`)
    - To locally modify your own databases with this migration, run:
        - `npm run migrate` for dev db
        - `NODE_ENV=test npm run migrate` for test db
    - To undo the latest migration (eg. for testing during development), run `npm run undo-migrate`. Then running `npm run migrate` will run the migration again.
    - You don't need to manually run the migration script in prod/staging server, it is automatically run during docker deployment
    - Before pushing to master, make sure to push to staging first (see Deployment) and check that databases are modified correctly. It's possible that migrations run correctly on your local machine but crash in docker container (eg. it might timeout/OOM on large number of maps)...

# Adding new sprites
  - Mapcreator uses PixiJS as rendering engine for the actual map
  - To add new images (sprites) see `client/src/sprites/_README`