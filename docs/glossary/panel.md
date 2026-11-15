# panel

A **panel** is a [window](window.md) with a depth, from the panel library (`-lpanel`). Panels form a stack, and the library works out which parts of each window are hidden by the panels above it, so a program can show overlapping windows such as dialogs and pop-up menus. `update_panels()` writes the stack to the [virtual screen](virtual-screen.md) and `doupdate()` shows it. [stdscr](stdscr.md) is beneath every panel and isn't part of the stack.

See [`panel`](../../man/panel.3x) and the [panels library guide](../client-library/panels/index.md).
