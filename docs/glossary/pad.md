# pad

A **pad** is a [window](window.md) that isn't tied to the screen: it can be larger than the terminal, and only a part of it is shown at a time. `newpad()` creates one. A pad has no fixed place on the screen, so it is shown with `prefresh()` or `pnoutrefresh()`, which take the rectangle of the pad to show and the rectangle of the screen to show it in.

Pads suit content that scrolls in two directions, such as a large table. See [`curs_pad`](../../man/curs_pad.3x).
