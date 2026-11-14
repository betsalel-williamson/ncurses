# Compile and run a first form

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

Your form-using modules must import the form library declarations with

```c
          #include <form.h>
```

and must be linked explicitly with the forms library using an `-lform` argument. Note that they must also link the `ncurses` library with `-lncurses`. Many linkers are two-pass and will accept either order, but it is still good practice to put `-lform` first and `-lncurses` second.

**Example: Forms Basics**

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
    cbreak();
    noecho();
    keypad(stdscr, TRUE);

    /* Initialize the fields */
    field[0] = new_field(1, 10, 4, 18, 0, 0);
    field[1] = new_field(1, 10, 6, 18, 0, 0);
    field[2] = NULL;

    /* Set field options */
    set_field_back(field[0], A_UNDERLINE);      /* Print a line for the option  */
    field_opts_off(field[0], O_AUTOSKIP);       /* Don't go to next field when this
                                                   Field is filled up           */
    set_field_back(field[1], A_UNDERLINE);
    field_opts_off(field[1], O_AUTOSKIP);

    /* Create the form and post it */
    my_form = new_form(field);
    post_form(my_form);
    refresh();

    mvprintw(4, 10, "Value 1:");
    mvprintw(6, 10, "Value 2:");
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

Above example is pretty straight forward. It creates two fields with `new_field()`. new_field() takes height, width, starty, startx, number of offscreen rows and number of additional working buffers. The fifth argument number of offscreen rows specifies how much of the field to be shown. If it is zero, the entire field is always displayed otherwise the form will be scrollable when the user accesses not displayed parts of the field. The forms library allocates one buffer per field to store the data user enters. Using the last parameter to new_field() we can specify it to allocate some additional buffers. These can be used for any purpose you like.

After creating the fields, back ground attribute of both of them is set to an underscore with set_field_back(). The AUTOSKIP option is turned off using field_opts_off(). If this option is turned on, focus will move to the next field in the form once the active field is filled up completely.

After attaching the fields to the form, it is posted. Here on, user inputs are processed in the while loop, by making corresponding requests to form_driver. The details of all the requests to the form_driver() are explained later.
