#!/bin/sh
# Build define-key-check.c against an installed build of this tree and run it.
#
# Usage: site/formal/define-key-check.sh PREFIX
#   PREFIX is where make install.progs install.libs install.includes put the build: it holds
#   bin/ncursesw6-config, include/ and lib/. The xterm entry is compiled from this tree's
#   misc/terminfo.src into a temporary database, so the system's database plays no part.
set -u
prefix=$1
here=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
"$prefix/bin/tic" -x -e xterm -o "$work/db" "$here/../../misc/terminfo.src" 2> "$work/tic.err" || { cat "$work/tic.err"; exit 1; }
config=$prefix/bin/ncursesw6-config
cc -o "$work/check" "$here/define-key-check.c" $("$config" --cflags) $("$config" --libs) || exit 1
TERMINFO=$work/db "$work/check"
