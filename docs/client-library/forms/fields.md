# Create fields and set their attributes

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

## Creating and Freeing Fields and Forms

The basic function for creating fields is `new_field()`:

```c
FIELD *new_field(int height, int width,   /* new field size */
                 int top, int left,       /* upper left corner */
                 int offscreen,           /* number of offscreen rows */
                 int nbuf);               /* number of working buffers */
```

Menu items always occupy a single row, but forms fields may have multiple rows. So `new_field()` requires you to specify a width and height (the first two arguments, which mist both be greater than zero).

You must also specify the location of the field's upper left corner on the screen (the third and fourth arguments, which must be zero or greater). Note that these coordinates are relative to the form subwindow, which will coincide with `stdscr` by default but need not be `stdscr` if you have done an explicit `set_form_win()` call.

The fifth argument allows you to specify a number of off-screen rows. If this is zero, the entire field will always be displayed. If it is nonzero, the form will be scrollable, with only one screen-full (initially the top part) displayed at any given time. If you make a field dynamic and grow it so it will no longer fit on the screen, the form will become scrollable even if the `offscreen` argument was initially zero.

The forms library allocates one working buffer per field; the size of each buffer is `((height + offscreen)*width + 1`, one character for each position in the field plus a NUL terminator. The sixth argument is the number of additional data buffers to allocate for the field; your application can use them for its own purposes.

```c
FIELD *dup_field(FIELD *field,            /* field to copy */
                 int top, int left);      /* location of new copy */
```

The function `dup_field()` duplicates an existing field at a new location. Size and buffering information are copied; some attribute flags and status bits are not (see the `form_field_new(3X)` for details).

```c
FIELD *link_field(FIELD *field,           /* field to copy */
                  int top, int left);     /* location of new copy */
```

The function `link_field()` also duplicates an existing field at a new location. The difference from `dup_field()` is that it arranges for the new field's buffer to be shared with the old one.

Besides the obvious use in making a field editable from two different form pages, linked fields give you a way to hack in dynamic labels. If you declare several fields linked to an original, and then make them inactive, changes from the original will still be propagated to the linked fields.

As with duplicated fields, linked fields have attribute bits separate from the original.

As you might guess, all these field-allocations return `NULL` if the field allocation is not possible due to an out-of-memory error or out-of-bounds arguments.

To connect fields to a form, use

```c
FORM *new_form(FIELD **fields);
```

This function expects to see a NULL-terminated array of field pointers. Said fields are connected to a newly-allocated form object; its address is returned (or else NULL if the allocation fails).

Note that `new_field()` does *not* copy the pointer array into private storage; if you modify the contents of the pointer array during forms processing, all manner of bizarre things might happen. Also note that any given field may only be connected to one form.

The functions `free_field()` and `free_form` are available to free field and form objects. It is an error to attempt to free a field connected to a form, but not vice-versa; thus, you will generally free your form objects first.

## Fetching and Changing Field Attributes

Each form field has a number of location and size attributes associated with it. There are other field attributes used to control display and editing of the field. Some (for example, the `O_STATIC` bit) involve sufficient complications to be covered in sections of their own later on. We cover the functions used to get and set several basic attributes here.

When a field is created, the attributes not specified by the `new_field` function are copied from an invisible system default field. In attribute-setting and -fetching functions, the argument NULL is taken to mean this field. Changes to it persist as defaults until your forms application terminates.

### Fetching Size and Location Data

You can retrieve field sizes and locations through:

```c
int field_info(FIELD *field,              /* field from which to fetch */
               int *height, *int width,   /* field size */
               int *top, int *left,       /* upper left corner */
               int *offscreen,            /* number of offscreen rows */
               int *nbuf);                /* number of working buffers */
```

This function is a sort of inverse of `new_field()`; instead of setting size and location attributes of a new field, it fetches them from an existing one.

### Changing the Field Location

It is possible to move a field's location on the screen:

```c
int move_field(FIELD *field,              /* field to alter */
               int top, int left);        /* new upper-left corner */
```

You can, of course. query the current location through `field_info()`.

### The Justification Attribute

One-line fields may be unjustified, justified right, justified left, or centered. Here is how you manipulate this attribute:

```c
int set_field_just(FIELD *field,          /* field to alter */
                   int justmode);         /* mode to set */

int field_just(FIELD *field);             /* fetch mode of field */
```

