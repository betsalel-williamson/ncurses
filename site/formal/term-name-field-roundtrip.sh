#!/bin/sh
# Compile terminfo entries whose name field has each given length, read them back, and report
# whether the name and the capabilities after it survive. The executable check behind
# term-name-field.als.
#
# Usage: site/formal/term-name-field-roundtrip.sh BIN_DIR [LENGTH...]
#   BIN_DIR holds the tic and infocmp to test, such as a build of this tree installed with
#   make install.progs. LENGTH is the name field's length in characters, without its NUL.
set -u
bin=$1; shift
[ $# -gt 0 ] || set -- 128 129 200 400 510 511 512 513 600
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
for n in "$@"; do
  first=t$n
  desc=$(printf "%$(( n - ${#first} - 1 ))s" '' | tr ' ' x)
  printf '%s|%s,\n\tam, cols#80, bel=^G, clear=\\E[H,\n' "$first" "$desc" > "$work/e.src"
  if ! "$bin/tic" -o "$work/db" "$work/e.src" 2> "$work/tic.err"; then
    echo "$n: tic failed: $(cat "$work/tic.err")"; continue
  fi
  if "$bin/infocmp" -A "$work/db" -1 "$first" > "$work/out" 2> "$work/err"; then
    name=$(sed -n 2p "$work/out" | sed 's/,$//')
    caps=$(tail -n +3 "$work/out" | tr -d '\t\n')
    echo "$n: read back a ${#name}-character name; $caps"
  else
    echo "$n: not readable: $(head -n 1 "$work/err")"
  fi
done
