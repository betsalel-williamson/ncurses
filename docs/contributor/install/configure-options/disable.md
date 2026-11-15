# Options that turn features off

This page lists the `--disable-*` options.

## `--disable-assumed-color`

With ncurses 5.1, we introduced a new function, `assume_default_colors()` which allows applications to specify what the default foreground and background color are assumed to be. Most color applications use full-screen color; but a few do not color the background. While the assumed values can be overridden by invoking `assume_default_colors()`, you may find it useful to set the assumed values to the pre-5.1 convention, using this configure option.

## `--disable-big-core`

Assume machine has little memory. The configure script attempts to determine if your machine has enough memory (about 6Mb) to compile the [terminfo](../../../glossary/terminfo.md) database without writing portions to disk. Some allocators return deceptive results, so you may have to override the configure script. Or you may be building tic for a smaller machine.

## `--disable-big-strings`

Disable compile-time optimization of predefined tables which puts all of their strings into a very long string, to reduce relocation overhead.

## `--disable-database`

Use only built-in data. The ncurses libraries normally read terminfo and [termcap](../../../glossary/termcap.md) data from disk. You can configure ncurses to have a built-in database, aka "fallback" entries. Embedded applications may have no need for an external database. Some, but not all of the programs are useful in this configuration, e.g., tset and tput versus infocmp and tic.

## `--disable-db-install`

Do not install the terminal database. This is used to omit features for packages, as done with `--without-progs`.

## `--disable-echo`

Use the option `--disable-echo` to make the build-log less verbose by suppressing the display of the compile and link commands. This makes it easier to see the compiler warnings. (You can always use "make -n" to see the options that are used).

## `--disable-ext-funcs`

Disable function-extensions. Configure ncurses without the functions that are not specified by XSI. See ncurses/modules for the exact list of library modules that would be suppressed.

## `--disable-gnat-projects`

Disable GNAT projects even if usable, for testing old makefile rules.

## `--disable-hashmap`

Compile without hashmap scrolling-optimization code. This algorithm is the default.

## `--disable-home-terminfo`

The `$HOME`/.terminfo directory is normally added to ncurses' search list for reading/writing terminfo entries, since that directory is more likely writable than the system terminfo database. Use this option to disable the feature altogether.

## `--disable-largefile`

Disable compiler flags needed to use large-file interfaces.

## `--disable-leaks`

For testing, compile-in code that frees memory that normally would not be freed, to simplify analysis of memory-leaks.

Any implementation of curses must not free the memory associated with a screen, since (even after calling `endwin()`), it must be available for use in the next call to `refresh()`. There are also chunks of memory held for performance reasons. That makes it hard to analyze curses applications for memory leaks. To work around this, build a debugging version of the ncurses library which frees those chunks which it can, and provides the `_nc_free_and_exit()` function to free the remainder and then exit. The ncurses utility and test programs use this feature, e.g., via the `ExitProgram()` macro.

Because this lies outside of the library's intended usage, it is not normally considered part of the ABI. If there were some (as yet unplanned) extension which frees memory in a manner that would let the library resume and reallocate memory, then that would not use a "_nc_" prefix.

## `--disable-lib-suffixes`

Suppress the "w", "t" or "tw" suffixes which normally would be added to the library names for the `--enable-widec` and `--with-pthread` options.

## `--disable-libtool-version`

when using `--with-libtool`, control how the major/minor version numbers are used for constructing the library name.

The default uses the -version-number feature of libtool, which makes the library names compatible (though not identical) with the standard build using `--with-shared`.

Use `--disable-libtool-version` to use the libtool -version-info feature. This corresponds to the setting used before patch 20100515.

Starting with patch 20141115, using this option causes the configure script to apply the top-level VERSION file to the ABI version used for libtool.

## `--disable-lp64`

The header files will ignore use of the _LP64 symbol to make chtype and `mmask_t` types 32 bits, for compatibility with older releases. The default "unsigned" for these types may be long on 64-bit hosts.

NOTE: this is potentially an ABI change, depending on existing packages. The default for this option is "disabled" for ncurses ABI 5, and "enabled" for ABI 6.

The `--enable-ext-mouse2` option overrides the type used for `mmask_t`.

## `--disable-macros`

For testing, use functions rather than macros. The program will run more slowly, but it is simpler to debug. This defines `NCURSES_NOMACROS` at build time. See also the `--enable-expanded` option.

## `--disable-overwrite`

If you are installing ncurses on a system which contains another development version of curses, or which could be confused by the loader for another version, we recommend that you leave out the link to -lcurses. The ncurses library is always available as -lncurses. Disabling overwrite also causes the ncurses header files to be installed into a subdirectory, e.g., /usr/local/include/ncurses, rather than the include directory. This makes it simpler to avoid compile-time conflicts with other versions of curses.h

