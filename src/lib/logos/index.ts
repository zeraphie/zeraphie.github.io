/* ─ logos — project marks ─
 *
 * Marks are separate from icons: an icon is shared vocabulary
 * (Lucide), a mark stands for one project, resolves on its own
 * key, and never falls into the collection default.
 *
 * The marks are files beside this module, imported rather than
 * pasted so the artwork stays editable as SVG. `hexpunk.svg` is
 * vendored from the design system's `assets/logo-mark.svg` —
 * regenerate when it changes. (`@hexpunk/core` ships `assets/` but
 * its exports map has no `./assets/*`, so the file cannot be
 * imported by bare specifier.)
 *
 * Each file is normalised for the journal's glyph slot: the
 * accessible title is removed (the host `<svg>` is already
 * `aria-hidden`) and width/height are declared, because the slot
 * injects into a `<g>` where an unsized nested `<svg>` fills the
 * whole 60x70 frame.
 *
 * Colour stays per mark. Hexpunk's wireframe stroke becomes
 * `currentColor`; its 128 box at stroke 8 matches the 1.5px the
 * Lucide set draws at 24. Snecko's pixel art keeps its five
 * colours — flattening would merge the eye and tongue into the
 * head — plus `shape-rendering: crispEdges` so the 9x9 grid stays
 * square at fractional scale. */

import hexpunk from "./hexpunk.svg?raw";
import snecko from "./snecko.svg?raw";

export const LOGOS: Record<string, string> = { hexpunk, snecko };

/** A post's mark, if it declared one that exists. Unknown names fall
 * through to the icon so a typo degrades to a glyph, not a blank. */
export function logoFor(logo?: string | null): string | undefined {
  return logo ? LOGOS[logo] : undefined;
}
