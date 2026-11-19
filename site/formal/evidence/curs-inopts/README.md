# Evidence: curs_inopts(3X)

The raw output of `../../key-check.sh PREFIX curs-inopts`, run on 2026-11-19 against the static
library built from this tree. `environment.txt` gives the versions and the source commit.

- **An invalid escape sequence comes back one character per call, in input order.** With keypad
  on, `\E[zzq` reads as ESC, '[', 'z', 'z', 'q' (case 6). When the tree of key strings has no
  match, `kgetch` stops and pulls the first character of the queue
  (`ncurses/base/lib_getch.c:779`); the rest stay queued for later calls. The page said it
  returns only the last character. curs_getch(3X) already describes this correctly.
- **Key load order.** The `dupkeys` entry (`../../curs-inopts-check.ti`) gives kbs and ka1 one
  string, and khome and kc1 another. In strfnames order kbs comes before ka1 and khome before kc1,
  so if the last one loaded won, the keys would read as KEY_A1 and KEY_C1. They read as
  KEY_BACKSPACE and KEY_HOME (case 7). `ncurses/Makefile.in:264` sorts `keys.list` by KEY_ name
  with `LC_ALL=C sort`, `_nc_init_keytry` adds the keys in that order
  (`ncurses/tinfo/init_keytry.c:80-85`), and a later string replaces an earlier one's code
  (`ncurses/tinfo/add_tries.c:72`). So KEY_A1 loads before KEY_BACKSPACE and KEY_C1 before
  KEY_HOME, and the later of each pair wins.
- **The options need a SCREEN, not just a TERMINAL.** `setupterm` fills in a TERMINAL
  (curs_terminfo(3X)); `initscr` and `newterm` create a SCREEN that holds it (curs_initscr(3X)),
  and ncurses(3X) calls the line discipline a property of the screen. After `setupterm` on a
  pseudo-terminal, with no SCREEN, every option returns ERR (case 2). The is_ queries also return -1 then; the page's EXTENSIONS line, which names the TERMINAL, is true in every case a program normally meets and stays as it is. `_nc_set_tty_mode` fails
  without a screen (`ncurses/tinfo/lib_ttyflags.c:97`), and echo, halfdelay, intrflush and
  typeahead check for one themselves. The is_ queries return -1 when there is no screen
  (`ncurses/tinfo/lib_raw.c:403-408`). The page named the TERMINAL structure, and listed
  setupterm as one way to set it up.
- **halfdelay's range** holds: 0, 256 and -1 return ERR, and 1 and 255 return OK (case 4,
  `ncurses/tinfo/lib_options.c:91`). The page called the parameter `delay`; it is `tenths`.

Case 3 runs newterm on a file rather than a terminal, so cbreak, raw and intrflush, which change
the terminal's modes, return ERR there; echo, nl, halfdelay, meta and typeahead only set flags.
