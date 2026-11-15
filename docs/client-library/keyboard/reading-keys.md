# Reading keys

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

As you have seen in almost all of the earlier examples, it is very easy to get key input from the user. A simple way of getting key presses is to use the `getch()` function. Enable cbreak mode to read keys when you are interested in individual key hits rather than complete lines of text (which usually end with a carriage return). Enable keypad to get the function keys, arrow keys and so on. [Initialization](../getting-started/initialization.md#keypad) has the details.

`getch()` returns an integer corresponding to the key pressed. If it is a normal character, the integer value is equal to the character. Otherwise it returns a number which can be matched with the constants defined in `curses.h`. For example, if the user presses F1, the integer returned is 265. This can be checked using the macro `KEY_F()` defined in `curses.h`. This makes reading keys portable and easy to manage.

For example, if you call `getch()` like this

```c
    int ch;

    ch = getch();
```

`getch()` waits for the user to press a key (unless you specified a timeout), and when the user presses a key, the corresponding integer is returned. Then you can check the value returned against the constants defined in `curses.h` to match the keys you want.

The following code piece does that job.

```c
    if (ch == KEY_LEFT)
        printw("Left arrow is pressed\n");
```

The [next page](key-usage-example.md) uses this to write a small menu that can be navigated with the up and down arrows.
