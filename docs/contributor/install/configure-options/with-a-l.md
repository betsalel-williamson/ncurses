# Options that set or add, A to L

This page lists the `--with-*` options from `--with-abi-altered` to `--with-libtool-opts`.

## `--with-abi-altered=NUM`

Override the displayed (rather than compiled-in) ABI. Only packagers who have created configurations where the ABI differs from ncurses should be interested in this option.

## `--with-abi-version=NUM`

Override the ABI version, which is used in shared library filenames. Normally this is the same as the release version; some ports have special requirements for compatibility.

This option does not affect linking with libtool, which uses the release major/minor numbers.

## `--with-ada-compiler=CMD`

Specify the Ada95 compiler command (default "gnatmake")

## `--with-ada-include=DIR`

Tell where to install the Ada includes (default: PREFIX/lib/ada/adainclude)

## `--with-ada-libname=NAME`

Override the name of the Ada binding (default: "AdaCurses")

## `--with-ada-objects=DIR`

Tell where to install the Ada objects (default: PREFIX/lib/ada/adalib)

## `--with-ada-sharedlib`

Build a shared library for Ada95 binding, if the compiler permits.

NOTE: You must also set the `--with-shared` option on some platforms for a successful build. You need not use this option when you set `--with-shared`, unless you want to use the Ada shared library.

## `--with-bool=TYPE`

If `--without-cxx` is specified, override the type used for the "bool" declared in curses.h (normally the type is automatically chosen to correspond with that in <stdbool.h>, or defaults to platform-specific sizes).

## `--with-build-cc=XXX`

If cross-compiling, specify a host C compiler, which is needed to compile a few utilities which generate source modules for ncurses. If you do not give this option, the configure script checks if the `$BUILD_CC` variable is set, and otherwise defaults to gcc or cc.

## `--with-build-cflags=XXX`

If cross-compiling, specify the host C compiler-flags. You might need to do this if the target compiler has unusual flags which confuse the host compiler.

You can also set the environment variable `$BUILD_CFLAGS` rather than use this option.

## `--with-build-cpp=XXX`

This option is provided by the same macro used for `$BUILD_CC`, etc., but is not directly used by ncurses.

## `--with-build-cppflags=XXX`

If cross-compiling, specify the host C preprocessor-flags. You might need to do this if the target compiler has unusual flags which confuse the host compiler.

You can also set the environment variable `$BUILD_CPPFLAGS` rather than use this option.

## `--with-build-ldflags=XXX`

If cross-compiling, specify the host linker-flags. You might need to do this if the target linker has unusual flags which confuse the host compiler.

You can also set the environment variable `$BUILD_LDFLAGS` rather than use this option.

## `--with-build-libs=XXX`

If cross-compiling, the host libraries. You might need to do this if the target environment requires unusual libraries.

You can also set the environment variable `$BUILD_LIBS` rather than use this option.

## `--with-caps=XXX`

Specify an alternate terminfo capabilities file, which makes the configure script look for "include/Caps.XXX". A few systems, e.g., AIX 4.x use the same overall file-format as ncurses for terminfo data, but use different alignments within the tables to support legacy applications. For those systems, you can configure ncurses to use a terminfo database which is compatible with the native applications.

## `--with-ccharw-max=XXX`

Override the size of the wide-character array in `cchar_t` structures. Changing this will alter the binary interface. This defaults to 5.

## `--with-chtype=TYPE`

Override type of chtype, which stores the video attributes and (if `--enable-widec` is not given) a character. Prior to ncurses 5.5, this was always unsigned long, but with ncurses 5.5, it may be unsigned. Use this option if you need to preserve compatibility with 64-bit executables, e.g., by setting "`--with-chtype=long`" (the configure script supplies "unsigned").

## `--with-config-suffix=XXX`

Specify an suffix for "ncurses*" in the ncurses*-config filename to work around conflicts with packages. The suffix is placed before the dash.

## `--with-cxx-libname=NAME`

Override the basename of the ncurses++ library (default: "ncurses++")

## `--with-cxx-shared`

When `--with-shared` is set, build libncurses++ as a shared library. This implicitly relies upon building with gcc/g++, since other compiler suites may have differences in the way shared libraries are built. libtool by the way has similar limitations.

## `--with-database=XXX`

Specify the terminfo source file to install. Usually you will wish to install ncurses' default (misc/terminfo.src). Certain systems have special requirements, e.g, OS/2 EMX has a customized terminfo source file.

## `--with-dbmalloc`

For testing, compile and link with Conor Cahill's dbmalloc library. This also sets the `--disable-leaks` option.

## `--with-debug`

Generate debug-libraries (default). These are named by adding "_g" to the root, e.g., `libncurses_g.a`

## `--with-default-terminfo-dir=XXX`

