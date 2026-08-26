// ─ clusters — category constellations ─
//
// A category is an hp-cluster honeycomb revealed at the end of a
// tether flight: centre anchor + item cells, bloom-in choreography,
// and the directed vein back to the seed. One cluster is mounted at
// a time; offsets persist a session's drags.

import type { AxialCoord, HpGrid } from "@hexpunk/core/grid";

import type { Cluster } from "../flow-data";

export interface ClusterLayer {
  readonly mounted: { cluster: Cluster; el: HTMLElement; vein: HTMLElement } | null;
  readonly offsets: Map<string, AxialCoord>;
  mount(cluster: Cluster, animate: boolean): void;
  unmount(animate: boolean): void;
}

export function createClusterLayer(world: HpGrid): ClusterLayer {
  const clusterOffsets = new Map<string, AxialCoord>();
  let mounted: { cluster: Cluster; el: HTMLElement; vein: HTMLElement } | null = null;

  function buildCluster(cluster: Cluster, animate: boolean): HTMLElement {
    const el = document.createElement("hp-cluster");
    el.setAttribute("layout", "honeycomb");
    el.id = `cluster-${cluster.id}`;
    el.setAttribute("drag-handle", ":first-child");
    const off = clusterOffsets.get(cluster.id) ?? { q: 0, r: 0 };
    el.setAttribute("q", String(cluster.cell!.q + off.q));
    el.setAttribute("r", String(cluster.cell!.r + off.r));

    const centre = document.createElement("hp-cell");
    centre.setAttribute("variant", "anchor");
    centre.textContent = cluster.label;
    el.appendChild(centre);

    cluster.items.forEach((item, i) => {
      const cell = document.createElement("hp-cell");
      cell.setAttribute("variant", item.ghost ? "slot" : "secondary");
      cell.className = item.ghost ? "hx-ghost" : "hx-item";
      cell.dataset.item = item.id;
      cell.dataset.slot = String(i + 1);
      if (!item.ghost) {
        cell.setAttribute("tabindex", "0");
      }
      cell.innerHTML = `<span class="hx-label">${item.label}</span>`;
      el.appendChild(cell);
    });

    if (animate) {
      let delay = 0;
      for (const child of Array.from(el.children) as HTMLElement[]) {
        child.classList.add("hx-reveal");
        child.style.setProperty("--d", `${delay}ms`);
        delay += 55;
      }
    }
    return el;
  }

  function mountCluster(cluster: Cluster, animate: boolean): void {
    if (mounted?.cluster.id === cluster.id) {
      return;
    }
    unmountCluster(false);
    const el = buildCluster(cluster, animate);
    world.appendChild(el);
    if (animate) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          for (const child of Array.from(el.children)) {
            child.classList.add("hx-on");
          }
        })
      );
    } else {
      for (const child of Array.from(el.children)) {
        child.classList.add("hx-on");
      }
    }
    const vein = document.createElement("hp-tether");
    vein.setAttribute("from", "#seed-unfold");
    vein.setAttribute("to", `#cluster-${cluster.id}`);
    vein.setAttribute("directed", "");
    world.appendChild(vein);
    window.setTimeout(() => vein.setAttribute("state", "idle"), 1600);
    mounted = { cluster, el, vein };
  }

  /** Closing is the reveal in reverse; the elements leave after
   * the recede plays. */
  function unmountCluster(animate: boolean): void {
    if (!mounted) {
      return;
    }
    const { el, vein } = mounted;
    mounted = null;
    vein.remove();
    if (!animate) {
      el.remove();
      return;
    }
    el.classList.add("hx-closing");
    window.setTimeout(() => el.remove(), 420);
  }

  return {
    get mounted() {
      return mounted;
    },
    offsets: clusterOffsets,
    mount: mountCluster,
    unmount: unmountCluster,
  };
}
