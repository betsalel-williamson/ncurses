# Errata and changes

This edition is built from the ncurses documentation by Thomas E. Dickey, Zeyd M. Ben-Halim, Eric S. Raymond, Juergen Pfeifer, Pradeep Padala and the other [contributors](https://betsalel-williamson.github.io/ncurses/credits/). This appendix lists every change it makes to that text: errors corrected in the original, errors this edition introduced and then fixed, formatting, structure and new material. It also lists errors found but not yet fixed, so they can be reported upstream. [Lessons learned](lessons-learned.md) records what went wrong in the migration itself and what now catches it, [References](references.md) lists where to read more, and [Errata meta-verification](meta-verification.md) is the independent best-of-three audit of error claims (with the current pass's [handoff report](meta-verification/handoff-report.md)).

The list lives in [errata.csv](errata.csv), one row per change, and the site shows it as the tables below. The list grows with the migration: every pull request that changes a guide or a manual page adds its rows, and the site's workflow fails a pull request that changes the docs without touching the file.

| Column       | Holds                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `category`   | `original-error`, `edition-error`, `formatting`, `structure`, `addition`, `open` (found, not yet fixed) or `rejected` (checked, not an error) |
| `where`      | The file, as a path from the repository root                                                                                |
| `anchor`     | The section in that file, when the change is in one section                                                                 |
| `was`        | The text or behavior before the change; for an error, the claim as printed                                                  |
| `now`        | The text or behavior after it, or the fix to propose for an `open` row                                                      |
| `source`     | Where the error came from: the original guide, this edition, or the check that reported it                                  |
| `pr`         | The pull request that made the change                                                                                       |
| `commit`     | The full SHA of the commit that made the change                                                                             |
| `checked`    | What was actually opened to check the claim: files and lines, or URLs, not a citation                                       |
| `quote`      | What those say, quoted                                                                                                      |
| `verdict`    | `matches`, `disagrees`, `missing`, `impossible`, `superseded` or `can't tell`: does the evidence bear out the claim?          |
| `confidence` | `high`, `medium` or `low`                                                                                                   |
| `earlier`    | What would have been concluded one step earlier, before the last thing checked                                              |

Every row that claims an error (`original-error`, `edition-error`, `open`, `rejected`) carries the five-step check in the last five columns, and the site shows it under each table. An error row's verdict is `matches`; a claim the evidence doesn't bear out moves to `rejected` with its verdict, so a finding is never dropped silently.

This edition's own fixes can be wrong. When a later check shows that the original was right after all, a type I error (an error reported that wasn't there), the row moves to `rejected` with the new evidence, so the record of the mistake stays. If the wrong fix also changed the text, the original wording is restored in its own commit, and a new `edition-error` row names that commit. The [adjudication](meta-verification/adjudication.md#rows-changed) of the first outside pass lists the ten rows this happened to, and [Lessons learned](lessons-learned.md#our-own-fixes-can-be-wrong) says why the first check got them wrong.

A row names the commit that made its change, so add the rows in a later commit than the change itself, in the same pull request. Pull requests here are merged with merge commits, which keep those SHAs.
