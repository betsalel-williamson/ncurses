# Menu windows

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

Each menu has a pair of associated windows. Both these windows are painted when the menu is posted and erased when the menu is unposted.

The outer or frame window is not otherwise touched by the menu routines. It exists so the programmer can associate a title, a border, or perhaps help text with the menu and have it properly refreshed or erased at post/unpost time. The inner window or *subwindow* is where the current menu page is displayed.

By default, both windows are `stdscr`. You can set them with the functions in `menu_win(3X)`. When the windows are not specified, as in [the first example](compiling.md), the menu system uses `stdscr` as the main window and calculates the subwindow size required to display the items.

When you call `post_menu()`, you write the menu to its subwindow. When you call `unpost_menu()`, you erase the subwindow. However, neither of these actually modifies the screen. To do that, call `wrefresh()` or some equivalent.

This example sets both windows, and displays the menu with a border and a title.

**Example: Menu Windows Usage example**

```c
#include <stdlib.h>
#include <string.h>
#include <menu.h>

#define ARRAY_SIZE(a) (sizeof(a) / sizeof(a[0]))
#define CTRLD 4

const char *choices[] = {
    "Choice 1",
    "Choice 2",
    "Choice 3",
    "Choice 4",
    "Exit",
    (char *) NULL,
};

void print_in_middle(WINDOW *win, int starty, int startx,
                     int width, const char *string, chtype color);

int
main(void)
{
    ITEM **my_items;
    int c;
    MENU *my_menu;
    WINDOW *my_menu_win;
    int n_choices, i;

    n_choices = ARRAY_SIZE(choices);
    if ((my_items = (ITEM **) calloc((size_t) n_choices, sizeof(ITEM *))) == NULL) {
        perror("my_items");
        return EXIT_FAILURE;
    }

    /* Initialize curses */
    initscr();
    start_color();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);
    init_pair(1, COLOR_RED, COLOR_BLACK);

    /* Create items */
    for (i = 0; i < n_choices; ++i)
        my_items[i] = new_item(choices[i], choices[i]);

    /* Create menu */
    my_menu = new_menu((ITEM **) my_items);

    /* Create the window to be associated with the menu */
    my_menu_win = newwin(10, 40, 4, 4);
    keypad(my_menu_win, TRUE);

    /* Set main window and sub window */
    set_menu_win(my_menu, my_menu_win);
    set_menu_sub(my_menu, derwin(my_menu_win, 6, 38, 3, 1));

    /* Set menu mark to the string " * " */
    set_menu_mark(my_menu, " * ");

    /* Print a border around the main window and print a title */
    box(my_menu_win, 0, 0);
    print_in_middle(my_menu_win, 1, 0, 40, "My Menu", COLOR_PAIR(1));
    mvwaddch(my_menu_win, 2, 0, ACS_LTEE);
    mvwhline(my_menu_win, 2, 1, ACS_HLINE, 38);
    mvwaddch(my_menu_win, 2, 39, ACS_RTEE);
    mvprintw(LINES - 2, 0, "F1 to exit");
    refresh();

    /* Post the menu */
    post_menu(my_menu);
    wrefresh(my_menu_win);

    while ((c = wgetch(my_menu_win)) != KEY_F(1)) {
        switch (c) {
        case KEY_DOWN:
            menu_driver(my_menu, REQ_DOWN_ITEM);
            break;
        case KEY_UP:
            menu_driver(my_menu, REQ_UP_ITEM);
            break;
        }
        wrefresh(my_menu_win);
    }

    /* Unpost and free all the memory taken up */
    unpost_menu(my_menu);
    free_menu(my_menu);
    for (i = 0; i < n_choices; ++i)
        free_item(my_items[i]);
    endwin();
}

void
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
```

This example creates a menu with a title, a border, and a line separating the title from the items. To attach a window to a menu, use `set_menu_win()`. Then attach the subwindow with `set_menu_sub()`; the items are displayed in it. You can also set the mark string, which is displayed to the left of the selected item, with `set_menu_mark()`.
