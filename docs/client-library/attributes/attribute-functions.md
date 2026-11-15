# Attribute functions

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

The functions `attron()`, `attroff()` and `attrset()`, and their sister functions such as `attr_get()`, can be used to switch attributes on and off, get attributes and produce a colorful display.

## The attributes

The functions `attron()` and `attroff()` take a bit-mask of attributes and switch them on or off, respectively. The following video attributes, which are defined in `curses.h`, can be passed to these functions.

```text
A_NORMAL        Normal display (no highlight)
A_STANDOUT      Best highlighting mode of the terminal.
A_UNDERLINE     Underlining
A_REVERSE       Reverse video
A_BLINK         Blinking
A_DIM           Half bright
A_BOLD          Extra bright or bold
A_PROTECT       Protected mode
A_INVIS         Invisible or blank mode
A_ALTCHARSET    Alternate character set
A_CHARTEXT      Bit-mask to extract a character
COLOR_PAIR(n)   Color-pair number n
```

The last one is the most colorful one :-) [Colors](colors.md) explains it.

We can OR (`|`) any number of the above attributes to get a combined effect. If you wanted reverse video with blinking characters, you can use

```c
attron(A_REVERSE | A_BLINK);
```

## `attron()` vs `attrset()`

Then what is the difference between `attron()` and `attrset()`? `attrset()` sets the attributes of the [window](../../glossary/window.md), whereas `attron()` just switches on the attribute given to it. So `attrset()` fully overrides whatever attributes the window previously had and sets it to the new attributes. Similarly, `attroff()` just switches off the attributes given to it as an argument. This gives us the flexibility of managing attributes easily. But if you use them carelessly, you may lose track of what attributes the window has and garble the display. This is especially true while managing menus with colors and highlighting. So decide on a consistent policy and stick to it. You can always use `standend()`, which is equivalent to `attrset(A_NORMAL)`, which turns off all attributes and brings you to normal mode.

## `attr_get()`

The function `attr_get()` gets the window's current attributes and [color pair](../../glossary/color-pair.md): the ones it will give the next characters written to it. Though we might not use this as often as the above functions, it is useful when you need to change the attributes for a while and then put back what was there. It reports nothing about characters already on the screen; to read those, use `inch()`.

## The `attr_` functions

There is a series of functions like `attr_set()`, `attr_on()`, etc. These are similar to the above functions, except that they take parameters of type `attr_t`.

## The `wattr` functions

For each of the above functions, we have a corresponding function with 'w' which operates on a particular window. The above functions operate on [`stdscr`](../../glossary/stdscr.md).
