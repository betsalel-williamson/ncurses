# Options that turn features on

This page lists the `--enable-*` options.

## `--enable-assertions`

For testing, compile-in assertion code. This is used only for a few places where ncurses cannot easily recover by returning an error code.

## `--enable-broken_linker`

A few platforms have what we consider a broken linker: it cannot link objects from an archive solely by referring to data objects in those files, but requires a function reference. This configure option changes several data references to functions to work around this problem.

NOTE: With ncurses 5.1, this may not be necessary, since we are told that some linkers interpret uninitialized global data as a different type of reference which behaves as described above. We have explicitly initialized all of the global data to work around the problem.

## `--enable-bsdpad`

Recognize BSD-style prefix padding. Some programs written using the BSD curses API use tputs("50") to implement delays.

## `--enable-check-size`

Compile-in feature to detect screensize for terminals which do not advertise their screensize, e.g., serial terminals.

## `--enable-colorfgbg`

Compile with experimental `$COLORFGBG` code. That environment variable is set by some terminal emulators as a hint to applications, by advertising the default foreground and background colors. During initialization, ncurses sets color pair 0 to match this.

## `--enable-conpty`

Experimental (in-progress development).

This also turns on `--enable-named-pipes` by default.

## `--enable-const`

The curses interface as documented in XSI is rather old, in fact including features that precede ANSI C. The prototypes generally do not make effective use of "const". When using stricter compilers (or gcc with appropriate warnings), you may see warnings about the mismatch between const and non-const data. We provide a configure option which changes the interfaces to use const - quieting these warnings and reflecting the actual use of the parameters more closely. The ncurses library uses the symbol `NCURSES_CONST` for these instances of const, and if you have asked for compiler warnings, will add gcc's const-qual warning. There will still be warnings due to subtle inconsistencies in the interface, but at a lower level.

NOTE: configuring ncurses with this option may detract from the portability of your applications by encouraging you to use const in places where the XSI curses interface would not allow them. Similar issues arise when porting to SVr4 curses, which uses const in even fewer places.

This option is on by default for ABI 6, the default ABI.

## `--enable-expanded`

For testing, generate functions for certain macros to make them visible as such to the debugger. See also the `--disable-macros` option.

## `--enable-exp-win32`

This is an obsolete option used for configuring the Windows 10 driver for MinGW.

## `--enable-ext-colors`

Extend the `cchar_t` structure to allow more than 16 colors to be encoded. This applies only to the wide-character (`--enable-widec`) configuration.

NOTE: using this option will make libraries which are not binary-compatible with libncursesw 5.4. None of the interfaces change, but applications which have an array of `cchar_t`'s must be recompiled.

This option is on by default for ABI 6, the default ABI.

## `--enable-ext-mouse`

Modify the encoding of mouse state to make room for a 5th mouse button. That allows one to use ncurses with a wheel mouse with xterm or similar X terminal emulators.

NOTE: using this option will make libraries which are not binary-compatible with libncursesw 5.4. None of the interfaces change, but applications which have mouse mask `mmask_t`'s must be recompiled.

This option is on by default for ABI 6, the default ABI.

## `--enable-ext-mouse2`

Modify the encoding of mouse state to make room for 11 mouse buttons. That allows one to use ncurses with extra buttons provided on some a wheel mice with xterm or similar X terminal emulators.

NOTE: using this option will make libraries which are not binary-compatible with ncursesw 6.x. None of the interfaces change, but applications which have mouse mask `mmask_t`'s must be recompiled.

## `--enable-ext-putwin`

Modify the file-format written by `putwin()` to use printable text rather than binary files, allowing `getwin()` to read screen dumps written by differently-configured ncurses libraries. The extended `getwin()` can still read binary screen dumps from the "same" configuration of ncurses. This does not change the ABI (the binary interface seen by calling applications).

This option is on by default for ABI 6, the default ABI.

## `--enable-fvisibility`

Use the gcc "-fvisibility=hidden" option to make symbols which are not explicitly exported, "hidden". Doing this may reduce the number of symbols exported in the C++ binding; it should have less effect on the C libraries when symbol-versioning is used.

## `--enable-getcap`

