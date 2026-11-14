# Errata and changes

This edition is built from the ncurses documentation by Thomas E. Dickey, Zeyd M. Ben-Halim, Eric S. Raymond, Juergen Pfeifer, Pradeep Padala and the other [contributors](https://betsalel-williamson.github.io/ncurses/credits/). This page lists every change it makes to that text: errors corrected in the original, errors this edition introduced and then fixed, formatting, and new material. Errors found but not yet fixed are listed too, so they can be reported upstream.

Each entry names where the change is, what it was, what it is now, where the error came from, and the pull request that made it. The list grows with the migration: every pull request that changes a guide or a manual page adds its entries here, and the site's workflow fails a pull request that changes the docs without touching this page.

## Errors corrected in the original text

| Where | Was | Now | Source | Change |
| --- | --- | --- | --- | --- |
| [Forms overview](../client-library/forms/overview.md) | "Post the form with `form_post()`" | `post_form()` | NCURSES Programming HOWTO, Forms chapter | [#1](https://github.com/betsalel-williamson/ncurses/pull/1) |
| [Forms overview](../client-library/forms/overview.md) | "Unpost the menu with `form_unpost()`" | "Unpost the form using `unpost_form()`" | NCURSES Programming HOWTO, Forms chapter | [#1](https://github.com/betsalel-williamson/ncurses/pull/1) |
| [Forms overview](../client-library/forms/overview.md) | "Free the memory allocated to menu by `free_form()`" | "Free the form, using `free_form()`" | NCURSES Programming HOWTO, Forms chapter | [#1](https://github.com/betsalel-williamson/ncurses/pull/1) |
| [Custom field types](../client-library/forms/custom-field-types.md#order-functions-for-custom-types) | Successor and predecessor hooks set with `set_fieldtype_arg()` | `set_fieldtype_choice()`, as declared in `form.h` | ncurses-intro.html, The Forms Library | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |
| [Custom field types](../client-library/forms/custom-field-types.md) | `new_fieldtype()` prototype without its closing semicolon | Semicolon added | ncurses-intro.html, The Forms Library | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |
| [Custom field types](../client-library/forms/custom-field-types.md#validation-function-arguments) | "The library routines will that call them will return error indication" | "The library routines that call them will return an error indication" | ncurses-intro.html, The Forms Library | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |
| [Custom field types](../client-library/forms/custom-field-types.md#validation-function-arguments) | "should never see a NULL file pointer" | "NULL pile pointer": the argument is the pile built by `make_str` | ncurses-intro.html, The Forms Library | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |
| [Field options](../client-library/forms/field-options.md) | Example comment "This filed is like a password field" | "This field is like a password field" | NCURSES Programming HOWTO, Field Options example | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |

## Errors this edition introduced, then fixed

| Where | What happened | Fix | Change |
| --- | --- | --- | --- |
| [Fields](../client-library/forms/fields.md#field-display-attributes) | Merging the guides split the `field_pad()` comment out of its code block. The stray fence turned the next paragraph and the Form Attributes heading into code. | Comment back on the `field_pad()` line, fence removed | [#3](https://github.com/betsalel-williamson/ncurses/pull/3) |
| [Fields](../client-library/forms/fields.md#try-it-make-backspace-and-delete-work) | Backspace at the start of a field moved to the previous field but left the cursor at its start | `REQ_END_LINE` after `REQ_DEL_PREV` when the field changes | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |

## Formatting

| Where | Change | Change |
| --- | --- | --- |
| Forms guide, 5 pages | 39 function names, identifiers and constants written as plain prose (`set_field_fore()`, `O_AUTOSKIP`, `TYPE_ENUM` and others) are now code spans. A Vale rule keeps it that way. | [#4](https://github.com/betsalel-williamson/ncurses/pull/4) |
| [Fields](../client-library/forms/fields.md#field-display-attributes) | The `field_pad()` comment lines up with the comments around it | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |
| [Custom field types](../client-library/forms/custom-field-types.md) | Typedef comments line up with the declarations below them | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |
| Forms guide, all listings | Complete programs follow the ncurses source style (`docs/.clang-format`), and trailing comments line up. A check in the site's workflow keeps it that way. | [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |

## Structure

| Where | Change | Change |
| --- | --- | --- |
| [Forms library](../client-library/forms/index.md) | The NCURSES Programming HOWTO's Forms chapter and ncurses-intro's The Forms Library covered the same ground, with 30 paragraphs copied between them. They are merged into one guide of 10 pages, each crediting its sources, with no duplicate paragraphs. | [#1](https://github.com/betsalel-williamson/ncurses/pull/1) |
| [Field validation](../client-library/forms/field-validation.md) | The HOWTO's `TYPE_ALPHA` … `TYPE_REGEXP` headings were stray top-level `<h1>` headings in the middle of a chapter; they are now part of that page's structure | [#1](https://github.com/betsalel-williamson/ncurses/pull/1) |

## New material

| Where | Addition | Change |
| --- | --- | --- |
| [Fields](../client-library/forms/fields.md) | The Form Attributes example runs in the page, compiled to WebAssembly | [#4](https://github.com/betsalel-williamson/ncurses/pull/4) |
| [Fields](../client-library/forms/fields.md#try-it-make-backspace-and-delete-work) | "Try it: make Backspace and Delete work", a tutorial step with a second runnable example | [#5](https://github.com/betsalel-williamson/ncurses/pull/5), [#6](https://github.com/betsalel-williamson/ncurses/pull/6) |

## Found, not yet fixed

These are in the manual pages, which this edition still publishes as they are in `man/`.

| Where | Error | Fix to propose upstream |
| --- | --- | --- |
| `curs_getch.3x` | Refers to `infocmp(1)` | `infocmp(1M)`, its section in this tree |
| `curs_trace.3x` | Refers to `tic(1)` | `tic(1M)` |
| `curs_bkgd.3x`, `curs_bkgrnd.3x` | The same 50-word paragraph in both pages | Keep it in one page and refer to it from the other |
| `curs_border.3x`, `curs_clear.3x` | The same 50-word paragraph in both pages | Keep it in one page and refer to it from the other |
| `term.5`, `term.7` | Both pages are titled "term" | Distinct titles: the file format and the naming conventions |
