# A brief history of curses

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim.

Historically, the first ancestor of `curses` was the routines written to provide screen-handling for the `vi` editor; these used the `termcap` database facility (both released in 3BSD) for describing terminal capabilities. These routines were abstracted into a documented library and first released with the early BSD UNIX versions. All of this work was done by students at the University of California (Berkeley campus). The curses library was first published in 4.0BSD, a year after 3BSD (i.e., late 1980).

After graduation, one of those students went to work at AT&T Bell Labs, and made an improved `termcap` library called `terminfo` (i.e., "libterm"), and adapted the curses library to use this. That was subsequently released in System V Release 2 (early 1984). Thereafter, other developers added to the curses and terminfo libraries. For instance, a student at Cornell University wrote an improved terminfo library as well as a tool (`tic`) to compile the terminal descriptions. As a general rule, AT&T did not identify the developers in the source-code or documentation; the `tic` and `infocmp` programs are the exceptions.

System V Release 3 from Bell Labs featured a rewritten and much-improved `curses` library, along with the `tic` program (late 1986).

To recap, terminfo is based on Berkeley's [termcap](../../glossary/termcap.md) database, but contains a number of improvements and extensions. Parameterized capabilities strings were introduced, making it possible to describe multiple [video attributes](../../glossary/attribute.md), and colors and to handle far more unusual terminals than possible with termcap. In the later AT&T System V releases, `curses` evolved to use more facilities and offer more capabilities, going far beyond [BSD curses](../../glossary/bsd-curses.md) in power and flexibility.

## What ncurses implements

`ncurses` is a free implementation of the System V `curses` API with some clearly marked extensions. It includes the following System V curses features:

- Support for multiple screen highlights (BSD curses could only handle one "standout" highlight, usually reverse-video).
- Support for line- and box-drawing using forms characters.
- Recognition of function keys on input.
- Color support.
- Support for [pads](../../glossary/pad.md) (windows of larger than screen size on which the screen or a [subwindow](../../glossary/subwindow.md) defines a viewport).

Also, `ncurses` makes use of the insert and delete line and character features of terminals so equipped, and determines how to optimally use these features with no help from the programmer. It allows arbitrary combinations of video attributes to be displayed, even on terminals that leave "magic cookies" on the screen to mark changes in attributes.

The `ncurses` package can also capture and use event reports from a mouse in some environments (notably, xterm under the X window system).

The [panels](../panels/index.md), [menus](../menus/index.md) and [forms](../forms/index.md) extension libraries are also modeled on System V. The panels library keeps a stack or deck of overlapping windows and moves windows around in it, changing their visibility in the natural way. The menus and forms libraries support easy construction of sequences of menus and fill-in forms.

## Who wrote it

The `ncurses` package was originated by Pavel Curtis. The original maintainer of this package is Zeyd Ben-Halim. Eric S. Raymond wrote many of the new features in versions after 1.8.1 and wrote most of *Writing Programs with NCURSES*. Jürgen Pfeifer wrote all of the menu and forms code as well as the Ada95 binding. Thomas E. Dickey is the maintainer. Contact the current maintainers at <bug-ncurses@gnu.org>. A detailed history of `ncurses` is in the `NEWS` file of the source distribution, and the Credits page lists everyone whose work these pages contain.
