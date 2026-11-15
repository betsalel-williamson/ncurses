# Characters and strings

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

The functions that get input from the user can be divided into three categories:

- the `getch()` class: get a character
- the `scanw()` class: get [formatted input](scanw.md)
- the `getstr()` class: get strings

## The `getch()` class of functions

These functions read a single character from the terminal. `getch()` is the complement of [`addch()`](../output/characters-and-strings.md): if echo is set, it calls `addch()` to echo the character.

There are several subtle facts to consider. If you don't use the function [`cbreak()`](../../glossary/cbreak-mode.md), curses will not read your input characters contiguously, but will begin reading them only after a newline or an EOF is encountered. Since the screen package needs to know what is on the terminal at all times, if characters are to be echoed, the terminal must be in raw or cbreak mode. Initially the terminal has echoing enabled and is in ordinary "cooked" mode, so one or the other has to be changed before calling `getch()`; otherwise, the program's output will be unpredictable. Use `cbreak()` so that characters are immediately available to your program.

Another widely used function is `noecho()`. As the name suggests, when this function is used, the characters that are keyed in by the user will not show up on the screen. The two functions `cbreak()` and `noecho()` are typical examples of key management; [Initialization](../getting-started/initialization.md) explains them.

To read arrow and function keys, call `keypad(stdscr, TRUE)`, which [Initialization](../getting-started/initialization.md#keypad) also explains. With this feature, the `getch()` code watches the input stream for character sequences that correspond to arrow and function keys. These sequences are returned as pseudo-character values. The `#define` values returned are listed in `curses.h`. The mapping from sequences to `#define` values is determined by the `key_` [capabilities](../../glossary/terminal-capability.md) in the terminal's [terminfo](../../glossary/terminfo.md) entry.

## The `getstr()` class of functions

These functions are used to get strings from the terminal. In essence, this function performs the same task as would be achieved by a series of calls to `getch()` until a newline, carriage return or end-of-file is received. The resulting string of characters is pointed to by `str`, which is a character pointer provided by the user. If echo is set, the characters are echoed as they are typed.

`getstr()` doesn't know how big the buffer behind `str` is, and ncurses lets it write up to `LINE_MAX` characters, usually 2048. To avoid overrunning the buffer, use `getnstr()` (or `wgetnstr()`), which reads at most `n` characters and beeps at any more.

## A simple getstr example

**Example: A Simple getstr example**

```c
#include <stdlib.h>
#include <curses.h>
#include <string.h>

int
main(void)
{
    /* message to appear on the screen */
    char mesg[] = "Enter a string: ";
    char str[80];
    /* to store the number of rows and the number of columns of the screen */
    int row, col;

    /* start the curses mode */
    initscr();
    /* get the number of rows and columns */
    getmaxyx(stdscr, row, col);
    /* print the message at the center of the screen */
    mvprintw(row / 2, (col - (int) strlen(mesg)) / 2, "%s", mesg);
    /* read at most sizeof(str) - 1 characters, leaving room for the null */
    getnstr(str, (int) sizeof(str) - 1);
    mvprintw(LINES - 2, 0, "You Entered: %s", str);
    getch();
    endwin();

    return EXIT_SUCCESS;
}
```

Type a line and press Enter. The program shows what you typed, and the next key ends it. While `getnstr()` is reading the line, F1 is ignored, like the other function keys.
