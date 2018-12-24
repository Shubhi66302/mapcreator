NAME		:= mapcreator
TAG			:= $$(echo $${BITBUCKET_COMMIT:-$$(git rev-parse HEAD)} | cut -c1-7)
REPO		:= repo.labs.greyorange.com
BASENAME	:= ${REPO}/${NAME}
IMG			:= ${BASENAME}:${TAG}
EXPERIMENTAL:= ${BASENAME}:experimental
LATEST		:= ${BASENAME}:latest
AWS_CONN	:= root@172.104.160.85

.PHONY: check-uncommitted all

check-uncommitted:
    ifneq ($(shell echo `git status -s`),)
		$(error Please commit files before building.)
    endif

build-no-check:
	docker build -t ${IMG} .

build: check-uncommitted build-no-check

push:
	docker push ${IMG}

push-as-latest: check-uncommitted
	docker pull ${IMG}
	docker tag ${IMG} ${LATEST}
	docker push ${LATEST}

all: build push push-as-latest

experimental:
	docker build -t ${EXPERIMENTAL} .
	docker push ${EXPERIMENTAL}

deploy-staging: experimental
		ssh ${AWS_CONN} 'cd mapcreator-staging && docker-compose pull web && docker-compose up -d'

deploy: all
		ssh ${AWS_CONN} 'cd mapcreator && docker-compose pull web && docker-compose up -d'

login:
# do this before any other command. set env variables for docker login (contact vivek.r@greyorange.sg)
	docker login ${REPO} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}

test-tag:
	echo ${TAG}
