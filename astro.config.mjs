// astro.config.mjs — izelya.me site config.
//
// A project site with a custom domain serves at the domain root:
// no base path. Deploys to GitHub Pages from Actions.

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
       single theme the block is stuck on that theme's palette AND
       its background — the journal could never sink it into the
       page. As variables, the sheet picks. */
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    },
  },
});
