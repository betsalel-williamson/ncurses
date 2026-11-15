# Installing ncurses

> Adapted from the `INSTALL`, `README.MinGW` and `README.emx` files in the ncurses source distribution.

This guide covers building ncurses from source and installing it. Read it all before you install, because some steps can overwrite the curses library and terminfo database that your system already has.

The source tree has several subdirectories, including `c++`, `form`, `man`, `menu`, `misc`, `ncurses`, `panel`, `progs` and `test`. The `README` file at the top of the tree is a roadmap to the package.

This edition corrects the claims about configure's defaults, option names and file names that no longer match the source. The [errata](../../appendix/index.md) list each correction with what it was checked against.

## Who should read what

- Packagers and distribution integrators should read [For system integrators](system-integrators.md).
- If you are converting from BSD curses and don't have root access, read [BSD conversion notes](bsd-conversion.md).
- If you build applications that use GPM with ncurses, read [Using GPM](gpm.md).
- If you are cross-compiling, read [Building with a cross-compiler](cross-compiling.md).
- The Ada95 binding has its own instructions in the `Ada95` directory, and this guide doesn't cover it.

## Requirements

You need the following to build and install ncurses on a UNIX system:

- An ANSI C compiler, such as gcc
- `sh` (bash will do)
- `awk` (mawk or gawk will do)
- `sed`
- A BSD or System V style `install` (a script is included)

ncurses has also been built on Windows with MinGW and on OS/2 with EMX. Those builds have their own pages.

## Guide

- [Installation procedure](installation-procedure.md)
- [Configure options](configure-options/index.md)
- [Compatibility with older releases](compatibility/index.md)
- [For system integrators](system-integrators.md)
- [Modern xterm versions](modern-xterm.md)
- [Configuring fallback entries](fallback-entries.md)
- [BSD conversion notes](bsd-conversion.md)
- [Using GPM](gpm.md)
- [Building with a cross-compiler](cross-compiling.md)
- [Building with MinGW](mingw.md)
- [Building with EMX on OS/2](emx.md)
- [Bug reports](bug-reports.md)
