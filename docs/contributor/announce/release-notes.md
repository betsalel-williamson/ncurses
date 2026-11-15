# Release notes

These notes are for ncurses 6.6, released **December 30, 2025**.

This release is designed to be source-compatible with ncurses 5.0 through 6.5; providing extensions to the application binary interface (ABI). Although the source can still be configured to support the ncurses 5 ABI, the reason for the release is to reflect improvements to the ncurses 6 ABI and the supporting utility programs.

There are numerous other improvements listed in this announcement.

The most important bug-fixes and improvements dealt with robustness issues. The release notes also mention some other bug-fixes, but are focused on new features and improvements to existing features since ncurses 6.5 release.

## Library improvements

### Terminal driver improvements

This release focuses on improvements to the MinGW/Windows terminal driver. The terminal driver for MinGW32 was introduced in [2009](https://invisible-island.net/ncurses/NEWS.html#t20090214). A new version of the terminal driver to support Windows Terminal was begun in [2020](https://invisible-island.net/ncurses/NEWS.html#t20200829). However, there were some differences:

- Both drivers use [Console API](https://learn.microsoft.com/en-us/windows/console/console-reference); the later Windows driver also provides for using character escape sequences.

- The MinGW32 driver was designed to imitate POSIX terminal I/O data types to simplify integration with the existing sources.

  The newer Windows driver did not integrate with the sources in the same way. In particular, the [reset](https://invisible-island.net/ncurses/man/tset.1.html) utility was incomplete.

- Windows Terminal support for Console API is incomplete, lacking mouse support. Additionally, its developers took a few years to resolve issues with carriage-return versus line-feed translation.

  Reflecting on these problems, both MinGW and Windows drivers are still provided in ncurses through the current release.

- The two drivers are similar, but in developing the Windows driver some renaming and refactoring was done. That resulted in duplicate source files. This release eliminates the duplication.

These improvements have been made to the terminal driver:

- made `win_driver.c` obsolete in favor of `win32_driver.c`

- made `win32_curses.h` obsolete in favor of `nc_win32.h`

- added configure check for Win32 named pipes feature, using that to make `nc_mingw.h` obsolete in favor of `nc_win32.h`

- separated the `_NC_WINDOWS` platform macro into `_NC_WINDOWS_NATIVE`, for MinGW and other native Win32 support, and `_NC_WINDOWS`, to make some Win32 features available under the Cygwin runtime, in this case the term-driver.

- modified MinGW32 configuration to account for its use of Windows-style pathnames in filesystem checks.

- changed `MS_TERMINAL` symbol to `DEFAULT_TERM_VAR`

- updated `ncurses/wcwidth.c`, for MinGW ports, from xterm.

- made fixes for reading Unicode characters in MinGW/Windows port

- improved Windows driver by restoring the scroll buffer and console mode, e.g., when `reset_prog_mode` or `endwin` is called

- simplified include for `wchar.h` in Windows port by removing the platform ifdef's

- modified driver for MinGW to handle shift-tab and control-tab as back-tab

- made fixes for port using clang-cl or cl MSVC

### Other improvements

These are improvements to existing features:

- add comments to generated `term.h` to hint the configure options used

- change scope of `TTY`, `GET_TTY` and `SET_TTY` to ncurses-internals

- improved mouse driver

  - modify `handle_wheel` case 2 to ignore the event as in case 1 for mouse version 1, since that corresponds to a button 6 or 7 event which is not supported with ABI 6.

  - use separate read/write pointers in the mouse event queue to work with too-close events for the click-detection to work reliably, and further improve that in case `mouseinterval(0)` is used to suppress click-detection.

- modify treatment of *“n”* parameter for `waddnstr`, `waddnwstr`, and `wins_nwstr` to return *OK* when *“n”* is zero, for consistency with other implementations

- modify `wattron`/`wattroff` calls in `form/m_post.c` to call `wattr_on` and `wattr_off` to omit cast used in the former for X/Open compatibility

- change `winwstr` to a generated function, using the macro definition, moving its handling of negative length parameter into `winnwstr`.

- change `winwstr` to return wide character count instead of *OK*.

- disallow directories and block/character devices in safe-open.

- amend `scr_restore` and `scr_init` to remove the target window only after validating the source window which will replace the target

- modify `_nc_flush` to also flush *stderr* to help the *flash* capability to work in `bash`

- trim padding from *sgr* expression used in `trim_sgr0`, to avoid copying the padding into the resulting sgr0

- modify `misc/Makefile.in` and `misc/run_tic.in` so that `$DESTDIR` is set and used only in the makefile.

- modify `MKfallback.sh` to eliminate `TERMINFO` environment variable.

- add `-x` option to `infocmp` in `MKfallback.sh`

- limit value from `ESCDELAY` environment variable to 30 seconds, like other delay limits.

- limit values from `LINES` and `COLUMNS` environment variables to 512

- added check in `wresize` for out-of-range dimensions

- improved error-handling in c++ binding

- improved error-reporting in `write_entry.c`

- amended limit used in `alloc_pair`, by applying an adjustment for default colors only when the maximum number of color pairs is greater than the maximum number of colors

- added limit-checks in `alloc_entry.c` and `alloc_ttype.c` to avoid indexing errors when using `infocmp` to compare all capabilities when processing a malformed terminfo binary which has a valid header

- added a null pointer check in mouse-initialization, for the Windows driver

- added some null-pointer checks after `malloc`s in test-programs.

These are corrections to existing features:

- removed test in `wgetch` which applied `notimeout` to the initial read of a character

- added check for special case of `wcrtomb` converting a single byte code to a different single byte code, which glibc does for code 160 in the KOI8-R encoding

- corrected `_nc_to_char` for the case when `wctob` is not found by configure script

- revised loop in `wins_nwstr`, to ensure that non-spacing characters are combined with the base spacing character

- modified checks in `delwin` to avoid checking if the window is a pad until first checking if it is still on the active window-list
