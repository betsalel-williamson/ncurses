# The Ada95 binding

> Adapted from *Ada95 Binding for ncurses*, by Jürgen Pfeifer, and the README files in the `Ada95` directory.

The Ada95 binding lets Ada programs use ncurses and its panel, menu and form libraries. This guide describes version 01.00 of the binding: how it maps curses onto Ada, what it leaves out, and how the packages are organized.

This edition corrects the claims that no longer match the binding's source, such as which features it lacks. The [errata](../../appendix/index.md) list each correction with what it was checked against.

## General remarks

- The functionality is modeled to be compatible with ncurses, a clone of the [SVr4](../../glossary/svr4.md) curses model. The binding was developed on Linux with ncurses and the [GNU Ada Translator](https://ftp.gnu.org/gnu/gcc/) (GNAT). It isn't guaranteed to work with older versions of ncurses or GNAT.
- You must have the m4 macro processor to build the binding. If you don't have it, you can get the [FSF version](https://ftp.gnu.org/pub/gnu/).
- Ada programs are supposed to be readable, so the binding uses expressive names instead of the cryptic curses ones. The build generates a [table of the curses names and their Ada names](../../../doc/html/ada/table.html).
- This isn't a typical one-to-one interface mapping. It's close to one-to-one on the functional level: each curses function has a counterpart in the binding with a more or less similar parameter list. It isn't one-to-one for the data types. Flat types such as [`chtype`](../../glossary/chtype.md) become records, so you don't need bit operations to mark an attributed character as bold: you just set the `Bold_Character` member of a `Character_Attribute_Set` record to true. The binding also hides structures such as `WINDOW`, `PANEL`, `MENU` and `FORM`. It's a purely functional API.
- The binding does as much error checking as is feasible, and raises an Ada exception when something goes wrong in the low-level curses. So curses programs get rigid error checking, but thanks to Ada you don't have to write C's sprawling error-checking style.
- The binding doesn't support wide characters.

## Guide

- [Limitations](limitations.md)
- [Packages](packages.md)
- [Implementation details](implementation-details.md)
- [Sample programs](samples.md)
