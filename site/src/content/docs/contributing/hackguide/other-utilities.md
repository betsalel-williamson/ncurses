---
title: "Other utilities"
sidebar:
  order: 10
---

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

The `infocmp` utility is just a wrapper around the same entry-dumping code used by `tic` for source translation. Perhaps the one interesting aspect of the code is the use of a predicate function passed in to `dump_entry()` to control which capabilities are dumped. This is necessary in order to handle both the ordinary de-compilation case and entry difference reporting.

The `tput` and `clear` utilities just do an entry load followed by a `tputs()` of a selected capability.