Use the 4.4BSD getcap code if available, or a bundled version of it to fetch termcap entries. Entries read in this way cannot use (make cross-references to) the terminfo tree, but it is faster than reading /etc/termcap.

If configured for one of the *BSD systems, this automatically uses the hashed database system produced using `cap_mkdb` or similar tools. In that case, there is no advantage in using the `--enable-getcap-cache` option.

See also the `--with-hashed-db` option.

## `--enable-getcap-cache`

Cache translated termcaps under the directory `$HOME`/.terminfo

NOTE: this sounds good - it makes ncurses run faster the second time. But look where the data comes from - an /etc/termcap containing lots of entries that are not up to date. If you configure with this option and forget to install the terminfo database before running an ncurses application, you will end up with a hidden terminfo database that generally does not support color and will miss some function keys.

## `--enable-hard-tabs`

Compile-in cursor-optimization code that uses hard-tabs. We would make this a standard feature except for the concern that the terminfo entry may not be accurate, or that your stty settings have disabled the use of tabs.

## `--enable-install-prefix`

Extend the `--with-install-prefix` feature to replace the prefix value with `$DESTDIR` rather than simply prepending `$DESTDIR` to install pathnames. This works with any "make" which supports AT&T style variable substitution.

## `--enable-interop`

Compile-in experimental interop bindings. These provide generic types for the form-library.

This option is on by default for ABI 6, the default ABI.

## `--enable-mixed-case`

Controls whether the filesystem on which the terminfo database resides supports mixed-case filenames (normal for UNIX, but not on other systems). If you do not specify this option, the configure script checks the current filesystem.

## `--enable-named-pipes`

Compile-in support for named pipes, used to connect to Windows 10 pseudo-console.

## `--enable-no-padding`

Compile-in support for the `$NCURSES_NO_PADDING` environment variable, which allows you to suppress the effect of non-mandatory padding in terminfo entries. This is the default, unless you have disabled the extended functions.

## `--enable-opaque-curses`, `--enable-opaque-form`, `--enable-opaque-menu`, `--enable-opaque-panel`

Define symbol in curses.h controlling whether some library structures are opaque, meaning that their members are accessible only via the documented API. The `--enable-opaque-curses` option may be overridden by the `--enable-reentrant` option.

Enabling opaque-curses enables opaque for the form, menu, and panel libraries. Use their corresponding options to disable the feature individually.

NOTE: beginning with ncurses 6.5 this option is enabled by default; older versions disable it by default.

## `--enable-pc-files`

If pkg-config is found (see `--with-pkg-config`), generate ".pc" files for each of the libraries, and install them in pkg-config's library directory.

## `--enable-pthreads-eintr`

add logic in threaded configuration to ensure that a read(2) system call can be interrupted for SIGWINCH.

## `--enable-reentrant`

Compile configuration which improves reentrant use of the library by reducing global and static variables. This option is also set if `--with-pthread` is used.

Enabling this option adds a "t" to the library names, except for the special case when `--enable-weak-symbols` is also used.

## `--enable-rgb-color`

Compile for extended direct-color support, which sets `NCURSES_RGB_COLORS` in the headers. This applies only when `--enable-ext-colors` is in effect. The default is off for ABI 5 and ABI 6, and on for ABI 7.

## `--enable-rpath`

Use rpath option when generating shared libraries, and (with some restrictions) when linking the corresponding programs. This originally (in 1997) applied mainly to systems using the GNU linker (read the man page).

More recently it is useful for systems that require special treatment shared libraries in "unusual" locations. The "system" libraries reside in directories which are on the loader's default search-path. While you may be able to use workarounds such as the `$LD_LIBRARY_PATH` environment variable, they do not work with setuid applications since the `LD_LIBRARY_PATH` variable would be unset in that situation.

This option does not apply to `--with-libtool`, since libtool makes extra assumptions about rpath.

## `--enable-safe-sprintf`

Compile with experimental safe-sprintf code. You may consider using this if you are building ncurses for a system that has neither `vsnprintf()` or `vsprintf()`. It is slow, however, and is used only on very old systems which lack `vsnprintf()`.

## `--enable-signed-char`

