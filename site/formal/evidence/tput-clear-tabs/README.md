# Evidence: tput(1), clear(1) and tabs(1)

The raw output of `../../utilities-check.sh`, run on 2026-11-18 with tic, tput, clear and tabs built
from this tree. `environment.txt` gives the versions and the source commit.

- `utilities-check.txt`: each command, its exit status, its standard output as `sed -n l` prints it
  (escapes shown, `$` at each line end), and its standard error.

What it shows, with the code behind each result:

| Claim | Result | Code |
| --- | --- | --- |
| tput: an absent numeric capability gives status 1 | False: status 0, and `-1` is written | `progs/tput.c:141-143`, `:213-215` |
| tput: an absent string capability gives status 0 or 1 | 1 | `progs/tput.c:144-146`, `:389` |
| tput: `clear` with no clear capability | status 2 | `progs/tput.c:210` |
| tput: several operands | stops at the first status that is not 0 | `progs/tput.c:466-478` |
| tput -S: status 4 means some operands not interpreted | False: each failed operand adds 1 to 4 (5, 6, 7); 4 means an unrecognized capability, which exits at once | `progs/tput.c:240`, `:505-512`; `progs/progs.priv.h:96-99` |
| tput -S: one cap-code per line | False: `hz hz hz` on one line gives 7, and `cup 1 2 bold` writes both | `progs/tput.c:481-516` |
| tput: system error is 4 + errno | True: `init` with no terminal gives 10 (ENXIO is 6) | `progs/tty_settings.c:46-53` |
| clear writes clear, then E3 unless `-x` | True | `progs/clear_cmd.c:56-63` |
| clear -T ignores LINES and COLUMNS | True: padding scales with 50 lines from LINES without `-T`, with 5 lines from the entry with it | `progs/clear.c:82-86`; `ncurses/tinfo/lib_setup.c:515-588` |
| tabs uses ansi+tabs when TERM is unset | True: same output as `-T ansi+tabs` | `progs/tabs.c:496-497` |
| tabs: the list must be increasing | Not enforced for the last stop, and a rejected list still exits 0 | `progs/tabs.c:143-152`, `:176-178`, `:710`; see issue #83 |
