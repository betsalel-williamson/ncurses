#!/bin/sh
# Stitch the sharded man page sources in docs/man into man/, the way soelim does:
# each ".so file" line is replaced by that file, read relative to docs/man.
# The output is committed; check it with: docs/man/stitch.sh && git diff --exit-code man/
set -eu
src=$(cd "$(dirname "$0")" && pwd)
dest=${1:-"$src/../../man"}
for page in "$src"/*.[1-9]*; do
	case "$page" in *.sh) continue ;; esac
	awk -v dir="$src" '
		function include(path,   line) {
			while ((getline line < path) > 0) {
				if (line ~ /^\.so[ \t]/) { sub(/^\.so[ \t]+/, "", line); include(dir "/" line) }
				else print line
			}
			close(path)
		}
		/^\.so[ \t]/ { f = $0; sub(/^\.so[ \t]+/, "", f); include(dir "/" f); next }
		{ print }
	' "$page" > "$dest/$(basename "$page")"
done
