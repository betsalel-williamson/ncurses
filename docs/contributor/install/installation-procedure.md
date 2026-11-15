# Installation procedure

## Step 1: choose where to install

First, decide whether you want ncurses to replace your existing library (in which case you'll need super-user privileges) or be installed in parallel with it.

The `--prefix` option to configure changes the root directory for installing ncurses. The default is normally in subdirectories of `/usr/local`, except for systems where ncurses is normally installed as a system library (see [For system integrators](system-integrators.md)). Use `--prefix=/usr` to replace your default curses distribution.

The package gets installed beneath the `--prefix` directory as follows:

| Directory                 | Contents                                                                         |
| ------------------------- | -------------------------------------------------------------------------------- |
| `$(prefix)/bin`           | tic, infocmp, captoinfo, infotocap, tset, reset, clear, tput, toe, tabs           |
| `$(prefix)/lib`           | `libncurses*.*`, `libcurses.a`                                                   |
| `$(prefix)/share/terminfo` | compiled terminal descriptions                                                  |
| `$(prefix)/include`       | C header files                                                                   |
| `$(prefix)/man`           | the manual pages                                                                 |

The configure script chooses the default prefix from the system type alone. It doesn't look for an earlier installation of ncurses.

Don't use a command such as this to change the prefix after configuration, because the prefix value is used for some absolute pathnames such as `TERMINFO`:

```sh
make install prefix=XXX
```

Instead, do this:

```sh
make install DESTDIR=XXX
```

See also the discussion of [`--with-install-prefix`](configure-options/with-a-l.md#--with-install-prefixxxx).

## Step 2: run configure

Type `./configure` in the top-level directory of the distribution to configure ncurses for your operating system and create the makefiles. Besides `--prefix`, various configuration options are available to customize the installation. Use `./configure --help` to list them, and see [Configure options](configure-options/index.md) for what each one does.

If your operating system isn't supported, read the [porting hints](../hackguide/porting-hints.md) in the hacker's guide for how to create a configuration for your system.

The configure script generates makefile rules for one or more object models and their associated libraries:

| Library             | Model                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| `libncurses.a`      | normal                                                                        |
| `libcurses.a`       | normal, a link to `libncurses.a`. It's left out when overwrite is disabled.   |
| `libncurses.so`     | shared                                                                        |
| `libncurses_g.a`    | debug                                                                         |
| `libncurses_p.a`    | profile                                                                       |
| `libncurses.la`     | libtool                                                                       |

With the wide-character code, a "w" is appended to the library names (for example, `libncursesw.a`), and the libraries support wide characters, for example through a UTF-8 locale. Since ncurses 6.5 this is the default, and `--disable-widec` builds the 8-bit libraries without the "w". The header files are compatible with both configurations, because the wide-character features are provided by `#ifdef`s in the headers. The wide-character library interfaces aren't binary-compatible with the 8-bit version. Building and running the wide-character code relies on a fairly recent implementation of libiconv. We have built this configuration on various systems using libiconv, sometimes requiring libutf8.

If you configure using the `--with-pthread` option, a "t" is appended to the library names (for example, `libncursest.a` or `libncursestw.a`).

If you don't specify any models, the normal and debug libraries are configured. Typing `./configure` with no arguments is equivalent to this:

```sh
./configure --with-normal --with-debug
```

Typing this makes the shared libraries the default:

```sh
./configure --with-shared
```

It's equivalent to this:

```sh
./configure --with-shared --with-normal --with-debug
```

Whether the `libcurses` link and the top-level headers are installed depends on the prefix. Overwrite is on by default only when the prefix is `/usr`, and `--enable-overwrite` or `--disable-overwrite` sets it either way. See [`--disable-overwrite`](configure-options/disable.md#--disable-overwrite).

If you want only shared libraries, type this:

```sh
./configure --with-shared --without-normal --without-debug
```

Rules for generating shared libraries are highly dependent upon the choice of host system and compiler. We've been testing shared libraries on several systems, but more work needs to be done to make shared libraries work on other systems.

If you have libtool installed, you can type this to generate the appropriate static and shared libraries for your platform using libtool:

```sh
./configure --with-libtool
```

You can make curses and terminfo fall back to an existing file of termcap definitions by configuring with `--enable-termcap`. If you do this, the library searches `/etc/termcap` before the terminfo database, and also interprets the contents of the `$TERM` environment variable. See [BSD conversion notes](bsd-conversion.md).

## Step 3: build

Type `make`. Ignore any warnings; no error messages should be produced. This compiles the ncurses library, the terminfo compiler tic(1), the captoinfo(1), infotocap(1), infocmp(1), toe(1), clear(1), tabs(1), tset(1), reset(1) and tput(1) programs (see their manual pages for what they do), some test programs, and the panels, menus and forms libraries.

## Step 4: test

Run `ncurses` and several other test programs in the `test` directory to verify that ncurses works correctly before doing an install that may overwrite system files. Read the file `test/README` for details on the test programs.

> **Note:** You must have installed the terminfo database, or set the environment variable `$TERMINFO` to point to a SVr4-compatible terminfo database, before running the test programs. Not all vendors' terminfo databases are SVr4-compatible, but most seem to be.

It's possible to configure ncurses to use other terminfo database formats. A few are provided as examples in the include directory (see [`--with-caps`](configure-options/with-a-l.md#--with-capsxxx)).

If you run the test programs without installing terminfo, ncurses may read the termcap file and cache that in `$HOME/.terminfo`, which will thereafter be used instead of the terminfo database. See the comments on [`--enable-getcap-cache`](configure-options/enable.md#--enable-getcap-cache) to see why this is a bad thing.

The `ncurses` program is designed specifically to test the ncurses library. You can use it to verify that the screen highlights work correctly, that cursor addressing and window scrolling work, and so on.

## Step 5: install

Once you've tested, you can type `make install` to install the libraries, the programs, the terminfo database and the manual pages. Alternatively, you can type `make install` in each directory you want to install. In the top-level directory, you can do a partial install using these commands:

| Command                 | Installs                                                                       |
| ----------------------- | ------------------------------------------------------------------------------ |
| `make install.progs`    | tic, infocmp, and the other programs                                           |
| `make install.includes` | the headers                                                                    |
| `make install.libs`     | the libraries (and the headers)                                                |
| `make install.data`     | the terminfo data. tic must be installed before the terminfo data can be compiled. |
| `make install.man`      | the manual pages                                                               |

> **Caution:** `make install.data` run as root will destroy any existing terminfo database. If you have any custom or unusual entries, save them before you install ncurses.

The terminfo(5) manual page must be preprocessed with tbl(1) before being formatted by nroff(1). Modern man(1) implementations tend to do this by default, but you may want to look at your version's manual page to be sure. You may also install the manual pages after preprocessing them with tbl(1) by specifying the configure option [`--with-manpage-tbl`](configure-options/with-m-z.md#--with-manpage-tbl).

If the system already has a curses library that you need to keep using, you'll need to distinguish between it and ncurses. See the discussion of [`--disable-overwrite`](configure-options/disable.md#--disable-overwrite). If ncurses is installed outside the standard directories (`/usr/include` and `/usr/lib`), then all your users will need to use the `-I` option to compile programs and `-L` to link them.

If you have another curses installed on your system and you accidentally compile using its `curses.h`, you'll end up with a large number of undefined symbols at link time.

If you don't have root access, change directory to the `progs` subdirectory and run the `capconvert` script. This script deduces various things about your environment and uses them to build you a private terminfo tree, so you can use ncurses applications.

If more than one user at your site does this, the space for the duplicate trees is wasted. Try to get your site administrators to install a system-wide terminfo tree instead.

See [BSD conversion notes](bsd-conversion.md) for a few more details.

## Step 6: C++ bindings

The `c++` directory has C++ classes that are built on top of ncurses and panels. You must have a C++ compiler (and its libraries) installed before you can compile and run the demo.

Use [`--without-cxx-binding`](configure-options/without.md#--without-cxx-binding) to tell configure not to build the C++ bindings and demo.

If you don't have C++, you must use the [`--without-cxx`](configure-options/without.md#--without-cxx) option to tell the configure script not to try to determine the type of `bool` that C++ may support. If you use this option, be advised that you may not be able to compile (or run) ncurses applications with C++.
