# Menu display, scrolling and columns

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

The menu library calculates a minimum display size for your window, based on the following variables:

- The number and maximum length of the menu items
- Whether the `O_ROWMAJOR` option is enabled
- Whether display of descriptions is enabled
- Whatever menu format may have been set by the programmer
- The length of the menu mark string used for highlighting selected items

The function `set_menu_format()` allows you to set the maximum size of the viewport or *menu page* that will be used to display menu items. You can retrieve any format associated with a menu with `menu_format()`. The default format is rows=16, columns=1.

The actual menu page may be smaller than the format size. This depends on the item number and size and whether `O_ROWMAJOR` is on. This option (on by default) causes menu items to be displayed in a "raster-scan" pattern, so that if more than one item will fit horizontally the first couple of items are side-by-side in the top row. The alternative is column-major display, which tries to put the first several items in the first column.

Each menu has a *mark string* used to visually tag selected items; see the `menu_mark(3X)` manual page for details. The mark string length also influences the menu page size.

The function `scale_menu()` returns the minimum display size that the menu code computes from all these factors. There are other menu display attributes including a select attribute, an attribute for selectable items, an attribute for unselectable items, and a pad character used to separate item name text from description text. These have reasonable defaults which the library allows you to change (see the `menu_attributes(3X)` manual page).

## Scrolling menus

A menu format not large enough to allow all items to fit on-screen will result in a menu display that is vertically scrollable. When you are on the last item in the present list and send `REQ_DOWN_ITEM`, it is translated into `REQ_SCR_DLINE` and the menu scrolls by one item. You can also scroll it with the `REQ_SCR_` requests to the menu driver, described in [Process input with the menu driver](menu-driver.md).

**Example: Scrolling Menus example**

```c
#include <stdlib.h>
#include <string.h>
#include <curses.h>
#include <menu.h>

#define ARRAY_SIZE(a) (sizeof(a) / sizeof(a[0]))
#define CTRLD 4

const char *choices[] = {
    "Choice 1",
    "Choice 2",
    "Choice 3",
    "Choice 4",
    "Choice 5",
    "Choice 6",
    "Choice 7",
    "Choice 8",
    "Choice 9",
    "Choice 10",
    "Exit",
    (char *) NULL,
};

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

int
main(void)
{
    ITEM **my_items;
    int c;
    MENU *my_menu;
    WINDOW *my_menu_win;
    int n_choices, i;

    /* Create items */
    n_choices = ARRAY_SIZE(choices);
    if ((my_items = calloc((size_t) n_choices, sizeof(ITEM *))) == NULL) {
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
    init_pair(2, COLOR_CYAN, COLOR_BLACK);

    for (i = 0; i < n_choices; ++i) {
        my_items[i] = new_item(choices[i], choices[i]);
    }

    /* Create menu */
    my_menu = new_menu((ITEM **) my_items);

    /* Create the window to be associated with the menu */
    my_menu_win = newwin(10, 40, 4, 4);
    keypad(my_menu_win, TRUE);

    /* Set main window and sub window */
    set_menu_win(my_menu, my_menu_win);
    set_menu_sub(my_menu, derwin(my_menu_win, 6, 38, 3, 1));
    set_menu_format(my_menu, 5, 1);

    /* Set menu mark to the string " * " */
    set_menu_mark(my_menu, " * ");

    /* Print a border around the main window and print a title */
    box(my_menu_win, 0, 0);
    print_in_middle(my_menu_win, 1, 0, 40, "My Menu", COLOR_PAIR(1));
    mvwaddch(my_menu_win, 2, 0, ACS_LTEE);
    mvwhline(my_menu_win, 2, 1, ACS_HLINE, 38);
    mvwaddch(my_menu_win, 2, 39, ACS_RTEE);

    /* Post the menu */
    post_menu(my_menu);
    wrefresh(my_menu_win);

    attron(COLOR_PAIR(2));
    mvprintw(LINES - 2, 0,
             "Use PageUp and PageDown to scroll down or up a page of items");
    mvprintw(LINES - 1, 0, "Arrow Keys to navigate (F1 to Exit)");
    attroff(COLOR_PAIR(2));
    refresh();

    while ((c = wgetch(my_menu_win)) != KEY_F(1)) {
        switch (c) {
        case KEY_DOWN:
            menu_driver(my_menu, REQ_DOWN_ITEM);
            break;
        case KEY_UP:
            menu_driver(my_menu, REQ_UP_ITEM);
            break;
        case KEY_NPAGE:
            menu_driver(my_menu, REQ_SCR_DPAGE);
            break;
        case KEY_PPAGE:
            menu_driver(my_menu, REQ_SCR_UPAGE);
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
```

