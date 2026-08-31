/**
 * ─ router — paths are the state ─
 *
 * Every world state is a real URL: home, /<collection>, and each
 * post at its canonical path, with heading anchors as ordinary
 * fragments. The router reads locations back into route state and
 * prints routes back out; pushing and applying stays with the
 * page.
 */

import { itemPath, resolvePath, type Cluster } from "../flow-data";

export type Route = { cat?: string; item?: string; head?: string; doc?: string };

export interface Router {
  clusterById(id?: string): Cluster | undefined;
  parseRoute(): Route;
  routePath(route: Route): string;
}

export function createRouter(clusters: Cluster[]): Router {
  function clusterById(id?: string): Cluster | undefined {
    return clusters.find((c) => c.id === id);
  }

  function parseRoute(): Route {
    const resolved = resolvePath(clusters, location.pathname) ?? {};
    return { ...resolved, head: location.hash.replace(/^#/, "") || undefined };
  }

  /** A route's canonical path — the item's real page when there is
   * one, its category otherwise. */
  function routePath(route: Route): string {
    if (route.doc) {
      return `/${route.doc}`;
    }
    const cluster = clusterById(route.cat);
    const item = cluster?.items.find((entry) => entry.id === route.item);
    return cluster && item ? itemPath(item) : cluster ? `/${cluster.id}` : "/";
  }

  return { clusterById, parseRoute, routePath };
}
