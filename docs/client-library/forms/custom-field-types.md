# Define custom field types

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

## Custom Validation Types

The `form` library gives you the capability to define custom validation types of your own. Further, the optional additional arguments of `set_field_type` effectively allow you to parameterize validation types. Most of the complications in the validation-type interface have to do with the handling of the additional arguments within custom validation functions.

### Union Types

The simplest way to create a custom data type is to compose it from two preexisting ones:

```c
FIELD *link_fieldtype(FIELDTYPE *type1,
                      FIELDTYPE *type2);
```

This function creates a field type that will accept any of the values legal for either of its argument field types (which may be either predefined or programmer-defined). If a `set_field_type()` call later requires arguments, the new composite type expects all arguments for the first type, than all arguments for the second. Order functions (see [Order Requests](form-driver.md#order-requests)) associated with the component types will work on the composite; what it does is check the validation function for the first type, then for the second, to figure what type the buffer contents should be treated as.

### New Field Types

To create a field type from scratch, you need to specify one or both of the following things:

- A character-validation function, to check each character as it is entered.
- A field-validation function to be applied on exit from the field.

Here is how you do that:

```c
typedef int     (*HOOK)();                 /* pointer to function returning int */

FIELDTYPE *new_fieldtype(HOOK f_validate,  /* field validator */
                         HOOK c_validate); /* character validator */

int free_fieldtype(FIELDTYPE *ftype);      /* type to free */
```

At least one of the arguments of `new_fieldtype()` must be non-NULL. The forms driver will automatically call the new type's validation functions at appropriate points in processing a field of the new type.

The function `free_fieldtype()` deallocates the argument fieldtype, freeing all storage associated with it.

Normally, a field validator is called when the user attempts to leave the field. Its first argument is a field pointer, from which it can get to field buffer 0 and test it. If the function returns TRUE, the operation succeeds; if it returns FALSE, the edit cursor stays in the field.

A character validator gets the character passed in as a first argument. It too should return TRUE if the character is valid, FALSE otherwise.

### Validation Function Arguments

Your field- and character- validation functions will be passed a second argument as well. This second argument is the address of a structure (which we will call a *pile*) built from any of the field-type-specific arguments passed to `set_field_type()`. If no such arguments are defined for the field type, this pile pointer argument will be NULL.

In order to arrange for such arguments to be passed to your validation functions, you must associate a small set of storage-management functions with the type. The forms driver will use these to synthesize a pile from the trailing arguments of each `set_field_type()` argument, and a pointer to the pile will be passed to the validation functions.

Here is how you make the association:

```c
typedef char    *(*PTRHOOK)();            /* pointer to function returning (char *) */
typedef void    (*VOIDHOOK)();            /* pointer to function returning void */

int set_fieldtype_arg(FIELDTYPE *type,    /* type to alter */
                      PTRHOOK make_str,   /* make structure from args */
                      PTRHOOK copy_str,   /* make copy of structure */
                      VOIDHOOK free_str); /* free structure storage */
```

Here is how the storage-management hooks are used:

`make_str`  
This function is called by `set_field_type()`. It gets one argument, a `va_list` of the type-specific arguments passed to `set_field_type()`. It is expected to return a pile pointer to a data structure that encapsulates those arguments.

`copy_str`  
This function is called by form library functions that allocate new field instances. It is expected to take a pile pointer, copy the pile to allocated storage, and return the address of the pile copy.

`free_str`  
This function is called by field- and type-deallocation routines in the library. It takes a pile pointer argument, and is expected to free the storage of that pile.

The `make_str` and `copy_str` functions may return NULL to signal allocation failure. The library routines will that call them will return error indication when this happens. Thus, your validation functions should never see a NULL file pointer and need not check specially for it.

### Order Functions For Custom Types

Some custom field types are simply ordered in the same well-defined way that `TYPE_ENUM` is. For such types, it is possible to define successor and predecessor functions to support the `REQ_NEXT_CHOICE` and `REQ_PREV_CHOICE` requests. Here is how:

```c
typedef int     (*INTHOOK)();             /* pointer to function returning int */

int set_fieldtype_choice(FIELDTYPE *type, /* type to alter */
                         INTHOOK succ,    /* get successor value */
                         INTHOOK pred);   /* get predecessor value */
```

The successor and predecessor arguments will each be passed two arguments; a field pointer, and a pile pointer (as for the validation functions). They are expected to use the function `field_buffer()` to read the current value, and `set_field_buffer()` on buffer 0 to set the next or previous value. Either hook may return TRUE to indicate success (a legal next or previous value was set) or FALSE to indicate failure.

### Avoiding Problems

The interface for defining custom types is complicated and tricky. Rather than attempting to create a custom type entirely from scratch, you should start by studying the library source code for whichever of the pre-defined types seems to be closest to what you want.

Use that code as a model, and evolve it towards what you really want. You will avoid many problems and annoyances that way. The code in the `ncurses` library has been specifically exempted from the package copyright to support this.

If your custom type defines order functions, have do something intuitive with a blank field. A useful convention is to make the successor of a blank field the types minimum value, and its predecessor the maximum.
