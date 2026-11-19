#!/bin/sh
# Build a key-function check program against an installed build of this tree and run it.
#
# Usage: site/formal/key-check.sh PREFIX [NAME]
#   NAME names NAME-check.c in this directory (define-key by default). If NAME-check.ti exists,
#   its entries are compiled into the same temporary database.
#   PREFIX is where make install.progs install.libs install.includes put the build: it holds
#   bin/ncursesw6-config, include/ and lib/. The xterm entry is compiled from this tree's
#   misc/terminfo.src into a temporary database, so the system's database plays no part.
set -u
prefix=$1
name=${2:-define-key}
here=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
"$prefix/bin/tic" -x -e xterm -o "$work/db" "$here/../../misc/terminfo.src" 2> "$work/tic.err" || { cat "$work/tic.err"; exit 1; }
if [ -f "$here/$name-check.ti" ]; then
  "$prefix/bin/tic" -x -o "$work/db" "$here/$name-check.ti" 2> "$work/tic.err" || { cat "$work/tic.err"; exit 1; }
fi
config=$prefix/bin/ncursesw6-config
cc -o "$work/check" "$here/$name-check.c" $("$config" --cflags) $("$config" --libs) || exit 1
TERMINFO=$work/db "$work/check"
