#!/bin/bash

POSTFIX=""
if [[ ${1} == dev ]]; then
    POSTFIX=".dev"
fi

BUILD_DIR="$( cd "$( dirname ${BASH_SOURCE[0]} )" && pwd )"
DOCKER_ID="mishadev"
DOCKER_NAME="wikipedia-crawler"
DOCKERFILE="Dockerfile"$POSTFIX
DOCKER_CONTAINER="$DOCKER_NAME"
DOCKER_IMAGE="$DOCKER_ID/$DOCKER_NAME"

docker rm -f $DOCKER_CONTAINER
docker rmi -f $DOCKER_IMAGE
echo =============================================================
echo build image $DOCKER_IMAGE form file ${BUILD_DIR}/${DOCKERFILE}
echo =============================================================
docker build -t $DOCKER_IMAGE --file="${DOCKERFILE}" $BUILD_DIR
if [[ ${1} != dev ]]; then
  echo =============================================================
  echo pusing image $DOCKER_IMAGE
  echo =============================================================
  sudo docker push $DOCKER_IMAGE
fi
