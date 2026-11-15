# Options that set or add, M to Z

This page lists the `--with-*` options from `--with-manpage-aliases` to `--with-xterm-kbs`.

## `--with-manpage-aliases`

Create files in subdirectories of the installation "man" directory that alias the man pages documenting them. For example, the "beep" man page also documents the function "flash". This is the default. You can disable this procedure if your system's makewhatis(8) or mandb(8) program indexes the directory to which the pages are installed. If you disable man page symlinks by specifying "`--without-manpage-symlinks`", the alias pages are created as stubs containing ".so" *roff requests.

## `--with-manpage-format=XXX`

Tell the configure script how you would like to install man pages. The option value must be one of these: "gzip", "compress", "BSDI", "normal", "formatted". If you do not specify this option, the configure script attempts to determine which is the case.

## `--with-manpage-renames=XXX`

Tell the configure script that you wish to rename the man pages when installing them. Debian and distributions descended from it do this. The option value specifies the name of a file that lists the renamed files, e.g., `$srcdir/man/man_db.renames`.

## `--with-manpage-symlinks`

Tell the configure script that you wish to make symbolic links in the man-directory for aliases to the man pages. This is the default, but can be disabled for systems that provide this service automatically. Doing this on systems that do not support symbolic links creates a copy of the target man page for each alias.

## `--with-manpage-tbl`

Tell the configure script that you wish to preprocess the man pages by running them through tbl to generate tables understandable by nroff.

## `--with-menu-libname=NAME`

Override the basename of the menu library (default: "menu")

## `--with-mmask-t=TYPE`

Override type of `mmask_t`, which stores the mouse mask. Prior to ncurses 5.5, this was always unsigned long, but with ncurses 5.5, it may be unsigned. Use this option if you need to preserve compatibility with 64-bit executables.

## `--with-normal`

Generate normal (i.e., static) libraries (default).

Note: on Linux, the configure script will attempt to use the GPM library via the `dlsym()` function call. Use `--without-dlsym` to disable this feature, or `--without-gpm`, depending on whether you wish to use GPM.

## `--with-ospeed=TYPE`

Override type of ospeed variable, which is part of the termcap compatibility interface. In termcap, this is a 'short', which works for a wide range of baudrates because ospeed is not the actual speed but the encoded value, e.g., B9600 would be a small number such as 13. However the encoding scheme originally allowed for values "only" up to 38400bd. A newer set of definitions past 38400bd is not encoded as compactly, and is not guaranteed to fit into a short (see the function `cfgetospeed()`, which returns a `speed_t` for this reason). In practice, applications that required knowledge of the ospeed variable, i.e., those using termcap, do not use the higher speeds. Your application (or system, in general) may or may not.

## `--with-panel-libname=NAME`

Override the basename of the panel library (default: "panel")

## `--with-pc-suffix=SUFFIX`

If ".pc" files are installed (see `--enable-pc-files`), optionally add a suffix to the files and corresponding package names to separate unusual configurations. If no option value is given (or if it is "none"), no suffix is added.

## `--with-pcre2=[XXX]`

Add PCRE2 (Perl-compatible regular expressions v2) to the build if it is available and the user requests it. Assume the application will otherwise use the POSIX interface.

If an option value is given, try that pkgconfig name first.

This is useful for MinGW builds because the usual POSIX interface is not supplied by the development environment, while ncurses' form library uses a regular expression feature for one of the field types.

## `--with-pkg-config[=CMD]`

Check for pkg-config, optionally specifying its pathname.

## `--with-pkg-config-libdir[=DIR]`

If pkg-config was found, override the automatic check for its library path. The optional DIR value can be

"auto", automatically use pkg-config's library directory, or

"libdir", use a ${libdir}/pkgconfig (based on the configuration), or

a directory path, i.e., beginning with "/".

The configure script allows only a single directory, because that is used as the directory in which to install ".pc" files.

The automatic check for the library path prefers the first directory which currently exists. If none of the directories listed by pkg-config exist, the check prefers a pkgconfig directory under the "libdir" set by the configure script (which may not be the system default), or if pkg-config lists nothing suitable, the first one which is listed by pkg-config is used.

## `--with-profile`

Generate profile-libraries These are named by adding "_p" to the root, e.g., `libncurses_p.a`

## `--with-pthread`

Link with POSIX threads, set `--enable-reentrant`. The `use_window()` and `use_screen()` functions will use mutex's, allowing rudimentary support for multithreaded applications.

## `--with-rcs-ids`

Compile-in RCS identifiers. Most of the C files have an identifier.

## `--with-rel-version=NUM`

Override the release version, which may be used in shared library filenames. This consists of a major and minor version number separated by ".". Normally the major version number is the same as the ABI version; some ports have special requirements for compatibility.

## `--with-shared`

Generate shared-libraries. The names given depend on the system for which you are building, typically using a ".so" suffix, along with symbolic links that refer to the release version.

NOTE: Unless you override the configure script by setting the `$CFLAGS` environment variable, these will not be built with the -g debugging option.

NOTE: For some configurations, e.g., installing a new version of ncurses shared libraries on a machine which already has ncurses shared libraries, you may encounter problems with the linker. For example, it may prevent you from running  the build tree's copy of tic (for installing the terminfo database) because it loads the system's copy of the ncurses shared libraries.

In that case, using the misc/shlib script may be helpful, since it sets `$LD_LIBRARY_PATH` to point to the build tree, e.g.,

```sh
./misc/shlib make install
```

