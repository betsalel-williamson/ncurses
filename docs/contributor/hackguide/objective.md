# Objective of the package

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

The objective of the ncurses package is to provide a free software API for character-cell terminals and terminal emulators with the following characteristics:

- Source-compatible with historical curses implementations, including the original [BSD curses](../../glossary/bsd-curses.md) and System V curses.
- Conformant with the [XSI Curses](../../glossary/x-open-curses.md) standard issued as part of XPG4 by X/Open.
- High-quality: stable and reliable code, wide portability, good packaging, superior documentation.
- Featureful: it should eliminate as much of the drudgery of C interface programming as possible, freeing programmers to think at a higher level of design.

These objectives are in priority order. So, for example, source compatibility with older versions must trump featurefulness. We can't add features if it means breaking the portion of the API corresponding to historical curses versions.

## Why System V curses?

We used System V curses as a model, reverse-engineering their API, in order to fulfill the first two objectives.

System V curses implementations can support BSD curses programs with just a recompilation, so by capturing the System V API we also capture BSD's.

More importantly for the future, the XSI Curses standard issued by X/Open is explicitly and closely modeled on System V. So conformance with System V took us most of the way to base-level XSI conformance.

## How to design extensions

The second objective (standards conformance) requires that it be easy to condition source code using ncurses so that the absence of nonstandard extensions doesn't break the code.

Accordingly, we have a policy of associating with each nonstandard extension a feature macro, so that ncurses client code can use this macro to condition in or out the code that requires the ncurses extension.

For example, there is a macro `NCURSES_MOUSE_VERSION` which XSI Curses doesn't define, but which is defined in the ncurses library header. You can use this to condition the calls to the mouse API.
