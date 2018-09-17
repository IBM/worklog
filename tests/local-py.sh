#!/bin/bash -e

# shellcheck disable=SC1090
source "$(dirname "$0")"/../pattern-ci/scripts/resources.sh

main(){
    if ! pip install -r web/requirements.txt; then
        test_failed "$0"
    elif ! python tests.py -v; then
        test_failed "$0"
    else
        test_passed "$0"
    fi
}

main "$@"