# Pixel icons

The icons the Text mode, Workstation and Terminal reader styles draw in place of Starlight's, from
[pixelarticons](https://github.com/halfmage/pixelarticons) 2.4.2 by Gerrit Halfmann, under the MIT
license in `LICENSE`. They are copied unchanged from the package's `svg/` folder, except
`prompt.svg`, which the set lacks: the shell prompt (`>_`) on the Copy to run button, drawn for this
site on the same 2-unit grid from `chevron-right.svg` and an underscore. `src/styles/styles.css`
uses each one as a mask, so it takes the color of the text around it. `prompt.svg` and `check.svg`
are inlined in the Copy to run button instead (`code-run-copy.mjs`), so a style can add a glow or
an etched highlight to them.
