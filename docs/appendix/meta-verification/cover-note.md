# Cover note — errata meta-verification results (Cursor outside run)

Please act on the meta-verification package in this directory. Start here:

1. Read [handoff-report.md](handoff-report.md) in full (§2 framing first).
2. Official per-run cards and usage: [runs/](runs/) (`batchN-runK.json` and `*-usage.json`, 18 pairs).
3. Machine rollups: [findings/](findings/), especially `bo3-summary.csv`, `splits.json`, `mismatches-vs-errata.json`.
4. Process overview: [meta-verification.md](../meta-verification.md).

Repository commit checked: `568319e5809ad365ba195ebbd100946c53b42cb4`.

In this study, `matches` means the printed text looks right; `disagrees` means the printed text looks wrong (the inverse of an errata error-row `matches`).

Priority actions are in the handoff report §10. Splits that need a human call: `L56`, `L57`, `L203`, `L215`, `L287`.
