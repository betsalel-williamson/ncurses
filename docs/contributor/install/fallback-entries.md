# Configuring fallback entries

To support ncurses programs before the terminfo tree is accessible (that is, in single-user mode or at OS installation time), the ncurses library can be compiled to include an array of pre-fetched fallback entries.

> **Note:** This must be done on a machine that has ncurses' tic and infocmp programs and a terminfo database installed. That's because the fallback sources are generated and compiled into the library before the build tree's copy of infocmp is available.

`setupterm()` checks these entries only when the conventional fetches from the terminfo tree and the termcap fallback (if configured) have been tried and failed. So the presence of a fallback won't shadow modifications to the on-disk entry for the same type, when that entry is accessible.

By default, there are no entries on the fallback list. After you have built the ncurses suite for the first time, you can change the list (the process needs infocmp(1)). To do so, use the script `ncurses/tinfo/MKfallback.sh`. The configure option [`--with-fallbacks`](configure-options/with-a-l.md#--with-fallbacksxxx) does this. It accepts a comma-separated list of the names you want.

If you wanted (say) to have linux, vt100 and xterm fallbacks, you might use these commands:

```sh
cd ncurses
tinfo/MKfallback.sh \
	$TERMINFO \
	../misc/terminfo.src \
	`which tic` \
	`which infocmp` \
	linux vt100 xterm >fallback.c
```

The configured makefiles normally supply the script's first four parameters through the `--with-fallbacks` option. They are:

1. the location of the terminfo database
2. the source for the terminfo entries
3. the location of the tic program, used to create a terminfo database
4. the location of the infocmp program, used to print a terminfo description

Then just rebuild and reinstall the library as you normally would. You can restore the default empty fallback list with this:

```sh
tinfo/MKfallback.sh \
	$TERMINFO \
	../misc/terminfo.src \
	`which tic` \
	`which infocmp` \
	>fallback.c
```

The overhead for an empty fallback list is one trivial stub function. Any non-empty fallback list is `const` and so lives in shareable text space. You can look at the comment trailing each initializer in the generated `ncurses/fallback.c` file to see the core cost of the fallbacks. A good rule of thumb for modern vt100-like entries is that each one costs about 2.5K of text space.
