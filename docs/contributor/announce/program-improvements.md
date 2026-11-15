# Program improvements

## Utilities

Several improvements were made to the utility programs.

[infocmp](https://invisible-island.net/ncurses/man/infocmp.1m.html)  
- improved `infocmp` `-E`/`-e` fallback feature

  - prefix names with “`ti_`” if they begin with a digit, e.g., 9term
  - escape backslashes and double-quotes in description fields

- modified `infocmp` `-E`/`-e` fallback feature to reduce stricter compiler warnings for the extended capability data.

- modified `infocmp` and `tabs` to use actual name in usage and header.

- improved error-message from `infocmp` when a terminal entry cannot be opened

[tic](https://invisible-island.net/ncurses/man/tic.1m.html)  
- increased limit on use-clauses from 32 to 40, warn but allow entries which exceed the old limit.

- added check for infinite loop in `tic`'s use-resolution.

- added a buffer-limit check in `postprocess_termcap`

[tput](https://invisible-island.net/ncurses/man/tput.1.html)  
- Warn about capabilities which expect parameters where none are given. Also, repair the feature where multiple capabilities can be handled on a single line.

## Examples

Along with the library and utilities, improvements were made to the [ncurses-examples](https://invisible-island.net/ncurses/ncurses-examples.html):

- add help-popup for `test_instr.c`, `test_inwstr.c`

- add options to `test/worm.c` for benchmarking.

- improve `-t` option of `test/gdc.c`, allowing hours only, or hours and minutes only.

- correct dimensions in `test/popup_msg.c`, fixing an overrun.

- modify `test/demo_keyok.c` to accept `^Q` for quit, for consistency.

- add option “`-c`” to test programs to illustrate a non-blank character in the window background property.

- reserve `-c`/`-l` options in `test/*.c` for command/logging like [vttest](https://invisible-island.net/vttest/).

There is one new demo/test program:

`ncurses/report_ctype.c`  
Shows a chart of the first 256 character codes, which are not as consistent across platforms for ctype versus wctype as some suppose.
