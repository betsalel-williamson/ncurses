# Portability

Many of the portability changes are implemented via the configure script:

- disallow configure options which apply only to multiuser systems, to improve ports to single-user systems such as Haiku

- add warning to configure script to address conflict between the `--enable-lp64` option and the options for overriding the types used for `chtype` and `mmask_t`.

- modify configure script cases for `$host_os`, to accommodate 64-bit big-endian POWER Linux with glibc

- modify configure script and misc/Makefile to accept glob expressions that include Windows/DOS drive-letters

- change `Ada95/configure` to use `--with-screen` option rather than `--enable-widec`, to provide more choices of underlying curses library.

- modify configure script to work around broken gnatgcc script found in gcc-13 builds.

Other portability fixes include:

- improve pattern used for configure `--with-xterm-kbs` option.

- modify recursive make rules to avoid interference with GNU make's "-j" option

- when installing the terminfo database, check if symbolic links are supported before attempting to link lib/terminfo from share/terminfo

- improve logic in `misc/run_tic.in` for constructing symbolic link when `$DESTDIR` is set.

- build-fix for ncurses-examples with newer PDCurses, which no longer has stubs for unimplemented features.

- change `etip.h.in` to include either/both of `<new>` and `<exception>`, needed for another old BSD.

- correct conditional-compile for a case when the C compiler does not have a bool type.

- improve `MKlib_gen.sh` handling of “bool” type, for building `link_test`.

- modify `ncurses/tinfo/MKfallback.sh` to work with MacOS `sed`, which lacks BSD-style `\<` and `\>`.

- modify `MKlib_gen.sh` to allow for Solaris's definition of `NULL` as `0L`.

- widen pattern in pc/\*-config scripts to disallow more linker options.

- avoid redefining bool in `curses.h` if the platform already supports that type.

- move include `<curses.h>` from `etip.h.in` to `cursesw.h`, to work around breakage in Apple's port of ncurses.
