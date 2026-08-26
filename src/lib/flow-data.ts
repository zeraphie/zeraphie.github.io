// ─ flow-data — the world's map ─
//
// One source of truth for the flow's clusters and items, shared by
// the page's frontmatter (static route generation, per-page titles)
// and the client world (navigation, dives, the rail). An item with a
// `post` ref reads that content entry and lives at its real path;
// items without one live under their cluster.

import type { AxialCoord } from "@hexpunk/core/grid";

export interface Item {
  id: string;
  label: string;
  sub: string;
  /** collection/slug of the content entry this item reads. */
  post?: string;
  /** Stand-in copy for items without a post (yet). */
  lead?: string;
  url?: string;
  subs?: string[];
  ghost?: boolean;
}

export interface Cluster {
  id: string;
  label: string;
  key: string;
  items: Item[];
  cell?: AxialCoord;
}

const g = (id: string, label: string, sub: string): Item => ({
  id,
  label,
  sub,
  ghost: true,
});

export const CLUSTERS: Cluster[] = [
  {
    id: "projects",
    label: "projects",
    key: "1",
    items: [
      { id: "hexpunk", label: "hexpunk", sub: "design system", post: "projects/hexpunk" },
      { id: "snecko", label: "snecko", sub: "game", post: "projects/snecko" },
      {
        id: "wok",
        label: "warrior of keyboard",
        sub: "game",
        post: "projects/warrior-of-keyboard",
      },
      { id: "ddf", label: "discord dates", sub: "tool", post: "projects/discord-dates" },
      g("questboard", "questboard", "soon"),
      g("vtt", "vtt", "soon"),
    ],
  },
  {
    id: "arcade",
    label: "arcade",
    key: "2",
    items: [
      {
        id: "snecko",
        label: "snecko",
        sub: "insert cart",
        lead: "Boot the snake. High scores are local and sacred.",
        url: "/arcade/snecko",
        subs: ["insert coin", "high scores"],
      },
      {
        id: "warrior-of-keyboard",
        label: "warrior of keyboard",
        sub: "insert cart",
        lead: "Boot the battle. The cartridge-insert animation is a real loading screen.",
        url: "/arcade/warrior-of-keyboard",
        subs: ["insert coin", "high scores"],
      },
      g("freeplay", "free play", "no coins"),
    ],
  },
  {
    id: "writing",
    label: "writing",
    key: "3",
    items: [
      { id: "aetherblade", label: "aetherblade", sub: "d&d · class", post: "dnd/aetherblade" },
      { id: "sanguine", label: "sanguine pact", sub: "d&d", post: "dnd/sanguine-pact" },
      { id: "nihility", label: "oath of nihility", sub: "d&d", post: "dnd/oath-of-nihility" },
      { id: "merlin", label: "merlin's claw", sub: "d&d", post: "dnd/merlins-claw" },
      { id: "homerules", label: "my home rules", sub: "d&d · rules", post: "dnd/home-rules" },
      { id: "post-ddf", label: "discord dates", sub: "dev log", post: "projects/discord-dates" },
      { id: "post-pjax", label: "pjax", sub: "dev log", post: "projects/pjax" },
      { id: "post-pwgen", label: "passwordgen", sub: "dev log", post: "projects/password-gen" },
    ],
  },
  {
    id: "about",
    label: "about",
    key: "4",
    items: [
      {
        id: "me",
        label: "about me",
        sub: "who i am",
        lead: "Izzy. Builds hexagons, games, and homebrew. This site is the proof.",
        url: "/about/me",
        subs: ["bio", "contact"],
      },
      {
        id: "github",
        label: "github",
        sub: "zeraphie",
        lead: "Where the source lives — every project on this site, in the open.",
        url: "https://github.com/zeraphie",
        subs: ["profile"],
      },
      {
        id: "oldsite",
        label: "the archive",
        sub: "old site",
        lead: "zeraphie.github.io, frozen with honour. The 2017 blog this world replaced.",
        url: "https://zeraphie.github.io",
        subs: ["visit the archive"],
      },
    ],
  },
];

/** An item's canonical path: the post's real path when it has one,
 * its cluster's namespace otherwise. */
export function itemPath(clusterId: string, item: Item): string {
  return item.post ? `/${item.post}` : `/${clusterId}/${item.id}`;
}

/** Resolve a pathname back to world state. Returns {} for home,
 * null for paths this world doesn't know. When two items share a
 * post (a tool and its dev log), the first cluster owns the path. */
export function resolvePath(pathname: string): { cat?: string; item?: string } | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") {
    return {};
  }
  for (const cluster of CLUSTERS) {
    for (const item of cluster.items) {
      if (!item.ghost && itemPath(cluster.id, item) === clean) {
        return { cat: cluster.id, item: item.id };
      }
    }
  }
  const cluster = CLUSTERS.find((c) => `/${c.id}` === clean);
  return cluster ? { cat: cluster.id } : null;
}
