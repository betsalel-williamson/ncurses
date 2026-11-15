# Lessons learned

Mistakes made while moving the ncurses documentation to this site, what caused each one, and what now catches it. The [errata](index.md) list what changed in the text. This page lists what went wrong in the work itself, so the next migration step doesn't repeat it.

## Diagnose from the output, not the source

The manual pages showed stray `**` around page references, for example in the SEE ALSO section of `resizeterm(3X)`. The first diagnosis blamed the step that turns page references into links, because the asterisks sat next to links. That was a guess from reading the sync script, made before opening the generated Markdown. The generated Markdown showed the real cause: the asterisks were there before any link was added.

**Lesson:** before naming a cause, open the artifact at each stage (the troff source, pandoc's Markdown, the built HTML) and find the first stage where the fault appears.

**Guard:** `site/scripts/check-rendered.mjs` runs after every site build and fails it when a page shows `**` or a written-out `<strong>` or `<em>` tag as text outside code. On the site as it was before the fix it reports 1491 places.

## Two converters, two sets of rules

Two separate faults produced the asterisks:

- troff's `\fP` returns to the previous font. pandoc's man reader tracks that font wrongly, so `\fBname\fP` inside italic text left bold running on. The sync step now resolves each `\fP` to the font it returns to before pandoc reads the page.
- GitHub Flavored Markdown can't close emphasis that starts or ends with a space, or that has punctuation at its edge with a letter outside it. pandoc writes such emphasis anyway, and the reader sees the asterisks. A pandoc filter, `site/scripts/man-inlines.lua`, moves the spaces outside the emphasis and writes HTML tags where Markdown can't delimit it.

**Lesson:** a conversion chain has a failure mode at each link. Check that each converter's output is valid input for the next, not only that each one runs without an error.

## A fallback hides the failure it handles

When pandoc can't read a page, the site shows the troff source with a caution. Two pages, `infocmp(1M)` and `curs_terminfo(3X)`, were shown that way from the start, and nobody asked why until a reader did. Neither page is wrong. Each uses troff that pandoc 3.1 doesn't parse: a table font written `f(BI)`, and a table cell continued onto the next line with a trailing backslash. The sync step now rewrites both into forms pandoc reads and that mean the same in troff.

The fallback was itself broken. It wrapped the source in a fence of three backticks, and troff's quote strings contain backticks, so the fence closed early on `curs_terminfo(3X)`. It now uses a fence longer than any run of backticks in the page.

**Lesson:** treat a fallback as a defect report, not a resolution. Count the fallbacks, look at what they render, and fix the causes.

**Guard:** the sync step prints the pages it shows as source. Today there are none.

## A hand-written list drifts

The runnable examples came from a list in `site/examples/examples.json`. It named the two programs in the fields chapter and none of the other three, so readers couldn't tell why some listings had a Run button and others didn't.

**Lesson:** derive a list from the content it describes. When something can't be derived, record that it was left out and why, where a reader sees it.

**Guard:** the build now finds every C listing that defines `main()`, builds each one, and runs it in Node: the program must draw, wait for a key, and exit with status 0 on F1. A program that doesn't compile, link, or run gets a notice on its page with its build log, a warning on its shard in CI, and a line in the job summary.

## Check a visual fix by looking at it

The example terminal's cursor blinked white and black inside a blue form field, where it should blink white and blue. The first fix set the cursor colors in the terminal theme. Sampling the cell's pixels in both blink phases showed that it changed nothing. The cause was in xterm.js's DOM renderer, which paints a blinking block cursor's off phase with the page background, not the cell's own. The terminal now uses xterm.js's WebGL renderer, and the sampled colors are white and blue.

**Lesson:** for anything a reader sees, measure the rendered result in a browser before and after the change.

## A survey's findings are claims to check

An early survey of the manual pages reported two references to `tic(1)` and `infocmp(1)`, which should be section 1M. Checking every reference found seven in six pages. The survey had searched for the program names, and five of the references are written with the autoconf placeholders `@TIC@` and `@INFOCMP@`, which the build fills in. The same survey listed repeated paragraphs and repeated titles as errors. Checking them showed parallel narrow-character and wide-character pages that share text on purpose. Those findings moved to `rejected`.

**Lesson:** a finding is a claim about a document. Before acting on it, open what it cites, quote it, and give a verdict, as the [five-step check](index.md) describes.

**Guard:** `site/scripts/errata.mjs` fails the build when a row that claims an error is missing the five-step fields, or when an error row's verdict isn't `matches`.

## Don't let a check read its own opt-out from free text

The workflow first let a pull request skip the errata requirement with a phrase in its description. A description that explained the opt-out contained the phrase, so the check skipped itself on the pull request that added it. The opt-out is now the `no-errata` label.

**Lesson:** an opt-out should be a deliberate action, such as a label, not a pattern that ordinary text can match.

## Check the branch before pushing to it

A pull request was merged while more commits for it were still being written. Those commits went to the merged branch, where no pull request would pick them up. They were rebased onto `master` and opened as a new pull request.

**Lesson:** before pushing, check whether the branch's pull request is still open.

## A formatter has opinions beyond the ones you asked for

clang-format was added to keep the C listings in the ncurses source style. Its trailing-comment alignment broke comments that continue over several lines. That alignment is now off in `docs/.clang-format`, and `site/scripts/check-listings.mjs` checks trailing comments itself.

**Lesson:** run a new formatter over every listing and read the diff before adopting its defaults.

## A harness can change the meaning of the code it runs

Four menu listings reported exit status 1 when they quit. The listings were correct: C gives `main()`, and only `main()`, an implicit `return 0` at its closing brace. The example build renamed `main()` with `-Dmain=example_main`, which took that guarantee away. The build now renames the function after the compiler has added the return.

**Lesson:** when a check fails, ask whether the check changed what it measures before blaming the thing measured.

**Guard:** the smoke run still requires exit status 0 on F1, so a listing that really exits with an error is still flagged.

## Measure what the reader sees, not what the layout reports

Some listings scrolled sideways. The first check flagged every code block whose scroll width was larger than its visible width, and a 72-column line still showed up as too long. Expressive Code reserves padding on the right of each line for the copy button, so the code block can scroll a few pixels even when all of its text is visible. The check now measures where each line's text ends and compares that with the right edge of the code block. Listings render at 13px and hold to 77 columns, and at 1024, 1280 and 1440 pixels wide no listing text is cut off.

The example terminal had the same fault: 80 columns at 16px are 720 pixels, wider than the content column at 1280 pixels, so it scrolled too. It now shrinks its font until all 80 columns fit.

A configuration change also seemed to do nothing until Astro's content cache in `site/node_modules/.astro` was cleared. CI builds from a clean checkout, so it doesn't hit this, but a local build can.

**Lesson:** when a measurement disagrees with what you see, check what it measures. When a configuration change seems to do nothing, clear the build cache before concluding it doesn't work.

**Guard:** `site/scripts/check-listings.mjs` fails on a listing line longer than 77 columns.

## Meta-verification belongs in another system

The first attempt to re-check every errata error claim ran inside the Claude docs session that had written many of those rows. It launched 33 runs (18 on Sonnet, 10 Sonnet retries, 5 on Haiku). Sonnet's safety filter (`reasoning_extraction`) stopped 27; one more Sonnet run was cut off while writing cards; the Haiku retries were stopped after the permission system blocked a reworded prompt. One run finished (batch 5) and was discarded. That attempt counts as a **failed pass** for budget and lessons, not as evidence.

A second attempt ran as an outside Cursor Cloud Agent pass with the Merlon Docs evidence-check skill installed first, six batches × three isolated runs, and no access to `docs/appendix/` for the checkers. Its report and run outputs live under [meta-verification](meta-verification.md). Hand that package to a separate agent only after the pull request that adds it has merged.

**Lesson:** audit the errata list from a different product than the one that recorded the claims, load the evidence-check skill before launching runs, and keep the meta-verification artifacts in the appendix so the next agent can act from `master`.

**Guard:** the appendix's [meta-verification](meta-verification.md) page names the process, the verdict framing, and where the current pass's files are.

## Our own fixes can be wrong

The [adjudication](meta-verification/adjudication.md) of the first outside pass rechecked 112 errata rows from primary evidence. Ten were type I errors: the row reported an error in text the original had right. In five of them the "fix" had made the docs wrong, and the original wording is now restored. The first check went wrong in four ways:

- **It stopped reading too early.** `L103`: the check read part of `waddnstr()`, but `lib_addstr.c` sets `n = INT_MAX` for any negative `n`, so the HOWTO was right. `L295`: a search for the literal `box1` found nothing, but `parse_entry.c` translates `box_chars_1`, the same capability, to `acsc`.
- **It skipped the manual page that settles the point.** `L272`: `curs_getch(3X)` says that `getch()` with echo and neither cbreak nor raw "is not well-defined", so the original warning was right. `L301`: `ncurses(3X)` states the `_w` naming rule and its exceptions. `L156`: `term_variables(3X)` describes saving and restoring `cur_term` through `set_curterm()`.
- **It took a value at face value.** `L177`: `#define KEY_F1 265` looked wrong, but `include/Caps` gives `KEY_F0` as 0410 (264), so 265 is `KEY_F(1)`. `L179`: the CPAN index lists `Curses::Forms` as a distribution, so the HOWTO's `Curses::Form` looked like a typo, but it is a package in `Curses.pm`.
- **It treated a looser wording as an error, or wrote a claim of its own.** `L104` and `L148` are true as written. `L195` claimed that Eric S. Raymond first wrote every manual page, but the AUTHORS sections name Thomas E. Dickey on ten of them.

**Lesson:** assume the original is right unless the evidence against it is strong. Before calling it wrong, read the whole function, search for the concept as well as the literal name, and open the manual page that defines the behavior. A new claim the edition adds, such as who wrote what, needs the same five-step check as a correction.

**Guard:** none is automatic. The [meta-verification](meta-verification.md) pass reruns the checks from another system, and its findings are adjudicated against primary evidence before any row changes. A wrong fix moves its row to `rejected`, and a restored text gets an `edition-error` row, as the [errata introduction](index.md) describes.

## An agent can't settle what it can't open

The adjudication left rows unsettled for one reason more than any other: the evidence was outside what the agent could reach. The checkers were limited to the repository, so they couldn't judge dead links, the mailing list or the HOWTO's example archive. The adjudicating agent could fetch most web pages but not the Wayback Machine, which this environment refuses, so it couldn't say whether the 2003 snapshot of the DOS games page (`L55`) shows the games. The archive's download now returns 403 as well.

**Lesson:** when a row's evidence is a page the agent can't open, the row stays unsettled, and the agent says so and hands the link to a person. It doesn't infer the page's content from its address, its status code or a search listing.

**Guard:** the five-step check's second line asks for what was actually opened. A row whose evidence couldn't be opened gets the verdict `can't tell`, and the [adjudication](meta-verification/adjudication.md) lists it with the link a person needs to check.
