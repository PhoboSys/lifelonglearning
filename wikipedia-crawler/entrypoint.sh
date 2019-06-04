#!/bin/bash

# allow arguments to be passed to npm
if [[ ${1:0:1} = '-' ]]; then
  EXTRA_ARGS="$@"
  set --
elif [[ ${1} == dev ]]; then
  EXTRA_ARGS="$@"
  set --
fi

# default behaviour is to launch npm
if [[ -z ${1} ]]; then
  # we want to restart crawler in case of any unexpected problems
  echo "Starting scanning..." >&2

  cd /
  exec npm run dev #${EXTRA_ARGS}
else
  exec "$@"
fi

