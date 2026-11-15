# Shelling out

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

Sometimes you'll write a program that spends most of its time in screen mode but occasionally returns to ordinary cooked mode. A common reason is to run a shell. This is simple to arrange in ncurses.

To leave curses mode, call `endwin()` as you would to end the program. This takes the terminal back to cooked mode, and you can run the shell. To return to curses mode, call `refresh()` or `doupdate()`. This repaints the screen.

The boolean function `isendwin()` tells your code whether screen mode is active. It returns `TRUE` between an `endwin()` call and the next `refresh()`, and `FALSE` otherwise.

Here is some sample code for shelling out:

```c
addstr("Shelling out...");
def_prog_mode();           /* save current tty modes */
endwin();                  /* restore original tty modes */
system("sh");              /* run shell */
addstr("returned.\n");     /* prepare return message */
refresh();                 /* restore save modes, repaint screen */
```

[Leaving curses mode for a while](../screen/leaving-curses-mode.md) has a complete program that does the same, using `reset_prog_mode()` to restore the saved modes explicitly.
