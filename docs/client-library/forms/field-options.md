# Field options, status and sizing

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

### Field Option Bits

There is also a large collection of field option bits you can set to control various aspects of forms processing. You can manipulate them with these functions:

```c
int set_field_opts(FIELD *field,          /* field to alter */
                   int attr);             /* attribute to set */

int field_opts_on(FIELD *field,           /* field to alter */
                  int attr);              /* attributes to turn on */

int field_opts_off(FIELD *field,          /* field to alter */
                   int attr);             /* attributes to turn off */

int field_opts(FIELD *field);             /* field to query */
```

By default, all options are on. Here are the available option bits:

`O_VISIBLE`  
Controls whether the field is visible on the screen. Can be used during form processing to hide or pop up fields depending on the value of parent fields.

`O_ACTIVE`  
Controls whether the field is active during forms processing (i.e. visited by form navigation keys). Can be used to make labels or derived fields with buffer values alterable by the forms application, not the user.

`O_PUBLIC`  
Controls whether data is displayed during field entry. If this option is turned off on a field, the library will accept and edit data in that field, but it will not be displayed and the visible field cursor will not move. You can turn off the `O_PUBLIC` bit to define password fields.

`O_EDIT`  
Controls whether the field's data can be modified. When this option is off, all editing requests except `REQ_PREV_CHOICE` and `REQ_NEXT_CHOICE` will fail. Such read-only fields may be useful for help messages.

`O_WRAP`  
Controls word-wrapping in multi-line fields. Normally, when any character of a (blank-separated) word reaches the end of the current line, the entire word is wrapped to the next line (assuming there is one). When this option is off, the word will be split across the line break.

`O_BLANK`  
Controls field blanking. When this option is on, entering a character at the first field position erases the entire field (except for the just-entered character).

`O_AUTOSKIP`  
Controls automatic skip to next field when this one fills. Normally, when the forms user tries to type more data into a field than will fit, the editing location jumps to next field. When this option is off, the user's cursor will hang at the end of the field. This option is ignored in dynamic fields that have not reached their size limit.

