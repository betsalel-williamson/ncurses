# attribute

An **attribute** (or video attribute) is a way of drawing characters, such as bold, underline, reverse video or blink. Attributes are bits named `A_BOLD`, `A_UNDERLINE` and so on, combined with `|`. A [window](window.md) has current attributes that `attron()`, `attroff()` and `attrset()` change, and each character written takes them on. A character can also carry its own attributes as part of a [chtype](chtype.md). The [color pair](color-pair.md) is stored with the attributes. The X/Open functions, such as `attr_on()` and `attr_set()`, and the wide-character functions use the `attr_t` type for attributes, and `attr_set()` takes the color pair as a separate argument.

Whether an attribute shows depends on the terminal; `termattrs()` reports which ones it supports. See [`curs_attr`](../../man/curs_attr.3x).
