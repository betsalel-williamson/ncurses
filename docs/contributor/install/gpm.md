# Using GPM

ncurses 4.1 and later can be configured to use GPM (General Purpose Mouse), which is used with the Linux console. Be aware that GPM is commonly installed as a shared library that contains a wrapper for the curses `wgetch()` function (`libcurses.o`). Some integrators have simplified linking applications by combining all or part of `libcurses.so` into the `libgpm.so` file, producing symbol conflicts with ncurses (specifically the `wgetch` function). This was originally the BSD curses, but generally whatever curses library exists on the system.

You may be able to work around this problem by linking as follows:

```sh
cc -o foo foo.o -lncurses -lgpm -lncurses
```

But the linker may not cooperate, producing mysterious errors. See the [ncurses FAQ](https://invisible-island.net/ncurses/ncurses.faq.html#using_gpm_lib), as well as the discussion under the [`--with-gpm`](configure-options/with-a-l.md#--with-gpm) option.