`O_NULLOK`  
Controls whether [validation](field-validation.md#field-validation) is applied to blank fields. Normally, it is not; the user can leave a field blank without invoking the usual validation check on exit. If this option is off on a field, exit from it will invoke a validation check.

`O_PASSOK`  
Controls whether validation occurs on every exit, or only after the field is modified. Normally the latter is true. Setting `O_PASSOK` may be useful if your field's validation function may change during forms processing.

`O_STATIC`  
Controls whether the field is fixed to its initial dimensions. If you turn this off, the field becomes [dynamic](#variable-sized-fields) and will stretch to fit entered data.

A field's options cannot be changed while the field is currently selected. However, options may be changed on posted fields that are not current.

The option values are bit-masks and can be composed with logical-or in the obvious way.

## Field Status

Every field has a status flag, which is set to FALSE when the field is created and TRUE when the value in field buffer 0 changes. This flag can be queried and set directly:

```c
int set_field_status(FIELD *field,      /* field to alter */
                   int status);         /* mode to set */

int field_status(FIELD *field);         /* fetch mode of field */
```

Setting this flag under program control can be useful if you use the same form repeatedly, looking for modified fields each time.

Calling `field_status()` on a field not currently selected for input will return a correct value. Calling `field_status()` on a field that is currently selected for input may not necessarily give a correct field status value, because entered data is not necessarily copied to buffer zero before the exit validation check. To guarantee that the returned status value reflects reality, call `field_status()` either (1) in the field's exit validation check routine, (2) from the field's or form's initialization or termination hooks, or (3) just after a `REQ_VALIDATION` request has been processed by the forms driver.

## Field User Pointer

Each field structure contains one character pointer slot that is not used by the forms library. It is intended to be used by applications to store private per-field data. You can manipulate it with:

```c
int set_field_userptr(FIELD *field,       /* field to alter */
                   char *userptr);        /* mode to set */

char *field_userptr(FIELD *field);        /* fetch mode of field */
```

(Properly, this user pointer field ought to have `(void *)` type. The `(char *)` type is retained for System V compatibility.)

It is valid to set the user pointer of the default field (with a `set_field_userptr()` call passed a NULL field pointer.) When a new field is created, the default-field user pointer is copied to initialize the new field's user pointer.

## Variable-Sized Fields

Normally, a field is fixed at the size specified for it at creation time. If, however, you turn off its `O_STATIC` bit, it becomes *dynamic* and will automatically resize itself to accommodate data as it is entered. If the field has extra buffers associated with it, they will grow right along with the main input buffer.

A one-line dynamic field will have a fixed height (1) but variable width, scrolling horizontally to display data within the field area as originally dimensioned and located. A multi-line dynamic field will have a fixed width, but variable height (number of rows), scrolling vertically to display data within the field area as originally dimensioned and located.

Normally, a dynamic field is allowed to grow without limit. But it is possible to set an upper limit on the size of a dynamic field. You do it with this function:

```c
int set_max_field(FIELD *field,     /* field to alter (may not be NULL) */
                   int max_size);   /* upper limit on field size */
```

If the field is one-line, `max_size` is taken to be a column size limit; if it is multi-line, it is taken to be a line size limit. To disable any limit, use an argument of zero. The growth limit can be changed whether or not the `O_STATIC` bit is on, but has no effect until it is.

The following properties of a field change when it becomes dynamic:

- If there is no growth limit, there is no final position of the field; therefore `O_AUTOSKIP` and `O_NL_OVERLOAD` are ignored.
- Field justification will be ignored (though whatever justification is set up will be retained internally and can be queried).
- The `dup_field()` and `link_field()` calls copy dynamic-buffer sizes. If the `O_STATIC` option is set on one of a collection of links, buffer resizing will occur only when the field is edited through that link.
- The call `field_info()` will retrieve the original static size of the field; use `dynamic_field_info()` to get the actual dynamic size.

A field's options cannot be changed while the field is currently selected. However, options may be changed on posted fields that are not current.

The option values are bit-masks and can be composed with logical-or in the obvious way. You have seen the usage of switching off `O_AUTOSKIP` option. The following example clarifies usage of some more options. Other options are explained where appropriate.

**Example: Field Options Usage example**

```c
#include <stdlib.h>
#include <form.h>

#define STARTX 15
#define STARTY 4
#define WIDTH 25

#define N_FIELDS 3

int
main(void)
{
    FIELD *field[N_FIELDS];
    FORM *my_form;
    int ch, i;

    /* Initialize curses */
    initscr();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);

    /* Initialize the fields */
    for (i = 0; i < N_FIELDS - 1; ++i)
        field[i] = new_field(1, WIDTH, STARTY + i * 2, STARTX, 0, 0);
    field[N_FIELDS - 1] = NULL;

    /* Set field options */
    set_field_back(field[1], A_UNDERLINE);      /* Print a line for the option  */

    field_opts_off(field[0], O_ACTIVE);         /* This field is a static label */
    field_opts_off(field[1], O_PUBLIC);         /* This field is like a password field */
    field_opts_off(field[1], O_AUTOSKIP);       /* To avoid entering the same field
                                                   after last character is entered */

    /* Create the form and post it */
    my_form = new_form(field);
    post_form(my_form);
    refresh();

    set_field_just(field[0], JUSTIFY_CENTER);   /* Center Justification */
    set_field_buffer(field[0], 0, "This is a static Field");
    /* Initialize the field  */
    mvprintw(STARTY, STARTX - 10, "Field 1:");
    mvprintw(STARTY + 2, STARTX - 10, "Field 2:");
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

This example, though useless, shows the usage of options. If used properly, they can present information very effectively in a form. The second field being not `O_PUBLIC`, does not show the characters you are typing.
