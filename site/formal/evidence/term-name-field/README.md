# Evidence: term(5)'s name-field limit

The raw output of the checks in `../../README.md`, run on 2026-11-18. `environment.txt` gives the
versions, the source commit, and the Alloy jar's SHA-256.

- `alloy-run.txt`: the Alloy console summary. `SAT` on a `check` means a counterexample exists, and
  `UNSAT` means none exists in scope (every name length from 0 to 1000).
- `alloy-receipt.json`: Alloy's machine-readable receipt, including the counterexample
  (`$NameNeverExceeds128_len` = 351).
- `roundtrip.txt`: `term-name-field-roundtrip.sh` with tic and infocmp built from this tree.
- `header-and-tput.txt`: the name_size each compiled file stores, and whether `tput` can load the
  entry, at 511 and 512 characters.

Paths under a temporary directory are shortened to `DB/`.
