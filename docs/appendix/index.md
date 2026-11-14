# Errata and changes

This edition is built from the ncurses documentation by Thomas E. Dickey, Zeyd M. Ben-Halim, Eric S. Raymond, Juergen Pfeifer, Pradeep Padala and the other [contributors](https://betsalel-williamson.github.io/ncurses/credits/). This appendix lists every change it makes to that text: errors corrected in the original, errors this edition introduced and then fixed, formatting, structure and new material. It also lists errors found but not yet fixed, so they can be reported upstream.

The list lives in [errata.csv](errata.csv), one row per change, and the site shows it as the tables below. The list grows with the migration: every pull request that changes a guide or a manual page adds its rows, and the site's workflow fails a pull request that changes the docs without touching the file.

| Column     | Holds                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `category` | `original-error`, `edition-error`, `formatting`, `structure`, `addition`, or `open` for an error found but not yet fixed |
| `where`    | The file, as a path from the repository root                                                                            |
| `anchor`   | The section in that file, when the change is in one section                                                             |
| `was`      | The text or behavior before the change                                                                                  |
| `now`      | The text or behavior after it, or the fix to propose for an `open` row                                                  |
| `source`   | Where the error came from: the original guide, or this edition                                                         |
| `pr`       | The pull request that made the change                                                                                   |
| `commit`   | The full SHA of the commit that made the change                                                                         |

A row names the commit that made its change, so add the rows in a later commit than the change itself, in the same pull request. Pull requests here are merged with merge commits, which keep those SHAs.
