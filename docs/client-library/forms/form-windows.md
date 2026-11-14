# Form windows and display

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

## Attributes of Forms

As with field attributes, form attributes inherit a default from a system default form structure. These defaults can be queried or set by of these functions using a form-pointer argument of `NULL`.

The principal attribute of a form is its field list. You can query and change this list with:

```c
int set_form_fields(FORM *form,           /* form to alter */
                    FIELD **fields);      /* fields to connect */

char *form_fields(FORM *form);            /* fetch fields of form */

int field_count(FORM *form);              /* count connect fields */
```

The second argument of `set_form_fields()` may be a NULL-terminated field pointer array like the one required by `new_form()`. In that case, the old fields of the form are disconnected but not freed (and eligible to be connected to other forms), then the new fields are connected.

It may also be null, in which case the old fields are disconnected (and not freed) but no new ones are connected.

The `field_count()` function simply counts the number of fields connected to a given from. It returns -1 if the form-pointer argument is NULL.

## Control of Form Display

In the overview section, you saw that to display a form you normally start by defining its size (and fields), posting it, and refreshing the screen. There is an hidden step before posting, which is the association of the form with a frame window (actually, a pair of windows) within which it will be displayed. By default, the forms library associates every form with the full-screen window `stdscr`.

By making this step explicit, you can associate a form with a declared frame window on your screen display. This can be useful if you want to adapt the form display to different screen sizes, dynamically tile forms on the screen, or use a form as part of an interface layout managed by [panels](../../../doc/html/ncurses-intro.html#panels).

The two windows associated with each form have the same functions as their analogues in the [menu library](../../../doc/html/ncurses-intro.html#menu). Both these windows are painted when the form is posted and erased when the form is unposted.

The outer or frame window is not otherwise touched by the form routines. It exists so the programmer can associate a title, a border, or perhaps help text with the form and have it properly refreshed or erased at post/unpost time. The inner window or subwindow is where the current form page is actually displayed.

In order to declare your own frame window for a form, you will need to know the size of the form's bounding rectangle. You can get this information with:

```c
int scale_form(FORM *form,                /* form to query */
               int *rows,                 /* form rows */
               int *cols);                /* form cols */
```

The form dimensions are passed back in the locations pointed to by the arguments. Once you have this information, you can use it to declare of windows, then use one of these functions:

```c
int set_form_win(FORM *form,              /* form to alter */
                 WINDOW *win);            /* frame window to connect */

WINDOW *form_win(FORM *form);             /* fetch frame window of form */

int set_form_sub(FORM *form,              /* form to alter */
                 WINDOW *win);            /* form subwindow to connect */

WINDOW *form_sub(FORM *form);             /* fetch form subwindow of form */
```

Note that curses operations, including `refresh()`, on the form, should be done on the frame window, not the form subwindow.

It is possible to check from your application whether all of a scrollable field is actually displayed within the menu subwindow. Use these functions:

```c
int data_ahead(FORM *form);               /* form to be queried */

int data_behind(FORM *form);              /* form to be queried */
```

The function `data_ahead()` returns TRUE if (a) the current field is one-line and has undisplayed data off to the right, (b) the current field is multi-line and there is data off-screen below it.

The function `data_behind()` returns TRUE if the first (upper left hand) character position is off-screen (not being displayed).

Finally, there is a function to restore the form window's cursor to the value expected by the forms driver:

```c
int pos_form_cursor(FORM *)               /* form to be queried */
```

If your application changes the form window cursor, call this function before handing control back to the forms driver in order to re-synchronize it.

## Form Windows

The form windows concept is pretty much similar to menu windows. Every form is associated with a main window and a sub window. The form main window displays any title or border associated or whatever the user wishes. Then the sub window contains all the fields and displays them according to their position. This gives the flexibility of manipulating fancy form displaying very easily.

Since this is pretty much similar to menu windows, I am providing an example with out much explanation. The functions are similar and they work the same way.

**Example: Form Windows Example**

```c
#include <stdlib.h>
#include <string.h>
#include <form.h>

static void
print_in_middle(WINDOW *win, int starty, int startx,
                int width, const char *string, chtype color)
{
    int length, x, y;
    float temp;

    if (win == NULL)
        win = stdscr;
    getyx(win, y, x);
    if (startx != 0)
        x = startx;
    if (starty != 0)
        y = starty;
    if (width == 0)
        width = 80;

    length = (int) strlen(string);
    temp = (float) (width - length) / 2;
    x = startx + (int) temp;
    wattron(win, color);
    mvwprintw(win, y, x, "%s", string);
    wattroff(win, color);
    refresh();
}

int
main(void)
{
    FIELD *field[3];
    FORM *my_form;
    WINDOW *my_form_win;
    int ch, rows, cols;

    /* Initialize curses */
    initscr();
    start_color();
    cbreak();
    noecho();
    keypad(stdscr, TRUE);

    /* Initialize few color pairs */
    init_pair(1, COLOR_RED, COLOR_BLACK);

    /* Initialize the fields */
    field[0] = new_field(1, 10, 6, 1, 0, 0);
    field[1] = new_field(1, 10, 8, 1, 0, 0);
    field[2] = NULL;

    /* Set field options */
    set_field_back(field[0], A_UNDERLINE);
    field_opts_off(field[0], O_AUTOSKIP);
    /* Don't go to next field when this */
    /* Field is filled up             */
    set_field_back(field[1], A_UNDERLINE);
    field_opts_off(field[1], O_AUTOSKIP);

    /* Create the form and post it */
    my_form = new_form(field);

    /* Calculate the area required for the form */
    scale_form(my_form, &rows, &cols);

    /* Create the window to be associated with the form */
    my_form_win = newwin(rows + 4, cols + 4, 4, 4);
    keypad(my_form_win, TRUE);

    /* Set main window and sub window */
    set_form_win(my_form, my_form_win);
    set_form_sub(my_form, derwin(my_form_win, rows, cols, 2, 2));

    /* Print a border around the main window and print a title */
    box(my_form_win, 0, 0);
    print_in_middle(my_form_win, 1, 0, cols + 4, "My Form", COLOR_PAIR(1));

    post_form(my_form);
    wrefresh(my_form_win);

    mvprintw(LINES - 2, 0,
             "Use UP, DOWN arrow keys to switch between fields");
    refresh();

    /* Loop through to get user requests */
    while ((ch = wgetch(my_form_win)) != KEY_F(1)) {
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
