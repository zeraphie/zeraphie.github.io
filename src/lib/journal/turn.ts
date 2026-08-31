/**
 * ─ journal-turn — the two-leaf page turn ─
 *
 * A per-turn overlay: the strip scrolls to the destination
 * immediately (content lands first) and the overlay supplies the
 * old pixels — a static cover holding the old page, plus the
 * turning leaf. The leaf is two ONE-SIDED flaps that trade places
 * at the vertical: the old page owns the first quarter-turn, the
 * new page the second. No preserve-3d, no backfaces, nothing
 * coplanar — engines cannot bleed one page through another. Faces
 * are clones of the strip windowed to one page region.
 * Progress-driven: timed turns tween it, a corner drag scrubs it
 * and settles past halfway.
 */

import { dragProgress, easeOutCubic, flapVisible, foldDepth, type TurnGeometry } from "./math";

export interface TurnOptions {
  /** The real column strip (already holding the post's flow). */
  strip: HTMLElement;
  /** Overlay host — the journal body wrapping paper and strip. */
  host: HTMLElement;
  dir: 1 | -1;
  oldScroll: number;
  newScroll: number;
  /** Pages per spread: 2 hinges half leaves at the spine, 1 turns
   * the whole page vertically (notepad physics). */
  perView: number;
  /** Applies the destination state (scroll, pager, buttons). */
  commit(): void;
  /** Restores the origin state after an abandoned drag. */
  revert(): void;
}

export interface TurnController {
  /** Scrub to a progress (0 rest → 1 turned). */
  set(progress: number): void;
  /** Pointer position → progress, per this turn's geometry. */
  progressFrom(x: number, y: number): number;
  /** Tween to completion or back, then clean up. Resolves with
   * whether the turn completed. */
  settle(complete: boolean): Promise<boolean>;
}

const FULL_MS = 460;
const MIN_MS = 130;
const SHADE = 0.45;

interface Flap {
  el: HTMLElement;
  shade: HTMLElement;
  /** Half of the arc this one-sided flap owns. */
  lower: number;
  upper: number;
  /** Flap rotation at a given overall progress. */
  angle(progress: number): number;
}

/** A face is a window onto one page region: a clone of the strip,
 * absolutely offset so the region lines up, scrolled to its state. */
function face(
  strip: HTMLElement,
  regionLeft: number,
  scroll: number,
  paper: "verso" | "recto"
): { el: HTMLElement; shade: HTMLElement; settle(): void } {
  const el = document.createElement("div");
  el.className = "journal-leaf-face";
  el.dataset.paper = paper;
  const clone = strip.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  for (const marked of clone.querySelectorAll("[id]")) {
    marked.removeAttribute("id");
  }
  clone.classList.add("journal-clone");
  clone.style.width = `${strip.clientWidth}px`;
  clone.style.left = `${-regionLeft}px`;
  el.appendChild(clone);
  const shade = document.createElement("div");
  shade.className = "journal-leaf-shade";
  el.appendChild(shade);
  return {
    el,
    shade,
    settle() {
      // scrollLeft only takes once the clone has boxes.
      clone.scrollLeft = scroll;
    },
  };
}

