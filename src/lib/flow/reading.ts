// ─ reading — the dived page layer ─
//
// Once the camera lands in a cell, the world fades beneath this
// layer and reading happens at real pixel scale. Each dived item is
// a CARD cloned from its server-rendered template (or a stand-in for
// items without a post); sibling navigation slides whole cards
// horizontally — transform-only, the camera never moves.

import type { HpGrid } from "@hexpunk/core/grid";

import type { Item } from "../flow-data";
import { contentFor } from "./content-cache";
import { anchorsOf, postMeta } from "./posts";

export interface ReadingHost {
  page: HTMLElement;
  world: HpGrid;
  bg: HTMLElement;
  perfLow: boolean;
  /** Late reflows re-land anchors only while `head` is still the
   * route's target. */
  isCurrentHead(head: string): boolean;
}

export interface ReadingLayer {
  open(item: Item, head: string | undefined, instant: boolean): void;
  slideTo(item: Item, head: string | undefined, dir: number): void;
  close(): void;
  scrollTo(head: string, smooth: boolean): void;
}

export function createReadingLayer(host: ReadingHost): ReadingLayer {
  const { page, world, bg } = host;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pageTimer = 0;
  let worldHideTimer = 0;
  let currentCard: HTMLElement | null = null;
  let currentMain: HTMLElement | null = null;
  /** Resolves when the adopted card's body content is in the DOM —
   * anchor landings wait on it; cached content resolves in a
   * microtask, so the wait is invisible when prefetch did its job. */
  let currentFilled: Promise<void> = Promise.resolve();

  /** Stand-in body for items that have no post yet (arcade
   * carts, external links) — sections mirror the declared subs
   * so their anchors still work. */
  function standInHtml(item: Item): string {
    const sections = anchorsOf(item)
      .map(
        ({ head, label }) => `
    <h2 id="${head}">${label}</h2>
    <p>${item.lead ?? ""} This section stands in for the real ${label} content — a standard page in the hex's middle band, set in the system's own prose rhythm.</p>`
      )
      .join("");
    return `<h1>${item.label}</h1><p><em>${item.sub}</em> — ${item.lead ?? ""}</p>${sections}`;
  }

  function buildCard(item: Item): { card: HTMLElement; filled: Promise<void> } {
    const card = document.createElement("div");
    card.className = "page-card";
    const meta = item.post ? `/${item.post}` : (item.url ?? "");
    card.innerHTML = `<div class="page-hex"><div class="page-hex-in"></div></div>
      <div class="page-meta">izelya.me ${meta}</div>
      <main class="hp-prose page-main"></main>
      <div class="page-foot">esc surfaces · the track waits at the right edge</div>`;
    const main = card.querySelector<HTMLElement>(".page-main")!;
    const info = postMeta(item.post);
    if (item.post && info) {
      // Header paints immediately from the index; the body clones in
      // when the content cache delivers (instantly when prefetched).
      main.innerHTML = `<h1>${info.title}</h1><p><em>${item.sub}</em> — ${info.description}</p>`;
      const filled = contentFor(item.post)
        .then((template) => {
          main.appendChild(template.content.cloneNode(true));
        })
        .catch(() => {
          main.insertAdjacentHTML(
            "beforeend",
            `<p><em>the archive is unreachable — <a href="/${item.post}">read it directly</a></em></p>`
          );
        });
      return { card, filled };
    }
    main.innerHTML = standInHtml(item);
    return { card, filled: Promise.resolve() };
  }

  function adoptCard(card: HTMLElement, filled: Promise<void>): void {
    currentCard = card;
    currentMain = card.querySelector<HTMLElement>(".page-main");
    currentFilled = filled;
  }

  /** Post-open bookkeeping shared by the fade-in and slide paths:
   * retire the world, watchdog the backdrop fade, land anchors. */
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
    if (head) {
      void filled.then(() => {
        scrollMain(head, !instant);
        // Late webfonts reflow the prose and shift anchors —
        // re-land on the heading once faces settle.
        void document.fonts.ready.then(() => {
          if (page.hasAttribute("data-open") && host.isCurrentHead(head)) {
            scrollMain(head, false);
          }
        });
      });
    } else {
      void filled.then(() => {
        if (currentMain) {
          currentMain.scrollTop = 0;
        }
      });
    }
  }

  function openPage(item: Item, head: string | undefined, instant: boolean): void {
    window.clearTimeout(pageTimer);
    const { card, filled } = buildCard(item);
    page.replaceChildren(card);
    adoptCard(card, filled);
    const show = () => {
      page.dataset.open = "";
      settleOpen(head, instant);
    };
    if (instant) {
      show();
    } else {
      // Start the fade while the camera is still flying — no
      // still frame of the world's frozen hover ever shows.
      pageTimer = window.setTimeout(show, 240);
    }
  }

  /** Sibling navigation: whole cards slide horizontally, the
   * direction taken from track order — a target ABOVE the
   * current item enters from the left, BELOW from the right.
   * Transform-only, synchronous start→reflow→end so the
   * transition arms without an animation frame; the camera and
   * the hidden world are never involved. */
  function slideToPage(item: Item, head: string | undefined, dir: number): void {
    const oldCard = currentCard;
    const { card: next, filled } = buildCard(item);
    const skip = host.perfLow || REDUCED;
    if (!skip) {
      next.style.transform = `translateX(${dir * 100}vw)`;
    }
    page.appendChild(next);
    adoptCard(next, filled);
    if (skip) {
      oldCard?.remove();
    } else {
      next.getBoundingClientRect();
      next.style.transform = "translateX(0)";
      if (oldCard) {
        oldCard.style.transform = `translateX(${-dir * 100}vw)`;
        oldCard.style.opacity = "0.35";
        window.setTimeout(() => oldCard.remove(), 520);
      }
    }
    settleOpen(head, true);
  }

  function closePage(): void {
    window.clearTimeout(pageTimer);
    window.clearTimeout(worldHideTimer);
    delete page.dataset.open;
    page.style.opacity = "";
    world.style.visibility = "";
    world.style.pointerEvents = "";
    bg.style.display = "";
    window.setTimeout(() => {
      if (!page.hasAttribute("data-open")) {
        page.replaceChildren();
        currentCard = null;
        currentMain = null;
      }
    }, 320);
  }

  function scrollMain(head: string, smooth: boolean): void {
    const target = currentMain?.querySelector<HTMLElement>(`#${CSS.escape(head)}`);
    if (currentMain && target) {
      currentMain.scrollTo({
        top: Math.max(0, target.offsetTop - 8),
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }

  return { open: openPage, slideTo: slideToPage, close: closePage, scrollTo: scrollMain };
}
