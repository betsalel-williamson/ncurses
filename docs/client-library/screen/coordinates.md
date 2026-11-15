# Cursor and window coordinates

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

## `getyx()`

The function `getyx()` finds out the present cursor coordinates. It fills the variables given to it with the y and x coordinates. Since `getyx()` is a macro, you don't have to pass the addresses of the variables. It can be called as

```c
    getyx(win, y, x);
    /* win: window pointer
     *   y, x: the cursor's y and x coordinates are put into these variables
     */
```

## `getparyx()`, `getbegyx()` and `getmaxyx()`

The function `getparyx()` gets the beginning coordinates of a [subwindow](../../glossary/subwindow.md) relative to its parent [window](../../glossary/window.md), or -1 for both if the window isn't a subwindow. This is sometimes useful to update a subwindow. When designing fancy stuff like multiple menus, it becomes difficult to store the menu positions, their first option coordinates and so on. A simple solution is to create menus in subwindows and later find the starting coordinates of the menus with `getparyx()`.

The function `getbegyx()` stores the window's beginning coordinates, relative to the screen. `getmaxyx()` stores its size: the number of lines and columns, which is one more than the largest coordinate in each direction. These functions are useful in the same way in managing windows and subwindows.
