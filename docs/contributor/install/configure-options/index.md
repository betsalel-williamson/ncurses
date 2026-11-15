# Configure options

Type this to see a short list of the configure script's options:

```sh
./configure --help
```

The `--help` option and several others are common to every configure script that autoconf generates. Those are all listed before this line in the output:

```text
--enable and --with options recognized:
```

The other options are specific to ncurses. These pages list them in alphabetical order, grouped by prefix.

Many defaults depend on the ABI version. ABI 6 is the default, and it turns on wide characters, extended colors, the extended mouse encoding, `const` prototypes, the `SCREEN`-pointer functions and the interop bindings, among others. Each option below says when its default differs by ABI.

- [Options that turn features off](disable.md) (`--disable-*`)
- [Options that turn features on](enable.md) (`--enable-*`)
- [Options that set or add, A to L](with-a-l.md) (`--with-*`)
- [Options that set or add, M to Z](with-m-z.md) (`--with-*`)
- [Options that leave parts out](without.md) (`--without-*`)
