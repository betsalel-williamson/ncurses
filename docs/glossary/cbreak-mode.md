# cbreak mode

**cbreak mode** is a terminal input mode in which each character the user types reaches the program at once, rather than when the user presses Enter. The interrupt, quit and suspend characters, such as Control-C, still raise their signals. `cbreak()` sets it, and most interactive curses programs call it after `initscr()`.

The terminal driver has two other modes. In **cooked** (canonical) mode, the default, the driver collects a whole line and handles erase and kill. In **raw** mode, set by `raw()`, characters arrive at once as in cbreak mode, and the interrupt, quit, suspend and flow-control characters reach the program too instead of acting. `halfdelay()` sets a variant of cbreak mode in which a read gives up after a timeout. Whether typed characters are echoed is a separate setting, made with `echo()` and `noecho()`. See [`curs_inopts`](../../man/curs_inopts.3x).
