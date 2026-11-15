# Saving and copying the screen

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

## Screen dumping

While writing games, it sometimes becomes necessary to store the state of the screen and restore it to the same state later. The function `scr_dump()` dumps the screen contents to the file named in its argument. `scr_restore()` reads them back into the virtual screen, and the next `doupdate()` (or `refresh()`) puts them on the terminal. These two simple functions can be used effectively to maintain a fast-moving game with changing scenes.

## Window dumping

To store and restore windows, use `putwin()` and `getwin()`. `putwin()` writes a window's present state to a file, and `getwin()` later reads it back into a new window.

The function `copywin()` copies a rectangle of one window onto another. It takes the source and destination windows, the upper left corner of the rectangle in the source, and the corners of the rectangle in the destination. Its last parameter says whether to overwrite the destination or just overlay the contents onto it. If this argument is true, the copying is non-destructive: blanks in the source leave the destination's characters as they are, as `overlay()` does.
