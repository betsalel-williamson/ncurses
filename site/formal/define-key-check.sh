#!/bin/sh
# Build define-key-check.c against an installed build of this tree and run it.
# Usage: site/formal/define-key-check.sh PREFIX (see key-check.sh)
exec sh "$(dirname "$0")/key-check.sh" "$1" define-key
