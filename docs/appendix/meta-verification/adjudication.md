# Adjudication of the first outside pass

This page records how the [first outside pass](../meta-verification.md#this-repositorys-first-outside-pass) was acted on. Every row the pass reported as misaligned with [errata.csv](../errata.csv), and every three-way split, was checked again from primary evidence, without trusting the votes. Each card in [findings/adjudication.json](findings/adjudication.json) holds the five-step check (claim as printed, what was opened, what it says, verdict and confidence, one step earlier), the Bo3 votes, which runs were right, and the likely cause when they were not.

Each card tests one finding: the claim that a printed text is wrong. The adjudicated truth is `error_real`: true when the printed text is wrong, false when it was right, and null when the repository can't settle it. Verdicts use the prompt's convention, the same as the runs: `matches` means the printed text is right and `disagrees` means it is wrong.

Two finders are scored against that truth, in the standard terms:

- A finding is **valid** when it agrees with the truth: a **true positive** (an error reported that is real) or a **true negative** (no error reported, and there is none).
- A **type I error** is a false positive: an error reported that isn't there.
- A **type II error** is a false negative: a real error that was missed.
- **Unsettled** means the truth is null, and **no call** means the finder gave no answer (`can't tell`, or a three-way split).

An errata row that isn't `rejected` reports an error, and a `rejected` row reports none. A run's `disagrees`, `missing`, `superseded` or `impossible` reports an error, and `matches` reports none. Fourteen cards (`claim_states_error` in the JSON) state the error itself instead of quoting the printed text, so on those cards `matches` reports the error.

## Counts

### The errata rows

| Group | True positive | True negative | Type I (false positive) | Type II (false negative) | Unsettled |
| --- | ---: | ---: | ---: | ---: | ---: |
| 97 misaligned rows | 76 | 3 | 10 | 0 | 8 |
| 5 splits | 5 | 0 | 0 | 0 | 0 |
| 10 aligned rows, spot-checked | 10 | 0 | 0 | 0 | 0 |
| **All 112** | **91** | **3** | **10** | **0** | **8** |

Of the 104 settled rows, 94 are valid findings and 10 are type I errors: rows that reported an error in text the original had right. `L179` and `L286` were settled after the first count; see below. The 3 true negatives are the `rejected` rows `L28`, `L29` and `L34`, whose rejection stands. No type II error turned up, but this sample was drawn from rows the pass flagged, so it can't measure how many real errors the errata missed.

### The checkers' Bo3 majority

| Group | True positive | True negative | Type I (false positive) | Type II (false negative) | No call | Unsettled |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 97 misaligned rows | 20 | 11 | 0 | 49 | 16 | 1 |
| 5 splits | 0 | 0 | 0 | 0 | 5 | 0 |
| 10 aligned rows, spot-checked | 10 | 0 | 0 | 0 | 0 | 0 |
| **All 112** | **30** | **11** | **0** | **49** | **21** | **1** |

Scored on their labels as cast, the checkers made no type I errors in these rows: each time the majority said the printed text was wrong, it was. They missed far more than they caught, with 49 type II errors against 30 true positives, so the majority found 38% of the real errors it was asked about. Of the 336 single-run votes, 125 are true positives, 30 true negatives, 4 type I errors, 124 type II errors, 46 no call and 7 unsettled. This sample leans toward disagreement by design, so these rates describe the flagged rows, not the whole pass.

## Rows changed

Ids are the row's line in `errata.csv` when the pass ran.

Moved to `rejected`, with no change to the text, because the edition's wording is accurate either way:

- `L103` addnstr(): ncurses adds the whole string for any negative `n` (`lib_addstr.c`, `explicit = (n >= 0)`), so the HOWTO was right.
- `L104` getmaxyx(): "the number of columns and the number of rows" names both values and says nothing about argument order. A judgement call.
- `L148` copywin(): "can be used to copy a window completely" is true, and the next sentence gives the rectangle. A judgement call.
- `L156` cur_term: "saving and restoring cur_term" is what `term_variables(3X)` describes, through `set_curterm()`, not by assignment.
- `L177` `#define KEY_F1 265`: `KEY_F0` is 0410 (264) in `include/Caps`, so 265 is ncurses' own `KEY_F(1)`.

Moved to `rejected`, with the edition's "fix" reverted or corrected in the content commit, and an `edition-error` row for each:

- `L195` Front page: "He has revised every manual page, which Eric S. Raymond first wrote" doesn't hold for every page: AUTHORS sections name Dickey alone on twelve (`curs_extend`, `default_colors`, `define_key`, `key_defined`, `keybound`, `keyok`, `legacy_coding`, `new_pair`, `panel`, `resizeterm`, `wresize`, `user_caps`). A rewrite to "wrote several of them" undersold Raymond's part, so the owner chose to keep the sentence as first written, and an `open` row records the twelve pages.
- `L272` Input guide: `curs_getch(3X)` says getch() "with echo and neither cbreak nor raw is not well-defined", so the original warning is restored.
- `L295` Hacker's guide: `parse_entry.c` does translate `box1` (`box_chars_1`) to `acsc` ("acsc string synthesized from AIX capabilities"), so the original example is restored, with `get` corrected to `gets` (a `formatting` row).
- `L301` Glossary: `ncurses(3X)` gives `_w` as the rule and `addwstr` and `inwstr` as the exceptions, so the rule is restored with its exception.
- `L179` Widget libraries: the HOWTO names `Curses::Form`, and the edition changed it to `Curses::Forms`, a separate distribution. `Curses::Form` exists too, as a package in `Curses.pm` (MetaCPAN). The rule is to assume the original is right unless the evidence against it is strong, and here it isn't, so `Curses::Form` is restored.

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
- `L55`'s sentence is back, linked to the Internet Archive's 2001 copy of the games collection. This environment can't reach the Wayback Machine, so the owner opened the copy and confirmed it.
- `L174`, `L175`, `L176`: the original programs are in the HOWTO's example archive, which isn't in the repo, and its download now returns 403. A copy of the archive read for this check agrees. The rows now cite the programs as this edition runs them (`hanoi.md`, `shuffle.md`, `typing-tutor.md`) as well.

Settled since the first count:

- `L286`: settled from the repository, so the row stands. Its `was` quotes this edition's sentence as first written (`git show bec4c6d:docs/client-library/more/shuffle.md`), and `init_board()` in the shard deals with `rand()` and no parity check.
- `L179`: see [Rows changed](#rows-changed).

## Checker error patterns

The counts below cover the 102 misaligned and split rows. Each row has one dominant cause.

| Pattern | Rows |
| --- | ---: |
| Label inversion: the run scored the error claim (matches = the error is real), and its own quote says the print was wrong. On 11 of these the card stated the error, so the label was right under standard scoring | 26 |
| Evidence outside the allowed paths: edition history, site build, example archive, web | 20 |
| Checked that the original prints the text, not whether the text is right | 13 |
| A symbol or default exists, so the prose passed | 11 |
| Same facts, different verdict words (`superseded`, `missing`, `disagrees`) | 11 |
| Read a `man/` file this edition had already fixed | 10 |
| Rejected rows: the study expected `matches`, but `disagrees` supports the rejection | 3 |
| No checker error: the runs that said the original was right were right | 8 |

## What it says about the method

The checkers' errors were almost all type II: a `matches` on text that was wrong. Of the 68 misaligned rows with a Bo3 majority of `matches`, 8 were the errata's own type I errors, which the checkers rightly caught. Most of the other 60 were the checkers' type II errors, though on 11 of them the card stated the error, so `matches` was the right label. A majority vote on these cards can't stand in for reading the quotes. Most misalignments came from the card format, not from the checkers' reading:

- Cards mixed two kinds of claim. Some `was` fields are the printed text, and others describe an error ("frees only items 0 and 1"), so `matches` meant opposite things on different cards.
- `man/` pages are fixed in place, so a checker reading the current file sees this edition's correction. Cards for those rows need the upstream base commit.
- Edition rows can't be checked without the edition's own history, which the allowed paths excluded.
- Where the pass was useful, it was useful through its quotes. The wrong rows were found by runs that read the code further than the original check did: `box_chars_1` rather than the literal `box1`, the whole `waddnstr()`, and the manual's caveat on cooked mode.

A future pass would gain from one fixed question per card ("Is the printed text correct?"), from giving `man/` cards the upstream text, from allowing `git show` of this edition's history for `edition-error` rows, and from tallying a vote only after checking that its quote supports its label.
