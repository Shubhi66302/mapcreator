NAME		:= mapcreator
TAG			:= $$(echo $${BITBUCKET_COMMIT:-$$(git rev-parse HEAD)} | cut -c1-7)
VERSION			:= `git describe --dirty`
REPO		:= repo.labs.greyorange.com
BASENAME	:= ${REPO}/${NAME}
IMG			:= ${BASENAME}:${TAG}
STAGING:= ${BASENAME}:staging
LATEST		:= ${BASENAME}:latest
AWS_CONN	:= root@172.104.160.85

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

staging:
	docker build -t ${STAGING} --build-arg version=${VERSION} .
	docker push ${STAGING}

deploy-staging:
		ssh ${AWS_CONN} 'cd mapcreator-staging && docker-compose pull web && docker-compose up -d'

deploy:
		ssh ${AWS_CONN} 'cd mapcreator && docker-compose pull web && docker-compose up -d'

login:
# do this before any other command. set env variables for docker login (contact vivek.r@greyorange.sg)
	docker login ${REPO} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}

test:
	yarn install --ignore-scripts
	cd client && yarn install && cd ..
	npm run lint-no-fix
	npm run migrate
	npm test
	
test-tag:
	echo ${TAG}

test-version:
	echo ${VERSION}
