/* ─ journal-reader — the vessel's reading controller ─
 *
 * Owns pagination and turning for one mounted journal: measures the
 * column geometry, keeps the pager honest, and drives the two-leaf
 * turn from every input — pager buttons, wheel, keys, and corner
 * drags that scrub the leaf and settle past halfway. destroy()
 * detaches the window listeners so the dive can unmount cleanly. */

import {
  clampLead,
  dirForCorner,
  keyIntent,
  measureColumns,
  pageAt,
  pageLabel,
  visibleTo,
} from "./math";
import { beginTurn, type TurnController } from "./turn";

export interface JournalReaderHost {
  /** The multicol strip holding the post's flow. */
  strip: HTMLElement;
  /** The journal body — paper, spine, strip, turn overlays. */
  body: HTMLElement;
  label: HTMLElement;
  prev: HTMLButtonElement;
  next: HTMLButtonElement;
  /** Corner drag grips. */
  zones: HTMLElement[];
  /** False turns instantly (reduced motion, PERF_LOW). */
  animate: boolean;
  /** Debug: freeze a timed turn at this progress (?hold=). */
  hold?: number;
  /** Fires whenever the visible pages change — turns, resizes,
   * repagination. */
  onChange?(): void;
}

export interface JournalReader {
  /** Re-derive geometry (resize, fonts, content swap). */
  refresh(): void;
  /** The pages on screen right now, as a half-open range. */
  visibleRange(): { from: number; to: number };
  /** Turn to the spread containing a page index. */
  goTo(page: number): void;
  /** The page index an element inside the strip lives on. */
  pageOf(target: Element): number;
  destroy(): void;
}

export function createJournalReader(host: JournalReaderHost): JournalReader {
  const { strip, body, label, prev, next, zones, animate } = host;
  const hold = host.hold ?? 0;

  let perView = 2;
  let unit = 0;
  let count = 1;
  let lead = 0;
  let padLeft = 0;
  let busy = false;
  let held: TurnController | null = null;

  function measure(): void {
    const style = getComputedStyle(strip);
    const metrics = measureColumns({
      columnCount: Number(style.columnCount),
      columnGap: Number.parseFloat(style.columnGap),
      paddingLeft: Number.parseFloat(style.paddingLeft),
      paddingRight: Number.parseFloat(style.paddingRight),
      clientWidth: strip.clientWidth,
      scrollWidth: strip.scrollWidth,
    });
    perView = metrics.perView;
    unit = metrics.unit;
    count = metrics.count;
    padLeft = metrics.padLeft;
  }

  function apply(): void {
    lead = clampLead(lead, count, perView);
    strip.scrollTo({ left: lead * unit, top: 0, behavior: "instant" });
    label.textContent = pageLabel(lead, count, perView);
    prev.disabled = lead === 0;
    next.disabled = visibleTo(lead, count, perView) >= count;
    host.onChange?.();
  }

  function startTurn(target: number, dir: 1 | -1): TurnController | null {
    const next_ = clampLead(target, count, perView);
    if (next_ === lead || busy) {
      return null;
    }
    const from = lead;
    lead = next_;
    if (!animate) {
      apply();
      return null;
    }
    busy = true;
    return beginTurn({
      strip,
      host: body,
      dir,
      oldScroll: from * unit,
      newScroll: next_ * unit,
      perView,
      commit: () => apply(),
      revert: () => {
        lead = from;
        apply();
      },
    });
  }

  function go(target: number, dir: 1 | -1): void {
    if (held) {
      const holding = held;
      held = null;
      holding.settle(true).finally(() => {
        busy = false;
      });
      return;
    }
    const controller = startTurn(target, dir);
    if (!controller) {
      return;
    }
    if (hold > 0) {
      controller.set(hold);
      held = controller;
      return;
    }
    controller.settle(true).finally(() => {
      busy = false;
    });
  }

  const turn = (dir: 1 | -1) => go(lead + dir * perView, dir);
  const onPrev = () => turn(-1);
  const onNext = () => turn(1);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);

  // Corner drags scrub the turn; releasing past the halfway line
  // completes it, short of it the leaf settles back.
  const zoneDowns = new Map<HTMLElement, (event: PointerEvent) => void>();
  for (const zone of zones) {
    const down = (event: PointerEvent) => {
      const dir = dirForCorner(zone.dataset.corner ?? "", perView);
      const controller = startTurn(lead + dir * perView, dir);
      if (!controller) {
        return;
      }
      event.preventDefault();
      zone.setPointerCapture(event.pointerId);
      let last = controller.progressFrom(event.clientX, event.clientY);
      controller.set(last);
      const move = (moved: PointerEvent) => {
        last = controller.progressFrom(moved.clientX, moved.clientY);
        controller.set(last);
      };
      const finish = () => {
        zone.removeEventListener("pointermove", move);
        zone.removeEventListener("pointerup", finish);
        zone.removeEventListener("pointercancel", finish);
        controller.settle(last > 0.5).finally(() => {
          busy = false;
        });
      };
      zone.addEventListener("pointermove", move);
      zone.addEventListener("pointerup", finish);
      zone.addEventListener("pointercancel", finish);
    };
    zoneDowns.set(zone, down);
    zone.addEventListener("pointerdown", down);
  }

  // One wheel notch is one turn — the cooldown covers the leaf and
  // soaks inertial deltas so a flick doesn't skip spreads.
  let wheelAt = 0;
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const now = performance.now();
    if (now - wheelAt < 430 || Math.abs(event.deltaY) < 4) {
      return;
    }
    wheelAt = now;
    turn(event.deltaY > 0 ? 1 : -1);
  };
  const onKeydown = (event: KeyboardEvent) => {
    const intent = keyIntent(event.key, event.shiftKey);
    if (intent === "home") {
      go(0, -1);
    } else if (intent === "end") {
      go(count, 1);
    } else if (intent === "forward") {
      turn(1);
    } else if (intent === "back") {
      turn(-1);
    } else {
      return;
    }
    event.preventDefault();
  };
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeydown);

  const refresh = (): void => {
    measure();
    apply();
  };
  const observer = new ResizeObserver(refresh);
  observer.observe(strip);
  window.addEventListener("resize", refresh);
  document.fonts.ready.then(refresh);
  refresh();

  return {
    refresh,
    visibleRange: () => ({ from: lead, to: visibleTo(lead, count, perView) }),
    goTo(page: number): void {
      const target = clampLead(page, count, perView);
      go(target, target >= lead ? 1 : -1);
    },
    pageOf(target: Element): number {
      // Column offsets are strip-content coordinates: recover the
      // page index from the element's distance into the flow.
      const stripRect = strip.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const x = rect.left - stripRect.left - padLeft + strip.scrollLeft;
      return pageAt(x, unit, count);
    },
    destroy(): void {
      prev.removeEventListener("click", onPrev);
      next.removeEventListener("click", onNext);
      for (const [zone, down] of zoneDowns) {
        zone.removeEventListener("pointerdown", down);
      }
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", refresh);
      observer.disconnect();
    },
  };
}
