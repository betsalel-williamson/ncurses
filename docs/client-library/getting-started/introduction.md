# What curses is

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

These guides are an introduction to programming with `curses`. They are not an exhaustive reference for the curses Application Programming Interface (API); that role is filled by the `curses` manual pages, starting with `ncurses(3X)`. Rather, they are intended to help C programmers ease into using the package. No prior experience with `curses` is assumed.

## Terminals and escape sequences

In the olden days of teletype terminals, terminals were away from computers and were connected to them through serial cables. The terminals could be configured by sending a series of bytes. All the capabilities of terminals (such as moving the cursor to a new location, erasing part of the screen, scrolling the screen, changing modes) could be accessed through these series of bytes. These control sequences are usually called [escape sequences](../../glossary/escape-sequence.md), because they start with an escape (0x1B) character. Even today, with proper emulation, we can send escape sequences to the emulator and achieve the same effect in a terminal window.

Suppose you wanted to print a line in color. Try typing this in your terminal:

```sh
printf '\033[0;31;40mIn Color\n'
```

`\033` is the escape character. All the others are normal printable characters. You should see the string "In Color" in red. It stays that way; to revert to the original mode, type this:

```sh
printf '\033[0;37;40m\n'
```

What do these magic characters mean? They might even be different for different terminals. So the designers of UNIX invented a mechanism named `termcap`: a file that lists all the [capabilities](../../glossary/terminal-capability.md) of a particular terminal, along with the escape sequences needed to achieve a particular effect. In later years, it was replaced by `terminfo`, a database format that can describe the capabilities of thousands of different terminals. Application programs query the [terminfo](../../glossary/terminfo.md) database to obtain the control characters to send to a terminal or terminal emulator.

## What curses does

If every application had to query terminfo and send the control characters itself, it would soon become difficult to manage the complexity. That gave birth to `curses`, whose name is a pun on "cursor optimization".

The `curses` package is a subroutine library for terminal-independent screen-painting and input-event handling. It presents a high level screen model to the programmer, hiding differences between [terminal types](../../glossary/terminal-type.md) and doing automatic optimization of output to change one screen full of text into another. It provides functions to move the cursor, create [windows](../../glossary/window.md), produce colors, use the mouse, and so on, so application programs need not worry about the underlying terminal capabilities.

The `curses` API has the advantage of (a) back-portability to character-cell terminals, and (b) simplicity. For an application that does not require bit-mapped graphics and multiple fonts, an interface implementation using `curses` will typically be a great deal simpler and less expensive than one using a graphical toolkit.

## What ncurses is

`ncurses` is a free implementation of the System V Release 4.0 ([SVr4](../../glossary/svr4.md)) `curses` API, with some clearly marked extensions. In the remainder of these guides, the terms curses and ncurses are used interchangeably.

`ncurses` does more than wrap terminal capabilities: it gives a robust framework to create text-mode user interfaces. Its sister libraries extend the basic library, and usually come along with it:

- The [forms library](../forms/index.md) creates easy-to-use data entry and display windows.
- The [menus library](../menus/index.md) gives the user an easy command selection option.
- The [panels library](../panels/index.md) deals with overlapping and stacked windows.

With them you can create applications that contain multiple windows, menus, [panels](../../glossary/panel.md) and forms. Windows can be managed independently, can scroll, and can even be hidden.

If you are already an experienced `curses` programmer, read the sections of *Writing Programs with NCURSES* on [Mouse Interfacing](https://invisible-island.net/ncurses/ncurses-intro.html#mouse), [Debugging](https://invisible-island.net/ncurses/ncurses-intro.html#debugging), [Compatibility with Older Versions](https://invisible-island.net/ncurses/ncurses-intro.html#compat), and [Hints, Tips, and Tricks](https://invisible-island.net/ncurses/ncurses-intro.html#hints). They will bring you up to speed on the special features and quirks of the `ncurses` implementation. If you are not so experienced, keep reading.
