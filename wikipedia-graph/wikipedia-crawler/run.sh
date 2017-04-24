#!/bin/bash

BUILD_DIR="$( cd "$( dirname ${BASH_SOURCE[0]} )" && pwd )"
DOCKER_ID="mishadev"
DOCKER_NAME="wikipedia-crawler"
DOCKER_CONTAINER="$DOCKER_NAME"
DOCKER_IMAGE="$DOCKER_ID/$DOCKER_NAME"

echo =============================================================
echo run image $DOCKER_IMAGE container name $DOCKER_CONTAINER
echo =============================================================
if [[ ${1} == dev ]]; then
  docker rm -f $DOCKER_CONTAINER

  docker run -it \
     -v "$BUILD_DIR/src:/src" \
    --env-file $BUILD_DIR/secrets.dev \
    --name $DOCKER_CONTAINER \
    $DOCKER_IMAGE dev

else
  sudo docker rm -f $DOCKER_CONTAINER
  sudo docker rmi -f $DOCKER_IMAGE

  sudo docker run -it \
    --env-file $BUILD_DIR/secrets \
    --name $DOCKER_CONTAINER \
    -d $DOCKER_IMAGE
fi