In this example the number of choices has been increased to ten, which is larger than the subwindow, which can hold six items. Tell the menu system so with `set_menu_format()`: its arguments are the number of rows and columns to display on a single page. The rows argument can be any number of items, as long as it is less than the height of the subwindow. If the key pressed by the user is Page Up or Page Down, the menu is scrolled a page by the requests (`REQ_SCR_UPAGE` and `REQ_SCR_DPAGE`) given to `menu_driver()`.

## Multi-column menus

The third argument of `set_menu_format()` is the number of columns. If your subwindow is wide enough, you can display more than one item per row. To keep things simple, the following example doesn't show descriptions for the items.

**Example: Multi Columnar Menus Example**

```c
#include <stdlib.h>
#include <curses.h>
#include <menu.h>

#define ARRAY_SIZE(a) (sizeof(a) / sizeof(a[0]))
#define CTRLD 4

const char *choices[] = {
    "Choice 1", "Choice 2", "Choice 3", "Choice 4", "Choice 5",
    "Choice 6", "Choice 7", "Choice 8", "Choice 9", "Choice 10",
    "Choice 11", "Choice 12", "Choice 13", "Choice 14", "Choice 15",
    "Choice 16", "Choice 17", "Choice 18", "Choice 19", "Choice 20",
    "Exit",
    (char *) NULL};

int
main(void)
{
    ITEM **my_items;
    int c;
    MENU *my_menu;
    WINDOW *my_menu_win;
    int n_choices, i;

    n_choices = ARRAY_SIZE(choices);
    if ((my_items = calloc((size_t) n_choices, sizeof(ITEM *))) == NULL) {
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
    init_pair(2, COLOR_CYAN, COLOR_BLACK);

    for (i = 0; i < n_choices; ++i) {
        my_items[i] = new_item(choices[i], choices[i]);
    }

    /* Create menu */
    my_menu = new_menu((ITEM **) my_items);

    /* Set menu option not to show the description */
    menu_opts_off(my_menu, O_SHOWDESC);

    /* Create the window to be associated with the menu */
    my_menu_win = newwin(10, 70, 4, 4);
    keypad(my_menu_win, TRUE);

    /* Set main window and sub window */
    set_menu_win(my_menu, my_menu_win);
    set_menu_sub(my_menu, derwin(my_menu_win, 6, 68, 3, 1));
    set_menu_format(my_menu, 5, 3);
    set_menu_mark(my_menu, " * ");

    /* Print a border around the main window and print a title */
    box(my_menu_win, 0, 0);

    attron(COLOR_PAIR(2));
    mvprintw(LINES - 3, 0, "Use PageUp and PageDown to scroll");
    mvprintw(LINES - 2, 0, "Use Arrow Keys to navigate (F1 to Exit)");
    attroff(COLOR_PAIR(2));
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
        case KEY_LEFT:
            menu_driver(my_menu, REQ_LEFT_ITEM);
            break;
        case KEY_RIGHT:
            menu_driver(my_menu, REQ_RIGHT_ITEM);
            break;
        case KEY_NPAGE:
            menu_driver(my_menu, REQ_SCR_DPAGE);
            break;
        case KEY_PPAGE:
            menu_driver(my_menu, REQ_SCR_UPAGE);
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
```

The call to `set_menu_format()` sets the number of columns to 3, so 3 items are displayed per row. The example also switches off the display of descriptions with `menu_opts_off()`.

## Menu options

The functions `set_menu_opts()`, `menu_opts_on()`, `menu_opts_off()` and `menu_opts()` manipulate menu options. The following options are defined:

```text
O_ONEVALUE
     Only one item can be selected for this menu.

O_SHOWDESC
     Display the item descriptions when the menu is posted.

O_ROWMAJOR
     Display the menu in row-major order.

O_IGNORECASE
     Ignore the case when pattern-matching.

O_SHOWMATCH
     Move the cursor to within the item name while pattern-matching.

O_NONCYCLIC
     Don't wrap around next-item and previous-item,
     requests to the other end of the menu.

O_MOUSE_MENU
     If the user clicks with the mouse and it does not fall on the
     currently active menu, push KEY_MOUSE and the MEVENT data back
     on the queue to allow processing in another part of the program.
```

All options are on by default. You can switch specific options on or off with `menu_opts_on()` and `menu_opts_off()`. You can also use `set_menu_opts()` to directly specify the options. The argument to this function should be an OR-ed value of some of the constants above. The function `menu_opts()` returns a menu's present options. See `menu_opts(3X)` for details.
