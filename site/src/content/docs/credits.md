---
title: Credits
description: The authors and contributors of ncurses and its documentation.
---

All the documentation on this site was written by the ncurses authors and contributors. This edition only reorganizes it.

## Maintainer

- **Thomas E. Dickey** ([ThomasDickey](https://github.com/ThomasDickey) on GitHub), maintainer from ncurses 1.9.9g through 4.1 and again from 5.0, as the project's README records. NEWS records every change since 1.9.9e in his hand; changes with no cited author are his. His [ncurses page](https://invisible-island.net/ncurses/#involved) dates his involvement to the 1.8.1 release, and its history of the package names the earlier authors.

## Principal authors and contributors

From the project's `AUTHORS` file, in decreasing order of their contribution since 1.9.9e. A GitHub account is linked only where its own public repositories tie it to the person:

- Thomas E. Dickey ([ThomasDickey](https://github.com/ThomasDickey))
- Juergen Pfeifer
- Eric S. Raymond
- Alexander V. Lukyanov ([lavv17](https://github.com/lavv17))
- G. Branden Robinson ([g-branden-robinson](https://github.com/g-branden-robinson))
- Philippe Blain
- Sven Verdoolaege
- Nicolas Boulenguez

## Originators

From the project's `README`:

- **Pavel Curtis** originated ncurses.
- **Zeyd M. Ben-Halim** was the original maintainer.
- **Eric S. Raymond** co-maintained it and wrote much of the documentation.

## Guide authors

- *Writing Programs with NCURSES*: Eric S. Raymond and Zeyd M. Ben-Halim
- *A Hacker's Guide to NCURSES*: Eric S. Raymond
- *NCURSES Programming HOWTO*: Pradeep Padala. Its sources are at [ThomasDickey/ncurses-howto-snapshots](https://github.com/ThomasDickey/ncurses-howto-snapshots), and its example programs at [ncurses_programs.tar.gz](https://invisible-island.net/ncurses/howto/ncurses_programs.tar.gz).

The HOWTO's own credits: Sharath wrote the first version of its introduction, and Emre Akbas helped write the printw and scanw sections. Anuradha Ratnaweera contributed Perl equivalents of the example programs. Ravi Parimi made suggestions from before the first line was written, reviewed the whole text, and checked each program on Linux and Solaris.

## Manual page authors

Each manual page keeps its own AUTHORS section. Eric S. Raymond (53 pages), Juergen Pfeifer (47 pages, the forms, menus and panels libraries) and Thomas E. Dickey are credited most often, along with Zeyd M. Ben-Halim, Pavel Curtis and Warren Tucker.

## Licenses

The guides on this site keep their authors' licenses. Both are the same MIT-style license, with these copyright notices:

- *Writing Programs with NCURSES*: Copyright 2019-2022,2024 Thomas E. Dickey. Copyright 2000-2013,2017 Free Software Foundation, Inc.
- *NCURSES Programming HOWTO*: Copyright 2001 by Pradeep Padala.

The manual pages and ncurses itself are under the same license, with the copyright notices in each file and in the project's `COPYING` file.

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, distribute with modifications, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
>
> Except as contained in this notice, the name(s) of the above copyright holders shall not be used in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written authorization.

## This edition

Edited by [betsalel-williamson](https://github.com/betsalel-williamson) with [Merlon Docs](https://github.com/Merlon-Docs/merlon). The guide text is merged so each fact appears once, with every page crediting its sources. The manual pages are generated from the troff sources in `man/`. Mistakes in the reorganization are ours, not the authors'.

Every change to the original text is listed in [Errata and changes](../appendix/): errors corrected in the original, each with the evidence checked, errors this edition introduced and then fixed, formatting and structure changes, new material, and errors found but not yet fixed, so they can be reported upstream. [Lessons learned](../appendix/lessons-learned/) records what went wrong in the migration itself and what now catches it.

### Why this edition exists

This edition is an example of using AI agent skills to review documentation, so that people and AI models alike can understand a software project more easily. Merlon Docs organizes the text into shards, small source files that each cover one topic, and compiles the shards into guides. Organizing it this way:

- removes duplicates, so each fact is stated once and corrected in one place
- gives each shard a single responsibility
- lets a review focus on one detail at a time, and still cover a large body of text efficiently
