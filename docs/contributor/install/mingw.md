# Building with MinGW

> Adapted from `README.MinGW`, by Juergen Pfeifer.

The MinGW port is a work in progress, but it's in a state where you can see it works, at least on the Windows console.

## Build environment

Install MSYS2, so that you have a shell environment that can run scripts such as configure. You can get it from <https://www.msys2.org/>, or the individual packages from <https://sourceforge.net/projects/msys2/files/>.

You may also use a hosted MinGW cross-compile toolchain, for example on Ubuntu or Arch Linux, to build the libraries and tools.

To build ncurses for native Windows with support for the Windows 10 Virtual Terminal and PseudoConsole, install at least version 8.0 of the `mingw-w64-x86_64-headers` package, which appears to support the required Windows SDK level. Some Linux distributions are a bit behind with the MinGW header versions, and you may not be able to build the libraries for current Windows 10 with their toolchains. Although it's a bit slow, MSYS2 on 64-bit Windows 10 is the authoritative build environment for the MinGW version of ncurses.

Using MinGW is a pragmatic decision: it's the easiest way to port this heavily UNIX-based source base to native Windows. The goal is to provide the headers, libraries and DLLs for use with the more common development environments on Windows, mainly Microsoft Visual Studio.

## The console driver and TERM

The `TERM` environment variable must be set to activate the Windows console driver. The driver checks whether `TERM` is set to `#win32con` (explicit use), or is unset or empty (implicit use).

Beginning with build 17763 (the fall 2018 update), Windows 10 supports ANSI escape sequences (Virtual Terminal support). If ncurses detects this or a later Windows 10 version, the meaning of the implicit setting (`TERM` unset or empty) changes. `TERM` is then assumed to be `ms-terminal`, and ncurses uses the regular terminfo-based driver, acting like a terminal on UNIX-like systems.

This code requires Windows NT 6.0 or later: Windows Vista or later on the client, and Windows Server 2008 or later on the server.

On Windows 10 build 17763 or later, any program that spawns a subprocess running an ncurses program should use the PseudoConsole support, which provides what UNIX calls a pty. Using the [CreatePseudoConsole API](https://docs.microsoft.com/en-us/windows/console/createpseudoconsole) in the calling process guarantees that the called ncurses program has the console its implementation requires, even if the calling program isn't a console program (for example, MSYS2's own mintty terminal emulator).

## Configuring

In the current MSYS2 and MinGW setup, building MinGW shared libraries with libtool seems to be broken, so don't use libtool.

To build a modern but still small ncurses that provides hooks for interop, use these options:

```text
--without-libtool
--disable-home-terminfo
--enable-database
--disable-termcap
--enable-sp-funcs
--enable-term-driver
--enable-interop
```

This is the configure command the port's author uses, with the MinGW root installed at `/mingw64`:

```sh
./configure \
	--prefix=/mingw64 \
	--without-cxx \
	--without-ada \
	--enable-warnings \
	--enable-assertions \
	--enable-exp-win32 \
	--enable-ext-funcs \
	--disable-home-terminfo \
	--disable-echo \
	--disable-getcap \
	--disable-hard-tabs \
	--disable-leaks \
	--disable-macros \
	--disable-overwrite \
	--enable-opaque-curses \
	--enable-opaque-panel \
	--enable-opaque-menu \
	--enable-opaque-form \
	--enable-database \
	--enable-sp-funcs \
	--enable-term-driver \
	--enable-interop \
	--disable-termcap \
	--with-progs \
	--without-libtool \
	--enable-pc-files \
	--with-shared \
	--with-normal \
	--without-debug \
	--with-fallbacks=ms-terminal \
	--without-manpages
```

You must also set this environment variable, so that terminfo paths are parsed correctly:

```sh
export PATH_SEPARATOR=";"
```

Terminfo paths are always separated by a semicolon, even when running under MSYS2.

All of these options, like the whole Windows support, are experimental.
