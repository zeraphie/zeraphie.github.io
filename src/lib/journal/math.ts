/* ─ journal-math — the journal's pure arithmetic ─
 *
 * Lifted out of the reader's and the turn's DOM closures so it can
 * run without a browser: column geometry, the spread-aligned
 * clamp, pager text, input mappings, and the drag physics. The
 * reader and the turn own the DOM; this file owns the numbers. */

/** The strip's numbers, as read from computed style and layout. */
export interface ColumnBox {
  columnCount: number;
  columnGap: number;
  paddingLeft: number;
  paddingRight: number;
  clientWidth: number;
  scrollWidth: number;
}

export interface ColumnMetrics {
  /** Pages per spread. */
  perView: number;
  /** One column plus its gap — the stride between pages. */
  unit: number;
  /** Total pages. */
  count: number;
  padLeft: number;
}

/** Column geometry → page geometry. NaN inputs (a `columnCount` of
 * "auto", an unset pad) fall back to one column and zero length. */
export function measureColumns(box: ColumnBox): ColumnMetrics {
  const perView = Math.max(1, box.columnCount || 1);
  const gap = box.columnGap || 0;
  const padLeft = box.paddingLeft || 0;
  const padX = padLeft + (box.paddingRight || 0);
  const column = (box.clientWidth - padX - gap * (perView - 1)) / perView;
  const unit = column + gap;
  const count = Math.max(1, Math.round((box.scrollWidth - padX + gap) / unit));
  return { perView, unit, count, padLeft };
}

/** Clamp a lead page into range, aligned to the spread. */
export function clampLead(value: number, count: number, perView: number): number {
  const clamped = Math.max(0, Math.min(value, count - 1));
  return clamped - (clamped % perView);
}

/** The page after the last visible one, capped at the end. */
export function visibleTo(lead: number, count: number, perView: number): number {
  return Math.min(count, lead + perView);
}

/** Pager text: a range on a spread, a single page otherwise. */
export function pageLabel(lead: number, count: number, perView: number): string {
  const last = visibleTo(lead, count, perView);
  return last > lead + 1 ? `page ${lead + 1}–${last} of ${count}` : `page ${lead + 1} of ${count}`;
}

/** Page index at a strip-content x offset. The one-pixel nudge
 * counts an element sitting exactly on a column boundary as the
 * page it opens. */
export function pageAt(x: number, unit: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.floor((x + 1) / unit)));
}

/** A corner grip's turn direction: right or left of the spine on a
 * spread, bottom or top of the page in notepad mode. */
export function dirForCorner(corner: string, perView: number): 1 | -1 {
  return perView > 1 ? (corner.endsWith("r") ? 1 : -1) : corner.startsWith("b") ? 1 : -1;
}

export type KeyIntent = "forward" | "back" | "home" | "end";

/** Reading keys → intent; null for keys the journal ignores. */
export function keyIntent(key: string, shift: boolean): KeyIntent | null {
  if (key === "Home") {
    return "home";
  }
  if (key === "End") {
    return "end";
  }
  if (key === "ArrowRight" || key === "PageDown" || (key === " " && !shift)) {
    return "forward";
  }
  if (key === "ArrowLeft" || key === "PageUp" || (key === " " && shift)) {
    return "back";
  }
  return null;
}

/** One turn's fixed geometry, as the drag physics needs it. */
export interface TurnGeometry {
  spread: boolean;
  dir: 1 | -1;
  left: number;
  top: number;
  width: number;
  height: number;
}

const deg = (cosine: number) => (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;

/** The pointer rides the leaf's free edge, so progress is the arc
 * angle recovered from its position — around the spine on a
 * spread, over the top edge in notepad mode. The cosine clamp
 * keeps a pointer past the physical edge on the arc. */
export function dragProgress(geometry: TurnGeometry, x: number, y: number): number {
  const sign = geometry.dir > 0 ? 1 : -1;
  if (geometry.spread) {
    const half = geometry.width / 2;
    const spineX = geometry.left + half;
    return deg(((x - spineX) / half) * sign) / 180;
  }
  return deg(((y - geometry.top) / geometry.height) * sign) / 180;
}

/** Whether a one-sided flap owns this stretch of the arc. */
export function flapVisible(lower: number, upper: number, progress: number): boolean {
  return progress >= lower && progress <= upper;
}

/** The fold's shade depth, deepest at the vertical. */
export function foldDepth(lower: number, progress: number): number {
  const depth = lower === 0 ? progress * 2 : (1 - progress) * 2;
  return Math.min(1, depth);
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
