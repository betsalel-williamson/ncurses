# Forms library overview

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

The `form` library is a curses extension that supports easy programming of on-screen forms for data entry and program control.

The `form` library first appeared in AT&T System V. The version documented here is the `form` code distributed with `ncurses`.

A form is a collection of fields; each field may be either a label (explanatory text) or a data-entry location. Long forms may be segmented into pages; each entry to a new page clears the screen.

To make forms, you create groups of fields and connect them with form frame objects; the form library makes this relatively simple.

Once defined, a form can be *posted*, that is written to an associated window. Actually, each form has two associated windows; a containing window in which the programmer can scribble titles or borders, and a subwindow in which the form fields proper are displayed.

As the form user fills out the posted form, navigation and editing keys support movement between fields, editing keys support modifying field, and plain text adds to or changes data in a current field. The form library allows you (the forms designer) to bind each navigation and editing key to any keystroke accepted by `curses` Fields may have validation conditions on them, so that they check input data for type and value. The form library supplies a rich set of pre-defined field types, and makes it relatively easy to define new ones.

Once its transaction is completed (or aborted), a form may be *unposted* (that is, undisplayed), and finally freed to make the storage associated with it and its items available for re-use.

The general flow of control of a form program looks like this:

1.  Initialize `curses`.
2.  Create the form fields, using `new_field()`.
3.  Create the form using `new_form()`.
4.  Post the form using `post_form()`.
5.  Refresh the screen.
6.  Process user requests via an input loop.
7.  Unpost the form using `unpost_form()`.
8.  Free the form, using `free_form()`.
9.  Free the fields using `free_field()`.
10. Terminate `curses`.

Note that this looks much like a menu program; the form library handles tasks which are in many ways similar, and its interface was obviously designed to resemble that of the [menu library](../../../doc/html/ncurses-intro.html#menu) wherever possible.

In forms programs, however, the “process user requests” is somewhat more complicated than for menus. Besides menu-like navigation operations, the menu driver loop has to support field editing and data validation.
