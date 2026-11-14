# User pointers, hooks and other features

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

## The user pointer

Each item, and each menu, has an associated user pointer on which you can hang application data. See `mitem_userptr(3X)` and `menu_userptr(3X)`. The menu system doesn't touch it. It works the same way as the user pointer in panels. A common use is to store the function to run when an item is chosen, for example when the user presses Enter on it.

The pointer must stay valid for as long as the item can use it. In this example every item points to the same `static` structure.

**Example: Menu User Pointer Usage**

```c
#include <stdlib.h>
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
    "Exit",
};

typedef union {
    void (*my_func)(const char *);
    void *data;
} MY_DATA;

static void
func(const char *name)
{
    move(20, 0);
    clrtoeol();
    mvprintw(20, 0, "Item selected is : %s", name);
}

int
main(void)
{
    ITEM **my_items;
    int c;
    MENU *my_menu;
    int n_choices, i;

    n_choices = ARRAY_SIZE(choices);
    if ((my_items = calloc((size_t) (n_choices + 1), sizeof(ITEM *))) == NULL) {
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
    init_pair(2, COLOR_GREEN, COLOR_BLACK);
    init_pair(3, COLOR_MAGENTA, COLOR_BLACK);

    /* Initialize items */
    for (i = 0; i < n_choices; ++i) {
        static MY_DATA data = {func};
        my_items[i] = new_item(choices[i], choices[i]);
        /* Set the user pointer */
        set_item_userptr(my_items[i], (void *) &data);
    }
    my_items[n_choices] = (ITEM *) NULL;

    /* Create menu */
    my_menu = new_menu((ITEM **) my_items);

    /* Post the menu */
    mvprintw(LINES - 3, 0, "Press <ENTER> to see the option selected");
    mvprintw(LINES - 2, 0, "Up and Down arrow keys to navigate (F1 to Exit)");
    post_menu(my_menu);
    refresh();

    while ((c = getch()) != KEY_F(1)) {
        switch (c) {
        case KEY_DOWN:
            menu_driver(my_menu, REQ_DOWN_ITEM);
            break;
        case KEY_UP:
            menu_driver(my_menu, REQ_UP_ITEM);
            break;
        case 10: /* Enter */
        {
            ITEM *cur;
            const MY_DATA *data;

            cur = current_item(my_menu);
            data = item_userptr(cur);
            data->my_func(item_name(cur));
            pos_menu_cursor(my_menu);
            break;
        }
        }
    }
    unpost_menu(my_menu);
    free_menu(my_menu);
    for (i = 0; i < n_choices; ++i)
        free_item(my_items[i]);
    endwin();

    return EXIT_SUCCESS;
}
```

## Other features

Various menu options can affect the processing and visual appearance and input processing of menus. See `menu_opts(3X)` for details.

It is possible to change the current item from application code; this is useful if you want to write your own navigation requests. It is also possible to explicitly set the top row of the menu display. See `mitem_current(3X)`. If your application needs to change the menu subwindow cursor for any reason, `pos_menu_cursor()` will restore it to the correct location for continuing menu driver processing.

It is possible to set hooks to be called at menu initialization and wrapup time, and whenever the selected item changes. See `menu_hook(3X)`.
