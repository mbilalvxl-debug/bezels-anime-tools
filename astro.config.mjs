
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bezels.site',
  integrations: [
    sitemap({
      filter: (page) => {
        const url = new URL(page);

        return (
          !url.pathname.startsWith('/admin/') &&
          url.pathname !== '/supabase-test/'
        );
      },
    }),
  ],
});
