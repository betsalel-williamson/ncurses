# Characters and strings

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

Now that curses is initialized, let's interact with the world. The basic functions used to change what will go on a window are `addch()` and `move()`. `addch()` adds a character at the current (y, x) coordinates. `move()` changes the current (y, x) coordinates to whatever you want them to be. It returns `ERR` if you try to move off the window.

There are three classes of functions which you can use to do output on screen:

- the `addch()` class: print a single character with [attributes](../../glossary/attribute.md)
- the `printw()` class: print formatted output similar to `printf()`
- the `addstr()` class: print strings

These functions can be used interchangeably, and it is a matter of style as to which class is used. The other output functions, such as `addstr()` and `printw()`, all add characters to the window as if by calling `addch()`.

## The `addch()` class of functions

These functions put a single character into the current cursor location and advance the position of the cursor. You can give the character to be printed, but they are usually used to print a character with some attributes. If a character is associated with an attribute (bold, reverse video and so on), when curses prints the character, it is printed in that attribute.

In order to combine a character with some attributes, you have two options:

- OR a single character with the desired attribute macros. These attribute macros can be found in the header file `ncurses.h`. For example, to print a character `ch` bold and underlined, you would call `addch()` as below.

  ```c
  addch(ch | A_BOLD | A_UNDERLINE);
  ```

- Use functions like `attrset()`, `attron()` and `attroff()`. Briefly, they manipulate the current attributes of the given window. Once set, the characters printed in the window are associated with the attributes until they are turned off.

Additionally, curses provides some special characters for character-based graphics, the [forms-drawing characters](forms-characters.md).

## `mvaddch()`, `waddch()` and `mvwaddch()`

`mvaddch()` is used to move the cursor to a given point, and then print. Thus, the calls

```c
/* moves the cursor to row row and column col */
move(row, col);
addch(ch);
```

can be replaced by

```c
mvaddch(row, col, ch);
```

`waddch()` is similar to `addch()`, except that it adds a character into the given window. (Note that `addch()` adds a character into the window [`stdscr`](../../glossary/stdscr.md).) In a similar fashion, the `mvwaddch()` function is used to add a character into the given window at the given coordinates. These names follow the library's [naming convention](../getting-started/naming-and-variables.md#function-naming-conventions).

Now we are familiar with the basic output function `addch()`. But if we want to print a string, it would be very annoying to print it character by character. Fortunately, ncurses provides `printf`-like and `puts`-like functions.

## The `addstr()` class of functions

`addstr()` is used to put a character string into a given window. This function is similar to calling `addch()` once for each character in a given string. There are other functions from this family, such as `mvaddstr()`, `mvwaddstr()` and `waddstr()`, which obey the naming convention of curses. (For example, `mvaddstr()` is similar to the respective calls `move()` and then `addstr()`.) Another function of this family is `addnstr()`, which takes an integer parameter `n` additionally. This function puts at most `n` characters into the screen. If `n` is -1, the entire string is added. ncurses treats any negative `n` the same way, but -1 is the value the standard documents.

## A word of caution

All these functions take the y coordinate first and then x in their arguments. A common mistake by beginners is to pass x, y in that order. If you are doing too many manipulations of (y, x) coordinates, think of dividing the screen into [windows](../windows/index.md) and manipulating each one separately.

## Make the terminal match

After you have put on the window what you want there, when you want the portion of the terminal covered by the window to be made to look like it, you must call `refresh()`. In order to optimize finding changes, `refresh()` assumes that any part of the window not changed since the last `refresh()` of that window has not been changed on the terminal, that is, that you have not refreshed a portion of the terminal with an overlapping window. If this is not the case, the routine `touchwin()` is provided to make it look like the entire window has been changed, thus making `refresh()` check the whole subsection of the terminal for changes.

If you call `wrefresh()` with `curscr` as its argument, the screen is cleared and repainted from what `curscr` says it looks like. This is useful for implementing a command which would redraw the screen in case it gets messed up.
