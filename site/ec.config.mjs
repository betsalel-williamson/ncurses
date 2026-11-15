// Expressive Code settings for the site's code blocks. They live here, not in astro.config.mjs,
// because themeCssSelector is a function, which astro.config.mjs can't pass to Expressive Code.
import { readFileSync } from 'node:fs';
import { defineEcConfig, ExpressiveCodeTheme } from '@astrojs/starlight/expressive-code';

// One syntax theme per reader style (src/styles/styles.css). Starlight's UI colors still apply,
// so frames and backgrounds come from each style's tokens; these set the token colors.
const style = (name) =>
  ExpressiveCodeTheme.fromJSONString(readFileSync(new URL(`./src/code-themes/${name}.json`, import.meta.url), 'utf8'));
const styled = { 'ncurses-textmode': 'textmode', 'ncurses-workstation': 'workstation', 'ncurses-terminal': 'terminal' };

export default defineEcConfig({
  themes: ['starlight-dark', 'starlight-light', style('textmode'), style('workstation'), style('terminal')],
  useStarlightUiThemeColors: true,
  // starlight-dark is the base theme. Modern switches to starlight-light with the light scheme;
  // each other style has its own theme whatever the scheme.
  themeCssSelector: (theme) =>
    styled[theme.name] ? `[data-style='${styled[theme.name]}']` : `[data-style='modern'][data-theme='${theme.type}']`,
  // Native scrollbars on listings. Safari adds a styled (::-webkit-scrollbar) horizontal
  // scrollbar to the pre after its wrapper is sized, so the scrollbar spills into whatever
  // follows until something forces a new layout (the Run button jumped on first run).
  useThemedScrollbars: false,
  // 13px code fits a 77-column listing in the content column at 1280px; check-listings.mjs holds
  // listings to that. Text mode sets --ec-codeFontSize itself in styles.css.
  styleOverrides: { codeFontSize: '0.8125rem' },
});
