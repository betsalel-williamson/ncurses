# Ncurses errata meta-verification — handoff report for acting agent

**Audience:** the Claude / docs agent that owns `docs/appendix/errata.csv` and the edition fixes.
**Purpose:** independent best-of-three re-check of every error claim, with evidence, so you can confirm, challenge, or reopen fixes.
**Produced by:** Cursor Cloud Agent outside run (parent `bc-70818721-17da-4170-9a41-dc5e879daa66`).
**Generated (UTC):** 2026-11-15T19:27:30Z
**Repo commit checked:** `568319e5809ad365ba195ebbd100946c53b42cb4`

---

## 1. Executive summary

Eighteen isolated runs (6 batches × 3) re-checked **178** claim cards using the Merlon Docs five-step evidence check against primary ncurses sources only. Runs were forbidden to open `docs/appendix/` or `site/`.

| Bo3 majority | Count | Meaning in *this* study |
| --- | ---: | --- |
| `disagrees` | 78 | Printed text contradicted by evidence → original was **wrong** |
| `matches` | 70 | Evidence supports printed text → original was **right** |
| `can't tell` | 16 | Not settleable from allowed repo evidence |
| `superseded` | 8 | Was true of an earlier artifact |
| `missing` | 1 | Referent not found |
| *no majority* | 5 | Three-way split — human required |

- Unanimous 3–0: **64**; majority 2–1: **109**; splits: **5**.
- Against `errata.csv` under the framing map below: **aligned 76**, **misaligned 97**, **n/a 5**.

### What you should do

1. **Keep / land fixes** for Bo3 `disagrees` that already have edition corrections — meta confirms the print was wrong (§5).
2. **Review before undoing** every misalignment where Bo3=`matches` but errata still records an error — many may be checker errors (symbol exists ≠ prose correct) (§6).
3. **Human-resolve** the five splits (§4) before changing those rows.
4. **Record this outside run** in Lessons learned / budget (tokens mostly null; wall clock below). The prior Claude in-session attempt remains a failed run.

---

## 2. Method

### Prompt constraints

- Input: claim cards with `id`, `claim_as_printed`, `appears_in`, `section`, `original_source` only (no recorded verdicts).
- Allowed evidence: `ncurses/`, `form/`, `menu/`, `panel/`, `progs/`, `include/`, `Ada95/`, `c++/`, `misc/`, `man/*.{3x,1m,5}`, `doc/html/`, top-level `INSTALL`, `NEWS`, `README`, `ANNOUNCE`.
- Forbidden: `docs/appendix/**`, `site/**`, other batches, other runs’ answers.
- Skill: `merlon-docs` evidence-check (`references/review/evidence-check.md`).
- Card fields: `id`, `claim`, `opened`, `quote`, `verdict`, `confidence`, `earlier`.

### Verdict framing (critical)

| System | What “matches” means |
| --- | --- |
| **This meta study** | The *printed text* is correct given primary evidence (original was right). |
| **errata.csv error row** | The *error claim* is confirmed (original was wrong). |

Mapping used for alignment:

- `original-error` / `edition-error` / `open` with errata verdict `matches` → expect meta **`disagrees`**.
- `rejected` with non-`matches` errata verdict → expect meta **`matches`**.

### Batches

| Batch | Claims | Id range |
| ---: | ---: | --- |
| 1 | 30 | L2–L44 |
| 2 | 30 | L46–L87 |
| 3 | 30 | L88–L146 |
| 4 | 30 | L148–L205 |
| 5 | 30 | L206–L260 |
| 6 | 28 | L264–L302 |

Ids are `L{csv_line}` in `docs/appendix/errata.csv` (header = line 1).

### Runtime (America/Los_Angeles)

- Orchestrator watch: **2026-11-15 10:51 AM – 11:19 AM** PT.
- Run window: **10:53:53 AM – 11:18:47 AM** PT.
- System: Cursor Cloud Agent, Task `best-of-n-runner`.
- Token/cost fields: mostly `null` — do not invent numbers.
- Prior Claude in-session attempt (33 launches / safety filter) = failed run to log separately.

### Artifact paths

```
docs/appendix/
  meta-verification.md     # process (site page)
  meta-verification/
    cover-note.md          # short note for the acting agent
    handoff-report.md      # this document
    inputs/batch{1-6}.json
    runs/batchN-runK.json + *-usage.json   # OFFICIAL
    findings/              # Bo3 rollups
```

The pre-skill Cursor wave (`out-without-merlon/`) was quarantined outside the repository and is not authoritative.

---

## 3. Bo3 rollup

### 3.1 By batch

| Batch | matches | disagrees | can't tell | superseded | missing | split |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 22 | 3 | 5 | 0 | 0 | 0 |
| 2 | 14 | 14 | 0 | 0 | 0 | 2 |
| 3 | 5 | 25 | 0 | 0 | 0 | 0 |
| 4 | 9 | 10 | 7 | 3 | 0 | 1 |
| 5 | 4 | 17 | 3 | 4 | 1 | 1 |
| 6 | 16 | 9 | 1 | 1 | 0 | 1 |

### 3.2 Compact vote line (every claim)

| Id | Bo3 | Kind | R1 | R2 | R3 | Errata cat/verdict | Aligned | Appears in |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L2 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/overview.md` |
| L3 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/overview.md` |
| L4 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/overview.md` |
| L5 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/custom-field-types.md` |
| L6 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/custom-field-types.md` |
| L7 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/custom-field-types.md` |
| L8 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/custom-field-types.md` |
| L9 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/field-options.md` |
| L10 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | edition-error/matches | NO | `docs/client-library/forms/fields.md` |
| L11 | `matches` | majority | `can't tell` | `matches` | `matches` | edition-error/matches | NO | `docs/client-library/forms/fields.md` |
| L20 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `man/curs_getch.3x` |
| L21 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `man/curs_trace.3x` |
| L22 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `man/curs_extend.3x` |
| L23 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `man/curs_inopts.3x` |
| L24 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `docs/man/term/02-description.5` |
| L25 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `man/term_variables.3x` |
| L26 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `man/curs_bkgd.3x` |
| L27 | `matches` | majority | `matches` | `matches` | `superseded` | original-error/matches | NO | `man/curs_bkgrnd.3x` |
| L28 | `disagrees` | majority | `disagrees` | `matches` | `disagrees` | rejected/disagrees | NO | `man/curs_bkgd.3x` |
| L29 | `disagrees` | majority | `disagrees` | `matches` | `disagrees` | rejected/disagrees | NO | `man/curs_border.3x` |
| L30 | `matches` | unanimous | `matches` | `matches` | `matches` | rejected/superseded | yes | `man/term.5` |
| L34 | `disagrees` | majority | `disagrees` | `matches` | `disagrees` | rejected/disagrees | NO | `man/curs_bkgd.3x` |
| L35 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | edition-error/matches | NO | `man/resizeterm.3x` |
| L36 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | edition-error/matches | NO | `man/infocmp.1m` |
| L37 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | edition-error/matches | NO | `man/curs_terminfo.3x` |
| L38 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | edition-error/matches | NO | `site/src/components/run-example.ts` |
| L41 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/overview.md` |
| L42 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/overview.md` |
| L43 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/menu-windows.md` |
| L44 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/menu-display.md` |
| L46 | `matches` | majority | `matches` | `disagrees` | `matches` | original-error/matches | NO | `docs/client-library/menus/menu-driver.md` |
| L47 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/menus/menu-display.md` |
| L48 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/compiling.md` |
| L49 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/selecting-items.md` |
| L50 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/attributes.md` |
| L51 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/user-pointer-and-hooks.md` |
| L52 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/user-pointer-and-hooks.md` |
| L53 | `matches` | majority | `matches` | `disagrees` | `matches` | original-error/matches | NO | `docs/client-library/menus/menu-display.md` |
| L54 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/menus/menu-driver.md` |
| L55 | `matches` | majority | `matches` | `can't tell` | `matches` | original-error/matches | NO | `docs/client-library/menus/attributes.md` |
| L56 | `None` | split | `matches` | `disagrees` | `superseded` | original-error/matches | — | `man/menu_driver.3x` |
| L57 | `None` | split | `matches` | `disagrees` | `superseded` | original-error/matches | — | `man/menu_driver.3x` |
| L65 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/overview.md` |
| L66 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/input-and-stdscr.md` |
| L67 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/hiding.md` |
| L68 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/hiding.md` |
| L69 | `matches` | majority | `matches` | `disagrees` | `matches` | original-error/matches | NO | `docs/client-library/panels/input-and-stdscr.md` |
| L70 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/hiding.md` |
| L71 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/browsing.md` |
| L72 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/panels/moving-and-resizing.md` |
| L73 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/panels/hiding.md` |
| L74 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/overview.md` |
| L75 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/panels/hiding.md` |
| L81 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/getting-started/initialization.md` |
| L82 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/getting-started/hello-world.md` |
| L83 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/getting-started/hello-world.md` |
| L84 | `matches` | majority | `matches` | `disagrees` | `matches` | original-error/matches | NO | `docs/client-library/getting-started/hello-world.md` |
| L85 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/getting-started/hello-world.md` |
| L86 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/getting-started/naming-and-variables.md` |
| L87 | `matches` | majority | `matches` | `disagrees` | `matches` | original-error/matches | NO | `docs/client-library/getting-started/naming-and-variables.md` |
| L88 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/getting-started/naming-and-variables.md` |
| L89 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/getting-started/initialization.md` |
| L90 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/getting-started/history.md` |
| L96 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/windows/border-functions.md` |
| L97 | `matches` | majority | `matches` | `disagrees` | `matches` | original-error/matches | NO | `docs/client-library/windows/windows-and-refresh.md` |
| L98 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/windows/creating-windows.md` |
| L102 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/output/forms-characters.md` |
| L103 | `matches` | majority | `matches` | `matches` | `disagrees` | original-error/matches | NO | `docs/client-library/output/characters-and-strings.md` |
| L104 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/output/printw.md` |
| L105 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/output/` |
| L111 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/windows/border-functions.md` |
| L114 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/input/characters-and-strings.md` |
| L115 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/input/characters-and-strings.md` |
| L116 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/input/characters-and-strings.md` |
| L117 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/input/` |
| L121 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/attributes/colors.md` |
| L122 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/attributes/attribute-functions.md` |
| L123 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/attributes/chgat.md` |
| L124 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/attributes/attributes.md` |
| L125 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/attributes/` |
| L129 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/keyboard/key-usage-example.md` |
| L130 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/keyboard/key-usage-example.md` |
| L131 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/keyboard/` |
| L135 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/mouse/mouse-events.md` |
| L136 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/mouse/mouse-menu-example.md` |
| L137 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/mouse/mouse-menu-example.md` |
| L138 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/mouse/mouse-menu-example.md` |
| L139 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/mouse/mouse-events.md` |
| L140 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/mouse/` |
| L146 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/screen/coordinates.md` |
| L148 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/screen/saving-and-copying.md` |
| L155 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/init-and-debugging/terminal-descriptions.md` |
| L156 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/init-and-debugging/terminal-descriptions.md` |
| L157 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/init-and-debugging/debugging.md` |
| L160 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/init-and-debugging/initialization-and-wrapup.md` |
| L161 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/init-and-debugging/debugging.md` |
| L162 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/init-and-debugging/terminal-descriptions.md` |
| L164 | `disagrees` | majority | `disagrees` | `matches` | `disagrees` | original-error/matches | yes | `docs/client-library/hints/resizing.md` |
| L167 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/hints/resizing.md` |
| L168 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/hints/terminals.md` |
| L169 | `superseded` | majority | `superseded` | `disagrees` | `superseded` | original-error/matches | NO | `docs/client-library/hints/extensions.md` |
| L170 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/hints/compatibility.md` |
| L171 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/hints/compatibility.md` |
| L174 | `can't tell` | majority | `can't tell` | `can't tell` | `disagrees` | original-error/matches | NO | `docs/client-library/more/hanoi.md` |
| L175 | `can't tell` | majority | `can't tell` | `can't tell` | `disagrees` | original-error/matches | NO | `docs/client-library/more/shuffle.md` |
| L176 | `can't tell` | majority | `can't tell` | `can't tell` | `disagrees` | original-error/matches | NO | `docs/client-library/more/typing-tutor.md` |
| L177 | `can't tell` | majority | `can't tell` | `can't tell` | `matches` | original-error/matches | NO | `docs/client-library/more/typing-tutor.md` |
| L178 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | original-error/matches | NO | `docs/client-library/more/widget-libraries.md` |
| L179 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | original-error/matches | NO | `docs/client-library/more/widget-libraries.md` |
| L194 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | edition-error/matches | yes | `site/src/content/docs/index.mdx` |
| L195 | `matches` | unanimous | `matches` | `matches` | `matches` | edition-error/matches | NO | `site/src/content/docs/index.mdx` |
| L196 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | edition-error/matches | yes | `site/src/content/docs/credits.md` |
| L198 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/objective.md` |
| L199 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | original-error/matches | NO | `docs/contributor/hackguide/reporting-bugs.md` |
| L200 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/hackguide/reporting-bugs.md` |
| L201 | `disagrees` | majority | `superseded` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/reporting-bugs.md` |
| L202 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/hackguide/engine-room.md` |
| L203 | `None` | split | `disagrees` | `superseded` | `missing` | original-error/matches | — | `docs/contributor/hackguide/engine-room.md` |
| L204 | `superseded` | unanimous | `superseded` | `superseded` | `superseded` | original-error/matches | NO | `docs/contributor/hackguide/engine-room.md` |
| L205 | `superseded` | majority | `superseded` | `superseded` | `missing` | original-error/matches | NO | `docs/contributor/hackguide/engine-room.md` |
| L206 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/engine-room.md` |
| L207 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/engine-room.md` |
| L208 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/hackguide/forms-and-menus.md` |
| L209 | `disagrees` | majority | `missing` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/terminfo-compiler.md` |
| L210 | `disagrees` | majority | `missing` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/style-tips.md` |
| L211 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/style-tips.md` |
| L212 | `disagrees` | majority | `superseded` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/porting-hints.md` |
| L213 | `superseded` | majority | `superseded` | `superseded` | `disagrees` | original-error/matches | NO | `docs/contributor/hackguide/porting-hints.md` |
| L214 | `superseded` | majority | `superseded` | `superseded` | `disagrees` | original-error/matches | NO | `docs/contributor/hackguide/porting-hints.md` |
| L215 | `None` | split | `missing` | `superseded` | `disagrees` | original-error/matches | — | `docs/contributor/hackguide/porting-hints.md` |
| L223 | `disagrees` | majority | `can't tell` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/install/installation-procedure.md` |
| L224 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/install/installation-procedure.md` |
| L225 | `missing` | majority | `missing` | `missing` | `disagrees` | original-error/matches | NO | `docs/contributor/install/installation-procedure.md` |
| L227 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/install/installation-procedure.md` |
| L228 | `matches` | majority | `matches` | `matches` | `disagrees` | original-error/matches | NO | `docs/contributor/install/configure-options/with-m-z.md` |
| L229 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/install/configure-options/with-m-z.md` |
| L232 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/install/system-integrators.md` |
| L233 | `disagrees` | majority | `missing` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/install/system-integrators.md` |
| L235 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/install/bsd-conversion.md` |
| L241 | `can't tell` | majority | `matches` | `can't tell` | `can't tell` | original-error/matches | NO | `docs/contributor/install/bug-reports.md` |
| L243 | `disagrees` | majority | `can't tell` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/install/mingw.md` |
| L247 | `superseded` | unanimous | `superseded` | `superseded` | `superseded` | original-error/matches | NO | `docs/contributor/ada/limitations.md` |
| L248 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/ada/index.md` |
| L249 | `superseded` | majority | `superseded` | `superseded` | `disagrees` | original-error/matches | NO | `docs/contributor/ada/index.md` |
| L250 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/ada/implementation-details.md` |
| L256 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/announce/release-notes.md` |
| L257 | `disagrees` | majority | `can't tell` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/announce/program-improvements.md` |
| L258 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | original-error/matches | NO | `docs/contributor/announce/development.md` |
| L259 | `can't tell` | majority | `matches` | `can't tell` | `can't tell` | original-error/matches | NO | `docs/contributor/announce/development.md` |
| L260 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/contributor/announce/portability.md` |
| L264 | `disagrees` | majority | `matches` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/getting-started/introduction.md` |
| L268 | `matches` | majority | `matches` | `matches` | `disagrees` | original-error/matches | NO | `docs/client-library/getting-started/initialization.md` |
| L271 | `matches` | majority | `disagrees` | `matches` | `matches` | edition-error/matches | NO | `docs/client-library/output/forms-characters.md` |
| L272 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/input/characters-and-strings.md` |
| L273 | `matches` | unanimous | `matches` | `matches` | `matches` | edition-error/matches | NO | `docs/client-library/input/characters-and-strings.md` |
| L274 | `disagrees` | majority | `disagrees` | `matches` | `disagrees` | original-error/matches | yes | `docs/client-library/attributes/chgat.md` |
| L275 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/mouse/mouse-events.md` |
| L276 | `matches` | majority | `disagrees` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/screen/line-drawing-characters.md` |
| L277 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/forms/fields.md` |
| L278 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/forms/field-options.md` |
| L279 | `superseded` | unanimous | `superseded` | `superseded` | `superseded` | original-error/matches | NO | `docs/client-library/forms/field-options.md` |
| L280 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/forms/field-options.md` |
| L281 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/forms/form-driver.md` |
| L282 | `disagrees` | majority | `disagrees` | `disagrees` | `matches` | original-error/matches | yes | `docs/client-library/forms/form-driver.md` |
| L283 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/forms/form-driver.md` |
| L284 | `disagrees` | unanimous | `disagrees` | `disagrees` | `disagrees` | original-error/matches | yes | `docs/client-library/forms/hooks-and-form-options.md` |
| L285 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/client-library/hints/compatibility.md` |
| L286 | `can't tell` | unanimous | `can't tell` | `can't tell` | `can't tell` | original-error/matches | NO | `docs/client-library/more/shuffle.md` |
| L287 | `None` | split | `can't tell` | `matches` | `disagrees` | edition-error/matches | — | `docs/client-library/hints/resizing.md` |
| L293 | `matches` | unanimous | `matches` | `matches` | `matches` | edition-error/matches | NO | `docs/contributor/ada/implementation-details.md` |
| L294 | `disagrees` | majority | `disagrees` | `matches` | `disagrees` | original-error/matches | yes | `docs/contributor/hackguide/terminfo-compiler.md` |
| L295 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/hackguide/terminfo-compiler.md` |
| L296 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/hackguide/other-utilities.md` |
| L297 | `matches` | majority | `matches` | `matches` | `disagrees` | original-error/matches | NO | `docs/contributor/install/installation-procedure.md` |
| L298 | `matches` | unanimous | `matches` | `matches` | `matches` | original-error/matches | NO | `docs/contributor/install/installation-procedure.md` |
| L300 | `matches` | unanimous | `matches` | `matches` | `matches` | edition-error/matches | NO | `docs/glossary/attribute.md` |
| L301 | `matches` | unanimous | `matches` | `matches` | `matches` | edition-error/matches | NO | `docs/glossary/wide-character-library.md` |
| L302 | `matches` | majority | `matches` | `matches` | `disagrees` | original-error/matches | NO | `docs/contributor/install/installation-procedure.md` |

---

## 4. Splits — must human-resolve (full evidence)

These five claims have no 2–1 or 3–0 majority. Do not change errata from meta alone.

## L56 (batch 2)

