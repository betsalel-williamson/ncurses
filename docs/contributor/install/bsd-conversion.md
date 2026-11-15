# BSD conversion notes

If you need to support really ancient BSD programs, you probably want to configure with the [`--enable-bsdpad`](configure-options/enable.md#--enable-bsdpad) option. This enables code in `tputs()` that recognizes a numeric prefix on a capability as a request for that much trailing padding in milliseconds. There are old BSD programs that do things like `tputs("50")`.

If you are distributing ncurses as a support-library component of an application, you probably want to put the rest of this page in the package README file.

## Private installations with termcap

This section applies only if you have configured ncurses with [`--enable-termcap`](configure-options/enable.md#--enable-termcap).

If you are installing this application privately (either because you have no root access or want to experiment with it before doing a root installation), there are a couple of details you need to be aware of. They have to do with the ncurses library, which uses terminfo rather than termcap for describing terminal characteristics.

Though the ncurses library is terminfo-based, it can interpret your `TERMCAP` variable (if present), any local termcap files you reference through it, and the system termcap file. However, to avoid slowing down your application startup, it does this only once per terminal type.

The first time you load a given terminal type from your termcap database, the library initialization code automatically writes it in terminfo format to a subdirectory under `$HOME/.terminfo`. After that, the initialization code finds it there and does a (much faster) terminfo fetch.

Usually, all this means is that your home directory silently grows an invisible `.terminfo` subdirectory, which fills with terminfo descriptions of terminal types as you invoke them. If anyone ever installs a global terminfo tree on your system, this quietly stops happening, and your `$HOME/.terminfo` becomes redundant.

The objective of all this logic is to make converting from BSD termcap as painless as possible without slowing down your application (termcap compilation is expensive).

If you don't have a `TERMCAP` variable or a custom personal termcap file, you can skip the rest of this page.

If you *do* have a `TERMCAP` variable or a custom personal termcap file that defines a terminal type, that definition stops being visible to this application after the first time you run it, because the application instead sees the terminfo entry that it wrote to `$HOME/.terminfo` the first time around.

After that, editing the `TERMCAP` variable or personal termcap file has no effect unless you explicitly remove the terminfo entry under `$HOME/.terminfo`. If you do that, the entry is recompiled from your termcap resources the next time it's invoked.

To avoid these complications, use infocmp(1) and tic(1) to edit the terminfo directory directly.
