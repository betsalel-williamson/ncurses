# ncurses 5.5 to 5.9

## 5.9 (Apr 04, 2011) and 5.8 (Feb 26, 2011)

### Interface changes

- add an alternate library configuration, i.e., "terminal driver" to support port to Windows, built with MinGW. There are two drivers (terminfo and Windows console). The terminfo driver works on other platforms.

- add a new set of functions which accept a `SCREEN`* parameter, in contrast with the original set which use the global value "sp". By default, these names end with "_sp", and are otherwise functionally identical with the originals.

  In addition to the "_sp" functions, there are a few new functions associated with this feature: `ceiling_panel`, `ground_panel`, `new_prescr`.

  If the library is not built with the sp-funcs extension, there are no related interface changes.

- add `tiparm` function based on review of X/Open Curses Issue 7.

- change internal `_nc_has_mouse` function to public `has_mouse` function

### Added extensions

- add a few more functions to support the `NCURSES_OPAQUE` feature: `get_escdelay`, `is_pad`, `is_subwin`

### Added internal functions (other than "_sp" variants)

- `_nc_curscr_of`
- `_nc_format_slks`
- `_nc_get_alias_table`
- `_nc_get_hash_info`
- `_nc_insert_wch`
- `_nc_newscr_of`
- `_nc_outc_wrapper`
- `_nc_retrace_char`
- `_nc_retrace_int_attr_t`
- `_nc_retrace_mmask_t`
- `_nc_setup_tinfo`
- `_nc_stdscr_of`
- `_nc_tinfo_cmdch`

### Removed internal functions

- `_nc_makenew` (some configurations replace by `_nc_makenew_sp`)

### Modified internal functions

- `_nc_UpdateAttrs`
- `_nc_get_hash_table`
- `_nc_has_mouse`
- `_nc_insert_ch`
- `_nc_wgetch`

## 5.7 (November 2, 2008)

### Interface changes

- generate linkable stubs for some macros: `getattrs`

