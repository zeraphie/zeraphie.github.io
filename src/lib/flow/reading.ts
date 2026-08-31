/* ─ reading — the dived journal ─
 *
 * Once the camera lands in a cell, the world fades beneath this
 * layer and the JOURNAL opens: the full-viewport book, its metadata
 * panel filled from the post index, the post's flow cloned into the
 * column strip, and the shared reader driving pagination. Reading
 * is turning — a heading resolves to the page that contains it,
 * never to a scroll position. */

import type { HpGrid } from "@hexpunk/core/grid";

import { collectionLabel, type Item } from "../flow-data";
import { iconFor } from "../icons";
import { createJournalReader, type JournalReader } from "../journal-reader";
import { contentFor } from "./content-cache";
import { postMeta } from "./posts";

export interface ReadingHost {
  page: HTMLElement;
  world: HpGrid;
  bg: HTMLElement;
  perfLow: boolean;
  /** Late reflows re-land anchors only while `head` is still the
   * route's target. */
  isCurrentHead(head: string): boolean;
  /** Indices of the headings currently on screen — a spread shows
   * several at once, so the rail can mark them all. Indices, not
   * labels: a post may repeat a heading. */
  onAnchorsVisible?(indexes: number[]): void;
}

/** A journal page that is not a post — generated content read in
 * the same vessel (the sitemap today). */
export interface JournalDoc {
  id: string;
  title: string;
  description: string;
  icon: string;
  html: string;
}

export interface ReadingLayer {
  open(item: Item, head: string | undefined, instant: boolean): void;
  openDoc(doc: JournalDoc): void;
  slideTo(item: Item, head: string | undefined, dir: number): void;
  close(): void;
  scrollTo(head: string, smooth: boolean): void;
}

