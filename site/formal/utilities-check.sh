#!/bin/sh
# Run tput, clear and tabs from a build of this tree against the claims in their manual pages,
# and print each command with its exit status and output. The executable check behind the
# errata rows for tput(1), clear(1) and tabs(1).
#
# Usage: site/formal/utilities-check.sh BIN_DIR
#   BIN_DIR holds the tic, tput, clear and tabs to test, such as a build of this tree installed
#   with make install.progs. The script compiles the entries it needs from this tree's
#   misc/terminfo.src into a temporary database, so the system's database plays no part.
#   It needs setsid (util-linux) and a date that knows %N (GNU coreutils).
set -u
bin=$1
src=$(cd "$(dirname "$0")/../.." && pwd)/misc/terminfo.src
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# padtest pads clear by 20 ms for each line it affects, mandatorily (the /) and by sleeping
# rather than sending pad characters (npc), so the screen size clear uses shows as time.
printf 'padtest|clear padding test,\n\tnpc, cols#80, lines#5, clear=\\E[H\\E[J$<20*/>,\n' > "$work/pad.src"
"$bin/tic" -x -e xterm,dumb,ansi+tabs -o "$work/db" "$src" 2> "$work/tic.err" || { cat "$work/tic.err"; exit 1; }
"$bin/tic" -o "$work/db" "$work/pad.src"
TERMINFO=$work/db
export TERMINFO
unset LINES COLUMNS

# show LABEL CMD...: run CMD with stdin from /dev/null, print its exit status, then its standard
# output with sed's l command (escapes shown, $ at each line end) and its standard error.
show() {
  label=$1; shift
  "$@" < /dev/null > "$work/out" 2> "$work/err"
  echo "== $label: exit $?"
  sed -n l "$work/out"
  sed -e "s#$bin/##" -e 's/^/stderr: /' "$work/err"
}

# feed LABEL INPUT CMD...: the same, with INPUT on standard input.
feed() {
  label=$1; input=$2; shift 2
  printf '%s' "$input" | "$@" > "$work/out" 2> "$work/err"
  echo "== $label: exit $?"
  sed -n l "$work/out"
  sed -e "s#$bin/##" -e 's/^/stderr: /' "$work/err"
}

echo "# tput, one operand"
show "tput -T xterm am (Boolean, present)" "$bin/tput" -T xterm am
show "tput -T xterm hz (Boolean, absent)" "$bin/tput" -T xterm hz
show "tput -T xterm cols (numeric, present)" "$bin/tput" -T xterm cols
show "tput -T dumb lines (numeric, absent)" "$bin/tput" -T dumb lines
show "tput -T xterm bold (string, present)" "$bin/tput" -T xterm bold
show "tput -T dumb bold (string, absent)" "$bin/tput" -T dumb bold
show "tput -T xterm nosuchcap (unrecognized capability)" "$bin/tput" -T xterm nosuchcap
show "tput -T nosuchterm bold (unrecognized terminal type)" "$bin/tput" -T nosuchterm bold
show "tput -T xterm (no operand)" "$bin/tput" -T xterm
show "tput bold, TERM unset (no terminal type)" env -u TERM "$bin/tput" bold
show "tput -Z (unknown option)" "$bin/tput" -Z
show "tput -T dumb clear (clear operand, no clear capability)" "$bin/tput" -T dumb clear
show "tput -T xterm init, no terminal to open (system error)" setsid -w "$bin/tput" -T xterm init

echo
echo "# tput, several operands on the command line"
show "tput -T xterm cols lines" "$bin/tput" -T xterm cols lines
show "tput -T xterm hz cols (stops at hz)" "$bin/tput" -T xterm hz cols
show "tput -T xterm bold hz cols (stops at hz)" "$bin/tput" -T xterm bold hz cols

echo
echo "# tput -S"
feed "tput -T xterm -S <<< 'bold'" 'bold
' "$bin/tput" -T xterm -S
feed "tput -T xterm -S <<< 'hz'" 'hz
' "$bin/tput" -T xterm -S
feed "tput -T xterm -S <<< 'hz' 'hz'" 'hz
hz
' "$bin/tput" -T xterm -S
feed "tput -T xterm -S <<< 'hz hz hz'" 'hz hz hz
' "$bin/tput" -T xterm -S
feed "tput -T xterm -S <<< 'hz' 'bold'" 'hz
bold
' "$bin/tput" -T xterm -S
feed "tput -T dumb -S <<< 'lines'" 'lines
' "$bin/tput" -T dumb -S
feed "tput -T xterm -S <<< 'nosuchcap' 'bold'" 'nosuchcap
bold
' "$bin/tput" -T xterm -S
feed "tput -T xterm -S <<< 'bold' 'nosuchcap' 'cols'" 'bold
nosuchcap
cols
' "$bin/tput" -T xterm -S
feed "tput -T xterm -S <<< 'cols lines'" 'cols lines
' "$bin/tput" -T xterm -S
feed "tput -T xterm -S <<< 'cup 1 2 bold'" 'cup 1 2 bold
' "$bin/tput" -T xterm -S

echo
echo "# clear"
show "clear -T xterm" "$bin/clear" -T xterm
show "clear -T xterm -x" "$bin/clear" -T xterm -x
show "clear -T dumb (no clear capability)" "$bin/clear" -T dumb
# ms LABEL CMD...: run CMD and print how long it took, to the nearest 100 ms.
ms() {
  label=$1; shift
  t0=$(date +%s%N)
  "$@" < /dev/null > /dev/null 2>&1
  t1=$(date +%s%N)
  echo "== $label: about $(( (t1 - t0 + 50000000) / 100000000 * 100 )) ms"
}
ms "TERM=padtest LINES=50 clear (20 ms x 50 lines from LINES)" env TERM=padtest LINES=50 "$bin/clear"
ms "LINES=50 clear -T padtest (20 ms x 5 lines from lines#5)" env LINES=50 "$bin/clear" -T padtest

echo
echo "# tabs"
show "tabs -8, TERM unset" env -u TERM "$bin/tabs" -8
show "tabs -T ansi+tabs -8" "$bin/tabs" -T ansi+tabs -8
show "tabs -T dumb -8 (no clear_all_tabs)" "$bin/tabs" -T dumb -8
show "COLUMNS=40 tabs -T xterm -n -d -5" env COLUMNS=40 "$bin/tabs" -T xterm -n -d -5
show "COLUMNS=40 tabs -T xterm -n -d 1 6 11" env COLUMNS=40 "$bin/tabs" -T xterm -n -d 1 6 11
show "COLUMNS=40 tabs -T xterm -n -d 1,+5,+5" env COLUMNS=40 "$bin/tabs" -T xterm -n -d 1,+5,+5
show "COLUMNS=40 tabs -T xterm -n -d -0" env COLUMNS=40 "$bin/tabs" -T xterm -n -d -0
show "COLUMNS=40 tabs -T xterm -n -d 5,1,9 (out of order)" env COLUMNS=40 "$bin/tabs" -T xterm -n -d 5,1,9
show "COLUMNS=40 tabs -T xterm -n -d 1,5,3 (last stop out of order)" env COLUMNS=40 "$bin/tabs" -T xterm -n -d 1,5,3
show "COLUMNS=40 tabs -T xterm -n -d 1,5,5 (last stop repeated)" env COLUMNS=40 "$bin/tabs" -T xterm -n -d 1,5,5
