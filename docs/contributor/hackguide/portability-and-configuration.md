# Portability and configuration

> Adapted from *A Hacker's Guide to NCURSES*, by Eric S. Raymond.

Code written for ncurses may assume an ANSI-standard C compiler and POSIX-compatible OS interface. It may also assume the presence of a System-V-compatible `select(2)` call.

We encourage (but don't require) developers to make the code friendly to less-capable UNIX environments wherever possible.

We encourage developers to support OS-specific optimizations and methods not available under POSIX/ANSI, provided only that:

- All such code is properly conditioned so the build process doesn't attempt to compile it under a plain ANSI/POSIX environment.
- Adding such implementation methods doesn't introduce incompatibilities in the ncurses API between platforms.

We use GNU `autoconf(1)` as a tool to deal with portability issues. The right way to leverage an OS-specific feature is to modify the autoconf specification files (`configure.in` and `aclocal.m4`) to set up a new feature macro, which you then use to condition your code.
