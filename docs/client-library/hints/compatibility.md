# Compatibility with older versions

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

Despite the maintainers' best efforts, there are some differences between ncurses and the undocumented behavior of older curses implementations. These arise from ambiguities or omissions in the documentation of the API.

## Refresh of overlapping windows

If you define two windows A and B that overlap, and then alternately scribble on and refresh them, what happens to the overlapping region was often not documented precisely in historic curses versions.

To understand why this is a problem, remember that screen updates are calculated between two representations of the entire display. The documentation says that when you refresh a window, it is first copied to the [virtual screen](../../glossary/virtual-screen.md), and then changes are calculated to update the physical screen and applied to the terminal. But "copied to" isn't very specific, and subtle differences in how copying works can produce different behaviors when two overlapping windows are each refreshed at unpredictable intervals.

What happens to the overlapping region depends on what `wnoutrefresh()` does with its argument: which parts of the argument window it copies to the virtual screen. Some implementations do a change copy, copying only the locations in the window that have changed, or have been marked changed with `wtouchln()` and friends. Others do an entire copy, copying every window location to the virtual screen whether or not it has changed.

ncurses itself hasn't always been consistent on this score. Because of a bug, versions 1.8.7 to 1.9.8a did an entire copy. Versions 1.8.6 and older, and versions 1.9.9 and newer, do a change copy.

For most commercial curses implementations, it isn't documented, and the ncurses maintainers don't know for sure, whether they do a change copy or an entire copy. System V release 3 curses has logic that looks like an attempt to do a change copy, but the surrounding logic and data representations are complex enough, and the maintainers' knowledge indirect enough, that it's hard to know whether this is reliable. It isn't clear what the SVr4 documentation and the X/Open Curses standard intend. X/Open Curses barely mentions `wnoutrefresh()`. The SVr4 documents seem to describe an entire copy, but with some effort it's possible to read them the other way.

It might therefore be unwise to rely on either behavior in programs that might be linked with other curses implementations. Instead, call `touchwin()` before `wnoutrefresh()` to guarantee an entire copy anywhere.

The really clean way to handle this is the [panels library](../panels/index.md). When you want a screen update, call `update_panels()`. It makes all the necessary `wnoutrefresh()` calls for whatever [panel](../../glossary/panel.md) stacking order you have defined. Then one `doupdate()` makes all your updates in a single burst of physical I/O.

## Background erase

If you've used a very old version of ncurses (1.8.7 or older), you may be surprised by the behavior of the erase functions. In older versions, erased areas of a window were filled with a blank modified by the window's current attribute, as set by `wattrset()`, `wattron()`, `wattroff()` and friends.

In newer versions, this isn't so. Erased blanks have the window's background rendition instead, which is normal until you change it with `bkgd()`, `bkgdset()`, `wbkgd()` or `wbkgdset()`.

This change conforms ncurses to System V release 4 and the X/Open Curses standard.

## X/Open Curses conformance

ncurses is intended to be base-level conformant with the X/Open Curses standard. Many extended-level features are supported too: in fact, almost all the features not directly concerned with wide characters and internationalization.

One effect of conforming to X/Open Curses is the change in [background erase](#background-erase) behavior.

ncurses also meets the X/Open Curses requirement that a function the standard defines, and ncurses also implements as a macro, be available as a function too. The function can be linked, and is checked against its prototype, if the macro definition is turned off with `#undef`. The standard defines a few interfaces only as macros, such as `getyx()` and `getmaxyx()`, which store their results in their arguments. Those have no function.
