# Mouse events

> Adapted from *Writing Programs with NCURSES*, by Eric S. Raymond and Zeyd M. Ben-Halim and *NCURSES Programming HOWTO*, by Pradeep Padala.

The ncurses library provides a mouse interface.

> **Note:** this facility is specific to ncurses. It is not part of either the [XSI Curses](../../glossary/x-open-curses.md) standard, nor of System V Release 4, nor [BSD curses](../../glossary/bsd-curses.md). System V Release 4 curses contains code with similar interface definitions, but it is not documented. Wrap mouse-related code in an `#ifdef` using the feature macro `NCURSES_MOUSE_VERSION`, so it is not compiled and linked on systems without ncurses.

Mouse event reporting works with xterm's mouse-tracking protocol, which xterm and similar programs such as rxvt support, and with platform drivers: Alessandro Rubini's gpm server for the Linux console, FreeBSD sysmouse, and OS/2 EMX.

## Enabling events with `mousemask()`

Before you do anything else, the events you want to receive have to be enabled with `mousemask()`.

```c
    mousemask(mmask_t newmask,   /* The events you want to listen to */
              mmask_t *oldmask); /* The old events mask              */
```

The first parameter is a bit mask of the events you would like to listen to. By default, all the events are turned off. The bit mask `ALL_MOUSE_EVENTS` can be used to get all the events. `mousemask()` returns the mask of events that actually become visible, which may differ from the argument if the mouse device can't report some of the event types you ask for. You can change the class of visible events at any time with another call.

These are the event masks:

| Name | Description |
| --- | --- |
| `BUTTON1_PRESSED` | mouse button 1 down |
| `BUTTON1_RELEASED` | mouse button 1 up |
| `BUTTON1_CLICKED` | mouse button 1 clicked |
| `BUTTON1_DOUBLE_CLICKED` | mouse button 1 double clicked |
| `BUTTON1_TRIPLE_CLICKED` | mouse button 1 triple clicked |
| `BUTTON2_PRESSED` ... `BUTTON5_TRIPLE_CLICKED` | the same five events for buttons 2 to 5 |
| `BUTTON_SHIFT` | a shift key was down during button state change |
| `BUTTON_CTRL` | a control key was down during button state change |
| `BUTTON_ALT` | an alt key was down during button state change |
| `ALL_MOUSE_EVENTS` | report all button state changes |
| `REPORT_MOUSE_POSITION` | report mouse movement |

Button 5 is there when `NCURSES_MOUSE_VERSION` is greater than 1, as it is in current ncurses. The shift, control and alt bits are reported only in some environments.

## Getting the events

Once a class of mouse events has been enabled, the `getch()` class of functions returns `KEY_MOUSE` every time a mouse event happens. Then the mouse event can be retrieved with `getmouse()`. Do this before the next `wgetch()`; otherwise another mouse event might come in and make the first one inaccessible.

The code looks roughly like this:

```c
    MEVENT event;

    ch = getch();
    if (ch == KEY_MOUSE)
        if (getmouse(&event) == OK) {
            /* Do something with the event */
        }
```

`getmouse()` fills the structure you pass it, which contains:

```c
    typedef struct
    {
        short id;       /* ID to distinguish multiple devices */
        int x, y, z;    /* event coordinates (character-cell) */
        mmask_t bstate; /* button state bits */
    } MEVENT;
```

The coordinates `x` and `y` are zero-origin and relative to the screen. The `z` coordinate is reserved for devices such as touch screens, which might report a pressure or duration, and `id` could tell multiple pointing devices apart. The order of the members is not guaranteed.

The `bstate` is the main variable we are interested in. It tells the button state of the mouse. With a code snippet like the following, we can find out what happened.

```c
    if (event.bstate & BUTTON1_PRESSED)
        printw("Left Button Pressed");
```

If the mask also makes clicks visible, as `ALL_MOUSE_EVENTS` does, a quick click arrives as `BUTTON1_CLICKED` instead. [Clicks and `mouseinterval()`](#clicks-and-mouseinterval) explains why.

## Clicks and `mouseinterval()`

Events that can be reported include presses, releases, and single, double and triple clicks. ncurses combines a press and a release into a click when they come within the mouse interval. If you don't make clicks visible in the mask, they are reported as press and release pairs.

The `mouseinterval()` function sets the maximum time, in thousandths of a second, that can elapse between press and release events for them to be recognized as a click. It returns the previous interval value. The default is one sixth of a second. `mouseinterval(0)` turns click resolution off.

## Other functions

The function `wenclose()` tells whether a mouse event fell within a given [window](../../glossary/window.md), so you can see whether a window should consider the event relevant to it. The functions `mouse_trafo()` and `wmouse_trafo()` convert between window-relative and screen-relative coordinates. See the `curs_mouse(3X)` manual page for details.

Because mouse event reporting isn't available in all environments, it would be unwise to build ncurses applications that require a mouse. Use the mouse as a shortcut for point-and-shoot commands your application would normally accept from the keyboard. Two of the test games in the ncurses distribution, `bs` and `knight`, show how this can be done.
