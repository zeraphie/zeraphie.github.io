// ─ posts — the content catalogue ─
//
// The server renders every published post into an inert template and
// ships titles, descriptions, and h2 anchor points as a JSON index.
// This module is the client's read side: metadata lookups and the
// anchor lists the rail and router navigate by.

import type { Item } from "../flow-data";

export interface PostMeta {
  title: string;
  description: string;
  icon: string | null;
  /** ISO date, journal-formatted client-side. */
  date: string;
  words: number;
  anchors: { head: string; label: string }[];
}
/** Server-rendered post metadata: titles, descriptions, and
 * the h2 anchor points the rail and router navigate by. */
const POST_INDEX = JSON.parse(document.getElementById("post-index")!.textContent!) as Record<
  string,
  PostMeta
>;

export const slug = (s: string) => s.replaceAll(" ", "-");
/** An item's anchor points: real h2s for post items, declared
 * subs for the rest. `head` is the route segment AND the DOM
 * id scrollMain lands on. */
export function anchorsOf(item: Item): { head: string; label: string }[] {
  if (item.post) {
    return POST_INDEX[item.post]?.anchors ?? [];
  }
  return (item.subs ?? []).map((s) => ({ head: `h-${slug(s)}`, label: s }));
}

/** Metadata for a post ref ("collection/slug"), if it is published. */
export function postMeta(key: string | undefined): PostMeta | undefined {
  return key ? POST_INDEX[key] : undefined;
}
