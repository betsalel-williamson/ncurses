# Panels, input and the standard screen

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

You should not mix `wnoutrefresh()` or `wrefresh()` operations with panels code; this will work only if the argument window is either in the top panel or unobscured by any other panels.

The `stdscr` window is a special case. It is considered below all panels. Because changes to panels may obscure parts of `stdscr`, though, you should call `update_panels()` before `doupdate()` even when you only change `stdscr`.

Note that `wgetch()` calls `wrefresh()` on its window when the window has changed since it was last refreshed. Therefore, before requesting input from a panel window, you need to be sure that the panel is totally unobscured.

There is presently no way to display changes to one obscured panel without repainting all panels.

## Moving through the deck

It is possible to navigate the deck using the functions `panel_above()` and `panel_below()`. Handed a panel pointer, they return the panel above or below that panel. Handed `NULL`, `panel_above()` returns the bottom-most panel and `panel_below()` returns the top-most panel.
