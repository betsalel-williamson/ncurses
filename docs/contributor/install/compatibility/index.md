# Compatibility with older releases

Because ncurses implements X/Open Curses, its interface is fairly stable. That doesn't mean the interface never changes. Changes are made to the documented interfaces when we find differences between ncurses and X/Open, or implementations that largely correspond to X/Open (such as Solaris). We add extensions to those interfaces to solve problems not addressed by the original curses design, but those must not conflict with the X/Open documentation.

These pages list the major interface changes in each release, and the problems you may meet when building a system with different versions of ncurses. Each page lists its releases newest first.

- [ncurses 6](ncurses-6.md)
- [ncurses 5.5 to 5.9](ncurses-5-5-to-5-9.md)
- [ncurses 5.0 to 5.4](ncurses-5-0-to-5-4.md)
- [Before ncurses 5](before-ncurses-5.md)
