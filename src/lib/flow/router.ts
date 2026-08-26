// ─ router — paths are the state ─
//
// Every world state is a real URL: home, /<category>, and each
// item at its canonical path, with heading anchors as ordinary
// fragments. This module reads locations back into route state and
// prints routes back out; pushing and applying stays with the page,
// whose choreography owns the transitions.

import { CLUSTERS, itemPath, resolvePath, type Cluster } from "../flow-data";

export type Route = { cat?: string; item?: string; head?: string };

export function clusterById(id?: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.id === id);
}

export function parseRoute(): Route {
  const resolved = resolvePath(location.pathname) ?? {};
  return { ...resolved, head: location.hash.replace(/^#/, "") || undefined };
}

/** A route's canonical path — the item's real page when there is
 * one, its category otherwise. */
export function routePath(route: Route): string {
  const cluster = clusterById(route.cat);
  const item = cluster?.items.find((entry) => entry.id === route.item);
  return cluster && item ? itemPath(cluster.id, item) : cluster ? `/${cluster.id}` : "/";
}
