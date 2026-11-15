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
  // A page that moved keeps its old address working.
  redirects: { '/guides/screen/line-drawing-characters': `/${name}/guides/output/line-drawing-characters/` },
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
        { label: 'Credits', link: '/credits/' },
        {
          label: 'Learn curses',
          items: [
            { label: 'Overview', link: '/learn/' },
            { label: 'Getting started', collapsed: true, items: [{ autogenerate: { directory: 'guides/getting-started' } }] },
            { label: 'Windows and screen updates', collapsed: true, items: [{ autogenerate: { directory: 'guides/windows' } }] },
            { label: 'Output', collapsed: true, items: [{ autogenerate: { directory: 'guides/output' } }] },
            { label: 'Attributes and colors', collapsed: true, items: [{ autogenerate: { directory: 'guides/attributes' } }] },
            { label: 'Input', collapsed: true, items: [{ autogenerate: { directory: 'guides/input' } }] },
            { label: 'Keyboard', collapsed: true, items: [{ autogenerate: { directory: 'guides/keyboard' } }] },
            { label: 'Mouse', collapsed: true, items: [{ autogenerate: { directory: 'guides/mouse' } }] },
            { label: 'Screen manipulation and other features', collapsed: true, items: [{ autogenerate: { directory: 'guides/screen' } }] },
            { label: 'Initialization, wrapup and debugging', collapsed: true, items: [{ autogenerate: { directory: 'guides/init-and-debugging' } }] },
            { label: 'Hints, tips and compatibility', collapsed: true, items: [{ autogenerate: { directory: 'guides/hints' } }] },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Overview', link: '/topics/' },
            { label: 'Panels library', collapsed: true, items: [{ autogenerate: { directory: 'guides/panels' } }] },
            { label: 'Menus library', collapsed: true, items: [{ autogenerate: { directory: 'guides/menus' } }] },
            { label: 'Forms library', collapsed: true, items: [{ autogenerate: { directory: 'guides/forms' } }] },
            { label: 'Other libraries, tools and programs to try', collapsed: true, items: [{ autogenerate: { directory: 'guides/more' } }] },
            {
              label: 'Installing ncurses',
              collapsed: true,
              items: [
                { autogenerate: { directory: 'contributing/install' } },
                { label: 'Configure options', collapsed: true, items: [{ autogenerate: { directory: 'contributing/configure-options' } }] },
                { label: 'Compatibility with older releases', collapsed: true, items: [{ autogenerate: { directory: 'contributing/compatibility' } }] },
              ],
            },
            { label: "A hacker's guide to ncurses", collapsed: true, items: [{ autogenerate: { directory: 'contributing/hackguide' } }] },
            { label: 'The Ada95 binding', collapsed: true, items: [{ autogenerate: { directory: 'contributing/ada' } }] },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Overview', link: '/reference/' },
            ...manSidebar,
            { label: 'Glossary', collapsed: true, items: [{ autogenerate: { directory: 'glossary' } }] },
          ],
        },
        {
          label: 'About this edition',
          items: [
            { label: 'Overview', link: '/about/' },
            { label: 'Release announcement', collapsed: true, items: [{ autogenerate: { directory: 'contributing/announce' } }] },
            { label: 'Appendix', collapsed: true, items: [{ autogenerate: { directory: 'appendix' } }] },
          ],
        },
      ],
    }),
  ],
});
