# Cursor visibility

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

Now you know enough features to write a good curses program, with all the bells and whistles. There are some miscellaneous functions which are useful in various cases.

The function `curs_set()` makes the cursor invisible, or visible again. Its parameter is:

```text
    0 : invisible
    1 : normal
    2 : very visible
```

It returns the previous visibility, or `ERR` if the terminal can't show the visibility asked for.
