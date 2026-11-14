# Menus library overview

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

A menu is a screen display that assists the user to choose some subset of a given set of items. To put it simply, a menu is a collection of items from which one or more items can be chosen. The `menu` library is a curses extension that supports easy programming of menu hierarchies with a uniform but flexible interface.

The `menu` library first appeared in AT&T System V. The version documented here is the `menu` code distributed with `ncurses`.

The menus created by this library consist of collections of *items* including a name string part and a description string part. To make menus, you create groups of these items and connect them with menu frame objects.

The menu can then be *posted*, that is written to an associated window. Actually, each menu has two associated windows; a containing window in which the programmer can scribble titles or borders, and a subwindow in which the menu items proper are displayed. If this subwindow is too small to display all the items, it will be a scrollable viewport on the collection of items.

A menu may also be *unposted* (that is, undisplayed), and finally freed to make the storage associated with it and its items available for re-use.

After the menu is posted, all the processing of user responses is done by `menu_driver()`, the workhorse of any menu program.

The general flow of control of a menu program looks like this:

1.  Initialize `curses`.
2.  Create the menu items, using `new_item()`. You can specify a name and a description for each item.
3.  Create the menu using `new_menu()`, giving it the items to attach.
4.  Post the menu using `post_menu()`.
5.  Refresh the screen.
6.  Process user requests via an input loop, passing each request to `menu_driver()`.
7.  Unpost the menu using `unpost_menu()`.
8.  Free the menu, using `free_menu()`.
9.  Free the items using `free_item()`.
10. Terminate `curses`.

Free the menu before its items: `free_item()` refuses an item that is still connected to a menu, and `free_menu()` refuses a menu that is still posted.

Menus may be multi-valued, letting the user choose more than one item. [Select items and multi-valued menus](selecting-items.md) covers them.