- Add new library configuration for tic-library (the non-curses portion of the ncurses library used for the tic program as well as some others such as tack. There is no API change, but makefiles would be changed to use the tic-library built separately.

  tack, distributed separately from ncurses, uses some of the internal `_nc_XXX` functions, which are declared in the tic.h header file.

  The reason for providing this separate library is that none of the functions in it are suitable for threaded applications.

- Add new library configuration (ncursest, ncurseswt) which provides rudimentary support for POSIX threads. This introduces opaque access functions to the `WINDOW` structure and adds a parameter to several internal functions.

- move most internal variables (except tic-library) into data blocks `_nc_globals` and `_nc_prescreen` to simplify analysis. Those were globally accessible, but since they were not part of the documented API, there is no ABI change.

- changed static tables of strings to be indices into long strings, to improve startup performance. This changes parameter lists for some of the internal functions.

### Added extensions

- add `NCURSES_OPAQUE` definition in curses.h to control whether internal details of the `WINDOW` structure are visible to an application. This is always defined when the threaded library is built, and is optional otherwise. New functions for this: `is_cleared`, `is_idcok`, `is_idlok`, `is_immedok`, `is_keypad`, `is_leaveok`, `is_nodelay`, `is_notimeout`, `is_scrollok`, `is_syncok`, `wgetparent` and `wgetscrreg`.

- the threaded library (ncursest) also disallows direct updating of global curses-level variables, providing functions (via macros) for obtaining their value. A few of those variables can be modified by the application, using new functions: `set_escdelay`, `set_tabsize`

- added functions `use_window()` and `use_screen()` which wrap a mutex (if threading is configured) around a call to a user-supplied function.

### Added internal functions

- `_nc_get_alias_table`
- `_nc_get_screensize`
- `_nc_keyname`
- `_nc_screen_of`
- `_nc_set_no_padding`
- `_nc_tracechar`
- `_nc_tracemouse`
- `_nc_unctrl`
- `_nc_ungetch`

These are used for leak-testing, and are stubs for ABI compatibility when ncurses is not configured for that using the `--disable-leaks` configure script option:

- `_nc_free_and_exit`
- `_nc_leaks_tinfo`

### Removed internal functions

- `none`

### Modified internal functions

- `_nc_fifo_dump`
- `_nc_find_entry`
- `_nc_handle_sigwinch`
- `_nc_init_keytry`
- `_nc_keypad`
- `_nc_locale_breaks_acs`
- `_nc_timed_wait`
- `_nc_update_screensize`

Use new typedef TRIES to replace "struct tries":

- `_nc_add_to_try`
- `_nc_expand_try`
- `_nc_remove_key`
- `_nc_remove_string`
- `_nc_trace_tries`

## 5.6 (December 17, 2006)

### Interface changes

- generate linkable stubs for some macros:

  `getbegx`, `getbegy`, `getcurx`, `getcury`, `getmaxx`, `getmaxy`, `getparx`, `getpary`, `getpary`,

  and (for libncursesw)

  `wgetbkgrnd`

### Added extensions

- `nofilter()`
- `use_legacy_coding()`

### Added internal functions

- `_nc_first_db`
- `_nc_get_source`
- `_nc_handle_sigwinch`
- `_nc_is_abs_path`
- `_nc_is_dir_path`
- `_nc_is_file_path`
- `_nc_keep_tic_dir`
- `_nc_keep_tic_dir`
- `_nc_last_db`
- `_nc_next_db`
- `_nc_read_termtype`
- `_nc_tic_dir`

Also (if using the hashed database configuration):

- `_nc_db_close`
- `_nc_db_first`
- `_nc_db_get`
- `_nc_db_have_data`
- `_nc_db_have_index`
- `_nc_db_next`
- `_nc_db_open`
- `_nc_db_put`

- `otherwise`

- `_nc_hashed_db`

### Removed internal functions

- `none`

### Modified internal functions

- `_nc_add_to_try`
- `_nc_do_color`
- `_nc_expand_try`
- `_nc_remove_key`
- `_nc_setupscreen`

## 5.5 (October 10, 2005)

### Interface changes

- terminfo installs "xterm-new" as "xterm" entry rather than "xterm-old" (aka xterm-r6).

- terminfo data is installed using the tic -x option (few systems still use ncurses 4.2).

- modify C++ binding to work with newer C++ compilers by providing initializers and using modern casts. Old-style header names are still used in this release to allow compiling with not-so-old compilers.

- form and menu libraries now work with wide-character data. Applications which bypassed the form library and manipulated the FIELD.buf data directly will not work properly with libformw, since that no longer points to an array of char. The `set_field_buffer()` and `field_buffer()` functions translate to/from the actual field data.

- change `SP->_current_attr` to a pointer, adjust ifdef's to ensure that libtinfo.so and libtinfow.so have the same ABI. The reason for this is that the corresponding data which belongs to the upper-level ncurses library has a different size in each model.

- `winnstr()` now returns multibyte character strings for the [wide-character configuration](../../../glossary/wide-character-library.md).

- `assume_default_colors()` no longer requires that `use_default_colors()` be called first.

- `data_ahead()` now works with wide-characters.

- `slk_set()` and `slk_wset()` now accept and store multibyte or multicolumn characters.

- `start_color()` now returns OK if colors have already been started. `start_color()` also returns ERR if it cannot allocate memory.

- `pair_content()` now returns -1 for consistency with `init_pair()` if it corresponds to the default-color.

- `unctrl()` now returns null if its parameter does not correspond to an unsigned char.

### Added extensions

Experimental mouse version 2 supports wheel mice with buttons 4 and 5. This requires ABI 6 because it modifies the encoding of mouse events.

Experimental extended colors allows encoding of 256 foreground and background colors, e.g., with the xterm-256color or xterm-88color terminfo entries. This requires ABI 6 because it changes the size of [`cchar_t`](../../../glossary/complex-character.md).

### Added internal functions

- `_nc_check_termtype2`
- `_nc_resolve_uses2`
- `_nc_retrace_cptr`
- `_nc_retrace_cvoid_ptr`
- `_nc_retrace_void_ptr`
- `_nc_setup_term`

### Removed internal functions

- `none`

### Modified internal functions

- `_nc_insert_ch`
- `_nc_save_str`
- `_nc_trans_string`
