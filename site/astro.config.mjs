import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync, existsSync } from 'node:fs';

const repo = process.env.GITHUB_REPOSITORY || 'betsalel-williamson/ncurses';
const [owner, name] = repo.split('/');
const generated = new URL('./.generated/sidebar.json', import.meta.url);
const manSidebar = existsSync(generated) ? JSON.parse(readFileSync(generated, 'utf8')) : [];

export default defineConfig({
  site: `https://${owner}.github.io`,
  base: `/${name}`,
  integrations: [
    starlight({
      title: 'ncurses',
      description: 'Documentation for ncurses, the new curses library: guides and every manual page.',
      components: {
        Footer: './src/components/Footer.astro',
        Header: './src/components/Header.astro',
        SkipLink: './src/components/SkipLink.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      customCss: [
        './src/styles/layout.css',
        // Fonts for the reader-selectable styles (styles.css), Latin subsets only. VT323 is
        // declared in styles.css.
        '@fontsource/arimo/latin-400.css',
        '@fontsource/arimo/latin-700.css',
        '@fontsource/gelasio/latin-400.css',
        '@fontsource/gelasio/latin-400-italic.css',
        '@fontsource/gelasio/latin-700.css',
        '@fontsource/tinos/latin-400.css',
        '@fontsource/tinos/latin-400-italic.css',
        '@fontsource/tinos/latin-700.css',
        '@fontsource/tinos/latin-700-italic.css',
        '@fontsource/cousine/latin-400.css',
        '@fontsource/cousine/latin-700.css',
        './src/styles/styles.css',
      ],
      social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${repo}` }],
      sidebar: [
        { label: 'Getting started', items: [{ autogenerate: { directory: 'guides/getting-started' } }] },
        { label: 'Windows and screen updates', items: [{ autogenerate: { directory: 'guides/windows' } }] },
        { label: 'Output', items: [{ autogenerate: { directory: 'guides/output' } }] },
        { label: 'Attributes and colors', items: [{ autogenerate: { directory: 'guides/attributes' } }] },
        { label: 'Input', items: [{ autogenerate: { directory: 'guides/input' } }] },
        { label: 'Keyboard', items: [{ autogenerate: { directory: 'guides/keyboard' } }] },
        { label: 'Mouse', items: [{ autogenerate: { directory: 'guides/mouse' } }] },
        { label: 'Screen manipulation and other features', items: [{ autogenerate: { directory: 'guides/screen' } }] },
        { label: 'Initialization, wrapup and debugging', items: [{ autogenerate: { directory: 'guides/init-and-debugging' } }] },
        { label: 'Hints, tips and compatibility', items: [{ autogenerate: { directory: 'guides/hints' } }] },
        { label: 'Panels library', items: [{ autogenerate: { directory: 'guides/panels' } }] },
        { label: 'Menus library', items: [{ autogenerate: { directory: 'guides/menus' } }] },
        { label: 'Forms library', items: [{ autogenerate: { directory: 'guides/forms' } }] },
        { label: 'Other libraries, tools and programs to try', items: [{ autogenerate: { directory: 'guides/more' } }] },
        ...manSidebar,
        {
          label: 'Installing ncurses',
          items: [
            { autogenerate: { directory: 'contributing/install' } },
            { label: 'Configure options', collapsed: true, items: [{ autogenerate: { directory: 'contributing/configure-options' } }] },
            { label: 'Compatibility with older releases', collapsed: true, items: [{ autogenerate: { directory: 'contributing/compatibility' } }] },
          ],
        },
        { label: "A hacker's guide to ncurses", items: [{ autogenerate: { directory: 'contributing/hackguide' } }] },
        { label: 'The Ada95 binding', items: [{ autogenerate: { directory: 'contributing/ada' } }] },
        { label: 'Release announcement', items: [{ autogenerate: { directory: 'contributing/announce' } }] },
        { label: 'Glossary', collapsed: true, items: [{ autogenerate: { directory: 'glossary' } }] },
        { label: 'Credits', link: '/credits/' },
        { label: 'Appendix', items: [{ autogenerate: { directory: 'appendix' } }] },
      ],
    }),
  ],
});
