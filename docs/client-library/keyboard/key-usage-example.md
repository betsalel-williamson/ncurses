# A simple key usage example

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

Let's write a small program which creates a menu that can be navigated with the up and down arrows.

**Example: A Simple Key Usage example**

```c
#include <stdlib.h>
#include <curses.h>

#define WIDTH 30
#define HEIGHT 10

int startx = 0;
int starty = 0;

const char *choices[] = {
    "Choice 1",
    "Choice 2",
    "Choice 3",
    "Choice 4",
    "Exit",
};
int n_choices = sizeof(choices) / sizeof(char *);

static void
print_menu(WINDOW *menu_win, int highlight)
{
    int x, y, i;

    x = 2;
    y = 2;
    box(menu_win, 0, 0);
    for (i = 0; i < n_choices; ++i) {
        if (highlight == i + 1) /* Highlight the present choice */
        {
            wattron(menu_win, A_REVERSE);
            mvwprintw(menu_win, y, x, "%s", choices[i]);
            wattroff(menu_win, A_REVERSE);
        } else
            mvwprintw(menu_win, y, x, "%s", choices[i]);
        ++y;
    }
    wrefresh(menu_win);
}

int
main(void)
{
    WINDOW *menu_win;
    int highlight = 1;
    int choice = 0;
    int c;

    initscr();
    clear();
    noecho();
    cbreak();                   /* disable line buffering and
                                 * editing control characters   */
    startx = (COLS - WIDTH) / 2;
    starty = (LINES - HEIGHT) / 2;

    menu_win = newwin(HEIGHT, WIDTH, starty, startx);
    keypad(menu_win, TRUE);
    mvprintw(0, 0, "Use arrow keys to go up and down, "
                   "Press enter to select a choice");
    refresh();
    print_menu(menu_win, highlight);
    while (1) {
        c = wgetch(menu_win);
        switch (c) {
        case KEY_UP:
            if (highlight == 1)
                highlight = n_choices;
            else
                --highlight;
            break;
        case KEY_DOWN:
            if (highlight == n_choices)
                highlight = 1;
            else
                ++highlight;
            break;
        case 10:
            choice = highlight;
            break;
        default:
            mvprintw(LINES - 1, 0,
                     "Character pressed is = %3d "
                     "Hopefully it can be printed as '%c'",
                     c, c);
            refresh();
            break;
        }
        print_menu(menu_win, highlight);
        if (choice != 0)        /* User made a choice; leave the loop */
            break;
    }
    mvprintw(LINES - 2, 0, "You chose choice %d with choice string %s\n",
             choice, choices[choice - 1]);
    clrtoeol();
    refresh();
    endwin();
    return EXIT_SUCCESS;
}
```

Use the up and down arrows to move the highlight, and press Enter to choose. Any other key, F1 included, shows its code on the bottom line, so this program ends only when you choose. The program compares the key with 10, a newline, because ncurses turns the carriage return that Enter sends into a newline while `nl()` is in effect, which is the default.

The window is centered with `LINES` and `COLS`, so the menu stays in the middle at any terminal size.

The program prints your choice just before `endwin()`. A terminal that draws curses programs on an alternate screen, as xterm and the terminal on this page do, switches back to the normal screen at `endwin()`, so on xterm the message disappears with the menu. The terminal on this page keeps the program's last screen in view after it ends, so you can read the choice there.
