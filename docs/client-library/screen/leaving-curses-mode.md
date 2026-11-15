# Leaving curses mode for a while

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

Sometimes you may want to go back to cooked mode (normal line buffering mode) temporarily. In that case, first save the tty modes with a call to `def_prog_mode()`, then call `endwin()` to end curses mode. This leaves you in the original tty mode. To get back to curses once you are done, call `reset_prog_mode()`. This function returns the tty to the state stored by `def_prog_mode()`. Then call `refresh()`, and you are back in curses mode. Here is an example showing the sequence of things to be done.

**Example: Temporarily Leaving Curses Mode**

```c
#include <stdlib.h>
#include <curses.h>

int
main(void)
{
    int rc;

    initscr();                  /* Start curses mode              */
    printw("Hello World !!!\n");
    refresh();                  /* Print it on to the real screen */
    def_prog_mode();            /* Save the tty modes             */
    endwin();                   /* End curses mode temporarily    */
    /* Do whatever you like in cooked mode */
    rc = system("/bin/sh");
    /* Return to the previous tty mode stored by def_prog_mode() */
    reset_prog_mode();
    /* Do refresh() to restore the screen contents */
    refresh();
    /* Back to curses: use the full capabilities of curses */
    printw("Another String\n");
    printw("System returned %d\n", rc);
    refresh();
    endwin();                   /* End curses mode                */

    return EXIT_SUCCESS;
}
```

The program starts a shell with `system()`. Type commands at the shell prompt, and type `exit` to return to the program, which then prints what the shell returned and ends. A web page has no shell, so this example doesn't run on the site.
