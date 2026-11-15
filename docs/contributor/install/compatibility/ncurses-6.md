# ncurses 6

## 6.6 (Dec 30, 2025)

### Interface changes

- none

### Added extensions

- none

### Added internal functions (other than "_sp" variants)

- `_nc_is_path_found`

### Removed internal functions

- none

### Modified internal functions

- These now pass a const parameter: `_nc_has_mouse`, `_nc_reset_color_pair`, `_nc_free_entry`, and `_nc_timed_wait`.
- These now use a `NCURSES_BOOL` where an int was used: `_nc_setupscreen`, `_nc_keypad`, `_nc_unicode_locale`, and `_nc_retrace_bool`.

## 6.5 (Apr 27, 2024)

### Interface changes

- the `WINDOW` structure and some related internal data types declared in `<curses.h>` have been made opaque by default;
- the FORM, MENU, and PANEL structures and related internal data types from their corresponding header files have been made opaque by default; and
- support for wide characters is now enabled by default.

### Added extensions

- `is_cbreak`, `is_echo`, `is_nl`, and `is_raw`, as well as "_sp" variants

- `tiparm_s` and `tiscan_s`

### Added internal functions (other than "_sp" variants)

- `_nc_env_access`

### Removed internal functions

- none

### Modified internal functions

- These now pass a const parameter: `_nc_delink_entry`, `_nc_str_copy`, and `_nc_trans_string`

## 6.4 (Dec 31, 2022)

### Interface changes

- none

### Added extensions

- none

### Added internal functions (other than "_sp" variants)

- add `_nc_free_termtype1` and `_nc_free_tparm`, for memory-leaks

### Removed internal functions

- none

### Modified internal functions

- none

## 6.3 (Oct 21, 2021)

### Interface changes

- the definition of TERMTYPE2 is now internal, not visible in the ABI, like the enclosing TERMINAL which was previously made opaque. This was done to provide SCREEN-specific "static" variables in [terminfo](../../../glossary/terminfo.md).

### Added extensions

- add sp-funcs for `erasewchar`, `killwchar`.

### Added internal functions (other than "_sp" variants)

- `_nc_safe_fopen` and `_nc_safe_open3` limit privileges if possible when opening a file; otherwise disallow access for updating files.

- `_nc_tiparm` is a variant of `tiparm` which is used when all of the parameters are known to be numbers rather than possibly strings.

- `_nc_reset_tparm` improves tic's checks by resetting the terminfo "static variables" before calling functions which may update them.

### Removed internal functions

- none

### Modified internal functions

- `_nc_trace_ttymode` passes pointer to const data

- `_nc_tparm_analyze` passes pointer to int*, not int[]

## 6.2 (Feb 12, 2020)

### Interface changes

- the terminal database must be compiled with ncurses 6.2 tic; older versions of tic/infocmp will not work. Aside from that, the compiled database will work with older applications.

- "*.pc" and "ncurses*-config" files give the same information.

- `vwprintw` and `vwscanw` are deprecated.

### Added extensions

- These make it simpler to substitute a debug-configuration of the library for non-debug: `curses_trace` `exit_curses` `exit_terminfo`

### Added internal functions (other than "_sp" variants)

- These provide fast-lookup of common user-defined capabilities: `_nc_find_user_entry` `_nc_get_userdefs_table` `_nc_get_hash_user`

- This is added to work around compiler-warnings: `_nc_fmt_funcptr`

### Removed internal functions

- `_nc_import_termtype`

### Modified internal functions

- `_nc_reserve_pairs` no longer returns a value

## 6.1 (Jan 27, 2018)

### Interface changes

- X/Open Curses specifies a "reserved" void* parameter in several functions, saying that it must be NULL. In this release, if the parameter is non-NULL, it is interpreted as a point to an integer containing a [color pair](../../../glossary/color-pair.md). In previous releases, a non-NULL parameter caused an error return. Portable applications are unaffected. Here are the functions which have been extended: `attr_get` `attr_off` `attr_on` `attr_set` `chgat` `color_set` `mvchgat` `mvwchgat` `slk_attr_off` `slk_attr_on` `slk_attr_set` `wattr_get` `wattr_on` `wattr_off` `wattr_set` `wchgat` `wcolor_set`

- the TERMINAL structure declared in `<term.h>` has been made opaque, and its size increased to handle the increased size of color pair and color value, as well as other numeric capabilities.

  A few applications required change, e.g., to use `def_prog_mode`; only one application (tack) is known to have a valid reason for accessing these internal details, and that was addressed by the release of tack 1.08 in 2017. Internal functions marked as used by tack will be deprecated in future releases.

### Added extensions

- Several new functions were added to manipulate extended color pairs and color values. These include: `alloc_pair` `extended_color_content` `extended_pair_content` `extended_slk_color` `find_pair` `free_pair` `init_extended_color` `init_extended_pair` `reset_color_pairs`

  as well as corresponding sp-functions.

- A new [terminfo capability](../../../glossary/terminal-capability.md) "RGB" tells the ncurses library that the color values are red/green/blue, to eliminate the need for palettes in that special case for the `color_content` function.

### Added internal functions (other than "_sp" variants)

- `_nc_copy_termtype2`
- `_nc_export_termtype2`
- `_nc_fallback2`
- `_nc_find_prescr`
- `_nc_forget_prescr`
- `_nc_free_termtype2`
- `_nc_read_entry2`
- `_nc_write_object`

### Removed internal functions

- `_nc_check_termtype`
- `_nc_resolve_uses`

### Modified internal functions

- symbols are used by tic/infocmp/toe: `_nc_align_termtype` - change parameters to TERMTYPE2* `_nc_check_termtype2` - change parameter to TERMTYPE2* `_nc_read_file_entry` - change parameter to TERMTYPE2* `_nc_read_termtype` - change parameter to TERMTYPE2* `_nc_trim_sgr0` - change parameter to TERMTYPE2* `_nc_write_entry` - change parameter to TERMTYPE2*

- symbols used only within the library: `_nc_fallback` - change return type to TERMTYPE2* `_nc_init_termtype` - change parameter to TERMTYPE2*

## 6.0 (Aug 08, 2015)

### Interface changes

- The 6.0 ABI modifies the defaults for these configure options: `--enable-const` `--enable-ext-colors` `--enable-ext-mouse` `--enable-ext-putwin` `--enable-interop` `--enable-lp64` `--enable-sp-funcs` `--with-chtype=uint32_t` `--with-mmask_t=uint32_t` `--with-tparm-arg=intptr_t`

- ncurses supports symbol versioning. If you use this feature, about half of the "_nc_" private symbols are changed to local symbols.

- a few applications may need to explicitly flush the standard output when switching between printf's and (curses) `printw`.

### Added extensions

- `use_tioctl` is an improvement over `use_env`

- added `wgetdelay` to support the `NCURSES_OPAQUE` feature.

### Added internal functions (other than "_sp" variants)

- `_nc_init_termtype`
- `_nc_mvcur`
- `_nc_putchar`
- `_nc_setenv_num`
- `_nc_trace_mmask_t`

### Removed internal functions

- `none`

### Modified internal functions

```text
_nc_do_color - change parameters from short/bool to int
_nc_keypad - change parameter from bool to int
_nc_setupscreen - change parameter from bool to int
_nc_signal_handler - change parameter from bool to int
```
