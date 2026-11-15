# Configuration changes

## Major changes

Improvements made to configure checks include

- improve configure check for “install”.

- add check for build-time utilities, in case cross-compiling is setup with an invalid `$BUILD_CC`

- add configure check for `<sys/fsuid.h>`, which may be needed for flatpacks

- add a consistency-check for termio(s)/tty headers, to help with cross-compiles

- modify configure check for `MAKEFLAGS`/`MFLAGS` to ignore existing value of these environment variables

- improve configurability of `alloca` as used in Windows ports.

- modify configure script checks for `stdbool.h` to fix build with older gcc version.

- add \<new\> to the possible headers declaring the C++ `std::bad_alloc`.

- modify check for `stdbool.h` to be more conservative in case the headers are used with a compiler other than that which was used to configure

- remove dependency on `stdbool.h` from configure script check for type of *bool* when C++ binding is omitted.

## Configuration options

There are a few new configure options:

[`--enable-install-prefix`](https://invisible-island.net/ncurses/INSTALL.html#option:enable-install-prefix)  
Modify behavior of `$DESTDIR` to merge or replace the value set by `--prefix`.

[`--enable-named-pipes`](https://invisible-island.net/ncurses/INSTALL.html#option:enable-named-pipes)  
The Windows driver uses named pipes for communicating with a pseudo console, allowing it to use escape sequences rather than Console API. This works well with mintty. On the downside, this feature may not work well with the Windows Terminal due to a longstanding bug in `conhost.exe` ([\#9461](https://github.com/microsoft/terminal/issues/9461)).

These configure options are modified:

[`--enable-exp-win32`](https://invisible-island.net/ncurses/INSTALL.html#option:enable-exp-win32)  
This option is obsolete, replaced by `--enable-named-pipes`.

[`--enable-term-driver`](https://invisible-island.net/ncurses/INSTALL.html#option:enable-term-driver)  
This is enabled by default on platforms where the Windows driver can be compiled, e.g., Cygwin, MinGW32 and MSYS2.

## Package configuration scripts

The configure script and makefiles optionally generate a script which reports the compiler and linker options needed to build a program with ncurses, as well as a data file which is used via pkg-config for the same purpose. Several improvements were made for these scripts:

- improved filtering of `-L` options in `misc/gen-pkgconfig.in` and in `misc/ncurses-config.in`

- modified `ncurses*-config` to add `-I` option in `--cflag` where needed for `--disable-overwrite` to match ".pc" files.

- suppressed `-g` and `-fXXX` flags from `CFLAGS` in `misc/ncurses-config.in`

- modified configure script to allow for `pkg-config` using DOS/Windows pathname syntax

- modified `misc/ncurses-config.in`, improved match with `pkg-config output`.

- adjusted naming of test packages for MinGW `*-config` scripts to match the `pkg-config` names

- added `--cflags-only-I` and `--cflags-only-other` options to `misc/ncurses-config.in`
