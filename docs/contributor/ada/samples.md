# Sample programs

The `Ada95/samples` directory builds three programs:

- `tour`, the binding's demo, with menus, forms and built-in help
- `ncurses`, an Ada translation of the `ncurses` test program, chosen because it tests the most features
- `rain`, an Ada version of the `rain` test program

The demo isn't meant to show all the features of curses and its libraries, but to give sample sources for how to use the binding at all. Ideally, in the future, it can do both.

The keys below come from the demo's help text, `explain.txt`.

## Menu keys

| Key                   | Action                                   |
| --------------------- | ---------------------------------------- |
| Ctrl-X                | Exit the menu                            |
| Ctrl-N                | Go to the next item                      |
| Ctrl-P                | Go to the previous item                  |
| Ctrl-U                | Scroll up one line                       |
| Ctrl-D                | Scroll down one line                     |
| Ctrl-F, Page Down     | Scroll down one page                     |
| Ctrl-B, Page Up       | Scroll back one page                     |
| Ctrl-Y                | Clear the pattern                        |
| Ctrl-H, Backspace     | Delete the last character of the pattern |
| Ctrl-A                | Next pattern match                       |
| Ctrl-E                | Previous pattern match                   |
| Ctrl-T                | Toggle an item in a multi-selection menu |
| Return, Line Feed     | Select an item                           |
| Home                  | Go to the first item                     |
| End                   | Go to the last item                      |
| F3                    | Quit the menu                            |
| Arrow keys            | Move one item in that direction          |

## Form keys

| Key    | Action                                            |
| ------ | ------------------------------------------------- |
| Ctrl-X | Exit the form                                     |
| Ctrl-F | Go forward to the next field                      |
| Ctrl-B | Go backward to the previous field                 |
| Ctrl-L | Go to the field left of the current one           |
| Ctrl-R | Go to the field right of the current one          |
| Ctrl-U | Go to the field above the current one             |
| Ctrl-D | Go to the field below the current one             |
| Ctrl-W | Go to the next word in the field                  |
| Ctrl-T | Go to the previous word in the field              |
| Ctrl-A | Go to the beginning of the field                  |
| Ctrl-E | Go to the end of the field                        |
| Ctrl-I | Insert a blank character at the current position  |
| Ctrl-O | Insert a line                                     |
| Ctrl-V | Delete a character                                |
| Ctrl-H | Delete the previous character                     |
| Ctrl-Y | Delete a line                                     |
| Ctrl-G | Delete a word                                     |
| Ctrl-K | Clear to the end of the field                     |
| Ctrl-N | Next choice in a choice field (enumerations etc.) |
| Ctrl-P | Previous choice in a choice field                 |

In the help, scroll with the Up and Down arrow keys, and leave it with the function key labeled Quit.