- **Claim as printed:** the drive assumes it is an application-specific command
- **Appears in (corrected edition — not evidence):** `man/menu_driver.3x` § APPLICATION-DEFINED COMMANDS
- **Original source:** ncurses manual pages
- **Bo3 majority:** `None` (split) — votes: `matches | disagrees | superseded` → {'matches': 1, 'disagrees': 1, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`the drive assumes it is an application-specific command` / now=`the driver assumes it is an application-specific command`
- **Errata checked / quote:** man/menu_driver.3x:165 / the drive assumes it is an application-specific
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=None

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/menu_driver.3x:163-166", "doc/html/man/menu_driver.3x.html:173-176"]
- **Quote:** man/menu_driver.3x: the driver assumes it is an application-specific command. / doc/html/man/menu_driver.3x.html: the drive assumes it is an application-specific command.
- **Earlier:** disagrees — man/menu_driver.3x alone already says driver, not drive

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["man/menu_driver.3x:163-166"]
- **Quote:** Current man/menu_driver.3x: "the driver assumes it is an application-specific command".
- **Earlier:** Same: "drive" is not the wording in this tree's man page (it is "driver").

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/menu_driver.3x:162-166", "git show 3b3c5fd89^:man/menu_driver.3x (Application-defined Commands)"]
- **Quote:** At this commit: "the driver assumes it is an application-specific command". Parent of 3b3c5fd89 ("man: fix two typos in menu_driver(3X)") had "the drive assumes".
- **Earlier:** Reading only HEAD I would have said disagrees; the pre-fix revision shows the claim matched an earlier man page.


## L57 (batch 2)

- **Claim as printed:** menu_driver return one of the following error codes
- **Appears in (corrected edition — not evidence):** `man/menu_driver.3x` § RETURN VALUE
- **Original source:** ncurses manual pages
- **Bo3 majority:** `None` (split) — votes: `matches | disagrees | superseded` → {'matches': 1, 'disagrees': 1, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`menu_driver return one of the following error codes` / now=`menu_driver returns one of the following error codes`
- **Errata checked / quote:** man/menu_driver.3x:170 / \fBmenu_driver\fP return one of the following error codes:
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=None

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/menu_driver.3x:169-170", "doc/html/man/menu_driver.3x.html:181-182"]
- **Quote:** man/menu_driver.3x: menu_driver returns one of the following error codes. / doc/html/man/menu_driver.3x.html: menu_driver return one of the following error codes.
- **Earlier:** disagrees — man/menu_driver.3x alone has returns

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["man/menu_driver.3x:169-170"]
- **Quote:** Current man/menu_driver.3x: "menu_driver returns one of the following error codes:".
- **Earlier:** Same from the RETURN VALUE line alone.

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/menu_driver.3x:169-170", "git show 3b3c5fd89^:man/menu_driver.3x (RETURN VALUE)"]
- **Quote:** At this commit: "menu_driver returns one of the following error codes". Pre-fix text was "menu_driver return one of the following error codes".
- **Earlier:** HEAD alone contradicts the claim; the typo-fix parent bears it out historically.


## L203 (batch 4)

- **Claim as printed:** `timed_wait()`
- **Appears in (corrected edition — not evidence):** `docs/contributor/hackguide/engine-room.md` § keyboard-input
- **Original source:** A Hacker's Guide to NCURSES
- **Bo3 majority:** `None` (split) — votes: `disagrees | superseded | missing` → {'disagrees': 1, 'superseded': 1, 'missing': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``timed_wait()`` / now=``_nc_timed_wait()``
- **Errata checked / quote:** ncurses/tty/lib_twait.c:39; ncurses/tty/lib_twait.c:165 / _nc_timed_wait(const SCREEN *sp MAYBE_UNUSED,
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=None

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** doc/html/hackguide.html:516-517; ncurses/tty/lib_twait.c:39,165; ncurses/curses.priv.h:2245
- **Quote:** Hackguide names timed_wait(); the implementation symbol is _nc_timed_wait().
- **Earlier:** matches (hackguide name alone)

### Run 2

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["doc/html/hackguide.html:516-517", "ncurses/tty/lib_twait.c:39", "ncurses/tty/lib_twait.c:165", "ncurses/curses.priv.h:2245"]
- **Quote:** hackguide names timed_wait(); the implementation is _nc_timed_wait in lib_twait.c. No timed_wait symbol remains in .c/.h sources.
- **Earlier:** Before searching symbols I would have matched the hackguide name.

### Run 3

- **Verdict:** `missing` (high confidence)
- **Opened:** ["doc/html/hackguide.html:516-517", "ncurses/tty/lib_twait.c:37-39", "ncurses/tty/lib_twait.c:165", "ncurses/curses.priv.h:2245"]
- **Quote:** hackguide names timed_wait(). Source exports _nc_timed_wait only; no timed_wait symbol.
- **Earlier:** Before searching the tree, the hackguide name looked like the real function.


## L215 (batch 5)

- **Claim as printed:** `comp_main.c`
- **Appears in (corrected edition — not evidence):** `docs/contributor/hackguide/porting-hints.md`
- **Original source:** A Hacker's Guide to NCURSES
- **Bo3 majority:** `None` (split) — votes: `missing | superseded | disagrees` → {'missing': 1, 'superseded': 1, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``comp_main.c`` / now=``progs/tic.c``
- **Errata checked / quote:** progs/tic.c / tic's main() is in progs/tic.c; no comp_main.c exists
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=None

### Run 1

- **Verdict:** `missing` (high confidence)
- **Opened:** ["doc/html/hackguide.html:862-865", "ncurses/tinfo/ (comp_error.c, comp_expand.c, comp_hash.c, comp_parse.c, comp_scan.c; no comp_main.c)", "progs/tic.c:687 (main)", "MANIFEST (no comp_main.c)"]
- **Quote:** hackguide lists comp_main.c among files not needed for a single-terminal port. No comp_main.c exists; tic lives in progs/tic.c.
- **Earlier:** Hackguide listing alone would have assumed the file existed.

### Run 2

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["doc/html/hackguide.html:862-865", "include/tic.h:360", "progs/tic.c:687"]
- **Quote:** hackguide lists comp_main.c among sources not needed for single-terminal ports. / no comp_main.c in the tree; tic.h still comments 'comp_main.c: compiler main'; main() is in progs/tic.c.
- **Earlier:** missing — file not present before noting tic.c absorbed the role

### Run 3

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/hackguide.html:862-864", "include/tic.h:360", "progs/tic.c"]
- **Quote:** hackguide lists comp_main.c among compiler sources; no comp_main.c file exists (tic main is progs/tic.c; tic.h only comments “comp_main.c”).
- **Earlier:** missing — file absent from the tree


## L287 (batch 6)

- **Claim as printed:** [pads](glossary/pad.md) stdscr with blanks: the glossary link was on the verb
- **Appears in (corrected edition — not evidence):** `docs/client-library/hints/resizing.md` § key_resize
- **Original source:** This edition (glossary links, PR 53, commit df81beb)
- **Bo3 majority:** `None` (split) — votes: `can't tell | matches | disagrees` → {"can't tell": 1, 'matches': 1, 'disagrees': 1}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`[pads](glossary/pad.md) stdscr with blanks: the glossary link was on the verb` / now=`The link moves to the noun later in the paragraph (can't resize pads)`
- **Errata checked / quote:** docs/client-library/hints/resizing.md:11; docs/man/resizeterm/03-description.3x:65 / and pads stdscr with blanks if the screen grew; It is not possible to automatically resize pads.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=None

### Run 1

- **Verdict:** `can't tell` (medium confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1227-1230", "man/resizeterm.3x:115-120"]
- **Quote:** Intro: resizeterm 'pads stdscr with blanks if the screen is larger' — pads is a verb. A pad window is a different concept (resizeterm: 'It is not possible to automatically resize pads.'). Whether the edition linked glossary/pad.md is outside primary evidence (appears_in is corrected text, not evidence).
- **Earlier:** Technical 'pads stdscr with blanks' matches; the glossary-link placement needs the edition shard, which is not primary evidence.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1226-1230"]
- **Quote:** ncurses-intro: "ensures that all windows are limited to the new screen dimensions, and pads stdscr with blanks if the screen is larger." Here "pads" is the verb "fills", not the pad window type.
- **Earlier:** Primary text already shows the verb; a glossary link to pad would be misplaced. (Markdown link markup itself is outside primary evidence.)

### Run 3

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1227-1230", "man/resizeterm.3x:115-120"]
- **Quote:** Intro: resizeterm "pads stdscr with blanks if the screen is larger" — pads is a verb meaning fills, not the pad window type. Linking that verb to a pad glossary entry would be wrong. Man notes pads cannot be auto-resized as a separate concept.
- **Earlier:** matches — the words "pads stdscr with blanks" appear verbatim in the intro


---

## 5. Confirmed wrong print (Bo3 `disagrees`) — supports fixes

**78** claims. Where also aligned with errata (`aligned=yes`), treat as independent confirmation.

- Aligned with errata error rows: **75**
- Misaligned: **3**
- Mapping n/a: **0**

### 5.1 Aligned confirmations (evidence from a `disagrees` run)

#### L47 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: Example 21. Milt Columnar Menus Example
- Edition path: `docs/client-library/menus/menu-display.md`
- Errata now: Example: Multi Columnar Menus Example
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:4927-4939"]
- Evidence (`quote`): Section heading "17.6. Multi Columnar Menus"; example title "Example 21. Milt Columnar Menus Example".

#### L65 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: replace a panel's window with a different window by calling `replace_window`
- Edition path: `docs/client-library/panels/overview.md`
- Errata now: calling `replace_panel()`
- Evidence (`opened`): ["doc/html/ncurses-intro.html:1469-1471", "man/panel.3x:63,178-180", "panel/panel.h:84"]
- Evidence (`quote`): ncurses-intro names replace_window; panel(3X)/panel.h export replace_panel, not replace_window.

#### L66 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: The `stsdcr` window is a special case
- Edition path: `docs/client-library/panels/input-and-stdscr.md`
- Errata now: The `stdscr` window
- Evidence (`opened`): ["doc/html/ncurses-intro.html:1506-1510", "man/panel.3x:83-91", "man/menu_win.3x:60"]
- Evidence (`quote`): Intro: "The stsdcr window is a special case" then correctly says stdscr in the next sentence. panel(3X) discusses stdscr. menu_win.3x also still has the stsdcr typo.

#### L67 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: The `panel_update` code ignores hidden panels
- Edition path: `docs/client-library/panels/hiding.md`
- Errata now: The `update_panels()` function ignores hidden panels
- Evidence (`opened`): ["doc/html/ncurses-intro.html:1528-1529", "man/panel.3x:205-209", "panel/p_update.c:43-67", "panel/panel.priv.h:119-123"]
- Evidence (`quote`): Intro says panel_update; the API is update_panels. update_panels walks the linked stack from _nc_bottom_panel; hidden panels are unlinked (IS_LINKED false), so they are skipped.

#### L68 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: You cannot do `top_panel()` or `bottom_panel` on a hidden panel()
- Edition path: `docs/client-library/panels/hiding.md`
- Errata now: In ncurses both work on a hidden panel and make it visible; use show_panel() for portability to System V
- Evidence (`opened`): ["doc/html/ncurses-intro.html:1528-1530", "man/panel.3x:245-247", "panel/p_top.c:43-47", "panel/p_show.c:42-72", "panel/p_bottom.c:43-74"]
- Evidence (`quote`): panel(3X) PORTABILITY: show_panel and top_panel "work equally well with displayed or hidden panels". top_panel calls show_panel; bottom_panel re-links an unlinked panel near stdscr.

#### L70 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: For some reason the function `panel_hidden()` which tells whether a panel is hidden or not is not working, with a link to a 1999 bug report
- Edition path: `docs/client-library/panels/hiding.md`
- Errata now: panel_hidden() returns TRUE for a hidden panel, and the example uses it
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:4067-4072", "panel/p_hidden.c:43-54", "man/panel.3x:163-168"]
- Evidence (`quote`): HOWTO asserts panel_hidden is not working and links geocrawler 1999. panel_hidden returns TRUE when !IS_LINKED(pan), FALSE when linked; panel(3X) documents that. The external report is outside the repo.

#### L71 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: /* Update the stacking order. 2nd panel will be on top */ (also in the moving and hiding listings)
- Edition path: `docs/client-library/panels/browsing.md`
- Errata now: The last panel created is on top
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:3537,3680,3908,4191", "panel/p_update.c:43-67", "man/panel.3x:142-147"]
- Evidence (`quote`): Browsing/moving/hiding listings use that comment before update_panels(). new_panel places each new panel on top, so after panels 0,1,2 the third (index 2) is on top. update_panels does not reorder the stack.

#### L74 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: Mainpulate; is used to created panels; removes it form the stack; Entered Resizing :Use
- Edition path: `docs/client-library/panels/overview.md`
- Errata now: Manipulate; create; from; Entered Resizing: Use
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:3450,3460,4057-4058,3944-3945"]
- Evidence (`quote`): HOWTO prints "is used to created panels", "Mainpulate the panels", "removes it form the stack", and "Entered Resizing :Use Arrow Keys…".

#### L75 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: `bottom_panel` on a hidden panel()
- Edition path: `docs/client-library/panels/hiding.md`
- Errata now: `bottom_panel()` on a hidden panel
- Evidence (`opened`): ["doc/html/ncurses-intro.html:1528-1530", "panel/p_bottom.c:43-74", "man/panel.3x:105-107"]
- Evidence (`quote`): Intro forbids bottom_panel on a hidden panel. bottom_panel unlinks if needed then inserts above the stdscr pseudo-panel; it accepts a previously hidden panel.

#### L81 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: In the `cbreak()` mode these control characters are interpreted as any other character by the terminal driver
- Edition path: `docs/client-library/getting-started/initialization.md`
- Errata now: In cbreak() mode the terminal driver still interprets them, and generates the signal as usual
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1339-1342", "man/curs_inopts.3x:149-157,434-448"]
- Evidence (`quote`): HOWTO attributes that behavior to cbreak(). curs_inopts(3X): in cbreak, interrupt/quit/suspend/flow-control characters are unaffected; raw is what passes them through uninterpreted.

#### L82 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: `endwin()` frees the memory taken by curses sub-system and its data structures and puts the terminal in normal mode
- Edition path: `docs/client-library/getting-started/hello-world.md`
- Errata now: endwin() restores the terminal modes and cursor; it does not free memory, and a later refresh() resumes curses mode
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1282-1284", "man/curs_initscr.3x:203-227,267-274,484-488", "doc/html/ncurses-intro.html:936-941"]
- Evidence (`quote`): HOWTO says endwin frees curses memory. curs_initscr(3X): endwin restores modes/cursor/etc. but "does not dispose of the memory allocated by initscr or newterm"; delscreen frees SCREEN storage.

#### L83 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: `<curses.h>` also includes `<termios.h>`, `<termio.h>`, or `<sgtty.h>` depending on your system
- Edition path: `docs/client-library/getting-started/hello-world.md`
- Errata now: Removed; curses.h includes stdio.h, and no terminal-driver header
- Evidence (`opened`): ["doc/html/ncurses-intro.html:485-489", "include/curses.h.in:90-102,250-300", "include/MKterm.h.awk.in:133-151"]
- Evidence (`quote`): Intro claims curses.h includes termios/termio/sgtty. curses.h.in includes stdio/stdarg/stddef/stdbool etc., not those tty headers; MKterm.h.awk.in puts termios/termio/sgtty into term.h.

#### L85 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: To use ncurses library functions, you have to include ncurses.h in your programs
- Edition path: `docs/client-library/getting-started/hello-world.md`
- Errata now: #include <curses.h>; ncurses also installs it as ncurses.h
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1173-1190", "INSTALL:1422-1425", "include/curses.h.in:36"]
- Evidence (`quote`): HOWTO says include ncurses.h, then Example 1 uses #include <curses.h>. INSTALL default installs curses.h; --without-curses-h installs as ncurses.h instead.

#### L86 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: `bool`: boolean type, actually a "char"
- Edition path: `docs/client-library/getting-started/naming-and-variables.md`
- Errata now: C's bool from stdbool.h where available, otherwise a type configure chooses
- Evidence (`opened`): ["doc/html/ncurses-intro.html:596-600", "include/curses.h.in:276-307", "INSTALL:1429-1436"]
- Evidence (`quote`): Intro: bool is actually a char. curses.h.in typedefs NCURSES_BOOL from configure (@cf_cv_type_of_bool@) and may use <stdbool.h> or the C++ bool; INSTALL discusses matching C++ bool size/type.

#### L88 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: Changes should be made to through the API; To write to a different window. use the routine waddch() ... is provided
- Edition path: `docs/client-library/getting-started/naming-and-variables.md`
- Errata now: Changes should be made through the API; To write to a different window, use the routine waddch()
- Evidence (`opened`): ["doc/html/ncurses-intro.html:534-542"]
- Evidence (`quote`): Changes should be made to through the API, and then the routine refresh() (or wrefresh()) called. ... To write to a different window. use the routine waddch() (for window-specific addch()) is provided.

#### L89 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: rearing to get started; halfdelay()is called; if he doesn't respond with in certain time
- Edition path: `docs/client-library/getting-started/initialization.md`
- Errata now: halfdelay() is called; if they don't respond within a certain time
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:809-810", "doc/html/NCURSES-Programming-HOWTO.html:1389-1397", "man/curs_inopts.3x"]
- Evidence (`quote`): you must be rearing to get started. ... halfdelay()is called to enable the half-delay mode ... if he doesn't respond with in certain time, we can do some thing else.

#### L90 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: Mail links to zmbenhal@netcom.com and esr@snark.thyrsus.com, and a link to adahome.com for the Ada95 binding
- Edition path: `docs/client-library/getting-started/history.md`
- Errata now: Names without the old addresses and link
- Evidence (`opened`): ["doc/html/ncurses-intro.html:417-428", "ANNOUNCE:662", "AUTHORS:34-36", "Ada95/"]
- Evidence (`quote`): original maintainer ... mailto:zmbenhal@netcom.com ... mailto:esr@snark.thyrsus.com ... Ada95 binding linked to http://www.adahome.com ... Contact the current maintainers at bug-ncurses@gnu.org. ANNOUNCE directs mail to bug-ncurses@gnu.org. Ada95 binding lives in-tree under Ada95/.

#### L96 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: create_box() puts the corners at x + w and y + h, so a box of width 10 and height 3 is drawn 11 columns wide and 4 rows tall, and the erase loop clears one row and column more
- Edition path: `docs/client-library/windows/border-functions.md`
- Errata now: Corners at x + w - 1 and y + h - 1, lines of w - 2 and h - 2, and the erase loop stops before x + w and y + h
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2460-2461", "doc/html/NCURSES-Programming-HOWTO.html:2489-2512"]
- Evidence (`quote`): p_win->height = 3; p_win->width = 10; ... mvaddch(y, x + w, ...); mvaddch(y + h, x, ...); mvaddch(y + h, x + w, ...); ... for (j = y; j <= y + h; ++j) for (i = x; i <= x + w; ++i) mvaddch(j, i, ' ');

#### L98 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: let me clear few things; It doesn't create any thing; as user press a key; Let's dissect it by line by line
- Edition path: `docs/client-library/windows/creating-windows.md`
- Errata now: a few things; anything; as the user presses a key; line by line
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1486-1488", "doc/html/NCURSES-Programming-HOWTO.html:2237-2238", "doc/html/NCURSES-Programming-HOWTO.html:2366-2368"]
- Evidence (`quote`): let me clear few things about windows. ... It doesn't create any thing on the screen actually. ... destroys windows as user press a key. ... Let's dissect it by line by line.

#### L102 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: If the terminal does not have such characters, curses.h will map them to a recognizable (though ugly) set of ASCII defaults
- Edition path: `docs/client-library/output/forms-characters.md`
- Errata now: curses maps them to ASCII defaults when it starts; the header only defines the ACS_ names
- Evidence (`opened`): ["doc/html/ncurses-intro.html:801-805", "man/curs_addch.3x:289-300", "ncurses/tinfo/lib_acs.c:107-128"]
- Evidence (`quote`): Intro: curses.h will map them to ... ASCII defaults. Man: curses uses the ACS default listed below if the terminal type lacks acs_chars. lib_acs.c _nc_init_acs sets real_map['l']='+', ['q']='-', ['x']='|', etc.

#### L105 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: let's interact with world; message to be appeared on the screen; Try resizing your window(if possible); ch(of type char); the character printed ... until it is turned off
- Edition path: `docs/client-library/output/`
- Errata now: let's interact with the world; message to appear on the screen; window (if possible); characters printed ... until they are turned off
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1539", "doc/html/NCURSES-Programming-HOWTO.html:1721-1729", "doc/html/NCURSES-Programming-HOWTO.html:1588-1604"]
- Evidence (`quote`): let's interact with world. ... message to be appeared on the screen ... Try resizing your window(if possible) ... ch(of type char) ... Once set, the character printed in the window are associated with the attributes until it is turned off.

#### L111 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: With _DEBUG defined, print_win_params() prints at row 25, below the bottom of a 24-row screen, so nothing is shown
- Edition path: `docs/client-library/windows/border-functions.md`
- Errata now: Prints on the bottom line (LINES - 1), then moves the cursor back to the top left so "Press F1 to exit" stays at the top
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2477-2482", "doc/html/NCURSES-Programming-HOWTO.html:2839-2840"]
- Evidence (`quote`): print_win_params under #ifdef _DEBUG does mvprintw(25, 0, ...). Sibling examples hard-code a 24-row screen via starty = (24 - HEIGHT) / 2. Row 25 is past the last valid row 23 on a 24-line screen.

#### L115 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: Example 4. A Simple scanw example
- Edition path: `docs/client-library/input/characters-and-strings.md`
- Errata now: A Simple getstr example
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1908-1928", "man/curs_scanw.3x", "man/curs_getstr.3x"]
- Evidence (`quote`): Title: Example 4. A Simple scanw example. Body calls getstr(str); with no scanw/wscanw. Man pages treat scanw and getstr as distinct interfaces.

#### L116 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: These pseudo-line-oriented functions turn on echoing while they execute
- Edition path: `docs/client-library/input/characters-and-strings.md`
- Errata now: If echo is set, the characters are echoed as they are typed
- Evidence (`opened`): ["doc/html/ncurses-intro.html:775-779", "ncurses/base/lib_getstr.c:97-101", "ncurses/base/lib_getstr.c:150-152", "man/curs_getstr.3x:118-123"]
- Evidence (`quote`): Intro: These pseudo-line-oriented functions turn on echoing while they execute. wgetnstr_events saves tty flags, calls noecho(), and only waddch-echoes when save_flags._echo was already TRUE. Man: If the screen's echo option is enabled, wgetstr updates win with waddch.

#### L117 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: begin read them; must used; one or the other has to changed; The resulting string of characters are pointed to
- Edition path: `docs/client-library/input/`
- Errata now: begin reading them; must be used; has to be changed; is pointed to
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1826-1829", "doc/html/ncurses-intro.html:770-771", "doc/html/NCURSES-Programming-HOWTO.html:1895-1897"]
- Evidence (`quote`): begin read them only after a new line ... cbreak() function must used ... one or the other has to changed before calling getch() ... The resulting string of characters are pointed to by str

#### L121 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: Initially RED color is defined with content 1000(r), 0(g), 0(b); init_color(COLOR_RED, 700, 0, 0) is described as lightening red by a minuscule
- Edition path: `docs/client-library/attributes/colors.md`
- Errata now: Initially ncurses defines red as 680, 0, 0, so the call makes it slightly brighter
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2688-2704", "ncurses/base/lib_color.c:106-113", "man/curs_color.3x:650-678"]
- Evidence (`quote`): HOWTO: lighten the intensity of red ... init_color(COLOR_RED, 700, 0, 0); ... Initially RED color is defined with content 1000(r), 0(g), 0(b). Source cga_palette: COLOR_RED uses RGB_ON=680. Man: each channel of the eight standard colors has a value of either 680 or 0; SVr4 assigned 1000.

#### L122 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: attr_get() is useful in scanning areas of screen when we are not sure what attribute each character is associated with
- Edition path: `docs/client-library/attributes/attribute-functions.md`
- Errata now: attr_get() reports the window's current attributes and color pair, for the next characters written; inch() reads characters already on the screen
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2107-2113", "man/curs_attr.3x:142", "man/curs_inch.3x"]
- Evidence (`quote`): HOWTO: useful in scanning areas of screen ... not sure what attribute each character is associated with. Man: Use wattr_get to retrieve attributes for the given window. Per-cell attributes come from inch/winch, not attr_get.

#### L123 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: Other functions wchgat(), mvchgat(), wchgat() behave similarly
- Edition path: `docs/client-library/attributes/chgat.md`
- Errata now: wchgat(), mvchgat() and mvwchgat()
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2163-2168", "man/curs_attr.3x:64-67", "man/curs_attr.3x:97-102"]
- Evidence (`quote`): HOWTO: Other functions wchgat(), mvchgat(), wchgat() behave similarly. Man lists chgat, wchgat, mvchgat, mvwchgat — the HOWTO repeats wchgat and omits mvwchgat.

#### L124 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: /* pager functionality by Joseph Spainhour" <spainhou@bellsouth.net> */
- Edition path: `docs/client-library/attributes/attributes.md`
- Errata now: The stray double quote after the name is removed
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1957"]
- Evidence (`quote`): /* pager functionality by Joseph Spainhour" <spainhou@bellsouth.net> */ — stray double-quote after Spainhour.

#### L125 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: screeen; are we are at; cut bold on; Forth parameter; Viola !!!; loose track; the the source; Don't worry about all those initialization and other crap
- Edition path: `docs/client-library/attributes/`
- Errata now: screen; are we at; turn bold on; Fourth parameter; Voila !!!; lose track; the source; Don't worry about all that initialization
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:1979", "doc/html/NCURSES-Programming-HOWTO.html:1984", "doc/html/NCURSES-Programming-HOWTO.html:1994", "doc/html/NCURSES-Programming-HOWTO.html:2013", "doc/html/NCURSES-Programming-HOWTO.html:2091", "doc/html/NCURSES-Programming-HOWTO.html:2192", "doc/html/NCURSES-Programming-HOWTO.html:2631", "doc/html/NCURSES-Programming-HOWTO.html:2660"]
- Evidence (`quote`): boundaries of the screeen; are we are at the end; cut bold on; Don't worry about all those initialization and other crap; loose track; Forth parameter; Viola !!!; the the source code of "dialog".

#### L129 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: mvprintw(24, 0, "Character pressed is ..."); mvprintw(23, 0, "You chose choice ...")
- Edition path: `docs/client-library/keyboard/key-usage-example.md`
- Errata now: mvprintw(LINES - 1, 0, ...); mvprintw(LINES - 2, 0, ...)
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2839-2840", "doc/html/NCURSES-Programming-HOWTO.html:2867-2878"]
- Evidence (`quote`): starty = (24 - HEIGHT) / 2; ... mvprintw(24, 0, "Character pressed is = %3d ..."); ... mvprintw(23, 0, "You chose choice %d ..."). On a 24-row screen valid rows are 0..23, so row 24 is off-screen.

#### L130 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: startx = (80 - WIDTH) / 2; starty = (24 - HEIGHT) / 2;
- Edition path: `docs/client-library/keyboard/key-usage-example.md`
- Errata now: startx = (COLS - WIDTH) / 2; starty = (LINES - HEIGHT) / 2;
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2839-2842", "doc/html/NCURSES-Programming-HOWTO.html:1744-1746", "man/curs_getyx.3x"]
- Evidence (`quote`): Example hard-codes 80 and 24 instead of COLS/LINES. The same HOWTO earlier teaches getmaxyx() for the real screen size.

#### L131 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: the Functions keys; See the initialization section; if(ch == KEY_LEFT); User did a choice come out of the infinite loop
- Edition path: `docs/client-library/keyboard/`
- Errata now: the function keys; a link to Initialization; if (ch == KEY_LEFT); User made a choice; leave the loop
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2742", "doc/html/NCURSES-Programming-HOWTO.html:2769", "doc/html/NCURSES-Programming-HOWTO.html:2874-2875"]
- Evidence (`quote`): be enabled to get the Functions keys, arrow keys, etc. See the initialization section ... if(ch == KEY_LEFT) ... User did a choice come out of the infinite loop

#### L135 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: The default is one fifth of a second
- Edition path: `docs/client-library/mouse/mouse-events.md`
- Errata now: The default is one sixth of a second
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:3134-3138", "man/curs_mouse.3x:436-438", "ncurses/curses.priv.h:184"]
- Evidence (`quote`): HOWTO: The default is one fifth of a second. Man: The mouse interval is set to one sixth of a second when the corresponding screen is initialized. curses.priv.h: #define DEFAULT_MAXCLICK 166.

#### L137 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: report_choice(event.x + 1, event.y + 1, ...); j = starty + 3; mouse_x <= i + strlen(...)
- Edition path: `docs/client-library/mouse/mouse-menu-example.md`
- Errata now: report_choice(event.x, event.y, ...); j = starty + 2; mouse_x < i + len
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:3029-3064", "doc/html/NCURSES-Programming-HOWTO.html:3103-3104", "man/curs_mouse.3x"]
- Evidence (`quote`): print_menu places the first item at window-relative y=2 (screen y starty+2), but report_choice sets j = starty + 3. Caller passes event.x + 1, event.y + 1. Hit test uses mouse_x <= i + strlen(choices[choice]).

#### L138 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: startx = (80 - WIDTH) / 2; starty = (24 - HEIGHT) / 2; mvprintw(23, 1, ...); mvprintw(22, 1, ...)
- Edition path: `docs/client-library/mouse/mouse-menu-example.md`
- Errata now: COLS and LINES; LINES - 1 and LINES - 2
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:3082-3109"]
- Evidence (`quote`): Mouse menu example hard-codes 80x24 centering and writes status with mvprintw(23, 1, ...) and mvprintw(22, 1, ...), same fixed-geometry pattern as the key example.

#### L139 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: The event mask table stops at BUTTON4_TRIPLE_CLICKED
- Edition path: `docs/client-library/mouse/mouse-events.md`
- Errata now: The table includes buttons 5 and notes NCURSES_MOUSE_VERSION
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2919-2945", "man/curs_mouse.3x:211-221", "include/curses.tail:42-58"]
- Evidence (`quote`): HOWTO table ends at BUTTON4_TRIPLE_CLICKED then modifier bits. Man and curses.tail also define BUTTON5_* (and further buttons when NCURSES_MOUSE_VERSION allows).

#### L140 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: lets do the same thing from mouse; any thing; a class of mouse events have been enabled; Do some thing; thousands of a second; convert to mouse co-ordinates to screen relative
- Edition path: `docs/client-library/mouse/`
- Errata now: let's do the same thing with the mouse; anything; has been enabled; Do something; thousandths of a second; convert between window-relative and screen-relative coordinates
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2894-2895", "doc/html/NCURSES-Programming-HOWTO.html:2904-2905", "doc/html/NCURSES-Programming-HOWTO.html:2954-2966", "doc/html/NCURSES-Programming-HOWTO.html:3130-3136"]
- Evidence (`quote`): lets do the same thing from mouse. Before you do any thing else ... Once a class of mouse events have been enabled ... Do some thing with the event ... thousands of a second ... convert to mouse co-ordinates to screen relative co-ordinates.

#### L146 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: getbegyx() and getmaxyx() store the window's beginning and maximum co-ordinates
- Edition path: `docs/client-library/screen/coordinates.md`
- Errata now: getmaxyx() stores the size: the number of lines and columns, one more than the largest coordinate
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:3178-3180", "man/curs_getyx.3x:71-87"]
- Evidence (`quote`): HOWTO: getbegyx() and getmaxyx() store current window's beginning and maximum co-ordinates. Man: getmaxyx stores maximum valid line and column dimensions ... Those are one more than the corresponding maximum positions. getbegyx stores the origin relative to the screen.

#### L155 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: The values returned can be 1 (all is well), 0 (no such terminal), or -1 (some problem locating the terminfo database)
- Edition path: `docs/client-library/init-and-debugging/terminal-descriptions.md`
- Errata now: With OK the status is 1; with ERR, 1 means a hard-copy terminal, 0 a type not found or generic, and -1 no terminfo database
- Evidence (`opened`): doc/html/ncurses-intro.html:1064-1068; man/curs_terminfo.3x:244-300
- Evidence (`quote`): Intro assigns errret 1/0/-1 as all-is-well / no such terminal / database problem. Man: OK with errret 1 is normal; on ERR, 1 means hard-copy terminal, 0 not found/generic, -1 database not found.

#### L160 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: endwin() should called once
- Edition path: `docs/client-library/init-and-debugging/initialization-and-wrapup.md`
- Errata now: Call endwin() once
- Evidence (`opened`): doc/html/ncurses-intro.html:992-993; man/curs_initscr.3x:186-195
- Evidence (`quote`): Intro: "endwin() should called once at wrapup time for each terminal". Man: "must also call endwin for each terminal being used". The truncated "once" omits per-terminal; grammar is "should called".

#### L161 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: It is only available only if
- Edition path: `docs/client-library/init-and-debugging/debugging.md`
- Errata now: (sentence rewritten)
- Evidence (`opened`): ["doc/html/ncurses-intro.html:1118-1120", "man/curs_trace.3x:102-104"]
- Evidence (`quote`): Intro: "It is only available only if you link with -lncurses_g." Man: "normally available only with the debugging library e.g., libncurses_g.a."

#### L164 — `majority` votes `['disagrees', 'matches', 'disagrees']`
- Printed: When ncurses returns that code, it calls resizeterm
- Edition path: `docs/client-library/hints/resizing.md`
- Errata now: ncurses calls resizeterm() with the new size at the next wgetch() or refresh, and wgetch() then returns KEY_RESIZE
- Evidence (`opened`): doc/html/ncurses-intro.html:1232-1236; man/resizeterm.3x:147-163; ncurses/base/resizeterm.c:528-529; ncurses/base/lib_getch.c:584-588
- Evidence (`quote`): Man/code: library calls resizeterm, which ungetch's KEY_RESIZE; wgetch then returns KEY_RESIZE. resizeterm runs before the code is returned, not because of returning it.

#### L167 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: The refresh will pick up the new screen size from the xterm's environment
- Edition path: `docs/client-library/hints/resizing.md`
- Errata now: The refresh() picks up the new screen size from the terminal
- Evidence (`opened`): doc/html/ncurses-intro.html:1216-1221; man/resizeterm.3x:174-180; ncurses/tinfo/lib_setup.c:571-577
- Evidence (`quote`): Size comes from the OS (ioctl) and optional LINES/COLUMNS; environment overrides when set. Not specifically "from the xterm's environment" as the normal path.

#### L168 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: Note that you will also have to call def_shell_mode and def_prog_mode on each tty yourself
- Edition path: `docs/client-library/hints/terminals.md`
- Errata now: newterm() saves each terminal's shell and program modes, as initscr() does, and each terminal has its own saved modes
- Evidence (`opened`): doc/html/ncurses-intro.html:1254-1257; man/curs_kernel.3x:87-94; ncurses/base/lib_set_term.c:618-624
- Evidence (`quote`): Man: def_*_mode "is done automatically by initscr"; one save area per newterm screen. lib_set_term.c calls def_shell_mode and def_prog_mode during screen setup.

#### L194 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: Thomas E. Dickey has maintained ncurses since 1.9.9e
- Edition path: `site/src/content/docs/index.mdx`
- Errata now: Has recorded every change since 1.9.9e, and maintained ncurses from 1.9.9g through 4.1 and again from 5.0
- Evidence (`opened`): README:159-166; NEWS:35-36; ANNOUNCE:653-658; doc/html/ncurses-intro.html:47-49
- Evidence (`quote`): README: maintainer for 1.9.9g through 4.1, resuming with FSF 5.0 (gap at 4.2). NEWS: changes since 1.9.9e recorded by Dickey. Not continuously "since 1.9.9e".

#### L196 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: Thomas E. Dickey, maintainer since ncurses 1.9.9e
- Edition path: `site/src/content/docs/credits.md`
- Errata now: Maintainer from ncurses 1.9.9g through 4.1 and again from 5.0; NEWS records every change since 1.9.9e in his hand
- Evidence (`opened`): README:159-168; NEWS:35-36; ANNOUNCE:653-658
- Evidence (`quote`): Same as L194: README says maintainer from 1.9.9g with a later FSF gap; not simply since 1.9.9e.

#### L198 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: The third objective (standards conformance)
- Edition path: `docs/contributor/hackguide/objective.md`
- Errata now: The second objective
- Evidence (`opened`): doc/html/hackguide.html:121-143,162-165
- Evidence (`quote`): Listed objectives: (1) historical source compatibility, (2) XSI/standards conformance, (3) high-quality, (4) featureful. Standards conformance is the second objective, not the third.

#### L201 — `majority` votes `['superseded', 'disagrees', 'disagrees']`
- Printed: Test frames for the library algorithms are in the progs directory
- Edition path: `docs/contributor/hackguide/reporting-bugs.md`
- Errata now: They are in ncurses/, built with `make test_progs`; the mvcur tester is `lib_mvcur`
- Evidence (`opened`): ["doc/html/hackguide.html:372-376", "progs/", "ncurses/Makefile.in:205-213", "ncurses/Makefile.in:375-381"]
- Evidence (`quote`): hackguide places tiny test frames in progs. Current progs/ holds tic/infocmp/tput/etc.; hashmap and lib_mvcur test productions are under ncurses/Makefile.in.

#### L206 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: See `include/curses.h.in` for mask values
- Edition path: `docs/contributor/hackguide/engine-room.md`
- Errata now: See `include/curses.tail`
- Evidence (`opened`): ["doc/html/hackguide.html:619-624", "include/curses.h.in (full file; no OPTIMIZE_* / _nc_optimize_enable)", "include/curses.tail:228-234", "include/Makefile.in:119-125"]
- Evidence (`quote`): hackguide.html: 'See the file include/curses.h.in for mask values, near the end.' curses.h.in has no _nc_optimize_enable / OPTIMIZE_* masks. curses.tail:229-234 defines _nc_optimize_enable and OPTIMIZE_MVCUR/HASHMAP/SCROLL/ALL; Makefile.in appends curses.tail after curses.h.in when building curses.h.

#### L207 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: The `lib_mouse()` code
- Edition path: `docs/contributor/hackguide/engine-room.md`
- Errata now: The code in `lib_mouse.c`
- Evidence (`opened`): ["doc/html/hackguide.html:545-548", "ncurses/base/lib_mouse.c:37-50"]
- Evidence (`quote`): hackguide.html: 'The lib_mouse() code is logically split into a lower level...' lib_mouse.c is a module file (header comment: 'This module is intended to encapsulate ncurses's interface to pointing devices') with the same split described; there is no function named lib_mouse().

#### L209 — `majority` votes `['missing', 'disagrees', 'disagrees']`
- Printed: `ncurses/dump_entry.c`
- Edition path: `docs/contributor/hackguide/terminfo-compiler.md`
- Errata now: `progs/dump_entry.c`
- Evidence (`opened`): ["doc/html/hackguide.html:749-750", "progs/dump_entry.c:1-20", "MANIFEST:1081"]
- Evidence (`quote`): hackguide: dump_entry() in ncurses/dump_entry.c. / file is progs/dump_entry.c (MANIFEST ./progs/dump_entry.c); no ncurses/dump_entry.c.

#### L210 — `majority` votes `['missing', 'disagrees', 'disagrees']`
- Printed: `ncurses/MKlib_gen.sh`
- Edition path: `docs/contributor/hackguide/style-tips.md`
- Errata now: `ncurses/base/MKlib_gen.sh`
- Evidence (`opened`): ["doc/html/hackguide.html:791-792", "ncurses/base/MKlib_gen.sh:1-20", "MANIFEST:796"]
- Evidence (`quote`): hackguide: read ncurses/MKlib_gen.sh first. / actual path ncurses/base/MKlib_gen.sh (MANIFEST ./ncurses/base/MKlib_gen.sh).

#### L211 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: The fifth field (flags) of `include/Caps`
- Edition path: `docs/contributor/hackguide/style-tips.md`
- Errata now: The seventh column
- Evidence (`opened`): ["doc/html/hackguide.html:805-808", "include/Caps:49-57"]
- Evidence (`quote`): hackguide.html: 'that is why the fifth field (flags) is there.' Caps header: Column 5 is 'KEY_xxx name, if any'; Column 7 is the Y/- emit/termcap-version flags field.

#### L212 — `majority` votes `['superseded', 'disagrees', 'disagrees']`
- Printed: `lib_getstr.c` is pure curses, but calls `outstr()`
- Edition path: `docs/contributor/hackguide/porting-hints.md`
- Errata now: Pure curses; it echoes through `waddch()` and `wechochar()`
- Evidence (`opened`): ["doc/html/hackguide.html:835-838", "ncurses/base/lib_getstr.c:51-70", "ncurses/base/lib_getstr.c:1-45"]
- Evidence (`quote`): hackguide: This module is pure curses, but calls outstr(): lib_getstr.c. / current WipeOut uses waddstr/waddch; no outstr symbol in ncurses/form/menu/panel/progs/include.

#### L223 — `majority` votes `["can't tell", 'disagrees', 'disagrees']`
- Printed: The configure script attempts to locate previous installation of ncurses, and will set the default prefix according to where it finds the ncurses headers
- Edition path: `docs/contributor/install/installation-procedure.md`
- Errata now: The configure script chooses the default prefix from the system type alone; it does not look for an earlier installation
- Evidence (`opened`): ["INSTALL:95-97", "aclocal.m4:960-1020"]
- Evidence (`quote`): INSTALL repeats that claim. / CF_CFG_DEFAULTS sets prefix from OS name (/usr vs $ac_default_prefix); header search only adjusts includedir and only under a dead prefix=NONE branch after prefix was already set.

#### L224 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: Typing 'configure' with no arguments is equivalent to: ./configure --with-normal --with-debug --enable-overwrite
- Edition path: `docs/contributor/install/installation-procedure.md`
- Errata now: ./configure --with-normal --with-debug, with overwrite on by default only when the prefix is /usr
- Evidence (`opened`): ["INSTALL:147-151", "configure.in:310-323", "configure.in:563-569"]
- Evidence (`quote`): INSTALL states that equivalence. / --with-normal/--with-debug default yes, but --enable-overwrite defaults yes only when prefix is /usr (else no).

#### L229 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: --with-weak-symbols
- Edition path: `docs/contributor/install/configure-options/with-m-z.md`
- Errata now: --enable-weak-symbols
- Evidence (`opened`): ["INSTALL:1389-1391", "INSTALL:836-841"]
- Evidence (`quote`): Under --with-versioned-syms, INSTALL:1389 says 'when using the --with-weak-symbols option'. The documented option is '--enable-weak-symbols' (INSTALL:836-841), not --with-weak-symbols.

#### L232 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: FreeBSD, NetBSD, OpenBSD, Cygwin, MinGW
- Edition path: `docs/contributor/install/system-integrators.md`
- Errata now: Linux, GNU/kFreeBSD and other k*bsd*-gnu systems, FreeBSD, OpenBSD, MirBSD, Cygwin, MSYS and MinGW; NetBSD gets /usr/local
- Evidence (`opened`): ["INSTALL:2300-2310", "aclocal.m4:979-988"]
- Evidence (`quote`): INSTALL special cases: FreeBSD, NetBSD, OpenBSD, Cygwin, MinGW. / CF_CFG_DEFAULTS /usr prefix case: openbsd*|freebsd*|mirbsd*|linux*|cygwin*|msys*|k*bsd*-gnu|mingw* — NetBSD not included.

#### L233 — `majority` votes `['missing', 'disagrees', 'disagrees']`
- Printed: listed in the misc/terminfo file
- Edition path: `docs/contributor/install/system-integrators.md`
- Errata now: listed in the misc/terminfo.src file
- Evidence (`opened`): ["INSTALL:2356-2359", "misc/terminfo.src:1-10"]
- Evidence (`quote`): INSTALL: terminfo maintainer (listed in the misc/terminfo file). / master file is misc/terminfo.src; there is no misc/terminfo.

#### L235 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: $HOME/terminfo (twice)
- Edition path: `docs/contributor/install/bsd-conversion.md`
- Errata now: $HOME/.terminfo
- Evidence (`opened`): ["INSTALL:2482-2510", "include/tic.h:127", "ncurses/tinfo/home_terminfo.c:35-60"]
- Evidence (`quote`): INSTALL BSD notes earlier correctly say $HOME/.terminfo, then twice write $HOME/terminfo without the dot. / PRIVATE_INFO is "%s/.terminfo".

#### L243 — `majority` votes `["can't tell", 'disagrees', 'disagrees']`
- Printed: assuming environment variable MINGW_ROOT holds the root directory name of your MinGW build
- Edition path: `docs/contributor/install/mingw.md`
- Errata now: with the MinGW root installed at /mingw64
- Evidence (`opened`): ["README.MinGW:100-136"]
- Evidence (`quote`): README.MinGW: assuming environment variable MINGW_ROOT holds the root directory name of your MinGW build: then ./configure --prefix=/mingw64 ... / the example never expands $MINGW_ROOT.

#### L248 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: Just make the boolean member bold of the record true.
- Edition path: `docs/contributor/ada/index.md`
- Errata now: Set the Bold_Character member of a Character_Attribute_Set record to true
- Evidence (`opened`): ["doc/html/Ada95.html:79-81", "Ada95/gen/terminal_interface-curses.ads.m4:427", "doc/html/ada/terminal_interface-curses__ads.htm:442"]
- Evidence (`quote`): Ada95.html: 'Just make the boolean member bold of the record true.' The generated Attribute_Set member is Bold_Character, not bold.

#### L250 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: The (n)curses documentation says, that the String arrays to be passed to an TYPE_ENUM fieldtype must not be automatic variables.
- Edition path: `docs/contributor/ada/implementation-details.md`
- Errata now: ncurses also copies the list for TYPE_ENUM, so a C list may live in automatic variables too
- Evidence (`opened`): ["doc/html/Ada95.html:310-313", "man/form_field_validation.3x:106-120"]
- Evidence (`quote`): Ada95.html: 'The (n)curses documentation says, that the String arrays to be passed to an TYPE_ENUM fieldtype must not be automatic variables.' form_field_validation.3x: 'The library copies the string list, so you may use a list that lives in automatic variables on the stack.'

#### L257 — `majority` votes `["can't tell", 'disagrees', 'disagrees']`
- Printed: https://invisible-island.net/ncurses/man/tput.1m.html
- Edition path: `docs/contributor/announce/program-improvements.md`
- Errata now: https://invisible-island.net/ncurses/man/tput.1.html
- Evidence (`opened`): ["announce.html.in:540-545", "man/tput.1:1-20", "doc/html/man/tput.1.html:1-20", "man/tic.1m"]
- Evidence (`quote`): announce uses @HOMEPAGE@/man/tput.1m.html for tput. / shipped manual is man/tput.1 and doc/html/man/tput.1.html (section 1); tic/infocmp use .1m, but tput does not.

#### L260 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: modify MKlib_gen.c to allow for Solaris's definition of NULL as 0L
- Edition path: `docs/contributor/announce/portability.md`
- Errata now: modify MKlib_gen.sh ...
- Evidence (`opened`): ["announce.html.in:1188-1189", "NEWS:804", "ncurses/base/MKlib_gen.sh:191-194", "find for MKlib_gen.c (absent)", "ncurses/Makefile.in:257-258"]
- Evidence (`quote`): announce.html.in and NEWS say 'modify MKlib_gen.c ... NULL as 0L'. There is no MKlib_gen.c; ncurses/base/MKlib_gen.sh contains the 0L→NULL sed fixes and generates lib_gen.c.

#### L264 — `majority` votes `['matches', 'disagrees', 'disagrees']`
- Printed: to revert to the original mode, type this: printf '\033[0;37;40m\n'
- Edition path: `docs/client-library/getting-started/introduction.md`
- Errata now: printf '\033[0m\n'
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:723-729", "misc/terminfo.src:1650", "misc/terminfo.src:10085-10086"]
- Evidence (`quote`): HOWTO: "to revert back to the original mode type this." then `echo "^[[0;37;40m"`, then "They might even be different for different terminals." terminfo.src uses op/sgr0=`\E[0;37;40m` only for some entries, not universally.

#### L274 — `majority` votes `['disagrees', 'matches', 'disagrees']`
- Printed: Fifth is the color index. It is the index given during init_pair()
- Edition path: `docs/client-library/attributes/chgat.md`
- Errata now: Fifth is the color pair number, the one given to init_pair()
- Evidence (`opened`): ["doc/html/NCURSES-Programming-HOWTO.html:2187-2195", "man/curs_attr.3x:240-242", "man/curs_color.3x:197-199"]
- Evidence (`quote`): HOWTO chgat comment calls the fifth argument 'the color index'. man/curs_attr.3x: 'the color pair argument is a color pair index (as in the first argument of init_pair)'. Color index in curs_color is a palette color (COLOR_*), not the pair number.

#### L277 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: Note that new_field() does not copy the pointer array into private storage
- Edition path: `docs/client-library/forms/fields.md`
- Errata now: Note that new_form() does not copy the pointer array
- Evidence (`opened`): ["doc/html/ncurses-intro.html:1957-1968", "man/form_new.3x:40-46", "form/frm_def.c:167"]
- Evidence (`quote`): Intro attributes the non-copying of the FIELD** array to new_field(), but the preceding API is new_form(FIELD **fields). new_form stores form->field = fields without copying; new_field() does not take a pointer array.

#### L280 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: The growth limit can be changed whether or not the O_STATIC bit is on, but has no effect until it is.
- Edition path: `docs/client-library/forms/field-options.md`
- Errata now: ... but has no effect until that bit is turned off.
- Evidence (`opened`): ["doc/html/ncurses-intro.html:2257-2258", "form/fld_max.c:66-78", "man/form_field_opts.3x:97-99"]
- Evidence (`quote`): Intro repeats the claim. set_max_field stores maxgrow always, but sets _MAY_GROW only when O_STATIC is off. O_STATIC on means fixed buffers; growth applies when O_STATIC is off. As written, 'until it is' (on) is the wrong polarity.

#### L281 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: A REQ_MOVE_RIGHT from A will go to B
- Edition path: `docs/client-library/forms/form-driver.md`
- Errata now: A REQ_RIGHT_FIELD from A will go to B
- Evidence (`opened`): ["doc/html/ncurses-intro.html:2743-2747", "form/frm_def.c:80-95"]
- Evidence (`quote`): Intro: 'A REQ_MOVE_RIGHT from A will go to B only if A, B, and C all share the same first line; otherwise it will skip over B to C.' Field ordering uses frow/fcol. The absolute claim omits the required condition.

#### L282 — `majority` votes `['disagrees', 'disagrees', 'matches']`
- Printed: the position of a form for purposes of these requests is its upper-left corner
- Edition path: `docs/client-library/forms/form-driver.md`
- Errata now: the position of a field for purposes of these requests
- Evidence (`opened`): ["doc/html/ncurses-intro.html:2737-2741", "form/frm_def.c:80-95"]
- Evidence (`quote`): Intro says the position of a form is its upper-left corner for visual field moves. Insert_Field_By_Position compares each field's frow/fcol — field corners, not a form object position.

#### L283 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: REQ_DEL_PREV: Delete previous word at cursor.
- Edition path: `docs/client-library/forms/form-driver.md`
- Errata now: REQ_DEL_PREV: Delete character before the cursor.
- Evidence (`opened`): ["doc/html/ncurses-intro.html:2948-2951", "man/form_driver.3x:86", "form/form.h:282", "form/frm_driver.c:2803-2804"]
- Evidence (`quote`): Intro lists REQ_DEL_PREV as 'Delete previous word at cursor.' man/form_driver.3x: 'Delete character before the cursor.' form.h: 'delete char before cursor.' FE_Delete_Previous deletes the previous character; REQ_DEL_WORD deletes a word.

#### L284 — `unanimous` votes `['disagrees', 'disagrees', 'disagrees']`
- Printed: When the current page is changed by set_current_field() call; When the current field is changed by a set_form_page() call
- Edition path: `docs/client-library/forms/hooks-and-form-options.md`
- Errata now: set_current_field() changes the current field; set_form_page() changes the current page
- Evidence (`opened`): ["doc/html/ncurses-intro.html:3120-3124", "man/form_page.3x:50-59"]
- Evidence (`quote`): Intro swaps the APIs: set_current_field sets the current field; set_form_page sets the form's page. The printed pairing of page↔set_current_field and field↔set_form_page is reversed.

#### L294 — `majority` votes `['disagrees', 'matches', 'disagrees']`
- Printed: parse an entire terminfo file into a doubly-linked circular list of entry structures
- Edition path: `docs/contributor/hackguide/terminfo-compiler.md`
- Errata now: doubly-linked list
- Evidence (`opened`): ["doc/html/hackguide.html:704-707", "ncurses/tinfo/comp_parse.c:58-76", "ncurses/tinfo/entries.c:55-62", "include/term_entry.h:123-133"]
- Evidence (`quote`): Hackguide says doubly-linked circular list. ENTRY has next/last (doubly linked), but enqueue sets tail->next = NULL and the entries.c diagram shows NULL ends — a linear list, not circular.

---

## 6. Misalignments vs `errata.csv` — review queue

**97** claims where Bo3 majority ≠ mapped expectation from errata.

### 6.1 Counts by Bo3 majority among mismatches

- Bo3 `matches`: 69
- Bo3 `can't tell`: 16
- Bo3 `superseded`: 8
- Bo3 `disagrees`: 3
- Bo3 `missing`: 1

### 6.2 Counts by errata category among mismatches

- `original-error`: 82
- `edition-error`: 12
- `rejected`: 3

### 6.3 Priority cluster: Bo3 `matches` but errata error-row `matches`

Meta says printed text is fine; errata says error confirmed. **Before reverting any fix**, re-open primary evidence yourself — checkers often verified that a symbol exists rather than that the surrounding prose is wrong.

**69** claims in this cluster. Full evidence for each:

## L2 (batch 1)

- **Claim as printed:** Post the form with `form_post()`
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/overview.md`
- **Original source:** NCURSES Programming HOWTO, Forms chapter
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Post the form with `form_post()`` / now=`Post the form using `post_form()``
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5528; form/form.h:429 / HOWTO: Post the form with form_post() and refresh the screen. form.h: extern FORM_EXPORT(int) post_form (FORM *);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5528", "form/form.h:429", "man/form_post.3x:40"]
- **Quote:** HOWTO: "Post the form with form_post() and refresh the screen." form.h: "extern FORM_EXPORT(int) post_form (FORM *);" form_post(3X): "int post_form(FORM *form);" — no form_post symbol.
- **Earlier:** From the HOWTO alone the name looks plausible next to form_driver; form.h shows the real symbol is post_form.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5528-5529", "form/form.h:429-430", "man/form_post.3x:32-41"]
- **Quote:** HOWTO: "Post the form with form_post()"; form.h/man export post_form()/unpost_form(), not form_post().
- **Earlier:** From the HOWTO wording alone I would already treat form_post() as a wrong name; form.h confirmed there is no such symbol.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5528-5529", "form/form.h:429", "form/frm_post.c:52", "man/form_post.3x:33-40", "doc/html/ncurses-intro.html:1860"]
- **Quote:** HOWTO: "Post the form with form_post() and refresh the screen." API/man/intro: post_form(FORM *), not form_post.
- **Earlier:** After HOWTO alone, same: printed name form_post() is wrong.


## L3 (batch 1)

- **Claim as printed:** Unpost the menu with `form_unpost()`
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/overview.md`
- **Original source:** NCURSES Programming HOWTO, Forms chapter
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Unpost the menu with `form_unpost()`` / now=`Unpost the form using `unpost_form()``
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5538; form/form.h:430 / HOWTO: Unpost the menu with form_unpost(). form.h: extern FORM_EXPORT(int) unpost_form (FORM *);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5538", "form/form.h:430", "man/form_post.3x:41"]
- **Quote:** HOWTO forms chapter: "Unpost the menu with form_unpost()". form.h: "extern FORM_EXPORT(int) unpost_form (FORM *);" — wrong verb prefix and it says menu in a forms step.
- **Earlier:** Reading only the HOWTO, it looks like a menu/forms slip of the pen; form.h shows form_unpost does not exist either.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5538", "form/form.h:429-430", "man/form_post.3x:32-41"]
- **Quote:** HOWTO: "Unpost the menu with form_unpost()"; API is unpost_form(), and this is a form chapter (not menu).
- **Earlier:** The printed form_unpost()/menu mix-up was already enough; headers only confirmed the real name.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5538", "form/form.h:430", "form/frm_post.c:102", "man/form_post.3x:34-41"]
- **Quote:** HOWTO: "Unpost the menu with form_unpost()". API: unpost_form(FORM *); also says menu for a form step.
- **Earlier:** HOWTO alone already shows both wrong API name and menu/form mix-up.


## L4 (batch 1)

- **Claim as printed:** Free the memory allocated to menu by `free_form()`
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/overview.md`
- **Original source:** NCURSES Programming HOWTO, Forms chapter
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Free the memory allocated to menu by `free_form()`` / now=`Free the form, using `free_form()``
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5542; doc/html/NCURSES-Programming-HOWTO.html:4325 / Line 5542: Free the memory allocated to menu by free_form(). Line 4325, in the Menus chapter: Free the memory allocated to menu by free_menu()
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5542", "doc/html/NCURSES-Programming-HOWTO.html:4325", "form/form.h:414"]
- **Quote:** Forms chapter: "Free the memory allocated to menu by free_form()". Menus chapter parallel: "Free the memory allocated to menu by free_menu()". free_form exists for FORM*, but the printed sentence wrongly says menu.
- **Earlier:** Without the menus parallel I would have treated only free_form as the issue; the copied "menu" wording explains the slip.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5542", "form/form.h:414", "man/form_new.3x:48-55"]
- **Quote:** HOWTO: "Free the memory allocated to menu by free_form()"; free_form() is the real form destructor, but the object is a form, not a menu.
- **Earlier:** Same verdict from the HOWTO sentence alone; free_form() existing does not make calling the form a menu correct.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5542", "form/form.h:414", "man/form_new.3x:34-41"]
- **Quote:** HOWTO: "Free the memory allocated to menu by free_form()". free_form is the real API; "menu" is wrong for a form.
- **Earlier:** Before headers, would still flag "menu" in a forms howto step.


## L5 (batch 1)

- **Claim as printed:** Successor and predecessor hooks set with `set_fieldtype_arg()`
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/custom-field-types.md` § order-functions-for-custom-types
- **Original source:** ncurses-intro.html, The Forms Library
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Successor and predecessor hooks set with `set_fieldtype_arg()`` / now=``set_fieldtype_choice()`, as declared in `form.h``
- **Errata checked / quote:** doc/html/ncurses-intro.html:3358; form/form.h:346-352; man/form_fieldtype.3x:127 / ncurses-intro: int set_fieldtype_arg(FIELDTYPE *type, INTHOOK succ, INTHOOK pred); form.h: set_fieldtype_arg takes make_arg, copy_arg, free_arg; set_fieldtype_choice takes next_choice, prev_choice. form_fieldtype(3X): The set_fieldtype_choice function allows forms programmers to define successor and
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3358-3360", "form/form.h:346-352", "man/form_fieldtype.3x:122-129"]
- **Quote:** Intro order-functions block: "int set_fieldtype_arg(FIELDTYPE *type, INTHOOK succ, INTHOOK pred);". form.h: set_fieldtype_arg takes make_arg/copy_arg/free_arg; set_fieldtype_choice takes next_choice/prev_choice. form_fieldtype(3X): "The set_fieldtype_choice function allows forms programmers to define successor and predecessor functions".
- **Earlier:** With only ncurses-intro, the second set_fieldtype_arg block looks deliberate; form.h shows those hooks belong to set_fieldtype_choice.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3349-3360", "form/form.h:346-352", "man/form_fieldtype.3x:59-67"]
- **Quote:** intro shows set_fieldtype_arg(... succ, pred) for order hooks; form.h/man define set_fieldtype_choice() for next/prev choice hooks, and set_fieldtype_arg() for make/copy/free arg hooks.
- **Earlier:** The intro prototype already looked wrong; headers confirmed the distinct set_fieldtype_choice API.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3346-3360", "form/form.h:346-350", "form/fld_ftchoice.c:40-51", "man/form_fieldtype.3x:122-129"]
- **Quote:** intro Order Functions block prototypes set_fieldtype_arg(... succ, pred). Man/API: set_fieldtype_choice sets successor/predecessor; set_fieldtype_arg is storage hooks.
- **Earlier:** intro alone shows the wrong name; headers only confirm the correct one.


## L6 (batch 1)

- **Claim as printed:** `new_fieldtype()` prototype without its closing semicolon
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/custom-field-types.md`
- **Original source:** ncurses-intro.html, The Forms Library
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``new_fieldtype()` prototype without its closing semicolon` / now=`Semicolon added`
- **Errata checked / quote:** doc/html/ncurses-intro.html:3260-3261 / FIELDTYPE *new_fieldtype(HOOK f_validate, /* field validator */ / HOOK c_validate) /* character validator */
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3260-3263", "form/form.h:339-341"]
- **Quote:** Intro code block: "FIELDTYPE *new_fieldtype(HOOK f_validate, /* field validator */ HOOK c_validate) /* character validator */" with no trailing ';', then "int free_fieldtype(FIELDTYPE *ftype);" which does have ';'.
- **Earlier:** In rendered HTML the trailing comment can hide the missing semicolon; the source line next to free_fieldtype makes the omission clear.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3260-3263"]
- **Quote:** FIELDTYPE *new_fieldtype(...) /* character validator */ with no trailing semicolon; free_fieldtype on the next line has one.
- **Earlier:** Same verdict; only this prototype block was needed.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3260-3263"]
- **Quote:** FIELDTYPE *new_fieldtype(HOOK f_validate, HOOK c_validate) /* character validator */ with no trailing semicolon; free_fieldtype line has one.
- **Earlier:** Same after the first open of that pre block.


## L7 (batch 1)

- **Claim as printed:** The library routines will that call them will return error indication
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/custom-field-types.md` § validation-function-arguments
- **Original source:** ncurses-intro.html, The Forms Library
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The library routines will that call them will return error indication` / now=`The library routines that call them will return an error indication`
- **Errata checked / quote:** doc/html/ncurses-intro.html:3342 / routines will that call them will return error indication when this happens
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3340-3344"]
- **Quote:** Intro: "The library routines will that call them will return error indication when this happens."
- **Earlier:** 

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3341-3344"]
- **Quote:** "The library routines will that call them will return error indication when this happens."
- **Earlier:** Same verdict from that sentence alone.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3340-3344"]
- **Quote:** "The library routines will that call them will return error indication when this happens."
- **Earlier:** Same; doubled will is on the page.


## L8 (batch 1)

- **Claim as printed:** should never see a NULL file pointer
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/custom-field-types.md` § validation-function-arguments
- **Original source:** ncurses-intro.html, The Forms Library
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`should never see a NULL file pointer` / now=`should never see a NULL pile pointer (the argument is the pile built by `make_str`)`
- **Errata checked / quote:** doc/html/ncurses-intro.html:3344; doc/html/ncurses-intro.html Validation Function Arguments; man/form_fieldtype.3x:115-120 / ncurses-intro: your validation functions should never see a NULL file pointer. Earlier in the same section: If no such arguments are defined for the field type, this pile pointer argument will be NULL
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (medium confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3286-3291", "doc/html/ncurses-intro.html:3340-3344", "man/form_fieldtype.3x:99-120"]
- **Quote:** Same intro paragraph: validation functions "should never see a NULL file pointer". Earlier in the section the second argument is a "pile" pointer from set_field_type; form_fieldtype(3X) describes an argument-block, not a FILE*.
- **Earlier:** Read alone, "file pointer" could be taken literally; the section never mentions files and the argument it describes is the pile pointer.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3340-3344", "man/form_fieldtype.3x:98-118"]
- **Quote:** intro: "your validation functions should never see a NULL file pointer"; surrounding text is about pile/argument-block pointers, not FILE*.
- **Earlier:** "file pointer" already looked wrong in context; the man page's argument-block wording sealed it.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3286-3291", "doc/html/ncurses-intro.html:3340-3344"]
- **Quote:** Earlier: second arg is a pile pointer. Then: "your validation functions should never see a NULL file pointer".
- **Earlier:** Without the pile paragraph, still an odd "file pointer" in a forms validator section.


## L9 (batch 1)

- **Claim as printed:** Example comment: This filed is like a password field
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/field-options.md`
- **Original source:** NCURSES Programming HOWTO, Field Options example
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Example comment: This filed is like a password field` / now=`This field is like a password field`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:6074 / field_opts_off(field[1], O_PUBLIC);         /* This filed is like a password field */
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:6074"]
- **Quote:** HOWTO: "field_opts_off(field[1], O_PUBLIC);         /* This filed is like a password field */"
- **Earlier:** 

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:6073-6074"]
- **Quote:** field_opts_off(field[1], O_PUBLIC); /* This filed is like a password field */
- **Earlier:** Same verdict; the typo is in the comment as printed.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:6074"]
- **Quote:** field_opts_off(field[1], O_PUBLIC);         /* This filed is like a password field */
- **Earlier:** Same; filed typo is literal.


## L11 (batch 1)

- **Claim as printed:** Backspace at the start of a field moved to the previous field but left the cursor at its start
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/fields.md` § try-it-make-backspace-and-delete-work
- **Original source:** This edition
- **Bo3 majority:** `matches` (majority) — votes: `can't tell | matches | matches` → {"can't tell": 1, 'matches': 2}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Backspace at the start of a field moved to the previous field but left the cursor at its start` / now=``REQ_END_LINE` after `REQ_DEL_PREV` when the field changes`
- **Errata checked / quote:** form/frm_driver.c:2586-2591 and 1563; the second runnable example in headless Chromium / frm_driver.c: if ((fct == FE_Delete_Previous) && ((unsigned)form->opts & O_BS_OVERLOAD) && First_Position_In_Current_Field(form)) res = Inter_Field_Navigation(FN_Previous_Field, form); and in _nc_Set_Current_Field: form->currow = form->curcol = form->toprow = form->begincol = 0;
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `can't tell` (low confidence)
- **Opened:** ["form/frm_driver.c:2587-2591", "form/frm_driver.c:1563", "man/form_opts.3x:76-77", "doc/html/NCURSES-Programming-HOWTO.html:7139-7142"]
- **Quote:** O_BS_OVERLOAD maps REQ_DEL_PREV at field start to previous-field navigation; _nc_Set_Current_Field sets currow/curcol to 0. HOWTO documents the overload. Whether this edition's runnable example wrongly left the cursor at the start is not settled without the edition example (not primary evidence).
- **Earlier:** From frm_driver.c alone the library behavior matches the report; that does not prove an edition example bug.

### Run 2

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["form/frm_driver.c:2587-2591", "form/frm_driver.c:1563-1564", "form/frm_driver.c:3669-3674"]
- **Quote:** With O_BS_OVERLOAD, FE_Delete_Previous at first position calls FN_Previous_Field; _nc_Set_Current_Field sets form->currow = form->curcol = 0.
- **Earlier:** Before reading _nc_Set_Current_Field I only knew BS-overload navigated fields, not that the cursor is forced to the start.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:3013-3014", "form/frm_driver.c:2587-2591", "form/frm_driver.c:1563", "form/frm_driver.c:3670-3674"]
- **Quote:** Intro: REQ_DEL_PREV at field start → REQ_PREV_FIELD. Driver: O_BS_OVERLOAD calls FN_Previous_Field; _nc_Set_Current_Field sets currow=curcol=0.
- **Earlier:** Intro alone would only prove previous-field navigation, not cursor-at-start.


## L20 (batch 1)

- **Claim as printed:** see `infocmp(1)` (line 579)
- **Appears in (corrected edition — not evidence):** `man/curs_getch.3x`
- **Original source:** man/curs_getch.3x
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`see `infocmp(1)` (line 579)` / now=``infocmp(1M)`; the pages declare section 1M, and the other 21 references to these programs use (1M)`
- **Errata checked / quote:** man/curs_getch.3x at the line given; man/infocmp.1m .TH; every reference to tic and infocmp in man/; man/man_db.renames.in; aclocal.m4 CF_MANPAGE_RENAMES / see infocmp(1) as written; the page itself: .TH @TIC@ 1M or .TH @INFOCMP@ 1M; 21 other references use (1M)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_getch.3x:579", "man/infocmp.1m:32", "doc/html/man/curs_getch.3x.html:361"]
- **Quote:** man/curs_getch.3x:579: "see infocmp(1M).". infocmp .TH is "1M". HTML man2html text shows "infocmp(1)". At the cited man line the source uses the correct (1M).
- **Earlier:** From the claim's (1) alone it looked like a wrong section; the man line itself has (1M).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_getch.3x:576-579", "doc/html/man/curs_getch.3x.html:361", "man/infocmp.1m:32"]
- **Quote:** man/curs_getch.3x:579 is see infocmp(1M); HTML man page prints infocmp(1) while linking infocmp.1m.html; .TH is 1M.
- **Earlier:** From the .3x source alone I would have said disagrees (it prints 1M); the HTML man page is what prints (1).

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/curs_getch.3x:579", "doc/html/man/curs_getch.3x.html:361", "man/infocmp.1m:32", "git show 4df78074c15a8e105baf215629b2b431fd899071^:man/curs_getch.3x:579"]
- **Quote:** HEAD man: "see \fB\%infocmp\fP(1M).". Parent of 4df78074: "(1)". Stale HTML still shows infocmp(1).
- **Earlier:** HTML-only would have said matches; man HEAD alone disagrees.


## L21 (batch 1)

- **Claim as printed:** `tic(1)` (line 207)
- **Appears in (corrected edition — not evidence):** `man/curs_trace.3x`
- **Original source:** man/curs_trace.3x
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``tic(1)` (line 207)` / now=``tic(1M)`; the pages declare section 1M, and the other 21 references to these programs use (1M)`
- **Errata checked / quote:** man/curs_trace.3x at the line given; man/tic.1m .TH; every reference to tic and infocmp in man/; man/man_db.renames.in; aclocal.m4 CF_MANPAGE_RENAMES / tic(1) as written; the page itself: .TH @TIC@ 1M or .TH @INFOCMP@ 1M; 21 other references use (1M)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_trace.3x:207", "man/tic.1m:31", "doc/html/man/curs_trace.3x.html:185"]
- **Quote:** man/curs_trace.3x:207: "tic(1M)". tic .TH is "1M". HTML shows "tic(1)". Cited man line is correct.
- **Earlier:** The claim's (1) looked wrong until the man line showed (1M).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_trace.3x:207", "doc/html/man/curs_trace.3x.html:185", "man/tic.1m:31"]
- **Quote:** man/curs_trace.3x:207 is tic(1M); HTML prints tic(1); tic page section is 1M.
- **Earlier:** Source-only would be disagrees; HTML supplies the printed (1).

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/curs_trace.3x:207", "doc/html/man/curs_trace.3x.html:185", "man/tic.1m:32", "git show 4df78074c15a8e105baf215629b2b431fd899071^:man/curs_trace.3x:207"]
- **Quote:** HEAD: "utilities such as \fBtic\fP(1M)". Pre-fix: tic(1). HTML still tic(1).
- **Earlier:** HTML-only matches; current man disagrees.


## L22 (batch 1)

- **Claim as printed:** `@TIC@(1)` (line 77)
- **Appears in (corrected edition — not evidence):** `man/curs_extend.3x`
- **Original source:** man/curs_extend.3x
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``@TIC@(1)` (line 77)` / now=``@TIC@(1M)`; the pages declare section 1M, and the other 21 references to these programs use (1M)`
- **Errata checked / quote:** man/curs_extend.3x at the line given; man/tic.1m .TH; every reference to tic and infocmp in man/; man/man_db.renames.in; aclocal.m4 CF_MANPAGE_RENAMES / @TIC@(1) as written; the page itself: .TH @TIC@ 1M or .TH @INFOCMP@ 1M; 21 other references use (1M)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_extend.3x:77", "man/tic.1m:31", "doc/html/man/curs_extend.3x.html:75"]
- **Quote:** man/curs_extend.3x:77: "@TIC@(1M)". HTML shows "tic(1)". Cited man line is correct.
- **Earlier:** Same as L21: claim text says (1); man source at the line has (1M).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_extend.3x:77", "doc/html/man/curs_extend.3x.html:75", "man/tic.1m:31"]
- **Quote:** man source: @TIC@(1M); HTML renders tic(1); utility section is 1M.
- **Earlier:** Source-only would be disagrees; HTML shows (1).

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/curs_extend.3x:77-78", "doc/html/man/curs_extend.3x.html:75", "git show 4df78074c15a8e105baf215629b2b431fd899071^:man/curs_extend.3x:77-78"]
- **Quote:** HEAD: "\fB\%@TIC@\fP(1M)'s". Pre-fix: (1). HTML: tic(1).
- **Earlier:** Same pattern as L20–L21.


## L23 (batch 1)

- **Claim as printed:** `@TIC@(1)` (line 669)
- **Appears in (corrected edition — not evidence):** `man/curs_inopts.3x`
- **Original source:** man/curs_inopts.3x
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``@TIC@(1)` (line 669)` / now=``@TIC@(1M)`; the pages declare section 1M, and the other 21 references to these programs use (1M)`
- **Errata checked / quote:** man/curs_inopts.3x at the line given; man/tic.1m .TH; every reference to tic and infocmp in man/; man/man_db.renames.in; aclocal.m4 CF_MANPAGE_RENAMES / @TIC@(1) as written; the page itself: .TH @TIC@ 1M or .TH @INFOCMP@ 1M; 21 other references use (1M)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_inopts.3x:669", "man/tic.1m:31", "doc/html/man/curs_inopts.3x.html:314"]
- **Quote:** man/curs_inopts.3x:669: "@TIC@(1M)". HTML shows "tic(1)". Cited man line is correct.
- **Earlier:** Claim text says (1); man source at the line has (1M).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_inopts.3x:669", "doc/html/man/curs_inopts.3x.html:314", "man/tic.1m:31"]
- **Quote:** man source: @TIC@(1M); HTML prints tic(1).
- **Earlier:** Source-only would be disagrees; HTML shows (1).

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/curs_inopts.3x:669", "doc/html/man/curs_inopts.3x.html:314", "git show 4df78074c15a8e105baf215629b2b431fd899071^:man/curs_inopts.3x:669"]
- **Quote:** HEAD: "option of \fB\%@TIC@\fP(1M),". Pre-fix: (1).
- **Earlier:** HTML-only would match.


## L24 (batch 1)

- **Claim as printed:** `@TIC@(1)` (line 63)
- **Appears in (corrected edition — not evidence):** `docs/man/term/02-description.5`
- **Original source:** man/term.5
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``@TIC@(1)` (line 63)` / now=``@TIC@(1M)`; the pages declare section 1M, and the other 21 references to these programs use (1M)`
- **Errata checked / quote:** man/term.5 at the line given; man/tic.1m .TH; every reference to tic and infocmp in man/; man/man_db.renames.in; aclocal.m4 CF_MANPAGE_RENAMES / @TIC@(1) as written; the page itself: .TH @TIC@ 1M or .TH @INFOCMP@ 1M; 21 other references use (1M)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/term.5:63", "man/tic.1m:31", "doc/html/man/term.5.html:53"]
- **Quote:** man/term.5:63: "@TIC@(1M) compiles a". HTML shows "tic(1)". Cited man line is correct.
- **Earlier:** Claim text says (1); man/term.5 at line 63 has (1M).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/term.5:63", "doc/html/man/term.5.html:53", "man/tic.1m:31"]
- **Quote:** man/term.5:63 is @TIC@(1M); HTML prints tic(1).
- **Earlier:** Source-only would be disagrees; HTML shows (1).

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/term.5:63", "doc/html/man/term.5.html:53", "git show 4df78074c15a8e105baf215629b2b431fd899071^:man/term.5:63"]
- **Quote:** HEAD: "\fB\%@TIC@\fP(1M) compiles". Pre-fix: (1). HTML: tic(1).
- **Earlier:** Same as other section-1 claims.


## L25 (batch 1)

- **Claim as printed:** `@TIC@(1)` and `@INFOCMP@(1)` (line 142)
- **Appears in (corrected edition — not evidence):** `man/term_variables.3x`
- **Original source:** man/term_variables.3x
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``@TIC@(1)` and `@INFOCMP@(1)` (line 142)` / now=``@TIC@(1M)` and `@INFOCMP@(1M)`; the pages declare section 1M, and the other 21 references to these programs use (1M)`
- **Errata checked / quote:** man/term_variables.3x at the line given; man/infocmp.1m .TH; every reference to tic and infocmp in man/; man/man_db.renames.in; aclocal.m4 CF_MANPAGE_RENAMES / @TIC@(1) and @INFOCMP@(1) as written; the page itself: .TH @TIC@ 1M or .TH @INFOCMP@ 1M; 21 other references use (1M)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/term_variables.3x:142", "man/tic.1m:31", "man/infocmp.1m:32", "doc/html/man/term_variables.3x.html:114"]
- **Quote:** man/term_variables.3x:142: "The @TIC@(1M) and @INFOCMP@(1M) programs use lookup tables". HTML shows tic(1) and infocmp(1). Cited man line is correct.
- **Earlier:** Claim text says (1); man source has (1M) for both.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/term_variables.3x:142", "doc/html/man/term_variables.3x.html:114", "man/tic.1m:31", "man/infocmp.1m:32"]
- **Quote:** man source: @TIC@(1M) and @INFOCMP@(1M); HTML prints tic(1) and infocmp(1).
- **Earlier:** Source-only would be disagrees; HTML shows both as (1).

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/term_variables.3x:142", "doc/html/man/term_variables.3x.html:114", "git show 4df78074c15a8e105baf215629b2b431fd899071^:man/term_variables.3x:142"]
- **Quote:** HEAD: "The \fB@TIC@\fP(1M) and \fB@INFOCMP@\fP(1M) programs". Pre-fix both (1). HTML both (1).
- **Earlier:** HTML-only matches.


## L26 (batch 1)

- **Claim as printed:** The background character's set of attributes becomes a property of the character cell and move with it (line 101)
- **Appears in (corrected edition — not evidence):** `man/curs_bkgd.3x`
- **Original source:** ncurses manual page curs_bkgd(3X)
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The background character's set of attributes becomes a property of the character cell and move with it (line 101)` / now=`… and moves with it`
- **Errata checked / quote:** man/curs_bkgd.3x:101-104 / The background character's set of attributes becomes a property of the character cell and move with it through any scrolling and insert/delete line/character operations.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_bkgd.3x:101-104"]
- **Quote:** man/curs_bkgd.3x:101-104: "The background character's set of attributes becomes a property of the character cell and moves with it through any scrolling and insert/delete line/character operations." Verb is "moves", agreeing with singular "set".
- **Earlier:** The claim's "move" looked like a subject-verb error; the file has "moves".

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_bkgd.3x:101-104", "doc/html/man/curs_bkgd.3x.html:84-85"]
- **Quote:** man source: "and moves with it"; HTML man page: "and move with it".
- **Earlier:** Against the .3x source alone (moves) I would have said disagrees; HTML prints the claimed subject-verb error.

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/curs_bkgd.3x:101-104", "doc/html/man/curs_bkgd.3x.html:83-85", "git show 63838d460de20b59dd42f425c0b079642ccdb1e3^:man/curs_bkgd.3x:101-104"]
- **Quote:** HEAD man: "and moves with it". Pre-63838d46: "and move with it". Stale HTML still "move with it".
- **Earlier:** HTML-only matches; HEAD man alone disagrees.


## L27 (batch 1)

- **Claim as printed:** The background character's set of attributes becomes a property of the character cell and move with it (line 92)
- **Appears in (corrected edition — not evidence):** `man/curs_bkgrnd.3x`
- **Original source:** ncurses manual page curs_bkgrnd(3X)
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | superseded` → {'matches': 2, 'superseded': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The background character's set of attributes becomes a property of the character cell and move with it (line 92)` / now=`… and moves with it`
- **Errata checked / quote:** man/curs_bkgrnd.3x:92-95 / The background character's set of attributes becomes a property of the character cell and move with it through any scrolling and insert/delete line/character operations.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_bkgrnd.3x:92-95"]
- **Quote:** man/curs_bkgrnd.3x:92-95: same paragraph with "moves with it", not "move".
- **Earlier:** Same as L26: claim says move; file says moves.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_bkgrnd.3x:92-95", "doc/html/man/curs_bkgrnd.3x.html:85"]
- **Quote:** man source: "and moves with it"; HTML man page: "and move with it".
- **Earlier:** Source-only would be disagrees; HTML prints move.

### Run 3

- **Verdict:** `superseded` (high confidence)
- **Opened:** ["man/curs_bkgrnd.3x:92-95", "doc/html/man/curs_bkgrnd.3x.html:83-85", "git show 63838d460de20b59dd42f425c0b079642ccdb1e3^:man/curs_bkgrnd.3x:92-95"]
- **Quote:** HEAD: "and moves with it". Pre-fix: "and move with it". HTML still move.
- **Earlier:** Same as L26.


## L41 (batch 1)

- **Claim as printed:** Post the menu with `menu_post()`; Unpost the menu with `menu_unpost()`
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/overview.md`
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Post the menu with `menu_post()`; Unpost the menu with `menu_unpost()`` / now=`Post the menu using `post_menu()`; Unpost the menu using `unpost_menu()``
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:4311 and 4321; menu/menu.h:239 and 263 / HOWTO: Post the menu with menu_post() and refresh the screen. / Unpost the menu with menu_unpost(). menu.h: extern MENU_EXPORT(int) post_menu(MENU *); extern MENU_EXPORT(int) unpost_menu(MENU *);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4311", "doc/html/NCURSES-Programming-HOWTO.html:4321", "menu/menu.h:239", "menu/menu.h:263", "man/menu_post.3x:40-41"]
- **Quote:** HOWTO: "Post the menu with menu_post()" / "Unpost the menu with menu_unpost()". menu.h: post_menu / unpost_menu. No menu_post or menu_unpost exports.
- **Earlier:** Without menu.h it reads like the forms-chapter slip; menu.h shows those names do not exist.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4311-4321", "menu/menu.h:239-263", "man/menu_post.3x:32-41"]
- **Quote:** HOWTO: menu_post()/menu_unpost(); API is post_menu()/unpost_menu().
- **Earlier:** HOWTO names alone looked wrong; menu.h confirmed the real symbols.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4311-4321", "doc/html/NCURSES-Programming-HOWTO.html:4406", "menu/menu.h:239", "menu/menu.h:263", "menu/m_post.c:277"]
- **Quote:** HOWTO steps: menu_post()/menu_unpost(); API: post_menu/unpost_menu in menu.h and m_post.c.
- **Earlier:** HOWTO steps alone match; examples only confirm the right names.


## L42 (batch 1)

- **Claim as printed:** The menu can then by posted
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/overview.md`
- **Original source:** Writing Programs with NCURSES, The Menu Library
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The menu can then by posted` / now=`The menu can then be posted`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1579 / The menu can then by <dfn>posted</dfn>, that is written to an associated window.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1579"]
- **Quote:** Intro: "The menu can then by <dfn>posted</dfn>, that is written to an associated window."
- **Earlier:** 

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1579"]
- **Quote:** "The menu can then by posted, that is written to an associated window."
- **Earlier:** Same verdict from that sentence alone.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1579"]
- **Quote:** "The menu can then by <dfn>posted</dfn>, that is written to an associated window."
- **Earlier:** Same after that paragraph.


## L43 (batch 1)

- **Claim as printed:** When you call `unpost_menu()`, you erase the subwindow, However, neither of these…
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/menu-windows.md`
- **Original source:** Writing Programs with NCURSES, The Menu Library
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`When you call `unpost_menu()`, you erase the subwindow, However, neither of these…` / now=`…you erase the subwindow. However, neither of these…`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1711 / erase the subwindow, However, neither of these actually modifies
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1709-1712"]
- **Quote:** Intro: "When you call unpost_menu(), you erase the subwindow, However, neither of these actually modifies the screen."
- **Earlier:** 

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1709-1713"]
- **Quote:** "When you call unpost_menu(), you erase the subwindow, However, neither of these actually modifies the screen."
- **Earlier:** Same verdict from the comma-However splice alone.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1709-1712"]
- **Quote:** "When you call <code>unpost_menu()</code>, you erase the subwindow, However, neither of these actually modifies the screen."
- **Earlier:** Same; comma-However is on the page.


## L44 (batch 1)

- **Claim as printed:** see the `menu_attribs(3x)` manual page. (no closing parenthesis)
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/menu-display.md`
- **Original source:** Writing Programs with NCURSES, The Menu Library
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`see the `menu_attribs(3x)` manual page. (no closing parenthesis)` / now=`see the `menu_attributes(3X)` manual page)`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1691; the file list of man/ / <code>menu_attribs(3x)</code> manual page.</p> — man/ has menu_attributes.3x and no menu_attribs.3x
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1689-1691", "man/menu_attributes.3x:31"]
- **Quote:** Intro: "…change (see the menu_attribs(3x) manual page." — opening '(' before see, no closing ')' before the period; man/ has menu_attributes.3x (.TH menu_attributes), not menu_attribs.
- **Earlier:** From the HTML alone the missing ')' is clear; checking man/ also shows the page name is menu_attributes, not menu_attribs.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1690-1691", "man/menu_attributes.3x:30-31"]
- **Quote:** intro: "(see the menu_attribs(3x) manual page." — missing ")"; real page is menu_attributes(3x).
- **Earlier:** The missing parenthesis was enough; the man page name mismatch was extra.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1687-1691"]
- **Quote:** "which the library allows you to change (see the <code>menu_attribs(3x)</code> manual page." — opening "(" never closed before the period.
- **Earlier:** Same; missing outer ")" is visible in that sentence.


## L46 (batch 2)

- **Claim as printed:** menu_driver() accepts an ascii character (HOWTO); it accumulates printable ASCII characters (Writing Programs)
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/menu-driver.md` § pattern-matching
- **Original source:** NCURSES Programming HOWTO, Menus chapter; Writing Programs with NCURSES, The Menu Library
- **Bo3 majority:** `matches` (majority) — votes: `matches | disagrees | matches` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`menu_driver() accepts an ascii character (HOWTO); it accumulates printable ASCII characters (Writing Programs)` / now=`A printable character`
- **Errata checked / quote:** menu/m_driver.c:446; menu/mf_common.h:71; man/menu_driver.3x:55 and 114 / m_driver.c: if (!(c & ~((int)MAX_REGULAR_CHARACTER)) && isprint(UChar(c))) — MAX_REGULAR_CHARACTER is 0xff. menu_driver.3x: The input is a printable character.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4435-4440", "doc/html/NCURSES-Programming-HOWTO.html:4550-4555", "doc/html/ncurses-intro.html:1744-1750", "man/menu_driver.3x:55", "man/menu_driver.3x:114-118", "menu/m_driver.c:446"]
- **Quote:** HOWTO: value can be either a menu navigational request, an ascii character, or a KEY_MOUSE... Whenever ascii characters are given to menu_driver, it puts in to the pattern buffer. / ncurses-intro: The menu_driver() logic tries to accumulate printable ASCII characters passed in in that buffer. / man: The input is a printable character; appends it to the pattern buffer. / m_driver.c: isprint(UChar(c))
- **Earlier:** matches — HOWTO alone already says ascii character for menu_driver

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4439-4440", "doc/html/ncurses-intro.html:1744-1750", "man/menu_driver.3x:55-57,114-116", "menu/m_driver.c:446-447"]
- **Quote:** HOWTO: "an ascii character"; ncurses-intro: "accumulate printable ASCII characters"; menu_driver(3X): "printable character… checked according to the program's locale settings"; m_driver.c uses isprint(UChar(c)), not an ASCII-only test.
- **Earlier:** After only the HOWTO/intro wording I would have treated "ASCII" as matching those docs; the man page and isprint() show the real rule is locale printable characters.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4436-4440", "doc/html/ncurses-intro.html:1744-1750", "man/menu_driver.3x:55-56", "man/menu_driver.3x:114-116", "menu/m_driver.c:446"]
- **Quote:** HOWTO: "the value can be either a menu navigational request, an ascii character, or a KEY_MOUSE..."; ncurses-intro: "menu_driver() logic tries to accumulate printable ASCII characters passed in in that buffer"; menu_driver(3X): "If the second argument is a printable character, the code appends it to the pattern buffer"; m_driver.c uses isprint on the character.
- **Earlier:** After only the HOWTO line I would have treated 'ascii character' as vague; the intro, man page, and m_driver.c confirm both phrasings describe the same printable pattern-buffer path.


## L48 (batch 2)

- **Claim as printed:** The Menu Basics listing frees only items 0 and 1 of five, and calls free_menu() on a menu that is still posted
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/compiling.md`
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The Menu Basics listing frees only items 0 and 1 of five, and calls free_menu() on a menu that is still posted` / now=`The listing unposts the menu, frees it, then frees every item`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:4420-4422; menu/m_new.c:131-132; menu/m_item_new.c:173-174 / HOWTO: free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu); m_new.c: if (menu->status & _POSTED) RETURN(E_POSTED); m_item_new.c: if (item->imenu) RETURN(E_CONNECTED);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4372-4422", "menu/m_new.c:115-132", "man/menu_new.3x:48-73"]
- **Quote:** choices[] has five entries; post_menu(my_menu) with no unpost_menu; free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu). / free_menu: E_POSTED if menu->status & _POSTED; man: free_menu returns E_POSTED when posted.
- **Earlier:** matches — the listing alone shows two free_item calls and no unpost before free_menu

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4372-4422", "menu/m_new.c:125-132", "man/menu_new.3x:73-74"]
- **Quote:** Five choices; cleanup is free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu); with no unpost_menu. free_menu returns E_POSTED if menu->status & _POSTED.
- **Earlier:** The listing alone already shows only items 0 and 1 freed while still posted; free_menu's E_POSTED confirms the second half.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4372-4423", "man/menu_new.3x:48-49", "man/menu_new.3x:73-74", "man/mitem_new.3x:77-78"]
- **Quote:** Example 18 builds five choices, post_menu(my_menu), then free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu); with no unpost_menu. free_menu(3X) returns E_POSTED if the menu is posted; free_item(3X) returns E_CONNECTED while an item is still connected.
- **Earlier:** Counting only the free_item calls would miss that free_menu runs while still posted; menu_new(3X) E_POSTED confirms that part of the claim.


## L49 (batch 2)

- **Claim as printed:** The Multi Valued Menus listing frees only items 0 and 1 of eight, and calls free_menu() on a menu that is still posted
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/selecting-items.md`
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The Multi Valued Menus listing frees only items 0 and 1 of eight, and calls free_menu() on a menu that is still posted` / now=`The listing unposts the menu, frees it, then frees every item`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5192-5194; menu/m_new.c:131-132; menu/m_item_new.c:173-174 / HOWTO: free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu); m_new.c: if (menu->status & _POSTED) RETURN(E_POSTED); m_item_new.c: if (item->imenu) RETURN(E_CONNECTED);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5110-5194", "menu/m_new.c:125-132"]
- **Quote:** choices[] has eight entries (Choice 1..7, Exit); post_menu then free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu) with no unpost_menu. / free_menu returns E_POSTED when still posted.
- **Earlier:** matches — listing alone shows only items 0 and 1 freed without unpost

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5112-5194", "menu/m_new.c:131-132"]
- **Quote:** Eight choices (Choice 1–7 and Exit); ends with free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu); after post_menu, no unpost_menu.
- **Earlier:** Same conclusion from the listing before opening free_menu.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5112-5194", "man/menu_new.3x:73-74"]
- **Quote:** Example 22 has eight choices, post_menu(my_menu), then free_item(my_items[0]); free_item(my_items[1]); free_menu(my_menu); and no unpost_menu.
- **Earlier:** Same pattern as Menu Basics; opening the Multi Valued listing alone already bears the claim out.


## L50 (batch 2)

- **Claim as printed:** The Menu Options listing frees the items before the menu
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/attributes.md`
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The Menu Options listing frees the items before the menu` / now=`The listing frees the menu, then the items`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5330-5333; menu/m_item_new.c:173-174; menu/m_new.c:134-135 / HOWTO: unpost_menu(my_menu); for (…) free_item(my_items[i]); free_menu(my_menu); m_item_new.c: if (item->imenu) RETURN(E_CONNECTED); m_new.c: if (menu->items) _nc_Disconnect_Items(menu);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5330-5333", "man/menu_new.3x:48-53"]
- **Quote:** unpost_menu(my_menu); for (...) free_item(my_items[i]); free_menu(my_menu). / man: free_menu disconnects menu from its item array then frees the menu.
- **Earlier:** matches — the free_item loop precedes free_menu in the listing

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5330-5333", "man/mitem_new.3x:77-78", "menu/m_item_new.c:159-174", "test/demo_menus.c:325-340"]
- **Quote:** HOWTO: unpost_menu; then free_item loop; then free_menu. free_item returns E_CONNECTED while an item is still connected; demo_menus frees free_menu before free_item.
- **Earlier:** The listing order alone matches the claim; E_CONNECTED shows why that order is wrong.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5330-5333", "man/menu_new.3x:48-49", "man/mitem_new.3x:77-78"]
- **Quote:** unpost_menu(my_menu); then for-loop free_item(my_items[i]); then free_menu(my_menu). free_menu disconnects the item array; free_item returns E_CONNECTED while items remain connected.
- **Earlier:** Seeing unpost_menu first I might have thought cleanup was fine; free_item-before-free_menu is still the wrong order per the man pages.


## L51 (batch 2)

- **Claim as printed:** The Menu User Pointer listing frees the items before the menu
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/user-pointer-and-hooks.md`
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The Menu User Pointer listing frees the items before the menu` / now=`The listing frees the menu, then the items`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5456-5459; menu/m_item_new.c:173-174; menu/m_new.c:134-135 / HOWTO: unpost_menu(my_menu); for (…) free_item(my_items[i]); free_menu(my_menu); m_item_new.c: if (item->imenu) RETURN(E_CONNECTED);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5456-5459", "man/menu_new.3x:48-53"]
- **Quote:** unpost_menu(my_menu); for (...) free_item(my_items[i]); free_menu(my_menu).
- **Earlier:** matches — free_item loop is before free_menu

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5456-5459", "man/mitem_new.3x:77-78"]
- **Quote:** unpost_menu(my_menu); for (…) free_item(my_items[i]); free_menu(my_menu);
- **Earlier:** Same from the listing without the free_item man page.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5456-5459", "man/menu_new.3x:48-49", "man/mitem_new.3x:77-78"]
- **Quote:** unpost_menu(my_menu); for-loop free_item(...); free_menu(my_menu); same connected-item hazard as L50.
- **Earlier:** Same conclusion from the listing alone; man pages only confirm why the order is wrong.


## L52 (batch 2)

- **Claim as printed:** The Menu User Pointer listing stores the address of `MY_DATA data`, a variable local to the loop body, as each item's user pointer and calls through it after the loop
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/user-pointer-and-hooks.md` § the-user-pointer
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The Menu User Pointer listing stores the address of `MY_DATA data`, a variable local to the loop body, as each item's user pointer and calls through it after the loop` / now=``data` is static, so the pointer stays valid`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5415-5420; ISO C (C11 6.2.4p6): an automatic object's lifetime ends when its block ends / HOWTO: for (…) { MY_DATA data = {func}; … set_item_userptr(my_items[i], (void *) &data); } … data = item_userptr(cur); data->my_func(item_name(cur));
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5415-5450"]
- **Quote:** for (i = 0; i < n_choices; ++i) { MY_DATA data = {func}; ... set_item_userptr(my_items[i], (void *) &data); } then later data = item_userptr(cur); data->my_func(item_name(cur));
- **Earlier:** matches — the set_item_userptr of &data inside the for-body is enough

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5416-5450"]
- **Quote:** Inside the for-loop: MY_DATA data = {func}; set_item_userptr(my_items[i], (void *) &data); later after the loop: data = item_userptr(cur); data->my_func(...).
- **Earlier:** No earlier source; the listing alone settles it.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5416-5450", "man/mitem_new.3x:50-51"]
- **Quote:** Inside for (i = 0; i < n_choices; ++i) { MY_DATA data = {func}; ... set_item_userptr(my_items[i], (void *) &data); } later data = item_userptr(cur); data->my_func(...). mitem_new(3X) warns against names/descriptions on a routine's stack; the same lifetime bug applies to the user pointer.
- **Earlier:** The set_item_userptr line alone shows a pointer to loop-scoped storage; the Enter handler confirms the later call-through.


## L53 (batch 2)

- **Claim as printed:** The list of menu options ends at O_NONCYCLIC
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/menu-display.md` § menu-options
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (majority) — votes: `matches | disagrees | matches` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The list of menu options ends at O_NONCYCLIC` / now=`The list includes O_MOUSE_MENU`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:5075; menu/menu.h:72; menu/menu.priv.h:76-83; man/menu_opts.3x:90-95 / menu.h: #define O_MOUSE_MENU (0x40). menu.priv.h: ALL_MENU_OPTS includes O_MOUSE_MENU. menu_opts.3x: O_MOUSE_MENU If user clicks with the mouse and it does not fall on the currently active menu, push KEY_MOUSE …
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5058-5077", "man/menu_opts.3x:72-95", "menu/menu.h:66-72"]
- **Quote:** HOWTO list: O_ONEVALUE ... O_NONCYCLIC (last). / man and menu.h continue with O_MOUSE_MENU after O_NONCYCLIC.
- **Earlier:** matches — HOWTO's printed list already ends at O_NONCYCLIC

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5058-5077", "man/menu_opts.3x:72-95"]
- **Quote:** HOWTO option list ends with O_NONCYCLIC. menu_opts(3X) continues with O_MOUSE_MENU after O_NONCYCLIC.
- **Earlier:** From the HOWTO alone the printed list does end at O_NONCYCLIC; menu_opts(3X) shows that list is incomplete.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5058-5077", "man/menu_opts.3x:72-95"]
- **Quote:** HOWTO lists O_ONEVALUE through O_NONCYCLIC and stops. menu_opts(3X) continues with O_MOUSE_MENU after O_NONCYCLIC.
- **Earlier:** HOWTO alone shows the list ending at O_NONCYCLIC; the man page shows that ending omits a real option.


## L54 (batch 2)

- **Claim as printed:** The mouse requests are quoted from an older menu_driver(3X), with its line breaks and soft hyphens (decora­tion), and without the double-click on an item
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/menu-driver.md` § mouse-requests
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The mouse requests are quoted from an older menu_driver(3X), with its line breaks and soft hyphens (decora­tion), and without the double-click on an item` / now=`The current behavior, from menu_driver(3X), as a list, including the double-click and E_REQUEST_DENIED`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:4576-4588; man/menu_driver.3x:123-161 / menu_driver.3x: If you double-click an item a REQ_TOGGLE_ITEM is generated and E_UNKNOWN_COMMAND is returned. … If you clicked outside the user window … an E_REQUEST_DENIED is returned.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4575-4589", "man/menu_driver.3x:122-154"]
- **Quote:** HOWTO quote ends: if you click at an item inside the display area of the menu, the menu cursor is positioned to that item. Contains decora&shy; tion soft hyphen. / current man adds: If you double-click an item a REQ_TOGGLE_ITEM is generated and E_UNKNOWN_COMMAND is returned.
- **Earlier:** matches — HOWTO quote alone lacks the double-click item case and keeps the soft-hyphenated decoration

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4575-4588", "man/menu_driver.3x:122-154"]
- **Quote:** HOWTO quote has "decora&shy;" soft hyphen, older compressed wording, and ends at positioning the cursor on a click. Current menu_driver(3X) adds that a double-click on an item generates REQ_TOGGLE_ITEM.
- **Earlier:** The HOWTO excerpt alone shows the soft hyphen and missing double-click; the current man page confirms the omission.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4575-4589", "man/menu_driver.3x:122-153"]
- **Quote:** HOWTO quote ends at positioning the cursor on a clicked item and contains the soft-hyphenated "decora&shy;tion". Current menu_driver(3X) additionally documents double-click on an item generating REQ_TOGGLE_ITEM and returning E_UNKNOWN_COMMAND.
- **Earlier:** The missing double-click sentence is visible from the HOWTO quote alone; the soft hyphen and current man page seal the 'older copy' reading.


## L55 (batch 2)

- **Claim as printed:** A link to text mode dos games at http://www.jersey.net/~debinjoe/games/
- **Appears in (corrected edition — not evidence):** `docs/client-library/menus/attributes.md`
- **Original source:** NCURSES Programming HOWTO, Menus chapter
- **Bo3 majority:** `matches` (majority) — votes: `matches | can't tell | matches` → {'matches': 2, "can't tell": 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`A link to text mode dos games at http://www.jersey.net/~debinjoe/games/` / now=`Link removed`
- **Errata checked / quote:** http://www.jersey.net/~debinjoe/games/ (fetched 2026-11-14) / The page is a parked-domain stub: <script>window.location.href="/lander"</script>
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5224-5230"]
- **Quote:** similar to those text mode <a href="http://www.jersey.net/~debinjoe/games/">dos games</a>
- **Earlier:** matches — the href is on that line; URL reachability is outside the repo

### Run 2

- **Verdict:** `can't tell` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5227-5229"]
- **Quote:** HOWTO: "text mode … dos games" linking to http://www.jersey.net/~debinjoe/games/. Whether that URL is valid is outside the repository.
- **Earlier:** I can confirm the HOWTO prints the link; settling whether the link is wrong needs an outside fetch.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:5227-5229"]
- **Quote:** "similar to those text mode dos games" links to http://www.jersey.net/~debinjoe/games/.
- **Earlier:** Nothing earlier; the HOWTO line is the whole claim. Link liveness was not required to confirm the printed URL.


## L69 (batch 2)

- **Claim as printed:** Note that `wgetch` automatically calls `wrefresh`
- **Appears in (corrected edition — not evidence):** `docs/client-library/panels/input-and-stdscr.md`
- **Original source:** ncurses-intro.html, The Panels Library
- **Bo3 majority:** `matches` (majority) — votes: `matches | disagrees | matches` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`Note that `wgetch` automatically calls `wrefresh`` / now=`wgetch() calls wrefresh() on its window when the window has changed since it was last refreshed`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1512; ncurses/base/lib_getch.c:382 / lib_getch.c: if ((is_wintouched(win) || (win->_flags & _HASMOVED)) && !IS_PAD(win)) { wrefresh(win); }
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1512-1515", "man/curs_getch.3x:162-169"]
- **Quote:** intro: Note that wgetch automatically calls wrefresh. / man: If the window win has been moved or modified since the last call to wrefresh, curses calls wrefresh on it.
- **Earlier:** matches — intro sentence alone states the automatic wrefresh

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1512-1513", "man/curs_getch.3x:162-169", "ncurses/base/lib_getch.c:382-385"]
- **Quote:** Intro states it unconditionally. curs_getch(3X)/lib_getch: wrefresh only if the window is touched or moved since the last wrefresh.
- **Earlier:** The intro's absolute wording would look right until the man page/source qualifier.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1512-1515", "man/curs_getch.3x:162-169"]
- **Quote:** Intro: "Note that wgetch automatically calls wrefresh." curs_getch(3X): if the window "has been moved or modified since the last call to wrefresh, curses calls wrefresh on it."
- **Earlier:** Without the man page I would treat 'automatically' as unconditional; the man page narrows it to dirty/moved windows, which still supports the intro's panels warning.


## L72 (batch 2)

- **Claim as printed:** The program reads a panel's position and size from its PANEL_DATA when it comes to the top, but never writes them back, so a moved panel jumps back to where it started the next time it is moved
- **Appears in (corrected edition — not evidence):** `docs/client-library/panels/moving-and-resizing.md`
- **Original source:** NCURSES Programming HOWTO, Panel Library chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The program reads a panel's position and size from its PANEL_DATA when it comes to the top, but never writes them back, so a moved panel jumps back to where it started the next time it is moved` / now=`The loop writes the position and size back after each key`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:3851; 3921; 3935 / set_user_ptrs: ptrs[i].x = x; main: case 9: ... newx = top->x; (no other write to top->x)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3919-3992", "doc/html/NCURSES-Programming-HOWTO.html:3847-3862"]
- **Quote:** on Tab: newx = top->x; newy = top->y; ... from PANEL_DATA. move_panel updates newx/newy locally. set_user_ptrs writes x,y once at init; no later assignment to top->x/top->y after moves.
- **Earlier:** matches — Tab reload from PANEL_DATA with no write-back is visible before tracing every move key

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3847-3862,3919-3973"]
- **Quote:** set_user_ptrs stores x,y,w,h once. Tab reloads newx/newy/neww/newh from PANEL_DATA; move_panel uses those values but never assigns back into top->x/y after a move.
- **Earlier:** Same from reading the move/tab cases in that listing.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3847-3862", "doc/html/NCURSES-Programming-HOWTO.html:3919-3974", "doc/html/NCURSES-Programming-HOWTO.html:4006-4013"]
- **Quote:** set_user_ptrs writes x,y,w,h once. Tab handler reloads newx/newy/neww/newh from top->x etc. move_panel updates use locals only; no assignment back into PANEL_DATA. Resize replaces the window but still does not update ptr fields.
- **Earlier:** Noticing reads on tab without checking writes would leave the jump undemonstrated; searching for assignments to top->x/ptrs[i].x after init finds none.


## L73 (batch 2)

- **Claim as printed:** "Show or Hide a window with 'a'(first window)  'b'(Second Window)  'c'(Third Window)", 83 characters on an 80-column screen
- **Appears in (corrected edition — not evidence):** `docs/client-library/panels/hiding.md`
- **Original source:** NCURSES Programming HOWTO, Panel Library chapter
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`"Show or Hide a window with 'a'(first window)  'b'(Second Window)  'c'(Third Window)", 83 characters on an 80-column screen` / now=`A 72-character line`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:4197 / mvprintw(LINES - 3, 0, "Show or Hide a window with 'a'(first window)  'b'(Second Window)  'c'(Third Window)");
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4195-4197"]
- **Quote:** mvprintw(..., "Show or Hide a window with 'a'(first window)  'b'(Second Window)  'c'(Third Window)"); string length 83.
- **Earlier:** matches — counting the quoted string is enough

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4196-4197"]
- **Quote:** That mvprintw string is exactly 83 characters.
- **Earlier:** No earlier source needed beyond counting the string.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:4197"]
- **Quote:** mvprintw string is exactly that text; character length is 83.
- **Earlier:** Reading the line without counting might leave the 80-column claim open; strlen confirms 83.


## L84 (batch 2)

- **Claim as printed:** In linking with `curses` you need to have `-lncurses` ... There is no need for any other libraries
- **Appears in (corrected edition — not evidence):** `docs/client-library/getting-started/hello-world.md` § compiling-with-the-ncurses-library
- **Original source:** ncurses-intro.html, Introduction and An Overview of Curses
- **Bo3 majority:** `matches` (majority) — votes: `matches | disagrees | matches` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`In linking with `curses` you need to have `-lncurses` ... There is no need for any other libraries` / now=`A build configured --with-termlib also needs tinfo when linking statically; pkg-config --libs ncurses prints what an installation needs`
- **Errata checked / quote:** doc/html/ncurses-intro.html:490-493; man/ncurses.3x:1880-1901; INSTALL:713-714 / ncurses.3x: An application desirous of wide-character support then uses -lncursesw (or -ltinfow) instead of -lncurses (or -ltinfo). INSTALL: generate .pc files for each of the libraries
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:490-493", "INSTALL:405", "INSTALL:1311-1342", "INSTALL:2530"]
- **Quote:** intro: In linking with curses you need to have -lncurses ... There is no need for any other libraries. / INSTALL: ncurses always available as -lncurses; --with-termlib can split libtinfo; example also shows -lgpm -lncurses.
- **Earlier:** matches — intro alone states no need for any other libraries

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:490-493", "INSTALL:1311-1315,2530"]
- **Quote:** Intro: only -lncurses. INSTALL --with-termlib splits libtinfo; example line shows -lncurses -lgpm -lncurses. Menu/form/panel apps also need their own -l libraries.
- **Earlier:** -lncurses is right for the base library; "no need for any other libraries" fails once termlib/gpm/panel are considered.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/ncurses-intro.html:490-493", "doc/html/NCURSES-Programming-HOWTO.html:1174-1182", "INSTALL:1423-1424"]
- **Quote:** Intro: "In linking with curses you need to have -lncurses ... There is no need for any other libraries." That holds for the basic libcurses/ncurses case the paragraph describes; higher-level HOWTO examples separately add -lmenu/-lpanel.
- **Earlier:** Without noting the intro's basic-curses scope I might disagree because menu/panel need extra libs; those are outside this sentence's context.


## L87 (batch 2)

- **Claim as printed:** `OK`: error flag returned by routines when things go right
- **Appears in (corrected edition — not evidence):** `docs/client-library/getting-started/naming-and-variables.md` § variables
- **Original source:** ncurses-intro.html, Introduction and An Overview of Curses
- **Bo3 majority:** `matches` (majority) — votes: `matches | disagrees | matches` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``OK`: error flag returned by routines when things go right` / now=`flag returned by routines when things go right (0)`
- **Errata checked / quote:** doc/html/ncurses-intro.html:620; include/curses.h.in:429 / #define OK      (0)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:617-620", "include/curses.h.in:426-429"]
- **Quote:** intro: OK — error flag returned by routines when things go right. / curses.h.in: #define OK (0); #define ERR (-1).
- **Earlier:** matches — intro alone calls OK an error flag for success

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:612-620", "include/curses.h.in:429"]
- **Quote:** Intro calls OK an "error flag" for success. curses.h.in: #define OK (0); ERR is the failure flag (-1) in the same list.
- **Earlier:** Calling a success code an "error flag" is already wrong from the intro wording alone.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/ncurses-intro.html:617-620", "include/curses.h.in:429"]
- **Quote:** Intro defines OK as the "error flag returned by routines when things go right." curses.h.in has #define OK (0), the success return paired with ERR.
- **Earlier:** Calling a success code an 'error flag' sounds wrong in isolation; the header confirms OK is the success return the intro describes.


## L97 (batch 3)

- **Claim as printed:** printw(string); mvprintw(y, x, string); ...
- **Appears in (corrected edition — not evidence):** `docs/client-library/windows/windows-and-refresh.md` § functions-for-stdscr-and-for-other-windows
- **Original source:** NCURSES Programming HOWTO, chapters 5 and 9
- **Bo3 majority:** `matches` (majority) — votes: `matches | disagrees | matches` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`printw(string); mvprintw(y, x, string); ...` / now=`printw(fmt, ...); and so on`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:1520; man/curs_printw.3x / curs_printw: int printw(const char *fmt, ...);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1520-1525", "man/curs_printw.3x"]
- **Quote:** HOWTO lists printw(string); mvprintw(y, x, string); as the naming pattern. man/curs_printw.3x: printw(const char *fmt, ...) — first argument is a printf-style format; using a plain string variable as fmt is valid when it has no conversions.
- **Earlier:** Without the man page, the HOWTO snippet alone looks like a complete prototype and could be read as denying the format argument.

### Run 2

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1520-1525", "man/curs_printw.3x:59-62, DESCRIPTION"]
- **Quote:** HOWTO shows "printw(string);" and "mvprintw(y, x, string);". curs_printw.3x prototypes are printw(const char *fmt, ...) and mvprintw(int y, int x, const char *fmt, ...), analogous to printf—not a bare string argument.
- **Earlier:** The HOWTO listing alone looks like a simplified API; the man page contradicts treating the first argument as an ordinary string rather than a format.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1520-1525", "man/curs_printw.3x:59-62"]
- **Quote:** HOWTO shows printw(string); mvprintw(y, x, string); ... man prototypes are printw(const char *fmt, ...); mvprintw(int y, int x, const char *fmt, ...);
- **Earlier:** Without the manpage prototypes, the HOWTO listing could be mistaken for informal shorthand rather than a wrong signature.


## L103 (batch 3)

- **Claim as printed:** If n is negative, then the entire string will be added
- **Appears in (corrected edition — not evidence):** `docs/client-library/output/characters-and-strings.md` § the-addstr-class-of-functions
- **Original source:** NCURSES Programming HOWTO, chapter 6
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | disagrees` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`If n is negative, then the entire string will be added` / now=`If n is -1, the entire string is added; ncurses treats any negative n the same way, but -1 is the documented value`
- **Errata checked / quote:** man/curs_addstr.3x:86-90; ncurses/base/lib_addstr.c:99 / If n is \-1, waddnstr writes the entire string.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1771-1773", "ncurses/base/lib_addstr.c:59-68", "man/curs_addstr.3x:86-90"]
- **Quote:** HOWTO: If n is negative, then the entire string will be added. waddnstr: bool explicit = (n >= 0); if (!explicit) n = INT_MAX; then writes until NUL. Man mentions only n is -1, but the implementation treats any n < 0 as "whole string".
- **Earlier:** Stopping at the man page's "n is -1" wording would have suggested the HOWTO overclaimed; the source confirms any negative n.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1770-1773", "man/curs_addstr.3x:81-90"]
- **Quote:** HOWTO:1772-1773: "If n is negative, then the entire string will be added." curs_addstr.3x: "If n is -1, waddnstr writes the entire string."
- **Earlier:** The HOWTO sentence alone looked plausible; the man page confirms it for addnstr/waddnstr.

### Run 3

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1770-1773", "man/curs_addstr.3x:81-90", "ncurses/base/lib_addstr.c:58-68"]
- **Quote:** HOWTO: If n is negative, then the entire string will be added. man: If n is -1, waddnstr writes the entire string. lib_addstr.c: bool explicit = (n >= 0); if (!explicit) n = INT_MAX;
- **Earlier:** Stopping at the manpage's '-1' wording would have treated the HOWTO as wrong; the implementation accepts any n < 0 as 'entire string'.


## L104 (batch 3)

- **Claim as printed:** It gives the number of columns and the number of rows in a given window
- **Appears in (corrected edition — not evidence):** `docs/client-library/output/printw.md` § a-simple-printw-example
- **Original source:** NCURSES Programming HOWTO, chapter 6
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`It gives the number of columns and the number of rows in a given window` / now=`It gives the number of rows and the number of columns`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html; man/curs_getyx.3x / getmaxyx(win, y, x): the rows come first
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1744-1750", "man/curs_getyx.3x:71-79"]
- **Quote:** HOWTO: getmaxyx() ... gives the number of columns and the number of rows in a given window. Man: getmaxyx stores win's maximum valid line and column dimensions ... Those are one more than the corresponding maximum positions.
- **Earlier:** The HOWTO sentence alone matches the man page's size/dimensions meaning.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1744-1750", "man/curs_getyx.3x:71-78"]
- **Quote:** HOWTO:1745-1746: getmaxyx "gives the number of columns and the number of rows in a given window." curs_getyx.3x: getmaxyx stores the window's maximum valid line and column dimensions in y and x.
- **Earlier:** I would have said the same after the HOWTO line; the man page only confirms dimensions rather than corner coordinates.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1743-1750", "man/curs_getyx.3x:54-78"]
- **Quote:** HOWTO: getmaxyx() ... It gives the number of columns and the number of rows in a given window. man: getmaxyx(WINDOW *win, int y, int x); stores maximum valid line and column dimensions in y and x respectively.
- **Earlier:** Without the manpage argument order, 'columns and ... rows' would not clearly show the swapped description.


## L114 (batch 3)

- **Claim as printed:** char str[80]; ... getstr(str);
- **Appears in (corrected edition — not evidence):** `docs/client-library/input/characters-and-strings.md` § a-simple-getstr-example
- **Original source:** NCURSES Programming HOWTO, chapter 7
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`char str[80]; ... getstr(str);` / now=`getnstr(str, (int) sizeof(str) - 1);`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:1927; include/curses.h.in:1222; man/curs_getstr.3x:155-160 / #define wgetstr(w, s) wgetnstr(w, s, -1); a negative n reads up to LINE_MAX characters
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1920-1927", "man/curs_getstr.3x:63-64"]
- **Quote:** Example uses char str[80]; ... getstr(str);. Man: int getstr(char *str); — the call matches the API.
- **Earlier:** The example matched the man prototype before any further reading.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1920-1927", "man/curs_getstr.3x:63-64"]
- **Quote:** HOWTO example has "char str[80];" and "getstr(str);". curs_getstr.3x: "int getstr(char * str);" — valid usage.
- **Earlier:** The example matched the man prototype on first read; no later source changed that.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1920-1927", "man/curs_getstr.3x:64-66", "man/curs_getstr.3x:138-145"]
- **Quote:** Example uses char str[80]; getstr(str);. man documents wgetstr/getstr and wgetnstr which reads at most n characters, aiding the application to avoid overrunning the buffer.
- **Earlier:** Confirming getstr exists would miss that the unbounded call into an 80-byte buffer is the documented hazard wgetnstr addresses.


## L136 (batch 3)

- **Claim as printed:** if (event.bstate & BUTTON1_PRESSED) with mousemask(ALL_MOUSE_EVENTS, NULL)
- **Appears in (corrected edition — not evidence):** `docs/client-library/mouse/mouse-menu-example.md`
- **Original source:** NCURSES Programming HOWTO, chapter 12
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`if (event.bstate & BUTTON1_PRESSED) with mousemask(ALL_MOUSE_EVENTS, NULL)` / now=`if (event.bstate & (BUTTON1_PRESSED | BUTTON1_CLICKED))`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:3096,3103; man/curs_mouse.3x:402-428 / If you do not make clicks visible, they will be reported as press-release pairs
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (medium confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3096-3104", "man/curs_mouse.3x:402-425", "include/curses.tail:24-26"]
- **Quote:** Example enables ALL_MOUSE_EVENTS then tests BUTTON1_PRESSED while the comment says "clicks". mouseinterval merges press+release into click events, so a click may surface as BUTTON1_CLICKED rather than BUTTON1_PRESSED.
- **Earlier:** PRESSED under ALL_MOUSE_EVENTS looks usable until click-resolution behavior in the mouse man page is considered.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3096-3104", "include/curses.tail:126", "man/curs_mouse.3x (BUTTON1_PRESSED / ALL_MOUSE_EVENTS)"]
- **Quote:** Example calls mousemask(ALL_MOUSE_EVENTS, NULL) and tests BUTTON1_PRESSED. ALL_MOUSE_EVENTS is defined as (REPORT_MOUSE_POSITION - 1) and includes press bits; the combination is valid.
- **Earlier:** Same conclusion after reading the example; headers only confirm ALL_MOUSE_EVENTS covers BUTTON1_PRESSED.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3096-3104", "man/curs_mouse.3x:402-425"]
- **Quote:** mousemask(ALL_MOUSE_EVENTS, NULL); ... if (event.bstate & BUTTON1_PRESSED). man: mouseinterval resolves press+release into a click when within the interval.
- **Earlier:** Before the mouseinterval man section, BUTTON1_PRESSED with ALL_MOUSE_EVENTS looks merely complete rather than click-resolution sensitive.


## L148 (batch 4)

- **Claim as printed:** copywin() can be used to copy a window completely onto another window
- **Appears in (corrected edition — not evidence):** `docs/client-library/screen/saving-and-copying.md`
- **Original source:** NCURSES Programming HOWTO, chapter 13
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`copywin() can be used to copy a window completely onto another window` / now=`copywin() copies a rectangle of one window onto another; the non-destructive mode leaves the destination where the source is blank`
- **Errata checked / quote:** doc/html/NCURSES-Programming-HOWTO.html:3213; man/curs_overlay.3x:74 / curs_overlay: a rectangle is specified in the destination window, (dminrow, dmincol) and (dmaxrow, dmaxcol)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** man/curs_overlay.3x:58-79; doc/html/NCURSES-Programming-HOWTO.html:3212-3219
- **Quote:** copywin(srcwin, dstwin, sminrow, smincol, dminrow, dmincol, dmaxrow, dmaxcol, overlay) — "finer granularity of control over the overlay and overwrite routines" with a destination rectangle and source origin; overlay true is non-destructive. HOWTO restates the complete-window use.
- **Earlier:** matches (HOWTO alone states the same capability; man confirms copywin can cover a full destination rectangle)

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_overlay.3x:58-79", "doc/html/NCURSES-Programming-HOWTO.html:3212-3219"]
- **Quote:** man/curs_overlay.3x: copywin provides finer control over overlay/overwrite; a destination rectangle and source upper-left are specified, and overlay true makes copying non-destructive. That API can express a full-window copy when the rectangle covers the destination.
- **Earlier:** From the HOWTO wording alone I would have matched; the man page confirms copywin is the rectangle form of overlay/overwrite, so a complete-window copy is supported.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_overlay.3x:56-79", "doc/html/NCURSES-Programming-HOWTO.html:3212-3219"]
- **Quote:** man/curs_overlay.3x: copywin provides finer control over overlay/overwrite via source origin and destination rectangle; overlay=true is non-destructive. HOWTO: "The function copywin() can be used to copy a window completely onto another window" with rectangle and overlay flag.
- **Earlier:** From the HOWTO wording alone I would have matched; the man page confirms copywin can express a full-window copy.


## L156 (batch 4)

- **Claim as printed:** By calling setupterm() for each terminal, and saving and restoring cur_term, a program can use two or more terminals
- **Appears in (corrected edition — not evidence):** `docs/client-library/init-and-debugging/terminal-descriptions.md` § setuptermterm-filedes-errret
- **Original source:** Writing Programs with NCURSES, Function Descriptions
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`By calling setupterm() for each terminal, and saving and restoring cur_term, a program can use two or more terminals` / now=`Switch between terminals with set_curterm(), which sets cur_term and returns its old value`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1082-1084; man/curs_terminfo.3x:53,86,340-354 / curs_terminfo: set_curterm sets cur_term to nterm, making all of the terminfo capabilities use the values from nterm. It returns the old value of cur_term.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** doc/html/ncurses-intro.html:1079-1084; man/curs_terminfo.3x:322-354; man/term_variables.3x:123-140
- **Quote:** setupterm stores terminal state in cur_term; set_curterm/set_term switch among TERMINAL/SCREEN values; term_variables: "save a value of cur_term for subsequent use".
- **Earlier:** matches (intro alone)

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_terminfo.3x:322-354", "man/term_variables.3x:129-140", "doc/html/ncurses-intro.html:1079-1084"]
- **Quote:** man/curs_terminfo.3x: setupterm stores terminal info in a TERMINAL pointed to by cur_term; set_curterm sets cur_term to another TERMINAL and returns the old value.
- **Earlier:** Same conclusion from the intro text before confirming set_curterm/cur_term in the man pages.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["man/curs_terminfo.3x:322-354", "man/term_variables.3x:129-140", "ncurses/tinfo/lib_cur_term.c:81-119", "doc/html/ncurses-intro.html:1079-1084"]
- **Quote:** setupterm stores state in cur_term; set_curterm switches it (updates SP->_term, ospeed, PC, ttytype). Intro: save/restore cur_term for two or more terminals.
- **Earlier:** Before reading set_curterm, a raw pointer assign looked incomplete; set_curterm shows restoring the saved TERMINAL* is the supported switch.


## L157 (batch 4)

- **Claim as printed:** trace() sets the trace level; _tracef() is available only if you link with -lncurses_g
- **Appears in (corrected edition — not evidence):** `docs/client-library/init-and-debugging/debugging.md` § curses_trace
- **Original source:** Writing Programs with NCURSES, Function Descriptions
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`trace() sets the trace level; _tracef() is available only if you link with -lncurses_g` / now=`curses_trace() sets the level and replaces the deprecated trace(); the trace functions are in the debugging library or any build with TRACE defined; tracing is skipped if the trace file already exists`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1101-1120; man/curs_trace.3x:138,300 / curs_trace: The original trace routine was deprecated because it often conflicted with application names. ... If the file already exists, no tracing is done.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (medium confidence)
- **Opened:** doc/html/ncurses-intro.html:1101-1123; man/curs_trace.3x:94-107
- **Quote:** trace() is a deprecated alias that sets the trace mask. Man: aside from curses_trace, other trace functions "are normally available only with the debugging library e.g., libncurses_g.a"; TRACE compile also works.
- **Earlier:** matches (intro); man softens "only" with "normally" and TRACE

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_trace.3x:94-104", "man/curs_trace.3x:128-140", "man/ncurses.3x:163-171", "doc/html/ncurses-intro.html:1101-1120"]
- **Quote:** man/curs_trace.3x: deprecated trace(mask) remains; aside from curses_trace, other trace functions including _tracef are normally available only with the debugging library e.g. libncurses_g.a.
- **Earlier:** Would have matched from the intro; man confirms trace still exists (deprecated) and _tracef still needs the debug library.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_trace.3x:94-116", "man/ncurses.3x:160-177", "doc/html/ncurses-intro.html:1101-1123"]
- **Quote:** man/curs_trace.3x: deprecated trace(); aside from curses_trace, other trace functions (including _tracef) are normally only in the debugging library e.g. libncurses_g.a. man/ncurses.3x documents -lncurses_g.
- **Earlier:** Same conclusion from curs_trace.3x alone; ncurses.3x only reinforced -lncurses_g.


## L162 (batch 4)

- **Claim as printed:** Setupterm() also stores
- **Appears in (corrected edition — not evidence):** `docs/client-library/init-and-debugging/terminal-descriptions.md` § setuptermterm-filedes-errret
- **Original source:** Writing Programs with NCURSES, Function Descriptions
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Setupterm() also stores` / now=`setupterm() also copies`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1085 / Setupterm() also stores the names section of the terminal description
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** doc/html/ncurses-intro.html:1085-1089; man/curs_terminfo.3x:845-847; man/term_variables.3x:186-187
- **Quote:** Intro: Setupterm() also stores the names section in ttytype[]. Man: "setupterm copies the terminal name to the array ttytype."
- **Earlier:** can't tell (fragment alone); HTML+man complete and confirm ttytype storage

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1085-1089", "man/curs_terminfo.3x:845-847", "man/term_variables.3x:186-187"]
- **Quote:** Intro continues: stores the names section in ttytype[]. man/curs_terminfo.3x Legacy Data: setupterm copies the terminal name to the array ttytype.
- **Earlier:** The truncated fragment alone would be can't tell; completing it from the intro and checking ttytype in the man pages settles matches.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/term_variables.3x:186-188", "man/curs_terminfo.3x:322-326", "doc/html/ncurses-intro.html:1085-1088"]
- **Quote:** Intro continues: stores the names section in ttytype[]. man/term_variables.3x: setupterm copies the terminal name to ttytype. Fact matches; mid-sentence capital "Setupterm" is stylistic only.
- **Earlier:** The bare fragment looked incomplete until the intro/man ttytype sentences were opened.


## L170 (batch 4)

- **Claim as printed:** the attribute of erased blanks is normal unless and until it is modified by the functions bkgdset() or wbkgdset()
- **Appears in (corrected edition — not evidence):** `docs/client-library/hints/compatibility.md` § background-erase
- **Original source:** Writing Programs with NCURSES, Compatibility with Older Versions
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`the attribute of erased blanks is normal unless and until it is modified by the functions bkgdset() or wbkgdset()` / now=`Erased blanks have the window's background rendition, which is normal until you change it with bkgd(), bkgdset(), wbkgd() or wbkgdset()`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1388; man/curs_bkgd.3x:86 / Instead, the attribute of erased blanks is normal unless and until it is modified by the functions bkgdset() or wbkgdset().
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** doc/html/ncurses-intro.html:1387-1389; man/curs_bkgd.3x:86-99
- **Quote:** Erase fills with the background character; attributes come from that background, set via bkgdset/wbkgdset (default blank/normal until then).
- **Earlier:** matches (intro alone)

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_bkgd.3x:82-99", "man/curs_bkgd.3x:175-178", "doc/html/ncurses-intro.html:1388-1389"]
- **Quote:** man/curs_bkgd.3x: erasing replaces cells with the background character; blank cells combine with the background character's attributes set via bkgdset/wbkgdset.
- **Earlier:** Matched from the intro; curs_bkgd confirms background-controlled erase rendition.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_bkgd.3x:80-99", "doc/html/ncurses-intro.html:1387-1392"]
- **Quote:** man: erase fills with the background character set via bkgdset/wbkgdset; blank cells combine with that background. Intro's newer-versions background-erase note matches current behavior.
- **Earlier:** Same match from the intro and curs_bkgd.3x; no later source changed it.


## L171 (batch 4)

- **Claim as printed:** every macro entry point have a corresponding function which may be linked
- **Appears in (corrected edition — not evidence):** `docs/client-library/hints/compatibility.md` § xopen-curses-conformance
- **Original source:** Writing Programs with NCURSES, XSI Curses Conformance
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`every macro entry point have a corresponding function which may be linked` / now=`A function the standard defines, and ncurses also implements as a macro, is available as a function too; getyx(), getmaxyx() and the others the standard defines only as macros have no function`
- **Errata checked / quote:** doc/html/ncurses-intro.html:1407; man/curs_getyx.3x:107 / ncurses meets the XSI requirement that every macro entry point have a corresponding function which may be linked / curs_getyx: All of these interfaces are implemented as macros.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (medium confidence)
- **Opened:** doc/html/ncurses-intro.html:1406-1409; man/ncurses.3x:121-122; include/curses.h.in:642,861,1317
- **Quote:** Intro states the XSI macro/function pairing (grammar "have"/"has"). Headers expose both macros and NCURSES_EXPORT functions (e.g. bkgdset macro vs wbkgdset).
- **Earlier:** matches (intro); man notes macro-vs-function address issues without restating the XSI rule

### Run 2

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["man/ncurses.3x:117-122", "doc/html/ncurses-intro.html:1406-1409"]
- **Quote:** Intro states the XSI macro/function requirement (with subject-verb "have"). man/ncurses.3x still discusses availability of a preprocessor macro exclusive of a function definition as a NOTES concern, consistent with providing linkable functions.
- **Earlier:** Would have matched on the XSI requirement alone; confidence stays medium because the printed grammar is wrong even though the library still exposes functions for macros.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["man/ncurses.3x:117-122", "doc/html/ncurses-intro.html:1406-1409"]
- **Quote:** Intro: XSI requirement that every macro entry point have a corresponding function if the macro is #undef'd. man/ncurses.3x notes macros exclusive of function definitions as a NOTES caveat in general, without retracting the XSI correspondence goal for ncurses.
- **Earlier:** Without the intro's XSI sentence, the man NOTES about macro-only symbols would have pushed toward disagrees.


## L195 (batch 4)

- **Claim as printed:** Thomas E. Dickey wrote or revised most of the manual pages
- **Appears in (corrected edition — not evidence):** `site/src/content/docs/index.mdx`
- **Original source:** This edition's front page
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`Thomas E. Dickey wrote or revised most of the manual pages` / now=`He has revised every manual page, which Eric S. Raymond first wrote`
- **Errata checked / quote:** README:171; the copyright lines of all 133 files in man/ / Eric S. Raymond: the man pages
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (medium confidence)
- **Opened:** README:172-177; ANNOUNCE:39; man/curs_overlay.3x:2-3; NEWS:118-132
- **Quote:** README credits ESR for "the man pages"; current man copyrights and NEWS show extensive Dickey (and later) revisions across the set.
- **Earlier:** disagrees (README attributes original man pages to ESR); later copyrights/NEWS support "revised most"

### Run 2

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["README:172-177", "man/ncurses.3x:1-5", "ANNOUNCE:39"]
- **Quote:** README credits Eric S. Raymond for originally writing the man pages; current man/*.3x carry Thomas E. Dickey copyright headers reflecting extensive revision.
- **Earlier:** From README's ESR credit alone I would have disagreed on "wrote"; the universal Dickey copyrights on present man pages support "wrote or revised most" for the current tree.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_initscr.3x:2-3", "man/curs_overlay.3x:2", "man/resizeterm.3x:2", "ANNOUNCE:653"]
- **Quote:** Widespread Thomas E. Dickey copyright lines on current man pages; ANNOUNCE credits ongoing development to Dickey. Supports wrote/revised most pages.
- **Earlier:** Sampling a few man headers was enough; ANNOUNCE did not change the verdict.


## L200 (batch 4)

- **Claim as printed:** `trace()`
- **Appears in (corrected edition — not evidence):** `docs/contributor/hackguide/reporting-bugs.md` § 3-generate-and-examine-a-trace-file-for-the-broken-behavior
- **Original source:** A Hacker's Guide to NCURSES
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=``trace()`` / now=``curses_trace()``
- **Errata checked / quote:** man/curs_trace.3x:300 / The original trace routine was deprecated because
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** doc/html/hackguide.html:309-312; man/curs_trace.3x:94-95; doc/html/ncurses-intro.html:1101-1105
- **Quote:** trace() exists as a deprecated interface that sets the trace mask; hackguide's debug recipe still names it.
- **Earlier:** matches

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_trace.3x:94-104", "doc/html/hackguide.html:309"]
- **Quote:** man/curs_trace.3x still declares deprecated void trace(const unsigned int trace-mask); hackguide tells readers to insert a trace() call.
- **Earlier:** Same after confirming the symbol remains in the man page.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:307-312", "man/curs_trace.3x:94-104"]
- **Quote:** hackguide tells bug reporters to insert trace(). man still documents deprecated trace(); debugging builds still provide it.
- **Earlier:** Deprecated status in curs_trace.3x does not remove the symbol the hackguide names.


## L202 (batch 4)

- **Claim as printed:** If the entire sequence takes less than 1 second
- **Appears in (corrected edition — not evidence):** `docs/contributor/hackguide/engine-room.md` § keyboard-input
- **Original source:** A Hacker's Guide to NCURSES
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`If the entire sequence takes less than 1 second` / now=`Each character of the sequence must arrive within ESCDELAY, 1000 ms by default`
- **Errata checked / quote:** ncurses/base/lib_getch.c:66; ncurses/base/lib_getch.c:682-690 / NCURSES_EXPORT_VAR(int) ESCDELAY = 1000;
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** doc/html/hackguide.html:506-510; ncurses/base/lib_getch.c:66
- **Quote:** ESCDELAY defaults to 1000 ms; wgetch treats a complete function-key sequence within that window as a key press.
- **Earlier:** matches (hackguide alone)

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:507-510", "ncurses/base/lib_getch.c:66", "man/ncurses.3x:1285-1299"]
- **Quote:** ESCDELAY defaults to 1000 ms (one second) in lib_getch.c and man/ncurses.3x; hackguide's "less than 1 second" matches that default timer.
- **Earlier:** Matched from hackguide; ESCDELAY=1000 confirms the default.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:506-510", "ncurses/base/lib_getch.c:66", "man/curs_variables.3x:309-320"]
- **Quote:** Default ESCDELAY is 1000 ms (1 second). Timed wait after a possible function-key prefix matches the hackguide's "less than 1 second" rule at default settings.
- **Earlier:** Same after seeing ESCDELAY=1000; the man page only named the variable.


## L208 (batch 5)

- **Claim as printed:** will settle for BSD regexps
- **Appears in (corrected edition — not evidence):** `docs/contributor/hackguide/forms-and-menus.md`
- **Original source:** A Hacker's Guide to NCURSES
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`medium`
- **Errata was → now:** was=`will settle for BSD regexps` / now=`will settle for the older `compile()` and `step()` from `regexp.h` or `regexpr.h``
- **Errata checked / quote:** aclocal.m4:7305; aclocal.m4:7320 / AC_CHECK_FUNC(compile,[cf_regex_func=compile],[ ... for cf_regex_hdr in regexp.h regexpr.h
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:633-635", "form/fty_regex.c:40-41", "form/fty_regex.c:88-117", "form/fty_regex.c:132-134"]
- **Quote:** hackguide.html: 'The configuration code prefers the POSIX regex facility... but will settle for BSD regexps if the former is not available.' fty_regex.c: prefers HAVE_REGEX_H_FUNCS / PCRE2, else HAVE_REGEXP_H_FUNCS | HAVE_REGEXPR_H_FUNCS with <regexp.h>/<regexpr.h>.
- **Earlier:** Hackguide alone would have been matches; fty_regex.c confirmed the BSD/regexp fallback still exists.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:633-634", "form/fty_regex.c:40", "form/fty_regex.c:88-120"]
- **Quote:** hackguide: prefers the POSIX regex facility... but will settle for BSD regexps if the former is not available. / fty_regex.c: #if HAVE_REGEX_H_FUNCS || HAVE_LIB_PCRE2 /* We prefer POSIX regex */ then #elif HAVE_REGEXP_H_FUNCS | HAVE_REGEXPR_H_FUNCS with regexp.h/regexpr.h.
- **Earlier:** matches — hackguide states the BSD fallback before confirming form/fty_regex.c

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:633-635", "form/fty_regex.c:40-116", "form/fty_regex.c:178-204"]
- **Quote:** hackguide: prefers POSIX regex, “will settle for BSD regexps”; fty_regex.c still provides HAVE_REGEXP_H_FUNCS / HAVE_REGEXPR_H_FUNCS fallbacks including <regexp.h>.
- **Earlier:** matches — same reading from hackguide alone


## L227 (batch 5)

- **Claim as printed:** tic(1), captoinfo(1), infocmp(1), toe(1), clear(1) tset(1), reset(1), and tput(1)
- **Appears in (corrected edition — not evidence):** `docs/contributor/install/installation-procedure.md` § step-3-build
- **Original source:** INSTALL
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`tic(1), captoinfo(1), infocmp(1), toe(1), clear(1) tset(1), reset(1), and tput(1)` / now=`tic(1), captoinfo(1), infotocap(1), infocmp(1), toe(1), clear(1), tabs(1), tset(1), reset(1) and tput(1); step 1's list also gains infotocap`
- **Errata checked / quote:** progs/Makefile.in:202-217; INSTALL step 1 / actual_captoinfo ... actual_infotocap
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:183-187", "progs/tic.c", "progs/infocmp.c", "progs/toe.c", "progs/clear.c", "progs/tset.c", "progs/tput.c", "progs/Makefile.in:248-250", "man/tic.1m", "man/captoinfo.1m", "man/clear.1", "man/tset.1", "man/tput.1"]
- **Quote:** INSTALL:184-185 lists those programs as what 'make' compiles. Sources exist under progs/; reset is installed as a symlink to tset (Makefile.in:248-250). Manual pages exist (tic/captoinfo/infocmp/toe as .1m; clear/tset/tput as .1).
- **Earlier:** INSTALL listing alone was provisional matches; progs/ and man/ confirmed the tools are present (section numbers in INSTALL use (1) loosely).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:183-186", "progs/tic.c:1-20", "ncurses/tinfo/captoinfo.c:1-20", "progs/infocmp.c:1-20", "progs/toe.c:1-20", "progs/clear.c:1-20", "progs/tset.c:1-20", "progs/tput.c:1-20", "progs/Makefile.in:248-250"]
- **Quote:** INSTALL lists those programs as build products. / corresponding sources exist; Makefile.in links reset to tset.
- **Earlier:** matches — INSTALL list alone

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:183-187", "progs/Makefile.in:142-144", "progs/Makefile.in:235-250", "man/tic.1m", "man/clear.1", "man/tput.1", "man/tset.1"]
- **Quote:** INSTALL lists those utilities as build products; progs builds/links tic, captoinfo, clear, tset/reset, tput, toe, infocmp, matching the claim’s inventory (man pages exist under .1m or .1 as appropriate).
- **Earlier:** matches — INSTALL and progs/Makefile.in agree on the program set


## L228 (batch 5)

- **Claim as printed:** If the option is not given, this defaults to "long".
- **Appears in (corrected edition — not evidence):** `docs/contributor/install/configure-options/with-m-z.md` § --with-tparm-argxxx
- **Original source:** INSTALL
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | disagrees` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`If the option is not given, this defaults to "long".` / now=`intptr_t for ABI 6, the default ABI, and long for ABI 5`
- **Errata checked / quote:** aclocal.m4:92,109 (CF_ABI_DEFAULTS); configure.in:1086-1089; a configure run / cf_dft_tparm_arg=long ... (x[[6789]]) cf_dft_tparm_arg=intptr_t
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:1347-1354", "include/nc_tparm.h:46-50", "include/curses.h.in:214-218"]
- **Quote:** INSTALL under --with-tparm-arg: 'If the option is not given, this defaults to "long".' nc_tparm.h: if NCURSES_TPARM_ARG is unset, '#define TPARM_ARG long'.
- **Earlier:** INSTALL alone was matches; nc_tparm.h confirmed the default type.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:1347-1355", "aclocal.m4:92", "configure.in:1085-1089"]
- **Quote:** INSTALL --with-tparm-arg: If the option is not given, this defaults to "long". / cf_dft_tparm_arg=long; CF_WITH_TYPE(tparm-arg,... $cf_dft_tparm_arg).
- **Earlier:** matches — INSTALL states the default

### Run 3

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["INSTALL:1347-1354", "aclocal.m4:92-109", "aclocal.m4:6567", "dist.mk:39", "configure.in:1085-1089"]
- **Quote:** INSTALL says --with-tparm-arg defaults to long; for ABI 6+ (cf_cv_abi_default=6, NCURSES_MAJOR=6) aclocal sets cf_dft_tparm_arg=intptr_t.
- **Earlier:** matches — INSTALL and the non-ABI override default of long


## L256 (batch 5)

- **Claim as printed:** The most important bug-fixes/improvements (a link to "Interesting bug-fixes", a section with no content)
- **Appears in (corrected edition — not evidence):** `docs/contributor/announce/release-notes.md`
- **Original source:** announce.html.in
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The most important bug-fixes/improvements (a link to "Interesting bug-fixes", a section with no content)` / now=`The most important bug-fixes and improvements dealt with robustness issues (no link); the empty section is dropped`
- **Errata checked / quote:** announce.html.in:171,926-930 / <h3>...Interesting bug-fixes</a></h3> followed directly by <h3>...Configuration changes</a></h3>
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["announce.html.in:171-175", "announce.html.in:926-930", "ANNOUNCE:296-299"]
- **Quote:** announce.html.in links 'important bug-fixes/improvements' to #h3-bug-fixes. That heading is immediately followed by 'Configuration changes' with no body under Interesting bug-fixes. ANNOUNCE's text form does have a short paragraph there.
- **Earlier:** Before checking the HTML anchor target I would only have known a link existed; the empty HTML section confirms the claim.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["announce.html.in:171-173", "announce.html.in:926-928", "announce.html.in:1842"]
- **Quote:** TOC/body link The most important bug-fixes/improvements → #h3-bug-fixes. / <h3>Interesting bug-fixes</h3> is followed immediately by the next <h3> with no body content.
- **Earlier:** matches — TOC link target found before noticing the empty body

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["announce.html.in:171-175", "announce.html.in:926-930"]
- **Quote:** announce.html.in links “important bug-fixes/improvements” to #h3-bug-fixes; the Interesting bug-fixes heading is immediately followed by Configuration changes with no body content.
- **Earlier:** matches — same empty section on first open


## L268 (batch 6)

- **Claim as printed:** control characters like suspend (CTRL-Z), interrupt and quit (CTRL-C)
- **Appears in (corrected edition — not evidence):** `docs/client-library/getting-started/initialization.md` § raw-and-cbreak
- **Original source:** NCURSES Programming HOWTO, Initialization
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | disagrees` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`control characters like suspend (CTRL-Z), interrupt and quit (CTRL-C)` / now=`suspend (CTRL-Z), interrupt (CTRL-C) and quit (CTRL-\)`
- **Errata checked / quote:** /usr/include/x86_64-linux-gnu/sys/ttydefaults.h:71 / #define CQUIT 034 /* FS, ^\ */
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1337-1342", "man/curs_inopts.3x:153-157", "man/curs_inopts.3x:442-448"]
- **Quote:** HOWTO names suspend (CTRL-Z), interrupt and quit (CTRL-C). man/curs_inopts.3x likewise discusses the interrupt, quit, suspend, and flow-control characters for cbreak vs raw.
- **Earlier:** Same after the man page; the HOWTO later misstates cbreak handling, but that is outside this claim fragment.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1335-1342", "man/curs_inopts.3x:148-157", "man/curs_inopts.3x:434-447"]
- **Quote:** HOWTO names "suspend (CTRL-Z), interrupt and quit (CTRL-C)" as the characters that differ between raw and cbreak. man raw/cbreak: interrupt, quit, suspend (and flow control) are the characters raw passes through and cbreak leaves generating signals.
- **Earlier:** From the HOWTO alone the naming looked right; man pages confirmed the same set. (HOWTO's separate claim that cbreak treats them like ordinary characters is wrong, but that sentence is not this claim.)

### Run 3

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:1337-1342", "man/curs_inopts.3x:148-158", "man/curs_inopts.3x:434-448"]
- **Quote:** HOWTO groups "interrupt and quit (CTRL-C)". Man: cbreak leaves interrupt/quit/suspend unaffected (still signal); raw passes those characters through uninterpreted. Quit is not CTRL-C (typically CTRL-\\).
- **Earlier:** matches — those names are the control characters the HOWTO discusses for raw vs cbreak


## L271 (batch 6)

- **Claim as printed:** Other border functions draws lines with them (the forms-drawing characters)
- **Appears in (corrected edition — not evidence):** `docs/client-library/output/forms-characters.md`
- **Original source:** This edition (commit eea2d03, Output guide)
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Other border functions draws lines with them (the forms-drawing characters)` / now=`Other border functions draws with the ASCII characters |, - and +; the window border program gets forms-drawing characters by passing 0 to box()`
- **Errata checked / quote:** docs/client-library/windows/border-functions.md (init_win_params); docs/man/curs_border/03-description.3x:36 / p_win->border.ls = '|'; ... p_win->border.tl = '+'; If any chtype argument is 0, then curses uses forms-drawing characters
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:2422-2436", "doc/html/NCURSES-Programming-HOWTO.html:2500-2507", "man/curs_border.3x:124-125"]
- **Quote:** HOWTO §9.5 says mvhline/mvvline create a horizontal or vertical line of the specified length; the example draws with ASCII '|','-','+', not ACS forms-drawing. man/curs_border.3x: forms-drawing characters are used when a border argument is 0, not that 'other border functions' inherently draw with them. Grammar: 'draws' disagrees with plural subject.
- **Earlier:** After only the HOWTO section I already had disagrees (ASCII example, no forms-drawing claim).

### Run 2

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["man/curs_border.3x:88-90", "man/curs_addch.3x:194-198", "doc/html/NCURSES-Programming-HOWTO.html:2422-2436"]
- **Quote:** curs_border.3x: "If any chtype argument is 0, then curses uses forms-drawing characters". HOWTO §9.5 covers other border functions (mvhline/mvvline) but does not use this exact sentence.
- **Earlier:** Before man/curs_border.3x I only had the HOWTO section title; after the man page, the technical content (border helpers use forms-drawing characters) is borne out despite the subject-verb typo "draws".

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:2422-2435", "man/curs_border.3x:118-125"]
- **Quote:** HOWTO §9.5: other border-related functions (mvhline/mvvline) create horizontal/vertical lines. curs_border: if chtype args are 0, curses uses forms-drawing characters.
- **Earlier:** can't tell — awkward "draws" wording without checking border man page for ACS defaults


## L272 (batch 6)

- **Claim as printed:** Initially the terminal has echoing enabled and is in ordinary cooked mode, so one or the other has to be changed before calling getch(); otherwise, the program's output will be unpredictable
- **Appears in (corrected edition — not evidence):** `docs/client-library/input/characters-and-strings.md` § the-getch-class-of-functions
- **Original source:** Writing Programs with NCURSES, Input
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Initially the terminal has echoing enabled and is in ordinary cooked mode, so one or the other has to be changed before calling getch(); otherwise, the program's output will be unpredictable` / now=`In cooked mode ncurses getch() reads a whole line with wgetnstr(), echoing it, then returns it one character at a time`
- **Errata checked / quote:** ncurses/base/lib_getch.c:453-476 / Handle cooked mode. Grab a string from the screen, stuff its contents in the FIFO queue, and pop off the first character to return it.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:768-772", "man/curs_inopts.3x:137-160", "man/curs_getch.3x (via doc/html/man/curs_getch.3x.html mode notes)"]
- **Quote:** ncurses-intro Input: 'Since initially the terminal has echoing enabled and is in ordinary cooked mode, one or the other has to changed before calling getch(); otherwise, the program's output will be unpredictable.' Substance matches; man pages require cbreak/raw for interactive getch with echo.
- **Earlier:** Matches after the intro alone; man pages only confirm.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:764-772", "man/curs_inopts.3x:137-160", "man/curs_getch.3x:1-50"]
- **Quote:** ncurses-intro.html: "Since initially the terminal has echoing enabled and is in ordinary cooked mode, one or the other has to changed before calling getch(); otherwise, the program's output will be unpredictable."
- **Earlier:** Same conclusion from the intro alone; man pages agree cooked/echo is the starting line discipline.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:765-772", "man/curs_getch.3x:629-632"]
- **Quote:** Intro: initially echoing enabled and cooked; one or the other has to [be] changed before getch(). curs_getch NOTES: wgetch with echo and neither cbreak nor raw is not well-defined.
- **Earlier:** matches — intro text alone already states the same rule


## L273 (batch 6)

- **Claim as printed:** While getnstr() is reading the line, F1 is ignored, like the other function keys
- **Appears in (corrected edition — not evidence):** `docs/client-library/input/characters-and-strings.md` § a-simple-getstr-example
- **Original source:** This edition (commit d341cd3, Input guide)
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`While getnstr() is reading the line, F1 is ignored, like the other function keys` / now=`Without keypad() F1 arrives as its escape sequence and is stored; in keypad mode getnstr() beeps at function keys, except that the down arrow ends the line and the left arrow erases`
- **Errata checked / quote:** ncurses/base/lib_getstr.c:118-148 / ch == KEY_DOWN || ch == KEY_ENTER ... break; ch == erasec || ch == KEY_LEFT || ch == KEY_BACKSPACE ... else if (ch >= KEY_MIN ...) beep
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["man/curs_getstr.3x:96-108", "ncurses/base/lib_getstr.c:112-148"]
- **Quote:** wgetnstr discards most function keys with beep(); KEY_F(1) is KEY_MIN-class and takes the discard/beep path. Not all keys are ignored: KEY_LEFT/KEY_BACKSPACE erase; KEY_DOWN/KEY_ENTER terminate. 'Ignored' is loose (beep), but F1 is not inserted.
- **Earlier:** From the man page alone I nearly said disagrees because discards call beep and some KEY_* are handled; source confirms F1 is discarded.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_getstr.3x:96-108", "ncurses/base/lib_getstr.c:137-147"]
- **Quote:** curs_getstr.3x: recognizes function keys if keypad is on; treats KEY_LEFT/KEY_BACKSPACE as erase; "discards function key inputs other than those treated as the erase or kill characters, calling beep". lib_getstr.c: `ch >= KEY_MIN` → beep (F1 included).
- **Earlier:** Man page alone already supported discarding other function keys; the implementation confirmed F1 takes the KEY_MIN beep path.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["ncurses/base/lib_getstr.c:145-148", "man/curs_getstr.3x:96-108"]
- **Quote:** wgetnstr: if (ch >= KEY_MIN || str-oldstr >= maxlen) beep; else store char. Man: discards function key inputs other than erase/kill synonyms, calling beep. KEY_F(1) is >= KEY_MIN, so it is rejected, not inserted.
- **Earlier:** can't tell — man page alone does not name F1 during getnstr


## L275 (batch 6)

- **Claim as printed:** Do this before the next wgetch(); otherwise another mouse event might come in and make the first one inaccessible
- **Appears in (corrected edition — not evidence):** `docs/client-library/mouse/mouse-events.md` § getting-the-events
- **Original source:** Writing Programs with NCURSES, Mouse Interfacing
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`Do this before the next wgetch(); otherwise another mouse event might come in and make the first one inaccessible` / now=`ncurses keeps mouse events in a separate queue of eight; read each one with getmouse() when KEY_MOUSE arrives`
- **Errata checked / quote:** ncurses/curses.priv.h:185; docs/man/curs_mouse (DESCRIPTION) / #define EV_MAX 8 /* size of mouse circular event queue */; A queue distinct from that used for keyboard events accumulates the details of mouse events.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:887-892", "man/curs_mouse.3x:188-195"]
- **Quote:** ncurses-intro: call getmouse() 'before the next wgetch(), otherwise another mouse event might come in and make the first one inaccessible.' getmouse man: removes the event from the queue.
- **Earlier:** Matches from the intro alone.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:886-892", "man/curs_mouse.3x:237-244"]
- **Quote:** ncurses-intro: "use the function getmouse() (you must do this before the next wgetch(), otherwise another mouse event might come in and make the first one inaccessible)". curs_mouse.3x: KEY_MOUSE means an enqueued event; call getmouse to read and remove it.
- **Earlier:** Intro text alone matched the claim; man page confirmed the single shared queue semantics.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:886-892", "man/curs_mouse.3x:237-260"]
- **Quote:** Intro: must call getmouse before the next wgetch or another mouse event may make the first inaccessible. Man: getmouse removes the event from the queue after KEY_MOUSE; a subsequent getmouse retrieves the next older event.
- **Earlier:** matches — intro alone states the same warning


## L276 (batch 6)

- **Claim as printed:** An example showing all the characters, with 31 SHOW() lines and no ACS_URCORNER
- **Appears in (corrected edition — not evidence):** `docs/client-library/screen/line-drawing-characters.md`
- **Original source:** NCURSES Programming HOWTO, Line Graphics
- **Bo3 majority:** `matches` (majority) — votes: `disagrees | matches | matches` → {'disagrees': 1, 'matches': 2}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`An example showing all the characters, with 31 SHOW() lines and no ACS_URCORNER` / now=`32 SHOW() lines, adding the upper right corner, and a note on the eleven ACS_ aliases`
- **Errata checked / quote:** include/curses.h.in (ACS_ defines); doc/html/NCURSES-Programming-HOWTO.html:3332-3363 / #define ACS_URCORNER NCURSES_ACS('k') /* upper right corner */; the HOWTO has no ACS_URCORNER
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3313-3362", "include/curses.h.in:370", "man/curs_addch.3x:350"]
- **Quote:** HOWTO: 'Here is an example showing all the characters.' The ACS example has exactly 31 SHOW() lines (UL/LL/LR corners, etc.) and never references ACS_URCORNER, which exists in curses.h/man as the upper-right corner.
- **Earlier:** Counting SHOW lines alone suggested matches as a description; ACS_URCORNER in the headers shows 'all the characters' is false.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3310-3362", "include/curses.h.in:370"]
- **Quote:** HOWTO: "Here is an example showing all the characters." Example has exactly 31 SHOW(...) lines listing ACS_ULCORNER/LLCORNER/LRCORNER etc. but never ACS_URCORNER. curses.h.in defines ACS_URCORNER.
- **Earlier:** Counting SHOW lines already matched 31 and no URCORNER; the header only confirmed URCORNER exists among ACS symbols.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/NCURSES-Programming-HOWTO.html:3314-3362", "man/curs_addch.3x:98", "man/curs_addch.3x:350"]
- **Quote:** HOWTO: "Here is an example showing all the characters." Example has 31 SHOW("...") lines (ULCORNER/LLCORNER/LRCORNER present) and omits ACS_URCORNER, which curs_addch lists as a standard ACS symbol.
- **Earlier:** matches — counting SHOW lines already shows ACS_URCORNER is missing


## L278 (batch 6)

- **Claim as printed:** By default, all options are on.
- **Appears in (corrected edition — not evidence):** `docs/client-library/forms/field-options.md` § field-option-bits
- **Original source:** Writing Programs with NCURSES, The Forms Library
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`By default, all options are on.` / now=`The ten standard options are on by default; the four ncurses extension options are off`
- **Errata checked / quote:** form/form.priv.h:151-168; form/fld_def.c:57 / STD_FIELD_OPTS (O_VISIBLE ... O_STATIC); ALL_FIELD_OPTS adds O_DYNAMIC_JUSTIFY, O_NO_LEFT_STRIP, O_EDGE_INSERT_STAY, O_INPUT_LIMIT; the default field uses STD_FIELD_OPTS
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/ncurses-intro.html:2096-2097", "man/form_field_opts.3x:70-111", "form/fld_def.c:57"]
- **Quote:** Intro: 'By default, all options are on.' man/form_field_opts.3x: standard options 'all are on by default'; extension options 'are off by default'. default_field.opts is STD_FIELD_OPTS.
- **Earlier:** Matches the intro; the man page narrows 'all' to standard options, so confidence drops from high.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:2096-2097", "form/fld_def.c:39-57", "form/form.priv.h:151-161"]
- **Quote:** Intro: "By default, all options are on." default_field.opts = STD_FIELD_OPTS (O_VISIBLE|O_ACTIVE|O_PUBLIC|O_EDIT|O_WRAP|O_BLANK|O_AUTOSKIP|O_NULLOK|O_PASSOK|O_STATIC).
- **Earlier:** Intro statement matched the default_field initializer; extension bits outside STD_FIELD_OPTS are not part of the documented default set.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/ncurses-intro.html:2096-2097", "man/form_field_opts.3x:70", "man/form_field_opts.3x:111", "form/fld_def.c:57", "form/form.priv.h:151-161"]
- **Quote:** Man: standard field options are all on by default; extension options are off by default. default_field uses STD_FIELD_OPTS. Intro's "all options" accompanies the listed standard bits.
- **Earlier:** disagrees — extension options are off by default if "all" is read literally across every option bit


## L285 (batch 6)

- **Claim as printed:** ncurses is intended to be base-level conformant with the X/Open Curses standard ... almost all the features not directly concerned with wide characters and internationalization
- **Appears in (corrected edition — not evidence):** `docs/client-library/hints/compatibility.md` § xopen-curses-conformance
- **Original source:** Writing Programs with NCURSES, X/Open Curses Conformance
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`ncurses is intended to be base-level conformant with the X/Open Curses standard ... almost all the features not directly concerned with wide characters and internationalization` / now=`ncurses implements X/Open Curses Issue 7, including the wide-character functions in its wide-character library`
- **Errata checked / quote:** man/ncurses.3x (DESCRIPTION) / ncurses implements the interface described by X/Open Curses Issue 7.
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1396-1400", "ANNOUNCE (XSI/X/Open mentions via search context)"]
- **Quote:** ncurses-intro XSI Curses Conformance: 'intended to be base-level conformant with the XSI Curses standard from X/Open. Many extended-level features (in fact, almost all features not directly concerned with wide characters and internationalization) are also supported.'
- **Earlier:** Matches from the intro section alone.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1396-1400", "ANNOUNCE:448-450"]
- **Quote:** Intro: "intended to be base-level conformant with the XSI Curses standard from X/Open. Many extended-level features (in fact, almost all features not directly concerned with wide characters and internationalization) are also supported." ANNOUNCE: "base-level conformant with the X/Open Curses specification, XSI curses ... almost all EXTENDED features".
- **Earlier:** Intro alone already bore the claim out; ANNOUNCE used the same base-level / almost-all-extended framing.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/ncurses-intro.html:1396-1400", "ANNOUNCE:448-450"]
- **Quote:** Intro: base-level conformant with XSI Curses from X/Open; almost all non-wide/internationalization features also supported. ANNOUNCE: base-level conformant with X/Open Curses / XSI curses, BASE plus almost all EXTENDED features.
- **Earlier:** matches — intro conformance section alone


## L293 (batch 6)

- **Claim as printed:** ncurses also uses the parameter's absolute value as the number of lines to take, and the binding's Rip_Off_Lines routine relies on this.
- **Appears in (corrected edition — not evidence):** `docs/contributor/ada/implementation-details.md` § extended-ripoffline-usage
- **Original source:** This edition (Ada95 guide, commit e3fa730)
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`ncurses also uses the parameter's absolute value as the number of lines to take, and the binding's Rip_Off_Lines routine relies on this.` / now=`The public ripoffline() passes on only the sign; the internal _nc_ripoffline() uses the absolute value, and Rip_Off_Lines calls it directly`
- **Errata checked / quote:** ncurses/base/lib_set_term.c:650,774-782; Ada95/gen/terminal_interface-curses.adb.m4:2322-2332; doc/html/Ada95.html:297-301 / count = (rop->line < 0) ? -rop->line : rop->line; _nc_ripoffline (line < 0) ? -1 : 1; pragma Import (C, Ripoffline, "_nc_ripoffline"); ncurses has internally implemented it
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["ncurses/base/lib_set_term.c:650-661", "ncurses/base/lib_set_term.c:775-782", "Ada95/gen/terminal_interface-curses.ads.m4:1893-1896", "Ada95/gen/terminal_interface-curses.adb.m4:2322-2327", "man/curs_kernel.3x:243-255"]
- **Quote:** Public ripoffline() collapses the argument to ±1, but _nc_ripoffline stores the full value and later uses count = abs(line) when creating the ripped window. Ada Rip_Off_Lines imports _nc_ripoffline and documents that absolute value.
- **Earlier:** man/curs_kernel.3x alone (one line only) would suggest disagrees; _nc_ripoffline and the Ada binding confirm the claim.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["ncurses/base/lib_set_term.c:717-782", "Ada95/gen/terminal_interface-curses.ads.m4:1889-1896", "Ada95/gen/terminal_interface-curses.adb.m4:2322-2329", "man/curs_kernel.3x:232-255"]
- **Quote:** _nc_ripoffline stores `line` as given (count+sign). Public ripoffline collapses to ±1. Ada Rip_Off_Lines imports _nc_ripoffline and documents "Lines argument absolute value is the number of lines".
- **Earlier:** Ada comment alone supported the claim; C confirmed _nc_ripoffline keeps magnitude while the XSI wrapper does not.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["ncurses/base/lib_set_term.c:650", "ncurses/base/lib_set_term.c:745", "ncurses/base/lib_set_term.c:775-782", "Ada95/gen/terminal_interface-curses.ads.m4:1889-1896", "Ada95/gen/terminal_interface-curses.adb.m4:2322-2327"]
- **Quote:** Public ripoffline() forces ±1; _nc_ripoffline stores the full line count and setup uses abs(line) via (line < 0) ? -line : line. Ada Rip_Off_Lines imports _nc_ripoffline and documents that absolute-value extension.
- **Earlier:** disagrees — public ripoffline() alone only uses the sign


## L295 (batch 6)

- **Claim as printed:** This, for example, is where the AIX box1 capability gets translated to an acsc string.
- **Appears in (corrected edition — not evidence):** `docs/contributor/hackguide/terminfo-compiler.md` § source-form-translation
- **Original source:** A Hacker's Guide to NCURSES
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`This, for example, is where the AIX box1 capability gets translated to an acsc string.` / now=`The XENIX forms-drawing capabilities (G2 and the rest) are translated to acsc in parse_entry.c; acsc to box1 happens on output in dump_entry.c`
- **Errata checked / quote:** ncurses/tinfo/parse_entry.c:1035-1068; progs/dump_entry.c:1235; include/Caps:1011,1031 / Translate XENIX forms characters ... acsc string synthesized from XENIX capabilities; _nc_STRCPY(buffer, "box1=", ...)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:762-767", "ncurses/tinfo/parse_entry.c:1089-1114"]
- **Quote:** Hackguide points at parse_entry translation of AIX box1 to acsc. parse_entry.c: 'Translate AIX forms characters' from box_chars_1 into acs_chars with warning 'acsc string synthesized from AIX capabilities'.
- **Earlier:** Matches after hackguide; source confirms.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:763-767", "ncurses/tinfo/parse_entry.c:1111-1114"]
- **Quote:** hackguide: "where the AIX box1 capability get translated to an acsc string." parse_entry.c: "acsc string synthesized from AIX capabilities".
- **Earlier:** Hackguide already stated the translation; parse_entry.c confirmed the implementation.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:762-767", "include/Caps:1031", "ncurses/tinfo/parse_entry.c:1090-1113"]
- **Quote:** Caps maps box1 → box_chars_1. parse_entry synthesizes acs_chars from box_chars_1 and warns "acsc string synthesized from AIX capabilities".
- **Earlier:** matches — hackguide claim alone


## L296 (batch 6)

- **Claim as printed:** The tput and clear utilities just do an entry load followed by a tputs() of a selected capability.
- **Appears in (corrected edition — not evidence):** `docs/contributor/hackguide/other-utilities.md`
- **Original source:** A Hacker's Guide to NCURSES
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The tput and clear utilities just do an entry load followed by a tputs() of a selected capability.` / now=`clear also sends E3 when present, and tput also handles init and reset`
- **Errata checked / quote:** progs/clear_cmd.c:56-61; progs/tput.c:118-119,440-441 / tputs(clear_screen, ...); char *E3 = tigetstr(UserCap(E3)); my_init[] = "init"; my_reset[] = "reset"
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/hackguide.html:779-781", "progs/tput.c:463-464", "progs/clear_cmd.c:52-61"]
- **Quote:** Hackguide states that simplification. clear_cmd uses tputs(clear_screen, …) (and optional E3). tput calls setupterm then capability output — more than a single tputs, but the core path matches the description.
- **Earlier:** Hackguide alone would be high; reading tput.c shows more command handling, so medium.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["doc/html/hackguide.html:779-781", "progs/clear.c:103-105", "progs/clear_cmd.c:52-56", "progs/tput.c:463"]
- **Quote:** hackguide states that sentence. clear.c: setupterm then clear_cmd → tputs(clear_screen,...). tput.c uses setupterm similarly before emitting capabilities.
- **Earlier:** Hackguide matched; the utilities' setupterm/tputs flow agrees (clear also has scrollback extras).

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["doc/html/hackguide.html:779-781", "progs/clear.c:103-105", "progs/clear_cmd.c:52-61", "progs/tput.c:463-472"]
- **Quote:** clear: setupterm then tputs(clear_screen) (plus optional scrollback E3). tput: setupterm then capability output via tput_cmd/tputs helpers. Simplification is broadly accurate for the core path.
- **Earlier:** matches — hackguide statement alone


## L297 (batch 6)

- **Claim as printed:** and also interprets the contents of the $TERM environment variable
- **Appears in (corrected edition — not evidence):** `docs/contributor/install/installation-procedure.md` § step-2-run-configure
- **Original source:** INSTALL
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | disagrees` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`and also interprets the contents of the $TERM environment variable` / now=`the $TERMCAP environment variable`
- **Errata checked / quote:** INSTALL:177-181; ncurses/tinfo/read_termcap.c:804,994,1053 / will also interpret the contents of the $TERM environment variable; getenv("TERMCAP")
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:177-180"]
- **Quote:** INSTALL §2 with --enable-termcap: 'the library will search /etc/termcap before the terminfo database, and will also interpret the contents of the $TERM environment variable.'
- **Earlier:** Matches from INSTALL alone (in the enable-termcap paragraph).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:177-181"]
- **Quote:** INSTALL (with --enable-termcap): "the library will search /etc/termcap before the terminfo database, and will also interpret the contents of the $TERM environment variable."
- **Earlier:** INSTALL alone bore out the fragment in its documented configure context.

### Run 3

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["INSTALL:177-180", "INSTALL:802-805", "INSTALL:2332-2334", "ncurses/tinfo/read_termcap.c:804-818", "ncurses/tinfo/read_termcap.c:1017-1021"]
- **Quote:** INSTALL step 2 says $TERM, but --enable-termcap and BSD notes describe $TERMCAP. Code getenv("TERMCAP") and treats its contents as a file path or an entry (matched against TERM). It does not interpret the contents of $TERM as a capability blob.
- **Earlier:** matches — INSTALL:180 alone names $TERM


## L298 (batch 6)

- **Claim as printed:** $(prefix)/man: the manual pages
- **Appears in (corrected edition — not evidence):** `docs/contributor/install/installation-procedure.md` § step-1-choose-where-to-install
- **Original source:** INSTALL
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`$(prefix)/man: the manual pages` / now=`$(prefix)/share/man`
- **Errata checked / quote:** INSTALL:93; configure:176,186,691 / Under $(prefix)/man: the manual pages; datarootdir='${prefix}/share'; mandir='${datarootdir}/man'
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:86-93"]
- **Quote:** INSTALL: 'Under $(prefix)/man: the manual pages' among the install layout entries.
- **Earlier:** Matches from INSTALL alone.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:88-93"]
- **Quote:** INSTALL: "Under $(prefix)/man:       the manual pages"
- **Earlier:** Same install path and role; only the leading word "Under" differs.

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:87-93"]
- **Quote:** INSTALL installation layout: "Under $(prefix)/man:       the manual pages".
- **Earlier:** matches — INSTALL layout list alone


## L300 (batch 6)

- **Claim as printed:** The color pair is stored with the attributes, and the wide-character functions use the attr_t type and names such as attr_on().
- **Appears in (corrected edition — not evidence):** `docs/glossary/attribute.md`
- **Original source:** This edition (glossary, PR 53, commit df81beb)
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`The color pair is stored with the attributes, and the wide-character functions use the attr_t type and names such as attr_on().` / now=`The X/Open functions, such as attr_on() and attr_set(), and the wide-character functions use attr_t; attr_set() takes the pair separately`
- **Errata checked / quote:** include/curses.h.in:637-638; man/curs_attr.3x:56-57,87 / attr_on (attr_t, void *); /* generated */ (no WIDEC mark); attr_set (attr_t, NCURSES_PAIRS_T, void *)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_attr.3x:169-179", "man/curs_attr.3x:548-557", "man/curs_attr.3x:85-88"]
- **Quote:** COLOR_PAIR can be or'd into attributes; attr_t can hold a color pair in A_COLOR. Wide API includes attr_on/wattr_on taking attr_t.
- **Earlier:** Matches after curs_attr.3x.

### Run 2

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["man/curs_attr.3x:152-158", "man/curs_attr.3x:167-179", "man/curs_attr.3x:548-552"]
- **Quote:** curs_attr.3x: legacy APIs or color into the attribute via COLOR_PAIR/A_COLOR; newer names add an underscore (attr_on); "ncurses's attr_t can hold a color pair (in the A_COLOR field)".
- **Earlier:** Man page supports both halves; medium because attr_set also takes a separate pair argument alongside attr_t.

### Run 3

- **Verdict:** `matches` (medium confidence)
- **Opened:** ["man/curs_attr.3x:166-179", "man/curs_attr.3x:85-88", "man/curs_attr.3x:216-220"]
- **Quote:** Legacy attrs pack color via COLOR_PAIR/A_COLOR with other video attributes. Wide API uses attr_t and attr_on/attr_set (pair may be a separate argument in attr_set).
- **Earlier:** matches — COLOR_PAIR-or'd-into-attrs description in curs_attr


## L301 (batch 6)

- **Claim as printed:** most are named by adding _w to the 8-bit name, so waddch() becomes wadd_wch()
- **Appears in (corrected edition — not evidence):** `docs/glossary/wide-character-library.md`
- **Original source:** This edition (glossary, PR 53, commit df81beb)
- **Bo3 majority:** `matches` (unanimous) — votes: `matches | matches | matches` → {'matches': 3}
- **Recorded errata:** category=`edition-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`most are named by adding _w to the 8-bit name, so waddch() becomes wadd_wch()` / now=`most add w or _w: waddstr() becomes waddwstr() and waddch() becomes wadd_wch()`
- **Errata checked / quote:** include/curses.wide:195,199 / wadd_wch (WINDOW *,const cchar_t *); waddwstr (WINDOW *,const wchar_t *);
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/ncurses.3x:517-522"]
- **Quote:** man/ncurses.3x: where a non-wide name contains 'ch' or 'str', prefix with '_w'; example 'waddch becomes wadd_wch'.
- **Earlier:** Matches from ncurses.3x alone.

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["man/curs_add_wch.3x:49-63", "man/curs_addch.3x:1-60"]
- **Quote:** Wide API provides wadd_wch alongside waddch; the example naming pattern matches the headers/man pages.
- **Earlier:** The waddch→wadd_wch example alone matched; no counterexample needed for "most".

### Run 3

- **Verdict:** `matches` (high confidence)
- **Opened:** ["include/curses.wide:195", "man/curs_add_wch.3x:49-61"]
- **Quote:** Wide API: wadd_wch corresponds to waddch (insert _w into the 8-bit name). Same pattern for many add/get/ins/in routines in curses.wide.
- **Earlier:** matches — example waddch→wadd_wch alone


## L302 (batch 6)

- **Claim as printed:** the library searches /etc/termcap before the terminfo database
- **Appears in (corrected edition — not evidence):** `docs/contributor/install/installation-procedure.md` § step-2-run-configure
- **Original source:** INSTALL
- **Bo3 majority:** `matches` (majority) — votes: `matches | matches | disagrees` → {'matches': 2, 'disagrees': 1}
- **Recorded errata:** category=`original-error`, verdict=`matches`, confidence=`high`
- **Errata was → now:** was=`the library searches /etc/termcap before the terminfo database` / now=`after the terminfo database, when no terminfo entry is found`
- **Errata checked / quote:** INSTALL:177-180; include/term_entry.h:95-108; ncurses/tinfo/read_entry.c:946-958 / will search /etc/termcap before the terminfo database; dbdEnvOnce ... dbdCfgOnce (terminfo) come before dbdEnvOnce2, dbdEnvList2, dbdCfgList2 (termcap)
- **Expected meta verdict (from errata framing map):** `disagrees` — aligned=False

### Run 1

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:177-180"]
- **Quote:** INSTALL: with --enable-termcap, 'the library will search /etc/termcap before the terminfo database'.
- **Earlier:** Matches from INSTALL (enable-termcap context).

### Run 2

- **Verdict:** `matches` (high confidence)
- **Opened:** ["INSTALL:177-180"]
- **Quote:** INSTALL with --enable-termcap: "the library will search /etc/termcap before the terminfo database".
- **Earlier:** INSTALL is decisive for this configure-gated behavior.

### Run 3

- **Verdict:** `disagrees` (high confidence)
- **Opened:** ["INSTALL:177-180", "INSTALL:802-805", "ncurses/tinfo/read_entry.c:912-917", "ncurses/tinfo/read_entry.c:946-965"]
- **Quote:** INSTALL step 2 says "before", but --enable-termcap says "if no match is found in the terminfo database". Code: _nc_read_entry2 walks terminfo DBs first; termcap is a fallback after a failed terminfo read.
- **Earlier:** matches — INSTALL:179 alone says before the terminfo database


### 6.4 Other mismatches

**28** claims.

#### L10 Bo3=`can't tell` expected=`disagrees` errata=edition-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: Merging the guides split the `field_pad()` comment out of its code block; the stray fence turned the next paragraph and the Form Attributes heading into code
- Path: `docs/client-library/forms/fields.md`
- Opened: ["doc/html/ncurses-intro.html:2062-2075"]
- Quote: Primary intro keeps set_field_pad/field_pad inside one closed <pre class="code-block">, then a normal <p> and <h4> Field Option Bits. The merge/fence breakage is an edition claim; appears_in is not evidence, and the edition shard is outside allowed primary paths.

#### L28 Bo3=`disagrees` expected=`matches` errata=rejected/disagrees votes=['disagrees', 'matches', 'disagrees']
- Printed: The same 51-word paragraph is in curs_bkgd.3x:101 and curs_bkgrnd.3x:92, so one copy is an error
- Path: `man/curs_bkgd.3x`
- Opened: ["man/curs_bkgd.3x:101-104", "man/curs_bkgrnd.3x:92-95"]
- Quote: Both pages share the same 51-word background-attributes paragraph (narrow chtype vs wide cchar_t pages). Parallel standalone man pages for related APIs; duplication alone does not make one copy an error.

#### L29 Bo3=`disagrees` expected=`matches` errata=rejected/disagrees votes=['disagrees', 'matches', 'disagrees']
- Printed: The same 50-word paragraph is in curs_border.3x:228 and curs_clear.3x:117, so one copy is an error
- Path: `man/curs_border.3x`
- Opened: ["man/curs_border.3x:228-240", "man/curs_clear.3x:117-129"]
- Quote: Both PORTABILITY sections repeat the SVr4 immedok()/wrefresh return-value remark (SVID comments cite p. 483 vs p. 485). Same portability note about two different function sets is not an error.

#### L34 Bo3=`disagrees` expected=`matches` errata=rejected/disagrees votes=['disagrees', 'matches', 'disagrees']
- Printed: The same 25-word paragraph is in curs_bkgd.3x and curs_bkgrnd.3x (If the terminal does not support color …), so one copy is an error
- Path: `man/curs_bkgd.3x`
- Opened: ["man/curs_bkgd.3x:171-174", "man/curs_bkgrnd.3x:160-163"]
- Quote: Both: "If the terminal does not support color, or if color has not been initialized with start_color(3X), ncurses ignores the new background character's color pair selection." Same parallel narrow/wide pages as L28; not an error.

#### L35 Bo3=`can't tell` expected=`disagrees` errata=edition-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: The site's man pages showed literal `**` around page references and after italic words, e.g. `**curs_getch(3X),** **curs_variables(3X),** **wresize(3X)**`
- Path: `man/resizeterm.3x`
- Opened: ["man/resizeterm.3x:200-203"]
- Quote: Man SEE ALSO uses troff \fB…\fP markup, not literal asterisks. Whether the site build rendered literal ** is an edition/site claim; site/ is out of scope and was removed.

#### L36 Bo3=`can't tell` expected=`disagrees` errata=edition-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: The site showed the page as troff source because pandoc stopped at the table format `Lf(BI)`
- Path: `man/infocmp.1m`
- Opened: ["man/infocmp.1m:205-208"]
- Quote: infocmp.1m table format line is "Lf(BI) Lf(BI) L" (valid tbl). Whether pandoc failed and the site showed raw troff is not settled: site/ removed, pandoc not available in this run.

#### L37 Bo3=`can't tell` expected=`disagrees` errata=edition-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: The site showed the page as troff source because pandoc stopped at a table cell continued with a trailing backslash, and the backticks in troff's quote strings closed the fallback's code fence early
- Path: `man/curs_terminfo.3x`
- Opened: ["man/curs_terminfo.3x:1083-1086"]
- Quote: curs_terminfo.3x has a tbl cell continued with a trailing backslash after \*(``out of \fIcurses\fP\*(''\ and backtick-like troff quotes. Site rendering and pandoc failure are not verified here (site/ removed; no pandoc).

#### L38 Bo3=`can't tell` expected=`disagrees` errata=edition-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: In the runnable examples the cursor blinked white and black inside a blue form field
- Path: `site/src/components/run-example.ts`
- Opened: []
- Quote: Claim targets site/src/components/run-example.ts and a reader-visible terminal theme. site/ was removed and is outside primary evidence; nothing opened settles the blink colors.

#### L169 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'disagrees', 'superseded']
- Printed: Ncurses supports up 16 colors, unlike SVr4 curses which defines only 8. While most terminals which provide color allow only 8 colors, about a quarter (including XFree86 xterm) support 16 colors.
- Path: `docs/client-library/hints/extensions.md`
- Opened: doc/html/ncurses-intro.html:1305-1308; man/curs_color.3x:233-235; misc/terminfo.src:1223,4669
- Quote: COLORS is max_colors from the terminal; terminfo entries use colors#0x100 and higher. "up 16" is neither grammatical nor a current ceiling.

#### L174 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", 'disagrees']
- Printed: mvprintw(24, 0, "Press F1 to Exit")
- Path: `docs/client-library/more/hanoi.md`
- Opened: doc/html/NCURSES-Programming-HOWTO.html:7478-7488
- Quote: HOWTO only cites JustForFun/hanoi.c; that example source is not in primary-evidence paths (ncurses/, man/, doc/html/, etc.).

#### L175 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", 'disagrees']
- Printed: mvprintw(24, 0, ...) for "Press F1 to Exit" and "You Win !!!"
- Path: `docs/client-library/more/shuffle.md`
- Opened: doc/html/NCURSES-Programming-HOWTO.html:7512-7519
- Quote: HOWTO only cites JustForFun/shuffle.c; example source not in primary-evidence paths.

#### L176 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", 'disagrees']
- Printed: #define STATUSY 25
- Path: `docs/client-library/more/typing-tutor.md`
- Opened: doc/html/NCURSES-Programming-HOWTO.html:7525-7535
- Quote: HOWTO only cites JustForFun/tt.c; example source not in primary-evidence paths.

#### L177 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", 'matches']
- Printed: #define KEY_F1 265
- Path: `docs/client-library/more/typing-tutor.md`
- Opened: doc/html/NCURSES-Programming-HOWTO.html:7525-7535; include/Caps:433-434; doc/html/ada/terminal_interface-curses_constants__ads.htm:129
- Quote: KEY_F(0) is 0410 octal (264); KEY_F(1) is 265, and Ada constants use 265. The typing-tutor #define line itself is not in primary-evidence example sources.

#### L178 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: http://www2.linuxjournal.com/lj-issues/issue5/2807.html
- Path: `docs/client-library/more/widget-libraries.md`
- Opened: doc/html/NCURSES-Programming-HOWTO.html:7337-7340
- Quote: HOWTO embeds that URL; whether the link resolves is outside the repository.

#### L179 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: Curses::Form, from the CPAN All Modules page
- Path: `docs/client-library/more/widget-libraries.md`
- Opened: doc/html/NCURSES-Programming-HOWTO.html:7385-7390
- Quote: HOWTO asserts Curses::Form on CPAN; CPAN contents are outside the repository.

#### L199 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: This is a majordomo list
- Path: `docs/contributor/hackguide/reporting-bugs.md`
- Opened: doc/html/hackguide.html:252-257; ANNOUNCE:660-670
- Quote: Hackguide calls bug-ncurses a majordomo list; ANNOUNCE documents the same request address without naming majordomo. List software is outside the repo.

#### L204 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'superseded', 'superseded']
- Printed: `lib_doupdate.c`
- Path: `docs/contributor/hackguide/engine-room.md`
- Opened: doc/html/hackguide.html:468-469,578-602; ncurses/tty/tty_update.c:39-41,94; ncurses/modules:116
- Quote: Hackguide refers to lib_doupdate.c; modules build tty_update, whose file header still comments "lib_doupdate.c".

#### L205 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'superseded', 'missing']
- Printed: `_nc_mvcur_scrolln()` in `lib_mvcur.c`
- Path: `docs/contributor/hackguide/engine-room.md`
- Opened: doc/html/hackguide.html:595-598; NEWS:14734,15064; ncurses/tty/tty_update.c:2022-2035; ncurses/tty/hardscroll.c:250-254
- Quote: NEWS: renamed _nc_mvcur_scrolln to _nc_scrolln and moved it out of lib_mvcur.c into lib_doupdate.c (now tty_update.c). hardscroll calls _nc_scrolln.

#### L213 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'superseded', 'disagrees']
- Printed: `lib_insstr.c`
- Path: `docs/contributor/hackguide/porting-hints.md`
- Opened: ["doc/html/hackguide.html:828-829", "ncurses/base/ (no lib_insstr.c; has lib_insnstr.c, lib_insch.c)", "NEWS:10750-10752"]
- Quote: hackguide lists lib_insstr.c among pure-curses modules. NEWS 20021102: 'rewrote lib_insch.c, combining it with lib_insstr.c'. No lib_insstr.c remains in ncurses/base/.

#### L214 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'superseded', 'disagrees']
- Printed: `lib_unctrl.c`
- Path: `docs/contributor/hackguide/porting-hints.md`
- Opened: ["doc/html/hackguide.html:832", "ncurses/Makefile.in:180", "ncurses/Makefile.in:315-316", "ncurses/base/MKunctrl.awk", "NEWS:15168-15170"]
- Quote: hackguide lists lib_unctrl.c. NEWS 970426: 'drop ncurses/lib_unctrl.c, add ncurses/MKunctrl.awk'. Build generates ./unctrl.c from MKunctrl.awk; no lib_unctrl.c source.

#### L225 Bo3=`missing` expected=`disagrees` errata=original-error/matches votes=['missing', 'missing', 'disagrees']
- Printed: read the PORTABILITY section in the file ncurses/README
- Path: `docs/contributor/install/installation-procedure.md`
- Opened: ["INSTALL:115-117", "ncurses/README (full file; 51 lines)"]
- Quote: INSTALL:115-117 tells readers to 'read the PORTABILITY section in the file ncurses/README'. ncurses/README has no PORTABILITY section; it points to hackguide.html and describes llib-lXXXX files.

#### L241 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=['matches', "can't tell", "can't tell"]
- Printed: To subscribe send mail to bug-ncurses-request@gnu.org with body that reads: subscribe ncurses <your-email-address-here>
- Path: `docs/contributor/install/bug-reports.md`
- Opened: ["INSTALL:2584-2588", "announce.html.in:1722-1730"]
- Quote: INSTALL: subscribe ncurses <your-email-address-here>. / announce.html.in: subscribe <name>@<host.domain>. Actual list-server syntax is not verifiable inside the repo.

#### L247 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'superseded', 'superseded']
- Printed: I provide no functions to switch on/off curses tracing options.
- Path: `docs/contributor/ada/limitations.md`
- Opened: ["doc/html/Ada95.html:105-106", "Ada95/gen/terminal_interface-curses-trace.ads.m4:114-115", "Ada95/src/terminal_interface-curses-trace.adb_p:49-54", "Ada95/src/Makefile.in:124-142"]
- Quote: Ada95.html Limitations still says 'I provide no functions to switch on/off curses tracing options.' The binding now has Terminal_Interface.Curses.Trace.Trace_On and builds terminal_interface-curses-trace.

#### L249 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'superseded', 'disagrees']
- Printed: Support for wide characters is currently not in the binding, as it is not really in ncurses at this point in time.
- Path: `docs/contributor/ada/index.md`
- Opened: ["doc/html/Ada95.html:92-94", "Ada95/src/ and Ada95/gen/ (no wide-character packages; no add_wch/get_wch binding hits)", "include/curses.wide", "NEWS (many wide-character entries)"]
- Quote: Ada95.html still asserts no wide support in the binding 'as it is not really in ncurses'. Ncurses has wide-character support (curses.wide, widec history in NEWS). No Ada wide-character API packages found, but the 'not really in ncurses' reason is false.

#### L258 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: Patches to the current release are made available at https://invisible-island.net/archives/ncurses/6.5/
- Path: `docs/contributor/announce/development.md`
- Opened: ["announce.html.in:1744-1751", "ANNOUNCE (development/patches discussion)"]
- Quote: announce.html.in prints that patches URL. Whether the remote archive exists/serves patches is outside-repo-only.

#### L259 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=['matches', "can't tell", "can't tell"]
- Printed: To join the ncurses mailing list, please write email to bug-ncurses-request@gnu.org containing the line: subscribe <name>@<host.domain>
- Path: `docs/contributor/announce/development.md`
- Opened: ["announce.html.in:1720-1730", "INSTALL:2584-2588"]
- Quote: announce: subscribe <name>@<host.domain>. / INSTALL instead: subscribe ncurses <your-email-address-here>. Actual list-server syntax not verifiable in-repo.

#### L279 Bo3=`superseded` expected=`disagrees` errata=original-error/matches votes=['superseded', 'superseded', 'superseded']
- Printed: Each field structure contains one character pointer slot ... The (char *) type is retained for System V compatibility
- Path: `docs/client-library/forms/field-options.md`
- Opened: ["doc/html/ncurses-intro.html:2212-2224", "man/form_field_userptr.3x:40-41", "form/fld_user.c:40-48"]
- Quote: Intro still shows char *userptr and says '(char *) type is retained for System V compatibility.' Current man and fld_user.c use void *userptr / void *usrptr.

#### L286 Bo3=`can't tell` expected=`disagrees` errata=original-error/matches votes=["can't tell", "can't tell", "can't tell"]
- Printed: Slide the tiles with the arrow keys until they're in order
- Path: `docs/client-library/more/shuffle.md`
- Opened: ["doc/html/NCURSES-Programming-HOWTO.html:7512-7519"]
- Quote: HOWTO Shuffle section only says 'A fun game, if you have time to kill' and cites JustForFun/shuffle.c. No shuffle.c appears under primary evidence paths (ncurses/,form/,menu/,panel/,progs/,include/,Ada95/,c++/,misc/,man/,doc/html/, INSTALL/NEWS/README/ANNOUNCE).

---

## 7. Uncertain majorities (`can't tell` / `superseded` / `missing`)

**25** claims. Prefer leaving errata as-is unless you have new primary evidence.

### L10 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: Merging the guides split the `field_pad()` comment out of its code block; the stray fence turned the next paragraph and the Form Attributes heading into code
- Path: `docs/client-library/forms/fields.md`
- Why (from a `can't tell` run): opened=["doc/html/ncurses-intro.html:2062-2075"]; earlier=From intro alone the field_pad listing looks fine; settling the edition merge needs the edition markdown, which is not primary evidence.

### L35 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: The site's man pages showed literal `**` around page references and after italic words, e.g. `**curs_getch(3X),** **curs_variables(3X),** **wresize(3X)**`
- Path: `man/resizeterm.3x`
- Why (from a `can't tell` run): opened=["man/resizeterm.3x:200-203"]; earlier=From the man source alone there are no literal **; only a pandoc/site run would settle the rendering claim.

### L36 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: The site showed the page as troff source because pandoc stopped at the table format `Lf(BI)`
- Path: `man/infocmp.1m`
- Why (from a `can't tell` run): opened=["man/infocmp.1m:205-208"]; earlier=Seeing Lf(BI) in the man page suggests a converter trigger, but not what the site displayed.

### L37 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: The site showed the page as troff source because pandoc stopped at a table cell continued with a trailing backslash, and the backticks in troff's quote strings closed the fallback's code fence early
- Path: `man/curs_terminfo.3x`
- Why (from a `can't tell` run): opened=["man/curs_terminfo.3x:1083-1086"]; earlier=The continued line and quotes are in the man source; that alone does not prove the site showed troff.

### L38 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: In the runnable examples the cursor blinked white and black inside a blue form field
- Path: `site/src/components/run-example.ts`
- Why (from a `can't tell` run): opened=[]; earlier=

### L169 → `superseded` votes ['superseded', 'disagrees', 'superseded']
- Printed: Ncurses supports up 16 colors, unlike SVr4 curses which defines only 8. While most terminals which provide color allow only 8 colors, about a quarter (including XFree86 xterm) support 16 colors.
- Path: `docs/client-library/hints/extensions.md`
- Why (from a `superseded` run): opened=doc/html/ncurses-intro.html:1305-1308; man/curs_color.3x:233-235; misc/terminfo.src:1223,4669; earlier=matches (intro as historical 16-color extension vs SVr4's 8)

### L174 → `can't tell` votes ["can't tell", "can't tell", 'disagrees']
- Printed: mvprintw(24, 0, "Press F1 to Exit")
- Path: `docs/client-library/more/hanoi.md`
- Why (from a `can't tell` run): opened=doc/html/NCURSES-Programming-HOWTO.html:7478-7488; earlier=can't tell (no example source under allowed paths)

### L175 → `can't tell` votes ["can't tell", "can't tell", 'disagrees']
- Printed: mvprintw(24, 0, ...) for "Press F1 to Exit" and "You Win !!!"
- Path: `docs/client-library/more/shuffle.md`
- Why (from a `can't tell` run): opened=doc/html/NCURSES-Programming-HOWTO.html:7512-7519; earlier=can't tell

### L176 → `can't tell` votes ["can't tell", "can't tell", 'disagrees']
- Printed: #define STATUSY 25
- Path: `docs/client-library/more/typing-tutor.md`
- Why (from a `can't tell` run): opened=doc/html/NCURSES-Programming-HOWTO.html:7525-7535; earlier=can't tell

### L177 → `can't tell` votes ["can't tell", "can't tell", 'matches']
- Printed: #define KEY_F1 265
- Path: `docs/client-library/more/typing-tutor.md`
- Why (from a `can't tell` run): opened=doc/html/NCURSES-Programming-HOWTO.html:7525-7535; include/Caps:433-434; doc/html/ada/terminal_interface-curses_constants__ads.htm:129; earlier=matches (265 equals KEY_F(1) in Caps/Ada) without proving the example printed that define

### L178 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: http://www2.linuxjournal.com/lj-issues/issue5/2807.html
- Path: `docs/client-library/more/widget-libraries.md`
- Why (from a `can't tell` run): opened=doc/html/NCURSES-Programming-HOWTO.html:7337-7340; earlier=can't tell (URL liveness needs the network/host)

### L179 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: Curses::Form, from the CPAN All Modules page
- Path: `docs/client-library/more/widget-libraries.md`
- Why (from a `can't tell` run): opened=doc/html/NCURSES-Programming-HOWTO.html:7385-7390; earlier=can't tell

### L199 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: This is a majordomo list
- Path: `docs/contributor/hackguide/reporting-bugs.md`
- Why (from a `can't tell` run): opened=doc/html/hackguide.html:252-257; ANNOUNCE:660-670; earlier=matches (hackguide assertion alone)

### L204 → `superseded` votes ['superseded', 'superseded', 'superseded']
- Printed: `lib_doupdate.c`
- Path: `docs/contributor/hackguide/engine-room.md`
- Why (from a `superseded` run): opened=doc/html/hackguide.html:468-469,578-602; ncurses/tty/tty_update.c:39-41,94; ncurses/modules:116; earlier=matches (hackguide/module comment name); filesystem/modules use tty_update.c

### L205 → `superseded` votes ['superseded', 'superseded', 'missing']
- Printed: `_nc_mvcur_scrolln()` in `lib_mvcur.c`
- Path: `docs/contributor/hackguide/engine-room.md`
- Why (from a `superseded` run): opened=doc/html/hackguide.html:595-598; NEWS:14734,15064; ncurses/tty/tty_update.c:2022-2035; ncurses/tty/hardscroll.c:250-254; earlier=matches (hackguide alone); NEWS and current sources show rename/move

### L213 → `superseded` votes ['superseded', 'superseded', 'disagrees']
- Printed: `lib_insstr.c`
- Path: `docs/contributor/hackguide/porting-hints.md`
- Why (from a `superseded` run): opened=["doc/html/hackguide.html:828-829", "ncurses/base/ (no lib_insstr.c; has lib_insnstr.c, lib_insch.c)", "NEWS:10750-10752"]; earlier=Absence of the file alone would have been missing; NEWS established the merge.

### L214 → `superseded` votes ['superseded', 'superseded', 'disagrees']
- Printed: `lib_unctrl.c`
- Path: `docs/contributor/hackguide/porting-hints.md`
- Why (from a `superseded` run): opened=["doc/html/hackguide.html:832", "ncurses/Makefile.in:180", "ncurses/Makefile.in:315-316", "ncurses/base/MKunctrl.awk", "NEWS:15168-15170"]; earlier=File absence alone would have been missing; NEWS/Makefile showed the awk replacement.

### L225 → `missing` votes ['missing', 'missing', 'disagrees']
- Printed: read the PORTABILITY section in the file ncurses/README
- Path: `docs/contributor/install/installation-procedure.md`
- Why (from a `missing` run): opened=["INSTALL:115-117", "ncurses/README (full file; 51 lines)"]; earlier=INSTALL alone would have looked like matches; opening ncurses/README showed the section is absent.

### L241 → `can't tell` votes ['matches', "can't tell", "can't tell"]
- Printed: To subscribe send mail to bug-ncurses-request@gnu.org with body that reads: subscribe ncurses <your-email-address-here>
- Path: `docs/contributor/install/bug-reports.md`
- Why (from a `can't tell` run): opened=["INSTALL:2584-2588", "announce.html.in:1722-1730"]; earlier=matches — INSTALL prints that subscribe body

### L247 → `superseded` votes ['superseded', 'superseded', 'superseded']
- Printed: I provide no functions to switch on/off curses tracing options.
- Path: `docs/contributor/ada/limitations.md`
- Why (from a `superseded` run): opened=["doc/html/Ada95.html:105-106", "Ada95/gen/terminal_interface-curses-trace.ads.m4:114-115", "Ada95/src/terminal_interface-curses-trace.adb_p:49-54", "Ada95/src/Makefile.in:124-142"]; earlier=Ada95.html alone would have been matches; the Trace package shows the limitation is outdated.

### L249 → `superseded` votes ['superseded', 'superseded', 'disagrees']
- Printed: Support for wide characters is currently not in the binding, as it is not really in ncurses at this point in time.
- Path: `docs/contributor/ada/index.md`
- Why (from a `superseded` run): opened=["doc/html/Ada95.html:92-94", "Ada95/src/ and Ada95/gen/ (no wide-character packages; no add_wch/get_wch binding hits)", "include/curses.wide", "NEWS (many wide-character entries)"]; earlier=HTML alone would have matched; ncurses wide support makes the compound claim outdated.

### L258 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: Patches to the current release are made available at https://invisible-island.net/archives/ncurses/6.5/
- Path: `docs/contributor/announce/development.md`
- Why (from a `can't tell` run): opened=["announce.html.in:1744-1751", "ANNOUNCE (development/patches discussion)"]; earlier=Same: text is in-tree; remote content is not primary evidence.

### L259 → `can't tell` votes ['matches', "can't tell", "can't tell"]
- Printed: To join the ncurses mailing list, please write email to bug-ncurses-request@gnu.org containing the line: subscribe <name>@<host.domain>
- Path: `docs/contributor/announce/development.md`
- Why (from a `can't tell` run): opened=["announce.html.in:1720-1730", "INSTALL:2584-2588"]; earlier=matches — announce.html.in prints that subscribe line

### L279 → `superseded` votes ['superseded', 'superseded', 'superseded']
- Printed: Each field structure contains one character pointer slot ... The (char *) type is retained for System V compatibility
- Path: `docs/client-library/forms/field-options.md`
- Why (from a `superseded` run): opened=["doc/html/ncurses-intro.html:2212-2224", "man/form_field_userptr.3x:40-41", "form/fld_user.c:40-48"]; earlier=Intro alone would match; headers/man show the retained char* claim is outdated.

### L286 → `can't tell` votes ["can't tell", "can't tell", "can't tell"]
- Printed: Slide the tiles with the arrow keys until they're in order
- Path: `docs/client-library/more/shuffle.md`
- Why (from a `can't tell` run): opened=["doc/html/NCURSES-Programming-HOWTO.html:7512-7519"]; earlier=Missing sample would have been 'missing'; without the program source the tile-sliding instructions cannot be checked.

---

## 8. Alignments (Bo3 agrees with errata mapping)

**76** claims — independent confirmation. Listed compactly; full cards are in `runs/`.

| Id | Bo3 | Votes | Category | Path |
| --- | --- | --- | --- | --- |
| L30 | `matches` | matches/matches/matches | rejected | `man/term.5` |
| L47 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/menus/menu-display.md` |
| L65 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/overview.md` |
| L66 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/input-and-stdscr.md` |
| L67 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/hiding.md` |
| L68 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/hiding.md` |
| L70 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/hiding.md` |
| L71 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/browsing.md` |
| L74 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/overview.md` |
| L75 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/panels/hiding.md` |
| L81 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/getting-started/initialization.md` |
| L82 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/getting-started/hello-world.md` |
| L83 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/getting-started/hello-world.md` |
| L85 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/getting-started/hello-world.md` |
| L86 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/getting-started/naming-and-variables.md` |
| L88 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/getting-started/naming-and-variables.md` |
| L89 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/getting-started/initialization.md` |
| L90 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/getting-started/history.md` |
| L96 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/windows/border-functions.md` |
| L98 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/windows/creating-windows.md` |
| L102 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/output/forms-characters.md` |
| L105 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/output/` |
| L111 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/windows/border-functions.md` |
| L115 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/input/characters-and-strings.md` |
| L116 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/input/characters-and-strings.md` |
| L117 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/input/` |
| L121 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/attributes/colors.md` |
| L122 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/attributes/attribute-functions.md` |
| L123 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/attributes/chgat.md` |
| L124 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/attributes/attributes.md` |
| L125 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/attributes/` |
| L129 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/keyboard/key-usage-example.md` |
| L130 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/keyboard/key-usage-example.md` |
| L131 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/keyboard/` |
| L135 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/mouse/mouse-events.md` |
| L137 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/mouse/mouse-menu-example.md` |
| L138 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/mouse/mouse-menu-example.md` |
| L139 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/mouse/mouse-events.md` |
| L140 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/mouse/` |
| L146 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/screen/coordinates.md` |
| L155 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/init-and-debugging/terminal-descriptions.md` |
| L160 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/init-and-debugging/initialization-and-wrapup.md` |
| L161 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/init-and-debugging/debugging.md` |
| L164 | `disagrees` | disagrees/matches/disagrees | original-error | `docs/client-library/hints/resizing.md` |
| L167 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/hints/resizing.md` |
| L168 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/hints/terminals.md` |
| L194 | `disagrees` | disagrees/disagrees/matches | edition-error | `site/src/content/docs/index.mdx` |
| L196 | `disagrees` | disagrees/disagrees/matches | edition-error | `site/src/content/docs/credits.md` |
| L198 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/hackguide/objective.md` |
| L201 | `disagrees` | superseded/disagrees/disagrees | original-error | `docs/contributor/hackguide/reporting-bugs.md` |
| L206 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/hackguide/engine-room.md` |
| L207 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/hackguide/engine-room.md` |
| L209 | `disagrees` | missing/disagrees/disagrees | original-error | `docs/contributor/hackguide/terminfo-compiler.md` |
| L210 | `disagrees` | missing/disagrees/disagrees | original-error | `docs/contributor/hackguide/style-tips.md` |
| L211 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/hackguide/style-tips.md` |
| L212 | `disagrees` | superseded/disagrees/disagrees | original-error | `docs/contributor/hackguide/porting-hints.md` |
| L223 | `disagrees` | can't tell/disagrees/disagrees | original-error | `docs/contributor/install/installation-procedure.md` |
| L224 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/contributor/install/installation-procedure.md` |
| L229 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/install/configure-options/with-m-z.md` |
| L232 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/contributor/install/system-integrators.md` |
| L233 | `disagrees` | missing/disagrees/disagrees | original-error | `docs/contributor/install/system-integrators.md` |
| L235 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/contributor/install/bsd-conversion.md` |
| L243 | `disagrees` | can't tell/disagrees/disagrees | original-error | `docs/contributor/install/mingw.md` |
| L248 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/ada/index.md` |
| L250 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/ada/implementation-details.md` |
| L257 | `disagrees` | can't tell/disagrees/disagrees | original-error | `docs/contributor/announce/program-improvements.md` |
| L260 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/contributor/announce/portability.md` |
| L264 | `disagrees` | matches/disagrees/disagrees | original-error | `docs/client-library/getting-started/introduction.md` |
| L274 | `disagrees` | disagrees/matches/disagrees | original-error | `docs/client-library/attributes/chgat.md` |
| L277 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/forms/fields.md` |
| L280 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/forms/field-options.md` |
| L281 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/forms/form-driver.md` |
| L282 | `disagrees` | disagrees/disagrees/matches | original-error | `docs/client-library/forms/form-driver.md` |
| L283 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/forms/form-driver.md` |
| L284 | `disagrees` | disagrees/disagrees/disagrees | original-error | `docs/client-library/forms/hooks-and-form-options.md` |
| L294 | `disagrees` | disagrees/matches/disagrees | original-error | `docs/contributor/hackguide/terminfo-compiler.md` |

---

## 9. Usage / budget notes

Expanded usage schema; most token/cost fields are `null` — **do not estimate**. Every official run lists `merlon-docs` under `skills`.

| Batch | Run | Status | Model | toolCalls | Started | Finished |
| ---: | ---: | --- | --- | ---: | --- | --- |
| 1 | 1 | completed | None | 38 | 2026-11-15T19:11:46Z | 2026-11-15T19:18:47Z |
| 1 | 2 | completed | None | 61 | 2026-11-15T18:54:08Z | 2026-11-15T19:16:30Z |
| 1 | 3 | completed | None | 76 | 2026-11-15T19:11:20Z | 2026-11-15T19:15:10Z |
| 2 | 1 | completed | None | 88 | 2026-11-15T18:53:53Z | 2026-11-15T19:17:10Z |
| 2 | 2 | completed | Composer | 94 | 2026-11-15T19:10:30Z | 2026-11-15T19:17:28Z |
| 2 | 3 | completed | Composer | 89 | 2026-11-15T19:11:05Z | 2026-11-15T19:17:50Z |
| 3 | 1 | completed | Composer | 77 | 2026-11-15T19:11:17Z | 2026-11-15T19:17:35Z |
| 3 | 2 | completed | Composer | 82 | 2026-11-15T19:11:29Z | 2026-11-15T19:15:48Z |
| 3 | 3 | completed | None | 103 | 2026-11-15T19:11:00Z | 2026-11-15T19:16:30Z |
| 4 | 1 | completed | Composer | 95 | 2026-11-15T19:11:10Z | 2026-11-15T19:15:42Z |
| 4 | 2 | completed | None | 98 | 2026-11-15T18:54:13Z | 2026-11-15T19:15:10Z |
| 4 | 3 | completed | Composer | 92 | 2026-11-15T19:11:52Z | 2026-11-15T19:17:26Z |
| 5 | 1 | completed | None | 98 | 2026-11-15T19:10:49Z | 2026-11-15T19:17:00Z |
| 5 | 2 | completed | None | 33 | 2026-11-15T18:54:08Z | 2026-11-15T19:13:10Z |
| 5 | 3 | completed | Composer | 33 | 2026-11-15T19:11:37Z | 2026-11-15T19:14:00Z |
| 6 | 1 | completed | Composer | 79 | 2026-11-15T19:10:50Z | 2026-11-15T19:16:13Z |
| 6 | 2 | completed | Composer | 72 | 2026-11-15T19:11:18Z | 2026-11-15T19:15:27Z |
| 6 | 3 | completed | Composer | 126 | 2026-11-15T19:11:26Z | 2026-11-15T19:17:20Z |

---

## 10. Action checklist for the receiving agent

- [ ] Read §2 framing before interpreting any `matches`/`disagrees`.
- [ ] Resolve §4 splits with fresh primary evidence; update or leave errata explicitly.
- [ ] For each §6.3 cluster item: either (a) defend the errata row with a better quote, or (b) move to `rejected` with meta evidence cited.
- [ ] For §5 aligned `disagrees`: ensure `now` text and commits still match; no silent regressions.
- [ ] For §7 uncertain: no silent closes; keep open/can't-tell honest.
- [ ] Append Lessons learned: Claude failed run + this Cursor outside run path/times.
- [ ] Add budget line from usage files (nulls stay null).
- [ ] Do not treat the pre-skill quarantined wave as authoritative (it is not in this tree).

---

## Appendix A — Machine-readable siblings

All under `docs/appendix/meta-verification/`:

- `findings/bo3-summary.csv`
- `findings/bo3-votes.json`
- `findings/splits.json`
- `findings/mismatches-vs-errata.json`
- `findings/bo3-disagrees.json` / `bo3-matches.json` / `bo3-uncertain-or-split.json`
- `findings/official-complete.json` / `findings/agent-roster-merlon.json` / `findings/batch-manifest.json`
- `runs/` — eighteen card files and eighteen usage files
- `inputs/` — the six batch inputs
