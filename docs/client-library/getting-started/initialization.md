# Initialization

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

To initialize the curses system, call `initscr()`. There are functions which can be called after this initialization to customize our curses session. We may ask the curses system to set the terminal in raw mode, or initialize color, or initialize the mouse. Let's discuss some of the functions that are normally called immediately after `initscr()`. Others are explained where they are used.

## `raw()` and `cbreak()`

Normally the terminal driver buffers the characters a user types until a new line or carriage return is encountered. But most programs require that the characters be available as soon as the user types them. These two functions disable line buffering. The difference between them is in the way control characters like suspend (CTRL-Z), interrupt and quit (CTRL-C) are passed to the program. In `raw()` mode these characters are passed directly to the program without generating a signal. In [`cbreak()`](../../glossary/cbreak-mode.md) mode the terminal driver still interprets them, and generates the signal as usual. I personally prefer to use `raw()` as I can exercise greater control over what the user does.

## `echo()` and `noecho()`

These functions control the echoing of characters typed by the user to the terminal. `noecho()` switches off echoing. The reason you might want to do this is to gain more control over echoing or to suppress unnecessary echoing while taking input from the user through `getch()` and similar functions. Most interactive programs call `noecho()` at initialization and do the echoing of characters in a controlled manner. It gives the programmer the flexibility of echoing characters at any place in the window without updating the current (y,x) co-ordinates.

## `keypad()`

This is my favorite initialization function. It enables the reading of function keys like F1, F2, arrow keys, etc. Almost every interactive program enables this, as arrow keys are a major part of any user interface. Do `keypad(stdscr, TRUE)` to enable this feature for the regular screen (`stdscr`).

## `halfdelay()`

This function, though not used very often, is a useful one at times. `halfdelay()` is called to enable the half-delay mode, which is similar to the `cbreak()` mode in that characters typed are immediately available to the program. However, it waits for 'X' tenths of a second for input and then returns `ERR`, if no input is available. 'X' is the timeout value passed to the function `halfdelay()`. This function is useful when you want to ask the user for input, and do something else if they don't respond within a certain time. One possible example is a timeout at the password prompt.

## An example

Let's write a program which will clarify the usage of these functions. It prints the key you press in bold, then waits for one more key before it exits.

**Example: Initialization Function Usage example**

```c
#include <stdlib.h>
#include <curses.h>

int
main(void)
{
    int ch;

    initscr();                  /* Start curses mode            */
    raw();                      /* Line buffering disabled      */
    keypad(stdscr, TRUE);       /* We get F1, F2 etc..          */
    noecho();                   /* Don't echo() while we do getch */

    printw("Type any character to see it in bold\n");
    ch = getch();               /* If raw() hadn't been called
                                 * we have to press enter before it
                                 * gets to the program          */
    if (ch == KEY_F(1))         /* Without keypad enabled this will */
        printw("F1 pressed");   /* not get to us either -
                                 * Without noecho() some ugly escape
                                 * characters might have been printed
                                 * on screen                    */
    else {
        printw("The pressed key is ");
        attron(A_BOLD);
        printw("%c", ch);
        attroff(A_BOLD);
    }
    refresh();                  /* Print it on to the real screen */
    getch();                    /* Wait for user input */
    endwin();                   /* End curses mode                */

    return EXIT_SUCCESS;
}
```

This program uses functions which aren't explained yet. The function `getch()` is used to get a character from the user. It is equivalent to the normal `getchar()` except that we can disable the line buffering to avoid pressing Enter after input. The functions `attron()` and `attroff()` are used to switch some attributes on and off respectively. In the example they print the character in bold.
