/* ─ logos — project marks ─
 *
 * A logo is not an icon. The icon set is Lucide's vocabulary, one
 * glyph per idea, swappable behind hexpunk's mirror when it lands.
 * A mark stands for one project and nothing else, so it resolves on
 * its own key and never falls into the collection default.
 *
 * The marks are real files beside this module, imported rather than
 * pasted so the artwork in the repo is editable in anything that
 * opens an SVG. `hexpunk.svg` is vendored from the design system's
 * `assets/logo-mark.svg`, the way `public/fonts/` holds its faces —
 * regenerate from hexpunk when the mark changes. (`@hexpunk/core`
 * ships `assets/` but has no `./assets/*` in its exports map, so a
 * bare-specifier import of the file itself does not resolve.)
 *
 * Each file is normalised for the journal's glyph slot, which the
 * standalone artwork is not authored for. Two things are always
 * true: the accessible title goes (the host `<svg>` is already
 * `aria-hidden`), and width/height are declared, because the slot
 * injects into a `<g>` where an unsized nested `<svg>` would fill
 * the whole 60x70 frame.
 *
 * Colour is the mark's own business. Hexpunk's is a wireframe, so
 * its stroke becomes `currentColor` and the mark takes the slip's
 * ink like any glyph; its 128 box at stroke 8 lands on the same
 * 1.5px the Lucide set draws at 24. Snecko's is pixel art whose
 * palette IS the design — flattening it would swallow the eye and
 * merge the tongue into the head — so it keeps its five colours and
 * `shape-rendering: crispEdges` so the 9x9 grid stays square at
 * fractional scale. */

import hexpunk from "./hexpunk.svg?raw";
import snecko from "./snecko.svg?raw";

export const LOGOS: Record<string, string> = { hexpunk, snecko };

/** A post's mark, if it declared one that exists. Unknown names fall
 * through to the icon so a typo degrades to a glyph, not a blank. */
export function logoFor(logo?: string | null): string | undefined {
  return logo ? LOGOS[logo] : undefined;
}
