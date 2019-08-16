NAME		:= mapcreator
TAG			:= $$(echo $${BITBUCKET_COMMIT:-$$(git rev-parse HEAD)} | cut -c1-7)
VERSION			:=  $(shell git describe --dirty)
REPO		:= repo.labs.greyorange.com
BASENAME	:= ${REPO}/${NAME}
IMG			:= ${BASENAME}:${TAG}
STAGING:= ${BASENAME}:staging
# testing is only for phab diffs
REVISION_WITH_D := D${REVISION}
TESTING := ${BASENAME}:${REVISION_WITH_D}
LATEST		:= ${BASENAME}:latest
SERVER_SSH	:= root@mapcreator.labs.greyorange.com

.PHONY: check-uncommitted all

check-uncommitted:
    ifneq ($(shell echo `git status -s`),)
		$(error Please commit files before building.)
    endif

build-no-check:
	docker build -t ${IMG} --build-arg version=${VERSION} .

build: check-uncommitted build-no-check

push:
	docker push ${IMG}

push-as-latest: check-uncommitted
	docker pull ${IMG}
	docker tag ${IMG} ${LATEST}
	docker push ${LATEST}

push-as-staging:
	docker pull ${IMG}
	docker tag ${IMG} ${STAGING}
	docker push ${STAGING}

all: build push push-as-latest

testing:
	docker build -t ${TESTING} \
		--build-arg version="${REVISION_WITH_D}-${VERSION}" \
		--build-arg public_url="http://mapcreator.labs.greyorange.com:5000/${REVISION_WITH_D}/" \
		--build-arg basename="/${REVISION_WITH_D}" \
		--build-arg keep_redux_logger=true .
	docker push ${TESTING}

staging:
	docker build -t ${STAGING} --build-arg version=${VERSION} .
	docker push ${STAGING}

deploy-staging:
	# adding prune to clear up old images
	ssh ${SERVER_SSH} 'cd mapcreator-staging && docker-compose pull web && docker-compose up -d && docker image prune -af'

deploy:
	# adding prune to clear up old images
	ssh ${SERVER_SSH} 'cd mapcreator && docker-compose pull web && docker-compose up -d && docker image prune -af'

login:
# do this before any other command. set env variables for docker login (contact vivek.r@greyorange.sg)
	docker login ${REPO} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}

lint:
	npm run lint-no-fix

test-client:
	cd client && npm install
	cd client && CI=true NODE_PATH=src/ npm test -- --coverage --reporters=default --reporters=jest-junit

test-server:
	npm install
	NODE_ENV=test npm run migrate
	NODE_ENV=test npm run test-server-ci

test: test-client test-server

test-tag:
	echo ${TAG}

test-version:
	echo ${VERSION}

test-testing-tag:
	echo ${TESTING}
