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
  },
});
