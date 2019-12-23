# CI Setup
Theres a lot of jobs/Makefiles/Dockerfiles etc. that have been created for mapcreator so listing them all here:

## Docker
- The `Dockerfile` lists instruction to create an image for mapcreator to run. In summary, it runs `npm run build` on the client, copies the built files into the `server` folder, runs babel to transpile server code, and then starts a node instance for the server using `node index.js`
- The `docker-compose.yml` file specifies containers that need to be run for a single mapcreator instance in production or staging. Currently a postgres container (called db) is only necessary apart from the mapcreator container (called web). The web container exposes mapcreator on port 5000; the postgres container is not exposed externally.
- The `docker-compose.testing.yml.template` file is used for setting up a testing instance for every diff that is created for mapcreator. See "Testing Instance Provisioning" section for how it is used.

## Bitbucket
A `bitbucket-pipelines.yml` file is present to run pipeline jobs in bitbucket. Whenever a commit is pushed to `master`, the `master` branch job specified in the pipeline is run, which runs tests, builds and pushes a docker image, and deploys the image on the production server on the AWS VM. These jobs can be viewed on this page and rerun if required: https://bitbucket.org/gorcode/mapcreator-react/addon/pipelines/home#!/. The staging job can be manually run through the bitbucket pipelines interface as well if required (TODO: how?).

## Phabricator Build Plans and Rules

### Build Plans
There are 3 phabricator build plans that are currently in use (another 4th one is present which should be maintained, see further in testing section). You can manage them here https://phab.greyorange.com/harbormaster/plan/

1. mapcreator-unit: for running unit tests on jenkins
2. mapcreator-testing: for running test instance creating job on jenkins
3. mapcreator-staging: for running staging instance creating job on jenkins

A fourth `mapcreator-testing-cleanup` job is present to cleanup the testing instances (described later) but doesn't work as expected right now.

### Herald Rules
Herald rules decide when a particular build plan is to be run (eg. every time a diff is updated, run `mapcreator-unit` and `mapcreator-testing`; every time a diff is landed run `mapcreator-testing-cleanup`)
Theres 2 working rules right now: 
- Run tests: https://phab.greyorange.com/H10
- Deploy testing instance: https://phab.greyorange.com/H11

Theres rules for testing cleanup also defined but those rules unfortunately don't work :(
To manage build plans/rules you might need more permissions, contact Srijan/whoever provides Phabricator permissions.

## Jenkins Jobs
Corresponding to the phabricator jobs, there's jenkins jobs that are triggered by phabricator jobs
1. mapcreator-unit: http://jenkins.greyorange.com/job/mapcreator-unit/ You can actually view coverage and console logs if tests failed
2. mapcreator-testing: http://jenkins.greyorange.com/job/mapcreator-testing/
3. mapcreator-testing-cleanup: http://jenkins.greyorange.com/job/mapcreator-testing-cleanup/ You'll see that this job is actually running for every landed diff; however the diff ID is not present in the job environment so it actually does nothing

## Testing Instance Provisioning

### Testing Server(s)
- A testing nginx server is running on `mapcreator.labs.greyorange.com:5000`. Whenever a diff is created, a `mapcreator-testing` job runs on jenkins that creates a build for the diff and deploys it on the testing server. Eg. if your diff name is `D9999`, then after a while, jenkins will post a comment on your diff saying `Testing instance is available at http://mapcreator.labs.greyorange.com:5000/D9999`. Go to that URL to access your testing instance. This is useful for code reviews.

### Setup
This is done using docker compose, docker networks and nginx. Files are kept in the folder `testing-instance-provisioner`.
- On the VM a docker network has been created called `testing_instance_net`.
- An `nginx` instance connected to `testing_instace_net` is running and is exposed on port 5000 of the VM. Config file for this is present in source code as `nginx.conf.testing` (just for tracking) and on server at `testing-instance-provisioner/nginx.conf`
- A `Makefile.testing` and `docker-compose.testing.yml.template` are also present in source code (for tracking) and in this folder.
- This makefile is used by the jenkins job(s) for setting up and cleaning up testing instances
- **Since testing-cleanup job is not automated correctly, you'll need to manually clean up old diffs or the VM might run out of space!**
  - This can be done by
    1. `ssh root@mapcreator.labs.greyorange.com`
    2. `cd testing-instance-provisioner`
    3. `REVISION=D1234 make -f Makefile.testing cleanup-testing` (replace D1234 with your actual diff id)
  - TODO: fix the cleanup job please

Behind the scenes, the `mapcreator-testing` jenkins job creates a new image for each diff tagged with that diff id. (eg. repo.labs.greyorange.com/mapcreator:D6571 for diff D6571).
If you run `REVISION=D1234 make -f Makefile.testing deploy-testing` in the `testing-instance-provisioner` folder in the VM (you don't need to, its done by jenkins), a new folder `D1234` is created in `testing-instance-provisioner` with its own docker-compose.yml and .env, just like the mapcreator production and staging folder. `docker-compose up` is also run which creates new containers (web + db) for this diff and assigns docker network aliases to the web image. These aliases are then resolved by the nginx container (see nginx.conf) whenever a request comes to the nginx server with the diff id (i.e. `http://mapcreator.labs.greyorange.com:5000/D9999` resolves to the mapcreator container running repo.labs.greyorange.com/mapcreator:D9999 if it exists otherwise 502)