The mode values accepted and returned by this functions are preprocessor macros `NO_JUSTIFICATION`, `JUSTIFY_RIGHT`, `JUSTIFY_LEFT`, or `JUSTIFY_CENTER`.

### Field Display Attributes

For each field, you can set a foreground attribute for entered characters, a background attribute for the entire field, and a pad character for the unfilled portion of the field. You can also control pagination of the form.

This group of four field attributes controls the visual appearance of the field on the screen, without affecting in any way the data in the field buffer.

```c
int set_field_fore(FIELD *field,          /* field to alter */
                   chtype attr);          /* attribute to set */

chtype field_fore(FIELD *field);          /* field to query */

int set_field_back(FIELD *field,          /* field to alter */
                   chtype attr);          /* attribute to set */

chtype field_back(FIELD *field);          /* field to query */

int set_field_pad(FIELD *field,           /* field to alter */
                 int pad);                /* pad character to set */

chtype field_pad(FIELD *field);         /* returns present pad character */

int set_new_page(FIELD *field,            /* field to alter */
                 int flag);               /* TRUE to force new page */

chtype new_page(FIELD *field);            /* field to query */
```

The attributes set and returned by the first four functions are normal `curses(3x)` display attribute values (`A_STANDOUT`, `A_BOLD`, `A_REVERSE` etc). The page bit of a field controls whether it is displayed at the start of a new form screen.

Though above functions seem quite simple, using colors with set_field_fore() may be frustrating in the beginning. Let me first explain about foreground and background attributes of a field. The foreground attribute is associated with the character. That means a character in the field is printed with the attribute you have set with set_field_fore(). Background attribute is the attribute used to fill background of field, whether any character is there or not. So what about colors? Since colors are always defined in pairs, what is the right way to display colored fields? Here's an example clarifying color attributes.

**Example: Form Attributes example**

```c
#include <stdlib.h>
#include <form.h>

int
main(void)
{
    FIELD *field[3];
    FORM *my_form;
    int ch;

    /* Initialize curses */
    initscr();
    start_color();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);

    /* Initialize few color pairs */
    init_pair(1, COLOR_WHITE, COLOR_BLUE);
    init_pair(2, COLOR_WHITE, COLOR_BLUE);

    /* Initialize the fields */
    field[0] = new_field(1, 10, 4, 18, 0, 0);
    field[1] = new_field(1, 10, 6, 18, 0, 0);
    field[2] = NULL;

    /* Set field options */
    set_field_fore(field[0], COLOR_PAIR(1));    /* Put the field with blue background */
    set_field_back(field[0], COLOR_PAIR(2));    /* and white foreground (characters
                                                   are printed in white         */
    field_opts_off(field[0], O_AUTOSKIP);       /* Don't go to next field when this
                                                   Field is filled up           */
    set_field_back(field[1], A_UNDERLINE);
    field_opts_off(field[1], O_AUTOSKIP);

    /* Create the form and post it */
    my_form = new_form(field);
    post_form(my_form);
    refresh();

    set_current_field(my_form, field[0]);       /* Set focus to the colored field */
    mvprintw(4, 10, "Value 1:");
    mvprintw(6, 10, "Value 2:");
    mvprintw(LINES - 2, 0,
             "Use UP, DOWN arrow keys to switch between fields");
    refresh();

    /* Loop through to get user requests */
    while ((ch = getch()) != KEY_F(1)) {
        switch (ch) {
        case KEY_DOWN:
            /* Go to next field */
            form_driver(my_form, REQ_NEXT_FIELD);
            /* Go to the end of the present buffer */
            /* Leaves nicely at the last character */
            form_driver(my_form, REQ_END_LINE);
            break;
        case KEY_UP:
            /* Go to previous field */
            form_driver(my_form, REQ_PREV_FIELD);
            form_driver(my_form, REQ_END_LINE);
            break;
        default:
            /* If this is a normal character, it gets */
            /* Printed                                */
            form_driver(my_form, ch);
            break;
        }
    }

    /* Un post form and free the memory */
    unpost_form(my_form);
    free_form(my_form);
    free_field(field[0]);
    free_field(field[1]);

    endwin();
    return EXIT_SUCCESS;
}
```

Play with the color pairs and try to understand the foreground and background attributes. In my programs using color attributes, I usually set only the background with set_field_back(). Curses simply doesn't allow defining individual color attributes.
