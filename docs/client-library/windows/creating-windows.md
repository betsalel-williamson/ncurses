# Create and border a window

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

Windows form the most important concept in curses. You have seen the standard window `stdscr`, on which all the functions so far implicitly operated. To design even the simplest user interface, you need to resort to windows. The main reason you may want to use windows is to manipulate parts of the screen separately, for better efficiency, by updating only the windows that need to be changed, and for a better design. I would say the last reason is the most important in going for windows. You should always strive for a better and easy-to-manage design in your programs. If you are writing big, complex user interfaces, this is of pivotal importance before you start doing anything.

## The basics

A window can be created by calling the function `newwin()`. It doesn't create anything on the screen. It allocates memory for a structure to manipulate the window and updates the structure with data regarding the window such as its size, beginy, beginx, etc. Hence in curses, a window is just an abstraction of an imaginary window, which can be manipulated independently of other parts of the screen. The function `newwin()` returns a pointer to structure `WINDOW`, which can be passed to window related functions such as `wprintw()`. Finally, the window can be destroyed with `delwin()`. It will deallocate the memory associated with the window structure.

## Let there be a window

What fun is it if a window is created and we can't see it? So the fun part begins by displaying the window. The function `box()` can be used to draw a border around the window. Let's explore these functions in more detail in this example.

**Example: Window Border example**

```c
#include <stdlib.h>
#include <curses.h>

static WINDOW *
create_newwin(int height, int width, int starty, int startx)
{
    WINDOW *local_win;

    local_win = newwin(height, width, starty, startx);
    box(local_win, 0, 0);       /* 0, 0 gives default characters
                                 * for the vertical and horizontal
                                 * lines                        */
    wrefresh(local_win);        /* Show that box                */

    return local_win;
}

static void
destroy_win(WINDOW *local_win)
{
    /* box(local_win, ' ', ' '); : This won't produce the desired
     * result of erasing the window. It will leave its four corners
     * and so an ugly remnant of window.
     */
    wborder(local_win, ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ');
    /* The parameters taken are
     * 1. win: the window on which to operate
     * 2. ls: character to be used for the left side of the window
     * 3. rs: character to be used for the right side of the window
     * 4. ts: character to be used for the top side of the window
     * 5. bs: character to be used for the bottom side of the window
     * 6. tl: character to be used for the top left corner of the window
     * 7. tr: character to be used for the top right corner of the window
     * 8. bl: character to be used for the bottom left corner of the window
     * 9. br: character to be used for the bottom right corner of the window
     */
    wrefresh(local_win);
    delwin(local_win);
}

int
main(void)
{
    WINDOW *my_win;
    int startx, starty, width, height;
    int ch;

    initscr();                  /* Start curses mode            */
    cbreak();                   /* disable line buffering and
                                 * editing control characters   */
    keypad(stdscr, TRUE);       /* I need that nifty F1         */

    height = 3;
    width = 10;
    /* Calculating for a center placement of the window */
    starty = (LINES - height) / 2;
    startx = (COLS - width) / 2;
    printw("Press F1 to exit");
    refresh();
    my_win = create_newwin(height, width, starty, startx);

    while ((ch = getch()) != KEY_F(1)) {
        switch (ch) {
        case KEY_LEFT:
            destroy_win(my_win);
            my_win = create_newwin(height, width, starty, --startx);
            break;
        case KEY_RIGHT:
            destroy_win(my_win);
            my_win = create_newwin(height, width, starty, ++startx);
            break;
        case KEY_UP:
            destroy_win(my_win);
            my_win = create_newwin(height, width, --starty, startx);
            break;
        case KEY_DOWN:
            destroy_win(my_win);
            my_win = create_newwin(height, width, ++starty, startx);
            break;
        }
    }

    endwin();                   /* End curses mode                */
    return EXIT_SUCCESS;
}
```

## Explanation

Don't scream. I know it is a big example. But I have to explain some important things here :-). This program creates a rectangular window that can be moved with the left, right, up and down arrow keys. It repeatedly creates and destroys windows as the user presses a key. Don't go beyond the screen limits: `newwin()` returns `NULL` for a window that doesn't fit, and the box disappears until you come back. Checking for those limits is left as an exercise for the reader. Let's dissect it line by line.

The `create_newwin()` function creates a window with `newwin()` and displays a border around it with `box()`. The function `destroy_win()` first erases the window from the screen by painting a border with the ' ' character and then calls `delwin()` to deallocate memory related to it. Depending on the key the user presses, `starty` or `startx` is changed and a new window is created.

In `destroy_win()`, as you can see, I used `wborder()` instead of `box()`. The reason is written in the comments (you missed it, I know; read the code :-)). `wborder()` draws a border around the window with the characters given to it as the 4 corner points and the 4 lines. To put it clearly, if you have called `wborder()` as below:

```c
wborder(win, '|', '|', '-', '-', '+', '+', '+', '+');
```

it produces something like

```text
+------------+
|            |
|            |
|            |
|            |
|            |
|            |
+------------+
```

## The other stuff in the example

The example also uses the variables `COLS` and `LINES`, which are initialized to the screen size after `initscr()`. They can be useful in finding screen dimensions and finding the center co-ordinate of the screen, as above. The function `getch()` as usual gets the key from the keyboard, and according to the key the program does the corresponding work. This type of switch-case is very common in interactive programs.
