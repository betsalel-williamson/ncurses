# Process input with the menu driver

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

The main loop of your menu-processing code should call `menu_driver()` repeatedly. The first argument of this routine is a menu pointer; the second is a menu command code. You should write an input-fetching routine that maps input characters to menu command codes, and pass its output to `menu_driver()`. The menu command codes are fully documented in `menu_driver(3X)`.

The second argument can be a navigational request, a printable character, or the `KEY_MOUSE` special key. `menu_driver()` accepts these requests:

```text
REQ_LEFT_ITEM      Move left to an item.
REQ_RIGHT_ITEM     Move right to an item.
REQ_UP_ITEM        Move up to an item.
REQ_DOWN_ITEM      Move down to an item.
REQ_SCR_ULINE      Scroll up a line.
REQ_SCR_DLINE      Scroll down a line.
REQ_SCR_DPAGE      Scroll down a page.
REQ_SCR_UPAGE      Scroll up a page.
REQ_FIRST_ITEM     Move to the first item.
REQ_LAST_ITEM      Move to the last item.
REQ_NEXT_ITEM      Move to the next item.
REQ_PREV_ITEM      Move to the previous item.
REQ_TOGGLE_ITEM    Select/deselect an item.
REQ_CLEAR_PATTERN  Clear the menu pattern buffer.
REQ_BACK_PATTERN   Delete the previous character from the pattern buffer.
REQ_NEXT_MATCH     Move to the next item matching the pattern match.
REQ_PREV_MATCH     Move to the previous item matching the pattern match.
```

Don't get overwhelmed by the number of requests. Here is what each group does.

## Moving between items

The simplest group of command codes is `REQ_NEXT_ITEM`, `REQ_PREV_ITEM`, `REQ_FIRST_ITEM`, `REQ_LAST_ITEM`, `REQ_UP_ITEM`, `REQ_DOWN_ITEM`, `REQ_LEFT_ITEM`, `REQ_RIGHT_ITEM`. These change the currently selected item. These requests may cause scrolling of the menu page if it is only partially displayed.

`REQ_LEFT_ITEM` and `REQ_RIGHT_ITEM` matter when a menu is displayed with more than one item per row, which you set with `set_menu_format()`. They move the current selection left or right. [Menu display, scrolling and columns](menu-display.md) has an example.

## Scrolling

There are explicit requests for scrolling which also change the current item (because the select location does not change, but the item there does). These are `REQ_SCR_DLINE`, `REQ_SCR_ULINE`, `REQ_SCR_DPAGE`, and `REQ_SCR_UPAGE`. If all the items in the menu cannot be displayed in the menu subwindow, the menu is scrollable, and these requests scroll it one line down or up, or one page down or up.

## Toggling an item

The `REQ_TOGGLE_ITEM` selects or deselects the current item. It is for use in multi-valued menus; if you use it with `O_ONEVALUE` on, you will get an error return (`E_REQUEST_DENIED`). You turn `O_ONEVALUE` off or on with `set_menu_opts()` or `menu_opts_off()`.

## Pattern matching

Each menu has an associated pattern buffer. The `menu_driver()` logic tries to accumulate printable characters passed in, in that buffer; when it matches a prefix of an item name, that item (or the next matching item) is selected. If appending a character yields no new match, that character is deleted from the pattern buffer, and `menu_driver()` returns `E_NO_MATCH`.

Some requests change the pattern buffer directly: `REQ_CLEAR_PATTERN`, `REQ_BACK_PATTERN`, `REQ_NEXT_MATCH`, `REQ_PREV_MATCH`. The latter two are useful when pattern buffer input matches more than one item in a multi-valued menu.

Each successful scroll or item navigation request clears the pattern buffer. It is also possible to set the pattern buffer explicitly with `set_menu_pattern()`.

## Mouse requests

If the second argument is the `KEY_MOUSE` special key, the associated mouse event is translated into one of the requests above. Only clicks in the user window (inside the menu display area or the decoration window) are handled:

- A click above the display region of the menu generates `REQ_SCR_ULINE`; a double-click generates `REQ_SCR_UPAGE`, and a triple-click generates `REQ_FIRST_ITEM`.
- A click below the display region generates `REQ_SCR_DLINE`; a double-click generates `REQ_SCR_DPAGE`, and a triple-click generates `REQ_LAST_ITEM`.
- A click on an item inside the display area moves the menu cursor to that item. A double-click on an item generates `REQ_TOGGLE_ITEM` and returns `E_UNKNOWN_COMMAND`, which signals that an application-specific action should run.

A click outside the user window, or one that can't be translated into a request, returns `E_REQUEST_DENIED`. With the `O_MOUSE_MENU` option on, a click that misses the menu is pushed back on the input queue instead, so another part of the program can handle it; see `menu_opts(3X)`.

## Application commands

Finally, menu driver requests above the constant `MAX_COMMAND` are considered application-specific commands. The `menu_driver()` code ignores them and returns `E_UNKNOWN_COMMAND`.
