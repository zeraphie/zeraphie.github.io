// astro.config.mjs — izelya.me site config.
//
// A project site with a custom domain serves at the domain root:
// no base path. Deploys to GitHub Pages from Actions.

import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://izelya.me",
});
