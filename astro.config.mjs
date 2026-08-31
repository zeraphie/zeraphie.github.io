/**
 * ─ astro.config — izelya.me site config ─
 *
 * The site serves at the domain root — no base path. Deploys to
 * GitHub Pages from Actions at go-live.
 */

import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import { remarkCallouts } from "./src/lib/remark-callouts.ts";

export default defineConfig({
  site: "https://izelya.me",
  integrations: [
    // Drafts never build, so every generated page is a live
    // destination.
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkCallouts],
    /* Two themes and no default: Shiki then writes each token's
       colours as CSS custom properties instead of inline `style`
       attributes. Inline styles outrank the stylesheet, so with a
       single theme the block is stuck on that theme's palette and
       background — the journal could not restyle it. As variables,
       the stylesheet picks. */
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    },
  },
});