The term.h header declares a Booleans[] array typed "char". But it stores signed values there and "char" is not necessarily signed. Some packagers choose to alter the type of Booleans[] though this is not strictly compatible. This option allows one to implement this alteration without patching the source code.

## `--enable-sigwinch`

Compile support for ncurses' SIGWINCH handler. If your application has its own SIGWINCH handler, ncurses will not use its own. The ncurses handler causes `wgetch()` to return `KEY_RESIZE` when the screen-size changes. This option is the default, unless you have disabled the extended functions.

## `--enable-sp-funcs`

Compile-in support for extended functions which accept a SCREEN pointer, reducing the need for juggling the global SP value with `set_term()` and `delscreen()`.

This option is on by default for ABI 6, the default ABI.

## `--enable-stdnoreturn`

When enabled, check if the <stdnoreturn.h> header exists, and if found define `GCC_NORETURN` to _Noreturn rather than either the gcc-specific __attribute__((noreturn)) or an empty token. Doing this may require calling programs which use `GCC_NORETURN` in their own function definitions to be modified, because _Noreturn is only accepted as the first token in a declaration.

## `--enable-string-hacks`

Controls whether strlcat and strlcpy may be used. The same issue applies to OpenBSD's warnings about snprintf, noting that this function is weakly standardized.

Aside from stifling these warnings, there is no functional improvement in ncurses.

## `--enable-symlinks`

If your system supports symbolic links, make tic use symbolic links rather than hard links to save diskspace when writing aliases in the terminfo database.

## `--enable-tcap-names`

Compile-in support for user-definable terminal capabilities. Use the -x option of tic and infocmp to treat unrecognized terminal capabilities as user-defined strings. This option is the default, unless you have disabled the extended functions.

## `--enable-term-driver`

Enable terminal-driver. This is required for the MinGW port, by providing a way to substitute the low-level terminfo library with different terminal drivers.

## `--enable-termcap`

Compile in support for reading terminal descriptions from termcap if no match is found in the terminfo database. See also the `--enable-getcap` and `--enable-getcap-cache` options.

Termcap support requires run-time parsing rather than loading predigested data. If you have specified `--with-ticlib`, then you cannot have termcap support since run-time parsing is done in the tic library, which is intentionally not part of normal linkage dependencies.

## `--enable-warnings`

Turn on GCC compiler warnings. There should be only a few.

## `--enable-wattr-macros`

The 6.0 ABI adds support for extended colors and for extended mouse. The former is a noticeable problem when developers inadvertently compile using the ncurses6 header files and link with an ncurses5 library, because the wattr* macros use a new field in the WINDOW structure. These macros are used in several applications.

Since ncurses provides an actual function for each of these macros, suppressing them from the curses.h header allows the ncurses5 libraries to be used in most applications.

NOTE: The extended colors also are used in the `cchar_t` structure, but fewer applications use that.

NOTE: This workaround does not help with mismatches in the ncurses mouse version. The extended mouse feature uses one less fewer bit for each button, so that only the first button will work as expected with a mismatch between header and library. Again, most applications will work, since most use only the first button.

## `--enable-weak-symbols`

If the `--with-pthread` option is set, check if the compiler supports weak-symbols. If it does, then name the thread-capable library without the "t" (libncurses rather than libncursest), and provide for dynamically loading the pthreads entrypoints at runtime. This allows one to reduce the number of library files for ncurses.

## `--enable-wgetch-events`

Compile with experimental wgetch-events code. See ncurses/README.IZ

## `--enable-widec`

Compile with wide-character code. This makes a different version of the libraries (e.g., libncursesw.so), which stores characters as wide-characters.

NOTE: applications compiled with this configuration are not compatible with those built for 8-bit characters. You cannot simply make a symbolic link to equate libncurses.so with libncursesw.so.

NOTE: the Ada95 binding may be built against either version of the ncurses library, but you must decide which: the binding installs the same set of files for either version. Currently (2023/10/21) it does not use the extended features from the wide-character code, so it is probably better to not install the binding for that configuration.

NOTE: beginning with ncurses 6.5 this option is enabled by default; older versions disable it by default.

## `--enable-xmc-glitch`

Compile-in support experimental xmc (magic cookie) code.
