// Expressive Code settings for the site's code blocks. They live here, not in astro.config.mjs,
// because themeCssSelector is a function, which astro.config.mjs can't pass to Expressive Code.
import { readFileSync } from 'node:fs';
import { defineEcConfig, ExpressiveCodeTheme } from '@astrojs/starlight/expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { codeLinks } from './code-links.mjs';
import { codeLineNumbers } from './code-line-numbers.mjs';

// One syntax theme per reader style (src/styles/styles.css). Starlight's UI colors still apply,
// so frames and backgrounds come from each style's tokens; these set the token colors.
const style = (name) =>
  ExpressiveCodeTheme.fromJSONString(readFileSync(new URL(`./src/code-themes/${name}.json`, import.meta.url), 'utf8'));
const styled = { 'ncurses-textmode': 'textmode', 'ncurses-workstation': 'workstation', 'ncurses-terminal': 'terminal', 'ncurses-manpage': 'manpage' };

export default defineEcConfig({
  themes: ['starlight-dark', 'starlight-light', style('textmode'), style('workstation'), style('terminal'), style('manpage')],
  useStarlightUiThemeColors: true,
  // starlight-dark is the base theme. Modern switches to starlight-light with the light scheme;
  // each other style has its own theme whatever the scheme.
  themeCssSelector: (theme) =>
    styled[theme.name] ? `[data-style='${styled[theme.name]}']` : `[data-style='modern'][data-theme='${theme.type}']`,
  // Native scrollbars on listings. Safari adds a styled (::-webkit-scrollbar) horizontal
  // scrollbar to the pre after its wrapper is sized, so the scrollbar spills into whatever
  // follows until something forces a new layout (the Run button jumped on first run).
  useThemedScrollbars: false,
  // 13px code fits a 77-column listing in the content column at 1280px, with a 3-digit line-number
  // gutter; check-listings.mjs holds listings to that. Text mode sets --ec-codeFontSize itself in
  // styles.css.
  styleOverrides: { codeFontSize: '0.8125rem' },
  // No line numbers unless code-line-numbers.mjs (C listings of 6 lines or more) or the fence
  // asks for them.
  defaultProps: { showLineNumbers: false },
  // Curses calls in C listings link to their man pages, with a hint on hover (code-links.mjs).
  // Longer C listings get line numbers (code-line-numbers.mjs, before the plugin that draws
  // them).
  plugins: [codeLinks(), codeLineNumbers(), pluginLineNumbers()],
});
