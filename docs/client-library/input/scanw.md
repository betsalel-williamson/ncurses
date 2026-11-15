# Formatted input with scanw

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

These functions are similar to `scanf()` with the added capability of getting the input from any location on the screen. They let you do `scanf()`-style multi-field parsing on [window](../../glossary/window.md) input.

## `scanw()` and `mvscanw()`

The usage of these functions is similar to that of `sscanf()`, where the line to be scanned is provided by the `wgetstr()` function. That is, these functions call the [`wgetstr()` function](characters-and-strings.md#the-getstr-class-of-functions) and use the resulting line for a scan.

## `wscanw()` and `mvwscanw()`

These are similar to the above two functions, except that they read from a window, which is supplied as one of the arguments to these functions.

## `vw_scanw()`

This function is similar to `vscanf()`. It can be used when a variable number of arguments are to be scanned.
