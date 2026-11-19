# AGENTS.md

Instructions for coding agents working on the ncurses documentation migration in this fork. `CLAUDE.md` is a symlink to this file, so every agent reads the same text. The ncurses sources themselves belong to the maintainer, Thomas E. Dickey. This fork changes only the documentation, the site, and the tooling around them.

## The work

The manual pages and guides are moving into Merlon Docs shards under `docs/`. The site at https://betsalel-williamson.github.io/ncurses/ is built from them by `site/`.

- Man page shards: `docs/man/<page>.<ext>` is the skeleton of `.so` lines, and `docs/man/<name>/NN-<section>.<ext>` holds the sections. `sh docs/man/stitch.sh` rebuilds `man/`, and CI fails when `man/` doesn't match.
- Before a man page change: `node site/scripts/man-check.mjs lint`, then `node site/scripts/man-check.mjs diff origin/master` to read the rendered word diff, and `cd site && node --test tests/*.test.mjs`.
- Check every statement against the code, and cite the file and line.
- A page that holds up gets no change, and no filler, such as a failure case that nearly every curses function shares. Commit its check output as evidence, and record the review in `site/data/migration-units.csv` with the evidence path in the `evidence` column.

## Pull requests

- Open every pull request as a draft. The owner marks it ready and merges it. Never merge.
- Follow `.github/pull_request_template.md`: What changes, Demos to spot check, Evidence, and Errata.
- Get the owner's go-ahead before doing anything outside this repository.
- Never rewrite master's history.
- After a pull request merges, reset the working branch to `origin/master`. Run `node site/scripts/migration-history.mjs record`, commit it as "Record #N in the migration history", and check it with `node site/scripts/migration-history.mjs verify`.

## Errata

Every change to the docs' content, formatting or structure gets a row in `docs/appendix/errata.csv`.

- Commit the change first, then add the row. The row gives the pull request number and the change's full 40-character commit SHA.
- Append rows only. Never rewrite existing ones.
- Check the file with `node site/scripts/errata.mjs`.
- A row that says the original was wrong (`original-error` or `edition-error`) also needs `checked`, `quote`, `verdict`, `confidence` and `earlier`.
- Refresh the session figures as the last content commit of each pull request (`site/data/session/README.md`), and record that with an errata row too.
- Before committing session data, strip anything personal or account-identifying. Keep only the numeric usage fields and timestamps.

## Bugs in ncurses itself

When a review finds a bug in the ncurses code or data, rather than in its documentation, add it to the single tracking issue, [#83](https://github.com/betsalel-williamson/ncurses/issues/83), "Bugs in ncurses found while migrating the docs". Don't open a separate issue for each bug, and don't change the ncurses sources.

Each entry gives:

- the date it was found, and the pull request whose review found it;
- the code or data at fault, linked by file and line at a fixed commit;
- the proof, such as a formal model under `site/formal/`, a test program, or both;
- the exact commands to reproduce it, with the output they gave and the ncurses version;
- a possible fix, or the question for the maintainer.

When the bug also makes a page wrong, the page fix gets its own errata row, which links to the issue. Report a bug to the maintainer only with the owner's go-ahead.

## Changing a page's wording

We change the docs to match the code, never the code to match the docs. The manual pages carry a very high bar: change one only when it states something the library demonstrably contradicts, and a program written by its text would behave differently from what the reader expects. A statement that is imprecise but true in the cases programs normally meet stays as it is. Before proposing new wording for a passage:

1. **Define its terms from the pages themselves.** Find where the ncurses pages define each term the passage uses, such as TERMINAL in curs_terminfo(3X) and SCREEN in curs_initscr(3X), and use those terms. Don't coin new ones.
2. **Show the contradiction.** Link the code with GitHub permalinks pinned to a commit, each on its own line and covering the whole function, so the logic can be followed step by step. Pair it with a test program that runs the library and shows the behavior.
3. **Make the smallest edit.** Keep the page's sentence and change only the words that are wrong. Don't drop claims you can't check, such as claims about other implementations, and don't add parentheticals, new cases or filler.
4. **Reuse a sibling page's wording** when another page already describes the same behavior correctly.
5. **Say who the old text misleads,** and in what situation. If no reader would be misled, leave the passage alone.

In the pull request, give each change its Was, Now and Why, with the permalinks and the test case behind it.

## Proofs

When a claim about the code is easier to prove than to argue, such as a limit, a boundary or a state machine, put a model in `site/formal/` and list its commands and expected results in `site/formal/README.md`. Models use Alloy 6.2.0, the version Merlon Docs pins. Pair each model with an executable check that runs the real programs built from this tree.

## Evidence

A claim that work was done is not evidence. Commit the raw output of every check behind a finding, under `site/formal/evidence/<topic>/`, with an `environment.txt` giving the versions, the source commit and any tool checksums. Post the same output in the pull request, and link it from the errata row or the tracking issue. Strip local paths and anything personal before committing.
