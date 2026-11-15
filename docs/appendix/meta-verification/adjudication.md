# Adjudication of the first outside pass

This page records how the [first outside pass](../meta-verification.md#this-repositorys-first-outside-pass) was acted on. Every row the pass reported as misaligned with [errata.csv](../errata.csv), and every three-way split, was checked again from primary evidence, without trusting the votes. Each card in [findings/adjudication.json](findings/adjudication.json) holds the five-step check (claim as printed, what was opened, what it says, verdict and confidence, one step earlier), the Bo3 votes, which runs were right, and the likely cause when they were not.

Verdicts use the errata convention: `matches` means the errata row's error claim holds.

## Counts

| Group | Row confirmed (a) | Row wrong, original right (b) | Can't tell from the repo (c) |
| --- | ---: | ---: | ---: |
| 97 misaligned rows | 78 | 9 | 10 |
| 5 splits | 5 | 0 | 0 |
| 10 aligned rows, spot-checked | 10 | 0 | 0 |

The 78 confirmed rows include the three `rejected` rows (`L28`, `L29`, `L34`), whose rejection stands.

## Rows changed

Ids are the row's line in `errata.csv` when the pass ran.

Moved to `rejected`, with no change to the text, because the edition's wording is accurate either way:

- `L103` addnstr(): ncurses adds the whole string for any negative `n` (`lib_addstr.c`, `explicit = (n >= 0)`), so the HOWTO was right.
- `L104` getmaxyx(): "the number of columns and the number of rows" names both values and says nothing about argument order. A judgement call.
- `L148` copywin(): "can be used to copy a window completely" is true, and the next sentence gives the rectangle. A judgement call.
- `L156` cur_term: "saving and restoring cur_term" is what `term_variables(3X)` describes, through `set_curterm()`, not by assignment.
- `L177` `#define KEY_F1 265`: `KEY_F0` is 0410 (264) in `include/Caps`, so 265 is ncurses' own `KEY_F(1)`.

Moved to `rejected`, with the edition's "fix" reverted or corrected in the content commit, and an `edition-error` row for each:

- `L195` Front page: "He has revised every manual page, which Eric S. Raymond first wrote" was wrong. AUTHORS sections name Dickey on ten manual pages (`curs_extend`, `default_colors`, `define_key`, `key_defined`, `keybound`, `keyok`, `legacy_coding`, `new_pair`, `resizeterm`, `wresize`). It now says he revised every page and wrote several.
- `L272` Input guide: `curs_getch(3X)` says getch() "with echo and neither cbreak nor raw is not well-defined", so the original warning is restored.
- `L295` Hacker's guide: `parse_entry.c` does translate `box1` (`box_chars_1`) to `acsc` ("acsc string synthesized from AIX capabilities"), so the original example is restored, with `get` corrected to `gets` (a `formatting` row).
- `L301` Glossary: `ncurses(3X)` gives `_w` as the rule and `addwstr` and `inwstr` as the exceptions, so the rule is restored with its exception.

## Splits

All five are confirmed. None of the splits came from conflicting evidence. The runs read different copies of the page (`L56`, `L57`), couldn't open the edition's text (`L287`), or used different verdict words for the same facts (`L203`, `L215`).

| Id | Resolution |
| --- | --- |
| `L56`, `L57` | The upstream `menu_driver(3X)` at `7404b37` has the typo; the current `man/` file is this edition's fix. |
| `L203` | No `timed_wait()` exists; the function is `_nc_timed_wait()` in `lib_twait.c`. |
| `L215` | No `comp_main.c` exists; tic's `main()` is in `progs/tic.c`. |
| `L287` | "pads `stdscr` with blanks" is a verb, so a glossary link on it was misplaced. |

## Rows left as they are, can't tell from the repo

- `L55`, `L178`: dead links. A fetch on 2026-11-15 agrees with the rows.
- `L199`, `L241`, `L259`: the list is on GNU Mailman. A fetch on 2026-11-15 agrees with the rows.
- `L174`, `L175`, `L176`, `L286`: the defects are in the HOWTO's example archive, which isn't in the repo. A copy of the archive read for this check agrees. `L286`'s `was` quotes this edition's sentence, not the HOWTO's.
- `L179`: `Curses::Form` exists as a package in the Curses distribution, and `Curses::Forms` is a separate one. The HOWTO's "three zipped modules" favors the row's reading, but the evidence is ambiguous, so the owner decides.

## Checker error patterns

The counts below cover the 102 misaligned and split rows. Each row has one dominant cause.

| Pattern | Rows |
| --- | ---: |
| Label inversion: the run scored the error claim (matches = the error is real), and its own quote says the print was wrong | 26 |
| Evidence outside the allowed paths: edition history, site build, example archive, web | 20 |
| Checked that the original prints the text, not whether the text is right | 13 |
| A symbol or default exists, so the prose passed | 11 |
| Same facts, different verdict words (`superseded`, `missing`, `disagrees`) | 11 |
| Read a `man/` file this edition had already fixed | 10 |
| Rejected rows: the study expected `matches`, but `disagrees` supports the rejection | 3 |
| No checker error: the runs that said the original was right were right | 8 |

## What it says about the method

Of the 68 misaligned rows with a Bo3 majority of `matches`, 8 were real errata mistakes and 60 were not. A majority vote on these cards can't stand in for reading the quotes. Most misalignments came from the card format, not from the checkers' reading:

- Cards mixed two kinds of claim. Some `was` fields are the printed text, and others describe an error ("frees only items 0 and 1"), so `matches` meant opposite things on different cards.
- `man/` pages are fixed in place, so a checker reading the current file sees this edition's correction. Cards for those rows need the upstream base commit.
- Edition rows can't be checked without the edition's own history, which the allowed paths excluded.
- Where the pass was useful, it was useful through its quotes. The 9 wrong rows were found by runs that read the code further than the original check did: `box_chars_1` rather than the literal `box1`, the whole `waddnstr()`, and the manual's caveat on cooked mode.

A future pass would gain from one fixed question per card ("Is the printed text correct?"), from giving `man/` cards the upstream text, from allowing `git show` of this edition's history for `edition-error` rows, and from tallying a vote only after checking that its quote supports its label.
