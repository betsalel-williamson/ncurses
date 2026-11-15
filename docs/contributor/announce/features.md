# Features of ncurses

The ncurses package is fully upward-compatible with SVr4 (System V Release 4) curses:

- All of the SVr4 calls have been implemented (and are documented).

- ncurses supports the features of SVr4 curses including keyboard mapping, color, form drawing with ACS characters, and automatic recognition of keypad and function keys.

- ncurses provides work-alike replacements of SVr4 supplemental libraries based on curses, but which were not specified by X/Open Curses:

  - the panel library, permitting windows to stack and overlap

  - the menu library, supporting a uniform but flexible interface for menu programming

  - the form library, supporting data collection through on-screen forms

- ncurses's terminal database is fully compatible with that used by SVr4 curses.

  - ncurses supports user-defined capabilities that it can see, but which are hidden from SVr4 curses applications using the *same* terminal database.

  - It can be optionally configured to match the format used in related systems such as AIX and Tru64.

  - Alternatively, ncurses can be configured to use hashed databases rather than the directory of files used by SVr4 curses.

- The ncurses utilities have options to allow you to filter terminfo entries for use with less capable *curses*/*terminfo* versions such as the HP-UX and AIX ports.

The ncurses package also has many useful extensions over SVr4:

- The API is 8-bit clean and base-level conformant with the X/Open Curses specification, XSI curses (that is, it implements all *BASE* level features, and almost all *EXTENDED* features). It includes many function calls not supported under SVr4 curses (but portability of all calls is documented so you can use the SVr4 subset only).

- Unlike SVr3 curses, ncurses can write to the rightmost-bottommost corner of the screen if your terminal has an insert-character capability.

- Ada95 and C++ bindings.

- Support for mouse event reporting with X Window xterm and FreeBSD and OS/2 console windows.

- Extended mouse support via Alessandro Rubini's gpm package.

- The function `wresize` allows you to resize windows, preserving their data.

- The function `use_default_colors` allows you to use the terminal's default colors for the default color pair, achieving the effect of transparent colors.

- The functions `keyok` and `define_key` allow you to better control the use of function keys, e.g., disabling the ncurses `KEY_MOUSE`, or by defining more than one control sequence to map to a given key code.

- Support for direct-color terminals, such as modern xterm.

- Support for 256-color terminals, such as modern xterm.

- Support for 16-color terminals, such as *aixterm* and *modern xterm*.

- Better cursor-movement optimization. The package now features a cursor-local-movement computation more efficient than either BSD's or System V's.

- Super hardware scrolling support. The screen-update code incorporates a novel, simple, and cheap algorithm that enables it to make optimal use of hardware scrolling, line-insertion, and line-deletion for screen-line movements. This algorithm is more powerful than the 4.4BSD curses `quickch` routine.

- Real support for terminals with the magic-cookie glitch. The screen-update code will refrain from drawing a highlight if the magic- cookie unattributed spaces required just before the beginning and after the end would step on a non-space character. It will automatically shift highlight boundaries when doing so would make it possible to draw the highlight without changing the visual appearance of the screen.

- It is possible to generate the library with a list of pre-loaded fallback entries linked to it so that it can serve those terminal types even when no terminfo tree or termcap file is accessible (this may be useful for support of screen-oriented programs that must run in single-user mode).

- The [tic](https://invisible-island.net/ncurses/man/tic.1m.html)/[captoinfo](https://invisible-island.net/ncurses/man/captoinfo.1m.html) utility provided with ncurses has the ability to translate many termcaps from the XENIX, IBM and AT&T extension sets.

- A BSD-like [tset](https://invisible-island.net/ncurses/man/tset.1.html) utility is provided.

- The ncurses library and utilities will automatically read terminfo entries from \$HOME/.terminfo if it exists, and compile to that directory if it exists and the user has no write access to the system directory. This feature makes it easier for users to have personal terminfo entries without giving up access to the system terminfo directory.

- You may specify a path of directories to search for compiled descriptions with the environment variable `TERMINFO_DIRS` (this generalizes the feature provided by TERMINFO under stock System V.)

- In terminfo source files, use capabilities may refer not just to other entries in the same source file (as in System V) but also to compiled entries in either the system terminfo directory or the user's \$HOME/.terminfo directory.

- The table-of-entries utility [toe](https://invisible-island.net/ncurses/man/toe.1m.html) makes it easy for users to see exactly what terminal types are available on the system.

- X/Open Curses permits most functions it specifies to be made available as macros as well. ncurses does this

  - to improve performance, e.g., for operations composed of simpler functions such as cursor movement following by adding text to the screen,
  - to simplify the implementation by reusing functions which use common parameters, e.g., the standard screen `stdscr`, and
  - to provide functions that return values via their parameters

  Except for the last case, ncurses provides a non-macro implementation of the function. If the macro definition is disabled with `#undef`, or by defining `NCURSES_NOMACROS` the function may be linked (and its calls will be checked against the prototype).

- Extensive documentation is provided (see the *[Additional Reading](https://invisible-island.net/ncurses/ncurses.faq.html#additional_reading)* section of the *[ncurses FAQ](https://invisible-island.net/ncurses/ncurses.faq.html)* for online documentation).
