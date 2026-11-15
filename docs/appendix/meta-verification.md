# Errata meta-verification

Independent re-check of every errata claim that asserts an error, run outside the session that recorded the claim. The goal is to catch wrong error findings before they harden into the appendix, and to confirm real ones with a second system.

## When to run it

Run a meta-verification pass after a large batch of error rows lands in [errata.csv](errata.csv), or when preparing to treat the errata list as settled for a release. It is not a substitute for the [five-step check](index.md) on each row; it audits that check.

## How a pass works

1. Build claim batches from every `original-error`, `edition-error`, `open` and `rejected` row. Each card carries `id`, `claim_as_printed` (the `was` text), `appears_in`, `section` and `original_source` only — never the recorded verdict.
2. Split the cards into six batches. Run **three independent checkers** per batch (best of three). Each run sees one batch file and none of the others.
3. Checkers may open only primary evidence: `ncurses/`, `form/`, `menu/`, `panel/`, `progs/`, `include/`, `Ada95/`, `c++/`, `misc/`, `man/` (`*.3x`, `*.1m`, `*.5`), `doc/html/`, and top-level `INSTALL`, `NEWS`, `README`, `ANNOUNCE`. They must not open `docs/appendix/` or `site/`.
4. Use the Merlon Docs [evidence check](https://github.com/Merlon-Docs/merlon/blob/main/skills/merlon-docs/references/review/evidence-check.md) (install with `npx skills add Merlon-Docs/merlon --skill merlon-docs`). Each card records claim, opened, quote, verdict, confidence and earlier.
5. Tally best-of-three majorities, list splits, and compare against `errata.csv` with the framing below.
6. File the report and run outputs under [meta-verification/](meta-verification/), update [Lessons learned](lessons-learned.md), and open a pull request. Hand the report to a separate agent for follow-up **after that pull request merges**.

## Verdict framing

| System | What `matches` means |
| --- | --- |
| Meta-verification run | The *printed text* is correct given primary evidence (the original was right). |
| An errata error row | The *error claim* is confirmed (the original was wrong). |

So an `original-error` row whose errata verdict is `matches` expects a meta majority of `disagrees`. Keep that map explicit in every report.

## This repository's first outside pass

Commit `568319e5809ad365ba195ebbd100946c53b42cb4`, Cursor Cloud Agent, six batches × three runs, Merlon Docs skill loaded.

| Artifact | Path |
| --- | --- |
| Cover note for the acting agent | [cover-note.md](meta-verification/cover-note.md) |
| Full evidence report | [handoff-report.md](meta-verification/handoff-report.md) |
| Bo3 rollups | [findings/](meta-verification/findings/) |
| Per-run cards and usage | [runs/](meta-verification/runs/) |
| Batch inputs | [inputs/](meta-verification/inputs/) |

Bo3 on 178 claims: 78 `disagrees`, 70 `matches`, 16 `can't tell`, 8 `superseded`, 1 `missing`, 5 three-way splits (`L56`, `L57`, `L203`, `L215`, `L287`). Against `errata.csv` under the map above: 76 aligned, 97 misaligned. The acting agent starts from the cover note and the handoff report's checklist.

A prior attempt inside the Claude docs session failed (safety filter / interrupted runs) and must not be treated as a completed pass; it is recorded in [Lessons learned](lessons-learned.md).
