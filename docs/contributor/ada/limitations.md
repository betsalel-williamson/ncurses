# Limitations

- There is no `SCREEN` data type, and no functions to set a new screen (`newterm`, `set_term` and `delscreen` aren't bound). If you need them, write a small C routine that does the work and import it into your Ada program.
- Although Ada95 is an object-oriented language, the binding doesn't provide an object-oriented abstraction of curses. It's a thin binding for the curses functions, though an object-oriented layer could be built on top of it. The one exception is how field types are represented: an abstract tagged type, `Field_Type`, from which the various field types are derived.
- The forms library's `link_fieldtype` function isn't supported.
- The `*_IO` packages are output only.

Tracing is supported: the `Terminal_Interface.Curses.Trace` package provides `Trace_On`, which sets the curses trace options, and `Trace_Put`, which writes to the trace file.
