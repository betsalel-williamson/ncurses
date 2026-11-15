# Porting hints

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

The following notes were intended to be a first step towards DOS and Macintosh ports of the ncurses libraries.

The following library modules are "pure curses"; they operate only on the curses internal structures, do all output through other curses calls (not including `tputs()` and `putp()`) and don't call any other UNIX routines such as `signal(2)` or the stdio library. Thus, they should not need to be modified for single-terminal ports.

> `lib_addch.c lib_addstr.c lib_bkgd.c lib_box.c lib_clear.c lib_clrbot.c lib_clreol.c lib_delch.c lib_delwin.c lib_erase.c lib_inchstr.c lib_insch.c lib_insdel.c lib_insnstr.c lib_keyname.c lib_move.c lib_mvwin.c lib_newwin.c lib_overlay.c lib_pad.c lib_printw.c lib_refresh.c lib_scanw.c lib_scroll.c lib_scrreg.c lib_set_term.c lib_touch.c lib_tparm.c lib_tputs.c unctrl.c lib_window.c panel.c`

`lib_getstr.c` is pure curses too. It echoes through `waddch()` and `wechochar()`.

These modules are pure curses, except that they use `tputs()` and `putp()`:

> `lib_beep.c lib_color.c lib_endwin.c lib_options.c lib_slk.c lib_vidattr.c`

This module assists in POSIX emulation on non-POSIX systems:

- `sigaction.c`: signal calls

The following source files will not be needed for a single-terminal-type port.

> `alloc_entry.c captoinfo.c clear.c comp_captab.c comp_error.c comp_hash.c tic.c comp_parse.c comp_scan.c dump_entry.c infocmp.c parse_entry.c read_entry.c tput.c write_entry.c`

The following modules will use `open()`/`read()`/`write()`/`close()`/`lseek()` on files, but no other OS calls.

- `lib_screen.c`: used to read/write screen dumps
- `lib_trace.c`: used to write trace data to the logfile

Modules that would have to be modified for a port start here.

The following modules are "pure curses" but contain assumptions inappropriate for a memory-mapped port.

- `lib_longname.c`: assumes there may be multiple terminals
- `lib_acs.c`: assumes `acs_map` as a double indirection
- `lib_mvcur.c`: assumes cursor moves have variable cost
- `lib_termcap.c`: assumes there may be multiple terminals
- `lib_ti.c`: assumes there may be multiple terminals

The following modules use UNIX-specific calls:

- `tty_update.c`: input checking
- `lib_getch.c`: `read()`
- `lib_initscr.c`: `getenv()`
- `lib_newterm.c`, `lib_baudrate.c`, `lib_kernel.c`: various tty-manipulation and system calls
- `lib_raw.c`: various tty-manipulation calls
- `lib_setup.c`: various tty-manipulation calls
- `lib_restart.c`: various tty-manipulation calls
- `lib_tstp.c`: signal-manipulation calls
- `lib_twait.c`: `gettimeofday()`, `select()`

Since this guide was written, ncurses has been ported to the Win32 console through MinGW; the `win32con` directory holds that port's driver.