Putting the header files into a subdirectory assumes that applications will follow the (standard) practice of including the headers with reference to the subdirectory name. For instance, the normal ncurses header would be included using

```c
#include <ncurses/curses.h>
#include <ncurses/term.h>
```

while the ncursesw headers would be found this way:

```c
#include <ncursesw/curses.h>
#include <ncursesw/term.h>
```

In either case (with or without the `--disable-overwrite` option), almost all applications are designed to include a related set of curses header files from the same directory.

Manipulating the `--includedir` configure option to put header files directly in a subdirectory of the normal include-directory defeats this, and breaks builds of portable applications. Likewise, putting some headers in /usr/include, and others in a subdirectory is a good way to break builds.

When configured with `--disable-overwrite`, the installed header files' embedded #include's are adjusted to use the same style of includes noted above. In particular, the unctrl.h header is included from curses.h, which means that a makefile which tells the compiler to include directly from the subdirectory will fail to compile correctly. Without some special effort, it will either fail to compile at all, or the compiler may find a different unctrl.h file.

In addition to the curses library, a system may provide its own versions of the add-on libraries (form, menu, panel), which would not be compatible with ncurses. These options allow you to rename ncurses' add-on libraries to avoid conflicts when linking:

```sh
--with-form-libname=XXX
--with-menu-libname=XXX
--with-panel-libname=XXX
```

Rather than renaming them arbitrarily, a prefix or suffix is recommended. An "n" prefix provides consistency with ncurses versus curses, i.e.,

```sh
--with-form-libname=nform
--with-menu-libname=nmenu
--with-panel-libname=npanel
```

## `--disable-pkg-ldflags`

Omit options in `$LDFLAGS` and `$EXTRA_LDFLAGS` from the pkg-config ".pc" and corresponding ncurses*-config script which normally are listed via the "`--libs`" option. These options are normally used to facilitate linking to ncurses when it was configured to use the rpath feature.

See also `--enable-rpath` and `--disable-rpath-hack`.

## `--disable-relink`

If `--enable-rpath` is given, the generated makefiles normally will rebuild shared libraries during install. Use this option to simply copy whatever the linker produced.

Static libraries cannot simply be copied because tools use timestamps to determine if the library's symbol table is up to date. If your install program supports the "-p" (preserve timestamp) option, that is used when `--disable-relink` is given, to avoid rebuilding the symbol table.

Finally, some tools ignore the subsecond timestamps supported by some filesystems. This option adds a 1-second sleep to help those tools avoid unnecessary relinking during the install process.

## `--disable-root-access`

Compile with environment restriction, so most file-access is limited when running as root, or via a setuid/setgid application.

## `--disable-root-environ`

Compile with environment restriction, so certain environment variables are not available when running as root. These are (for example `$TERMINFO`) those that allow the search path for the terminfo or termcap entry to be customized.

Disabling the root environment variables also disables the setuid environment variables by default. Use the `--disable-setuid-environ` option to modify this behavior.

## `--disable-rpath-hack`

Normally the configure script helps link libraries found in unusual places by adding an rpath option to the link command. If you are building packages, this feature may be redundant. Use this option to suppress the feature.

## `--disable-scroll-hints`

Compile without scroll-hints code. This option is ignored when hashmap scrolling is configured, which is the default.

## `--disable-stripping`

Do not strip installed executables.

## `--disable-setuid-environ`

Compile with environment restriction, so certain environment variables are not available when running via a setuid/setgid application. These are (for example `$TERMINFO`) those that allow the search path for the terminfo or termcap entry to be customized.

A setuid/setgid application inherits its environment variables from the current user, in contrast to sudo which may limit the environment variables that ncurses uses.

## `--disable-tic-depends`

When building shared libraries, normally the tic library is linked to depend upon the ncurses library (or equivalently, on the tinfo-library if the `--with-termlib` option was given). The tic- and tinfo-library ABIs do not depend on the `--enable-widec` option. Some packagers have used this to reduce the number of library files which are packaged by using only one copy of those libraries. To make this work properly, the tic library must be built without an explicit dependency on the underlying library (ncurses vs ncursesw, tinfo vs tinfow). Use this configure option to do that. For example

```sh
configure --with-ticlib --with-shared --disable-tic-depends
```

## `--disable-tparm-varargs`

Portable programs should call `tparm()` using the fixed-length parameter list documented in [X/Open](../../../glossary/x-open-curses.md). ncurses provides varargs support for this function. Use `--disable-tparm-varargs` to disable this support.
