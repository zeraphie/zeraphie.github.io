/**
 * ─ world — built from the collections ─
 *
 * The world derives from the content collections: every collection
 * with at least one published post becomes a category, its posts the
 * items at /<collection>/<slug>. Server-side only (astro:content) —
 * the client receives the result as the #world-index JSON. Imported
 * by both getStaticPaths and the page body, which Astro compiles
 * separately.
 */

import { getCollection } from "astro:content";

import { collectionLabel, type Cluster } from "./flow-data";

// Order here is bloom order and the number-key row.
const COLLECTION_ORDER = ["dnd", "projects", "arcade", "lyrics", "guides", "about"] as const;

export async function buildWorld() {
  const published = [
    ...(await getCollection("dnd", ({ data }) => !data.draft)),
    ...(await getCollection("projects", ({ data }) => !data.draft)),
    ...(await getCollection("arcade", ({ data }) => !data.draft)),
    ...(await getCollection("lyrics", ({ data }) => !data.draft)),
    ...(await getCollection("guides", ({ data }) => !data.draft)),
    ...(await getCollection("about", ({ data }) => !data.draft)),
  ];
  const clusters: Cluster[] = COLLECTION_ORDER.map((id) => ({
    id,
    label: collectionLabel(id),
    key: "",
    items: published
      .filter((entry) => entry.collection === id)
      .map((entry) => ({
        id: entry.id,
        label: entry.data.title,
        sub: collectionLabel(id),
        post: `${id}/${entry.id}`,
      })),
  }))
    .filter((cluster) => cluster.items.length > 0)
    .map((cluster, index) => ({ ...cluster, key: String(index + 1) }));
  return { published, clusters };
}