Alternatively, for most platforms, the linker accepts a list of directories which will be searched for libraries at run-time. The configure script allows you to modify this list using the `RPATH_LIST` environment variable. It is a colon-separated list of directories (default: the "libdir" set via the configure script). If you set that to put "../lib" first in the list, the linker will look first at the build-directory, and avoid conflict with libraries already installed. One drawback to this approach is that libraries can be accidentally searched in any "../lib" directory.

NOTE: If you use the `--with-ada-sharedlib` option, you should also set this option, to ensure that C-language modules needed for the Ada binding use appropriate compiler options.

## `--with-shlib-version=XXX`

Specify whether to use the release or ABI version for shared libraries. This is normally chosen automatically based on the type of system which you are building on. We use it for testing the configure script.

## `--with-strip-program=XXX`

When stripping executables during install, use the specified program rather than "strip".

## `--with-sysmouse`

use FreeBSD sysmouse interface provide mouse support on the console.

## `--with-system-type=XXX`

For testing, override the derived host system-type which is used to decide things such as the linker commands used to build shared libraries. This is normally chosen automatically based on the type of system which you are building on. We use it for testing the configure script.

## `--with-terminfo-dirs=XXX`

Specify a search-list of terminfo directories which will be compiled into the ncurses library (default: DATADIR/terminfo)

This is a colon-separated list, like the `$TERMINFO_DIRS` environment variable.

## `--with-termlib[=XXX]`

When building the ncurses library, organize this as two parts: the curses library (libncurses) and the low-level terminfo library (libtinfo). This is done to accommodate applications that use only the latter. The terminfo library is about half the size of the total.

If an option value is given, that overrides the name of the terminfo library. For instance, if the [wide-character version](../../../glossary/wide-character-library.md) is built, the terminfo library would be named libtinfow. But the libtinfow interface is upward compatible from libtinfo, so it would be possible to overlay libtinfo.so with a "wide" version of libtinfow.so by renaming it with this option.

## `--with-termpath=XXX`

Specify a search-list of termcap files which will be compiled into the ncurses library (default: /etc/termcap:/usr/share/misc/termcap)

## `--with-tic-path[=XXX]`

Use this option to override the automatic detection of tic in your `$PATH` when building fallbacks (see "`--with-fallbacks`").

## `--with-ticlib[=XXX]`

When building the ncurses library, build a separate library for the modules that are used only by the utility programs. Normally those would be bundled with the termlib or ncurses libraries.

If an option value is given, that overrides the name of the tic library. As in termlib, there is no ABI difference between the "wide" libticw.so and libtic.so

NOTE: Overriding the name of the tic library may be useful if you are also using the `--with-termlib` option to rename libtinfo. If you are not doing that, renaming the tic library can result in conflicting library dependencies for tic and other programs built with the tic library.

## `--with-tparm-arg[=XXX]`

Override the type used for `tparm()` arguments, which normally is a "long". However the function must assume that its arguments can hold a pointer to char's which is not always workable for 64-bit platforms. A better choice would be `intptr_t`, which was not available at the time tparm's interface was defined.

If the option is not given, the default depends on the ABI: `intptr_t` for ABI 6, the default ABI, and `long` for ABI 5.

## `--with-trace`

Configure the `trace()` function as part of the all models of the ncurses library. Normally it is part of the debug (`libncurses_g`) library only.

## `--with-valgrind`

For testing, compile with debug option. This also sets the `--disable-leaks` option.

## `--with-versioned-syms[=XXX]`

The Solaris, GNU and reportedly some other linkers (ld) accept a "`--version-script`" option which tells the linker to annotate the resulting objects with version identifiers.

Use "objdump -T" on a library to see the annotations.

The configure script attempts to automatically apply a suitable ".map" file to provide this information for Linux. Solaris mapfiles differ:

- comments are not accepted
- wildcards are not accepted, except for a special case of "_*".
- each symbol listed in the map file must exist in the library

The Solaris limitations conflict with the development goal of providing a small set of ".map" files as examples, which cover the most common configurations. Because that coverage is done by merging together several builds, some symbols will be listed in the ".map" files that do not happen to be present in one configuration or another.

The sample ".map" (and ".sym") files were generated using a set of scripts which built several configurations for each release version, checking to see which of the "_nc_" symbols can be made local.

These sample ".map" files will not cover all possible combinations. In some cases, e.g., when using the `--enable-weak-symbols` option, you may prefer to use a different ".map" file by setting this option's value.

## `--with-wrap-prefix=XXX`

When using the `--enable-reentrant` option, ncurses redefines variables that would be global in curses, e.g., LINES, as a macro that calls a "wrapping" function which fetches the data from the current SCREEN structure. Normally that function is named by prepending "_nc_" to the variable's name. The function is technically private (since portable applications would not refer directly to it). But according to one line of reasoning, it is not the same type of "private" as functions which applications should not call even via a macro. This configure option lets you choose the prefix for these wrapped variables.

## `--with-x11-rgb=FILE`

Provide a pathname for the X11 rgb file, used by the picsmap program. This overrides a configure check which usually works, but is needed due to the lack of standardization for X11's files.

## `--with-xterm-kbs=XXX`

Configure xterm's terminfo entries to use either BS (^H, i.e., ASCII backspace) or DEL (^?, or 127). XXX can be BS (or bs, 8) or DEL (or del, 127). If XXX is "auto", the configure script chooses BS or DEL according to platform defaults.

During installation, the makefile and scripts modifies the "xterm+kbs" terminfo entry to use this setting.
