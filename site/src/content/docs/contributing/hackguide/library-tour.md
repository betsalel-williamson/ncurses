---
title: "A tour of the ncurses library"
sidebar:
  order: 6
---

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

The library's sources live in subdirectories of `ncurses/`: `base` for the curses functions, `tinfo` for the terminfo layer, `tty` for screen updating, and `trace` for debugging support. A few of the files named below, such as `lib_gen.c`, `lib_keyname.c`, `unctrl.c` and `comp_captab.c`, are generated during the build rather than kept in the source tree.

## Library overview

Most of the library is superstructure: fairly trivial convenience interfaces to a small set of basic functions and data structures used to manipulate the virtual screen (in particular, none of this code does any I/O except through calls to more fundamental modules described below). The files

> `lib_addch.c lib_bkgd.c lib_box.c lib_chgat.c lib_clear.c lib_clearok.c lib_clrbot.c lib_clreol.c lib_colorset.c lib_data.c lib_delch.c lib_delwin.c lib_echo.c lib_erase.c lib_gen.c lib_getstr.c lib_hline.c lib_immedok.c lib_inchstr.c lib_insch.c lib_insdel.c lib_insnstr.c lib_instr.c lib_isendwin.c lib_keyname.c lib_leaveok.c lib_move.c lib_mvwin.c lib_overlay.c lib_pad.c lib_printw.c lib_redrawln.c lib_scanw.c lib_screen.c lib_scroll.c lib_scrollok.c lib_scrreg.c lib_set_term.c lib_slk.c lib_slkatr_set.c lib_slkatrof.c lib_slkatron.c lib_slkatrset.c lib_slkattr.c lib_slkclear.c lib_slkcolor.c lib_slkinit.c lib_slklab.c lib_slkrefr.c lib_slkset.c lib_slktouch.c lib_touch.c unctrl.c lib_vline.c lib_wattroff.c lib_wattron.c lib_window.c`

are all in this category. They are very unlikely to need change, barring bugs or some fundamental reorganization in the underlying data structures.

These files are used only for debugging support:

> `lib_trace.c lib_traceatr.c lib_tracebits.c lib_tracechr.c lib_tracedmp.c lib_tracemse.c trace_buf.c`

It is rather unlikely you will ever need to change these, unless you want to introduce a new debug trace level for some reason.

There is another group of files that do direct I/O via `tputs()`, computations on the terminal capabilities, or queries to the OS environment, but nevertheless have only fairly low complexity. These include:

> `lib_acs.c lib_beep.c lib_color.c lib_endwin.c lib_initscr.c lib_longname.c lib_newterm.c lib_options.c lib_termcap.c lib_ti.c lib_tparm.c lib_tputs.c lib_vidattr.c read_entry.c`

They are likely to need revision only if ncurses is being ported to an environment without an underlying terminfo capability representation.

These files have serious hooks into the tty driver and signal facilities:

> `lib_kernel.c lib_baudrate.c lib_raw.c lib_tstp.c lib_twait.c`

If you run into porting snafus moving the package to another UNIX, the problem is likely to be in one of these files. The file `lib_print.c` uses `sleep(2)` and also falls in this category.

Almost all of the real work is done in the files

> `hardscroll.c hashmap.c lib_addch.c tty_update.c lib_getch.c lib_mouse.c lib_mvcur.c lib_refresh.c lib_setup.c lib_vidattr.c`

Most of the algorithmic complexity in the library lives in these files. If there is a real bug in ncurses itself, it's probably here. We will tour some of these files in detail in [the engine room](/ncurses/contributing/hackguide/engine-room/).

Finally, there is a group of files that is actually most of the terminfo compiler. The reason this code lives in the ncurses library is to support fallback to `/etc/termcap`. These files include

> `alloc_entry.c captoinfo.c comp_captab.c comp_error.c comp_hash.c comp_parse.c comp_scan.c parse_entry.c read_termcap.c write_entry.c`

We will discuss these in [the compiler tour](/ncurses/contributing/hackguide/terminfo-compiler/).
