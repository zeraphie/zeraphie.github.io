import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const posts = (base: string) =>
  defineCollection({
    loader: glob({ pattern: "**/*.md", base }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      icon: z.string().optional(),
      draft: z.boolean().default(false),
    }),
  });

export const collections = {
  dnd: posts("./src/content/dnd"),
  projects: posts("./src/content/projects"),
  arcade: posts("./src/content/arcade"),
  lyrics: posts("./src/content/lyrics"),
  guides: posts("./src/content/guides"),
  about: posts("./src/content/about"),
};
