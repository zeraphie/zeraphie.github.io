/**
 * ─ flow-data — the world's shape ─
 *
 * Types and pure path helpers for the flow's world. The world itself
 * derives from the content collections at build time (the page's
 * frontmatter) and ships to the client as the #world-index JSON —
 * every category is a collection with published posts, every item is
 * a post living at its canonical /<collection>/<slug> path.
 */

import type { AxialCoord } from "@hexpunk/core/grid";

export interface Item {
  id: string;
  label: string;
  sub: string;
  /** collection/slug of the content entry this item reads. */
  post?: string;
  /** Stand-in copy for items without a post (none today). */
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

/** An item's canonical path — its post's real page. */
export function itemPath(item: Item): string {
  return `/${item.post ?? item.id}`;
}

/** Resolve a pathname back to world state. Returns {} for home,
 * null for paths this world doesn't know. */
/** Collection ids are URL slugs; a few read differently in prose.
 * Labels are lowercase — surfaces that want caps uppercase them in
 * CSS ("d&d" becomes "D&D" in a heading, stays "d&d" in a stat
 * line). Item labels are the post's `title` verbatim: hp-cell
 * uppercases its own label anyway, and the surfaces that don't
 * transform (rail, page titles, sitemap) cannot recover casing
 * from a lowercased title. */
const COLLECTION_LABELS: Record<string, string> = { dnd: "d&d" };

export function collectionLabel(id: string): string {
  return COLLECTION_LABELS[id] ?? id;
}

/** Standalone journal documents: world states that are neither a
 * cluster nor a post. */
export const DOC_ROUTES = ["sitemap"] as const;

export function resolvePath(
  clusters: Cluster[],
  pathname: string
): { cat?: string; item?: string; doc?: string } | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") {
    return {};
  }
  const doc = DOC_ROUTES.find((id) => `/${id}` === clean);
  if (doc) {
    return { doc };
  }
  for (const cluster of clusters) {
    for (const item of cluster.items) {
      if (!item.ghost && itemPath(item) === clean) {
        return { cat: cluster.id, item: item.id };
      }
    }
  }
  const cluster = clusters.find((c) => `/${c.id}` === clean);
  return cluster ? { cat: cluster.id } : null;
}
