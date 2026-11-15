# subwindow

A **subwindow** is a [window](window.md) created inside another window with `subwin()` or `derwin()`. It shares its parent's character cells, so a change through either window changes both. `subwin()` takes a position on the screen and `derwin()` a position relative to the parent; the man pages call the result a derived window, and there is no other difference.

Because the cells are shared, call `touchwin()` or `touchline()` on the parent before refreshing the subwindow. A subwindow must be deleted before its parent. See [`curs_window`](../../man/curs_window.3x).
