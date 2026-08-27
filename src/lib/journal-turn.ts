/* ─ journal-turn — the two-leaf page turn ─
 *
 * True book physics as a per-turn overlay: the strip is scrolled to
 * the destination immediately (content lands first) and the overlay
 * supplies yesterday's pixels — a static cover holding the old page
 * on its side, and a flap rotating a half-turn at its hinge, old
 * page on the front, new page (or blank paper, one-leaf mode) on
 * the back. Faces are clones of the strip windowed to one page, so
 * the leaf is paper with words. Progress-driven: timed turns tween
 * it, a corner drag scrubs it and settles past the halfway line. */

export interface TurnOptions {
  /** The real column strip (already holding the post's flow). */
  strip: HTMLElement;
  /** Overlay host — the journal body wrapping paper and strip. */
  host: HTMLElement;
  dir: 1 | -1;
  oldScroll: number;
  newScroll: number;
  /** Pages per spread: 2 hinges the half leaf at the spine, 1
   * turns the whole page vertically (notepad physics). */
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

function face(
  strip: HTMLElement,
  regionLeft: number,
  scroll: number | null,
  paper: "verso" | "recto",
  back = false
): { el: HTMLElement; settle(): void } {
  const el = document.createElement("div");
  el.className = `journal-leaf-face${back ? " journal-leaf-face--back" : ""}`;
  el.dataset.paper = paper;
  if (scroll === null) {
    return { el, settle() {} };
  }
  const clone = strip.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  for (const marked of clone.querySelectorAll("[id]")) {
    marked.removeAttribute("id");
  }
  clone.classList.add("journal-clone");
  clone.style.width = `${strip.clientWidth}px`;
  clone.style.left = `${-regionLeft}px`;
  el.appendChild(clone);
  return {
    el,
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

  const overlay = document.createElement("div");
  overlay.className = "journal-leaf";
  overlay.setAttribute("aria-hidden", "true");

  const flap = document.createElement("div");
  flap.className = "journal-leaf-flap";
  const faces: Array<{ el: HTMLElement; settle(): void }> = [];
  const add = (target: HTMLElement, made: { el: HTMLElement; settle(): void }) => {
    faces.push(made);
    target.appendChild(made.el);
  };
  const cover = (side: "left" | "right", full: boolean) => {
    const el = document.createElement("div");
    el.className = "journal-leaf-cover";
    el.dataset.side = side;
    if (full) {
      el.dataset.span = "full";
    }
    overlay.appendChild(el);
    return el;
  };

  // Rotation runs from 0 (leaf at rest on its origin side) to ±180
  // (landed); one-leaf turns hinge at the top and travel the same
  // arc vertically. Backward one-leaf turns start folded above.
  let axis: "X" | "Y";
  let from: number;
  let to: number;
  if (spread) {
    axis = "Y";
    flap.dataset.side = dir > 0 ? "right" : "left";
    flap.dataset.hinge = dir > 0 ? "left" : "right";
    from = 0;
    to = dir > 0 ? -180 : 180;
    if (dir > 0) {
      add(cover("left", false), face(strip, 0, oldScroll, "verso"));
      add(flap, face(strip, half, oldScroll, "recto"));
      add(flap, face(strip, 0, newScroll, "verso", true));
    } else {
      add(cover("right", false), face(strip, half, oldScroll, "recto"));
      add(flap, face(strip, 0, oldScroll, "verso"));
      add(flap, face(strip, half, newScroll, "recto", true));
    }
  } else {
    axis = "X";
    flap.dataset.side = "left";
    flap.dataset.span = "full";
    flap.dataset.hinge = "top";
    if (dir > 0) {
      from = 0;
      to = -180;
      add(flap, face(strip, 0, oldScroll, "verso"));
      add(flap, face(strip, 0, null, "verso", true));
    } else {
      from = -180;
      to = 0;
      add(cover("left", true), face(strip, 0, oldScroll, "verso"));
      add(flap, face(strip, 0, newScroll, "verso"));
      add(flap, face(strip, 0, null, "verso", true));
    }
  }
  overlay.appendChild(flap);
  host.appendChild(overlay);
  for (const made of faces) {
    made.settle();
  }

  // The destination is live under the overlay from the first frame.
  commit();

  const front = flap.children[0] as HTMLElement | undefined;
  const backFace = flap.children[1] as HTMLElement | undefined;
  let progress = 0;

  function set(value: number): void {
    progress = Math.max(0, Math.min(1, value));
    const angle = from + (to - from) * progress;
    flap.style.transform = `rotate${axis}(${angle.toFixed(2)}deg)`;
    // Fully flipped, the leaf lies flat on the far side of its hinge
    // — off the page, in the stack — so near the extreme it hides
    // rather than painting over the cover chrome.
    flap.style.opacity = Math.abs(angle) >= 177 ? "0" : "1";
    // The travelling shade: whichever face is lifting dims, the
    // landing face brightens.
    const lift = from === 0 ? progress : 1 - progress;
    if (front) {
      front.style.filter = `brightness(${(1 - lift * 0.45).toFixed(3)})`;
    }
    if (backFace) {
      backFace.style.filter = `brightness(${(0.55 + lift * 0.45).toFixed(3)})`;
    }
  }
  set(0);

  // Free-edge physics: the pointer rides the leaf's moving edge, so
  // progress is the arc angle recovered from its position.
  const deg = (cosine: number) => (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;
  function progressFrom(x: number, y: number): number {
    if (spread) {
      const spineX = rect.left + half;
      const cosine = ((x - spineX) / half) * (dir > 0 ? 1 : -1);
      return deg(cosine) / 180;
    }
    const height = rect.height;
    const cosine = ((y - rect.top) / height) * (dir > 0 ? 1 : -1);
    return deg(cosine) / 180;
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
        const eased = 1 - (1 - t) ** 3;
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
