// ─ content-cache — posts arrive before they're wanted ─
//
// Slim pages inline only their own post; every other post's content
// is fetched from its real page and kept as a template to clone.
// Prefetching on bloom warms the whole world's reading matter before
// any dive can want it — the no-sidebar version of the showcase's
// revealed-links strategy.

const cache = new Map<string, Promise<HTMLTemplateElement>>();

/** The post's content as a template to clone from — local when this
 * page inlined it, fetched from the post's own page otherwise. */
export function contentFor(post: string): Promise<HTMLTemplateElement> {
  let pending = cache.get(post);
  if (!pending) {
    const local = document.querySelector<HTMLTemplateElement>(`template[data-post="${post}"]`);
    pending = local
      ? Promise.resolve(local)
      : fetch(`/${post}/`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`${response.status} for /${post}/`);
            }
            return response.text();
          })
          .then((html) => {
            const doc = new DOMParser().parseFromString(html, "text/html");
            const template = doc.querySelector<HTMLTemplateElement>(
              `template[data-post="${post}"]`
            );
            if (!template) {
              throw new Error(`no content in /${post}/`);
            }
            return template;
          });
    cache.set(post, pending);
    // A failed fetch must not poison the cache — retry on next ask.
    pending.then(undefined, () => cache.delete(post));
  }
  return pending;
}

/** Fire-and-forget warm of many posts; cached calls are free. */
export function prefetchPosts(posts: (string | undefined)[]): void {
  for (const post of posts) {
    if (post) {
      contentFor(post).catch(() => {});
    }
  }
}
