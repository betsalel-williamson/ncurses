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
      social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${repo}` }],
      sidebar: [
        { label: 'Credits', link: '/credits/' },
        { label: 'Forms library', items: [{ autogenerate: { directory: 'guides/forms' } }] },
        ...manSidebar,
      ],
    }),
  ],
});
