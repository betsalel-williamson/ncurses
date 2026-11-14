# Compile and run a first panel program

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

Your panels-using modules must import the panels library declarations with

```c
#include <panel.h>
```

and must be linked explicitly with the panels library using an `-lpanel` argument. Note that they must also link the `ncurses` library with `-lncurses`. Many linkers are two-pass and will accept either order, but it is still good practice to put `-lpanel` first and `-lncurses` second:

```sh
gcc program.c -lpanel -lncurses
```

The header file `panel.h` itself includes `curses.h`, so a panel program doesn't need to include both.

The following is a simple program which creates three overlapping panels and shows them on the screen.

**Example: Panel basics**

```c
#include <stdlib.h>
#include <panel.h>

int
main(void)
{
    WINDOW *my_wins[3];
    PANEL *my_panels[3];
    int lines = 10, cols = 40, y = 2, x = 4, i;

    initscr();
    cbreak();
    noecho();

    /* Create windows for the panels */
    my_wins[0] = newwin(lines, cols, y, x);
    my_wins[1] = newwin(lines, cols, y + 1, x + 5);
    my_wins[2] = newwin(lines, cols, y + 2, x + 10);

    /*
     * Create borders around the windows so that you can see the effect
     * of panels
     */
    for (i = 0; i < 3; ++i)
        box(my_wins[i], 0, 0);

    /* Attach a panel to each window */
    /* Order is bottom up */
    /* Push 0, order: stdscr-0 */
    /* Push 1, order: stdscr-0-1 */
    /* Push 2, order: stdscr-0-1-2 */
    for (i = 0; i < 3; ++i)
        my_panels[i] = new_panel(my_wins[i]);

    /* Update the stacking order. Last-created panel will be on top */
    update_panels();

    /* Show it on the screen */
    doupdate();

    getch();

    /* Deleting panels does not erase their window */
    for (i = 0; i < 3; ++i)
        del_panel(my_panels[i]);

    endwin();
    return EXIT_SUCCESS;
}
```

The program follows the flow described in the [overview](overview.md#the-flow-of-a-panel-program). The windows are created with `newwin()` and then they are attached to panels with `new_panel()`. As each panel is attached, it goes on top of the deck. To put them on the screen, the program calls `update_panels()` and `doupdate()`.
