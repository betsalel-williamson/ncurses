# Panels library overview

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

The `ncurses` library by itself provides good support for screen displays in which the windows are tiled (non-overlapping). In the more general case that windows may overlap, you have to use a series of `wnoutrefresh()` calls followed by a `doupdate()`, and be careful about the order you do the window refreshes in. It has to be bottom-upwards, otherwise parts of windows that should be obscured will show through. Whenever you forget to refresh the windows in the proper order, the overlapping windows create blotches.

When your interface design is such that windows may dive deeper into the visibility stack or pop to the top at runtime, the resulting book-keeping can be tedious and difficult to get right. Hence the panels library. It keeps track of the order of the windows and how they overlap, and updates the screen properly.

The `panel` library first appeared in AT&T System V. The version documented here is the `panel` code distributed with `ncurses`.

## The deck

A panel object is a window that is implicitly treated as part of a *deck* including all other panel objects. The deck has an implicit bottom-to-top visibility order: the top panel is completely visible, and the other panels may or may not be obscured according to their positions. The standard window, `stdscr`, is considered below all panels.

The panels library includes an update function, `update_panels()`, that does what `refresh()` does for a single window: it prepares all panels in the deck for display in the proper order to resolve overlaps. Functions are provided to hide or show panels, move panels, change their size, and so on. The panels library manages the overlaps during all the calls to these functions.

Details on the panels functions are available in `panel(3X)`. This guide hits the highlights.

## The flow of a panel program

1.  Create the windows, with `newwin()`, to be attached to the panels.
2.  Create panels from the windows with `new_panel()`, in the chosen visibility order. Each new panel goes on top of the deck.
3.  Call `update_panels()` to write the panels to the virtual screen in the correct visibility order, then call `doupdate()` to show them on the screen.
4.  Manipulate the panels with `show_panel()`, `hide_panel()`, `move_panel()`, and so on. Use helper functions like `panel_hidden()` and `panel_window()`. Use a user pointer to store custom data for a panel: `set_panel_userptr()` sets it and `panel_userptr()` gets it.
5.  When you are done with a panel, use `del_panel()` to delete it.

## Panel functions

You create a panel from a window by calling `new_panel()` on a window pointer. It then becomes the top of the deck. The panel's window is available as the value of `panel_window()` called with the panel pointer as argument.

You can delete a panel (removing it from the deck) with `del_panel()`. This will not deallocate the associated window; you have to do that yourself. You can replace a panel's window with a different window by calling `replace_panel()`. The new window may be of different size; the panel code will re-compute all overlaps. This operation does not change the panel's position in the deck.

To move a panel's window, use `move_panel()`. The `mvwin()` function on the panel's window is not sufficient because it does not update the panels library's representation of where the windows are. This operation leaves the panel's depth, contents, and size unchanged.

Two functions (`top_panel()`, `bottom_panel()`) are provided for rearranging the deck. The first pops its argument window to the top of the deck; the second sends it to the bottom. Either operation leaves the panel's screen location, contents, and size unchanged.

The function `update_panels()` does all the `wnoutrefresh()` calls needed to prepare for `doupdate()` (which you must call yourself, afterwards).

Typically, you will want to call `update_panels()` and `doupdate()` just before accepting command input, once in each cycle of interaction with the user. If you call `update_panels()` after each and every panel write, you will generate a lot of unnecessary refresh activity and screen flicker.
