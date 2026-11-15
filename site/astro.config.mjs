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
      components: { Footer: './src/components/Footer.astro' },
      customCss: ['./src/styles/layout.css'],
      // Native scrollbars on listings. Safari adds a styled (::-webkit-scrollbar) horizontal
      // scrollbar to the pre after its wrapper is sized, so the scrollbar spills into whatever
      // follows until something forces a new layout (the Run button jumped on first run).
      // 13px code fits a 77-column listing in the content column at 1280px; check-listings.mjs holds listings to that.
      expressiveCode: { useThemedScrollbars: false, styleOverrides: { codeFontSize: '0.8125rem' } },
      social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${repo}` }],
      sidebar: [
        { label: 'Credits', link: '/credits/' },
        { label: 'Getting started', items: [{ autogenerate: { directory: 'guides/getting-started' } }] },
        { label: 'Windows and screen updates', items: [{ autogenerate: { directory: 'guides/windows' } }] },
        { label: 'Output', items: [{ autogenerate: { directory: 'guides/output' } }] },
        { label: 'Input', items: [{ autogenerate: { directory: 'guides/input' } }] },
        { label: 'Attributes and colors', items: [{ autogenerate: { directory: 'guides/attributes' } }] },
        { label: 'Keyboard', items: [{ autogenerate: { directory: 'guides/keyboard' } }] },
        { label: 'Mouse', items: [{ autogenerate: { directory: 'guides/mouse' } }] },
        { label: 'Screen and other features', items: [{ autogenerate: { directory: 'guides/screen' } }] },
        { label: 'Forms library', items: [{ autogenerate: { directory: 'guides/forms' } }] },
        { label: 'Menus library', items: [{ autogenerate: { directory: 'guides/menus' } }] },
        { label: 'Panels library', items: [{ autogenerate: { directory: 'guides/panels' } }] },
        ...manSidebar,
        { label: 'Appendix', items: [{ autogenerate: { directory: 'appendix' } }] },
      ],
    }),
  ],
});
