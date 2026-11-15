# ncurses 5.0 to 5.4

## 5.4 (February 8, 2004)

### Interface changes

- add the remaining functions for X/Open curses wide-character support. These are only available if the library is configured using the `--enable-widec` option. `pecho_wchar()` `slk_wset()`

- write `getyx()` and related 2-return macros in terms of `getcury()`, `getcurx()`, etc.

- simplify ifdef for bool declaration in curses.h

- modify ifdef's in curses.h that disabled use of `__attribute__()` for g++, since recent versions implement the cases which ncurses uses.

- change some interfaces to use const: `define_key()` `mvprintw()` `mvwprintw()` `printw()` `vw_printw()` `winsnstr()` `wprintw()`

### Added extensions

- `key_defined()`

### Added internal functions

```text
_nc_get_locale()
_nc_insert_ch()
_nc_is_charable()       wide
_nc_locale_breaks_acs()
_nc_pathlast()
_nc_to_char()           wide
_nc_to_widechar()       wide
_nc_tparm_analyze()
_nc_trace_bufcat()      debug
_nc_unicode_locale()
```

### Removed internal functions

- `_nc_outstr()`
- `_nc_sigaction()`

### Modified internal functions

- `_nc_remove_string()`
- `_nc_retrace_chtype()`

## 5.3 (October 12, 2002)

### Interface changes

- change type for bool used in headers to `NCURSES_BOOL`, which usually is the same as the compiler's definition for 'bool'.

- add all but two functions for X/Open curses wide-character support. These are only available if the library is configured using the `--enable-widec` option. Missing functions are `pecho_wchar()` `slk_wset()`

- add environment variable `$NCURSES_ASSUMED_COLORS` to modify the `assume_default_colors()` extension.

### Added extensions

- `is_term_resized()`
- `resize_term()`

### Added internal functions

```text
_nc_altcharset_name()   debug
_nc_reset_colors()
_nc_retrace_bool()      debug
_nc_retrace_unsigned()  debug
_nc_rootname()
_nc_trace_ttymode()     debug
_nc_varargs()           debug
_nc_visbufn()           debug
_nc_wgetch()
```

### Removed internal functions

- `_nc_background()`

### Modified internal functions

```text
_nc_freeall()           debug
```

## 5.2 (October 21, 2000)

### Interface changes

- revert [termcap](../../../glossary/termcap.md) `ospeed` variable to 'short' (see discussion of the `--with-ospeed` configure option).

## 5.1 (July 8, 2000)

### Interface changes

- made the extended terminal capabilities (configure `--enable-tcap-names`) a standard feature. This should be transparent to applications that do not require it.

- removed the `trace()` function and related trace support from the production library.

- modified curses.h.in, undef'ing some symbols to avoid conflict with C++ STL.

Added extensions: `assume_default_colors()`.

## 5.0 (October 23, 1999)

### Interface changes

- implemented the `wcolor_set()` and `slk_color()` functions.

- move macro `winch` to a function, to hide details of struct ldat

- corrected prototypes for `slk_*` functions, using `chtype` rather than `attr_t`.

- the `slk_attr_{set,off,on}` functions need an additional void* parameter according to XSI.

- modified several prototypes to correspond with 1997 version of X/Open Curses: `[w]``attr_get``()`, `[w]``attr_set``()`, `border_set()` have different parameters. Some functions were renamed or misspelled: `erase_wchar()`, `in_wchntr()`, `mvin_wchntr()`. Some developers have used `attr_get()`.

Added extensions: `keybound()`, `curses_version()`.

### Terminfo database changes

- change translation for termcap 'rs' to terminfo 'rs2', which is the documented equivalent, rather than 'rs1'.

The problems are subtler in recent releases.

a) This release provides users with the ability to define their own terminal capability extensions, like termcap. To accomplish this, we redesigned the TERMTYPE struct (in term.h). Very few applications use this struct. They must be recompiled to work with the 5.0 library.

a) If you use the extended terminfo names (i.e., you used configure `--enable-tcap-names`), the resulting terminfo database can have some entries which are not readable by older versions of ncurses. This is a bug in the older versions:

- the terminfo database stores booleans, numbers and strings in arrays. The capabilities that are listed in the arrays are specified by X/Open. ncurses recognizes a number of obsolete and extended names which are stored past the end of the specified entries.

- a change to `read_entry`.c in 951001 made the library do an `lseek()` call incorrectly skipping data which is already read from the string array. This happens when the number of strings in the terminfo data file is greater than STRCOUNT, the number of specified and obsolete or extended strings.

- as part of alignment with the X/Open final specification, in the 990109 patch we added two new terminfo capabilities: `set_a_attributes` and `set_pglen_inch`). This makes the indices for the obsolete and extended capabilities shift up by 2.

- the last two capabilities in the obsolete/extended list are memu and meml, which are found in most terminfo descriptions for xterm.

  When trying to read this terminfo entry, the spurious `lseek()` causes the library to attempt to read the final portion of the terminfo data (the text of the string capabilities) 4 characters past its starting point, and reads 4 characters too few. The library rejects the data, and applications are unable to initialize that [terminal type](../../../glossary/terminal-type.md).

FIX: remove memu and meml from the xterm description. They are obsolete, not used by ncurses. (It appears that the feature was added to xterm to make it more like hpterm).

This is not a problem if you do not use the -x option of tic to create a terminfo database with extended names. Note that the user-defined terminal capabilities are not affected by this bug, since they are stored in a table after the older terminfo data ends, and are invisible to the older libraries.

c) Some developers did not wish to use the C++ binding, and used the configure `--without-cxx` option. This causes problems if someone uses the ncurses library from C++ because that configure test determines the type for C++'s bool and makes ncurses match it, since both C++ and curses are specified to declare bool. Calling ncurses functions with the incorrect type for bool will cause execution errors. In 5.0 we added a configure option "`--without-cxx-binding`" which controls whether the binding itself is built and installed.
