# For system integrators

## Configuration and installation

On platforms where ncurses is assumed to be installed in `/usr/lib`, the configure script uses `/usr` as the default prefix. These are the system types it matches: Linux, GNU/kFreeBSD and other `k*bsd*-gnu` systems, FreeBSD, OpenBSD, MirBSD, Cygwin, MSYS and MinGW.

For other platforms, including NetBSD, the default is `/usr/local`. See the discussion of the [`--disable-overwrite`](configure-options/disable.md#--disable-overwrite) option.

The location of the terminfo database is set indirectly by the `--datadir` configure option. For example, a datadir of `/usr/share` puts it in `/usr/share/terminfo`. You may want to override this if you are installing ncurses libraries in nonstandard locations, but wish to share the terminfo database.

Normally the ncurses library is configured in a pure-terminfo mode, that is, with the `--disable-termcap` option. This makes the ncurses library smaller and faster. The ncurses library includes a [termcap](../../glossary/termcap.md) emulation that queries the terminfo database, so even applications that use raw termcap to query terminal characteristics will win (provided you recompile and relink them).

If you must configure with termcap fallback enabled, you may also wish to use the [`--enable-getcap`](configure-options/enable.md#--enable-getcap) option. This speeds up termcap-based startups, at the expense of not allowing personal termcap entries to reference the terminfo tree. See the comments in `ncurses/tinfo/read_termcap.c` for further details.

If you have `$TERMCAP` set, ncurses uses that value to locate termcap data. In particular, running from xterm sets `$TERMCAP` to the contents of the xterm's termcap entry. If ncurses sees that, it won't examine `/etc/termcap`.

## Keyboard mapping

The terminfo file assumes that Shift-Tab generates `\E[Z` (the ECMA-48 reverse-tabulation sequence) rather than `^I`. Here are the `loadkeys -d` mappings that set this up:

```text
keycode  15 = Tab             Tab
        alt     keycode  15 = Meta_Tab
        shift   keycode  15 = F26
string F26 ="\033[Z"
```

## Naming the console terminal

In various systems there has been a practice of designating the system console driver type as `console`. Please don't do this. It complicates people's lives, because it can mean that several different terminfo entries from different operating systems all logically want to be called `console`.

Please pick a name unique to your console driver and set that up in the `/etc/inittab` table or local equivalent. Send the entry to the terminfo maintainer (listed in the `misc/terminfo.src` file) to be included in the terminfo file, if it isn't already there. See the term(7) manual page included with this distribution for more on conventions for choosing type names.

Here are some recommended primary console names:

| Name      | Console              |
| --------- | -------------------- |
| `linux`   | Linux console driver |
| `freebsd` | FreeBSD              |
| `netbsd`  | NetBSD               |
| `bsdos`   | BSD/OS               |

Of these, only `linux` is an entry in this distribution's terminfo database. The database describes the others' consoles as `cons25` (FreeBSD), `wsvt25` (NetBSD) and `bsdos-pc` (BSD/OS).

If you are responsible for integrating ncurses for one of these distributions, please either use the recommended name or get back to us explaining why you don't want to, so we can work out nomenclature that will make users' lives easier rather than harder.
