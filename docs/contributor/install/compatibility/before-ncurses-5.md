# Before ncurses 5

## 4.2 (March 2, 1998)

### Interface changes

- correct prototype for `termattrs()` as per XPG4 version 2.

- add placeholder prototypes for `color_set()`, `erasewchar()`, `term_attrs()`, `wcolor_set()` as per XPG4 version 2.

- add macros getcur[xy] getbeg[xy] getpar[xy], which are defined in [SVr4](../../../glossary/svr4.md) headers.

New extensions: `keyok()` and `define_key()`.

### Terminfo database changes

- corrected definition in curses.h for [`ACS_LANTERN`](../../../glossary/alternate-character-set.md), which was 'I' rather than 'i'.

## 4.1 (May 15, 1997)

We added these extensions: `use_default_colors()`. Also added configure option `--enable-const`, to support the use of const where X/Open should have, but did not, specify.

The terminfo database content changed the representation of color for most entries that use ANSI colors. SVr4 curses treats the setaf/setab and setf/setb capabilities differently, interchanging the red/blue colors in the latter.

## 4.0 (December 24, 1996)

We bumped to version 4.0 because the newly released Linux dynamic loader (ld.so.1.8.5) did not load shared libraries whose ABI and REL versions were inconsistent. At that point, ncurses ABI was 3.4 and the REL was 1.9.9g, so we made them consistent.

## 1.9.9g (December 1, 1996)

This fixed most of the problems with 1.9.9e, and made these interface changes:

- remove `tparam()`, which had been provided for compatibility with some termcap. `tparm()` is standard, and does not conflict with application's fallback for missing `tparam()`.

- turn off hardware echo in `initscr()`. This changes the sense of the `echo()` function, which was initialized to echoing rather than nonechoing (the latter is specified). There were several other corrections to the terminal I/O settings which cause applications to behave differently.

- implemented several functions (such as `attr_on()`) which were available only as macros.

- corrected several typos in curses.h.in (i.e., the mvXXXX macros).

- corrected prototypes for `delay_output()`, `has_color`, `immedok()` and `idcok()`.

- corrected misspelled `getbkgd()`. Some applications used the misspelled name.

- added _yoffset to `WINDOW`. The size of `WINDOW` does not impact applications, since they use only pointers to `WINDOW` structs.

### These changes were made to the terminfo database

- removed boolean 'getm' which was available as an extended name.

We added these extensions: `wresize()`, `resizeterm()`, `has_key()` and `mcprint()`.

## 1.9.9e (March 24, 1996)

not recommended (a last-minute/untested change left the forms and menus libraries unusable since they do not repaint the screen). Foreground/background colors are combined incorrectly, working properly only on a black background. When this was released, the X/Open specification was available only in draft form.

Some applications (such as lxdialog) were "fixed" to work with the incorrect color scheme.
