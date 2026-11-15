# Implementation details

## Behind the abstraction

The binding's types such as `Window`, `Panel`, `Menu` and `Form` are opaque representations of pointers to the corresponding low-level curses structures, such as `WINDOW *`, `PANEL *`, `MENU *` and `FORM *`. So you can safely pass them to C routines that expect a pointer to one of those structures.

## Extended `ripoffline()` usage

The [X/Open](../../glossary/x-open-curses.md) documentation of `ripoffline()` says that the line parameter only determines whether exactly one line is taken from the top or the bottom of the screen, so only the sign of the parameter matters. ncurses follows that in its public `ripoffline()`, which passes on only the sign. Internally, though, its `_nc_ripoffline()` function uses the parameter's absolute value as the number of lines to take, and the binding's `Rip_Off_Lines` routine calls that function directly.

## How user-defined field types work

The abstract tagged type `Field_Type` in `Terminal_Interface.Curses.Forms.Field_Types` is the root of every field type. For your own type, derive from `User_Defined_Field_Type` in the `Field_Types.User` package and implement its two abstract functions: `Field_Check`, which validates the whole field, and `Character_Check`, which validates each character as it's typed. `Set_Field_Type` then works for any type derived this way. The `User.Choice` child package adds a type for fields whose value is picked from a list.

## Enumeration fields

The binding copies the strings you give an enumeration field type, so the string arrays don't need to outlive the call that sets up the field. ncurses itself also copies the list for `TYPE_ENUM`, so you may use a list that lives in automatic variables in C as well.

## Using other Ada compilers

This should basically not be a problem.

## Porting to other curses implementations

It shouldn't be too hard to make the binding run on a regular SVr4 implementation of curses. The main problem is that ncurses has some extra features the binding presents. There are two ways to deal with each one:

- emulate the feature in the binding, or
- raise an exception for features that aren't implemented.

Most likely you would mix the two: some features are easy to emulate, and others are hard if not impossible.
