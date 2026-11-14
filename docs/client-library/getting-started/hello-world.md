# Hello World

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

Before we plunge into the library and look into its various features, let's write a simple program and say hello to the world.

## Compiling with the ncurses library

In order to use the library, it is necessary to have certain types and variables defined. Therefore, the programmer must have a line:

```c
#include <curses.h>
```

at the top of the program source. `ncurses` also installs this header as `<ncurses.h>`, so either name works with `ncurses`; `<curses.h>` also works with other implementations. The screen package uses the Standard I/O library, so `<curses.h>` includes `<stdio.h>`. It is redundant (but harmless) for the programmer to include it too.

To link the program with `ncurses`, add `-lncurses` to your LDFLAGS or to the command line:

```sh
gcc program.c -lncurses
```

If `ncurses` was configured with `--with-termlib`, its low-level terminfo functions are in a separate `tinfo` library, which a static link also needs. `pkg-config --libs ncurses` prints the options your installation needs. A program that uses wide characters links with `-lncursesw` instead.

## The program

**Example: The Hello World !!! Program**

```c
#include <stdlib.h>
#include <curses.h>

int
main(void)
{
    initscr();                  /* Start curses mode              */
    printw("Hello World !!!");  /* Print Hello World              */
    refresh();                  /* Print it on to the real screen */
    getch();                    /* Wait for user input */
    endwin();                   /* End curses mode                */

    return EXIT_SUCCESS;
}
```

The above program prints "Hello World !!!" to the screen, waits for a key, and exits. It shows how to initialize curses, do screen manipulation, and end curses mode. Let's dissect it line by line.

## `initscr()`

The function `initscr()` initializes the terminal in curses mode. It determines the terminal type and initializes the library's data structures, including the window for the whole screen, called `stdscr`. In some implementations, it clears the screen and presents a blank screen. To do any screen manipulation using the curses package, this has to be called first. In extreme cases this function might fail because there isn't enough memory to allocate the curses library's data structures.

After this is done, we can do a variety of initializations to customize our curses settings. These details are explained in [Initialization](initialization.md).

## The mysterious `refresh()`

The next line, `printw()`, prints the string "Hello World !!!" on to the screen. This function is analogous to the normal `printf()` in all respects except that it prints the data on a window called `stdscr` at the current (y,x) co-ordinates. Since our present co-ordinates are at 0,0 the string is printed at the left hand corner of the window.

This brings us to that mysterious `refresh()`. When we called `printw()`, the data was actually written to an imaginary window, which is not updated on the screen yet. The job of `printw()` is to update a few flags and data structures and write the data to a buffer corresponding to `stdscr`. In order to show it on the screen, we need to call `refresh()` and tell the curses system to dump the contents on the screen.

The philosophy behind all this is to allow the programmer to do multiple updates on the imaginary screen or windows and do a refresh once all the screen updates are done. `refresh()` checks the window and updates only the portion which has been changed. This improves performance and offers greater flexibility too. But it is sometimes frustrating to beginners. A common mistake committed by beginners is to forget to call `refresh()` after they did some update through the `printw()` class of functions. I still forget to add it sometimes :-)

## `endwin()`

And finally, don't forget to end the curses mode. Otherwise your terminal might behave strangely after the program quits. `endwin()` restores the terminal to the modes it had before curses started, moves the cursor to the lower left-hand corner of the screen, and makes the cursor visible again. It does not free the memory curses allocated; a later `refresh()` resumes curses mode. This function must be called after you are done with the curses mode.
