# Validate field input

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## Field Validation

By default, a field will accept any data that will fit in its input buffer. However, it is possible to attach a validation type to a field. If you do this, any attempt to leave the field while it contains data that does not match the validation type will fail. Some validation types also have a character-validity check for each time a character is entered in the field.

A field's validation check (if any) is not called when `set_field_buffer()` modifies the input buffer, nor when that buffer is changed through a linked field.

The `form` library provides a rich set of pre-defined validation types, and gives you the capability to define custom ones of your own. You can examine and change field validation attributes with the following functions:

```c
int set_field_type(FIELD *field,          /* field to alter */
                   FIELDTYPE *ftype,      /* type to associate */
                   ...);                  /* additional arguments*/

FIELDTYPE *field_type(FIELD *field);      /* field to query */
```

The validation type of a field is considered an attribute of the field. As with other field attributes, Also, doing `set_field_type()` with a `NULL` field default will change the system default for validation of newly-created fields.

Here are the pre-defined validation types:

### `TYPE_ALPHA`

This field type accepts alphabetic data; no blanks, no digits, no special characters (this is checked at character-entry time). It is set up with:

```c
int set_field_type(FIELD *field,          /* field to alter */
                   TYPE_ALPHA,            /* type to associate */
                   int width);            /* maximum width of field */
```

The `width` argument sets a minimum width of data. Typically you will want to set this to the field width; if it is greater than the field width, the validation check will always fail. A minimum width of zero makes field completion optional.

### `TYPE_ALNUM`

This field type accepts alphabetic data and digits; no blanks, no special characters (this is checked at character-entry time). It is set up with:

```c
int set_field_type(FIELD *field,          /* field to alter */
                   TYPE_ALNUM,            /* type to associate */
                   int width);            /* maximum width of field */
```

The `width` argument sets a minimum width of data. As with `TYPE_ALPHA`, typically you will want to set this to the field width; if it is greater than the field width, the validation check will always fail. A minimum width of zero makes field completion optional.

### `TYPE_ENUM`

This type allows you to restrict a field's values to be among a specified set of string values (for example, the two-letter postal codes for U.S. states). It is set up with:

```c
int set_field_type(FIELD *field,          /* field to alter */
                   TYPE_ENUM,             /* type to associate */
                   char **valuelist;      /* list of possible values */
                   int checkcase;         /* case-sensitive? */
                   int checkunique);      /* must specify uniquely? */
```

The `valuelist` parameter must point at a NULL-terminated list of valid strings. The `checkcase` argument, if true, makes comparison with the string case-sensitive.

When the user exits a `TYPE_ENUM` field, the validation procedure tries to complete the data in the buffer to a valid entry. If a complete choice string has been entered, it is of course valid. But it is also possible to enter a prefix of a valid string and have it completed for you.

By default, if you enter such a prefix and it matches more than one value in the string list, the prefix will be completed to the first matching value. But the `checkunique` argument, if true, requires prefix matches to be unique in order to be valid.

The `REQ_NEXT_CHOICE` and `REQ_PREV_CHOICE` input requests can be particularly useful with these fields.

### `TYPE_INTEGER`

This field type accepts an integer. It is set up as follows:

```c
int set_field_type(FIELD *field,          /* field to alter */
                   TYPE_INTEGER,          /* type to associate */
                   int padding,           /* # places to zero-pad to */
                   int vmin, int vmax);   /* valid range */
```

Valid characters consist of an optional leading minus and digits. The range check is performed on exit. If the range maximum is less than or equal to the minimum, the range is ignored.

If the value passes its range check, it is padded with as many leading zero digits as necessary to meet the padding argument.

A `TYPE_INTEGER` value buffer can conveniently be interpreted with the C library function `atoi(3)`.

### `TYPE_NUMERIC`

This field type accepts a decimal number. It is set up as follows:

```c
int set_field_type(FIELD *field,              /* field to alter */
                   TYPE_NUMERIC,              /* type to associate */
                   int padding,               /* # places of precision */
                   double vmin, double vmax); /* valid range */
```

Valid characters consist of an optional leading minus and digits. possibly including a decimal point. If your system supports locale's, the decimal point character used must be the one defined by your locale. The range check is performed on exit. If the range maximum is less than or equal to the minimum, the range is ignored.

If the value passes its range check, it is padded with as many trailing zero digits as necessary to meet the padding argument.

A `TYPE_NUMERIC` value buffer can conveniently be interpreted with the C library function `atof(3)`.

### `TYPE_REGEXP`

This field type accepts data matching a regular expression. It is set up as follows:

```c
int set_field_type(FIELD *field,          /* field to alter */
                   TYPE_REGEXP,           /* type to associate */
                   char *regexp);         /* expression to match */
```

The syntax for regular expressions is that of `regcomp(3)`. The check for regular-expression match is performed on exit.

## Direct Field Buffer Manipulation

The chief attribute of a field is its buffer contents. When a form has been completed, your application usually needs to know the state of each field buffer. You can find this out with:

```c
char *field_buffer(FIELD *field,          /* field to query */
                   int bufindex);         /* number of buffer to query */
```

Normally, the state of the zero-numbered buffer for each field is set by the user's editing actions on that field. It is sometimes useful to be able to set the value of the zero-numbered (or some other) buffer from your application:

```c
int set_field_buffer(FIELD *field,        /* field to alter */
                   int bufindex,          /* number of buffer to alter */
                   char *value);          /* string value to set */
```

If the field is not large enough and cannot be resized to a sufficiently large size to contain the specified value, the value will be truncated to fit.

Calling `field_buffer()` with a null field pointer will raise an error. Calling `field_buffer()` on a field not currently selected for input will return a correct value. Calling `field_buffer()` on a field that is currently selected for input may not necessarily give a correct field buffer value, because entered data is not necessarily copied to buffer zero before the exit validation check. To guarantee that the returned buffer value reflects on-screen reality, call `field_buffer()` either (1) in the field's exit validation check routine, (2) from the field's or form's initialization or termination hooks, or (3) just after a `REQ_VALIDATION` request has been processed by the forms driver.
