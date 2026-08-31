/**
 * ─ reading — the dived journal ─
 *
 * When the camera lands in a cell, the world fades under this
 * layer and the journal opens: the metadata panel filled from the
 * post index, the post's flow cloned into the column strip, the
 * shared reader driving pagination. Reading is turning — a heading
 * resolves to the page that contains it, never to a scroll
 * position.
 */

import type { HpGrid } from "@hexpunk/core/grid";

import { collectionLabel, type Item } from "../flow-data";
import { iconFor } from "../icons";
import { logoFor } from "../logos";
import { createJournalReader, type JournalReader } from "../journal/reader";
import { contentFor } from "./content-cache";
import { postMeta } from "./posts";

/** Displayed dates read YYYY/MM/DD. The ISO form travels (post
 * index, `article:published_time`, JSON-LD) and is left alone. */
function journalDate(iso: string | undefined): string | undefined {
  return iso?.replaceAll("-", "/");
}

/** The devlog plate — the date git found for an entry, over the
 * entry's number. Two type sizes need two boxes, and a `content`
 * string carries only one: pinning these to ::before/::after left
 * the paper sharing a layer with its own text, where `filter`
 * rasterises and the slip's rotation resamples, so the type came
 * out soft.
 *
 * Built here rather than in the markdown because Astro reads a
 * heading's text AFTER remark runs — anything injected there ends
 * up in the rail's labels and in the slug. Appended, not
 * prepended, so the title reads first aloud and the number falls
 * in behind as a suffix at the narrow tier. */
function logPlate(entry: number, date: string | undefined): HTMLElement {
  const plate = document.createElement("span");
  plate.className = "journal-log-plate";
  // An entry with no commit behind it has no date: nothing is
  // rendered, not a placeholder.
  if (date) {
    const stamp = document.createElement("span");
    stamp.className = "journal-log-plate__date";
    stamp.textContent = date;
    plate.append(stamp);
  }
  const number = document.createElement("span");
  number.className = "journal-log-plate__entry";
  number.textContent = `DEVLOG ${String(entry).padStart(2, "0")}`;
  plate.append(number);
  return plate;
}

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
  };

  let pageTimer = 0;
  let worldHideTimer = 0;
  let reader: JournalReader | null = null;
  /** Resolves when the strip holds the post's body — page-landings
   * wait on it; cached content resolves in a microtask, so the wait
   * is invisible when prefetch did its job. */
  let currentFilled: Promise<void> = Promise.resolve();

  /** An empty stat is hidden, label included. */
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
    logo?: string | null;
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
    // A project's own mark wins over the icon: it names the thing,
    // not the kind. The glyph host re-centres for the bigger
    // drawing.
    const mark = logoFor(fields.logo);
    glyph.innerHTML = mark ?? iconFor(collection, fields.icon);
    glyph.parentElement?.toggleAttribute("data-logo", mark !== undefined);
    setStat(stats.date, journalDate(fields.date));
    // Word count only feeds the reading time — the minutes are what
    // a reader acts on. Collection is the crumb's job, above.
    setStat(
      stats.time,
      fields.words === undefined
        ? undefined
        : `~ ${Math.max(1, Math.round(fields.words / 220))} min`
    );
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
      logo: info?.logo,
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
        // Devlog entries get the date git found for them. The h2s
        // are in document order — the same order the index lists
        // anchors in and the same index devlogDates keys by (every
        // h2 counts, not just logs). The entry NUMBER counts only
        // logs, like the css counter it replaced.
        const anchors = info?.anchors ?? [];
        let logs = 0;
        prose.querySelectorAll<HTMLElement>("h2[id]").forEach((heading, index) => {
          if (heading.dataset.heading !== "log") {
            return;
          }
          logs += 1;
          heading.append(logPlate(logs, journalDate(anchors[index]?.date ?? undefined)));
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
