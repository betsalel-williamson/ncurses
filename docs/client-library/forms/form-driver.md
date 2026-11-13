# Process input with the form driver

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## Input Processing in the Forms Driver

The function `form_driver()` handles virtualized input requests for form navigation, editing, and validation requests, just as `menu_driver` does for menus (see the section on [menu input handling](../../../doc/html/ncurses-intro.html#minput)).

```c
int form_driver(FORM *form,               /* form to pass input to */
                int request);             /* form request code */
```

Your input virtualization function needs to take input and then convert it to either an alphanumeric character (which is treated as data to be entered in the currently-selected field), or a forms processing request.

The forms driver provides hooks (through input-validation and field-termination functions) with which your application code can check that the input taken by the driver matched what was expected.

### Page Navigation Requests

These requests cause page-level moves through the form, triggering display of a new form screen.

`REQ_NEXT_PAGE`  
Move to the next form page.

`REQ_PREV_PAGE`  
Move to the previous form page.

`REQ_FIRST_PAGE`  
Move to the first form page.

`REQ_LAST_PAGE`  
Move to the last form page.

These requests treat the list as cyclic; that is, `REQ_NEXT_PAGE` from the last page goes to the first, and `REQ_PREV_PAGE` from the first page goes to the last.

### Inter-Field Navigation Requests

These requests handle navigation between fields on the same page.

`REQ_NEXT_FIELD`  
Move to next field.

`REQ_PREV_FIELD`  
Move to previous field.

`REQ_FIRST_FIELD`  
Move to the first field.

`REQ_LAST_FIELD`  
Move to the last field.

`REQ_SNEXT_FIELD`  
Move to sorted next field.

`REQ_SPREV_FIELD`  
Move to sorted previous field.

`REQ_SFIRST_FIELD`  
Move to the sorted first field.

`REQ_SLAST_FIELD`  
Move to the sorted last field.

`REQ_LEFT_FIELD`  
Move left to field.

`REQ_RIGHT_FIELD`  
Move right to field.

`REQ_UP_FIELD`  
Move up to field.

`REQ_DOWN_FIELD`  
Move down to field.

These requests treat the list of fields on a page as cyclic; that is, `REQ_NEXT_FIELD` from the last field goes to the first, and `REQ_PREV_FIELD` from the first field goes to the last. The order of the fields for these (and the `REQ_FIRST_FIELD` and `REQ_LAST_FIELD` requests) is simply the order of the field pointers in the form array (as set up by `new_form()` or `set_form_fields()`

It is also possible to traverse the fields as if they had been sorted in screen-position order, so the sequence goes left-to-right and top-to-bottom. To do this, use the second group of four sorted-movement requests.

Finally, it is possible to move between fields using visual directions up, down, right, and left. To accomplish this, use the third group of four requests. Note, however, that the position of a form for purposes of these requests is its upper-left corner.

For example, suppose you have a multi-line field B, and two single-line fields A and C on the same line with B, with A to the left of B and C to the right of B. A `REQ_MOVE_RIGHT` from A will go to B only if A, B, and C *all* share the same first line; otherwise it will skip over B to C.

### Intra-Field Navigation Requests

These requests drive movement of the edit cursor within the currently selected field.

`REQ_NEXT_CHAR`  
Move to next character.

`REQ_PREV_CHAR`  
Move to previous character.

`REQ_NEXT_LINE`  
Move to next line.

`REQ_PREV_LINE`  
Move to previous line.

`REQ_NEXT_WORD`  
Move to next word.

`REQ_PREV_WORD`  
Move to previous word.

`REQ_BEG_FIELD`  
Move to beginning of field.

`REQ_END_FIELD`  
Move to end of field.

`REQ_BEG_LINE`  
Move to beginning of line.

`REQ_END_LINE`  
Move to end of line.

`REQ_LEFT_CHAR`  
Move left in field.

`REQ_RIGHT_CHAR`  
Move right in field.

`REQ_UP_CHAR`  
Move up in field.

`REQ_DOWN_CHAR`  
Move down in field.

Each *word* is separated from the previous and next characters by whitespace. The commands to move to beginning and end of line or field look for the first or last non-pad character in their ranges.

### Scrolling Requests

Fields that are dynamic and have grown and fields explicitly created with offscreen rows are scrollable. One-line fields scroll horizontally; multi-line fields scroll vertically. Most scrolling is triggered by editing and intra-field movement (the library scrolls the field to keep the cursor visible). It is possible to explicitly request scrolling with the following requests:

`REQ_SCR_FLINE`  
Scroll vertically forward a line.

`REQ_SCR_BLINE`  
Scroll vertically backward a line.

`REQ_SCR_FPAGE`  
Scroll vertically forward a page.

`REQ_SCR_BPAGE`  
Scroll vertically backward a page.

`REQ_SCR_FHPAGE`  
Scroll vertically forward half a page.

`REQ_SCR_BHPAGE`  
Scroll vertically backward half a page.

`REQ_SCR_FCHAR`  
Scroll horizontally forward a character.

`REQ_SCR_BCHAR`  
Scroll horizontally backward a character.

`REQ_SCR_HFLINE`  
Scroll horizontally one field width forward.

`REQ_SCR_HBLINE`  
Scroll horizontally one field width backward.

`REQ_SCR_HFHALF`  
Scroll horizontally one half field width forward.

`REQ_SCR_HBHALF`  
Scroll horizontally one half field width backward.

For scrolling purposes, a *page* of a field is the height of its visible part.

### Editing Requests

When you pass the forms driver an ASCII character, it is treated as a request to add the character to the field's data buffer. Whether this is an insertion or a replacement depends on the field's edit mode (insertion is the default.

The following requests support editing the field and changing the edit mode:

`REQ_INS_MODE`  
Set insertion mode.

`REQ_OVL_MODE`  
Set overlay mode.

`REQ_NEW_LINE`  
New line request (see below for explanation).

`REQ_INS_CHAR`  
Insert space at character location.

`REQ_INS_LINE`  
Insert blank line at character location.

`REQ_DEL_CHAR`  
Delete character at cursor.

`REQ_DEL_PREV`  
Delete previous word at cursor.

`REQ_DEL_LINE`  
Delete line at cursor.

`REQ_DEL_WORD`  
Delete word at cursor.

`REQ_CLR_EOL`  
Clear to end of line.

`REQ_CLR_EOF`  
Clear to end of field.

`REQ_CLEAR_FIELD`  
Clear entire field.

The behavior of the `REQ_NEW_LINE` and `REQ_DEL_PREV` requests is complicated and partly controlled by a pair of forms options. The special cases are triggered when the cursor is at the beginning of a field, or on the last line of the field.

First, we consider `REQ_NEW_LINE`:

The normal behavior of `REQ_NEW_LINE` in insert mode is to break the current line at the position of the edit cursor, inserting the portion of the current line after the cursor as a new line following the current and moving the cursor to the beginning of that new line (you may think of this as inserting a newline in the field buffer).

The normal behavior of `REQ_NEW_LINE` in overlay mode is to clear the current line from the position of the edit cursor to end of line. The cursor is then moved to the beginning of the next line.

However, `REQ_NEW_LINE` at the beginning of a field, or on the last line of a field, instead does a `REQ_NEXT_FIELD`. `O_NL_OVERLOAD` option is off, this special action is disabled.

Now, let us consider `REQ_DEL_PREV`:

The normal behavior of `REQ_DEL_PREV` is to delete the previous character. If insert mode is on, and the cursor is at the start of a line, and the text on that line will fit on the previous one, it instead appends the contents of the current line to the previous one and deletes the current line (you may think of this as deleting a newline from the field buffer).

However, `REQ_DEL_PREV` at the beginning of a field is instead treated as a `REQ_PREV_FIELD`.

If the `O_BS_OVERLOAD` option is off, this special action is disabled and the forms driver just returns `E_REQUEST_DENIED`.

See [Form Options](hooks-and-form-options.md#form-options) for discussion of how to set and clear the overload options.

### Order Requests

If the type of your field is ordered, and has associated functions for getting the next and previous values of the type from a given value, there are requests that can fetch that value into the field buffer:

`REQ_NEXT_CHOICE`  
Place the successor value of the current value in the buffer.

`REQ_PREV_CHOICE`  
Place the predecessor value of the current value in the buffer.

Of the built-in field types, only `TYPE_ENUM` has built-in successor and predecessor functions. When you define a field type of your own (see [Custom Validation Types](custom-field-types.md#custom-validation-types)), you can associate our own ordering functions.

### Application Commands

Form requests are represented as integers above the `curses` value greater than `KEY_MAX` and less than or equal to the constant `MAX_COMMAND`. If your input-virtualization routine returns a value above `MAX_COMMAND`, the forms driver will ignore it.
