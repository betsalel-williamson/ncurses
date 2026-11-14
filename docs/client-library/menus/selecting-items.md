# Select items and multi-valued menus

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

Menus may be multi-valued or (the default) single-valued (see the manual page `menu_opts(3X)` to see how to change the default). Both types always have a *current item*.

From a single-valued menu you can read the selected value simply by looking at the current item. From a multi-valued menu, you get the selected set by looping through the items applying the `item_value()` predicate function. Your menu-processing code can use the function `set_item_value()` to flag the items in the select set.

Switch off the option `O_ONEVALUE` and the menu becomes multi-valued: the user can select more than one item, with the request `REQ_TOGGLE_ITEM`.

**Example: Multi Valued Menus example**

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
    "Exit",
};

int
main(void)
{
    ITEM **my_items;
    int c;
    MENU *my_menu;
    int n_choices, i;

    n_choices = ARRAY_SIZE(choices);
    if ((my_items = calloc((size_t) (n_choices + 1),
                           sizeof(ITEM *))) == NULL) {
        perror("my_items");
        return EXIT_FAILURE;
    }

    /* Initialize curses */
    initscr();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);

    /* Initialize items */
    for (i = 0; i < n_choices; ++i)
        my_items[i] = new_item(choices[i], choices[i]);
    my_items[n_choices] = (ITEM *) NULL;

    my_menu = new_menu((ITEM **) my_items);

    /* Make the menu multi valued */
    menu_opts_off(my_menu, O_ONEVALUE);

    mvprintw(LINES - 3, 0, "Use <SPACE> to select or unselect an item.");
    mvprintw(LINES - 2, 0,
             "<ENTER> to see presently selected items(F1 to Exit)");
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
        case ' ':
            menu_driver(my_menu, REQ_TOGGLE_ITEM);
            break;
        case 10: /* Enter */
        {
            char temp[200];
            ITEM **items;

            items = menu_items(my_menu);
            temp[0] = '\0';
            for (i = 0; i < item_count(my_menu); ++i)
                if (item_value(items[i]) == TRUE) {
                    strcat(temp, item_name(items[i]));
                    strcat(temp, " ");
                }
            move(20, 0);
            clrtoeol();
            mvaddstr(20, 0, temp);
            refresh();
            break;
        }
        }
    }

    unpost_menu(my_menu);
    free_menu(my_menu);
    for (i = 0; i < n_choices; ++i)
        free_item(my_items[i]);
    endwin();
}
```

In a multi-valued menu, the user should be allowed to select or deselect more than one item. The request `REQ_TOGGLE_ITEM` toggles the present selection. In this example, pressing space sends `REQ_TOGGLE_ITEM` to `menu_driver()`.

When the user presses Enter, the program shows the items presently selected. First it finds the items associated with the menu using the function `menu_items()`. Then it loops through the items to find out whether each one is selected. The function `item_value()` returns `TRUE` if an item is selected. The function `item_count()` returns the number of items in the menu. The item name can be found with `item_name()`. You can also find the description associated with an item using `item_description()`.
