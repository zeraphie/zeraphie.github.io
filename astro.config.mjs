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
  /* The old site's permalinks, read off its live sitemap — the
     lowercase is load-bearing: Pages URLs are case-sensitive and
     Jekyll slugified the categories. Static output emits these as
     meta-refresh pages. tests/redirects.test.ts holds this map to
     exactly the live URLs and to published targets only. */
  redirects: {
    "/d&d/aetherblade": "/dnd/aetherblade",
    "/d&d/home-rules": "/dnd/home-rules",
    "/d&d/merlins-claw": "/dnd/merlins-claw",
    "/d&d/oath-of-nihility": "/dnd/oath-of-nihility",
    "/d&d/sanguine-pact": "/dnd/sanguine-pact",
    "/personal-projects/password-gen": "/projects/password-gen",
    "/personal-projects/pjax": "/projects/pjax",
    "/personal-projects/discord-date-formatter": "/projects/discord-dates",
  },
  vite: {
    // Demo tunnels (cloudflared quick tunnels) reach `astro preview`
    // with a trycloudflare Host header; preview answers 403 without
    // this. Dev stays localhost-only.
    preview: { allowedHosts: [".trycloudflare.com"] },
  },
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