/** Build one turn's overlay and hand back its controller. */
export function beginTurn(options: TurnOptions): TurnController {
  const { strip, host, dir, oldScroll, newScroll, perView, commit, revert } = options;
  const rect = strip.getBoundingClientRect();
  const width = strip.clientWidth;
  const half = width / 2;
  const spread = perView > 1;
  const geometry: TurnGeometry = {
    spread,
    dir,
    left: rect.left,
    top: rect.top,
    width,
    height: rect.height,
  };

  const overlay = document.createElement("div");
  overlay.className = "journal-leaf";
  overlay.setAttribute("aria-hidden", "true");
  const settles: Array<() => void> = [];
  const flaps: Flap[] = [];

  function cover(
    side: "left" | "right",
    full: boolean,
    regionLeft: number,
    scroll: number,
    paper: "verso" | "recto"
  ): void {
    const el = document.createElement("div");
    el.className = "journal-leaf-cover";
    el.dataset.side = side;
    if (full) {
      el.dataset.span = "full";
    }
    const made = face(strip, regionLeft, scroll, paper);
    settles.push(made.settle);
    el.appendChild(made.el);
    overlay.appendChild(el);
  }

  function flap(
    side: "left" | "right",
    hinge: "left" | "right" | "top",
    full: boolean,
    regionLeft: number,
    scroll: number,
    paper: "verso" | "recto",
    lower: number,
    upper: number,
    angle: (progress: number) => number
  ): void {
    const el = document.createElement("div");
    el.className = "journal-leaf-flap";
    el.dataset.side = side;
    el.dataset.hinge = hinge;
    if (full) {
      el.dataset.span = "full";
    }
    const made = face(strip, regionLeft, scroll, paper);
    settles.push(made.settle);
    el.appendChild(made.el);
    overlay.appendChild(el);
    flaps.push({ el, shade: made.shade, lower, upper, angle });
  }

  // The arc: 0..180 degrees of one leaf. The old page owns 0..90,
  // the new page 90..180, each as a one-sided plane on its own
  // side of the hinge.
  if (spread && dir > 0) {
    cover("left", false, 0, oldScroll, "verso");
    flap("right", "left", false, half, oldScroll, "recto", 0, 0.5, (p) => -180 * p);
    flap("left", "right", false, 0, newScroll, "verso", 0.5, 1, (p) => 180 * (1 - p));
  } else if (spread) {
    cover("right", false, half, oldScroll, "recto");
    flap("left", "right", false, 0, oldScroll, "verso", 0, 0.5, (p) => 180 * p);
    flap("right", "left", false, half, newScroll, "recto", 0.5, 1, (p) => -180 * (1 - p));
  } else if (dir > 0) {
    // Notepad forward: the old page lifts from the bottom edge;
    // past vertical it is out of sight.
    flap("left", "top", true, 0, oldScroll, "verso", 0, 0.5, (p) => -180 * p);
  } else {
    // Notepad backward: the previous page descends from above onto
    // the held old one.
    cover("left", true, 0, oldScroll, "verso");
    flap("left", "top", true, 0, newScroll, "verso", 0.5, 1, (p) => -180 * (1 - p));
  }

  host.appendChild(overlay);
  for (const settleFace of settles) {
    settleFace();
  }

  // The destination is live under the overlay from the first frame.
  commit();

  let progress = 0;
  function set(value: number): void {
    progress = Math.max(0, Math.min(1, value));
    for (const piece of flaps) {
      const on = flapVisible(piece.lower, piece.upper, progress);
      piece.el.style.visibility = on ? "visible" : "hidden";
      if (on) {
        piece.el.style.transform = `rotate${spread ? "Y" : "X"}(${piece.angle(progress).toFixed(2)}deg)`;
        // The shade travels with the fold: deepest at the vertical.
        piece.shade.style.opacity = (foldDepth(piece.lower, progress) * SHADE).toFixed(3);
      }
    }
  }
  set(0);

  function progressFrom(x: number, y: number): number {
    return dragProgress(geometry, x, y);
  }

  let finished = false;
  function cleanup(complete: boolean): void {
    if (finished) {
      return;
    }
    finished = true;
    if (!complete) {
      revert();
    }
    overlay.remove();
  }

  function settle(complete: boolean): Promise<boolean> {
    const target = complete ? 1 : 0;
    const start = progress;
    const span = Math.abs(target - start);
    if (span === 0) {
      cleanup(complete);
      return Promise.resolve(complete);
    }
    const duration = Math.max(MIN_MS, FULL_MS * span);
    const startAt = performance.now();
    return new Promise((resolve) => {
      const tick = (now: number) => {
        if (finished) {
          resolve(complete);
          return;
        }
        const t = Math.min(1, (now - startAt) / duration);
        const eased = easeOutCubic(t);
        set(start + (target - start) * eased);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          cleanup(complete);
          resolve(complete);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  return { set, progressFrom, settle };
}