Specify the default terminfo database directory. This is normally DATADIR/terminfo, e.g., /usr/share/terminfo.

## `--with-dmalloc`

For testing, compile and link with Gray Watson's dmalloc library. This also sets the `--disable-leaks` option.

## `--with-export-syms[=XXX]`

Limit exported symbols using libtool. The configure script automatically chooses an appropriate ".sym" file, which lists the symbols which are part of the ABI.

## `--with-extra-suffix[=XXX]`

Add the given suffix to header- and library-names to simplify installing incompatible ncurses libraries, e.g., those using a different ABI. The renaming affects the name of the include-subdirectory if `--disable-overwrite` is given.

## `--with-fallbacks=XXX`

Specify a list of fallback terminal descriptions which will be compiled into the ncurses library. See CONFIGURING FALLBACK ENTRIES.

See also "`--with-tic-path`" and "`--with-infocmp-path`".

## `--with-form-libname=NAME`

Override the basename of the form library (default: "form")

## `--with-gpm`

use Alessandro Rubini's GPM library to provide mouse support on the Linux console. Prior to ncurses 5.5, this introduced a dependency on the GPM library.

Currently ncurses uses the `dlsym()` function to bind to the library at runtime, so it is only necessary that the library be present when ncurses is built, to obtain the filename (or soname) used in the corresponding `dlopen()` call. If you give a value for this option, e.g.,

```sh
--with-gpm=$HOME/tmp/test-gpm.so
```

that overrides the configure check for the soname.

See also `--without-dlsym`

## `--with-hashed-db[=XXX]`

Use a hashed database for storing terminfo data rather than storing each compiled entry in a separate binary file within a directory tree.

In particular, this uses the Berkeley database 1.8.5 interface, as provided by that and its successors db 2, 3, and 4. The actual interface is slightly different in the successor versions of the Berkeley database. The database should have been configured using "`--enable-compat185`".

If you use this option for configuring ncurses, tic will only be able to write entries in the hashed database. infocmp can still read entries from a directory tree as well as reading entries from the hashed database. To do this, infocmp determines whether the `$TERMINFO` variable points to a directory or a file, and reads the directory-tree or hashed database respectively.

You cannot have a directory containing both hashed-database and filesystem-based terminfo entries.

Use the parameter value to give the install-prefix used for the database, e.g.,

```sh
--with-hashed-db=/usr/local/BigBase
```

to find the corresponding include- and lib-directories under the given directory. Alternatively, you can specify a directory leaf name, e.g.,

```sh
--with-hashed-db=db4
```

to make the configure script look for files in a subdirectory such as

```text
/usr/include/db4/db.h
/usr/lib/db4/libdb.so
```

See also the `--enable-getcap` option.

## `--with-infocmp-path[=XXX]`

Use this option to override the automatic detection of infocmp in your `$PATH` when building fallbacks (see "`--with-fallbacks`").

## `--with-install-prefix=XXX`

Allows you to specify an alternate location for installing ncurses after building it. The value you specify is prepended to the "real" install location. This simplifies making binary packages. The makefile variable DESTDIR is set by this option. It is also possible to use

```sh
make install DESTDIR=XXX
```

since the makefiles pass that variable to subordinate makes.

NOTE: a few systems build shared libraries with fixed pathnames; this option probably will not work for those configurations.

## `--with-lib-prefix=XXX`

OS/2 EMX used a different naming convention from most Unix-like platforms. It required that the "lib" part of a library name was omitted. Newer EMX as part of eComStation does not follow that convention. Use this option to override the configure script's assumptions about the library-prefix. If this option is omitted, it uses the original OS/2 EMX convention for that platform. Use "`--with-lib-prefix=lib`" for the newer EMX in eComStation. Use "`--without-lib-prefix`" to suppress it for other odd platforms.

## `--with-libtool[=XXX]`

Generate libraries with libtool. If this option is selected, then it overrides all other library model specifications. Note that libtool must already be installed, uses makefile rules dependent on GNU make, and does not promise to follow the version numbering convention of other shared libraries on your system. However, if the `--with-shared` option does not succeed, you may get better results with this option.

If a parameter value is given, it must be the full pathname of the particular version of libtool, e.g.,

```text
/usr/bin/libtool-1.2.3
```

It is possible to rebuild the configure script to use the automake macros for libtool, e.g., `AC_PROG_LIBTOOL`. See the comments in aclocal.m4 for `CF_PROG_LIBTOOL`, and ensure that you build configure using the appropriate patch for autoconf from

```text
https://invisible-island.net/autoconf/
```

## `--with-libtool-opts=XXX`

Allow user to pass additional libtool options into the library creation and link steps. The main use for this is to do something like

```sh
./configure --with-libtool-opts=-static
```

to get the same behavior as automake-flavored

```sh
./configure --enable-static
```