export function createReadingLayer(host: ReadingHost): ReadingLayer {
  const { page, world, bg } = host;
  const root = page.querySelector<HTMLElement>(".journal")!;
  const strip = page.querySelector<HTMLElement>("#journal-pages")!;
  const prose = page.querySelector<HTMLElement>(".journal-prose")!;
  const crumb = page.querySelector<HTMLElement>(".journal-crumb")!;
  const glyph = page.querySelector<SVGGElement>(".journal-meta-glyph")!;
  const metaTitle = page.querySelector<HTMLElement>(".journal-meta-title")!;
  const metaSub = page.querySelector<HTMLElement>(".journal-meta-sub")!;
  const stat = (name: string) => page.querySelector<HTMLElement>(`[data-stat="${name}"]`)!;
  const stats = {
    date: stat("date"),
    time: stat("time"),
    words: stat("words"),
    collection: stat("collection"),
  };

  let pageTimer = 0;
  let worldHideTimer = 0;
  let reader: JournalReader | null = null;
  /** Resolves when the strip holds the post's body — page-landings
   * wait on it; cached content resolves in a microtask, so the wait
   * is invisible when prefetch did its job. */
  let currentFilled: Promise<void> = Promise.resolve();

  /** A stat with nothing to say leaves — its label goes with it. */
  function setStat(dd: HTMLElement, value: string | undefined): void {
    const dt = dd.previousElementSibling as HTMLElement | null;
    dd.textContent = value ?? "";
    dd.hidden = value === undefined;
    if (dt) {
      dt.hidden = value === undefined;
    }
  }

  function sep(): HTMLElement {
    const el = document.createElement("span");
    el.className = "sep";
    el.textContent = ">";
    return el;
  }

  /** Paint the metadata panel and the crumb. `collection` empty
   * means a standalone document — the crumb is just its name. */
  function paintMeta(fields: {
    collection: string;
    id: string;
    title: string;
    sub: string;
    icon?: string;
    date?: string;
    words?: number;
  }): void {
    const { collection } = fields;
    root.dataset.collection = collection;
    // Breadcrumbs are real links: the collection is a world state,
    // slugs read as words.
    crumb.replaceChildren();
    if (collection) {
      const cat = document.createElement("a");
      cat.href = `/${collection}`;
      cat.textContent = collectionLabel(collection);
      crumb.append(sep(), cat);
    }
    const here = document.createElement("span");
    here.className = "here";
    here.textContent = fields.id.replaceAll("-", " ");
    crumb.append(sep(), here);
    metaTitle.textContent = fields.title;
    metaSub.textContent = fields.sub;
    glyph.innerHTML = iconFor(collection, fields.icon);
    setStat(stats.date, fields.date?.replaceAll("-", "."));
    setStat(
      stats.time,
      fields.words === undefined
        ? undefined
        : `~ ${Math.max(1, Math.round(fields.words / 220))} min`
    );
    setStat(
      stats.words,
      fields.words === undefined
        ? undefined
        : fields.words >= 1000
          ? `~ ${(fields.words / 1000).toFixed(1)}k`
          : String(fields.words)
    );
    setStat(stats.collection, collection ? collectionLabel(collection) : undefined);
    // With every stat gone, the rule above them has nothing to
    // divide.
    const rule = page.querySelector<HTMLElement>(".journal-meta hr");
    if (rule) {
      rule.hidden = Object.values(stats).every((dd) => dd.hidden);
    }
  }

  /** Fill the vessel for an item: metadata instantly from the
   * index, the flow cloned in when the content cache delivers. */
  function fillVessel(item: Item): Promise<void> {
    const key = item.post;
    const collection = key?.split("/")[0] ?? "";
    const info = postMeta(key);
    paintMeta({
      collection,
      id: item.id,
      title: info?.title ?? item.label,
      sub: info?.description ?? item.sub,
      icon: info?.icon ?? undefined,
      date: info?.date,
      words: info?.words,
    });
    prose.replaceChildren();
    if (!key) {
      prose.innerHTML = `<p><em>${item.sub}</em> — ${item.lead ?? ""}</p>`;
      return Promise.resolve();
    }
    return contentFor(key)
      .then((template) => {
        prose.appendChild(template.content.cloneNode(true));
        // Devlog entries wear the date git found for them. The h2s
        // are in document order, which is the order the index lists
        // its anchors in — the same join the visible-anchor walk
        // makes. An entry with no commit yet gets no attribute, and
        // its slip shows only the entry number.
        const anchors = info?.anchors ?? [];
        prose.querySelectorAll<HTMLElement>("h2[id]").forEach((heading, index) => {
          const date = anchors[index]?.date;
          if (date) {
            heading.dataset.date = date;
          }
        });
      })
      .catch(() => {
        prose.insertAdjacentHTML(
          "beforeend",
          `<p><em>the archive is unreachable — <a href="/${key}">read it directly</a></a></em></p>`
        );
      });
  }

  /** Turn to the page holding a heading (page one without one). */
  function landOn(head: string | undefined): void {
    if (!reader) {
      return;
    }
    reader.refresh();
    const target = head ? strip.querySelector(`#${CSS.escape(head)}`) : null;
    reader.goTo(target ? reader.pageOf(target) : 0);
  }

  /** Post-open bookkeeping shared by every path: retire the world,
   * watchdog the backdrop fade, land on the routed heading. */
  function settleOpen(head: string | undefined, instant: boolean): void {
    window.clearTimeout(worldHideTimer);
    worldHideTimer = window.setTimeout(
      () => {
        world.style.visibility = "hidden";
      },
      instant ? 0 : 340
    );
    window.setTimeout(() => {
      if (page.hasAttribute("data-open") && Number(getComputedStyle(page).opacity) < 1) {
        console.warn("[flow] page fade stranded — forcing completion");
        page.style.opacity = "1";
      }
    }, 700);
    const filled = currentFilled;
    void filled.then(() => {
      landOn(head);
      // Late webfonts reflow the columns and shift page breaks —
      // re-land once faces settle.
      void document.fonts.ready.then(() => {
        if (page.hasAttribute("data-open") && (!head || host.isCurrentHead(head))) {
          landOn(head);
        }
      });
    });
  }

  /** A spread can show several headings at once; report every one
   * whose page is on screen. */
  function syncVisibleAnchors(): void {
    if (!reader || !host.onAnchorsVisible) {
      return;
    }
    const mounted = reader;
    const { from, to } = mounted.visibleRange();
    // The strip's h2s are in document order, so their position here
    // is their position in the rail's sub list.
    const indexes: number[] = [];
    [...strip.querySelectorAll<HTMLElement>("h2[id]")].forEach((heading, index) => {
      const at = mounted.pageOf(heading);
      if (at >= from && at < to) {
        indexes.push(index);
      }
    });
    host.onAnchorsVisible(indexes);
  }

  function mountReader(): void {
    reader ??= createJournalReader({
      strip,
      body: page.querySelector<HTMLElement>(".journal-body")!,
      label: page.querySelector<HTMLElement>("#journal-pager-label")!,
      prev: page.querySelector<HTMLButtonElement>("#journal-turn-prev")!,
      next: page.querySelector<HTMLButtonElement>("#journal-turn-next")!,
      // The leaf animation is parked (see-through on real hardware)
      // — instant turns, no drag grips, until it gets its own pass.
      zones: [],
      animate: false,
      onChange: syncVisibleAnchors,
    });
  }

  /** Open a generated document — same vessel, no content fetch. */
  function openDoc(doc: JournalDoc): void {
    window.clearTimeout(pageTimer);
    paintMeta({
      collection: "",
      id: doc.id,
      title: doc.title,
      sub: doc.description,
      icon: doc.icon,
    });
    prose.replaceChildren();
    prose.innerHTML = doc.html;
    currentFilled = Promise.resolve();
    document.body.dataset.journalOpen = "";
    mountReader();
    page.dataset.open = "";
    settleOpen(undefined, true);
  }

  function openPage(item: Item, head: string | undefined, instant: boolean): void {
    window.clearTimeout(pageTimer);
    currentFilled = fillVessel(item);
    document.body.dataset.journalOpen = "";
    mountReader();
    const show = () => {
      page.dataset.open = "";
      settleOpen(head, instant);
    };
    if (instant) {
      show();
    } else {
      // Start the fade while the camera is still flying — no still
      // frame of the world's frozen hover ever shows.
      pageTimer = window.setTimeout(show, 240);
    }
  }

  /** Sibling navigation: the vessel stays, the post inside it
   * swaps. The slide animation retired with the card layer — a
   * sibling is a different book, opened at its first page. */
  function slideToPage(item: Item, head: string | undefined, _dir: number): void {
    currentFilled = fillVessel(item);
    settleOpen(head, true);
  }

  function closePage(): void {
    window.clearTimeout(pageTimer);
    window.clearTimeout(worldHideTimer);
    delete page.dataset.open;
    delete document.body.dataset.journalOpen;
    page.style.opacity = "";
    world.style.visibility = "";
    world.style.pointerEvents = "";
    bg.style.display = "";
    reader?.destroy();
    reader = null;
    window.setTimeout(() => {
      if (!page.hasAttribute("data-open")) {
        prose.replaceChildren();
      }
    }, 320);
  }

  function scrollTo(head: string, _smooth: boolean): void {
    landOn(head);
  }

  return { open: openPage, openDoc, slideTo: slideToPage, close: closePage, scrollTo };
}
