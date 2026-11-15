# Building with a cross-compiler

ncurses can be built with a cross-compiler. Some parts must be built with the host's compiler, because they are programs used during the build (for example, `ncurses/make_hash` and `ncurses/make_keys`) that generate tables compiled into the ncurses library. The essential thing to do is set the `BUILD_CC` environment variable to your host's compiler, and run the configure script configuring for the cross-compiler.

The configure options [`--with-build-cc`](configure-options/with-a-l.md#--with-build-ccxxx) and its companions make this simpler. Since `make_hash` and `make_keys` use only ANSI C features, it's normally not necessary to give the other options such as `--with-build-libs`, but they are provided for completeness.

All of the generated source files that are part of ncurses are made if you use this command:

```sh
make sources
```

This is useful in porting to an environment that has little support for the tools used to generate the sources, such as sed, awk and the Bourne shell.

When ncurses has been successfully cross-compiled, you may want to use `make install` (with a suitable target directory) to construct an install tree. In this case (as with the `--with-fallbacks` option), ncurses uses the development platform's tic to do the `make install.data` portion.

The system's tic program is used to install the terminal database, even for cross-compiles. For best results, the tic program should be from the most current version of ncurses.

> **Note:** The system's tic program may use a different terminfo database format than the target system. For instance, as described in term(5), the conventional terminfo layout uses a directory hierarchy with one-letter names, while some platforms use two-letter names to work with case-insensitive filesystems. The configure script searches for a tic program using the `AC_CHECK_TOOL` macro, which prefers programs that have the canonical host prefix in their name. You can use this to provide a cross-compiler support utility tic. Otherwise, you can override the configure script's choice using [`--with-tic-path`](configure-options/with-m-z.md#--with-tic-pathxxx).
