# Terminal database

There are several new terminal descriptions:

- [`ghostty`](https://invisible-island.net/ncurses/terminfo.src.html#tic-ghostty)

- [`illumos`](https://invisible-island.net/ncurses/terminfo.src.html#tic-illumos), [`sun-16color`](https://invisible-island.net/ncurses/terminfo.src.html#tic-sun-16color), [`sun-256color`](https://invisible-island.net/ncurses/terminfo.src.html#tic-sun-256color), and [`sun-direct`](https://invisible-island.net/ncurses/terminfo.src.html#tic-sun-direct)

- [`ms-terminal-direct`](https://invisible-island.net/ncurses/terminfo.src.html#tic-ms-terminal-direct)

- [`pangoterm`](https://invisible-island.net/ncurses/terminfo.src.html#tic-pangoterm)

- [`rlogin-color`](https://invisible-island.net/ncurses/terminfo.src.html#tic-rlogin-color)

- [`sclp`](https://invisible-island.net/ncurses/terminfo.src.html#tic-sclp)

- [`vt520-w`](https://invisible-island.net/ncurses/terminfo.src.html#tic-vt520-w) and [`vt525-w`](https://invisible-island.net/ncurses/terminfo.src.html#tic-vt525-w)

along with building blocks

- [`linux+lockeys`](https://invisible-island.net/ncurses/terminfo.src.html#tic-linux_lockeys), [`xterm+r5+lockeys`](https://invisible-island.net/ncurses/terminfo.src.html#tic-xterm_r5_lockeys), [`xterm+r5+fkeys`](https://invisible-island.net/ncurses/terminfo.src.html#tic-xterm_r5_fkeys)

- [`vt100+pf1-pf4`](https://invisible-island.net/ncurses/terminfo.src.html#tic-vt100_pf1-pf4)

- [`vt220+ufkeys`](https://invisible-island.net/ncurses/terminfo.src.html#tic-vt220_ufkeys), [`vt220+sfkeys`](https://invisible-island.net/ncurses/terminfo.src.html#tic-vt220_sfkeys)

- [`ecma+standout`](https://invisible-island.net/ncurses/terminfo.src.html#tic-ecma_standout), [`ecma+underline`](https://invisible-island.net/ncurses/terminfo.src.html#tic-ecma_underline)

- [`wyse+cvis`](https://invisible-island.net/ncurses/terminfo.src.html#tic-wyse+cvis)

There are many changes to existing terminal descriptions. Some were updates to several descriptions, using the `infocmp` “`-u`” option in a script to determine which *building-block* entries could be used to replace multiple capability settings (and trim redundant information).

Other changes include:

- use [xterm+keypad](https://invisible-island.net/ncurses/terminfo.src.html#tic-xterm_keypad) in [pccon+base](https://invisible-island.net/ncurses/terminfo.src.html#tic-pccon_base)

- use [bracketed+paste](https://invisible-island.net/ncurses/terminfo.src.html#tic-bracketed_paste) in [nsterm](https://invisible-island.net/ncurses/terminfo.src.html#tic-nsterm), [rlogin-color](https://invisible-island.net/ncurses/terminfo.src.html#tic-rlogin-color), [screen](https://invisible-island.net/ncurses/terminfo.src.html#tic-screen), [terminology](https://invisible-island.net/ncurses/terminfo.src.html#tic-terminology)

- use extended-keys in [djgpp](https://invisible-island.net/ncurses/terminfo.src.html#tic-djgpp) 2.05

- update/correct some of the rv/xr strings, checked with

  [tack](https://invisible-island.net/ncurses/tack.html)

  - add rv code for [alacritty](https://invisible-island.net/ncurses/terminfo.src.html#tic-alacritty)
  - add xr code for [putty](https://invisible-island.net/ncurses/terminfo.src.html#tic-putty)
  - add rv/xr codes for [domterm](https://invisible-island.net/ncurses/terminfo.src.html#tic-domterm), [mintty](https://invisible-island.net/ncurses/terminfo.src.html#tic-mintty), [mlterm](https://invisible-island.net/ncurses/terminfo.src.html#tic-mlterm), [contour](https://invisible-island.net/ncurses/terminfo.src.html#tic-contour), [ghostty](https://invisible-island.net/ncurses/terminfo.src.html#tic-ghostty), [iterm2](https://invisible-island.net/ncurses/terminfo.src.html#tic-iterm2), [kitty](https://invisible-island.net/ncurses/terminfo.src.html#tic-kitty), [konsole](https://invisible-island.net/ncurses/terminfo.src.html#tic-konsole), [vscode](https://invisible-island.net/ncurses/terminfo.src.html#tic-vscode), [vte](https://invisible-island.net/ncurses/terminfo.src.html#tic-vte), [wezterm](https://invisible-island.net/ncurses/terminfo.src.html#tic-wezterm)

- improve use-clauses: [ansi+cup](https://invisible-island.net/ncurses/terminfo.src.html#tic-ansi_cup), [ansi+idl1](https://invisible-island.net/ncurses/terminfo.src.html#tic-ansi_idl1), [ansi+rca](https://invisible-island.net/ncurses/terminfo.src.html#tic-ansi_rca), [ansi+rca2](https://invisible-island.net/ncurses/terminfo.src.html#tic-ansi_rca2), [ansi+sgrso](https://invisible-island.net/ncurses/terminfo.src.html#tic-ansi_sgrso), [ansi+sgrul](https://invisible-island.net/ncurses/terminfo.src.html#tic-ansi_sgrul)

- [sclp](https://invisible-island.net/ncurses/terminfo.src.html#tic-sclp):

  - add kf1 to kf5
  - use [ansi+rca](https://invisible-island.net/ncurses/terminfo.src.html#tic-ansi_rca)
  - use [vt220+pcedit](https://invisible-island.net/ncurses/terminfo.src.html#tic-vt220_pcedit)

- [vt525](https://invisible-island.net/ncurses/terminfo.src.html#tic-vt525)

  - add color
  - add op

- [wezterm](https://invisible-island.net/ncurses/terminfo.src.html#tic-wezterm):

  - use [xterm+alt+title](https://invisible-island.net/ncurses/terminfo.src.html#tic-xterm_alt_title)
  - omit its broken left/right margin feature

- update [contour](https://invisible-island.net/ncurses/terminfo.src.html#tic-contour)

- update [ms-terminal](https://invisible-island.net/ncurses/terminfo.src.html#tic-ms-terminal)

  - add XM/xm to ms-terminal, to enable mouse with experimental Windows driver

- update [st](https://invisible-island.net/ncurses/terminfo.src.html#tic-st) to 0.8.5

- update [teraterm](https://invisible-island.net/ncurses/terminfo.src.html#tic-teraterm) to 5.0

- update [foot](https://invisible-island.net/ncurses/terminfo.src.html#tic-foot) to 1.18.1

- update [iTerm2](https://invisible-island.net/ncurses/terminfo.src.html#tic-iterm2) to 3.5.0
