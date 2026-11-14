# Compile and run a first menu

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

Your menu-using modules must import the menu library declarations with

```c
#include <menu.h>
```

and must be linked explicitly with the menus library using an `-lmenu` argument. Note that they must also link the `ncurses` library with `-lncurses`. Many linkers are two-pass and will accept either order, but it is still good practice to put `-lmenu` first and `-lncurses` second:

```sh
gcc program.c -lmenu -lncurses
```

Here is a program which prints a simple menu and moves the current selection with the up and down arrow keys.

**Example: Menu Basics**

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

    initscr();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);

    for (i = 0; i < n_choices; ++i)
        my_items[i] = new_item(choices[i], choices[i]);
    my_items[n_choices] = (ITEM *) NULL;

    my_menu = new_menu((ITEM **) my_items);
    mvprintw(LINES - 2, 0, "F1 to Exit");
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
        }
    }

    free_item(my_items[0]);
    free_item(my_items[1]);
    free_menu(my_menu);
    endwin();

    return EXIT_SUCCESS;
}
```

This program demonstrates the basic concepts involved in creating a menu using the menus library. First we create the items using `new_item()` and then attach them to the menu with the `new_menu()` function. After posting the menu and refreshing the screen, the main processing loop starts. It reads user input and takes corresponding action. The function `menu_driver()` is the main workhorse of the menu system. The second parameter to this function tells what's to be done with the menu. According to the parameter, `menu_driver()` does the corresponding task. The value can be either a menu navigational request, a printable character, or a `KEY_MOUSE` special key associated with a mouse event.

The requests of interest in this example are `REQ_UP_ITEM` and `REQ_DOWN_ITEM`. When either is passed to `menu_driver()`, the menu driver moves the current item one item up or down. [Process input with the menu driver](menu-driver.md) describes the rest.

When the user presses F1, the program unposts the menu, frees it, and then frees each item.
