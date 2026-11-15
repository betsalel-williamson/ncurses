# Options that leave parts out

This page lists the `--without-*` options.

## `--without-ada`

Suppress the configure script's check for Ada95, do not build the Ada95 binding and related demo.

## `--without-curses-h`

Don't install the ncurses header with the name "curses.h". Rather, install as "ncurses.h" and modify the installed headers and man pages accordingly.

Likewise, do not install an alias "curses" for the ncurses man page.

## `--without-cxx`

XSI curses declares "bool" as part of the interface. C++ also declares "bool". Neither specifies the size and type of booleans, but both insist on the same name. We chose to accommodate this by making the configure script check for the size and type (e.g., unsigned or signed) that your C++ compiler uses for booleans. If you do not wish to use ncurses with C++, use this option to tell the configure script to not adjust ncurses bool to match C++.

## `--without-cxx-binding`

Suppress the configure script's check for C++, do not build the C++ binding and related demo.

## `--without-develop`

Disable development options. This does not include those that change the interface, such as `--enable-widec`.

## `--without-dlsym`

Do not use `dlsym()` to load GPM dynamically.

## `--without-manpages`

Tell the configure script to suppress the install of ncurses' man pages.

## `--without-progs`

Tell the configure script to suppress the build of ncurses' application programs (e.g., tic). The test applications will still be built if you type "make", though not if you simply do "make install".

## `--without-tests`

Tell the configure script to suppress the build of ncurses' test programs.

## `--without-xterm-new`

Tell the configure script to use "xterm-old" for the entry used in the terminfo database. This will work with variations such as X11R5 and X11R6 xterm.
