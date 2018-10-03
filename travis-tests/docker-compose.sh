#!/bin/bash -e
# shellcheck disable=SC1090
source "$(dirname "$0")"/../pattern-ci/scripts/resources.sh
main(){
    if ! docker-compose up -d; then
        test_failed "$0"
    elif ! docker-compose ps; then
        test_failed "$0"
    elif ! sleep 1 && curl -X PUT -H 'Content-type: application/json' -d '{"username":"admin","password":"test"}' localhost:5000/api/v1/user/create; then
        test_failed "$0"
    else
        test_passed "$0"
    fi
}
main "$@" 