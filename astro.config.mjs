import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMathExtended from 'remark-math-extended';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://vladilena-milize1.github.io',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      [remarkMathExtended, { backslashDelimiters: true }],
    ],
    rehypePlugins: [
      rehypeKatex,
    ],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});

