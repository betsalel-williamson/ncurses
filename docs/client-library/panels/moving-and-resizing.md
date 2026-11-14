# Move and resize panels

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

The function `move_panel()` moves a panel to the desired location. It does not change the position of the panel in the deck. Use `move_panel()`, not `mvwin()`, on the window associated with the panel.

No function simply resizes the window associated with a panel. Instead, create a new window with the desired size, and attach it to the panel with `replace_panel()`. Don't forget to delete the old window. The window associated with a panel is returned by `panel_window()`. In `ncurses` you can also resize the panel's window with `wresize()` and then call `replace_panel()` with it.

The following program shows these operations. You can cycle through the windows with Tab as before. To resize or move the panel on top, press `r` for resize or `m` for move. Then use the arrow keys to resize or move it, and press Enter to end resizing or moving. The program keeps the size, position and label of each panel in a structure that the panel's user pointer points to.

**Example: Panel Moving and Resizing example**

```c
#include <stdlib.h>
#include <string.h>
#include <panel.h>

typedef struct _PANEL_DATA {
    int x, y, w, h;
    char label[80];
    int label_color;
    PANEL *next;
} PANEL_DATA;

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

/* Set the PANEL_DATA structures for individual panels */
static void
set_user_ptrs(PANEL **panels, PANEL_DATA *ptrs, int n)
{
    WINDOW *win;
    int x, y, w, h, i;
    char temp[80];

    for (i = 0; i < n; ++i) {
        win = panel_window(panels[i]);
        getbegyx(win, y, x);
        getmaxyx(win, h, w);
        ptrs[i].x = x;
        ptrs[i].y = y;
        ptrs[i].w = w;
        ptrs[i].h = h;
        sprintf(temp, "Window Number %d", i + 1);
        strcpy(ptrs[i].label, temp);
        ptrs[i].label_color = i + 1;
        if (i + 1 == n)
            ptrs[i].next = panels[0];
        else
            ptrs[i].next = panels[i + 1];
        set_panel_userptr(panels[i], &ptrs[i]);
    }
}

int
main(void)
{
    WINDOW *my_wins[3];
    PANEL *my_panels[3];
    PANEL_DATA *top;
    PANEL *stack_top;
    PANEL_DATA *ptrs;
    WINDOW *temp_win, *old_win;
    int ch;
    int newx, newy, neww, newh;
    bool size = FALSE, moving = FALSE;
    const int nptrs = 3;

    ptrs = (PANEL_DATA *) calloc((size_t) nptrs, sizeof(PANEL_DATA));
    if (ptrs == NULL) {
        perror("panel data");
        exit(EXIT_FAILURE);
    }

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

    init_wins(my_wins, nptrs);

    /* Attach a panel to each window */
    /* Order is bottom up */
    /* Push 0, order: stdscr-0 */
    my_panels[0] = new_panel(my_wins[0]);
    /* Push 1, order: stdscr-0-1 */
    my_panels[1] = new_panel(my_wins[1]);
    /* Push 2, order: stdscr-0-1-2 */
    my_panels[2] = new_panel(my_wins[2]);

    set_user_ptrs(my_panels, ptrs, nptrs);
    /* Update the stacking order. The last panel created is on top */
    update_panels();

    /* Show it on the screen */
    attron(COLOR_PAIR(4));
    mvprintw(LINES - 3, 0, "Use 'm' for moving, 'r' for resizing");
    mvprintw(LINES - 2, 0,
             "Use tab to browse through the windows (F1 to Exit)");
    attroff(COLOR_PAIR(4));
    doupdate();

    stack_top = my_panels[2];
    top = (PANEL_DATA *) panel_userptr(stack_top);
    newx = top->x;
    newy = top->y;
    neww = top->w;
    newh = top->h;

    while ((ch = getch()) != KEY_F(1)) {
        bool resized = FALSE;

        switch (ch) {
        case 9:                 /* Tab */
            top = (PANEL_DATA *) panel_userptr(stack_top);
            top_panel(top->next);
            stack_top = top->next;
            top = (PANEL_DATA *) panel_userptr(stack_top);
            newx = top->x;
            newy = top->y;
            neww = top->w;
            newh = top->h;
            break;
        case 'r':               /* Re-Size */
            size = TRUE;
            moving = FALSE;
            attron(COLOR_PAIR(4));
            mvprintw(LINES - 4, 0,
                     "Entered Resizing: Use Arrow Keys to resize "
                     "and press <ENTER> to end resizing");
            refresh();
            attroff(COLOR_PAIR(4));
            break;
        case 'm':               /* Move */
            size = FALSE;
            moving = TRUE;
            attron(COLOR_PAIR(4));
            mvprintw(LINES - 4, 0,
                     "Entered Moving: Use Arrow Keys to Move "
                     "and press <ENTER> to end moving");
            refresh();
            attroff(COLOR_PAIR(4));
            break;
        case KEY_LEFT:
            if (size == TRUE) {
                --newx;
                ++neww;
                resized = TRUE;
            } else if (moving) {
                move_panel(stack_top, newy, --newx);
            }
            break;
        case KEY_RIGHT:
            if (size == TRUE) {
                ++newx;
                --neww;
                resized = TRUE;
            } else if (moving) {
                move_panel(stack_top, newy, ++newx);
            }
            break;
        case KEY_UP:
            if (size == TRUE) {
                --newy;
                ++newh;
                resized = TRUE;
            } else if (moving) {
                move_panel(stack_top, --newy, newx);
            }
            break;
        case KEY_DOWN:
            if (size == TRUE) {
                ++newy;
                --newh;
                resized = TRUE;
            } else if (moving) {
                move_panel(stack_top, ++newy, newx);
            }
            break;
        case 10:                /* Enter */
            move(LINES - 4, 0);
            clrtoeol();
            refresh();
            if (size) {
                size = FALSE;
            } else if (moving) {
                moving = FALSE;
            }
            break;
        }
        /* Keep the panel's data current, for the next time it is on top */
        top->x = newx;
        top->y = newy;
        top->w = neww;
        top->h = newh;

        if (size && resized) {
            resized = FALSE;
            old_win = panel_window(stack_top);
            temp_win = newwin(newh, neww, newy, newx);
            if (old_win != NULL && temp_win != NULL) {
                replace_panel(stack_top, temp_win);
                win_show(temp_win, top->label, top->label_color);
                delwin(old_win);
            }
        }
        attron(COLOR_PAIR(4));
        mvprintw(LINES - 3, 0, "Use 'm' for moving, 'r' for resizing");
        mvprintw(LINES - 2, 0,
                 "Use tab to browse through the windows (F1 to Exit)");
        attroff(COLOR_PAIR(4));
        refresh();
        update_panels();
        doupdate();
    }
    endwin();
    return EXIT_SUCCESS;
}
```

Concentrate on the main `while` loop. Once it finds out the type of key pressed, it takes the appropriate action. If `r` is pressed, resizing mode starts. After this the window size is updated as the user presses the arrow keys, and the program replaces the panel's window with a window of the new size. When the user presses Enter, resizing mode ends.

When the user presses `m`, move mode starts. This is a bit simpler than resizing. As the arrow keys are pressed, the window position is updated. Pressing Enter ends move mode.

The `PANEL_DATA` structure that each user pointer points to plays a very important role. It stores the panel's size and position, its label and label color, and a pointer to the next panel in the cycle. The loop writes the new size and position back to it after each key, so that a panel brought back to the top with Tab moves on from where it was left.
