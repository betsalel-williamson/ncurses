# Hide and show panels

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

It is possible to remove a panel from the deck temporarily; use `hide_panel()` for this. It doesn't destroy the `PANEL` structure associated with the hidden panel; the panel disappears from the screen at the next `update_panels()` and `doupdate()`. Use `show_panel()` to render it visible again. The predicate function `panel_hidden()` tests whether or not a panel is hidden: it returns `TRUE` if the panel is not in the deck and `FALSE` if it is.

The `update_panels()` function ignores hidden panels. In `ncurses`, `top_panel()` and `bottom_panel()` also work on a hidden panel, and make it visible at the top or the bottom of the deck. In the System V panel library, `show_panel()` is intended for making a hidden panel visible and `top_panel()` for moving a visible panel to the top, so use `show_panel()` on a hidden panel if your program may be built with that library. Other panel operations are applicable to hidden panels.

The following program hides and shows panels. Press `a`, `b` or `c` to show or hide the first, second or third window.

**Example: Panel Hiding and Showing example**

```c
#include <stdlib.h>
#include <string.h>
#include <panel.h>

#define NLINES 10
#define NCOLS 40

static void
print_in_middle(WINDOW *win, int starty, int startx,
                int width, const char *string, chtype color)
{
    int length, x, y;
    float temp;

    if (win == NULL)
        win = stdscr;
    getyx(win, y, x);
    if (startx != 0)
        x = startx;
    if (starty != 0)
        y = starty;
    if (width == 0)
        width = 80;

    length = (int) strlen(string);
    temp = (float) (width - length) / 2;
    x = startx + (int) temp;
    wattron(win, color);
    mvwprintw(win, y, x, "%s", string);
    wattroff(win, color);
    refresh();
}

/* Show the window with a border and a label */
static void
win_show(WINDOW *win, const char *label, int label_color)
{
    int height, width;

    getmaxyx(win, height, width);
    (void) height;

    box(win, 0, 0);
    mvwaddch(win, 2, 0, ACS_LTEE);
    mvwhline(win, 2, 1, ACS_HLINE, width - 2);
    mvwaddch(win, 2, width - 1, ACS_RTEE);

    print_in_middle(win, 1, 0, width, label, COLOR_PAIR(label_color));
}

/* Put all the windows */
static void
init_wins(WINDOW **wins, int n)
{
    int x, y, i;
    char label[80];

    y = 2;
    x = 10;
    for (i = 0; i < n; ++i) {
        wins[i] = newwin(NLINES, NCOLS, y, x);
        sprintf(label, "Window Number %d", i + 1);
        win_show(wins[i], label, i + 1);
        y += 3;
        x += 7;
    }
}

int
main(void)
{
    WINDOW *my_wins[3];
    PANEL *my_panels[3];
    int ch;

    /* Initialize curses */
    initscr();
    start_color();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);

    /* Initialize all the colors */
    init_pair(1, COLOR_RED, COLOR_BLACK);
    init_pair(2, COLOR_GREEN, COLOR_BLACK);
    init_pair(3, COLOR_BLUE, COLOR_BLACK);
    init_pair(4, COLOR_CYAN, COLOR_BLACK);

    init_wins(my_wins, 3);

    /* Attach a panel to each window */
    /* Order is bottom up */
    /* Push 0, order: stdscr-0 */
    my_panels[0] = new_panel(my_wins[0]);
    /* Push 1, order: stdscr-0-1 */
    my_panels[1] = new_panel(my_wins[1]);
    /* Push 2, order: stdscr-0-1-2 */
    my_panels[2] = new_panel(my_wins[2]);

    /* Update the stacking order. The last panel created is on top */
    update_panels();

    /* Show it on the screen */
    attron(COLOR_PAIR(4));
    mvprintw(LINES - 3, 0,
             "Press 'a', 'b' or 'c' to show or hide "
             "the first, second or third window");
    mvprintw(LINES - 2, 0, "F1 to Exit");

    attroff(COLOR_PAIR(4));
    doupdate();

    while ((ch = getch()) != KEY_F(1)) {
        switch (ch) {
        case 'a':
            if (panel_hidden(my_panels[0]))
                show_panel(my_panels[0]);
            else
                hide_panel(my_panels[0]);
            break;
        case 'b':
            if (panel_hidden(my_panels[1]))
                show_panel(my_panels[1]);
            else
                hide_panel(my_panels[1]);
            break;
        case 'c':
            if (panel_hidden(my_panels[2]))
                show_panel(my_panels[2]);
            else
                hide_panel(my_panels[2]);
            break;
        }
        update_panels();
        doupdate();
    }
    endwin();
    return EXIT_SUCCESS;
}
```
