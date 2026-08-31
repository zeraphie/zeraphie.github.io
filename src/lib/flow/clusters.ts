/**
 * ─ clusters — the category honeycombs ─
 *
 * A category is an hp-cluster honeycomb revealed at the end of a
 * tether flight: centre anchor, item cells, bloom-in choreography,
 * and the directed vein back to the seed. One cluster is mounted
 * at a time; offsets persist a session's drags.
 */

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

  /** Long single-word labels can't wrap, so they shrink until they
   * sit inside the hex's safe band. Measured against the cell's own
   * rect, so camera zoom (a shared transform) cancels out. The real
   * fit-to-shape treatment belongs to hexpunk; this is the
   * measure-and-shrink stopgap until it lands. */
  function fitLabels(el: HTMLElement): void {
    for (const label of el.querySelectorAll<HTMLElement>(".hx-label")) {
      label.style.fontSize = "";
      const cell = label.closest("hp-cell");
      if (!cell) {
        continue;
      }
      const max = cell.getBoundingClientRect().width * 0.78;
      let size = Number.parseFloat(getComputedStyle(label).fontSize);
      while (size > 9 && label.getBoundingClientRect().width > max) {
        size -= 0.5;
        label.style.fontSize = `${size}px`;
      }
    }
  }

  function mountCluster(cluster: Cluster, animate: boolean): void {
    if (mounted?.cluster.id === cluster.id) {
      return;
    }
    unmountCluster(false);
    const el = buildCluster(cluster, animate);
    world.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => fitLabels(el)));
    // Late webfonts change metrics — refit once faces settle.
    void document.fonts.ready.then(() => {
      if (mounted?.el === el) {
        fitLabels(el);
      }
    });
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
    // The vein links the two molecules. Endpoints must be grid
    // OCCUPANTS — direct [q][r] children — because the grid draws
    // slotted tethers on its canvas and silently drops an arc whose
    // endpoint is a nested cell. The engine anchors at the best
    // vertex pair between the molecules, which lands the arc on the
    // cluster's facing side.
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
