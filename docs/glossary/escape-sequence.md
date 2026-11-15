# escape sequence

An **escape sequence** is a string of characters, usually starting with the Escape character, that a terminal treats as a command rather than as text to show: move the cursor, set bold, clear the screen. Keys that don't type a character, such as the arrow and function keys, send escape sequences to the program in the same way. Standards such as ECMA-48 (ANSI X3.64) define many of them, but terminals differ, so curses looks up the right sequences in the [terminfo](terminfo.md) description of the [terminal type](terminal-type.md) rather than writing them itself.

See [keypad mode](keypad-mode.md) for how curses reads them.
