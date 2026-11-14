# Other border functions

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

The [window border program](creating-windows.md) is grossly inefficient in that with each press of a key, a window is destroyed and another is created. So let's write a more efficient program which uses other border related functions.

The following program uses `mvhline()` and `mvvline()` to achieve a similar effect. These two functions are simple. They create a horizontal or vertical line of the specified length at the specified position.

**Example: More border functions**

```c
#include <stdlib.h>
#include <curses.h>

typedef struct _win_border_struct {
    chtype ls, rs, ts, bs, tl, tr, bl, br;
} WIN_BORDER;

typedef struct _WIN_struct {

    int startx, starty;
    int height, width;
    WIN_BORDER border;
} WIN;

static void
init_win_params(WIN *p_win)
{
    p_win->height = 3;
    p_win->width = 10;
    p_win->starty = (LINES - p_win->height) / 2;
    p_win->startx = (COLS - p_win->width) / 2;

    p_win->border.ls = '|';
    p_win->border.rs = '|';
    p_win->border.ts = '-';
    p_win->border.bs = '-';
    p_win->border.tl = '+';
    p_win->border.tr = '+';
    p_win->border.bl = '+';
    p_win->border.br = '+';
}

static void
print_win_params(WIN *p_win)
{
#ifdef _DEBUG
    mvprintw(LINES - 1, 0, "%d %d %d %d", p_win->startx, p_win->starty,
             p_win->width, p_win->height);
    move(0, 0);
    refresh();
#else
    (void) p_win;
#endif
}

static void
create_box(WIN *p_win, bool flag)
{
    int i, j;
    int x, y, w, h;

    x = p_win->startx;
    y = p_win->starty;
    w = p_win->width;
    h = p_win->height;

    if (flag == TRUE) {
        mvaddch(y, x, p_win->border.tl);
        mvaddch(y, x + w - 1, p_win->border.tr);
        mvaddch(y + h - 1, x, p_win->border.bl);
        mvaddch(y + h - 1, x + w - 1, p_win->border.br);
        mvhline(y, x + 1, p_win->border.ts, w - 2);
        mvhline(y + h - 1, x + 1, p_win->border.bs, w - 2);
        mvvline(y + 1, x, p_win->border.ls, h - 2);
        mvvline(y + 1, x + w - 1, p_win->border.rs, h - 2);

    } else
        for (j = y; j < y + h; ++j)
            for (i = x; i < x + w; ++i)
                mvaddch(j, i, ' ');

    refresh();
}

int
main(void)
{
    WIN win;
    int ch;

    initscr();                  /* Start curses mode            */
    start_color();              /* Start the color functionality */
    cbreak();                   /* disable line buffering and
                                 * editing control characters   */
    keypad(stdscr, TRUE);       /* I need that nifty F1         */
    noecho();
    init_pair(1, COLOR_CYAN, COLOR_BLACK);

    /* Initialize the window parameters */
    init_win_params(&win);
    print_win_params(&win);

    attron(COLOR_PAIR(1));
    printw("Press F1 to exit");
    refresh();
    attroff(COLOR_PAIR(1));

    create_box(&win, TRUE);
    while ((ch = getch()) != KEY_F(1)) {
        switch (ch) {
        case KEY_LEFT:
            create_box(&win, FALSE);
            --win.startx;
            create_box(&win, TRUE);
            break;
        case KEY_RIGHT:
            create_box(&win, FALSE);
            ++win.startx;
            create_box(&win, TRUE);
            break;
        case KEY_UP:
            create_box(&win, FALSE);
            --win.starty;
            create_box(&win, TRUE);
            break;
        case KEY_DOWN:
            create_box(&win, FALSE);
            ++win.starty;
            create_box(&win, TRUE);
            break;
        }
    }
    endwin();                   /* End curses mode                */
    return EXIT_SUCCESS;
}
```

`print_win_params()` prints the box's starting position and size on the bottom line, but only when the macro `_DEBUG` is defined, so the default build shows nothing there. The **Run with `_DEBUG` defined** button runs a build with it defined.
