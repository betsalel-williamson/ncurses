# Other utilities

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

The `infocmp` utility is just a wrapper around the same entry-dumping code used by `tic` for source translation. Perhaps the one interesting aspect of the code is the use of a predicate function passed in to `dump_entry()` to control which capabilities are dumped. This is necessary in order to handle both the ordinary de-compilation case and entry difference reporting.

The `tput` and `clear` utilities load an entry and send selected capabilities with `tputs()`. `clear` also sends the `E3` capability, which clears the scrollback, when the terminal has it, and `tput` also handles the `init` and `reset` operations.
