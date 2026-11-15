# Glossary

Terms that the guides and manual pages use with a meaning specific to curses, defined once here. A guide links a term where it first uses it.

**Inclusion bar:** add a term when a C programmer who is new to curses, or a new contributor, would not reliably understand it from general programming practice, and when more than one guide uses it. That covers curses vocabulary (such as [stdscr](stdscr.md) or [pad](pad.md)), words that mean something narrower here than in everyday use (such as [window](window.md) or [attribute](attribute.md)), terminal concepts and the standards and lineages the man pages compare against. Function names stay in the manual pages, and words that are clear in context stay out. Each term is its own shard in `docs/glossary/`, with the term as its heading.

## Windows and the screen

- [window](window.md)
- [stdscr](stdscr.md)
- [subwindow](subwindow.md)
- [pad](pad.md)
- [panel](panel.md)
- [virtual screen](virtual-screen.md)

## Characters and rendering

- [chtype](chtype.md)
- [complex character](complex-character.md)
- [wide-character library](wide-character-library.md)
- [attribute](attribute.md)
- [color pair](color-pair.md)
- [alternate character set](alternate-character-set.md)

## Input

- [cbreak mode](cbreak-mode.md)
- [keypad mode](keypad-mode.md)

## Terminals

- [terminal type](terminal-type.md)
- [terminfo](terminfo.md)
- [terminal capability](terminal-capability.md)
- [termcap](termcap.md)
- [escape sequence](escape-sequence.md)

## Standards and history

- [X/Open Curses](x-open-curses.md)
- [SVr4](svr4.md)
- [BSD curses](bsd-curses.md)
