# Field change hooks and form options

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## Field Change Hooks

It is possible to set function hooks to be executed whenever the current field or form changes. Here are the functions that support this:

```c
typedef void    (*HOOK)();       /* pointer to function returning void */

int set_form_init(FORM *form,    /* form to alter */
                  HOOK hook);    /* initialization hook */

HOOK form_init(FORM *form);      /* form to query */

int set_form_term(FORM *form,    /* form to alter */
                  HOOK hook);    /* termination hook */

HOOK form_term(FORM *form);      /* form to query */

int set_field_init(FORM *form,   /* form to alter */
                  HOOK hook);    /* initialization hook */

HOOK field_init(FORM *form);     /* form to query */

int set_field_term(FORM *form,   /* form to alter */
                  HOOK hook);    /* termination hook */

HOOK field_term(FORM *form);     /* form to query */
```

These functions allow you to either set or query four different hooks. In each of the set functions, the second argument should be the address of a hook function. These functions differ only in the timing of the hook call.

form_init  
This hook is called when the form is posted; also, just after each page change operation.

field_init  
This hook is called when the form is posted; also, just after each field change

field_term  
This hook is called just after field validation; that is, just before the field is altered. It is also called when the form is unposted.

form_term  
This hook is called when the form is unposted; also, just before each page change operation.

Calls to these hooks may be triggered

1.  When user editing requests are processed by the forms driver
2.  When the current page is changed by `set_current_field()` call
3.  When the current field is changed by a `set_form_page()` call

See <span id="ffocus">Field Change Commands</span> for discussion of the latter two cases.

You can set a default hook for all fields by passing one of the set functions a NULL first argument.

You can disable any of these hooks by (re)setting them to NULL, the default value.

## Field Change Commands

Normally, navigation through the form will be driven by the user's input requests. But sometimes it is useful to be able to move the focus for editing and viewing under control of your application, or ask which field it currently is in. The following functions help you accomplish this:

```c
int set_current_field(FORM *form,         /* form to alter */
                      FIELD *field);      /* field to shift to */

FIELD *current_field(FORM *form);         /* form to query */

int field_index(FORM *form,               /* form to query */
                FIELD *field);            /* field to get index of */
```

The function `field_index()` returns the index of the given field in the given form's field array (the array passed to `new_form()` or `set_form_fields()`).

The initial current field of a form is the first active field on the first page. The function `set_form_fields()` resets this.

It is also possible to move around by pages.

```c
int set_form_page(FORM *form,             /* form to alter */
                  int page);              /* page to go to (0-origin) */

int form_page(FORM *form);                /* return form's current page */
```

The initial page of a newly-created form is 0. The function `set_form_fields()` resets this.

## Form Options

Like fields, forms may have control option bits. They can be changed or queried with these functions:

```c
int set_form_opts(FORM *form,             /* form to alter */
                  int attr);              /* attribute to set */

int form_opts_on(FORM *form,              /* form to alter */
                 int attr);               /* attributes to turn on */

int form_opts_off(FORM *form,             /* form to alter */
                  int attr);              /* attributes to turn off */

int form_opts(FORM *form);                /* form to query */
```

By default, all options are on. Here are the available option bits:

O_NL_OVERLOAD  
Enable overloading of `REQ_NEW_LINE` as described in [Editing Requests](form-driver.md#editing-requests). The value of this option is ignored on dynamic fields that have not reached their size limit; these have no last line, so the circumstances for triggering a `REQ_NEXT_FIELD` never arise.

O_BS_OVERLOAD  
Enable overloading of `REQ_DEL_PREV` as described in [Editing Requests](form-driver.md#editing-requests).

The option values are bit-masks and can be composed with logical-or in the obvious way.
